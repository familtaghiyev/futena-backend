const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// IMPORTANT: Public route must be defined FIRST before any parameterized routes
// Public route - Get all sliders (for frontend display) - NO AUTH REQUIRED
router.get('/', sliderController.getAllSliders);

// Protected routes - Admin operations (require authentication)
router.get('/:id', authMiddleware, sliderController.getSlider);
router.post('/', authMiddleware, upload.single('image'), sliderController.createSlider);
router.put('/:id', authMiddleware, upload.single('image'), sliderController.updateSlider);
router.delete('/:id', authMiddleware, sliderController.deleteSlider);

module.exports = router;

