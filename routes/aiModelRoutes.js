const express = require('express');
const router = express.Router();
const aiModelController = require('../controllers/aiModelController');
const authMiddleware = require('../middleware/auth');

// All AI Model routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', aiModelController.getAllModels);
router.get('/:id', aiModelController.getModelById);
router.post('/', aiModelController.createModel);
router.put('/:id', aiModelController.updateModel);
router.delete('/:id', aiModelController.deleteModel);

module.exports = router;

