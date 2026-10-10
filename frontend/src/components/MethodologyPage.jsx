import { GlassCard, SpotlightCard } from './ui/UIComponents';
import GradientWaves from './ui/GradientWaves';
import { motion } from 'framer-motion';
import { Cpu, Database, ShieldCheck, Activity, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MethodologyPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '28px', maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', position: 'relative', color: '#f8fafc', minHeight: '100vh' }}>
      <GradientWaves />

      {user && (
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', padding: '10px 16px', borderRadius: '10px' }}>
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
      )}

      <div>
        <h2 className="gradient-text" style={{ fontSize: '2.5rem', margin: 0, fontWeight: '800' }}>Methodology & Model Architecture</h2>
        <p style={{ color: '#94a3b8', margin: '8px 0 0 0', fontSize: '1.1rem' }}>Comprehensive technical documentation of the SepsisGuard AI clinical intelligence engine.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.15)">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Database size={24} color="#06b6d4" />
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: '#f8fafc' }}>Dataset & Preprocessing</h3>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '20px' }}>
            The model is trained on the benchmark <strong>PhysioNet 2019 Early Prediction of Sepsis Challenge</strong> dataset. 
            Data preprocessing incorporates patient-level stratified splitting (preventing data leakage), robust missing-value imputation for sparse clinical time-series, and standard scaling.
          </p>
          <div style={{ background: 'rgba(7, 11, 25, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '6px', color: '#f8fafc' }}>Training Integrity</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Class imbalance handled via weighted ensemble techniques to optimize sensitivity for early clinical warning.</span>
          </div>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(37, 99, 235, 0.15)">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Cpu size={24} color="#60a5fa" />
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: '#f8fafc' }}>Model & Explainable AI (SHAP)</h3>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '20px' }}>
            Built using a tuned <code>RandomForestClassifier</code> linked to FastAPI backend inference. 
            Explainable AI (XAI) is powered by <code>shap.TreeExplainer</code>, computing exact Shapley values for every patient telemetry assessment.
          </p>
          <div style={{ background: 'rgba(7, 11, 25, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '6px', color: '#f8fafc' }}>Model Contribution</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Features are evaluated as directional risk contributors (increasing or decreasing predicted probability).</span>
          </div>
        </SpotlightCard>
      </div>

      <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Activity size={24} color="#34d399" />
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: '#f8fafc' }}>12 Supported Clinical Parameters</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { name: 'Heart Rate (HR)', unit: 'bpm', desc: 'SIRS cardiovascular stress indicator' },
            { name: 'Temperature (Temp)', unit: '°C', desc: 'Fever or hypothermia assessment' },
            { name: 'Respiratory Rate (Resp)', unit: 'breaths/min', desc: 'qSOFA respiratory distress marker' },
            { name: 'Systolic Blood Pressure (SBP)', unit: 'mmHg', desc: 'Hypotension & shock indicator' },
            { name: 'Diastolic Blood Pressure (DBP)', unit: 'mmHg', desc: 'Vascular resistance evaluation' },
            { name: 'Mean Arterial Pressure (MAP)', unit: 'mmHg', desc: 'Tissue perfusion pressure' },
            { name: 'Oxygen Saturation (SpO2)', unit: '%', desc: 'Hypoxia & oxygenation tracking' },
            { name: 'Serum Creatinine', unit: 'mg/dL', desc: 'Renal function & organ failure marker' },
            { name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', desc: 'Metabolic & kidney filtration status' },
            { name: 'White Blood Cell Count (WBC)', unit: 'k/uL', desc: 'Systemic inflammation / infection' },
            { name: 'Blood Lactate', unit: 'mmol/L', desc: 'Cellular hypoxia & septic shock marker' },
            { name: 'Patient Age', unit: 'years', desc: 'Baseline physiological risk factor' }
          ].map((param, i) => (
            <div key={i} style={{ background: 'rgba(7, 11, 25, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>{param.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: '700' }}>Unit: {param.unit}</span>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>{param.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#f87171' }}>
          <AlertTriangle size={22} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Clinical Research Disclaimer</h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#f8fafc', lineHeight: '1.6' }}>
          SepsisGuard AI is an educational prototype developed for final-year engineering demonstration. It is not FDA-cleared, clinically validated, or certified for autonomous medical diagnosis, treatment planning, or clinical decision-making. Always consult qualified healthcare professionals.
        </p>
      </GlassCard>
    </motion.div>
  );
}

export default MethodologyPage;
