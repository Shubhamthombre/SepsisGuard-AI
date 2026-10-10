/**
 * API Service for SepsisGuard AI
 * Handles communication between React Frontend and Express Backend
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Helper to get headers with JWT token if available
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // --- AUTHENTICATION ---
  
  /**
   * Register a new clinician
   */
  register: async (name, email, password, role = 'doctor') => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Save token and user details to localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      }));
    }
    return data;
  },

  /**
   * Log in an existing clinician
   */
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Save token and user details to localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      }));
    }
    return data;
  },

  /**
   * Log out the current clinician
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current logged-in user profile from backend
   */
  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await res.ok ? await res.json() : null;
    if (!res.ok && res.status === 401) {
      // Clear expired/invalid session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return data;
  },

  // --- PATIENT MANAGEMENT ---

  /**
   * Fetch all patients
   */
  getPatients: async () => {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch patients');
    }
    return data;
  },

  /**
   * Fetch patient details by ID
   */
  getPatientById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch patient details');
    }
    return data;
  },

  /**
   * Create a new patient
   */
  createPatient: async (patientData) => {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(patientData),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to register patient');
    }
    return data;
  },

  /**
   * Update patient details
   */
  updatePatient: async (id, patientData) => {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(patientData),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update patient');
    }
    return data;
  },

  /**
   * Add a new vitals reading for a patient
   */
  addVitals: async (id, vitalsData) => {
    const res = await fetch(`${API_BASE_URL}/patients/${id}/vitals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(vitalsData),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update vitals and risk score');
    }
    return data;
  },

  /**
   * Delete a patient record
   */
  deletePatient: async (id) => {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete patient');
    }
    return data;
  },
};

/**
 * Unified helper to get current status of a patient from their latest successfully saved assessment
 */
export const getPatientCurrentStatus = (patient) => {
  if (patient?.vitalsHistory && patient.vitalsHistory.length > 0) {
    const latest = patient.vitalsHistory[patient.vitalsHistory.length - 1];
    return latest.status || (latest.sepsisRiskScore >= 60 ? 'High Risk' : latest.sepsisRiskScore >= 30 ? 'Moderate Risk' : 'Stable');
  }
  return patient?.status || 'Stable';
};

/**
 * Unified helper to get current risk score of a patient from their latest successfully saved assessment
 */
export const getPatientCurrentScore = (patient) => {
  if (patient?.vitalsHistory && patient.vitalsHistory.length > 0) {
    const latest = patient.vitalsHistory[patient.vitalsHistory.length - 1];
    return latest.sepsisRiskScore !== undefined ? latest.sepsisRiskScore : (patient.sepsisRiskScore || 0);
  }
  return patient?.sepsisRiskScore || 0;
};

