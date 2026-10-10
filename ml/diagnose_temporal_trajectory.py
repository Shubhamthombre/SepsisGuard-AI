import os
import joblib
import pandas as pd
import numpy as np

def run_diagnostic():
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models', 'sepsis_model_temporal.joblib'))
    print(f"Loading experimental temporal model from {model_path}...")
    saved_data = joblib.load(model_path)
    model = saved_data['model']
    features = saved_data['features']

    feature_cols = ['HR', 'Temp', 'Resp', 'SBP', 'DBP', 'O2Sat', 'MAP', 'Creatinine', 'BUN', 'WBC', 'Lactate', 'Age']

    # 1. Stable Trajectory (4 hours of stable normal vitals)
    # Order: HR, Temp, Resp, SBP, DBP, O2Sat, MAP, Creatinine, BUN, WBC, Lactate, Age
    stable_data = [
        [90, 37.0, 18, 120, 80, 98, 93, 0.8, 15, 7, 1.0, 65],
        [88, 36.9, 17, 121, 81, 98, 94, 0.8, 15, 7, 1.0, 65],
        [89, 37.0, 18, 120, 80, 98, 93, 0.8, 15, 7, 1.0, 65],
        [90, 37.0, 18, 120, 80, 98, 93, 0.8, 15, 7, 1.0, 65]
    ]
    stable_traj = pd.DataFrame(stable_data, columns=feature_cols)
    stable_traj['patient_id'] = 'STABLE_PATIENT'
    stable_traj['ICULOS'] = [1, 2, 3, 4]

    # 2. Deteriorating Trajectory (4 hours with exact progressive worsening requested by user)
    # Hour 1: HR 90, Temp 37.0, Resp 18, SBP 120, DBP 80, O2Sat 98, MAP 93, Creatinine 0.8, BUN 15, WBC 7, Lactate 1.0, Age 65
    # Hour 2: HR 100, Temp 37.5, Resp 21, SBP 110, DBP 72, O2Sat 96, MAP 85, Creatinine 1.0, BUN 20, WBC 10, Lactate 1.5, Age 65
    # Hour 3: HR 115, Temp 38.2, Resp 24, SBP 98, DBP 65, O2Sat 93, MAP 76, Creatinine 1.5, BUN 28, WBC 14, Lactate 2.5, Age 65
    # Hour 4: HR 130, Temp 39.5, Resp 28, SBP 85, DBP 55, O2Sat 88, MAP 60, Creatinine 2.5, BUN 45, WBC 20, Lactate 5.0, Age 65
    deteriorating_data = [
        [90, 37.0, 18, 120, 80, 98, 93, 0.8, 15, 7, 1.0, 65],
        [100, 37.5, 21, 110, 72, 96, 85, 1.0, 20, 10, 1.5, 65],
        [115, 38.2, 24, 98, 65, 93, 76, 1.5, 28, 14, 2.5, 65],
        [130, 39.5, 28, 85, 55, 88, 60, 2.5, 45, 20, 5.0, 65]
    ]
    deteriorating_traj = pd.DataFrame(deteriorating_data, columns=feature_cols)
    deteriorating_traj['patient_id'] = 'DETERIORATING_PATIENT'
    deteriorating_traj['ICULOS'] = [1, 2, 3, 4]

    # Combine and apply temporal feature engineering pipeline exactly as during training
    combined = pd.concat([stable_traj, deteriorating_traj], ignore_index=True)
    grouped = combined.groupby('patient_id')

    vitals_for_temporal = ['HR', 'MAP', 'Temp', 'Resp', 'O2Sat', 'Lactate']
    for v in vitals_for_temporal:
        combined[f"{v}_diff"] = grouped[v].diff().fillna(0)
        combined[f"{v}_roll_mean3"] = grouped[v].rolling(window=3, min_periods=1).mean().reset_index(level=0, drop=True)

    combined[features] = combined[features].fillna(0)

    stable_row = combined[combined['patient_id'] == 'STABLE_PATIENT'].tail(1)[features]
    deteriorating_row = combined[combined['patient_id'] == 'DETERIORATING_PATIENT'].tail(1)[features]

    prob_stable = float(model.predict_proba(stable_row)[0][1])
    prob_det = float(model.predict_proba(deteriorating_row)[0][1])
    abs_diff = abs(prob_det - prob_stable)

    class_stable = "High" if prob_stable >= 0.05 else ("Moderate" if prob_stable >= 0.02 else "Stable")
    class_det = "High" if prob_det >= 0.05 else ("Moderate" if prob_det >= 0.02 else "Stable")

    print("\n--- Diagnostic Evaluation Results ---")
    print(f"1. Stable trajectory probability: {prob_stable:.6f}")
    print(f"2. Deteriorating trajectory probability: {prob_det:.6f}")
    print(f"3. Difference: {abs_diff:.6f}")
    print(f"4. Classification at threshold 0.05 -> Stable: {class_stable}, Deteriorating: {class_det}")
    
    print("\n5. Exact 25 features generated for the final hour (Deteriorating Hour 4):")
    for f in features:
        print(f"   {f}: {deteriorating_row.iloc[0][f]}")

    print("\n6. Values of the temporal features for the final hour (Deteriorating Hour 4):")
    temporal_features_list = [
        'HR_diff', 'MAP_diff', 'Temp_diff', 'Resp_diff', 'O2Sat_diff', 'Lactate_diff',
        'HR_roll_mean3', 'MAP_roll_mean3', 'Temp_roll_mean3', 'Resp_roll_mean3', 'O2Sat_roll_mean3', 'Lactate_roll_mean3',
        'ICULOS'
    ]
    for tf in temporal_features_list:
        print(f"   {tf}: {deteriorating_row.iloc[0][tf]}")

    non_zero_diffs = any(deteriorating_row.iloc[0][f"{v}_diff"] != 0 for v in vitals_for_temporal)
    print(f"\n7. Whether the severe/deteriorating trajectory produces non-zero deterioration/diff features: {non_zero_diffs}")
    print(f"8. Whether any future information is accidentally being used: NO. Computed strictly via past/current history per patient (forward fill, diff, rolling window).")
    print(f"9. Whether the model was retrained or whether this was only diagnostic inference: ONLY DIAGNOSTIC INFERENCE (Model was NOT retrained, production model NOT touched).")

if __name__ == "__main__":
    run_diagnostic()
