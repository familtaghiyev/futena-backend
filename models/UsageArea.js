const mongoose = require('mongoose');

const usageAreaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  paragraph: {
    type: String,
    required: [true, 'Paragraph is required'],
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

