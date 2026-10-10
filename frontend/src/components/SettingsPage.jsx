import { useState } from 'react';
import { GlassCard, PremiumButton } from './ui/UIComponents';
import { motion } from 'framer-motion';

function SettingsPage() {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="gradient-text">Settings & Profile</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <GlassCard>
          <h4>Profile Information</h4>
          <p style={{color: 'var(--text-muted)'}}><strong>Name:</strong> {user?.name || 'N/A'}</p>
          <p style={{color: 'var(--text-muted)'}}><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p style={{color: 'var(--text-muted)'}}><strong>Role:</strong> {user?.role || 'N/A'}</p>
        </GlassCard>

        <GlassCard>
          <h4>Application Preferences</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span>Enable Dark Mode</span>
            <input type="checkbox" disabled checked style={{cursor: 'not-allowed'}} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Email Notifications</span>
            <input type="checkbox" defaultChecked />
          </div>
          <PremiumButton style={{ marginTop: '20px', width: '100%' }}>Save Preferences</PremiumButton>
        </GlassCard>
      </div>
    </motion.div>
  );
}

export default SettingsPage;
