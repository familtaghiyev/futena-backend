const Certificate = require('../models/Certificate');
const { transformToLanguage, transformArrayToLanguage } = require('../utils/languageHelper');
const { translateName } = require('../utils/translationHelper');

// Get All Certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawCertificates = certificates.map(item => item.toObject ? item.toObject() : { ...item });
      return res.status(200).json({
        success: true,
        count: rawCertificates.length,
        data: rawCertificates
      });
    }
    
    const transformedCertificates = transformArrayToLanguage(certificates, lang);
    
    res.status(200).json({
      success: true,
      count: transformedCertificates.length,
      data: transformedCertificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching certificates'
    });
  }
};

// Get Single Certificate
exports.getCertificate = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawCertificate = certificate.toObject ? certificate.toObject() : { ...certificate };
      return res.status(200).json({
        success: true,
        data: rawCertificate
      });
    }
    
    const transformedCertificate = transformToLanguage(certificate, lang);
    
    res.status(200).json({
      success: true,
      data: transformedCertificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching certificate'
    });
  }
};

// Create Certificate
exports.createCertificate = async (req, res) => {
  try {
    const { 
      name_en, name_az, name_ru,
      name,  // Old format support
      logo, pdfUrl,
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    
    // Get uploaded files
    const logoFile = req.files && req.files['logo'] ? req.files['logo'][0] : null;
    const pdfFile = req.files && req.files['pdf'] ? req.files['pdf'][0] : null;
    
    // Support both old and new formats
    const finalNameEn = name_en || name || '';
    
    // Validate required fields
    if (!finalNameEn) {
      return res.status(400).json({
        success: false,
        message: 'name (or name_en) is required'
      });
    }
    
    // Logo is required (either file or URL)
    if (!logoFile && !logo) {
      return res.status(400).json({
        success: false,
        message: 'logo is required (upload file or provide URL)'
      });
    }
    
    // PDF URL is required (either file or URL)
    if (!pdfFile && !pdfUrl) {
      return res.status(400).json({
        success: false,
        message: 'PDF is required (upload file or provide URL)'
      });
    }
    
    const sourceLang = sourceLanguage || 'en';
    let certificateData = {
      logo: logoFile ? logoFile.path : logo,
      pdfUrl: pdfFile ? pdfFile.path : pdfUrl
    };

    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        let sourceName = '';
        
        if (sourceLang === 'en') {
          sourceName = finalNameEn;
        } else if (sourceLang === 'az') {
          sourceName = name_az || finalNameEn;
        } else if (sourceLang === 'ru') {
          sourceName = name_ru || finalNameEn;
        }

        const translations = await translateName(sourceName, sourceLang);
        certificateData = { ...certificateData, ...translations };
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
        certificateData = {
          ...certificateData,
          name_en: finalNameEn,
          name_az: name_az || '',
          name_ru: name_ru || ''
        };
      }
    } else {
      certificateData = {
        ...certificateData,
        name_en: finalNameEn,
        name_az: name_az || '',
        name_ru: name_ru || ''
      };
    }
    
    // Add old format for backward compatibility
    certificateData.name = certificateData.name_en || finalNameEn;
    
    const certificate = await Certificate.create(certificateData);
    
    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating certificate'
    });
  }
};

// Update Certificate
exports.updateCertificate = async (req, res) => {
  try {
    const { 
      name_en, name_az, name_ru,
      name,  // Old format support
      logo, pdfUrl,
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // Get uploaded files
    const logoFile = req.files && req.files['logo'] ? req.files['logo'][0] : null;
    const pdfFile = req.files && req.files['pdf'] ? req.files['pdf'][0] : null;
    
    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        const sourceLang = sourceLanguage || 'en';
        let sourceName = '';
        
        if (sourceLang === 'en') {
          sourceName = name_en || name || certificate.name_en || '';
        } else if (sourceLang === 'az') {
          sourceName = name_az || certificate.name_az || '';
        } else if (sourceLang === 'ru') {
          sourceName = name_ru || certificate.name_ru || '';
        }

        if (sourceName) {
          const translations = await translateName(sourceName, sourceLang);
          certificate.name_en = translations.name_en || certificate.name_en;
          certificate.name_az = translations.name_az || certificate.name_az;
          certificate.name_ru = translations.name_ru || certificate.name_ru;
        }
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
      }
    }

    // Manual update (only if auto-translate is not enabled)
    if (!autoTranslate || autoTranslate === 'false' || autoTranslate === false) {
      if (name !== undefined && !name_en) {
        certificate.name_en = name;
        certificate.name = name;
      } else if (name_en !== undefined) {
        certificate.name_en = name_en;
        certificate.name = name_en;
      }
      
      if (name_az !== undefined) certificate.name_az = name_az;
      if (name_ru !== undefined) certificate.name_ru = name_ru;
    }
    
    // Update logo
    if (logoFile) {
      certificate.logo = logoFile.path;
    } else if (logo !== undefined) {
      certificate.logo = logo;
    }
    
    // Update PDF
    if (pdfFile) {
      certificate.pdfUrl = pdfFile.path;
    } else if (pdfUrl !== undefined) {
      certificate.pdfUrl = pdfUrl;
    }
    
    // Update old format for backward compatibility
    if (certificate.name_en) {
      certificate.name = certificate.name_en;
    }
    
    await certificate.save();
    
    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating certificate'
    });
  }
};

// Delete Certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    await certificate.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting certificate'
    });
  }
};

