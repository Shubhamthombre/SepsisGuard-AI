import { useState, useEffect } from 'react';
import { api, getPatientCurrentStatus, getPatientCurrentScore } from '../api';
import { GlassCard, SpotlightCard, StatCard } from './ui/UIComponents';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Database, Cpu } from 'lucide-react';

function AnalyticsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getPatients();
        setPatients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalPatients = patients.length;
  const highRiskCount = patients.filter(p => getPatientCurrentStatus(p) === 'High Risk').length;
  const moderateRiskCount = patients.filter(p => getPatientCurrentStatus(p) === 'Moderate Risk').length;
  const stableCount = patients.filter(p => getPatientCurrentStatus(p) === 'Stable').length;
  const totalAssessments = patients.reduce((acc, p) => acc + (p.vitalsHistory?.length || 0), 0);
  const avgRisk = totalPatients > 0 
    ? (patients.reduce((acc, p) => acc + getPatientCurrentScore(p), 0) / totalPatients).toFixed(1)
    : 0;

  const statusData = [
    { name: 'Stable', value: stableCount },
    { name: 'Moderate Risk', value: moderateRiskCount },
    { name: 'High Risk', value: highRiskCount },
  ];
  const COLORS = ['#34d399', '#fbbf24', '#f87171'];

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading analytics...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h2 className="gradient-text" style={{ fontSize: '2rem', margin: 0, fontWeight: '800' }}>Clinical Intelligence & Model Analytics</h2>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Comprehensive population health statistics and model methodology.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard title="Total Patients" value={totalPatients} color="#06b6d4" />
        <StatCard title="Total Assessments" value={totalAssessments} color="#60a5fa" />
        <StatCard title="High Risk Patients" value={highRiskCount} color="#f87171" />
        <StatCard title="Population Avg Risk" value={`${avgRisk}%`} color={avgRisk > 40 ? '#f87171' : '#34d399'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.15)">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>Patient Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{fill: '#f8fafc', fontSize: 12}}>
                        {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(7, 11, 25, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', color: '#f8fafc' }} />
                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                </PieChart>
            </ResponsiveContainer>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(37, 99, 235, 0.15)">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>Risk Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 11}} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: 'rgba(7, 11, 25, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', color: '#f8fafc' }} />
                    <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </SpotlightCard>
      </div>

      {/* Methodology & Model Insights Section */}
      <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Cpu size={22} color="#06b6d4" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>Methodology & Model Architecture</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '0.9rem' }}>
          <div>
            <h4 style={{ color: '#06b6d4', margin: '0 0 8px 0', fontSize: '1.05rem' }}>Dataset & Preprocessing</h4>
            <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: '0 0 16px 0' }}>
              Trained and validated on the <strong>PhysioNet 2019 Early Prediction of Sepsis Challenge</strong> dataset. Data preprocessing includes patient-level stratified splitting, missing value imputation, and feature normalization to prevent data leakage.
            </p>
            <h4 style={{ color: '#06b6d4', margin: '20px 0 8px 0', fontSize: '1.05rem' }}>Supported Clinical Features (12)</h4>
            <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
              Heart Rate, Temperature, Respiratory Rate, Systolic BP, Diastolic BP, Mean Arterial Pressure (MAP), SpO2, Serum Creatinine, Blood Urea Nitrogen (BUN), White Blood Cell Count (WBC), Blood Lactate, and Age.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#06b6d4', margin: '0 0 8px 0', fontSize: '1.05rem' }}>Model & Explainable AI (SHAP)</h4>
            <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: '0 0 16px 0' }}>
              Employs a robust <strong>RandomForestClassifier</strong> optimized with class weighting for imbalanced clinical events. Integrated with <code>shap.TreeExplainer</code> to generate granular feature contributions for every prediction.
            </p>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '16px', borderRadius: '12px', marginTop: '20px' }}>
              <span style={{ fontWeight: 'bold', color: '#f87171', display: 'block', marginBottom: '6px' }}>Clinical Disclaimer</span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#f8fafc', lineHeight: '1.5' }}>
                SepsisGuard AI is an educational research prototype. It is not FDA-cleared, clinically validated, or intended for autonomous diagnosis or treatment decisions.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default AnalyticsPage;
