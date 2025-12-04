const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  // New multi-language format
  question_en: {
    type: String,
    required: false, // Made optional for backward compatibility
    trim: true,
    maxlength: [300, 'Question cannot exceed 300 characters']
  },
  question_az: {
    type: String,
    trim: true,
    maxlength: [300, 'Question cannot exceed 300 characters']
  },
  question_ru: {
    type: String,
    trim: true,
    maxlength: [300, 'Question cannot exceed 300 characters']
  },
  answer_en: {
    type: String,
    required: false, // Made optional for backward compatibility
    trim: true,
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  },
  answer_az: {
    type: String,
    trim: true,
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  },
  answer_ru: {
    type: String,
    trim: true,
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  },
  // Old format (for backward compatibility)
  question: {
    type: String,
    required: false,
    trim: true,
    maxlength: [300, 'Question cannot exceed 300 characters']
  },
  answer: {
    type: String,
    required: false,
    trim: true,
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FAQ', faqSchema);

