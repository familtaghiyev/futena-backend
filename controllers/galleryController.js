const Gallery = require('../models/Gallery');

// Get All Gallery Images
exports.getAllGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching gallery images'
    });
  }
};

// Get Single Gallery Image
exports.getGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching gallery image'
    });
  }
};

// Create Gallery Image
exports.createGalleryImage = async (req, res) => {
  try {

    const { alt } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    // Validate required fields
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required. Please upload an image file.'
      });
    }
    
    const galleryImage = await Gallery.create({
      image,
      alt: alt || 'Gallery Image'
    });
    
    res.status(201).json({
      success: true,
      message: 'Gallery image created successfully',
      data: galleryImage
    });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating gallery image',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update Gallery Image
exports.updateGalleryImage = async (req, res) => {
  try {
    const { alt } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    const galleryImage = await Gallery.findById(req.params.id);
    
    if (!galleryImage) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
      });
    }
    
    // Update fields
    if (image !== undefined) galleryImage.image = image;
    if (alt !== undefined) galleryImage.alt = alt;
    
    await galleryImage.save();
    
    res.status(200).json({
      success: true,
      message: 'Gallery image updated successfully',
      data: galleryImage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating gallery image'
    });
  }
};

// Delete Gallery Image
exports.deleteGalleryImage = async (req, res) => {
  try {
    const galleryImage = await Gallery.findById(req.params.id);
    
    if (!galleryImage) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
      });
    }
    
    await galleryImage.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Gallery image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting gallery image'
    });
  }
};

