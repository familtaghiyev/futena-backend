const Slider = require('../models/Slider');
const { transformToLanguage, transformArrayToLanguage } = require('../utils/languageHelper');
const { translateTitleParagraph } = require('../utils/translationHelper');

// Get All Sliders
exports.getAllSliders = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const sliders = await Slider.find().sort({ createdAt: -1 });
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawSliders = sliders.map(item => item.toObject ? item.toObject() : { ...item });
      return res.status(200).json({
        success: true,
        count: rawSliders.length,
        data: rawSliders
      });
    }
    
    const transformedSliders = transformArrayToLanguage(sliders, lang);
    
    res.status(200).json({
      success: true,
      count: transformedSliders.length,
      data: transformedSliders
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
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const slider = await Slider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawSlider = slider.toObject ? slider.toObject() : { ...slider };
      return res.status(200).json({
        success: true,
        data: rawSlider
      });
    }
    
    const transformedSlider = transformToLanguage(slider, lang);
    
    res.status(200).json({
      success: true,
      data: transformedSlider
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
    if (!finalTitleEn || !image || !finalParagraphEn) {
      return res.status(400).json({
        success: false,
        message: 'title (or title_en), image, and paragraph (or paragraph_en) are required'
      });
    }
    
    const sourceLang = sourceLanguage || 'en';
    let sliderData = { image };

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
        sliderData = { ...sliderData, ...translations };
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
        sliderData = {
          ...sliderData,
          title_en: finalTitleEn,
          title_az: title_az || '',
          title_ru: title_ru || '',
          paragraph_en: finalParagraphEn,
          paragraph_az: paragraph_az || '',
          paragraph_ru: paragraph_ru || ''
        };
      }
    } else {
      sliderData = {
        ...sliderData,
      title_en: finalTitleEn,
      title_az: title_az || '',
      title_ru: title_ru || '',
      paragraph_en: finalParagraphEn,
      paragraph_az: paragraph_az || '',
      paragraph_ru: paragraph_ru || ''
      };
    }
    
    const slider = await Slider.create(sliderData);
    
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
    const { 
      title_en, title_az, title_ru, 
      paragraph_en, paragraph_az, paragraph_ru,
      title, paragraph,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    const slider = await Slider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }
    
    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        const sourceLang = sourceLanguage || 'en';
        let sourceTitle = '';
        let sourceParagraph = '';
        
        if (sourceLang === 'en') {
          sourceTitle = title_en || title || slider.title_en || '';
          sourceParagraph = paragraph_en || paragraph || slider.paragraph_en || '';
        } else if (sourceLang === 'az') {
          sourceTitle = title_az || slider.title_az || '';
          sourceParagraph = paragraph_az || slider.paragraph_az || '';
        } else if (sourceLang === 'ru') {
          sourceTitle = title_ru || slider.title_ru || '';
          sourceParagraph = paragraph_ru || slider.paragraph_ru || '';
        }

        if (sourceTitle && sourceParagraph) {
          const translations = await translateTitleParagraph(sourceTitle, sourceParagraph, sourceLang);
          slider.title_en = translations.title_en || slider.title_en;
          slider.title_az = translations.title_az || slider.title_az;
          slider.title_ru = translations.title_ru || slider.title_ru;
          slider.paragraph_en = translations.paragraph_en || slider.paragraph_en;
          slider.paragraph_az = translations.paragraph_az || slider.paragraph_az;
          slider.paragraph_ru = translations.paragraph_ru || slider.paragraph_ru;
        }
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
      }
    }

    // Manual update (only if auto-translate is not enabled)
    if (!autoTranslate || autoTranslate === 'false' || autoTranslate === false) {
    if (title !== undefined && !title_en) {
      slider.title_en = title;
    } else if (title_en !== undefined) {
      slider.title_en = title_en;
    }
    
    if (paragraph !== undefined && !paragraph_en) {
      slider.paragraph_en = paragraph;
    } else if (paragraph_en !== undefined) {
      slider.paragraph_en = paragraph_en;
    }
    
    // Update other language fields
    if (title_az !== undefined) slider.title_az = title_az;
    if (title_ru !== undefined) slider.title_ru = title_ru;
      if (paragraph_az !== undefined) slider.paragraph_az = paragraph_az;
      if (paragraph_ru !== undefined) slider.paragraph_ru = paragraph_ru;
    }
    
    if (image !== undefined) slider.image = image;
    
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

