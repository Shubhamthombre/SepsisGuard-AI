import { useState, useEffect } from 'react';
import { api } from '../api';
import { GlassCard, SpotlightCard, StatusBadge } from './ui/UIComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, User } from 'lucide-react';

function HistoryPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getPatients();
        setPatients(data);
        if (data.length > 0) setSelectedPatient(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const history = selectedPatient?.vitalsHistory || [];
  const chartData = history.map(v => {
    const itemStatus = v.status || (v.sepsisRiskScore >= 5 ? 'High Risk' : v.sepsisRiskScore >= 2 ? 'Moderate Risk' : 'Stable');
    let riskLevel = 1;
    if (itemStatus === 'Moderate Risk') riskLevel = 2;
    else if (itemStatus === 'High Risk' || itemStatus === 'Sepsis Confirmed') riskLevel = 3;
    else riskLevel = 1;

    return {
      time: new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullDate: new Date(v.recordedAt).toLocaleString(),
      riskLevel,
      status: itemStatus
    };
  });

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading history records...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="gradient-text" style={{ fontSize: '2rem', margin: 0, fontWeight: '800' }}>History & Longitudinal Trends</h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Review temporal risk progression and telemetry history across patients.</p>
        </div>
        <select 
          value={selectedPatient?._id || ''}
          onChange={(e) => setSelectedPatient(patients.find(p => p._id === e.target.value))}
          style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(7, 11, 25, 0.8)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#f8fafc', fontWeight: '600', outline: 'none' }}
        >
          {patients.map(p => <option key={p._id} value={p._id}>{p.name} (ID: {p.patientId})</option>)}
        </select>
      </div>

      {selectedPatient ? (
        <>
          <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.15)">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>
              <TrendingUp size={20} color="#06b6d4" /> Sepsis Risk Progression: {selectedPatient.name}
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 11}} />
                  <YAxis 
                    domain={[1, 3]} 
                    ticks={[1, 2, 3]} 
                    tickFormatter={(val) => {
                      if (val === 1) return 'Stable';
                      if (val === 2) return 'Moderate Risk';
                      if (val === 3) return 'High Risk';
                      return '';
                    }}
                    stroke="#94a3b8" 
                    tick={{fill: '#94a3b8', fontSize: 11}} 
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ background: 'rgba(7, 11, 25, 0.95)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', padding: '10px 14px', color: '#f8fafc' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: '#94a3b8' }}>{data.fullDate}</p>
                            <p style={{ margin: 0, fontWeight: '700', color: data.status === 'High Risk' || data.status === 'Sepsis Confirmed' ? '#f87171' : data.status === 'Moderate Risk' ? '#fbbf24' : '#34d399' }}>
                              Risk Category: {data.status}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="riskLevel" stroke="#06b6d4" strokeWidth={3} dot={{fill: '#06b6d4', r: 5}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No telemetry data recorded for this patient yet.</p>
            )}
          </SpotlightCard>

          <GlassCard>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>Detailed Assessment Log</h3>
            {history.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {history.slice().reverse().map((h, idx) => {
                  const itemStatus = h.status || (h.sepsisRiskScore >= 5 ? 'High Risk' : h.sepsisRiskScore >= 2 ? 'Moderate Risk' : 'Stable');
                  return (
                    <SpotlightCard key={idx} spotlightColor="rgba(37, 99, 235, 0.15)" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(7, 11, 25, 0.65)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ padding: '10px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '10px', color: '#06b6d4' }}>
                          <Clock size={18} />
                        </div>
                        <div>
                          <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#f8fafc' }}>{new Date(h.recordedAt).toLocaleString()}</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                            HR: {h.heartRate} bpm | Temp: {h.temperature}°C | Resp: {h.respiratoryRate} | MAP: {h.MAP} mmHg | Lactate: {h.Lactate} mmol/L
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <StatusBadge status={itemStatus} />
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            ) : <p style={{ color: '#94a3b8' }}>No records available.</p>}
          </GlassCard>
        </>
      ) : (
        <GlassCard style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <p>Please select a patient to view telemetry history.</p>
        </GlassCard>
      )}
    </motion.div>
  );
}

export default HistoryPage;
