import { useState, useEffect, useMemo } from 'react';
import { api, getPatientCurrentStatus, getPatientCurrentScore } from '../api';
import { GlassCard, SpotlightCard, StatusBadge, PremiumButton } from './ui/UIComponents';
import PatientForm from './PatientForm';
import { Modal } from './ui/Modal';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, UserPlus } from 'lucide-react';

function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const currentStatus = getPatientCurrentStatus(p);
      return (
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.patientId.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === 'All' || currentStatus === statusFilter)
      );
    }).sort((a, b) => getPatientCurrentScore(b) - getPatientCurrentScore(a));
  }, [patients, searchTerm, statusFilter]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="gradient-text" style={{ fontSize: '2rem', margin: 0, fontWeight: '800' }}>Patient Management</h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Active patient directory and real-time sepsis risk tracking.</p>
        </div>
        <PremiumButton onClick={() => setShowRegisterModal(true)}>
          <UserPlus size={18} /> Register Patient
        </PremiumButton>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by patient name or ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', background: 'rgba(7, 11, 25, 0.8)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#f8fafc', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0 20px', borderRadius: '12px', background: 'rgba(7, 11, 25, 0.8)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#f8fafc', fontWeight: '600', outline: 'none' }}>
          <option value="All">All Statuses</option>
          <option value="Stable">Stable</option>
          <option value="Moderate Risk">Moderate Risk</option>
          <option value="High Risk">High Risk</option>
        </select>
      </div>

      {loading ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading patient records...</p> : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredPatients.map(p => (
            <SpotlightCard 
              key={p._id} 
              spotlightColor="rgba(6, 182, 212, 0.15)"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '20px 24px', background: 'rgba(7, 11, 25, 0.65)' }} 
              onClick={() => navigate(`/patient/${p._id}`)}
            >
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc' }}>{p.name}</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>ID: {p.patientId} &bull; Age: {p.age}y &bull; Gender: {p.gender} &bull; Vitals Records: {p.vitalsHistory?.length || 0}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', textAlign: 'right' }}>
                <StatusBadge status={getPatientCurrentStatus(p)} />
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register New Patient">
        <PatientForm onPatientAdded={() => { fetchPatients(); setShowRegisterModal(false); }} onClose={() => setShowRegisterModal(false)} />
      </Modal>
    </motion.div>
  );
}

export default PatientsPage;
