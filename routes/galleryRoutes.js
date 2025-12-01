const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
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

// Public route - Get all gallery images (for frontend display) - NO AUTH REQUIRED
router.get('/', galleryController.getAllGalleryImages);

// Protected routes - Admin operations (require authentication)
router.get('/:id', authMiddleware, galleryController.getGalleryImage);
router.post('/', authMiddleware, handleUpload, galleryController.createGalleryImage);
router.put('/:id', authMiddleware, handleUpload, galleryController.updateGalleryImage);
router.delete('/:id', authMiddleware, galleryController.deleteGalleryImage);

module.exports = router;

