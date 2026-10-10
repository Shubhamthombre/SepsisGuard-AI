import os
import joblib
import pandas as pd
import numpy as np
import glob
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    average_precision_score,
    f1_score
)

FEATURE_COLUMNS = ['HR', 'Temp', 'Resp', 'SBP', 'DBP', 'O2Sat', 'MAP', 'Creatinine', 'BUN', 'WBC', 'Lactate', 'Age']
TARGET_COLUMN = 'SepsisLabel'
ID_COLUMN = 'patient_id'
TIME_COLUMN = 'ICULOS'

def load_and_preprocess_temporal(data_dir):
    all_files = glob.glob(os.path.join(data_dir, "**", "*.psv"), recursive=True)[:500]
    data_list = []

    for file in all_files:
        patient_id = os.path.basename(file).replace(".psv", "")
        df = pd.read_csv(file, sep='|')
        df[ID_COLUMN] = patient_id
        if 'Age' not in df.columns:
            df['Age'] = 50
        data_list.append(df)

    if not data_list:
        raise ValueError(f"No .psv files found in {data_dir}")

    combined_df = pd.concat(data_list, ignore_index=True)
    combined_df = combined_df.sort_values(by=[ID_COLUMN, TIME_COLUMN])

    # Base features + ICULOS
    base_cols = FEATURE_COLUMNS + [TARGET_COLUMN, ID_COLUMN, TIME_COLUMN]
    df_model = combined_df[base_cols].copy()

    # Forward fill missing values per patient
    df_model[FEATURE_COLUMNS] = df_model.groupby(ID_COLUMN)[FEATURE_COLUMNS].ffill()
    df_model[FEATURE_COLUMNS] = df_model[FEATURE_COLUMNS].fillna(df_model[FEATURE_COLUMNS].median())

    # Temporal feature engineering per patient (derivatives / diffs and rolling means)
    temporal_features = []
    
    # Group by patient to compute temporal features safely without cross-patient leakage
    grouped = df_model.groupby(ID_COLUMN)
    
    # 1. Diffs (velocity of change) for critical vitals
    vitals_for_temporal = ['HR', 'MAP', 'Temp', 'Resp', 'O2Sat', 'Lactate']
    for v in vitals_for_temporal:
        diff_col = f"{v}_diff"
        roll_col = f"{v}_roll_mean3"
        df_model[diff_col] = grouped[v].diff().fillna(0)
        df_model[roll_col] = grouped[v].rolling(window=3, min_periods=1).mean().reset_index(level=0, drop=True)
        temporal_features.extend([diff_col, roll_col])

    # Also include ICULOS as temporal feature
    temporal_features.append(TIME_COLUMN)

    all_features = FEATURE_COLUMNS + temporal_features

    df_model = df_model.dropna(subset=[TARGET_COLUMN])
    return df_model, all_features

def run_temporal_experiment():
    print("Running Temporal-Feature Experiment...")
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'data'))
    
    df, all_features = load_and_preprocess_temporal(data_dir)
    print(f"Dataset shape with temporal features: {df.shape}")
    print(f"Total features: {len(all_features)}")

    # Stratified split by patient outcome
    patient_outcomes = df.groupby(ID_COLUMN)[TARGET_COLUMN].max()
    positive_patients = patient_outcomes[patient_outcomes == 1].index
    negative_patients = patient_outcomes[patient_outcomes == 0].index
    
    train_pos, test_pos = train_test_split(positive_patients, test_size=0.2, random_state=42)
    train_neg, test_neg = train_test_split(negative_patients, test_size=0.2, random_state=42)
    
    train_patients = np.concatenate([train_pos, train_neg])
    test_patients = np.concatenate([test_pos, test_neg])
    
    train_df = df[df[ID_COLUMN].isin(train_patients)]
    test_df = df[df[ID_COLUMN].isin(test_patients)]
    
    X_train = train_df[all_features]
    y_train = train_df[TARGET_COLUMN]
    X_test = test_df[all_features]
    y_test = test_df[TARGET_COLUMN]

    print("Training GradientBoostingClassifier with temporal features...")
    model = GradientBoostingClassifier(random_state=42, n_estimators=150, max_depth=5, learning_rate=0.05)
    model.fit(X_train, y_train)

    test_probs = model.predict_proba(X_test)[:, 1]
    test_preds = (test_probs >= 0.05).astype(int)

    roc_auc = roc_auc_score(y_test, test_probs)
    pr_auc = average_precision_score(y_test, test_probs)
    f1 = f1_score(y_test, test_preds, zero_division=0)

    print("\n--- Temporal Feature Experiment Results ---")
    print(f"ROC-AUC: {roc_auc:.4f}")
    print(f"PR-AUC: {pr_auc:.4f}")
    print(f"F1 Score (thr=0.05): {f1:.4f}")

    # Save experimental model separately (DO NOT touch production sepsis_model.joblib)
    model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
    os.makedirs(model_dir, exist_ok=True)
    exp_model_path = os.path.join(model_dir, 'sepsis_model_temporal.joblib')
    joblib.dump({'model': model, 'features': all_features}, exp_model_path)
    print(f"Experimental model saved to {exp_model_path} (Production model untouched).")

if __name__ == "__main__":
    run_temporal_experiment()
