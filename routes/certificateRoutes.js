const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route - Get all certificates (for frontend display) - NO AUTH REQUIRED
router.get('/', certificateController.getAllCertificates);

// Protected routes - Admin operations (require authentication)
router.get('/:id', authMiddleware, certificateController.getCertificate);
router.post('/', authMiddleware, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), certificateController.createCertificate);
router.put('/:id', authMiddleware, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), certificateController.updateCertificate);
router.delete('/:id', authMiddleware, certificateController.deleteCertificate);

module.exports = router;

