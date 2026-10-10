import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassCard, PremiumButton } from './ui/UIComponents';
import Navbar from './Navbar';
import MedicalShield3D from './MedicalShield3D';
import { Activity, ShieldCheck, Cpu, TrendingUp, Users, AlertCircle, ArrowRight, CheckCircle, Database, Lock, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f172a', overflowX: 'hidden', fontFamily: 'var(--font-family)' }}>
      <Navbar />

      {/* 1. CINEMATIC HERO SECTION */}
      <section style={{ 
        minHeight: 'calc(100vh - 80px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '40px', 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '60px 40px',
        position: 'relative'
      }}>
        {/* Background glow orb */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(6, 182, 212, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          style={{ flex: 1, zIndex: 1 }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            background: 'rgba(37, 99, 235, 0.08)', 
            color: 'var(--accent-blue)', 
            borderRadius: '30px', 
            fontWeight: '700', 
            fontSize: '0.85rem', 
            marginBottom: '24px',
            border: '1px solid rgba(37, 99, 235, 0.15)'
          }}>
            <Activity size={16} /> Next-Generation Clinical Intelligence
          </div>
          
          <h1 style={{ fontSize: '4rem', lineHeight: '1.08', marginBottom: '24px', fontWeight: '800', letterSpacing: '-1px' }} className="gradient-text">
            Predict Sepsis<br />Before Critical Onset.
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '36px', maxWidth: '600px' }}>
            Empowering healthcare professionals with real-time AI risk stratification, 12-parameter telemetry telemetry monitoring, and transparent SHAP explainability.
          </p>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link to="/register">
              <PremiumButton style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Launch Platform <ArrowRight size={18} />
              </PremiumButton>
            </Link>
            <Link to="/login">
              <PremiumButton variant="secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Clinician Sign In
              </PremiumButton>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '30px', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-blue)' }}>12 Parameters</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vitals & Lab Telemetry</p>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>PhysioNet 2019</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Validated Challenge Data</p>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--success)' }}>Real-Time XAI</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SHAP TreeExplainer</p>
            </div>
          </div>
        </motion.div>

        {/* 3D Interactive Medical Shield Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: '28px',
            padding: '20px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08)',
            width: '100%',
            maxWidth: '500px'
          }}>
            <MedicalShield3D />
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Interactive 3D Holographic Medical Intelligence Core</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. HOW SEPSISGUARD WORKS */}
      <section style={{ padding: '100px 40px', background: '#ffffff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: 'var(--accent-blue)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Seamless Clinical Workflow</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '8px' }}>How SepsisGuard Works</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '12px auto 0 auto' }}>Three streamlined steps from patient telemetry intake to explainable AI risk stratification.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
            <GlassCard style={{ padding: '36px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>01</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px' }}>Clinical Telemetry Intake</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Clinicians record patient vitals, hemodynamic parameters, and lab results across 12 verified clinical features with instant reference range validation.</p>
            </GlassCard>

            <GlassCard style={{ padding: '36px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>02</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px' }}>FastAPI ML Inference</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>The high-performance Python FastAPI service evaluates the feature vector using our optimized RandomForest classifier trained on PhysioNet 2019 data.</p>
            </GlassCard>

            <GlassCard style={{ padding: '36px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>03</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px' }}>Explainable XAI & Alerts</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Shapley (SHAP) values break down exactly how each parameter contributes to the risk score, accompanied by automated early-warning alerts.</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 3. EXPLAINABLE AI / SHAP & RISK PREDICTION */}
      <section style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Absolute Transparency</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '8px', marginBottom: '20px' }}>Explainable AI Powered by SHAP</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '24px' }}>
              Black-box AI is unacceptable in critical healthcare environments. SepsisGuard AI utilizes TreeExplainer to calculate precise feature contributions for every single prediction.
            </p>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                'Granular breakdown of positive and negative risk drivers',
                'Clear "Model contribution" metrics for all 12 parameters',
                'Zero black-box obscurity — clinicians see why risk is elevated',
                'Fully integrated with MongoDB vitals history tracking'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: '600' }}>
                  <CheckCircle size={20} color="var(--success)" /> {item}
                </div>
              ))}
            </div>
          </div>

          <GlassCard style={{ padding: '30px', background: '#ffffff' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>Sample Model Contribution View</h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { name: 'Respiratory Rate', val: '+0.245', color: 'var(--danger)' },
                { name: 'Blood Lactate', val: '+0.182', color: 'var(--danger)' },
                { name: 'Heart Rate', val: '+0.095', color: 'var(--danger)' },
                { name: 'Oxygen Saturation', val: '-0.110', color: 'var(--success)' },
                { name: 'Mean Arterial Pressure', val: '-0.145', color: 'var(--success)' }
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: '10px' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{f.name}</span>
                  <span style={{ fontWeight: '700', color: f.color, fontSize: '0.9rem' }}>{f.val}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 4. TECHNOLOGY STACK & RESEARCH DISCLAIMER */}
      <section style={{ padding: '80px 40px', background: '#ffffff', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '15px' }}>Production-Ready Tech Stack</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Built using robust, industry-standard modern web and machine learning frameworks.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '60px' }}>
            {['React 19', 'Vite', 'Node.js Express', 'Python FastAPI', 'MongoDB & Mongoose', 'Scikit-Learn', 'SHAP', 'Recharts', 'Framer Motion', 'Three.js / R3F'].map((tech, i) => (
              <div key={i} style={{ padding: '10px 20px', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-blue)' }}>
                {tech}
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(220, 38, 38, 0.04)', border: '1px solid rgba(220, 38, 38, 0.15)', borderRadius: '16px', padding: '30px', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', fontWeight: '700', marginBottom: '10px' }}>
              <AlertCircle size={20} /> Research / Educational Prototype Disclaimer
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              SepsisGuard AI is developed exclusively as a final-year engineering research and educational prototype. It is not FDA-cleared, clinically validated, or certified for autonomous medical diagnosis, treatment planning, or clinical decision-making. Always consult qualified healthcare professionals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
