# SepsisGuard AI Expansion Plan

## 1. Goal
Transform SepsisGuard AI into a dense, professional clinical intelligence platform using real PhysioNet dataset features, improved ML explainability, and comprehensive frontend monitoring features.

## 2. Technical Roadmap

### Phase 1: Data Model & ML Pipeline (Foundation)
- **Backend Schema:** Update `VitalReadingSchema` in `backend/models/Patient.js` to store all 12 clinical parameters (not just the partial set).
- **ML Refinement:** Retrain models using patient-level stratification, incorporate SHAP for feature explainability, and save the explainer object.
- **FastAPI Service:** Update `ml/service/app.py` to return not just probability, but also SHAP-based feature importance vectors to drive the frontend explanations.

### Phase 2: Frontend Expansion (Core Experience)
- **Dashboard:** Create metric-heavy cards, clinical alert system.
- **Patient Profile:** Create a comprehensive UI for vitals history, risk trends, and parameter-specific status (Normal/Elevated/Reduced).
- **Prediction Workflow:** Multi-step wizard UI for inputting all 12 clinical parameters.
- **XAI Component:** Visual breakdown of "Key contributing factors" based on SHAP values.

### Phase 3: Analytics & Methodology (Depth)
- **Analytics:** Bar/Pie charts for risk distribution.
- **Research Section:** Methodology page detailing the PhysioNet dataset, preprocessing steps, model performance metrics (ROC-AUC, PR-AUC), and limitations.

## 3. Data Integrity & Safety
- Use real MongoDB data.
- Explicit "Research prototype" disclaimers on every major clinical view.
- No fabrications; use "Unavailable" states for missing data.
