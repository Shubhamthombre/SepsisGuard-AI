import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api';
import { GlassCard, PremiumButton, BorderBeam } from './ui/UIComponents';
import GradientWaves from './ui/GradientWaves';
import { Activity, ShieldCheck } from 'lucide-react';

const AuthForm = ({ type, onAuthSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (type === 'login') {
        await api.login(formData.email, formData.password);
      } else {
        await api.register(formData.name, formData.email, formData.password);
      }
      onAuthSuccess();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', color: '#f8fafc', overflow: 'hidden' }}>
      <GradientWaves />

      {/* Visual Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', zIndex: 1 }}>
        <div style={{ maxWidth: '500px', textAlign: 'left', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <div style={{ 
              background: '#ffffff', 
              width: '270px',
              height: '160px',
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxSizing: 'border-box'
            }}>
              <img 
                src="/assets/sepsisguard-logo.png" 
                alt="SepsisGuard AI Logo" 
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block' }} 
              />
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem', marginBottom: '20px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <Activity size={16} /> Secure Clinical Portal
          </div>
          <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
            SepsisGuard <span style={{ color: '#06b6d4' }}>AI</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
            Advanced 12-parameter clinical telemetry monitoring, real-time machine learning risk stratification, and transparent SHAP model explainability.
          </p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#34d399', fontWeight: '700' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={18} /> HIPAA Aligned Protocol</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={18} /> PhysioNet 2019 Validated</span>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', zIndex: 1 }}>
        <GlassCard style={{ width: '100%', maxWidth: '420px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
          <BorderBeam size={250} duration={8} />
          
          <h2 style={{ marginBottom: '8px', color: '#f8fafc', fontSize: '1.8rem', fontWeight: '800' }}>
            {type === 'login' ? 'Clinician Sign In' : 'Create Account'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
            {type === 'login' ? 'Enter your credentials to access the clinical intelligence dashboard.' : 'Register a new clinician profile to begin monitoring patients.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {type === 'register' && (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0' }}>Full Name</label>
                <input name="name" placeholder="Dr. Alex Morgan" onChange={(e) => setFormData({...formData, name: e.target.value})} required 
                  style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px 16px', borderRadius: '12px', color: '#f8fafc', width: '100%', boxSizing: 'border-box', outline: 'none' }}/>
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0' }}>Email Address</label>
              <input name="email" type="email" placeholder="clinician@hospital.org" onChange={(e) => setFormData({...formData, email: e.target.value})} required 
                style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px 16px', borderRadius: '12px', color: '#f8fafc', width: '100%', boxSizing: 'border-box', outline: 'none' }}/>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0' }}>Password</label>
              <input name="password" type="password" placeholder="••••••••" onChange={(e) => setFormData({...formData, password: e.target.value})} required 
                style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px 16px', borderRadius: '12px', color: '#f8fafc', width: '100%', boxSizing: 'border-box', outline: 'none' }}/>
            </div>
            
            <PremiumButton type="submit" disabled={loading} style={{ marginTop: '10px', width: '100%', padding: '14px' }}>
              {loading ? 'Authenticating...' : (type === 'login' ? 'Access Dashboard' : 'Complete Registration')}
            </PremiumButton>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '24px', color: '#94a3b8', fontSize: '0.9rem' }}>
            {type === 'login' ? "Don't have a clinician account?" : "Already registered?"}{' '}
            <Link to={type === 'login' ? '/register' : '/login'} style={{ color: '#06b6d4', fontWeight: '700', textDecoration: 'none' }}>
              {type === 'login' ? 'Register now' : 'Sign in'}
            </Link>
          </p>
          
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '10px', background: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.4)', borderRadius: '8px', color: '#f87171', textAlign: 'center', marginTop: '15px', fontSize: '0.85rem', fontWeight: '600' }}>{error}</motion.div>}
        </GlassCard>
      </div>
    </div>
  );
};

export default AuthForm;
