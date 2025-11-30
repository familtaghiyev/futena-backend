const TeamMember = require('../models/TeamMember');

// Get all team members
exports.getAllTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching team members'
    });
  }
};

// Create team member
exports.createTeamMember = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Title and image are required'
      });
    }

    const member = await TeamMember.create({
      title,
      description,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating team member'
    });
  }
};

// Update team member
exports.updateTeamMember = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    if (title !== undefined) member.title = title;
    if (description !== undefined) member.description = description;
    if (image !== undefined) member.image = image;

    await member.save();

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating team member'
    });
  }
};

// Delete team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting team member'
    });
  }
};

