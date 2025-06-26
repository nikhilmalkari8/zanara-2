const mongoose = require('mongoose');

const makeupArtistProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Profile Info
  fullName: { type: String, required: true, trim: true },
  headline: { type: String, default: 'Professional Makeup Artist', trim: true },
  bio: { type: String, maxlength: 2000, trim: true },
  location: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  website: { type: String, trim: true },
  profilePicture: { type: String, trim: true },
  coverPhoto: { type: String, trim: true },
  
  // Professional Information
  yearsExperience: {
    type: String,
    enum: ['0-2', '3-5', '6-10', '11-15', '15+'],
    required: true
  },
  education: { type: String, trim: true },
  certifications: { type: String, trim: true },
  
  // Makeup Specializations
  makeupTypes: [{ type: String, trim: true }],
  techniques: [{ type: String, trim: true }],
  clientTypes: [{ type: String, trim: true }],
  
  // Skills & Expertise
  specialSkills: [{ type: String, trim: true }],
  colorTheoryExpertise: { type: Boolean, default: false },
  skinTypeExpertise: [{ type: String, trim: true }],
  ageGroupExpertise: [{ type: String, trim: true }],
  
  // Product & Brand Knowledge
  preferredBrands: [{ type: String, trim: true }],
  productTypes: [{ type: String, trim: true }],
  kitInformation: { type: String, trim: true },
  hygieneStandards: { type: String, trim: true },
  
  // Business Information
  serviceModel: {
    type: String,
    enum: [
      'freelance-mua',
      'salon-mua',
      'studio-mua',
      'mobile-mua',
      'brand-mua',
      'agency-mua'
    ],
    required: true
  },
  mobileServices: { type: Boolean, default: false },
  studioAccess: { type: String, trim: true },
  equipmentOwned: [{ type: String, trim: true }],
  
  // Specialized Services
  specializedServices: [{
    type: String,
    enum: [
      'Bridal Makeup',
      'Wedding Party Makeup',
      'Editorial Makeup',
      'Fashion Makeup',
      'Beauty Makeup',
      'Commercial Makeup',
      'Special Effects Makeup',
      'Theatrical Makeup',
      'Film/TV Makeup',
      'Photoshoot Makeup',
      'Event Makeup',
      'Party Makeup',
      'Prom Makeup',
      'Graduation Makeup',
      'Corporate Headshots',
      'Red Carpet Makeup',
      'Airbrush Makeup',
      'HD Makeup',
      'Mature Skin Makeup',
      'Men\'s Grooming',
      'Makeup Lessons',
      'Makeup Consultation',
      'Color Analysis',
      'Skincare Consultation',
      'Lash Extensions',
      'Brow Shaping'
    ],
    trim: true
  }],
  
  // Rates & Services
  rates: {
    bridal: { type: String, trim: true },
    photoshoot: { type: String, trim: true },
    special_event: { type: String, trim: true },
    lesson: { type: String, trim: true },
    consultation: { type: String, trim: true },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP']
    }
  },
  
  // Portfolio & Experience
  portfolioWebsite: { type: String, trim: true },
  notableWork: { type: String, trim: true },
  publicationFeatures: { type: String, trim: true },
  competitions: { type: String, trim: true },
  
  // Social Media
  socialMedia: {
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    facebook: { type: String, trim: true },
    blog: { type: String, trim: true }
  },
  
  // Work Preferences
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'project-based', 'seasonal', 'by-appointment'],
    default: 'project-based'
  },
  travelRadius: { type: String, trim: true, default: 'local-only' },
  workEnvironments: [{ type: String, trim: true }],
  bookingAdvance: { type: String, trim: true },
  
  // Portfolio Media
  photos: [{ type: String, trim: true }],
  videos: [{ type: String, trim: true }],
  
  // Status & Analytics
  isComplete: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  profileViews: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5, default: null },
  reviewCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Virtual: Completion %
makeupArtistProfileSchema.virtual('completionPercentage').get(function () {
  let completed = 0;
  const total = 15;

  if (this.fullName?.trim()) completed++;
  if (this.headline?.trim()) completed++;
  if (this.bio?.trim()?.length > 20) completed++;
  if (this.location?.trim()) completed++;
  if (this.yearsExperience) completed++;
  if (this.makeupTypes?.length) completed++;
  if (this.techniques?.length) completed++;
  if (this.clientTypes?.length) completed++;
  if (this.specialSkills?.length) completed++;
  if (this.serviceModel) completed++;
  if (this.rates?.bridal || this.rates?.photoshoot) completed++;
  if (this.portfolioWebsite?.trim()) completed++;
  if (this.socialMedia?.instagram?.trim()) completed++;
  if (this.profilePicture) completed++;

  return Math.round((completed / total) * 100);
});

// Profile score calculation
makeupArtistProfileSchema.methods.calculateProfileScore = function () {
  let score = 0;

  score += this.completionPercentage * 0.4;
  if (this.isVerified) score += 20;
  if (this.photos?.length) score += Math.min(this.photos.length * 2, 20);
  
  const expMap = { '0-2': 5, '3-5': 10, '6-10': 15, '11-15': 20, '15+': 25 };
  score += expMap[this.yearsExperience] || 0;
  
  if (this.makeupTypes?.length) score += Math.min(this.makeupTypes.length * 2, 15);
  if (this.clientTypes?.length) score += Math.min(this.clientTypes.length * 1, 10);
  if (this.specialSkills?.length) score += Math.min(this.specialSkills.length * 1, 10);
  if (this.profileViews > 0) score += Math.min(Math.log10(this.profileViews) * 5, 15);

  return Math.min(Math.round(score), 100);
};

// Indexes
makeupArtistProfileSchema.index({ userId: 1 });
makeupArtistProfileSchema.index({ location: 1 });
makeupArtistProfileSchema.index({ makeupTypes: 1 });
makeupArtistProfileSchema.index({ clientTypes: 1 });
makeupArtistProfileSchema.index({ serviceModel: 1 });
makeupArtistProfileSchema.index({ isComplete: 1 });
makeupArtistProfileSchema.index({ isVerified: 1 });
makeupArtistProfileSchema.index({ profileViews: -1 });
makeupArtistProfileSchema.index({ createdAt: -1 });

// Compound indexes
makeupArtistProfileSchema.index({ makeupTypes: 1, location: 1 });
makeupArtistProfileSchema.index({ isComplete: 1, isVerified: 1 });
makeupArtistProfileSchema.index({ serviceModel: 1, clientTypes: 1 });

module.exports = mongoose.model('MakeupArtistProfile', makeupArtistProfileSchema);