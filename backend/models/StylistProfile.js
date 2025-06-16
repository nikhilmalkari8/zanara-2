const mongoose = require('mongoose');

const stylistProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Basic Profile Information
  fullName: { type: String, required: true, trim: true },
  headline: { type: String, default: 'Fashion Stylist', trim: true },
  bio: { type: String, maxlength: 2000, trim: true },
  location: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },

  // Professional Background
  yearsExperience: {
    type: String,
    enum: ['0-2', '3-5', '6-10', '11-15', '15+'],
    required: true
  },
  education: { type: String, trim: true },
  certifications: { type: String, trim: true },

  stylingTypes: [{
    type: String,
    enum: [
      'Editorial Styling', 'Personal Styling', 'Commercial Styling',
      'Celebrity Styling', 'Wardrobe Consulting', 'E-commerce Styling',
      'Event Styling', 'Red Carpet Styling', 'Music Video Styling',
      'Fashion Show Styling', 'Photoshoot Styling', 'Brand Styling',
      'Corporate Styling', 'Bridal Styling', 'Maternity Styling'
    ]
  }],
  clientTypes: [{
    type: String,
    enum: [
      'Individual Clients', 'Fashion Brands', 'Photographers', 'Models',
      'Celebrities', 'Influencers', 'Corporate Executives', 'Brides',
      'Fashion Magazines', 'Advertising Agencies', 'E-commerce Brands',
      'Music Artists', 'TV/Film Productions', 'Event Planners'
    ]
  }],
  fashionCategories: [{
    type: String,
    enum: [
      'Womenswear', 'Menswear', 'Plus-Size Fashion', 'Petite Fashion',
      'Maternity Fashion', 'Teen/Young Adult', 'Professional/Corporate',
      'Casual/Everyday', 'Formal/Evening', 'Street Style', 'Vintage/Retro',
      'Sustainable Fashion', 'Luxury Fashion', 'Budget-Friendly'
    ]
  }],
  styleAesthetics: [{
    type: String,
    enum: [
      'Minimalist', 'Bohemian', 'Classic/Timeless', 'Edgy/Alternative',
      'Romantic/Feminine', 'Sporty/Athletic', 'Preppy', 'Glamorous',
      'Vintage-Inspired', 'Street Style', 'Avant-Garde', 'Scandinavian',
      'Mediterranean', 'Urban Chic', 'Country/Rustic'
    ]
  }],
  servicesOffered: [{
    type: String,
    enum: [
      'Personal Shopping', 'Wardrobe Audit', 'Closet Organization',
      'Color Analysis', 'Body Type Consultation', 'Occasion Styling',
      'Capsule Wardrobe Creation', 'Shopping List Creation',
      'Style Education/Training', 'Fashion Photography Direction',
      'Trend Forecasting', 'Brand Consulting', 'Styling Workshops'
    ]
  }],
  designerKnowledge: [{
    type: String,
    enum: [
      'High-End Designers', 'Contemporary Brands', 'Fast Fashion',
      'Sustainable Brands', 'Emerging Designers', 'Vintage Collectors',
      'International Brands', 'Local/Independent Brands', 'Accessories Specialists',
      'Footwear Brands', 'Beauty Brands', 'Lifestyle Brands'
    ]
  }],
  brandRelationships: { type: String, trim: true },
  trendForecasting: { type: String, trim: true },
  colorAnalysis: { type: Boolean, default: false },
  bodyTypeExpertise: { type: Boolean, default: false },

  // Business Information
  serviceModel: {
    type: String,
    enum: [
      'personal-stylist', 'freelance-stylist', 'styling-agency',
      'styling-consultant', 'wardrobe-stylist', 'fashion-stylist'
    ],
    required: true
  },
  consultationProcess: { type: String, trim: true },
  shoppingServices: { type: Boolean, default: false },
  wardrobeAudit: { type: Boolean, default: false },
  closetOrganization: { type: Boolean, default: false },

  rates: {
    consultation: { type: String, trim: true },
    personalStyling: { type: String, trim: true },
    editorialDay: { type: String, trim: true },
    shoppingHourly: { type: String, trim: true },
    packageDeals: { type: String, trim: true },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    }
  },

  // Portfolio & Experience
  portfolioWebsite: { type: String, trim: true },
  editorialWork: { type: String, trim: true },
  brandCollaborations: { type: String, trim: true },
  celebrityClients: { type: String, trim: true },
  publications: { type: String, trim: true },

  // Social Media
  socialMedia: {
    instagram: { type: String, trim: true },
    pinterest: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    blog: { type: String, trim: true },
    tiktok: { type: String, trim: true }
  },

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
  workEnvironments: [{
    type: String,
    enum: [
      'Client Homes', 'Retail Stores', 'Photography Studios', 'Fashion Shows',
      'Corporate Offices', 'Special Events', 'Virtual Consultations',
      'Fashion Weeks', 'Trade Shows', 'Red Carpet Events'
    ]
  }],
  collaborationStyle: { type: String, trim: true },
  photos: [{ type: String, trim: true }],
  profilePicture: { type: String, trim: true },
  coverPhoto: { type: String, trim: true },

  isComplete: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  profileViews: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5, default: null },
  reviewCount: { type: Number, default: 0 },

  // Legacy compatibility
  skills: [{ type: String, trim: true }],
  specializations: [{ type: String, trim: true }],
  experience: { type: String, trim: true },
  preferredTypes: [{ type: String, trim: true }],
  website: { type: String, trim: true },
  rate: {
    hourly: String,
    daily: String,
    currency: {
      type: String,
      default: 'USD'
    }
  }
}, {
  timestamps: true
});

// Virtual: Completion %
stylistProfileSchema.virtual('completionPercentage').get(function () {
  let completed = 0;
  const total = 15;

  if (this.fullName?.trim()) completed++;
  if (this.headline?.trim()) completed++;
  if (this.bio?.trim()?.length > 20) completed++;
  if (this.location?.trim()) completed++;
  if (this.yearsExperience) completed++;
  if (this.stylingTypes?.length) completed++;
  if (this.serviceModel) completed++;
  if (this.clientTypes?.length) completed++;
  if (this.servicesOffered?.length) completed++;
  if (this.styleAesthetics?.length) completed++;
  if (this.availability) completed++;
  if (this.travelWillingness) completed++;
  if (this.rates?.consultation || this.rates?.personalStyling) completed++;
  if (this.portfolioWebsite?.trim()) completed++;
  if (this.profilePicture) completed++;

  return Math.round((completed / total) * 100);
});

// Profile score calculation
stylistProfileSchema.methods.calculateProfileScore = function () {
  let score = 0;

  score += this.completionPercentage * 0.4;
  if (this.isVerified) score += 20;
  if (this.photos?.length) score += Math.min(this.photos.length * 2, 20);
  
  const expMap = { '0-2': 5, '3-5': 10, '6-10': 15, '11-15': 20, '15+': 25 };
  score += expMap[this.yearsExperience] || 0;
  
  if (this.stylingTypes?.length) score += Math.min(this.stylingTypes.length * 2, 15);
  if (this.clientTypes?.length) score += Math.min(this.clientTypes.length * 1, 10);
  if (this.servicesOffered?.length) score += Math.min(this.servicesOffered.length * 1, 10);
  if (this.profileViews > 0) score += Math.min(Math.log10(this.profileViews) * 5, 15);

  return Math.min(Math.round(score), 100);
};

// Middleware to map legacy fields
stylistProfileSchema.pre('save', function (next) {
  if (this.servicesOffered && this.designerKnowledge) {
    this.skills = [...this.servicesOffered, ...this.designerKnowledge];
  }
  if (this.stylingTypes) this.specializations = this.stylingTypes;
  if (this.bio) this.experience = this.bio;
  if (this.clientTypes) this.preferredTypes = this.clientTypes;
  if (this.portfolioWebsite) this.website = this.portfolioWebsite;

  if (this.rates) {
    this.rate = {
      hourly: this.rates.consultation,
      daily: this.rates.personalStyling,
      currency: this.rates.currency || 'USD'
    };
  }

  const requiredFields = ['fullName', 'location', 'yearsExperience', 'serviceModel'];
  const hasRequiredArrays =
    this.stylingTypes?.length > 0 &&
    this.clientTypes?.length > 0;

  const hasAllRequired = requiredFields.every(field =>
    this[field] && this[field].toString().trim()
  );

  this.isComplete = hasAllRequired && hasRequiredArrays;
  next();
});

// Indexes
stylistProfileSchema.index({ userId: 1 });
stylistProfileSchema.index({ location: 1 });
stylistProfileSchema.index({ stylingTypes: 1 });
stylistProfileSchema.index({ clientTypes: 1 });
stylistProfileSchema.index({ serviceModel: 1 });
stylistProfileSchema.index({ availability: 1 });
stylistProfileSchema.index({ isComplete: 1 });
stylistProfileSchema.index({ isVerified: 1 });
stylistProfileSchema.index({ profileViews: -1 });
stylistProfileSchema.index({ createdAt: -1 });

// Compound indexes
stylistProfileSchema.index({ stylingTypes: 1, location: 1 });
stylistProfileSchema.index({ isComplete: 1, isVerified: 1 });
stylistProfileSchema.index({ serviceModel: 1, clientTypes: 1 });

module.exports = mongoose.model('StylistProfile', stylistProfileSchema);
