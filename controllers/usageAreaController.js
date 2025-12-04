const UsageArea = require('../models/UsageArea');
const { transformToLanguage, transformArrayToLanguage } = require('../utils/languageHelper');
const { translateTitleParagraph } = require('../utils/translationHelper');

// Get All Usage Areas
exports.getAllUsageAreas = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const usageAreas = await UsageArea.find().sort({ createdAt: -1 });
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawUsageAreas = usageAreas.map(item => item.toObject ? item.toObject() : { ...item });
      return res.status(200).json({
        success: true,
        count: rawUsageAreas.length,
        data: rawUsageAreas
      });
    }
    
    const transformedUsageAreas = transformArrayToLanguage(usageAreas, lang);
    
    res.status(200).json({
      success: true,
      count: transformedUsageAreas.length,
      data: transformedUsageAreas
    });
  } catch (error) {
    console.error('❌ Error fetching usage areas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching usage areas'
    });
  }
};

// Get Single Usage Area
exports.getUsageArea = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const usageArea = await UsageArea.findById(req.params.id);
    
    if (!usageArea) {
      return res.status(404).json({
        success: false,
        message: 'Usage area not found'
      });
    }
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawUsageArea = usageArea.toObject ? usageArea.toObject() : { ...usageArea };
      return res.status(200).json({
        success: true,
        data: rawUsageArea
      });
    }
    
    const transformedUsageArea = transformToLanguage(usageArea, lang);
    
    res.status(200).json({
      success: true,
      data: transformedUsageArea
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
    const { 
      title_en, title_az, title_ru, 
      paragraph_en, paragraph_az, paragraph_ru,
      title, paragraph,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    // Support both old and new formats
    const finalTitleEn = title_en || title || '';
    const finalParagraphEn = paragraph_en || paragraph || '';
    
    // Validate required fields
    if (!image || !finalTitleEn || !finalParagraphEn) {
      return res.status(400).json({
        success: false,
        message: 'Image, title (or title_en), and paragraph (or paragraph_en) are required'
      });
    }

    const sourceLang = sourceLanguage || 'en';
    let usageAreaData = { image };

    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        let sourceTitle = '';
        let sourceParagraph = '';
        
        if (sourceLang === 'en') {
          sourceTitle = finalTitleEn;
          sourceParagraph = finalParagraphEn;
        } else if (sourceLang === 'az') {
          sourceTitle = title_az || finalTitleEn;
          sourceParagraph = paragraph_az || finalParagraphEn;
        } else if (sourceLang === 'ru') {
          sourceTitle = title_ru || finalTitleEn;
          sourceParagraph = paragraph_ru || finalParagraphEn;
        }

        const translations = await translateTitleParagraph(sourceTitle, sourceParagraph, sourceLang);
        usageAreaData = { ...usageAreaData, ...translations };
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
        usageAreaData = {
          ...usageAreaData,
          title_en: finalTitleEn,
          title_az: title_az || '',
          title_ru: title_ru || '',
          paragraph_en: finalParagraphEn,
          paragraph_az: paragraph_az || '',
          paragraph_ru: paragraph_ru || ''
        };
      }
    } else {
      usageAreaData = {
        ...usageAreaData,
        title_en: finalTitleEn,
        title_az: title_az || '',
        title_ru: title_ru || '',
        paragraph_en: finalParagraphEn,
        paragraph_az: paragraph_az || '',
        paragraph_ru: paragraph_ru || ''
      };
    }
    
    const usageArea = await UsageArea.create(usageAreaData);
    
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
    const { 
      title_en, title_az, title_ru, 
      paragraph_en, paragraph_az, paragraph_ru,
      title, paragraph,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    const usageArea = await UsageArea.findById(req.params.id);
    
    if (!usageArea) {
      return res.status(404).json({
        success: false,
        message: 'Usage area not found'
      });
    }

    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        const sourceLang = sourceLanguage || 'en';
        let sourceTitle = '';
        let sourceParagraph = '';
        
        if (sourceLang === 'en') {
          sourceTitle = title_en || title || usageArea.title_en || '';
          sourceParagraph = paragraph_en || paragraph || usageArea.paragraph_en || '';
        } else if (sourceLang === 'az') {
          sourceTitle = title_az || usageArea.title_az || '';
          sourceParagraph = paragraph_az || usageArea.paragraph_az || '';
        } else if (sourceLang === 'ru') {
          sourceTitle = title_ru || usageArea.title_ru || '';
          sourceParagraph = paragraph_ru || usageArea.paragraph_ru || '';
        }

        if (sourceTitle && sourceParagraph) {
          const translations = await translateTitleParagraph(sourceTitle, sourceParagraph, sourceLang);
          usageArea.title_en = translations.title_en || usageArea.title_en;
          usageArea.title_az = translations.title_az || usageArea.title_az;
          usageArea.title_ru = translations.title_ru || usageArea.title_ru;
          usageArea.paragraph_en = translations.paragraph_en || usageArea.paragraph_en;
          usageArea.paragraph_az = translations.paragraph_az || usageArea.paragraph_az;
          usageArea.paragraph_ru = translations.paragraph_ru || usageArea.paragraph_ru;
        }
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
      }
    }

    // Manual update (only if auto-translate is not enabled)
    if (!autoTranslate || autoTranslate === 'false' || autoTranslate === false) {
      if (title !== undefined && !title_en) {
        usageArea.title_en = title;
      } else if (title_en !== undefined) {
        usageArea.title_en = title_en;
      }
      
      if (paragraph !== undefined && !paragraph_en) {
        usageArea.paragraph_en = paragraph;
      } else if (paragraph_en !== undefined) {
        usageArea.paragraph_en = paragraph_en;
      }
      
      // Update other language fields
      if (title_az !== undefined) usageArea.title_az = title_az;
      if (title_ru !== undefined) usageArea.title_ru = title_ru;
      if (paragraph_az !== undefined) usageArea.paragraph_az = paragraph_az;
      if (paragraph_ru !== undefined) usageArea.paragraph_ru = paragraph_ru;
    }
    
    if (image !== undefined) usageArea.image = image;
    
    await usageArea.save();
    
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

