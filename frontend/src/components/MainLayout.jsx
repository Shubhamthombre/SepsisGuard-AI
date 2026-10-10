import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { User, Activity, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GradientWaves from './ui/GradientWaves';

const MainLayout = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    api.logout();
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Patients', path: '/patients' },
    { name: 'History', path: '/history' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Methodology', path: '/methodology' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <div className="layout-container" style={{ minHeight: '100vh', position: 'relative', color: '#f8fafc' }}>
      <GradientWaves />
      
      <header className="navbar-glass" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 40px', 
        background: 'rgba(7, 11, 25, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(6, 182, 212, 0.25)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '10px', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <Activity size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.5px' }}>SepsisGuard <span style={{ color: '#06b6d4' }}>AI</span></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#34d399', fontWeight: '700' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} /> System Online
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === item.path ? '#06b6d4' : '#94a3b8', 
                fontWeight: location.pathname === item.path ? '700' : '600',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
                textShadow: location.pathname === item.path ? '0 0 12px rgba(6, 182, 212, 0.5)' : 'none'
              }}
            >
              {item.name}
            </Link>
          ))}
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#e2e8f0', fontWeight: '600' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: '700', border: '1px solid rgba(37, 99, 235, 0.4)' }}>
                {user?.name?.[0] || 'C'}
              </div>
              {user?.name || 'Clinician'}
            </div>
            <button onClick={handleLogout} style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#f87171', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </nav>
      </header>
      
      <main className="dashboard-container" style={{ padding: '36px 40px', maxWidth: '1340px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.99 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MainLayout;
