const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  paragraph: {
    type: String,
    required: [true, 'Paragraph is required'],
    trim: true,
    maxlength: [1000, 'Paragraph cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Slider', sliderSchema);

