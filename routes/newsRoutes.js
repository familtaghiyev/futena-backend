const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
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

// Public route - Get all news (for frontend display) - NO AUTH REQUIRED
router.get('/', newsController.getAllNews);

// Protected routes - Admin operations (require authentication)
router.get('/:id', authMiddleware, newsController.getNews);
router.post('/', authMiddleware, handleUpload, newsController.createNews);
router.put('/:id', authMiddleware, handleUpload, newsController.updateNews);
router.delete('/:id', authMiddleware, newsController.deleteNews);

module.exports = router;

