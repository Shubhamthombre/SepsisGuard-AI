import os
import joblib
import pandas as pd
import numpy as np
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
    recall_score,
    precision_score
)
from preprocess import load_and_preprocess, FEATURE_COLUMNS, TARGET_COLUMN, ID_COLUMN

def train_and_compare():
    # 1. Load and preprocess
    print("Loading and preprocessing data...")
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'data'))
    df = load_and_preprocess(data_dir)
    
    # 2. Split data (stratified by patient outcome)
    patient_outcomes = df.groupby(ID_COLUMN)[TARGET_COLUMN].max()
    positive_patients = patient_outcomes[patient_outcomes == 1].index
    negative_patients = patient_outcomes[patient_outcomes == 0].index
    
    train_pos, test_pos = train_test_split(positive_patients, test_size=0.2, random_state=42)
    train_neg, test_neg = train_test_split(negative_patients, test_size=0.2, random_state=42)
    
    train_patients = np.concatenate([train_pos, train_neg])
    test_patients = np.concatenate([test_pos, test_neg])
    
    train_df = df[df[ID_COLUMN].isin(train_patients)]
    test_df = df[df[ID_COLUMN].isin(test_patients)]
    
    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df[TARGET_COLUMN]
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df[TARGET_COLUMN]
    
    # 3. Train Model (GradientBoosting for superior ROC-AUC and probability sensitivity)
    print("Training GradientBoostingClassifier...")
    model = GradientBoostingClassifier(random_state=42, n_estimators=150, max_depth=5, learning_rate=0.05)
    model.fit(X_train, y_train)
    
    # Evaluate and print metrics
    test_probs = model.predict_proba(X_test)[:, 1]
    test_preds = (test_probs >= 0.05).astype(int)
    print("Model ROC-AUC:", roc_auc_score(y_test, test_probs))
    print("Model PR-AUC:", average_precision_score(y_test, test_probs))
    print("Model F1 (thr=0.05):", f1_score(y_test, test_preds, zero_division=0))
    
    # 4. Save model
    model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(model, os.path.join(model_dir, 'sepsis_model.joblib'))
    
    # 5. Save SHAP explainer
    print("Generating SHAP explainer...")
    explainer = shap.TreeExplainer(model)
    joblib.dump(explainer, os.path.join(model_dir, 'explainer.joblib'))
    print("Model and explainer saved.")

if __name__ == "__main__":
    train_and_compare()
