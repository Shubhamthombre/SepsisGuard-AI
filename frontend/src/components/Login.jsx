import { useState } from 'react';
import { api } from '../api';

const Login = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegistering) {
        await api.register(formData.name, formData.email, formData.password);
      } else {
        await api.login(formData.email, formData.password);
      }
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container card">
      <h2>{isRegistering ? 'Register Clinician' : 'SepsisGuard AI'}</h2>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        )}
        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        <button type="submit" style={{width: '100%'}}>{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)} style={{background: 'none', color: 'var(--primary)', marginTop: '10px'}}>
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
};

export default Login;
