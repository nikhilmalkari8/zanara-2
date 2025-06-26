const mongoose = require('mongoose');

const photographerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Basic Profile Information
  fullName: { type: String, required: true, trim: true },
  headline: { type: String, default: 'Professional Fashion Photographer', trim: true },
  bio: { type: String, maxlength: 2000, trim: true },
  location: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  website: { type: String, trim: true },

  // Professional Background
  yearsExperience: {
    type: String,
    enum: ['0-2', '2-3', '3-5', '6-10', '11-15', '15+'],
    required: true
  },
  educationBackground: { type: String, trim: true },
  certifications: { type: String, trim: true },

  // Photography Specializations
  photographyTypes: [{
    type: String,
    trim: true
  }],
  styles: [{
    type: String,
    trim: true
  }],
  clientTypes: [{
    type: String,
    trim: true
  }],

  // Equipment & Technical Skills
  cameraEquipment: [{
    type: String,
    trim: true
  }],
  lensCollection: [{
    type: String,
    trim: true
  }],
  lightingEquipment: [{
    type: String,
    trim: true
  }],
  editingSoftware: [{
    type: String,
    trim: true
  }],
  technicalSkills: [{
    type: String,
    trim: true
  }],

  // Studio & Services
  studioAccess: {
    type: String,
    enum: ['own-studio', 'rented-studio', 'home-studio', 'no-studio'],
    required: true
  },
  studioLocation: { type: String, trim: true },
  mobileServices: { type: Boolean, default: false },
  travelRadius: {
    type: String,
    trim: true,
    default: 'local-only'
  },

  // Business Information
  rates: {
    portraitSession: { type: String, trim: true },
    fashionShoot: { type: String, trim: true },
    commercialDay: { type: String, trim: true },
    editorialDay: { type: String, trim: true },
    eventHourly: { type: String, trim: true },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP']
    }
  },
  packagesOffered: [{
    type: String,
    trim: true
  }],

  // Specialized Services
  specializedServices: [{
    type: String,
    enum: [
      'Fashion Photography',
      'Portrait Photography',
      'Commercial Photography',
      'Editorial Photography',
      'Beauty Photography',
      'Product Photography',
      'Lifestyle Photography',
      'Event Photography',
      'Wedding Photography',
      'Engagement Photography',
      'Headshot Photography',
      'Corporate Photography',
      'Brand Photography',
      'E-commerce Photography',
      'Catalog Photography',
      'Lookbook Photography',
      'Campaign Photography',
      'Street Style Photography',
      'Behind-the-Scenes Photography',
      'Studio Photography',
      'Location Photography',
      'Natural Light Photography',
      'Fine Art Photography',
      'Conceptual Photography',
      'Model Portfolio Photography',
      'Actor Headshots',
      'Business Portraits',
      'Creative Direction',
      'Photo Retouching',
      'Photo Editing'
    ],
    trim: true
  }],

  // Portfolio & Social Media
  portfolioWebsite: { type: String, trim: true },
  instagramBusiness: { type: String, trim: true },
  behancePortfolio: { type: String, trim: true },
  linkedinProfile: { type: String, trim: true },
  socialMedia: {
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    tiktok: { type: String, trim: true }
  },

  // Work Preferences
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'project-based', 'seasonal', 'by-appointment'],
    default: 'project-based'
  },
  preferredProjectTypes: [{
    type: String,
    trim: true
  }],
  collaborationStyle: { type: String, trim: true },
  clientCommunication: { type: String, trim: true },

  // Recognition & Experience
  publications: { type: String, trim: true },
  awards: { type: String, trim: true },
  exhibitions: { type: String, trim: true },
  notableClients: { type: String, trim: true },

  // --- Advanced Professional Fields (added) ---
  // Professional Experience (CRITICAL MISSING)
  experience: [{
    role: { type: String, trim: true },        // "Lead Photographer"
    company: { type: String, trim: true },     // "Vogue Magazine" 
    duration: { type: String, trim: true },    // "2020-2023"
    description: { type: String, trim: true }, // Project details
    current: { type: Boolean, default: false }
  }],

  // Video Portfolio Support
  videos: [{ type: String, trim: true }], // For behind-the-scenes, showreels

  // Specialized Photography Fields
  specializations: [{ type: String, trim: true }], // "Wedding", "Fashion", "Portrait", "Commercial"
  shootingStyles: [{ type: String, trim: true }],  // "Natural Light", "Studio", "Outdoor", "Editorial"

  // Professional Credentials (Enhanced)
  certifications: [{ type: String, trim: true }], // "Adobe Certified Expert", "PPA Certified"
  education: { type: String, trim: true },        // Photography degree/training

  // Project & Collaboration Details
  typicalProjectDuration: { 
    type: String, 
    enum: ['half-day', 'full-day', 'multi-day', 'weekly', 'flexible'],
    trim: true 
  },
  teamCollaboration: [{ type: String, trim: true }], // "Works with makeup artists", "Styling teams"
  deliverables: {
    editedPhotos: { type: Number, min: 0 },    // How many edited photos included
    rawFiles: { type: Boolean, default: false }, // Provides raw files?
    turnaroundTime: { type: String, trim: true }  // "3-5 business days"
  },

  // Booking & Availability (Enhanced)
  bookingLeadTime: { type: String, trim: true },     // "2 weeks notice preferred"
  travelWillingness: { 
    type: String, 
    enum: ['local-only', 'regional', 'national', 'international'],
    default: 'local-only'
  },
  weekendAvailability: { type: Boolean, default: true },

  // Profile Assets
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
photographerProfileSchema.virtual('completionPercentage').get(function () {
  let completed = 0;
  const total = 15;

  if (this.fullName?.trim()) completed++;
  if (this.headline?.trim()) completed++;
  if (this.bio?.trim()?.length > 20) completed++;
  if (this.location?.trim()) completed++;
  if (this.yearsExperience) completed++;
  if (this.photographyTypes?.length) completed++;
  if (this.styles?.length) completed++;
  if (this.clientTypes?.length) completed++;
  if (this.cameraEquipment?.length) completed++;
  if (this.studioAccess) completed++;
  if (this.rates?.portraitSession || this.rates?.fashionShoot) completed++;
  if (this.portfolioWebsite?.trim()) completed++;
  if (this.socialMedia?.instagram?.trim()) completed++;
  if (this.profilePicture) completed++;

  return Math.round((completed / total) * 100);
});

// Profile score calculation
photographerProfileSchema.methods.calculateProfileScore = function () {
  let score = 0;

  score += this.completionPercentage * 0.4;
  if (this.isVerified) score += 20;
  if (this.photos?.length) score += Math.min(this.photos.length * 2, 20);
  
  const expMap = { '0-2': 5, '2-3': 7, '3-5': 10, '6-10': 15, '11-15': 20, '15+': 25 };
  score += expMap[this.yearsExperience] || 0;
  
  if (this.photographyTypes?.length) score += Math.min(this.photographyTypes.length * 2, 15);
  if (this.clientTypes?.length) score += Math.min(this.clientTypes.length * 1, 10);
  if (this.cameraEquipment?.length) score += Math.min(this.cameraEquipment.length * 1, 10);
  if (this.profileViews > 0) score += Math.min(Math.log10(this.profileViews) * 5, 15);

  return Math.min(Math.round(score), 100);
};

// Indexes
photographerProfileSchema.index({ userId: 1 });
photographerProfileSchema.index({ location: 1 });
photographerProfileSchema.index({ photographyTypes: 1 });
photographerProfileSchema.index({ clientTypes: 1 });
photographerProfileSchema.index({ studioAccess: 1 });
photographerProfileSchema.index({ isComplete: 1 });
photographerProfileSchema.index({ isVerified: 1 });
photographerProfileSchema.index({ profileViews: -1 });
photographerProfileSchema.index({ createdAt: -1 });

// Compound indexes
photographerProfileSchema.index({ photographyTypes: 1, location: 1 });
photographerProfileSchema.index({ isComplete: 1, isVerified: 1 });
photographerProfileSchema.index({ studioAccess: 1, clientTypes: 1 });

module.exports = mongoose.model('PhotographerProfile', photographerProfileSchema);