const express = require('express');
const router = express.Router();
const axios = require('axios');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/authMiddleware');
const { sendRiskAlertEmail } = require('../utils/emailService');

// Helper function to calculate a medically representative Sepsis Risk Score (Rule-Based qSOFA/SIRS approximation)
const calculateSepsisRisk = (vitals) => {
  let scorePoints = 0;
  const { heartRate, temperature, respiratoryRate, systolicBP, oxygenSaturation } = vitals;

  // 1. Heart Rate (SIRS criteria: > 90 bpm indicates systemic stress)
  if (heartRate > 90) scorePoints += 1;

  // 2. Temperature (SIRS criteria: fever > 38°C or hypothermia < 36°C)
  if (temperature > 38.0 || temperature < 36.0) scorePoints += 1;

  // 3. Respiratory Rate (qSOFA criteria: >= 22 breaths/min)
  if (respiratoryRate >= 22) {
    scorePoints += 2; // Highly weighted indicator for sepsis/respiratory distress
  } else if (respiratoryRate > 20) {
    scorePoints += 1;
  }

  // 4. Systolic Blood Pressure (qSOFA criteria: <= 100 mmHg indicates hypotension/shock)
  if (systolicBP <= 100) {
    scorePoints += 2; // Critical indicator of septic shock
  } else if (systolicBP < 110) {
    scorePoints += 1;
  }

  // 5. Oxygen Saturation (SpO2: < 92% indicates hypoxia)
  if (oxygenSaturation < 92) {
    scorePoints += 2;
  } else if (oxygenSaturation < 95) {
    scorePoints += 1;
  }

  // Determine risk percentage and status based on total points
  let sepsisRiskScore = 0;
  let status = 'Stable';

  if (scorePoints === 0) {
    sepsisRiskScore = 5; // 5% base risk
    status = 'Stable';
  } else if (scorePoints <= 2) {
    sepsisRiskScore = Math.round((scorePoints / 8) * 30); // 10% - 25% risk
    status = 'Stable';
  } else if (scorePoints <= 4) {
    sepsisRiskScore = Math.round((scorePoints / 8) * 70); // 26% - 60% risk
    status = 'Moderate Risk';
  } else if (scorePoints <= 6) {
    sepsisRiskScore = Math.round((scorePoints / 8) * 90); // 61% - 85% risk
    status = 'High Risk';
  } else {
    sepsisRiskScore = Math.min(Math.round((scorePoints / 8) * 100), 99); // Up to 99%
    status = 'Sepsis Confirmed';
  }

  return { sepsisRiskScore, status };
};

// @route   POST /api/patients
// @desc    Register a new patient
// @access  Private (Clinicians only)
router.post('/', protect, async (req, res) => {
  const { patientId, name, age, gender } = req.body;

  if (!patientId || !name || !age || !gender) {
    return res.status(400).json({ message: 'All patient demographic fields are required' });
  }

  try {
    const patientExists = await Patient.findOne({ patientId });
    if (patientExists) {
      return res.status(400).json({ message: 'Patient ID already exists' });
    }

    const patient = await Patient.create({
      patientId,
      name,
      age,
      gender,
      assignedClinician: req.user._id, // Links this patient to the logged-in clinician
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error('Create Patient Error:', error.message);
    res.status(500).json({ message: 'Server error creating patient', error: error.message });
  }
});

// @route   GET /api/patients
// @desc    Get all patients assigned to current clinician
// @access  Private (Clinicians only)
router.get('/', protect, async (req, res) => {
  try {
    const patients = await Patient.find({ assignedClinician: req.user._id }).populate('assignedClinician', 'name email role');
    res.json(patients);
  } catch (error) {
    console.error('Fetch Patients Error:', error.message);
    res.status(500).json({ message: 'Server error fetching patients', error: error.message });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient details by MongoDB database ID for current clinician
// @access  Private (Clinicians only)
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, assignedClinician: req.user._id }).populate('assignedClinician', 'name email role');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Fetch Patient ID Error:', error.message);
    res.status(500).json({ message: 'Server error fetching patient details', error: error.message });
  }
});

// @route   POST /api/patients/:id/vitals
// @desc    Add a new vitals telemetry reading & update AI/clinical sepsis risk for clinician's patient
// @access  Private (Clinicians only)
router.post('/:id/vitals', protect, async (req, res) => {
  const { heartRate, temperature, respiratoryRate, systolicBP, diastolicBP, oxygenSaturation, MAP, Creatinine, BUN, WBC, Lactate } = req.body;

  if (
    heartRate === undefined || temperature === undefined || respiratoryRate === undefined ||
    systolicBP === undefined || diastolicBP === undefined || oxygenSaturation === undefined ||
    MAP === undefined || Creatinine === undefined || BUN === undefined || WBC === undefined || Lactate === undefined
  ) {
    return res.status(400).json({ message: 'All 12 clinical fields required' });
  }

  try {
    const patient = await Patient.findOne({ _id: req.params.id, assignedClinician: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Always use patient's stored demographic age to ensure absolute consistency
    const patientAge = patient.age;

    // Call Python ML Service
    let sepsisRiskScore = 0;
    let status = 'Stable';
    let featureImportance = {}; // Initialize here
    try {
        // ML Service timeout: 5 seconds
        const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict`, {
            HR: Number(heartRate), Temp: Number(temperature), Resp: Number(respiratoryRate),
            SBP: Number(systolicBP), DBP: Number(diastolicBP), O2Sat: Number(oxygenSaturation),
            MAP: Number(MAP), Creatinine: Number(Creatinine), BUN: Number(BUN),
            WBC: Number(WBC), Lactate: Number(Lactate), Age: Number(patientAge)
        }, { timeout: 5000 });
        
        sepsisRiskScore = Math.round(mlResponse.data.sepsis_probability * 100);
        status = mlResponse.data.risk_level === 'High' ? 'High Risk' : mlResponse.data.risk_level === 'Moderate' ? 'Moderate Risk' : 'Stable';
        featureImportance = mlResponse.data.feature_importance; 
        console.log('DEBUG - ML Response:', mlResponse.data);
        console.log('DEBUG - Feature Importance:', featureImportance);
    } catch (mlErr) {
        console.error('ML Service Error:', mlErr.message);
        return res.status(503).json({ message: 'Risk assessment service currently unavailable' });
    }

    const newVitals = {
      heartRate: Number(heartRate), temperature: Number(temperature),
      respiratoryRate: Number(respiratoryRate), systolicBP: Number(systolicBP),
      diastolicBP: Number(diastolicBP), oxygenSaturation: Number(oxygenSaturation),
      MAP: Number(MAP), Creatinine: Number(Creatinine), BUN: Number(BUN),
      WBC: Number(WBC), Lactate: Number(Lactate), Age: Number(patientAge),
      sepsisRiskScore: sepsisRiskScore,
      status: status,
      featureImportance: featureImportance,
      recordedAt: new Date(),
    };

    // Push the new vitals reading to the patient history list
    patient.vitalsHistory.push(newVitals);
    
    // Update the patient risk factors
    patient.sepsisRiskScore = sepsisRiskScore;
    patient.status = status;

    await patient.save();

    // Send email alert for Moderate Risk or High Risk assessments
    if ((status === 'Moderate Risk' || status === 'High Risk') && req.user) {
      const savedVitals = patient.vitalsHistory[patient.vitalsHistory.length - 1];
      if (!savedVitals.notificationSent) {
        try {
          await sendRiskAlertEmail(req.user, patient, savedVitals);
          savedVitals.notificationSent = true;
          await patient.save();
        } catch (emailErr) {
          console.error('Email Notification Error:', emailErr.message);
        }
      }
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error('Add Vitals Error:', error.message);
    res.status(500).json({ message: 'Server error updating vitals', error: error.message });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient demographic details for clinician's patient
// @access  Private (Clinicians only)
router.put('/:id', protect, async (req, res) => {
  const { name, age, gender, status } = req.body;

  try {
    const patient = await Patient.findOne({ _id: req.params.id, assignedClinician: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update fields if provided
    if (name) patient.name = name;
    if (age) patient.age = age;
    if (gender) patient.gender = gender;
    if (status) patient.status = status;

    await patient.save();
    res.json(patient);
  } catch (error) {
    console.error('Update Patient Error:', error.message);
    res.status(500).json({ message: 'Server error updating patient details', error: error.message });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient record for clinician's patient
// @access  Private (Clinicians only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, assignedClinician: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await Patient.findOneAndDelete({ _id: req.params.id, assignedClinician: req.user._id });
    res.json({ message: 'Patient record successfully deleted' });
  } catch (error) {
    console.error('Delete Patient Error:', error.message);
    res.status(500).json({ message: 'Server error deleting patient', error: error.message });
  }
});

module.exports = router;
