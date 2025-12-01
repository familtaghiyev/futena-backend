const express = require('express');
require('dotenv').config();
const connectDB = require('../config/database');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();

// CORS Middleware - MUST be first, before any other middleware
// Handle OPTIONS requests immediately without database connection
app.use((req, res, next) => {
  // Get origin from request
  const origin = req.headers.origin;
  
  // Default allowed origins
  const allowedOrigins = [
    'http://localhost:5173',
    'https://futena-frontend.vercel.app',
  ];
  
  // Add custom origins from environment variable
  if (process.env.ALLOWED_ORIGINS) {
    const customOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    allowedOrigins.push(...customOrigins);
  }
  
  // Set CORS headers - Always set in production for frontend
  if (process.env.NODE_ENV === 'production') {
    // In production, always allow frontend origin
    if (origin === 'https://futena-frontend.vercel.app' || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || 'https://futena-frontend.vercel.app');
    } else {
      res.header('Access-Control-Allow-Origin', 'https://futena-frontend.vercel.app');
    }
  } else {
    // In development, allow localhost or allowed origins
    if (origin && (origin.includes('localhost') || allowedOrigins.includes(origin))) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight OPTIONS requests - MUST return early, before database connection
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Connect to database - Lazy connection (only when needed)
// Don't block OPTIONS requests with database connection
let dbConnected = false;
const ensureDBConnection = async () => {
  if (!dbConnected && mongoose.connection.readyState === 0) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      console.error('Database connection error:', error);
      // Don't exit process in serverless - just log error
    }
  }
};

// Middleware to ensure DB connection for non-OPTIONS requests
app.use(async (req, res, next) => {
  if (req.method !== 'OPTIONS') {
    await ensureDBConnection();
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Frutena Backend API is running!' });
});

// API Routes
app.use('/api/admin', require('../routes/adminRoutes'));
app.use('/api/ai-models', require('../routes/aiModelRoutes'));
app.use('/api/sliders', require('../routes/sliderRoutes'));
app.use('/api/products', require('../routes/productRoutes'));
app.use('/api/faqs', require('../routes/faqRoutes'));
app.use('/api/team', require('../routes/teamRoutes'));
app.use('/api/gallery', require('../routes/galleryRoutes'));
app.use('/api/news', require('../routes/newsRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  
  // Other errors
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Export for Vercel serverless function
// @vercel/node supports Express app directly
module.exports = app;


