const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // If already connected, return
    if (mongoose.connection.readyState === 1) {
      return;
    }
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frutena';
    
    if (!process.env.MONGODB_URI) {
      console.warn('Warning: MONGODB_URI not set, using default localhost connection');
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Please check your MONGODB_URI environment variable');
    // Don't exit process in serverless environment (Vercel)
    // process.exit(1) will crash the serverless function
    // Just throw error so it can be handled by the application
    throw error;
  }
};

module.exports = connectDB;

