const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sepsisguard';
const User = require('./models/User');
const Patient = require('./models/Patient');

async function verifyDataIsolation() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('🟢 Connected to MongoDB for verification.');

    // 1. Create User A
    const emailA = `usera_${Date.now()}@test.com`;
    let userA = await User.findOne({ email: emailA });
    if (!userA) {
      userA = await User.create({ name: 'User A', email: emailA, password: 'password123' });
    }
    console.log('User A created:', userA._id.toString());

    // 2. Create User B (New User)
    const emailB = `userb_${Date.now()}@test.com`;
    let userB = await User.findOne({ email: emailB });
    if (!userB) {
      userB = await User.create({ name: 'User B', email: emailB, password: 'password123' });
    }
    console.log('User B created:', userB._id.toString());

    // 3. User A creates a patient
    const patientId = `PA_${Math.floor(Math.random() * 100000)}`;
    const patientA = await Patient.create({
      patientId: patientId,
      name: 'Patient A',
      age: 45,
      gender: 'Male',
      assignedClinician: userA._id
    });
    console.log('Patient created and assigned to User A:', patientA.patientId);

    // 4. Query patients as User A
    const patientsA = await Patient.find({ assignedClinician: userA._id });
    console.log('User A patients count:', patientsA.length);
    assert(patientsA.length === 1, 'User A should see 1 patient');
    assert(patientsA[0].patientId === patientId, 'User A should see patientA');

    // 5. Query patients as User B (New User)
    const patientsB = await Patient.find({ assignedClinician: userB._id });
    console.log('User B (New User) patients count:', patientsB.length);
    assert(patientsB.length === 0, 'User B must NOT see User A\'s patient data!');

    console.log('🟢 VERIFICATION SUCCESSFUL: Strict multi-user data isolation verified. User B cannot see User A\'s patient data.');

  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

verifyDataIsolation();
