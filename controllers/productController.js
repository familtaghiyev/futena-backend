const Product = require('../models/Product');
const { transformToLanguage, transformArrayToLanguage } = require('../utils/languageHelper');
const { translateTitleDescription } = require('../utils/translationHelper');

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const products = await Product.find().sort({ createdAt: -1 });
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawProducts = products.map(item => item.toObject ? item.toObject() : { ...item });
      return res.status(200).json({
        success: true,
        count: rawProducts.length,
        data: rawProducts
      });
    }
    
    const transformedProducts = transformArrayToLanguage(products, lang);
    
    res.status(200).json({
      success: true,
      count: transformedProducts.length,
      data: transformedProducts
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
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawProduct = product.toObject ? product.toObject() : { ...product };
      return res.status(200).json({
        success: true,
        data: rawProduct
      });
    }
    
    const transformedProduct = transformToLanguage(product, lang);
    
    res.status(200).json({
      success: true,
      data: transformedProduct
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
    const { 
      title_en, title_az, title_ru, 
      description_en, description_az, description_ru,
      title, description,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    // Support both old and new formats
    const finalTitleEn = title_en || title || '';
    const finalDescriptionEn = description_en || description || '';
    
    // Validate required fields
    if (!image || !finalDescriptionEn) {
      return res.status(400).json({
        success: false,
        message: 'Image and description (or description_en) are required'
      });
    }
    
    const sourceLang = sourceLanguage || 'en';
    let productData = { image };

    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        let sourceTitle = '';
        let sourceDescription = '';
        
        if (sourceLang === 'en') {
          sourceTitle = finalTitleEn;
          sourceDescription = finalDescriptionEn;
        } else if (sourceLang === 'az') {
          sourceTitle = title_az || finalTitleEn;
          sourceDescription = description_az || finalDescriptionEn;
        } else if (sourceLang === 'ru') {
          sourceTitle = title_ru || finalTitleEn;
          sourceDescription = description_ru || finalDescriptionEn;
        }

        const translations = await translateTitleDescription(sourceTitle, sourceDescription, sourceLang);
        productData = { ...productData, ...translations };
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
        productData = {
          ...productData,
          title_en: finalTitleEn,
          title_az: title_az || '',
          title_ru: title_ru || '',
          description_en: finalDescriptionEn,
          description_az: description_az || '',
          description_ru: description_ru || ''
        };
      }
    } else {
      productData = {
        ...productData,
      title_en: finalTitleEn,
      title_az: title_az || '',
      title_ru: title_ru || '',
      description_en: finalDescriptionEn,
      description_az: description_az || '',
        description_ru: description_ru || ''
      };
    }
    
    const product = await Product.create(productData);
    
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
    const { 
      title_en, title_az, title_ru, 
      description_en, description_az, description_ru,
      title, description,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        const sourceLang = sourceLanguage || 'en';
        let sourceTitle = '';
        let sourceDescription = '';
        
        if (sourceLang === 'en') {
          sourceTitle = title_en || title || product.title_en || '';
          sourceDescription = description_en || description || product.description_en || '';
        } else if (sourceLang === 'az') {
          sourceTitle = title_az || product.title_az || '';
          sourceDescription = description_az || product.description_az || '';
        } else if (sourceLang === 'ru') {
          sourceTitle = title_ru || product.title_ru || '';
          sourceDescription = description_ru || product.description_ru || '';
        }

        if (sourceTitle && sourceDescription) {
          const translations = await translateTitleDescription(sourceTitle, sourceDescription, sourceLang);
          product.title_en = translations.title_en || product.title_en;
          product.title_az = translations.title_az || product.title_az;
          product.title_ru = translations.title_ru || product.title_ru;
          product.description_en = translations.description_en || product.description_en;
          product.description_az = translations.description_az || product.description_az;
          product.description_ru = translations.description_ru || product.description_ru;
        }
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
      }
    }
    
    // Manual update (only if auto-translate is not enabled)
    if (!autoTranslate || autoTranslate === 'false' || autoTranslate === false) {
    if (title !== undefined && !title_en) {
      product.title_en = title || '';
    } else if (title_en !== undefined) {
      product.title_en = title_en || '';
    }
    
    if (description !== undefined && !description_en) {
      product.description_en = description;
    } else if (description_en !== undefined) {
      product.description_en = description_en;
    }
    
    // Update other language fields
    if (title_az !== undefined) product.title_az = title_az || '';
    if (title_ru !== undefined) product.title_ru = title_ru || '';
    if (description_az !== undefined) product.description_az = description_az;
    if (description_ru !== undefined) product.description_ru = description_ru;
    }
    
    if (image !== undefined) product.image = image;
    
    await product.save();
    
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

