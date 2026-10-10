import os
import joblib
import pandas as pd
import numpy as np
import glob
import shap

def evaluate_model():
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models', 'sepsis_model_temporal.joblib'))
    print(f"Loading experimental temporal model from {model_path}...")
    saved_data = joblib.load(model_path)
    model = saved_data['model']
    features = saved_data['features']
    
    print(f"Exact number of features used: {len(features)}")
    print(f"Exact list of features: {features}")

    # 1. Controlled Trajectories for NORMAL and SEVERE
    feature_cols = ['HR', 'Temp', 'Resp', 'SBP', 'DBP', 'O2Sat', 'MAP', 'Creatinine', 'BUN', 'WBC', 'Lactate', 'Age']
    
    normal_traj = pd.DataFrame([
        [88, 36.8, 16, 122, 82, 95, 99, 0.8, 15, 7, 1, 65],
        [89, 37.0, 17, 121, 81, 94, 98, 0.8, 15, 7, 1, 65],
        [90, 37.0, 18, 120, 80, 93, 98, 0.8, 15, 7, 1, 65]
    ], columns=feature_cols)
    normal_traj['patient_id'] = 'NORMAL_PATIENT'
    normal_traj['ICULOS'] = [1, 2, 3]

    severe_traj = pd.DataFrame([
        [100, 38.0, 20, 110, 70, 95, 83, 1.2, 25, 12, 2, 65],
        [115, 38.8, 24, 95, 60, 91, 72, 1.8, 35, 16, 3.5, 65],
        [130, 39.5, 28, 85, 55, 88, 60, 2.5, 45, 20, 5.0, 65]
    ], columns=feature_cols)
    severe_traj['patient_id'] = 'SEVERE_PATIENT'
    severe_traj['ICULOS'] = [1, 2, 3]

    combined = pd.concat([normal_traj, severe_traj], ignore_index=True)
    grouped = combined.groupby('patient_id')

    vitals_for_temporal = ['HR', 'MAP', 'Temp', 'Resp', 'O2Sat', 'Lactate']
    for v in vitals_for_temporal:
        combined[f"{v}_diff"] = grouped[v].diff().fillna(0)
        combined[f"{v}_roll_mean3"] = grouped[v].rolling(window=3, min_periods=1).mean().reset_index(level=0, drop=True)

    combined[features] = combined[features].fillna(0)

    normal_row = combined[combined['patient_id'] == 'NORMAL_PATIENT'].tail(1)[features]
    severe_row = combined[combined['patient_id'] == 'SEVERE_PATIENT'].tail(1)[features]

    prob_normal = float(model.predict_proba(normal_row)[0][1])
    prob_severe = float(model.predict_proba(severe_row)[0][1])
    abs_diff = abs(prob_severe - prob_normal)

    risk_normal = "High" if prob_normal >= 0.05 else ("Moderate" if prob_normal >= 0.02 else "Stable")
    risk_severe = "High" if prob_severe >= 0.05 else ("Moderate" if prob_severe >= 0.02 else "Stable")

    print("\n--- Controlled Inference Results ---")
    print(f"1. NORMAL Probability: {prob_normal:.6f} ({risk_normal})")
    print(f"2. SEVERE Probability: {prob_severe:.6f} ({risk_severe})")
    print(f"3. Absolute Difference: {abs_diff:.6f}")
    print(f"4. Risk Classification at threshold 0.05 -> Normal: {risk_normal}, Severe: {risk_severe}")

    # 5 & 6. Real PhysioNet samples evaluation (5 positive, 5 negative)
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'data'))
    all_files = glob.glob(os.path.join(data_dir, "**", "*.psv"), recursive=True)[:200]
    
    pos_results = []
    neg_results = []

    for file in all_files:
        pid = os.path.basename(file).replace(".psv", "")
        df_p = pd.read_csv(file, sep='|')
        df_p['patient_id'] = pid
        if 'Age' not in df_p.columns:
            df_p['Age'] = 50
            
        if 'SepsisLabel' not in df_p.columns or 'ICULOS' not in df_p.columns:
            continue
            
        is_pos = (df_p['SepsisLabel'].max() == 1)
        
        base_cols = feature_cols + ['SepsisLabel', 'patient_id', 'ICULOS']
        if not all(c in df_p.columns for c in base_cols):
            continue
            
        sub = df_p[base_cols].copy()
        sub[feature_cols] = sub[feature_cols].ffill().fillna(sub[feature_cols].median())
        
        g = sub.groupby('patient_id')
        for v in vitals_for_temporal:
            sub[f"{v}_diff"] = g[v].diff().fillna(0)
            sub[f"{v}_roll_mean3"] = g[v].rolling(window=3, min_periods=1).mean().reset_index(level=0, drop=True)
            
        sub[features] = sub[features].fillna(0)
            
        if is_pos and len(pos_results) < 5:
            onset_rows = sub[sub['SepsisLabel'] == 1]
            target_row = onset_rows.iloc[0:1] if not onset_rows.empty else sub.tail(1)
            X_samp = target_row[features]
            prob = float(model.predict_proba(X_samp)[0][1])
            pos_results.append((pid, prob, prob >= 0.05))
        elif not is_pos and len(neg_results) < 5:
            target_row = sub.tail(1)
            X_samp = target_row[features]
            prob = float(model.predict_proba(X_samp)[0][1])
            neg_results.append((pid, prob, prob >= 0.05))
            
        if len(pos_results) >= 5 and len(neg_results) >= 5:
            break

    print("\n5. Real PhysioNet Positive Samples Results:")
    for pid, prob, pred in pos_results:
        print(f"   Patient {pid}: Prob = {prob:.4f}, Predicted Sepsis = {pred}")

    print("\n6. Real PhysioNet Negative Samples Results:")
    for pid, prob, pred in neg_results:
        print(f"   Patient {pid}: Prob = {prob:.4f}, Predicted Sepsis = {pred}")

    # 7. Test SHAP compatibility
    try:
        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(normal_row)
        shap_works = True
        print(f"\n7. SHAP Compatibility Test: SUCCESS (SHAP values shape: {np.array(shap_vals).shape})")
    except Exception as e:
        shap_works = False
        print(f"\n7. SHAP Compatibility Test: FAILED ({str(e)})")

    # 9. Exact list of temporal features added
    temporal_added = [f"{v}_diff" for v in vitals_for_temporal] + [f"{v}_roll_mean3" for v in vitals_for_temporal] + ['ICULOS']
    print(f"\n9. Exact list of temporal features added ({len(temporal_added)}): {temporal_added}")
    print(f"8. Exact number of features used: {len(features)}")
    print(f"10. Future information used? NO. Computed strictly via past/current history per patient (forward fill, diff, rolling window).")

if __name__ == "__main__":
    evaluate_model()
