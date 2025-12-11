const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  // New multi-language format
  name_en: {
    type: String,
    required: false, // Made optional for backward compatibility
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  name_az: {
    type: String,
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  name_ru: {
    type: String,
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  // Old format (for backward compatibility)
  name: {
    type: String,
    required: false,
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  logo: {
    type: String,
    required: [true, 'Logo URL is required'],
    trim: true
  },
  pdfUrl: {
    type: String,
    required: [true, 'PDF URL is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);

