import os
import joblib
import pandas as pd
import numpy as np
import glob
import shap
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score
)

BASE_FEATURE_COLUMNS = ['HR', 'Temp', 'Resp', 'SBP', 'DBP', 'O2Sat', 'MAP', 'Creatinine', 'BUN', 'WBC', 'Lactate', 'Age']
TARGET_COLUMN = 'SepsisLabel'
ID_COLUMN = 'patient_id'
TIME_COLUMN = 'ICULOS'

def load_and_preprocess_no_iculos(data_dir):
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

    base_cols = BASE_FEATURE_COLUMNS + [TARGET_COLUMN, ID_COLUMN, TIME_COLUMN]
    df_model = combined_df[base_cols].copy()

    # Forward fill missing values per patient
    df_model[BASE_FEATURE_COLUMNS] = df_model.groupby(ID_COLUMN)[BASE_FEATURE_COLUMNS].ffill()
    df_model[BASE_FEATURE_COLUMNS] = df_model[BASE_FEATURE_COLUMNS].fillna(df_model[BASE_FEATURE_COLUMNS].median())

    # Temporal feature engineering (DIFFS and ROLLING MEANS ONLY - NO ICULOS)
    temporal_features = []
    grouped = df_model.groupby(ID_COLUMN)
    
    vitals_for_temporal = ['HR', 'MAP', 'Temp', 'Resp', 'O2Sat', 'Lactate']
    for v in vitals_for_temporal:
        diff_col = f"{v}_diff"
        roll_col = f"{v}_roll_mean3"
        df_model[diff_col] = grouped[v].diff().fillna(0)
        df_model[roll_col] = grouped[v].rolling(window=3, min_periods=1).mean().reset_index(level=0, drop=True)
        temporal_features.extend([diff_col, roll_col])

    all_features = BASE_FEATURE_COLUMNS + temporal_features

    df_model = df_model.dropna(subset=[TARGET_COLUMN])
    return df_model, all_features

def run_experiment_3():
    print("Running Experiment 3: Temporal Model Without ICULOS...")
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'data'))
    
    df, all_features = load_and_preprocess_no_iculos(data_dir)
    print(f"Dataset shape: {df.shape}")
    print(f"Exact feature count: {len(all_features)}")
    print(f"Exact feature names: {all_features}")
    print(f"Is ICULOS absent from feature list? {'ICULOS' not in all_features}")

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

    print("Training GradientBoostingClassifier (No ICULOS)...")
    model = GradientBoostingClassifier(random_state=42, n_estimators=150, max_depth=5, learning_rate=0.05)
    model.fit(X_train, y_train)

    test_probs = model.predict_proba(X_test)[:, 1]
    threshold = 0.05
    test_preds = (test_probs >= threshold).astype(int)

    roc_auc = roc_auc_score(y_test, test_probs)
    pr_auc = average_precision_score(y_test, test_probs)
    prec = precision_score(y_test, test_preds, zero_division=0)
    rec = recall_score(y_test, test_preds, zero_division=0)
    f1 = f1_score(y_test, test_preds, zero_division=0)
    conf_matrix = confusion_matrix(y_test, test_preds)

    print("\n--- Model Evaluation Metrics (No ICULOS) ---")
    print(f"ROC-AUC: {roc_auc:.4f}")
    print(f"PR-AUC: {pr_auc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall: {rec:.4f}")
    print(f"F1 (thr=0.05): {f1:.4f}")
    print(f"Confusion Matrix:\n{conf_matrix}")

    # Feature Importance
    importances = model.feature_importances_
    feat_imp = sorted(zip(all_features, importances), key=lambda x: x[1], reverse=True)
    print("\nFeature Importances:")
    for f, imp in feat_imp:
        print(f"  {f}: {imp:.6f}")

    # Save model and explainer
    model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'sepsis_model_temporal_no_iculos.joblib')
    explainer_path = os.path.join(model_dir, 'explainer_temporal_no_iculos.joblib')
    
    joblib.dump({'model': model, 'features': all_features}, model_path)
    
    print("Generating SHAP explainer...")
    explainer = shap.TreeExplainer(model)
    joblib.dump(explainer, explainer_path)
    print("Model and SHAP explainer saved successfully.")

    # Test SHAP compatibility
    try:
        sample_row = X_test.iloc[0:1]
        shap_vals = explainer.shap_values(sample_row)
        shap_works = True
        print(f"SHAP compatibility test: SUCCESS (Shape: {np.array(shap_vals).shape})")
    except Exception as e:
        shap_works = False
        print(f"SHAP compatibility test: FAILED ({str(e)})")

    # Controlled Trajectories Inference
    print("\n--- Controlled Trajectory Inference (Stable vs Deteriorating) ---")
    stable_data = [
        [90, 37.0, 18, 120, 80, 98, 93, 0.8, 15, 7, 1.0, 65],
        [88, 36.9, 17, 121, 81, 98, 94, 0.8, 15, 7, 1.0, 65],
        [89, 37.0, 18, 120, 80, 98, 93, 0.8, 15, 7, 1.0, 65],
        [90, 37.0, 18, 120, 80, 98, 93, 0.8, 15, 7, 1.0, 65]
    ]
    stable_traj = pd.DataFrame(stable_data, columns=BASE_FEATURE_COLUMNS)
    stable_traj['patient_id'] = 'STABLE_PATIENT'
    stable_traj['ICULOS'] = [1, 2, 3, 4]

    det_data = [
        [90, 37.0, 18, 120, 80, 98, 93, 0.8, 15, 7, 1.0, 65],
        [100, 37.5, 21, 110, 72, 96, 85, 1.0, 20, 10, 1.5, 65],
        [115, 38.2, 24, 98, 65, 93, 76, 1.5, 28, 14, 2.5, 65],
        [130, 39.5, 28, 85, 55, 88, 60, 2.5, 45, 20, 5.0, 65]
    ]
    det_traj = pd.DataFrame(det_data, columns=BASE_FEATURE_COLUMNS)
    det_traj['patient_id'] = 'DET_PATIENT'
    det_traj['ICULOS'] = [1, 2, 3, 4]

    combined_traj = pd.concat([stable_traj, det_traj], ignore_index=True)
    g = combined_traj.groupby('patient_id')
    vitals_for_temporal = ['HR', 'MAP', 'Temp', 'Resp', 'O2Sat', 'Lactate']
    for v in vitals_for_temporal:
        combined_traj[f"{v}_diff"] = g[v].diff().fillna(0)
        combined_traj[f"{v}_roll_mean3"] = g[v].rolling(window=3, min_periods=1).mean().reset_index(level=0, drop=True)
    combined_traj[all_features] = combined_traj[all_features].fillna(0)

    stable_row = combined_traj[combined_traj['patient_id'] == 'STABLE_PATIENT'].tail(1)[all_features]
    det_row = combined_traj[combined_traj['patient_id'] == 'DET_PATIENT'].tail(1)[all_features]

    prob_stable = float(model.predict_proba(stable_row)[0][1])
    prob_det = float(model.predict_proba(det_row)[0][1])
    diff_val = prob_det - prob_stable

    print(f"Normal/Stable Probability (Hour 4): {prob_stable:.6f}")
    print(f"Deteriorating Probability (Hour 4): {prob_det:.6f}")
    print(f"Difference (Det - Stable): {diff_val:.6f}")

    # Real PhysioNet trajectories (5 positive, 5 negative)
    print("\n--- Real PhysioNet Trajectories Evaluation ---")
    pos_evals = []
    neg_evals = []
    
    for file in glob.glob(os.path.join(data_dir, "**", "*.psv"), recursive=True)[:300]:
        pid = os.path.basename(file).replace(".psv", "")
        df_p = pd.read_csv(file, sep='|')
        df_p['patient_id'] = pid
        if 'Age' not in df_p.columns:
            df_p['Age'] = 50
        if 'SepsisLabel' not in df_p.columns or 'ICULOS' not in df_p.columns:
            continue
        base_cols = BASE_FEATURE_COLUMNS + [TARGET_COLUMN, 'patient_id', 'ICULOS']
        if not all(c in df_p.columns for c in base_cols):
            continue
        sub = df_p[base_cols].copy()
        sub[BASE_FEATURE_COLUMNS] = sub[BASE_FEATURE_COLUMNS].ffill().fillna(sub[BASE_FEATURE_COLUMNS].median())
        
        g_p = sub.groupby('patient_id')
        for v in vitals_for_temporal:
            sub[f"{v}_diff"] = g_p[v].diff().fillna(0)
            sub[f"{v}_roll_mean3"] = g_p[v].rolling(window=3, min_periods=1).mean().reset_index(level=0, drop=True)
        sub[all_features] = sub[all_features].fillna(0)
        
        is_pos = (sub[TARGET_COLUMN].max() == 1)
        probs = model.predict_proba(sub[all_features])[:, 1]
        sub['pred_prob'] = probs
        
        if is_pos and len(pos_evals) < 5:
            pos_evals.append((pid, sub))
        elif not is_pos and len(neg_evals) < 5:
            neg_evals.append((pid, sub))
            
        if len(pos_evals) >= 5 and len(neg_evals) >= 5:
            break

    print("Real Positive Trajectories Detection & Progression:")
    real_pos_detected = 0
    for pid, sub in pos_evals:
        max_prob = sub['pred_prob'].max()
        detected = max_prob >= threshold
        if detected: real_pos_detected += 1
        progression = list(zip(sub['ICULOS'].values[-5:], np.round(sub['pred_prob'].values[-5:], 4)))
        print(f"  Patient {pid}: Max Prob = {max_prob:.4f}, Detected={detected}, Progression: {progression}")

    print("Real Negative Trajectories Detection & Progression:")
    real_neg_correct = 0
    for pid, sub in neg_evals:
        max_prob = sub['pred_prob'].max()
        correct = max_prob < threshold
        if correct: real_neg_correct += 1
        progression = list(zip(sub['ICULOS'].values[-5:], np.round(sub['pred_prob'].values[-5:], 4)))
        print(f"  Patient {pid}: Max Prob = {max_prob:.4f}, Correct(Stable)={correct}, Progression: {progression}")

    print(f"\nSummary Real Positive Detection: {real_pos_detected}/{len(pos_evals)}")
    print(f"Summary Real Negative Detection: {real_neg_correct}/{len(neg_evals)}")

if __name__ == "__main__":
    run_experiment_3()
