import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getPatientCurrentStatus, getPatientCurrentScore } from '../api';
import { GlassCard, SpotlightCard, StatusBadge, PremiumButton, AnimatedCircularProgressBar, getRiskCategoryInfo, TechnicalModelDetails, ClinicalRiskTimeline } from './ui/UIComponents';
import { Modal } from './ui/Modal';
import PredictionForm from './PredictionForm';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, User, Heart, AlertTriangle, Clock, TrendingUp, Calendar, ShieldAlert } from 'lucide-react';

function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [clinicalReviewAlert, setClinicalReviewAlert] = useState(null);

  const featureMap = {
    'HR': 'Heart Rate', 'Temp': 'Temperature', 'Resp': 'Respiratory Rate',
    'SBP': 'Systolic BP', 'DBP': 'Diastolic BP', 'O2Sat': 'Oxygen Saturation',
    'MAP': 'MAP', 'Creatinine': 'Creatinine', 'BUN': 'BUN', 'WBC': 'WBC',
    'Lactate': 'Lactate', 'Age': 'Age'
  };

  const fetchPatient = async () => {
    try {
      const data = await api.getPatientById(id);
      setPatient(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading patient clinical profile...</div>;
  if (!patient) return <div style={{ padding: '60px', textAlign: 'center', color: '#f87171' }}>Patient record not found.</div>;

  const history = patient.vitalsHistory || [];
  const latestVitals = history.length > 0 ? history[history.length - 1] : null;
  const previousVitals = history.length > 1 ? history[history.length - 2] : null;

  const currentScore = getPatientCurrentScore(patient);
  const currentStatus = getPatientCurrentStatus(patient);

  const riskChange = previousVitals ? latestVitals.sepsisRiskScore - previousVitals.sepsisRiskScore : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: 'grid', gap: '28px' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/patients')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', padding: '10px 16px', borderRadius: '10px' }}>
          <ArrowLeft size={16} /> Back to Patients
        </button>
        <PremiumButton onClick={() => setShowAssessmentModal(true)}>+ New Clinical Assessment</PremiumButton>
      </div>

      {/* Grid Header: Demographics & Risk Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.15)">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '55px', height: '55px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                    <User size={28} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc' }}>{patient.name}</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Patient ID: {patient.patientId}</p>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', fontSize: '0.9rem', background: 'rgba(7, 11, 25, 0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div><span style={{color: '#94a3b8'}}>Age:</span> <strong style={{color: '#f8fafc'}}>{patient.age}y</strong></div>
                <div><span style={{color: '#94a3b8'}}>Gender:</span> <strong style={{color: '#f8fafc'}}>{patient.gender}</strong></div>
                <div><span style={{color: '#94a3b8'}}>Status:</span> <StatusBadge status={currentStatus} /></div>
                <div><span style={{color: '#94a3b8'}}>Logs:</span> <strong style={{color: '#f8fafc'}}>{history.length}</strong></div>
            </div>

            <div style={{ background: 'rgba(7, 11, 25, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(6, 182, 212, 0.25)', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>Risk Assessment</span>
                {(() => {
                  const info = getRiskCategoryInfo(currentScore, currentStatus);
                  return (
                    <div style={{ background: info.bg, border: `1px solid ${info.border}`, borderRadius: '14px', padding: '18px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: info.color, marginBottom: '6px', letterSpacing: '0.5px' }}>
                        {info.category}
                      </div>
                      <p style={{ color: '#f8fafc', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
                        {info.explanation}
                      </p>
                    </div>
                  );
                })()}
                <TechnicalModelDetails score={currentScore} />
                {previousVitals && (
                    <div style={{ fontSize: '0.85rem', color: riskChange > 0 ? '#f87171' : '#34d399', fontWeight: '700', marginTop: '12px' }}>
                        {riskChange > 0 ? `▲ +${riskChange}% risk indicator shift` : riskChange < 0 ? `▼ ${riskChange}% risk indicator shift` : 'No risk shift'}
                    </div>
                )}
            </div>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(37, 99, 235, 0.15)">
          <ClinicalRiskTimeline history={history} />
        </SpotlightCard>
      </div>

      {/* Latest Vitals Parameter Summary Grid */}
      {latestVitals && (
        <GlassCard>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>Latest Clinical Parameter Telemetry (12 Features)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Heart Rate', val: latestVitals.heartRate !== undefined ? `${latestVitals.heartRate} bpm` : 'Not recorded', ref: '60-100', abnormal: latestVitals.heartRate > 100 || latestVitals.heartRate < 60 },
              { label: 'Temperature', val: latestVitals.temperature !== undefined ? `${latestVitals.temperature} °C` : 'Not recorded', ref: '36.5-37.5', abnormal: latestVitals.temperature > 38 || latestVitals.temperature < 36 },
              { label: 'Respiratory Rate', val: latestVitals.respiratoryRate !== undefined ? `${latestVitals.respiratoryRate} /min` : 'Not recorded', ref: '12-20', abnormal: latestVitals.respiratoryRate >= 22 },
              { label: 'Systolic BP', val: latestVitals.systolicBP !== undefined ? `${latestVitals.systolicBP} mmHg` : 'Not recorded', ref: '110-140', abnormal: latestVitals.systolicBP <= 100 },
              { label: 'Diastolic BP', val: latestVitals.diastolicBP !== undefined ? `${latestVitals.diastolicBP} mmHg` : 'Not recorded', ref: '70-90', abnormal: latestVitals.diastolicBP < 60 },
              { label: 'MAP', val: latestVitals.MAP !== undefined ? `${latestVitals.MAP} mmHg` : 'Not recorded', ref: '70-105', abnormal: latestVitals.MAP < 65 },
              { label: 'SpO2', val: latestVitals.oxygenSaturation !== undefined ? `${latestVitals.oxygenSaturation}%` : 'Not recorded', ref: '95-100', abnormal: latestVitals.oxygenSaturation < 92 },
              { label: 'Creatinine', val: latestVitals.Creatinine !== undefined ? `${latestVitals.Creatinine} mg/dL` : 'Not recorded', ref: '0.6-1.2', abnormal: latestVitals.Creatinine > 1.3 },
              { label: 'BUN', val: latestVitals.BUN !== undefined ? `${latestVitals.BUN} mg/dL` : 'Not recorded', ref: '7-20', abnormal: latestVitals.BUN > 20 },
              { label: 'WBC', val: latestVitals.WBC !== undefined ? `${latestVitals.WBC} k/uL` : 'Not recorded', ref: '4.5-11', abnormal: latestVitals.WBC > 12 || latestVitals.WBC < 4 },
              { label: 'Lactate', val: latestVitals.Lactate !== undefined ? `${latestVitals.Lactate} mmol/L` : 'Not recorded', ref: '0.5-2.0', abnormal: latestVitals.Lactate > 2.0 },
              { label: 'Patient Age', val: latestVitals.Age !== undefined ? `${latestVitals.Age} years` : 'Not recorded', ref: 'Adult', abnormal: false }
            ].map((p, idx) => (
              <SpotlightCard key={idx} spotlightColor={p.abnormal ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.15)'} style={{ padding: '16px', background: p.abnormal ? 'rgba(220, 38, 38, 0.1)' : 'rgba(7, 11, 25, 0.6)', border: `1px solid ${p.abnormal ? 'rgba(220, 38, 38, 0.35)' : 'rgba(6, 182, 212, 0.2)'}` }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>{p.label}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: p.abnormal ? '#f87171' : '#f8fafc', display: 'block', marginBottom: '4px' }}>{p.val}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Ref: {p.ref}</span>
              </SpotlightCard>
            ))}
          </div>
        </GlassCard>
      )}

      {/* AI Assessment Explanation / SHAP Model Contribution */}
      <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShieldAlert size={22} color="#06b6d4" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>AI Assessment Explanation (Model Contribution)</h3>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
            The following feature contributions indicate how individual clinical parameters increased or decreased the model&apos;s predicted sepsis risk during the latest assessment.
        </p>

        {latestVitals && latestVitals.featureImportance && Object.keys(latestVitals.featureImportance).length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
                {Object.entries(latestVitals.featureImportance).map(([feature, importance]) => (
                    <div key={feature} style={{ background: 'rgba(7, 11, 25, 0.7)', padding: '14px 20px', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.2)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ width: '170px', fontWeight: '700', fontSize: '0.9rem', color: '#f8fafc' }}>{featureMap[feature] || feature}</span>
                        <div style={{ flex: 1, height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                            <div style={{
                                height: '100%',
                                width: `${Math.min(Math.abs(importance) * 200, 100)}%`,
                                background: importance > 0 ? '#f87171' : '#34d399',
                                borderRadius: '5px'
                            }} />
                        </div>
                        <span style={{ width: '180px', textAlign: 'right', fontSize: '0.85rem', color: importance > 0 ? '#f87171' : '#34d399', fontWeight: '800' }}>
                            {importance > 0 ? 'Increases Risk (+)' : 'Decreases Risk (-)'} {Math.abs(importance).toFixed(3)}
                        </span>
                    </div>
                ))}
            </div>
        ) : (
            <div style={{ background: 'rgba(7, 11, 25, 0.6)', textAlign: 'center', padding: '30px', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <p style={{ color: '#94a3b8', margin: 0, fontWeight: '600' }}>No explainability data available for this reading. Submit a new clinical assessment above to generate SHAP values.</p>
            </div>
        )}
      </GlassCard>

      {/* Assessment History Timeline */}
      <GlassCard>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>Prediction History & Assessment Timeline</h3>
        {history.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
                {history.slice().reverse().map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(7, 11, 25, 0.7)', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '10px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '10px', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                                <Clock size={18} />
                            </div>
                            <div>
                                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#f8fafc' }}>{new Date(h.recordedAt).toLocaleString()}</span>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', fontWeight: '500' }}>
                                    HR: {h.heartRate !== undefined ? `${h.heartRate} bpm` : 'N/A'} | Temp: {h.temperature !== undefined ? `${h.temperature}°C` : 'N/A'} | MAP: {h.MAP !== undefined ? `${h.MAP} mmHg` : 'N/A'} | Lactate: {h.Lactate !== undefined ? `${h.Lactate} mmol/L` : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <StatusBadge status={h.status || (h.sepsisRiskScore >= 5 ? 'High Risk' : h.sepsisRiskScore >= 2 ? 'Moderate Risk' : 'Stable')} />
                        </div>
                    </div>
                ))}
            </div>
        ) : <p style={{ color: '#94a3b8' }}>No past assessments found.</p>}
      </GlassCard>

      {/* Modal for adding new assessment */}
      <Modal isOpen={showAssessmentModal} onClose={() => setShowAssessmentModal(false)} title="New Clinical Vitals Assessment">
        <PredictionForm 
          patientId={patient._id} 
          patientAge={patient.age} 
          onPredictionComplete={() => { fetchPatient(); setShowAssessmentModal(false); }} 
          onClinicalAlert={(pat, assessment) => {
            setClinicalReviewAlert({ patient: pat, assessment });
            setShowAssessmentModal(false);
            fetchPatient();
          }}
        />
      </Modal>

      {/* Clinical Review Required Modal */}
      <Modal isOpen={!!clinicalReviewAlert} onClose={() => setClinicalReviewAlert(null)} title="Clinical Review Required">
        <div style={{ padding: '10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', background: clinicalReviewAlert?.assessment?.status === 'High Risk' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(217, 119, 6, 0.15)', border: `1px solid ${clinicalReviewAlert?.assessment?.status === 'High Risk' ? 'rgba(220, 38, 38, 0.35)' : 'rgba(217, 119, 6, 0.35)'}`, padding: '16px', borderRadius: '12px' }}>
            <AlertTriangle size={28} color={clinicalReviewAlert?.assessment?.status === 'High Risk' ? '#f87171' : '#fbbf24'} />
            <div>
              <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem' }}>{clinicalReviewAlert?.patient?.name}</h4>
              <p style={{ margin: '4px 0 0 0', color: clinicalReviewAlert?.assessment?.status === 'High Risk' ? '#f87171' : '#fbbf24', fontWeight: 'bold' }}>Risk Category: {clinicalReviewAlert?.assessment?.status}</p>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
            A new clinical assessment completed on <strong>{clinicalReviewAlert ? new Date(clinicalReviewAlert.assessment.recordedAt).toLocaleString() : ''}</strong> has been classified as <strong style={{ color: clinicalReviewAlert?.assessment?.status === 'High Risk' ? '#f87171' : '#fbbf24' }}>{clinicalReviewAlert?.assessment?.status}</strong>. Please review the patient telemetry and SHAP risk drivers immediately.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <PremiumButton onClick={() => setClinicalReviewAlert(null)}>OK, Review Patient</PremiumButton>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

export default PatientProfile;
