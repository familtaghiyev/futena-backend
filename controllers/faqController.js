const FAQ = require('../models/FAQ');
const { transformToLanguage, transformArrayToLanguage } = require('../utils/languageHelper');
const { translateQuestionAnswer } = require('../utils/translationHelper');

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawFAQs = faqs.map(item => item.toObject ? item.toObject() : { ...item });
      return res.status(200).json({
        success: true,
        count: rawFAQs.length,
        data: rawFAQs
      });
    }
    
    const transformedFAQs = transformArrayToLanguage(faqs, lang);

    res.status(200).json({
      success: true,
      count: transformedFAQs.length,
      data: transformedFAQs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching FAQs'
    });
  }
};

// Get Single FAQ
exports.getFAQ = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawFAQ = faq.toObject ? faq.toObject() : { ...faq };
      return res.status(200).json({
        success: true,
        data: rawFAQ
      });
    }
    
    const transformedFAQ = transformToLanguage(faq, lang);
    
    res.status(200).json({
      success: true,
      data: transformedFAQ
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching FAQ'
    });
  }
};

// Create FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { 
      question_en, question_az, question_ru, 
      answer_en, answer_az, answer_ru,
      question, answer,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;

    // Support both old and new formats
    const finalQuestionEn = question_en || question || '';
    const finalAnswerEn = answer_en || answer || '';

    if (!finalQuestionEn || !finalAnswerEn) {
      return res.status(400).json({
        success: false,
        message: 'question (or question_en) and answer (or answer_en) are required'
      });
    }

    const sourceLang = sourceLanguage || 'en';
    let faqData = {};

    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        let sourceQuestion = '';
        let sourceAnswer = '';
        
        if (sourceLang === 'en') {
          sourceQuestion = finalQuestionEn;
          sourceAnswer = finalAnswerEn;
        } else if (sourceLang === 'az') {
          sourceQuestion = question_az || finalQuestionEn;
          sourceAnswer = answer_az || finalAnswerEn;
        } else if (sourceLang === 'ru') {
          sourceQuestion = question_ru || finalQuestionEn;
          sourceAnswer = answer_ru || finalAnswerEn;
        }

        const translations = await translateQuestionAnswer(sourceQuestion, sourceAnswer, sourceLang);
        faqData = translations;
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
        faqData = {
          question_en: finalQuestionEn,
          question_az: question_az || '',
          question_ru: question_ru || '',
          answer_en: finalAnswerEn,
          answer_az: answer_az || '',
          answer_ru: answer_ru || ''
        };
      }
    } else {
      faqData = {
      question_en: finalQuestionEn,
      question_az: question_az || '',
      question_ru: question_ru || '',
      answer_en: finalAnswerEn,
      answer_az: answer_az || '',
      answer_ru: answer_ru || ''
      };
    }

    const faq = await FAQ.create(faqData);

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating FAQ'
    });
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { 
      question_en, question_az, question_ru, 
      answer_en, answer_az, answer_ru,
      question, answer,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        const sourceLang = sourceLanguage || 'en';
        let sourceQuestion = '';
        let sourceAnswer = '';
        
        if (sourceLang === 'en') {
          sourceQuestion = question_en || question || faq.question_en || '';
          sourceAnswer = answer_en || answer || faq.answer_en || '';
        } else if (sourceLang === 'az') {
          sourceQuestion = question_az || faq.question_az || '';
          sourceAnswer = answer_az || faq.answer_az || '';
        } else if (sourceLang === 'ru') {
          sourceQuestion = question_ru || faq.question_ru || '';
          sourceAnswer = answer_ru || faq.answer_ru || '';
        }

        if (sourceQuestion && sourceAnswer) {
          const translations = await translateQuestionAnswer(sourceQuestion, sourceAnswer, sourceLang);
          faq.question_en = translations.question_en || faq.question_en;
          faq.question_az = translations.question_az || faq.question_az;
          faq.question_ru = translations.question_ru || faq.question_ru;
          faq.answer_en = translations.answer_en || faq.answer_en;
          faq.answer_az = translations.answer_az || faq.answer_az;
          faq.answer_ru = translations.answer_ru || faq.answer_ru;
        }
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
      }
    }

    // Manual update (only if auto-translate is not enabled)
    if (!autoTranslate || autoTranslate === 'false' || autoTranslate === false) {
    if (question !== undefined && !question_en) {
      faq.question_en = question;
    } else if (question_en !== undefined) {
      faq.question_en = question_en;
    }
    
    if (answer !== undefined && !answer_en) {
      faq.answer_en = answer;
    } else if (answer_en !== undefined) {
      faq.answer_en = answer_en;
    }

    // Update other language fields
    if (question_az !== undefined) faq.question_az = question_az;
    if (question_ru !== undefined) faq.question_ru = question_ru;
    if (answer_az !== undefined) faq.answer_az = answer_az;
    if (answer_ru !== undefined) faq.answer_ru = answer_ru;
    }

    await faq.save();

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating FAQ'
    });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await faq.deleteOne();

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting FAQ'
    });
  }
};

