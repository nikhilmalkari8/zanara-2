const mongoose = require('mongoose');

const fashionDesignerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Basic Profile Information
  fullName: { type: String, required: true, trim: true },
  headline: { type: String, default: 'Fashion Designer', trim: true },
  bio: { type: String, maxlength: 2000, trim: true },
  location: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  website: { type: String, trim: true },
  profilePicture: { type: String, trim: true },
  coverPhoto: { type: String, trim: true },

  // Professional Background
  yearsExperience: {
    type: String,
    enum: ['0-2', '3-5', '6-10', '11-15', '15+'],
    required: true
  },
  education: { type: String, trim: true },
  designPhilosophy: { type: String, trim: true },

  // Design Specializations
  designCategories: [{ type: String, trim: true }],
  productTypes: [{ type: String, trim: true }],
  designStyles: [{ type: String, trim: true }],

  // Business & Production
  businessModel: {
    type: String,
    enum: [
      'independent-designer',
      'fashion-brand-owner',
      'freelance-designer',
      'design-consultant',
      'custom-couture',
      'pattern-maker',
      'design-studio'
    ],
    required: true
  },
  
  productionCapacity: { type: String, trim: true },
  manufacturingKnowledge: { type: String, trim: true },
  sustainabilityPractices: { type: String, trim: true },
  qualityStandards: { type: String, trim: true },

  // Portfolio & Collections
  portfolioWebsite: { type: String, trim: true },
  collections: { type: String, trim: true },
  designAwards: { type: String, trim: true },
  exhibitions: { type: String, trim: true },
  collaborations: { type: String, trim: true },

  // Social Media & Professional Links
  socialMedia: {
    instagram: { type: String, trim: true },
    behance: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    website: { type: String, trim: true },
    blog: { type: String, trim: true }
  },

  // Services & Pricing
  servicesOffered: [{ type: String, trim: true }],
  customDesign: { type: Boolean, default: false },
  consultingServices: { type: Boolean, default: false },
  rates: {
    consultationHourly: { type: String, trim: true },
    customDesignStarting: { type: String, trim: true },
    patternMaking: { type: String, trim: true },
    technicalDrawings: { type: String, trim: true },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP']
    }
  },

  // Work Preferences
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'project-based', 'seasonal', 'by-commission'],
    default: 'project-based'
  },
  projectTypes: [{ type: String, trim: true }],
  collaborationStyle: { type: String, trim: true },
  clientTypes: [{ type: String, trim: true }],

  // Portfolio Images
  photos: [{ type: String, trim: true }],
  profilePicture: { type: String, trim: true },
  coverPhoto: { type: String, trim: true },

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
fashionDesignerProfileSchema.virtual('completionPercentage').get(function () {
  let completed = 0;
  const total = 15;

  if (this.fullName?.trim()) completed++;
  if (this.headline?.trim()) completed++;
  if (this.bio?.trim()?.length > 20) completed++;
  if (this.location?.trim()) completed++;
  if (this.yearsExperience) completed++;
  if (this.designCategories?.length) completed++;
  if (this.designStyles?.length) completed++;
  if (this.businessModel) completed++;
  if (this.servicesOffered?.length) completed++;
  if (this.rates?.consultationHourly || this.rates?.customDesignStarting) completed++;
  if (this.portfolioWebsite?.trim()) completed++;
  if (this.socialMedia?.instagram?.trim()) completed++;
  if (this.photos?.length) completed++;
  if (this.profilePicture) completed++;

  return Math.round((completed / total) * 100);
});

// Profile score calculation
fashionDesignerProfileSchema.methods.calculateProfileScore = function () {
  let score = 0;

  score += this.completionPercentage * 0.4;
  if (this.isVerified) score += 20;
  if (this.photos?.length) score += Math.min(this.photos.length * 2, 20);
  
  const expMap = { '0-2': 5, '3-5': 10, '6-10': 15, '11-15': 20, '15+': 25 };
  score += expMap[this.yearsExperience] || 0;
  
  if (this.designCategories?.length) score += Math.min(this.designCategories.length * 2, 15);
  if (this.clientTypes?.length) score += Math.min(this.clientTypes.length * 1, 10);
  if (this.servicesOffered?.length) score += Math.min(this.servicesOffered.length * 1, 10);
  if (this.profileViews > 0) score += Math.min(Math.log10(this.profileViews) * 5, 15);

  return Math.min(Math.round(score), 100);
};

// Indexes
fashionDesignerProfileSchema.index({ userId: 1 });
fashionDesignerProfileSchema.index({ location: 1 });
fashionDesignerProfileSchema.index({ designCategories: 1 });
fashionDesignerProfileSchema.index({ businessModel: 1 });
fashionDesignerProfileSchema.index({ isComplete: 1 });
fashionDesignerProfileSchema.index({ isVerified: 1 });
fashionDesignerProfileSchema.index({ profileViews: -1 });
fashionDesignerProfileSchema.index({ createdAt: -1 });

// Compound indexes
fashionDesignerProfileSchema.index({ designCategories: 1, location: 1 });
fashionDesignerProfileSchema.index({ isComplete: 1, isVerified: 1 });
fashionDesignerProfileSchema.index({ businessModel: 1, clientTypes: 1 });

module.exports = mongoose.model('FashionDesignerProfile', fashionDesignerProfileSchema);