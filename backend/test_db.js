const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log("Testing connection and simple operation...");
  try {
    await mongoose.connect(MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 5000 });
    console.log("🟢 Connected successfully.");
    
    // Test simple command
    const db = mongoose.connection.db;
    await db.admin().ping();
    console.log("🟢 Ping successful.");
    
    // Test collection access
    const collections = await db.listCollections().toArray();
    console.log("🟢 Collections list retrieved:", collections.map(c => c.name));
    
  } catch (err) {
    console.error("❌ Connection test failed.");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

testConnection();
