const mongoose = require('mongoose');

const modelProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Info
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  languages: [{
    type: String
  }],
  
  // Physical Attributes
  height: {
    type: String,
    required: true
  },
  weight: {
    type: String,
    required: true
  },
  bodyType: {
    type: String,
    enum: ['athletic', 'slim', 'average', 'muscular', 'curvy'],
    required: true
  },
  hairColor: {
    type: String,
    required: true
  },
  eyeColor: {
    type: String,
    required: true
  },
  skinTone: {
    type: String,
    required: true
  },
  
  // Professional Info
  experience: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  specializations: [{
    type: String
  }],
  achievements: [{
    type: String
  }],
  
  // Portfolio
  photos: [{
    type: String // Will store file paths/URLs
  }],
  videos: [{
    type: String // Will store file paths/URLs
  }],
  socialMedia: {
    instagram: String,
    tiktok: String,
    youtube: String
  },
  
  // Preferences
  preferredLocations: [{
    type: String
  }],
  preferredTypes: [{
    type: String
  }],
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'freelance', 'weekends-only'],
    required: true
  },
  rate: {
    hourly: Number,
    daily: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Status
  isComplete: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ModelProfile', modelProfileSchema);