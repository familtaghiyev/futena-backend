const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Model name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  modelType: {
    type: String,
    required: [true, 'Model type is required'],
    enum: ['text', 'image', 'video', 'audio', 'multimodal']
  },
  provider: {
    type: String,
    trim: true
  },
  apiEndpoint: {
    type: String,
    trim: true
  },
  apiKey: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AIModel', aiModelSchema);

