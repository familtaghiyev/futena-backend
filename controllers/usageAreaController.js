const UsageArea = require('../models/UsageArea');

// Get All Usage Areas
exports.getAllUsageAreas = async (req, res) => {
  try {
    const usageAreas = await UsageArea.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: usageAreas.length,
      data: usageAreas
    });
  } catch (error) {
    console.error('Error fetching usage areas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching usage areas'
    });
  }
};

// Get Single Usage Area
exports.getUsageArea = async (req, res) => {
  try {
    const usageArea = await UsageArea.findById(req.params.id);
    
    if (!usageArea) {
      return res.status(404).json({
        success: false,
        message: 'Usage area not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: usageArea
    });
  } catch (error) {
    console.error('Error fetching usage area:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching usage area'
    });
  }
};

// Create Usage Area
exports.createUsageArea = async (req, res) => {
  try {
    const { title, paragraph } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    console.log('Create Usage Area - Request body:', { title, paragraph, image: image ? 'present' : 'missing' });
    
    // Validate required fields
    if (!image || !title || !paragraph) {
      return res.status(400).json({
        success: false,
        message: 'Image, title, and paragraph are required'
      });
    }
    
    const usageArea = await UsageArea.create({
      title,
      paragraph,
      image
    });
    
    console.log('Usage Area created:', usageArea);
    
    res.status(201).json({
      success: true,
      message: 'Usage area created successfully',
      data: usageArea
    });
  } catch (error) {
    console.error('Error creating usage area:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating usage area'
    });
  }
};

// Update Usage Area
exports.updateUsageArea = async (req, res) => {
  try {
    const { title, paragraph } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    console.log('Update Usage Area - Request body:', { title, paragraph, image: image ? 'present' : 'missing' });
    
    const usageArea = await UsageArea.findById(req.params.id);
    
    if (!usageArea) {
      return res.status(404).json({
        success: false,
        message: 'Usage area not found'
      });
    }
    
    // Update fields
    if (title !== undefined) usageArea.title = title;
    if (paragraph !== undefined) usageArea.paragraph = paragraph;
    if (image !== undefined) usageArea.image = image;
    
    await usageArea.save();
    
    console.log('Usage Area updated:', usageArea);
    
    res.status(200).json({
      success: true,
      message: 'Usage area updated successfully',
      data: usageArea
    });
  } catch (error) {
    console.error('Error updating usage area:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating usage area'
    });
  }
};

// Delete Usage Area
exports.deleteUsageArea = async (req, res) => {
  try {
    const usageArea = await UsageArea.findById(req.params.id);
    
    if (!usageArea) {
      return res.status(404).json({
        success: false,
        message: 'Usage area not found'
      });
    }
    
    await usageArea.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Usage area deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting usage area:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting usage area'
    });
  }
};

