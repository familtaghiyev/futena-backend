const mongoose = require('mongoose');

const usageAreaSchema = new mongoose.Schema({
  // New multi-language format
  title_en: {
    type: String,
    required: false, // Made optional for backward compatibility
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  title_az: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  title_ru: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  paragraph_en: {
    type: String,
    required: false, // Made optional for backward compatibility
    trim: true,
    maxlength: [2000, 'Paragraph cannot exceed 2000 characters']
  },
  paragraph_az: {
    type: String,
    trim: true,
    maxlength: [2000, 'Paragraph cannot exceed 2000 characters']
  },
  paragraph_ru: {
    type: String,
    trim: true,
    maxlength: [2000, 'Paragraph cannot exceed 2000 characters']
  },
  // Old format (for backward compatibility)
  title: {
    type: String,
    required: false,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  paragraph: {
    type: String,
    required: false,
    trim: true,
    maxlength: [2000, 'Paragraph cannot exceed 2000 characters']
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UsageArea', usageAreaSchema);

