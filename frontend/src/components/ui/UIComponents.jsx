import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';

export const GlassCard = ({ children, className = '', style = {}, ...props }) => (
  <motion.div 
    whileHover={{ y: -3, boxShadow: '0 20px 40px -10px rgba(6, 182, 212, 0.25)' }}
    transition={{ duration: 0.2 }}
    className={`glass-card ${className}`}
    style={{ 
      background: 'rgba(11, 19, 43, 0.78)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(6, 182, 212, 0.22)',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      position: 'relative',
      overflow: 'hidden',
      color: '#f8fafc',
      ...style 
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const SpotlightCard = ({ children, className = '', style = {}, spotlightColor = 'rgba(6, 182, 212, 0.15)', ...props }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={{ y: -3, boxShadow: '0 20px 45px -10px rgba(37, 99, 235, 0.3)' }}
      className={`glass-card ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(11, 19, 43, 0.8)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.4)',
        color: '#f8fafc',
        ...style
      }}
      {...props}
    >
      <motion.div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.9,
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `
        }}
      />
      {children}
    </motion.div>
  );
};

export const MagicCard = ({ children, className = '', style = {}, ...props }) => {
  return (
    <SpotlightCard spotlightColor="rgba(37, 99, 235, 0.2)" style={{ border: '1px solid rgba(37, 99, 235, 0.3)', ...style }} {...props}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)' }} />
      {children}
    </SpotlightCard>
  );
};

export const BorderBeam = ({ size = 200, duration = 6, colorFrom = '#2563eb', colorTo = '#06b6d4' }) => (
  <div style={{
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    border: '1px solid transparent',
    maskImage: 'linear-gradient(white, white)',
    WebkitMaskImage: 'linear-gradient(white, white)',
  }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute',
        top: `-${size / 2}px`,
        left: `-${size / 2}px`,
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${colorFrom} 90deg, ${colorTo} 180deg, transparent 270deg)`,
        opacity: 0.75
      }}
    />
  </div>
);

export const NumberTicker = ({ value, duration = 1.5 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (start === end) return;

    let totalFrames = Math.round((duration * 1000) / 16);
    let step = (end - start) / totalFrames;
    let current = start;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      current += step;
      if (frame >= totalFrames) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

export const StatCard = ({ title, value, color = 'var(--accent-cyan)', subtitle }) => (
  <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.2)">
    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: color, borderRadius: '4px 0 0 4px' }} />
    <p style={{ margin: '0 0 8px 4px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
    <h3 style={{ margin: '0 0 4px 4px', fontSize: '2.4rem', fontWeight: '800', color: color }}>
      <NumberTicker value={typeof value === 'string' ? parseInt(value) || 0 : value} />
      {typeof value === 'string' && value.includes('%') ? '%' : ''}
    </h3>
    {subtitle && <p style={{ margin: '4px 0 0 4px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>{subtitle}</p>}
  </SpotlightCard>
);

export const ClinicalInput = ({ label, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '700' }}>{label}</label>
    <input 
      {...props}
      style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px 16px', borderRadius: '12px', color: '#f8fafc', width: '100%', boxSizing: 'border-box', fontSize: '0.95rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
      onFocus={(e) => {
        e.target.style.borderColor = '#06b6d4';
        e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.25)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'rgba(6, 182, 212, 0.3)';
        e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      }}
    />
  </div>
);

export const StatusBadge = ({ status }) => {
  const colors = {
    'Stable': { bg: 'rgba(5, 150, 105, 0.2)', text: '#34d399', border: 'rgba(5, 150, 105, 0.4)' },
    'Moderate Risk': { bg: 'rgba(217, 119, 6, 0.2)', text: '#fbbf24', border: 'rgba(217, 119, 6, 0.4)' },
    'High Risk': { bg: 'rgba(220, 38, 38, 0.2)', text: '#f87171', border: 'rgba(220, 38, 38, 0.4)' },
    'Sepsis Confirmed': { bg: 'rgba(15, 23, 42, 0.4)', text: '#ffffff', border: 'rgba(255, 255, 255, 0.3)' }
  };

  const scheme = colors[status] || { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8', border: 'rgba(100, 116, 139, 0.4)' };

  return (
    <span style={{ 
      padding: '6px 14px', 
      borderRadius: '20px', 
      background: scheme.bg, 
      color: scheme.text,
      border: `1px solid ${scheme.border}`,
      fontWeight: '700',
      fontSize: '0.75rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      letterSpacing: '0.3px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: scheme.text, boxShadow: `0 0 8px ${scheme.text}` }} />
      {status}
    </span>
  );
};

export const PremiumButton = ({ children, variant = 'primary', ...props }) => (
  <motion.button 
    whileTap={{ scale: 0.97 }}
    whileHover={{ scale: 1.02, boxShadow: variant === 'primary' ? '0 8px 25px rgba(6, 182, 212, 0.4)' : '0 6px 20px rgba(37, 99, 235, 0.25)' }}
    style={{
      background: variant === 'primary' ? 'linear-gradient(135deg, #2563eb, #06b6d4)' : 'rgba(15, 23, 42, 0.8)',
      border: variant === 'primary' ? 'none' : '1px solid rgba(6, 182, 212, 0.4)',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '0.9rem',
      boxShadow: variant === 'primary' ? '0 4px 15px rgba(37, 99, 235, 0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    }}
    {...props}
  >
    {children}
  </motion.button>
);

export const AnimatedCircularProgressBar = ({ value = 0, size = 160, strokeWidth = 14, primaryColor = '#06b6d4' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={value >= 5 ? '#f87171' : value >= 2.5 ? '#fbbf24' : primaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f8fafc' }}><NumberTicker value={Math.round(value)} />%</span>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Risk Score</span>
      </div>
    </div>
  );
};

export const getRiskCategoryInfo = (score, status) => {
  const resolvedStatus = status || (score >= 5 ? 'High Risk' : score >= 2 ? 'Moderate Risk' : 'Stable');

  if (resolvedStatus === 'High Risk' || resolvedStatus === 'Sepsis Confirmed') {
    return {
      category: 'HIGH RISK',
      explanation: 'The model indicates an elevated-risk pattern requiring attention.',
      color: '#f87171',
      bg: 'rgba(220, 38, 38, 0.15)',
      border: 'rgba(220, 38, 38, 0.35)'
    };
  } else if (resolvedStatus === 'Moderate Risk') {
    return {
      category: 'MODERATE RISK',
      explanation: 'The model indicates an intermediate-risk pattern requiring closer observation.',
      color: '#fbbf24',
      bg: 'rgba(217, 119, 6, 0.15)',
      border: 'rgba(217, 119, 6, 0.35)'
    };
  } else {
    return {
      category: 'STABLE',
      explanation: 'The model currently indicates a stable, lower-risk pattern.',
      color: '#34d399',
      bg: 'rgba(5, 150, 105, 0.15)',
      border: 'rgba(5, 150, 105, 0.35)'
    };
  }
};

export const TechnicalModelDetails = ({ score }) => {
  const [showDetails, setShowDetails] = useState(false);
  const num = parseFloat(score) || 0;
  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid rgba(148, 163, 184, 0.2)', paddingTop: '12px' }}>
      <button 
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
      >
        {showDetails ? 'Hide Model Details ▲' : 'Model Details ▼'}
      </button>
      {showDetails && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '10px', background: 'rgba(7, 11, 25, 0.7)', padding: '12px', borderRadius: '10px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'left', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontWeight: '600', color: '#f8fafc' }}>Raw model output:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#06b6d4' }}>{num.toFixed(2)}%</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontStyle: 'italic', color: '#94a3b8', lineHeight: '1.4' }}>
            Uncalibrated model output; not a clinical probability.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export const ClinicalRiskTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No clinical assessments recorded yet.</p>;
  }

  const sortedHistory = [...history].reverse(); // Latest first

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Clinical Risk Progression
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
          Risk classification across successive clinical assessments
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#06b6d4', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <span>Latest</span>
        <span>↓</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '24px' }}>
        {sortedHistory.map((h, index) => {
          const itemStatus = h.status || (h.sepsisRiskScore >= 5 ? 'High Risk' : h.sepsisRiskScore >= 2 ? 'Moderate Risk' : 'Stable');
          const info = getRiskCategoryInfo(h.sepsisRiskScore || 0, itemStatus);
          const isLatest = index === 0;
          const assessmentNum = history.length - index;
          const recordedDate = new Date(h.recordedAt);
          const dateStr = !isNaN(recordedDate.getTime()) 
            ? `${recordedDate.toLocaleDateString()} • ${recordedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'N/A';

          return (
            <div key={index} style={{ position: 'relative', paddingBottom: index < sortedHistory.length - 1 ? '20px' : '0' }}>
              {/* Vertical connector line */}
              {index < sortedHistory.length - 1 && (
                <div style={{ position: 'absolute', left: '-13px', top: '16px', bottom: '-12px', width: '2px', background: 'rgba(148, 163, 184, 0.25)' }} />
              )}
              {/* Circular marker */}
              <div style={{
                position: 'absolute',
                left: '-19px',
                top: '5px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: info.color,
                boxShadow: isLatest ? `0 0 10px ${info.color}` : 'none',
                border: '2px solid #0b132b',
                zIndex: 2
              }} />

              {/* Assessment Card */}
              <div style={{
                background: isLatest ? 'rgba(7, 11, 25, 0.85)' : 'rgba(7, 11, 25, 0.55)',
                border: `1px solid ${isLatest ? info.border : 'rgba(148, 163, 184, 0.2)'}`,
                borderRadius: '12px',
                padding: '14px 18px',
                boxShadow: isLatest ? `0 4px 20px -4px ${info.color}33` : 'none',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: info.bg,
                      color: info.color,
                      border: `1px solid ${info.border}`,
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      letterSpacing: '0.5px'
                    }}>
                      {info.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                      Assessment #{assessmentNum}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
                    {dateStr}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '600', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <span>HR: <strong style={{ color: '#06b6d4' }}>{h.heartRate !== undefined ? h.heartRate : 'N/A'}</strong></span>
                  <span style={{ color: 'rgba(148,163,184,0.4)' }}>•</span>
                  <span>Temp: <strong style={{ color: '#06b6d4' }}>{h.temperature !== undefined ? `${h.temperature}°C` : 'N/A'}</strong></span>
                  <span style={{ color: 'rgba(148,163,184,0.4)' }}>•</span>
                  <span>MAP: <strong style={{ color: '#06b6d4' }}>{h.MAP !== undefined ? h.MAP : 'N/A'}</strong></span>
                  <span style={{ color: 'rgba(148,163,184,0.4)' }}>•</span>
                  <span>Lactate: <strong style={{ color: '#06b6d4' }}>{h.Lactate !== undefined ? h.Lactate : 'N/A'}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
