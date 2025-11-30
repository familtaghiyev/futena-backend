const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middleware/auth');

// Public route - list FAQs
router.get('/', faqController.getAllFAQs);

// Protected routes
router.post('/', authMiddleware, faqController.createFAQ);
router.put('/:id', authMiddleware, faqController.updateFAQ);
router.delete('/:id', authMiddleware, faqController.deleteFAQ);

module.exports = router;

