import { useState } from 'react';
import { api } from '../api';
import { getRiskCategoryInfo, TechnicalModelDetails } from './ui/UIComponents';

const VitalsForm = ({ patientId, onVitalsAdded }) => {
  const [vitals, setVitals] = useState({
    heartRate: '', temperature: '', respiratoryRate: '',
    systolicBP: '', diastolicBP: '', oxygenSaturation: '',
    MAP: '', Creatinine: '', BUN: '', WBC: '', Lactate: '', Age: ''
  });
  const [riskResult, setRiskResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRiskResult(null);
    setSubmitting(true);
    try {
      const updatedPatient = await api.addVitals(patientId, vitals);
      setRiskResult({
        score: updatedPatient.sepsisRiskScore,
        status: updatedPatient.status
      });
      onVitalsAdded(); // Refresh parent data
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vitals-form" style={{ marginTop: '15px' }}>
      <h4>Record Clinical Data</h4>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {riskResult && (() => {
        const info = getRiskCategoryInfo(riskResult.score);
        return (
          <div style={{ background: info.bg, border: `1px solid ${info.border}`, padding: '16px', borderRadius: '12px', marginBottom: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: info.color, marginBottom: '6px' }}>{info.category}</div>
            <p style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '0.85rem' }}>{info.explanation}</p>
            <TechnicalModelDetails score={riskResult.score} />
          </div>
        );
      })()}
      <form onSubmit={handleSubmit} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
        <input type="number" placeholder="HR" value={vitals.heartRate} onChange={(e) => setVitals({...vitals, heartRate: e.target.value})} required />
        <input type="number" placeholder="Temp (°C)" step="0.1" value={vitals.temperature} onChange={(e) => setVitals({...vitals, temperature: e.target.value})} required />
        <input type="number" placeholder="Resp Rate" value={vitals.respiratoryRate} onChange={(e) => setVitals({...vitals, respiratoryRate: e.target.value})} required />
        <input type="number" placeholder="Systolic BP" value={vitals.systolicBP} onChange={(e) => setVitals({...vitals, systolicBP: e.target.value})} required />
        <input type="number" placeholder="Diastolic BP" value={vitals.diastolicBP} onChange={(e) => setVitals({...vitals, diastolicBP: e.target.value})} required />
        <input type="number" placeholder="SpO2 (%)" value={vitals.oxygenSaturation} onChange={(e) => setVitals({...vitals, oxygenSaturation: e.target.value})} required />
        <input type="number" placeholder="MAP" value={vitals.MAP} onChange={(e) => setVitals({...vitals, MAP: e.target.value})} required />
        <input type="number" placeholder="Creatinine" value={vitals.Creatinine} onChange={(e) => setVitals({...vitals, Creatinine: e.target.value})} required />
        <input type="number" placeholder="BUN" value={vitals.BUN} onChange={(e) => setVitals({...vitals, BUN: e.target.value})} required />
        <input type="number" placeholder="WBC" value={vitals.WBC} onChange={(e) => setVitals({...vitals, WBC: e.target.value})} required />
        <input type="number" placeholder="Lactate" value={vitals.Lactate} onChange={(e) => setVitals({...vitals, Lactate: e.target.value})} required />
        <input type="number" placeholder="Age" value={vitals.Age} onChange={(e) => setVitals({...vitals, Age: e.target.value})} required />
        <button type="submit" style={{gridColumn: 'span 2'}} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Clinical Data'}
        </button>
      </form>
    </div>
  );
};

export default VitalsForm;
