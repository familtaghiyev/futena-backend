const AIModel = require('../models/AIModel');

// Get All AI Models
exports.getAllModels = async (req, res) => {
  try {
    const models = await AIModel.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: models.length,
      data: models
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching AI models'
    });
  }
};

// Get Single AI Model
exports.getModelById = async (req, res) => {
  try {
    const model = await AIModel.findById(req.params.id);

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'AI Model not found'
      });
    }

    res.status(200).json({
      success: true,
      data: model
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching AI model'
    });
  }
};

// Create AI Model
exports.createModel = async (req, res) => {
  try {
    const model = await AIModel.create(req.body);

    res.status(201).json({
      success: true,
      message: 'AI Model created successfully',
      data: model
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating AI model'
    });
  }
};

// Update AI Model
exports.updateModel = async (req, res) => {
  try {
    const model = await AIModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'AI Model not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'AI Model updated successfully',
      data: model
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating AI model'
    });
  }
};

// Delete AI Model
exports.deleteModel = async (req, res) => {
  try {
    const model = await AIModel.findByIdAndDelete(req.params.id);

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'AI Model not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'AI Model deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting AI model'
    });
  }
};

