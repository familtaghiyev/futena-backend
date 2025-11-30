const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route - Get all products (for frontend display)
router.get('/', productController.getAllProducts);

// Protected routes - Admin operations (require authentication)
router.get('/:id', authMiddleware, productController.getProduct);
router.post('/', authMiddleware, upload.single('image'), productController.createProduct);
router.put('/:id', authMiddleware, upload.single('image'), productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;

