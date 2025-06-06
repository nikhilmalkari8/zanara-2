const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  // UPDATED: Professional Type (NEW)
  professionalType: {
    type: String,
    enum: [
      'fashion-designer',
      'stylist', 
      'photographer',
      'makeup-artist',
      'model',
      'brand',
      'agency'
    ],
    required: true
  },
  // UPDATED: User Type (MODIFIED)
  userType: {
    type: String,
    enum: ['talent', 'hiring'], // Changed from 'model', 'hiring' to 'talent', 'hiring'
    required: true
  },
  // NEW: Profile Status Fields
  profileComplete: {
    type: Boolean,
    default: false
  },
  profileCompletionScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // NEW: Verification Status
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationTier: {
    type: String,
    enum: ['none', 'basic', 'professional', 'expert'],
    default: 'none'
  },
  // NEW: Profile Visibility
  profileVisibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  // NEW: Professional Information
  headline: {
    type: String,
    maxLength: 150
  },
  bio: {
    type: String,
    maxLength: 500
  },
  location: {
    type: String
  },
  website: {
    type: String
  },
  // NEW: Profile Media
  profilePicture: {
    type: String
  },
  coverPhoto: {
    type: String
  },
  // NEW: Analytics & Metrics
  profileViews: {
    type: Number,
    default: 0
  },
  profileViewsThisMonth: {
    type: Number,
    default: 0
  },
  connectionsCount: {
    type: Number,
    default: 0
  },
  // NEW: Activity Tracking
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  lastProfileUpdate: {
    type: Date,
    default: Date.now
  },
  // NEW: Account Security
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: {
    type: Date
  },
  // NEW: Notification Preferences
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    profileViews: {
      type: Boolean,
      default: true
    },
    newOpportunities: {
      type: Boolean,
      default: true
    },
    connectionRequests: {
      type: Boolean,
      default: true
    },
    contentEngagement: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: true
    }
  },
  // NEW: Subscription & Premium Features
  subscriptionTier: {
    type: String,
    enum: ['free', 'premium', 'professional', 'enterprise'],
    default: 'free'
  },
  subscriptionExpiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// UPDATED: Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// NEW: Update lastActiveAt on certain operations
userSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  if (this.getOptions().updateLastActive !== false) {
    this.set({ lastActiveAt: new Date() });
  }
});

// NEW: Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// NEW: Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// NEW: Method to check if professional type is hiring type
userSchema.methods.isHiringType = function() {
  return ['brand', 'agency'].includes(this.professionalType);
};

// NEW: Method to check if professional type is talent type  
userSchema.methods.isTalentType = function() {
  return ['fashion-designer', 'stylist', 'photographer', 'makeup-artist', 'model'].includes(this.professionalType);
};

// NEW: Method to calculate profile completion
userSchema.methods.calculateProfileCompletion = function() {
  let score = 0;
  const fields = [
    'firstName', 'lastName', 'email', 'phoneNumber', 
    'headline', 'bio', 'location', 'profilePicture'
  ];
  
  fields.forEach(field => {
    if (this[field] && this[field].toString().trim() !== '') {
      score += (100 / fields.length);
    }
  });
  
  return Math.round(score);
};

// NEW: Method to get professional display info
userSchema.methods.getProfessionalInfo = function() {
  const typeMap = {
    'fashion-designer': { label: 'Fashion Designer', category: 'Creative', icon: '✂️' },
    'stylist': { label: 'Fashion Stylist', category: 'Creative', icon: '👗' },
    'photographer': { label: 'Fashion Photographer', category: 'Creative', icon: '📸' },
    'makeup-artist': { label: 'Makeup Artist', category: 'Beauty', icon: '💄' },
    'model': { label: 'Model', category: 'Talent', icon: '🌟' },
    'brand': { label: 'Fashion Brand', category: 'Business', icon: '🏢' },
    'agency': { label: 'Modeling Agency', category: 'Business', icon: '🎭' }
  };
  
  return typeMap[this.professionalType] || { label: 'Professional', category: 'Fashion', icon: '👤' };
};

// NEW: Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ professionalType: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ profileComplete: 1 });
userSchema.index({ verificationTier: 1 });
userSchema.index({ subscriptionTier: 1 });
userSchema.index({ location: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActiveAt: -1 });

// NEW: Compound indexes
userSchema.index({ professionalType: 1, profileComplete: 1 });
userSchema.index({ userType: 1, verificationTier: 1 });

module.exports = mongoose.model('User', userSchema);