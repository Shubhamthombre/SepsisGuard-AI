require('dns').setDefaultResultOrder('ipv4first');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allows the frontend to communicate with the backend
app.use(express.json()); // Allows the server to accept and parse JSON data in requests

// Import Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

// Basic Route to verify server is running
app.get('/', (req, res) => {
  res.send('SepsisGuard AI Backend is running successfully!');
});

// Health Check Endpoint for UptimeRobot
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sepsisguard';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('🟢 Successfully connected to MongoDB.');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('👉 Please ensure your database connection string in backend/.env is correct and your database is accessible.');
  });

// Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

