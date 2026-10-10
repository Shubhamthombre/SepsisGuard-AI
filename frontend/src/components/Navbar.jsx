import { Link } from 'react-router-dom';
import { PremiumButton } from './ui/UIComponents';
import { Activity } from 'lucide-react';

const Navbar = () => (
  <nav className="navbar-glass" style={{ padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Link to="/" style={{ fontSize: '1.4rem', fontWeight: '800', textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <img src="/assets/sepsisguard-logo.png" alt="SepsisGuard AI Logo" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px' }} />
      SepsisGuard <span style={{ color: 'var(--accent-blue)' }}>AI</span>
    </Link>
    <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
      <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
      <Link to="/methodology" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '600' }}>Methodology</Link>
      <Link to="/login"><PremiumButton variant="secondary">Sign In</PremiumButton></Link>
      <Link to="/register"><PremiumButton>Get Started</PremiumButton></Link>
    </div>
  </nav>
);

export default Navbar;
