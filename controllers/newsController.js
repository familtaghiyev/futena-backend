const News = require('../models/News');

// Get All News
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching news'
    });
  }
};

// Get Single News
exports.getNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching news'
    });
  }
};

// Create News
exports.createNews = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    // Validate required fields
    if (!image || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Image, title, and description are required'
      });
    }
    
    const news = await News.create({
      title,
      description,
      image
    });
    
    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: news
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating news'
    });
  }
};

// Update News
exports.updateNews = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Update fields
    if (title !== undefined) news.title = title;
    if (description !== undefined) news.description = description;
    if (image !== undefined) news.image = image;
    
    await news.save();
    
    res.status(200).json({
      success: true,
      message: 'News updated successfully',
      data: news
    });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating news'
    });
  }
};

// Delete News
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    await news.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting news'
    });
  }
};

