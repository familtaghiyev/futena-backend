const News = require('../models/News');
const { transformToLanguage, transformArrayToLanguage } = require('../utils/languageHelper');
const { translateNewsContent } = require('../utils/translationHelper');

// Get All News
exports.getAllNews = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true'; // For admin panel to get raw data with all language fields
    
    const news = await News.find().sort({ createdAt: -1 });
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawNews = news.map(item => item.toObject ? item.toObject() : { ...item });
      return res.status(200).json({
        success: true,
        count: rawNews.length,
        data: rawNews
      });
    }
    
    const transformedNews = transformArrayToLanguage(news, lang);
    
    res.status(200).json({
      success: true,
      count: transformedNews.length,
      data: transformedNews
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
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true'; // For admin panel to get raw data with all language fields
    
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawNews = news.toObject ? news.toObject() : { ...news };
      return res.status(200).json({
        success: true,
        data: rawNews
      });
    }
    
    const transformedNews = transformToLanguage(news, lang);
    
    res.status(200).json({
      success: true,
      data: transformedNews
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
    const { 
      title_en, title_az, title_ru, 
      description_en, description_az, description_ru,
      title, description,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation (default: 'en')
    } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    // Support both old and new formats
    // If old format (title, description) is provided, use it as English
    const finalTitleEn = title_en || title || '';
    const finalDescriptionEn = description_en || description || '';
    
    // Validate required fields
    if (!image || !finalTitleEn || !finalDescriptionEn) {
      return res.status(400).json({
        success: false,
        message: 'Image, title (or title_en), and description (or description_en) are required'
      });
    }

    // Determine source language
    const sourceLang = sourceLanguage || 'en';
    
    // Prepare news data
    let newsData = {
      image
    };

    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        // Get the source text based on selected language
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

        // Translate to all languages
        const translations = await translateNewsContent(sourceTitle, sourceDescription, sourceLang);
        
        newsData = {
          ...newsData,
          title_en: translations.title_en,
          title_az: translations.title_az,
          title_ru: translations.title_ru,
          description_en: translations.description_en,
          description_az: translations.description_az,
          description_ru: translations.description_ru
        };
      } catch (translationError) {
        console.error('❌ Auto-translation error:', translationError);
        // Fallback: Use provided values or empty strings
        newsData = {
          ...newsData,
          title_en: finalTitleEn,
          title_az: title_az || '',
          title_ru: title_ru || '',
          description_en: finalDescriptionEn,
          description_az: description_az || '',
          description_ru: description_ru || ''
        };
      }
    } else {
      // Manual mode: Use provided values
      newsData = {
        ...newsData,
        title_en: finalTitleEn,
        title_az: title_az || '',
        title_ru: title_ru || '',
        description_en: finalDescriptionEn,
        description_az: description_az || '',
        description_ru: description_ru || ''
      };
    }
    
    const news = await News.create(newsData);
    
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
    const { 
      title_en, title_az, title_ru, 
      description_en, description_az, description_ru,
      title, description,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        const sourceLang = sourceLanguage || 'en';
        
        // Get source text based on selected language
        let sourceTitle = '';
        let sourceDescription = '';
        
        if (sourceLang === 'en') {
          sourceTitle = title_en || title || news.title_en || '';
          sourceDescription = description_en || description || news.description_en || '';
        } else if (sourceLang === 'az') {
          sourceTitle = title_az || news.title_az || '';
          sourceDescription = description_az || news.description_az || '';
        } else if (sourceLang === 'ru') {
          sourceTitle = title_ru || news.title_ru || '';
          sourceDescription = description_ru || news.description_ru || '';
        }

        if (sourceTitle && sourceDescription) {
          // Translate to all languages
          const translations = await translateNewsContent(sourceTitle, sourceDescription, sourceLang);
          
          // Update all language fields with translations
          news.title_en = translations.title_en || news.title_en;
          news.title_az = translations.title_az || news.title_az;
          news.title_ru = translations.title_ru || news.title_ru;
          news.description_en = translations.description_en || news.description_en;
          news.description_az = translations.description_az || news.description_az;
          news.description_ru = translations.description_ru || news.description_ru;
        }
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
        // Continue with manual update if translation fails
      }
    }
    
    // IMPORTANT: Only update the fields that are provided
    // This preserves existing data in other languages (unless auto-translate is enabled)
    
    // Update title fields (only if provided and auto-translate is not enabled)
    if (!autoTranslate || autoTranslate === 'false' || autoTranslate === false) {
      if (title_en !== undefined && title_en !== null && title_en !== '') {
        news.title_en = title_en;
      }
      if (title_az !== undefined && title_az !== null && title_az !== '') {
        news.title_az = title_az;
      }
      if (title_ru !== undefined && title_ru !== null && title_ru !== '') {
        news.title_ru = title_ru;
      }
      
      // Support old format
      if (title !== undefined && title !== null && title !== '' && !title_en && !title_az && !title_ru) {
        if (!news.title_en || news.title_en === '') {
          news.title_en = title;
        }
      }
      
      // Update description fields (only if provided)
      if (description_en !== undefined && description_en !== null && description_en !== '') {
        news.description_en = description_en;
      }
      if (description_az !== undefined && description_az !== null && description_az !== '') {
        news.description_az = description_az;
      }
      if (description_ru !== undefined && description_ru !== null && description_ru !== '') {
        news.description_ru = description_ru;
      }
      
      // Support old format
      if (description !== undefined && description !== null && description !== '' && !description_en && !description_az && !description_ru) {
        if (!news.description_en || news.description_en === '') {
          news.description_en = description;
        }
      }
    }
    
    // Update image if provided
    if (image !== undefined) {
      news.image = image;
    }
    
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

