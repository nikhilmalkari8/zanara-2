const mongoose = require('mongoose');

const modelProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Profile Info
  fullName: { type: String, required: true, trim: true },
  headline: { type: String, default: 'Professional Model', trim: true },
  bio: { type: String, maxlength: 2000, trim: true },
  location: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  website: { type: String, trim: true },
  profilePicture: { type: String, trim: true },
  coverPhoto: { type: String, trim: true },
  
  // Personal Information
  dateOfBirth: { type: Date, required: true },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  nationality: { type: String, required: true, trim: true },
  languages: [{ type: String, trim: true }],
  
  // Physical Attributes
  height: { type: String, required: true, trim: true },
  weight: { type: String, required: true, trim: true },
  bust: { type: String, trim: true },
  waist: { type: String, trim: true },
  hips: { type: String, trim: true },
  dressSize: { type: String, trim: true },
  shoeSize: { type: String, trim: true },
  bodyType: { type: String, trim: true },
  hairColor: { type: String, trim: true },
  eyeColor: { type: String, trim: true },
  skinTone: { type: String, trim: true },
  
  // Professional Information
  yearsExperience: {
    type: String,
    enum: ['0-2', '3-5', '6-10', '11-15', '15+'],
    required: true
  },
  modelType: {
    type: String,
    enum: ['fashion', 'commercial', 'runway', 'editorial', 'fitness', 'plus-size', 'petite', 'mature'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'experienced', 'professional'],
    required: true
  },
  agencies: { type: String, trim: true },
  unionMembership: { type: String, trim: true },

  // Experience (array of objects)
  experience: [
    {
      role: { type: String, trim: true },
      company: { type: String, trim: true },
      duration: { type: String, trim: true },
      description: { type: String, trim: true },
      current: { type: Boolean, default: false }
    }
  ],
  
  // Portfolio & Media
  portfolioWebsite: { type: String, trim: true },
  photos: [{ type: String, trim: true }],
  videos: [{ type: String, trim: true }],
  socialMedia: {
    instagram: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true }
  },
  
  // Work Preferences
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'project-based', 'seasonal', 'by-appointment'],
    default: 'project-based'
  },
  travelWillingness: {
    type: String,
    enum: ['local-only', 'regional', 'national', 'international', 'flexible'],
    default: 'local-only'
  },
  preferredLocations: [{ type: String, trim: true }],
  workTypes: [{ type: String, trim: true }],
  nudityComfort: { type: String, trim: true },
  
  // Rate Information
  rates: {
    hourly: { type: String, trim: true },
    halfDay: { type: String, trim: true },
    fullDay: { type: String, trim: true },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP']
    }
  },
  
  // Special Skills
  specialSkills: [{ type: String, trim: true }],
  wardrobe: { type: String, trim: true },
  props: { type: String, trim: true },
  
  // Status & Analytics
  isComplete: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  profileViews: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5, default: null },
  reviewCount: { type: Number, default: 0 },
  connections: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual: Completion %
modelProfileSchema.virtual('completionPercentage').get(function () {
  let completed = 0;
  const total = 15;

  if (this.fullName?.trim()) completed++;
  if (this.headline?.trim()) completed++;
  if (this.bio?.trim()?.length > 20) completed++;
  if (this.location?.trim()) completed++;
  if (this.yearsExperience) completed++;
  if (this.modelType) completed++;
  if (this.experienceLevel) completed++;
  if (this.height?.trim()) completed++;
  if (this.weight?.trim()) completed++;
  if (this.rates?.hourly || this.rates?.fullDay) completed++;
  if (this.portfolioWebsite?.trim()) completed++;
  if (this.socialMedia?.instagram?.trim()) completed++;
  if (this.photos?.length) completed++;
  if (this.profilePicture) completed++;

  return Math.round((completed / total) * 100);
});

// Profile score calculation
modelProfileSchema.methods.calculateProfileScore = function () {
  let score = 0;

  score += this.completionPercentage * 0.4;
  if (this.isVerified) score += 20;
  if (this.photos?.length) score += Math.min(this.photos.length * 2, 20);
  
  const expMap = { '0-2': 5, '3-5': 10, '6-10': 15, '11-15': 20, '15+': 25 };
  score += expMap[this.yearsExperience] || 0;
  
  if (this.workTypes?.length) score += Math.min(this.workTypes.length * 2, 15);
  if (this.specialSkills?.length) score += Math.min(this.specialSkills.length * 1, 10);
  if (this.profileViews > 0) score += Math.min(Math.log10(this.profileViews) * 5, 15);

  return Math.min(Math.round(score), 100);
};

// Indexes
modelProfileSchema.index({ userId: 1 });
modelProfileSchema.index({ location: 1 });
modelProfileSchema.index({ modelType: 1 });
modelProfileSchema.index({ experienceLevel: 1 });
modelProfileSchema.index({ isComplete: 1 });
modelProfileSchema.index({ isVerified: 1 });
modelProfileSchema.index({ profileViews: -1 });
modelProfileSchema.index({ createdAt: -1 });

// Compound indexes
modelProfileSchema.index({ modelType: 1, location: 1 });
modelProfileSchema.index({ isComplete: 1, isVerified: 1 });
modelProfileSchema.index({ experienceLevel: 1, modelType: 1 });

module.exports = mongoose.model('ModelProfile', modelProfileSchema);