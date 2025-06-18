const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Basic Company Information
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  legalName: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    enum: [
      'fashion', 'photography', 'advertising', 'entertainment', 'modeling-agency',
      'beauty', 'retail', 'media', 'events', 'luxury-brands', 'e-commerce',
      'cosmetics', 'jewelry', 'automotive', 'technology', 'other'
    ]
  },
  companyType: {
    type: String,
    required: true,
    enum: ['agency', 'brand', 'photographer', 'production-house', 'casting-director', 'other']
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000
  },
  tagline: {
    type: String,
    maxLength: 150
  },

  // Contact Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty/null values
        // Updated regex to handle URLs without protocol
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i.test(v);
      },
      message: 'Website must be a valid URL'
    },
    set: function(v) {
      // Automatically add https:// if no protocol is provided
      if (v && !v.match(/^https?:\/\//)) {
        return 'https://' + v;
      }
      return v;
    }
  },

  // Address Information
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Company Details
  foundedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  companySize: {
    type: String,
    enum: [
      '1-5',        // Updated to match frontend
      '6-15',       // Added this value
      '16-50',      // Updated to match frontend  
      '51+',        // Updated to match frontend
      '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'  // Keep existing values for backward compatibility
    ]
  },
  registrationNumber: {
    type: String,
    sparse: true // Allows multiple null values
  },
  taxId: {
    type: String,
    sparse: true
  },

  // Visual Assets
  logo: {
    type: String, // URL to logo image
  },
  coverImage: {
    type: String, // URL to cover/banner image
  },
  companyImages: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['office', 'team', 'work', 'event', 'other']
    }
  }],

  // Social Media & Online Presence
  socialMedia: {
    linkedin: String,
    instagram: String,
    facebook: String,
    twitter: String,
    youtube: String,
    behance: String,
    pinterest: String
  },

  // Company Culture & Values
  values: [{
    type: String
  }],
  culture: {
    type: String,
    maxLength: 1000
  },
  benefits: [{
    type: String
  }],

  // Specializations & Services
  specializations: [{
    type: String
  }],
  services: [{
    name: String,
    description: String
  }],
  clientTypes: [{
    type: String,
    enum: [
      // Updated to match frontend values exactly
      'Fashion Brands',
      'Beauty Brands', 
      'Advertising Agencies',
      'Photographers',
      'Fashion Magazines',
      'E-commerce Companies',
      'Luxury Brands',
      'Retail Companies',
      'Casting Directors',
      'Production Companies',
      'Event Planners',
      'PR Agencies',
      // Keep existing values for backward compatibility
      'fashion-models', 'commercial-models', 'plus-size-models', 'fitness-models', 
      'child-models', 'senior-models', 'alternative-models', 'runway-models'
    ]
  }],

  // Agency-specific fields (for agencies)
  agencyType: {
    type: String,
    enum: [
      'Full-Service Modeling Agency',
      'Fashion Modeling Agency', 
      'Commercial Modeling Agency',
      'Talent Management Agency',
      'Casting Agency',
      'Boutique Agency',
      'Plus-Size Modeling Agency',
      'Child Modeling Agency',
      'Fitness Modeling Agency',
      'Hand/Parts Modeling Agency'
    ]
  },
  licenseNumber: {
    type: String,
    sparse: true
  },
  agencyServices: [{
    type: String,
    enum: [
      'Model Representation', 'Talent Scouting', 'Career Development',
      'Portfolio Development', 'Casting Services', 'Event Planning',
      'Brand Partnerships', 'Social Media Management', 'PR Services',
      'Training & Workshops', 'Contract Negotiation', 'International Placements'
    ]
  }],
  talentTypes: [{
    type: String,
    enum: [
      'Fashion Models', 'Commercial Models', 'Runway Models',
      'Print Models', 'Plus-Size Models', 'Petite Models',
      'Fitness Models', 'Hand Models', 'Child Models',
      'Senior Models', 'Alternative Models', 'Influencers',
      'Actors', 'Dancers', 'Musicians', 'Voice Talent'
    ]
  }],
  industryFocus: [{
    type: String,
    enum: [
      'High Fashion', 'Commercial Fashion', 'Beauty & Cosmetics',
      'Fitness & Athletic', 'Lifestyle', 'Luxury Brands',
      'E-commerce', 'Advertising', 'Editorial', 'Catalog',
      'Automotive', 'Technology', 'Food & Beverage', 'Travel'
    ]
  }],

  // Portfolio & Work
  portfolio: {
    projects: [{
      title: String,
      description: String,
      images: [String],
      year: Number,
      category: String,
      client: String
    }],
    awards: [{
      title: String,
      year: Number,
      organization: String,
      description: String
    }],
    certifications: [{
      name: String,
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String
    }]
  },

  // Team Members (employees, contractors, etc.)
  team: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    position: String,
    department: String,
    profileImage: String,
    bio: String,
    joinDate: Date,
    isPublic: {
      type: Boolean,
      default: true
    },
    permissions: {
      canPostJobs: { type: Boolean, default: false },
      canManageApplications: { type: Boolean, default: false },
      canManageTeam: { type: Boolean, default: false },
      canEditCompany: { type: Boolean, default: false }
    }
  }],

  // Business Information
  businessHours: {
    monday: { open: String, close: String, isClosed: Boolean },
    tuesday: { open: String, close: String, isClosed: Boolean },
    wednesday: { open: String, close: String, isClosed: Boolean },
    thursday: { open: String, close: String, isClosed: Boolean },
    friday: { open: String, close: String, isClosed: Boolean },
    saturday: { open: String, close: String, isClosed: Boolean },
    sunday: { open: String, close: String, isClosed: Boolean }
  },

  // Verification & Trust
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    documentType: {
      type: String,
      enum: ['business-license', 'tax-certificate', 'insurance', 'other']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Statistics & Analytics
  stats: {
    profileViews: { type: Number, default: 0 },
    jobsPosted: { type: Number, default: 0 },
    hires: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },

  // Settings & Preferences
  settings: {
    isPublic: { type: Boolean, default: true },
    allowMessages: { type: Boolean, default: true },
    showTeam: { type: Boolean, default: true },
    showProjects: { type: Boolean, default: true },
    emailNotifications: {
      newApplications: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      profileViews: { type: Boolean, default: false }
    }
  },

  // Admin & Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending-verification'],
    default: 'pending-verification'
  },

  // SEO & Discoverability
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  keywords: [{
    type: String
  }],

  // Subscription & Plan (for future monetization)
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    expiryDate: Date,
    jobPostingLimit: { type: Number, default: 5 },
    featuredListings: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for better performance
companySchema.index({ companyName: 'text', description: 'text' });
companySchema.index({ industry: 1, companyType: 1 });
companySchema.index({ 'address.city': 1, 'address.country': 1 });
companySchema.index({ slug: 1 });
companySchema.index({ email: 1 });

// Generate slug before saving
companySchema.pre('save', function(next) {
  if (this.isModified('companyName') && !this.slug) {
    this.slug = this.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Virtual for full address
companySchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state}, ${this.address.country} ${this.address.zipCode}`;
});

// Method to calculate completion percentage
companySchema.methods.getCompletionPercentage = function() {
  let completed = 0;
  const total = 20; // Total checkpoints

  // Basic info (5 points)
  if (this.companyName) completed++;
  if (this.description && this.description.length > 50) completed++;
  if (this.industry) completed++;
  if (this.companyType) completed++;
  if (this.website) completed++;

  // Contact & Address (3 points)
  if (this.email) completed++;
  if (this.phone) completed++;
  if (this.address.street && this.address.city) completed++;

  // Visual assets (3 points)
  if (this.logo) completed++;
  if (this.coverImage) completed++;
  if (this.companyImages && this.companyImages.length > 0) completed++;

  // Company details (4 points)
  if (this.foundedYear) completed++;
  if (this.companySize) completed++;
  if (this.values && this.values.length > 0) completed++;
  if (this.specializations && this.specializations.length > 0) completed++;

  // Social media (2 points)
  const socialCount = Object.values(this.socialMedia || {}).filter(Boolean).length;
  if (socialCount >= 2) completed++;
  if (socialCount >= 4) completed++;

  // Team & Portfolio (3 points)
  if (this.team && this.team.length > 0) completed++;
  if (this.portfolio.projects && this.portfolio.projects.length > 0) completed++;
  if (this.services && this.services.length > 0) completed++;

  return Math.round((completed / total) * 100);
};

module.exports = mongoose.model('Company', companySchema);