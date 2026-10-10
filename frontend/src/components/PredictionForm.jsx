import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { StatusBadge, PremiumButton, GlassCard, getRiskCategoryInfo, TechnicalModelDetails } from './ui/UIComponents';
import { Activity, Thermometer, Heart, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

const PredictionForm = ({ patientId, patientAge, onPredictionComplete, onClinicalAlert }) => {
  const [activeTab, setActiveTab] = useState('vitals'); // 'vitals', 'hemodynamics', 'labs'
  const [formData, setFormData] = useState({
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    systolicBP: '',
    diastolicBP: '',
    MAP: '',
    Creatinine: '',
    BUN: '',
    WBC: '',
    Lactate: '',
    Age: patientAge !== undefined && patientAge !== null ? String(patientAge) : ''
  });

  useEffect(() => {
    if (patientAge !== undefined && patientAge !== null) {
      setFormData(prev => ({ ...prev, Age: String(patientAge) }));
    }
  }, [patientAge]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getParamStatus = (name, val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return { label: 'Required', color: '#94a3b8' };
    
    switch(name) {
      case 'heartRate':
        if (num < 50 || num > 120) return { label: 'High Risk', color: '#f87171' };
        if (num < 60 || num > 90) return { label: 'Attention', color: '#fbbf24' };
        return { label: 'Normal', color: '#34d399' };
      case 'temperature':
        if (num < 35.5 || num > 38.5) return { label: 'High Risk', color: '#f87171' };
        if (num < 36.0 || num > 37.8) return { label: 'Attention', color: '#fbbf24' };
        return { label: 'Normal', color: '#34d399' };
      case 'respiratoryRate':
        if (num >= 22) return { label: 'High Risk (qSOFA)', color: '#f87171' };
        if (num > 20) return { label: 'Attention', color: '#fbbf24' };
        return { label: 'Normal', color: '#34d399' };
      case 'oxygenSaturation':
        if (num < 90) return { label: 'Critical Low', color: '#f87171' };
        if (num < 95) return { label: 'Hypoxia Risk', color: '#fbbf24' };
        return { label: 'Normal', color: '#34d399' };
      case 'systolicBP':
        if (num <= 100) return { label: 'Hypotension (Shock)', color: '#f87171' };
        if (num < 110) return { label: 'Attention', color: '#fbbf24' };
        return { label: 'Normal', color: '#34d399' };
      case 'MAP':
        if (num < 65) return { label: 'Critical MAP', color: '#f87171' };
        if (num < 70) return { label: 'Attention', color: '#fbbf24' };
        return { label: 'Normal', color: '#34d399' };
      case 'Creatinine':
        if (num > 1.5) return { label: 'Elevated', color: '#f87171' };
        return { label: 'Normal', color: '#34d399' };
      case 'BUN':
        if (num > 20) return { label: 'Elevated', color: '#f87171' };
        return { label: 'Normal', color: '#34d399' };
      case 'WBC':
        if (num > 12 || num < 4) return { label: 'Abnormal', color: '#fbbf24' };
        return { label: 'Normal', color: '#34d399' };
      case 'Lactate':
        if (num > 2.0) return { label: 'Elevated Risk', color: '#f87171' };
        return { label: 'Normal', color: '#34d399' };
      default:
        return { label: 'Normal', color: '#34d399' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updatedPatient = await api.addVitals(patientId, formData);
      const latestVitals = updatedPatient.vitalsHistory[updatedPatient.vitalsHistory.length - 1];
      setResult({
        score: updatedPatient.sepsisRiskScore,
        status: updatedPatient.status,
        vitals: latestVitals
      });
      if (latestVitals.status === 'Moderate Risk' || latestVitals.status === 'High Risk') {
        if (onClinicalAlert) {
          onClinicalAlert(updatedPatient, latestVitals);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit clinical assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '20px 0' }}>
            <GlassCard style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ display: 'inline-flex', padding: '15px', background: 'rgba(6, 182, 212, 0.2)', borderRadius: '50%', marginBottom: '15px' }}>
                <CheckCircle2 size={40} color="#06b6d4" />
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: '#f8fafc' }}>Assessment Complete</h3>
              <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Telemetry recorded & evaluated by SepsisGuard AI Model.</p>
              
              {(() => {
                const info = getRiskCategoryInfo(result.score);
                return (
                  <div style={{ background: info.bg, border: `1px solid ${info.border}`, borderRadius: '16px', padding: '24px', marginBottom: '25px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Risk Category</span>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: info.color, marginBottom: '10px', letterSpacing: '0.5px' }}>
                      {info.category}
                    </div>
                    <p style={{ color: '#f8fafc', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5', marginBottom: '16px' }}>
                      {info.explanation}
                    </p>
                    <StatusBadge status={result.status} />
                    <TechnicalModelDetails score={result.score} />
                  </div>
                );
              })()}

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <PremiumButton onClick={onPredictionComplete}>Return to Patient Profile</PremiumButton>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            {error && (
              <div style={{ flexShrink: 0, padding: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #f87171', borderRadius: '8px', color: '#f87171', marginBottom: '15px', fontSize: '0.9rem', fontWeight: '600' }}>
                {error}
              </div>
            )}

            {/* .modal-tabs */}
            <div className="modal-tabs" style={{ flexShrink: 0, display: 'flex', gap: '10px', marginBottom: '16px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('vitals')}
                style={{ background: activeTab === 'vitals' ? 'rgba(6, 182, 212, 0.2)' : 'transparent', border: activeTab === 'vitals' ? '1px solid #06b6d4' : '1px solid rgba(148, 163, 184, 0.3)', color: activeTab === 'vitals' ? '#06b6d4' : '#94a3b8', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
              >
                1. Vital Signs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hemodynamics')}
                style={{ background: activeTab === 'hemodynamics' ? 'rgba(6, 182, 212, 0.2)' : 'transparent', border: activeTab === 'hemodynamics' ? '1px solid #06b6d4' : '1px solid rgba(148, 163, 184, 0.3)', color: activeTab === 'hemodynamics' ? '#06b6d4' : '#94a3b8', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
              >
                2. Hemodynamics & BP
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('labs')}
                style={{ background: activeTab === 'labs' ? 'rgba(6, 182, 212, 0.2)' : 'transparent', border: activeTab === 'labs' ? '1px solid #06b6d4' : '1px solid rgba(148, 163, 184, 0.3)', color: activeTab === 'labs' ? '#06b6d4' : '#94a3b8', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
              >
                3. Lab & Clinical
              </button>
            </div>

            {/* .modal-body (Only scrolling region) */}
            <div className="modal-body" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', paddingRight: '4px' }}>
              {/* Tab 1: Vital Signs */}
              {activeTab === 'vitals' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Heart Rate', name: 'heartRate', unit: 'bpm', ref: '60 - 100' },
                    { label: 'Temperature', name: 'temperature', unit: '°C', ref: '36.5 - 37.5' },
                    { label: 'Respiratory Rate', name: 'respiratoryRate', unit: 'breaths/min', ref: '12 - 20' },
                    { label: 'Oxygen Saturation (SpO2)', name: 'oxygenSaturation', unit: '%', ref: '95 - 100' },
                    { label: 'Patient Age', name: 'Age', unit: 'years', ref: 'Adult' }
                  ].map(field => {
                    const status = getParamStatus(field.name, formData[field.name]);
                    return (
                      <GlassCard key={field.name} style={{ padding: '16px', background: 'rgba(7, 11, 25, 0.75)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>{field.label} ({field.unit})</label>
                          <span style={{ fontSize: '0.75rem', color: status.color, fontWeight: '700' }}>{status.label}</span>
                        </div>
                        <input 
                          type="number" 
                          step={field.name === 'temperature' ? '0.1' : '1'} 
                          name={field.name} 
                          value={formData[field.name]} 
                          onChange={handleChange}
                          required
                          style={{ width: '100%', background: '#ffffff', border: '1px solid rgba(6, 182, 212, 0.4)', padding: '10px 14px', borderRadius: '8px', color: '#0b132b', fontWeight: '700', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '6px' }}>Ref: {field.ref}</span>
                      </GlassCard>
                    );
                  })}
                </motion.div>
              )}

              {/* Tab 2: Hemodynamics */}
              {activeTab === 'hemodynamics' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Systolic Blood Pressure', name: 'systolicBP', unit: 'mmHg', ref: '110 - 140' },
                    { label: 'Diastolic Blood Pressure', name: 'diastolicBP', unit: 'mmHg', ref: '70 - 90' },
                    { label: 'Mean Arterial Pressure (MAP)', name: 'MAP', unit: 'mmHg', ref: '70 - 105' }
                  ].map(field => {
                    const status = getParamStatus(field.name, formData[field.name]);
                    return (
                      <GlassCard key={field.name} style={{ padding: '16px', background: 'rgba(7, 11, 25, 0.75)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>{field.label} ({field.unit})</label>
                          <span style={{ fontSize: '0.75rem', color: status.color, fontWeight: '700' }}>{status.label}</span>
                        </div>
                        <input 
                          type="number" 
                          name={field.name} 
                          value={formData[field.name]} 
                          onChange={handleChange}
                          required
                          style={{ width: '100%', background: '#ffffff', border: '1px solid rgba(6, 182, 212, 0.4)', padding: '10px 14px', borderRadius: '8px', color: '#0b132b', fontWeight: '700', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '6px' }}>Ref: {field.ref}</span>
                      </GlassCard>
                    );
                  })}
                </motion.div>
              )}

              {/* Tab 3: Lab Parameters */}
              {activeTab === 'labs' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Serum Creatinine', name: 'Creatinine', unit: 'mg/dL', ref: '0.6 - 1.2' },
                    { label: 'Blood Urea Nitrogen (BUN)', name: 'BUN', unit: 'mg/dL', ref: '7 - 20' },
                    { label: 'White Blood Cell Count (WBC)', name: 'WBC', unit: 'k/uL', ref: '4.5 - 11.0' },
                    { label: 'Blood Lactate', name: 'Lactate', unit: 'mmol/L', ref: '0.5 - 2.0' }
                  ].map(field => {
                    const status = getParamStatus(field.name, formData[field.name]);
                    return (
                      <GlassCard key={field.name} style={{ padding: '16px', background: 'rgba(7, 11, 25, 0.75)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>{field.label} ({field.unit})</label>
                          <span style={{ fontSize: '0.75rem', color: status.color, fontWeight: '700' }}>{status.label}</span>
                        </div>
                        <input 
                          type="number" 
                          step="0.1" 
                          name={field.name} 
                          value={formData[field.name]} 
                          onChange={handleChange}
                          required
                          style={{ width: '100%', background: '#ffffff', border: '1px solid rgba(6, 182, 212, 0.4)', padding: '10px 14px', borderRadius: '8px', color: '#0b132b', fontWeight: '700', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '6px' }}>Ref: {field.ref}</span>
                      </GlassCard>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* .modal-footer (Fixed/Sticky Action Footer) */}
            <div className="modal-footer" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', marginTop: '12px', borderTop: '1px solid rgba(148, 163, 184, 0.2)', background: 'rgba(10, 20, 45, 0.96)' }}>
              {activeTab === 'vitals' && (
                <>
                  <div />
                  <PremiumButton type="button" onClick={() => setActiveTab('hemodynamics')}>Next: Hemodynamics →</PremiumButton>
                </>
              )}
              {activeTab === 'hemodynamics' && (
                <>
                  <PremiumButton type="button" variant="secondary" onClick={() => setActiveTab('vitals')}>← Back</PremiumButton>
                  <PremiumButton type="button" onClick={() => setActiveTab('labs')}>Next: Lab Parameters →</PremiumButton>
                </>
              )}
              {activeTab === 'labs' && (
                <>
                  <PremiumButton type="button" variant="secondary" onClick={() => setActiveTab('hemodynamics')}>← Back</PremiumButton>
                  <PremiumButton type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #059669, #06b6d4)' }}>
                    {loading ? 'Evaluating AI Model...' : 'Submit Clinical Assessment'}
                  </PremiumButton>
                </>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredictionForm;
