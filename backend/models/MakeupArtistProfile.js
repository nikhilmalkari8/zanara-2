const mongoose = require('mongoose');

const makeupArtistProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Profile Info
  headline: String,
  bio: String,
  location: String,
  phone: String,
  profilePicture: String,
  coverPhoto: String,
  
  // Professional Information
  yearsExperience: {
    type: String,
    enum: ['0-1', '2-3', '4-6', '7-10', '10+']
  },
  education: String,
  certifications: String,
  
  // Makeup Specializations
  makeupTypes: [String],
  techniques: [String],
  clientTypes: [String],
  
  // Skills & Expertise
  specialSkills: [String],
  colorTheoryExpertise: { type: Boolean, default: false },
  skinTypeExpertise: [String],
  ageGroupExpertise: [String],
  
  // Product & Brand Knowledge
  preferredBrands: [String],
  productTypes: [String],
  kitInformation: String,
  hygieneStandards: String,
  
  // Business Information
  mobileServices: { type: Boolean, default: false },
  studioAccess: String,
  equipmentOwned: [String],
  
  // Rates & Services
  rates: {
    bridal: String,
    photoshoot: String,
    special_event: String,
    lesson: String,
    consultation: String,
    currency: { type: String, default: 'USD' }
  },
  
  // Portfolio & Experience
  portfolioWebsite: String,
  notableWork: String,
  publicationFeatures: String,
  competitions: String,
  
  // Social Media
  socialMedia: {
    instagram: String,
    youtube: String,
    tiktok: String,
    facebook: String,
    blog: String
  },
  
  // Work Preferences
  availability: String,
  travelRadius: String,
  workEnvironments: [String],
  bookingAdvance: String,
  
  // Portfolio Media
  photos: [String],
  videos: [String],
  
  // Status
  isComplete: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  profileViews: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('MakeupArtistProfile', makeupArtistProfileSchema);