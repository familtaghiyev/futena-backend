const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route
router.get('/', teamController.getAllTeamMembers);

// Protected
router.post('/', authMiddleware, upload.single('image'), teamController.createTeamMember);
router.put('/:id', authMiddleware, upload.single('image'), teamController.updateTeamMember);
router.delete('/:id', authMiddleware, teamController.deleteTeamMember);

module.exports = router;

