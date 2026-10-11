from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import os
import shap

# Define the FastAPI app
app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Load model and explainer
model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "sepsis_model.joblib"))
explainer_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "explainer.joblib"))

print(f"Loading model from {model_path}...")
model = joblib.load(model_path)
print("Model loaded.")

print(f"Loading explainer from {explainer_path}...")
explainer = joblib.load(explainer_path)
print("Explainer loaded.")

# Pydantic model for input validation (full 12 features)
class SepsisRequest(BaseModel):
    HR: float
    Temp: float
    Resp: float
    SBP: float
    DBP: float
    O2Sat: float
    MAP: float
    Creatinine: float
    BUN: float
    WBC: float
    Lactate: float
    Age: float

@app.post("/predict")
async def predict_sepsis(data: SepsisRequest):
    try:
        # Prepare feature vector as DataFrame to match training feature names
        feature_names = ['HR', 'Temp', 'Resp', 'SBP', 'DBP', 'O2Sat', 'MAP', 'Creatinine', 'BUN', 'WBC', 'Lactate', 'Age']
        features_df = pd.DataFrame([[
            data.HR, data.Temp, data.Resp, data.SBP, data.DBP, data.O2Sat,
            data.MAP, data.Creatinine, data.BUN, data.WBC, data.Lactate, data.Age
        ]], columns=feature_names)
        
        # Predict
        probability = float(model.predict_proba(features_df)[0][1])
        prediction = int(probability >= 0.05)
        
        # Determine risk level based on validation-tuned 0.05 operating threshold
        if probability >= 0.05:
            risk_level = "High"
        elif probability >= 0.02:
            risk_level = "Moderate"
        else:
            risk_level = "Stable"
            
        # Explainable AI: SHAP values robust extraction
        raw_shap = explainer.shap_values(features_df)
        
        if isinstance(raw_shap, list):
            if len(raw_shap) > 1:
                shap_values = np.array(raw_shap[1])[0]
            else:
                shap_values = np.array(raw_shap[0])[0]
        else:
            arr = np.array(raw_shap)
            if arr.ndim == 3:
                # Shape (1, 12, 2) -> extract class 1 for single sample
                shap_values = arr[0, :, 1]
            elif arr.ndim == 2:
                shap_values = arr[0]
            else:
                shap_values = arr.flatten()
            
        feature_importance = {str(name): float(val) for name, val in zip(feature_names, shap_values)}
            
        return {
            "sepsis_probability": probability,
            "prediction": prediction,
            "risk_level": risk_level,
            "feature_importance": feature_importance
        }
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    import os

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000))
    )
