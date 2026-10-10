import { useState, useEffect } from 'react';
import { api } from '../api';
import { GlassCard, StatusBadge } from './ui/UIComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const PatientDetails = ({ patientId, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await api.getPatientById(patientId);
        setPatient(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [patientId]);

  if (loading) return <div className="glass-card" style={{position: 'fixed', inset: '20px', zIndex: 1000}}>Loading...</div>;
  if (!patient) return <div className="glass-card" style={{position: 'fixed', inset: '20px', zIndex: 1000}}>Failed to load patient.</div>;

  const chartData = patient.vitalsHistory.map(v => ({
    time: new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    risk: v.sepsisRiskScore,
    hr: v.heartRate,
    spo2: v.oxygenSaturation
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: '0', zIndex: 1000, background: 'rgba(0,0,0,0.5)', padding: '20px', overflowY: 'auto' }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button className="secondary" onClick={onClose} style={{ marginBottom: '10px' }}>Close</button>
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{patient.name}</h2>
            <StatusBadge status={patient.status} />
          </div>
          <p>ID: {patient.patientId} | Age: {patient.age} | Gender: {patient.gender}</p>
          <p><strong>Current Risk Score:</strong> {patient.sepsisRiskScore}%</p>
        </GlassCard>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <GlassCard>
            <h4>Sepsis Risk Trend</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="risk" stroke="var(--alert-red)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard>
            <h4>Vital Trends (HR / SpO2)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hr" stroke="var(--accent-blue)" />
                <Line type="monotone" dataKey="spo2" stroke="var(--success-green)" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientDetails;
