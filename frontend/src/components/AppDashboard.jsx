import { useState, useEffect } from 'react';
import { api, getPatientCurrentStatus, getPatientCurrentScore } from '../api';
import PatientForm from './PatientForm';
import PredictionForm from './PredictionForm';
import { GlassCard, SpotlightCard, MagicCard, StatusBadge, StatCard, PremiumButton } from './ui/UIComponents';
import { Modal } from './ui/Modal';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Users, Activity, ShieldAlert, ArrowRight, UserPlus, Clock } from 'lucide-react';

function AppDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const totalPatients = patients.length;
  const highRiskPatients = patients.filter(p => getPatientCurrentStatus(p) === 'High Risk');
  const moderateRiskPatients = patients.filter(p => getPatientCurrentStatus(p) === 'Moderate Risk');
  const highRiskCount = highRiskPatients.length;
  const totalAssessments = patients.reduce((acc, p) => acc + (p.vitalsHistory?.length || 0), 0);
  
  const patientsRequiringReviewCount = patients.filter(p => {
    const st = getPatientCurrentStatus(p);
    return st === 'Moderate Risk' || st === 'High Risk';
  }).length;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: 'grid', gap: 'var(--spacing-xl)' }}>
      {/* Header Banner */}
      <MagicCard style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 36px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderRadius: '20px', fontWeight: '700', fontSize: '0.75rem', marginBottom: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <Activity size={14} /> Active Clinical Command Center
          </div>
          <h2 className="gradient-text" style={{ fontSize: '2.2rem', margin: 0, fontWeight: '800' }}>Clinical Intelligence Dashboard</h2>
          <p style={{ color: '#94a3b8', margin: '8px 0 0 0', fontSize: '1rem' }}>Real-time sepsis risk stratification and 12-parameter patient telemetry monitoring.</p>
        </div>
        <PremiumButton onClick={() => setShowRegisterModal(true)} style={{ padding: '14px 28px' }}>
          <UserPlus size={18} /> Register Patient
        </PremiumButton>
      </MagicCard>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard title="Total Monitored Patients" value={totalPatients} color="#06b6d4" subtitle="Active in database" />
        <StatCard title="High Risk / Attention" value={highRiskCount} color="#f87171" subtitle="Requires immediate review" />
        <StatCard title="Total Assessments" value={totalAssessments} color="#60a5fa" subtitle="Recorded telemetry logs" />
        <StatCard title="Patients Requiring Review" value={patientsRequiringReviewCount} color={patientsRequiringReviewCount > 0 ? '#f87171' : '#34d399'} subtitle="Moderate or High Risk latest status" />
      </div>

      {/* Main Content Grid: Patients Overview & Clinical Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Monitored Patients Overview */}
        <GlassCard style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
              <Users size={20} color="#06b6d4" /> Monitored Patients Overview
            </h3>
            <button onClick={() => navigate('/patients')} style={{ background: 'transparent', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All Patients <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading patient records...</p>
          ) : patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <p>No patients registered in the system yet.</p>
              <PremiumButton onClick={() => setShowRegisterModal(true)} style={{ marginTop: '12px' }}>Register First Patient</PremiumButton>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {patients.slice(0, 6).map(p => (
                <SpotlightCard 
                  key={p._id} 
                  onClick={() => navigate(`/patient/${p._id}`)}
                  spotlightColor="rgba(6, 182, 212, 0.15)"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px 20px', 
                    background: 'rgba(7, 11, 25, 0.65)', 
                    borderRadius: '14px', 
                    border: '1px solid rgba(148, 163, 184, 0.2)', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease' 
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>{p.name}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>ID: {p.patientId} &bull; Age: {p.age}y &bull; {p.gender}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <StatusBadge status={getPatientCurrentStatus(p)} />
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Clinical Alerts Widget */}
        <GlassCard style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <AlertTriangle size={22} color="#f87171" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>Clinical Early Warnings</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.4' }}>
            <em>Research / Educational Early-Warning Guidance based on actual patient telemetry.</em>
          </p>

          {highRiskPatients.length > 0 || moderateRiskPatients.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {highRiskPatients.map(p => (
                <div key={p._id} style={{ padding: '16px', background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.35)', borderRadius: '12px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#f87171', marginBottom: '6px' }}>
                    <span>High Sepsis Risk</span>
                  </div>
                  <p style={{ margin: 0, color: '#f8fafc', lineHeight: '1.4' }}><strong>{p.name}</strong> requires immediate clinical review and reassessment.</p>
                </div>
              ))}
              {moderateRiskPatients.map(p => (
                <div key={p._id} style={{ padding: '16px', background: 'rgba(217, 119, 6, 0.15)', border: '1px solid rgba(217, 119, 6, 0.35)', borderRadius: '12px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#fbbf24', marginBottom: '6px' }}>
                    <span>Moderate Risk Watch</span>
                  </div>
                  <p style={{ margin: 0, color: '#f8fafc', lineHeight: '1.4' }}><strong>{p.name}</strong> shows elevated vital markers. Monitor closely.</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#34d399', background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.25)', borderRadius: '12px' }}>
              <p style={{ margin: 0, fontWeight: '700' }}>All monitored patients are currently stable.</p>
            </div>
          )}
        </GlassCard>
      </div>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register New Patient">
        <PatientForm onPatientAdded={() => { fetchPatients(); setShowRegisterModal(false); }} onClose={() => setShowRegisterModal(false)} />
      </Modal>
    </motion.div>
  );
}

export default AppDashboard;
