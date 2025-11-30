const Slider = require('../models/Slider');

// Get All Sliders
exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: sliders.length,
      data: sliders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sliders'
    });
  }
};

// Get Single Slider
exports.getSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: slider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching slider'
    });
  }
};

// Create Slider
exports.createSlider = async (req, res) => {
  try {
    const { title, paragraph } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
    
    // Validate required fields
    if (!title || !image || !paragraph) {
      return res.status(400).json({
        success: false,
        message: 'Title, image, and paragraph are required'
      });
    }
    
    const slider = await Slider.create({
      title,
      image,
      paragraph
    });
    
    res.status(201).json({
      success: true,
      message: 'Slider created successfully',
      data: slider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating slider'
    });
  }
};

// Update Slider
exports.updateSlider = async (req, res) => {
  try {
    const { title, paragraph } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
    
    const slider = await Slider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }
    
    // Update fields
    if (title !== undefined) slider.title = title;
    if (image !== undefined) slider.image = image;
    if (paragraph !== undefined) slider.paragraph = paragraph;
    
    await slider.save();
    
    res.status(200).json({
      success: true,
      message: 'Slider updated successfully',
      data: slider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating slider'
    });
  }
};

// Delete Slider
exports.deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }
    
    await slider.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Slider deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting slider'
    });
  }
};

