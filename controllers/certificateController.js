const Certificate = require('../models/Certificate');

// Get All Certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
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
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: certificate
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
    const { name, logo, pdfUrl } = req.body;
    
    // Get uploaded files
    const logoFile = req.files && req.files['logo'] ? req.files['logo'][0] : null;
    const pdfFile = req.files && req.files['pdf'] ? req.files['pdf'][0] : null;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'name is required'
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
    
    const certificate = await Certificate.create({
      name,
      logo: logoFile ? logoFile.path : logo,
      pdfUrl: pdfFile ? pdfFile.path : pdfUrl
    });
    
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
    const { name, logo, pdfUrl } = req.body;
    
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
    
    if (name !== undefined) certificate.name = name;
    if (logoFile) {
      certificate.logo = logoFile.path;
    } else if (logo !== undefined) {
      certificate.logo = logo;
    }
    
    if (pdfFile) {
      certificate.pdfUrl = pdfFile.path;
    } else if (pdfUrl !== undefined) {
      certificate.pdfUrl = pdfUrl;
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

