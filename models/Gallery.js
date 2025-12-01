const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  alt: {
    type: String,
    trim: true,
    default: 'Gallery Image'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);

