import pandas as pd
import os
import glob

# FEATURE MAPPING:
# Expanded feature set including vitals, lab values, and demographics.
FEATURE_COLUMNS = ['HR', 'Temp', 'Resp', 'SBP', 'DBP', 'O2Sat', 'MAP', 'Creatinine', 'BUN', 'WBC', 'Lactate', 'Age']
TARGET_COLUMN = 'SepsisLabel' # Indicates sepsis onset based on challenge criteria
ID_COLUMN = 'patient_id'
TIME_COLUMN = 'ICULOS'

def load_and_preprocess(data_dir):
    """
    Loads and preprocesses the PhysioNet 2019 Challenge dataset.
    """
    all_files = glob.glob(os.path.join(data_dir, "**", "*.psv"), recursive=True)[:500]
    data_list = []

    for file in all_files:
        # Extract ID from filename (e.g., p000001)
        patient_id = os.path.basename(file).replace(".psv", "")
        df = pd.read_csv(file, sep='|')
        df[ID_COLUMN] = patient_id
        
        # Age is often available; check if it's missing and handle (e.g., fill with median)
        # Assuming Age column exists in dataset. If not, this needs adjustment.
        if 'Age' not in df.columns:
            df['Age'] = 50 # Fallback placeholder if not provided in raw file
            
        data_list.append(df)

    if not data_list:
        raise ValueError(f"No .psv files found in {data_dir}")

    # Concatenate all patient files
    combined_df = pd.concat(data_list, ignore_index=True)

    # Ensure temporal order before any processing
    combined_df = combined_df.sort_values(by=[ID_COLUMN, TIME_COLUMN])

    # Select only required features, target, ID, and TIME
    # We need to keep TIME to ensure correct order for ffill
    df_model = combined_df[FEATURE_COLUMNS + [TARGET_COLUMN, ID_COLUMN, TIME_COLUMN]].copy()

    # Handle missing values: 
    # Use forward-fill (ffill) to propagate last known vitals per patient.
    # Group by patient_id to prevent leakage between patients.
    df_model[FEATURE_COLUMNS] = df_model.groupby(ID_COLUMN)[FEATURE_COLUMNS].ffill()
    
    # Fill remaining NaNs with column medians (within patient if possible, or global)
    df_model[FEATURE_COLUMNS] = df_model[FEATURE_COLUMNS].fillna(df_model[FEATURE_COLUMNS].median())

    # Drop any remaining rows that still contain NaNs in target.
    df_model = df_model.dropna(subset=[TARGET_COLUMN])

    # Remove TIME_COLUMN now that we have finished temporal ordering/processing
    return df_model.drop(columns=[TIME_COLUMN])

# The training module will use GroupShuffleSplit(groups=df[ID_COLUMN])
# to ensure no data leakage between train and test sets.
