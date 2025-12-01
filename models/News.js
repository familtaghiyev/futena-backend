const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
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

module.exports = mongoose.model('News', newsSchema);

