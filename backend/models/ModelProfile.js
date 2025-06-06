const mongoose = require('mongoose');

const modelProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // ⭐ MISSING FIELDS THAT YOUR FRONTEND NEEDS ⭐
  headline: {
    type: String,
    maxlength: 200
  },
  bio: {
    type: String,
    maxlength: 2000
  },
  location: {
    type: String,
    maxlength: 100
  },
  phone: {
    type: String,
    maxlength: 20
  },
  website: {
    type: String,
    maxlength: 200
  },
  profilePicture: {
    type: String // File path for profile picture
  },
  coverPhoto: {
    type: String // File path for cover photo
  },
  
  // Basic Info (existing)
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
  
  // Physical Attributes (existing)
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
  
  // Professional Info (existing)
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
  
  // Portfolio (existing)
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
  
  // Preferences (existing)
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
  
  // Status (existing)
  isComplete: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // Metrics & Activity (existing)
  profileViews: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  connections: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ModelProfile', modelProfileSchema);