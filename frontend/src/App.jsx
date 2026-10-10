import { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AuthForm from './components/AuthForm';
import MethodologyPage from './components/MethodologyPage';
import './App.css';

const LandingPage = lazy(() => import('./components/LandingPage'));
const AppDashboard = lazy(() => import('./components/AppDashboard'));
const PatientsPage = lazy(() => import('./components/PatientsPage'));
const PatientProfile = lazy(() => import('./components/PatientProfile'));
const HistoryPage = lazy(() => import('./components/HistoryPage'));
const AnalyticsPage = lazy(() => import('./components/AnalyticsPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleAuthSuccess = () => {
    setUser(JSON.parse(localStorage.getItem('user')));
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading SepsisGuard AI...</div>}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthForm type="login" onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <AuthForm type="register" onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          
          <Route path="/" element={user ? <MainLayout onLogout={handleLogout} /> : <Navigate to="/login" />}>
            <Route path="dashboard" element={<AppDashboard />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patient/:id" element={<PatientProfile />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="methodology" element={<MethodologyPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
