const express = require('express');
const router = express.Router();
const usageAreaController = require('../controllers/usageAreaController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Error handling wrapper for multer
const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
};

// Public route - Get all usage areas (for frontend display) - NO AUTH REQUIRED
router.get('/', usageAreaController.getAllUsageAreas);

// Protected routes - Admin operations (require authentication)
router.get('/:id', authMiddleware, usageAreaController.getUsageArea);
router.post('/', authMiddleware, handleUpload, usageAreaController.createUsageArea);
router.put('/:id', authMiddleware, handleUpload, usageAreaController.updateUsageArea);
router.delete('/:id', authMiddleware, usageAreaController.deleteUsageArea);

module.exports = router;

