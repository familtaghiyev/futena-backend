const express = require('express');
require('dotenv').config();
const connectDB = require('./config/database');
const multer = require('multer');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Middleware
app.use((req, res, next) => {
  // Default allowed origins (development + production)
  const defaultOrigins = [
    'http://localhost:5173',
    'https://futena-frontend.vercel.app',
  ];
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : defaultOrigins;
  
  const origin = req.headers.origin;
  
  // Allow requests from allowed origins
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      // Allow any localhost origin in development
      res.header('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV === 'production' && origin.includes('vercel.app')) {
      // Allow any vercel.app origin in production (for safety)
      res.header('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Frutena Backend API is running!' });
});

// API Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai-models', require('./routes/aiModelRoutes'));
app.use('/api/sliders', require('./routes/sliderRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Configured' : 'Using default'}`);
});

