import { useState } from 'react';
import { api } from '../api';
import { ClinicalInput, PremiumButton } from './ui/UIComponents';

const PatientForm = ({ onPatientAdded, onClose }) => {
  const [formData, setFormData] = useState({ patientId: '', name: '', age: '', gender: 'Other' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createPatient(formData);
      onPatientAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '10px' }}>{error}</p>}
      <ClinicalInput label="Patient ID" name="patientId" value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} required />
      <ClinicalInput label="Name" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
      <ClinicalInput label="Age" name="age" type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required />
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '700' }}>Gender</label>
        <select 
          name="gender" 
          value={formData.gender} 
          onChange={e => setFormData({...formData, gender: e.target.value})} 
          style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px 16px', borderRadius: '12px', color: '#f8fafc', width: '100%', boxSizing: 'border-box', fontSize: '0.95rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
          onFocus={(e) => {
            e.target.style.borderColor = '#06b6d4';
            e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.25)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(6, 182, 212, 0.3)';
            e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
          }}
        >
          <option value="Other" style={{ background: '#0f172a', color: '#f8fafc' }}>Other</option>
          <option value="Male" style={{ background: '#0f172a', color: '#f8fafc' }}>Male</option>
          <option value="Female" style={{ background: '#0f172a', color: '#f8fafc' }}>Female</option>
        </select>
      </div>
      <PremiumButton type="submit" style={{ width: '100%' }}>Register Patient</PremiumButton>
    </form>
  );
};

export default PatientForm;
