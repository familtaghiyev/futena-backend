const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Certificate name is required'],
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

