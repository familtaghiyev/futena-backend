const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // New multi-language format
  title_en: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: ''
  },
  title_az: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: ''
  },
  title_ru: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: ''
  },
  description_en: {
    type: String,
    required: false, // Made optional for backward compatibility
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  description_az: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  description_ru: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  // Old format (for backward compatibility)
  title: {
    type: String,
    required: false,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: ''
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

