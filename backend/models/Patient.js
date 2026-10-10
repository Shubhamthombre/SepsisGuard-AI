const mongoose = require('mongoose');

const VitalReadingSchema = new mongoose.Schema({
  heartRate: { type: Number, required: true },
  temperature: { type: Number, required: true },
  respiratoryRate: { type: Number, required: true },
  systolicBP: { type: Number, required: true },
  diastolicBP: { type: Number, required: true },
  oxygenSaturation: { type: Number, required: true },
  MAP: { type: Number, required: false },
  Creatinine: { type: Number, required: false },
  BUN: { type: Number, required: false },
  WBC: { type: Number, required: false },
  Lactate: { type: Number, required: false },
  Age: { type: Number, required: false },
  sepsisRiskScore: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Stable', 'Moderate Risk', 'High Risk', 'Sepsis Confirmed'],
    default: 'Stable',
  },
  featureImportance: { type: Object, default: {} }, // XAI field
  recordedAt: { type: Date, default: Date.now },
});

const PatientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide patient name'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Please provide patient age'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Please provide patient gender'],
  },
  vitalsHistory: [VitalReadingSchema], // Array of vital sign measurements over time
  sepsisRiskScore: {
    type: Number, // Probability between 0 and 100
    required: false,
    default: null
  },
  status: {
    type: String,
    enum: ['Stable', 'Moderate Risk', 'High Risk', 'Sepsis Confirmed'],
    default: 'Stable',
  },
  assignedClinician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User (Doctor/Nurse) who is tracking this patient
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to synchronize patient status and sepsisRiskScore with the latest vitals reading
PatientSchema.pre('save', function (next) {
  if (this.vitalsHistory && this.vitalsHistory.length > 0) {
    const latest = this.vitalsHistory[this.vitalsHistory.length - 1];
    this.sepsisRiskScore = latest.sepsisRiskScore;
    this.status = latest.status || (latest.sepsisRiskScore >= 60 ? 'High Risk' : latest.sepsisRiskScore >= 30 ? 'Moderate Risk' : 'Stable');
  } else {
    if (!this.status) this.status = 'Stable';
  }
  this.updatedAt = new Date();
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('Patient', PatientSchema);
