const Product = require('../models/Product');

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products'
    });
  }
};

// Get Single Product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product'
    });
  }
};

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    console.log('Create Product - Request body:', { title, description, image: image ? 'present' : 'missing' });
    
    // Validate required fields
    if (!image || !description) {
      return res.status(400).json({
        success: false,
        message: 'Image and description are required'
      });
    }
    
    const product = await Product.create({
      title: title || '', // Ensure title is always a string
      description,
      image
    });
    
    console.log('Product created:', product);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating product'
    });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    console.log('Update Product - Request body:', { title, description, image: image ? 'present' : 'missing' });
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Update fields
    if (title !== undefined) product.title = title || '';
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;
    
    await product.save();
    
    console.log('Product updated:', product);
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating product'
    });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting product'
    });
  }
};

