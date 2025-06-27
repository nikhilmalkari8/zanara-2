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
      'agency',
      'fashion-student'
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
  // NEW: Work Status Field
  workStatus: {
    type: String,
    enum: ['freelancer', 'full-time', 'part-time', 'contract', 'seeking-work', 'student', 'not-specified'],
    default: 'not-specified'
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
  },
  // NEW: Profile Change Tracking
  profileHistory: {
    profilePicture: [{
      url: String,
      changedAt: { type: Date, default: Date.now },
      previousUrl: String
    }],
    coverPhoto: [{
      url: String,
      changedAt: { type: Date, default: Date.now },
      previousUrl: String
    }],
    headline: [{
      value: String,
      changedAt: { type: Date, default: Date.now },
      previousValue: String
    }],
    bio: [{
      value: String,
      changedAt: { type: Date, default: Date.now },
      previousValue: String
    }],
    location: [{
      value: String,
      changedAt: { type: Date, default: Date.now },
      previousValue: String
    }],
    workStatus: [{
      value: String,
      changedAt: { type: Date, default: Date.now },
      previousValue: String
    }]
  },
  // NEW: Work Anniversary Tracking
  workAnniversaries: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    isCurrent: { type: Boolean, default: false }
  }],
  // NEW: Skills and Endorsements
  skills: [{
    name: String,
    category: {
      type: String,
      enum: ['technical', 'creative', 'business', 'soft-skills'],
      default: 'technical'
    },
    endorsements: [{
      endorsedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      endorsedAt: { type: Date, default: Date.now },
      note: String
    }],
    addedAt: { type: Date, default: Date.now }
  }],
  // NEW: Achievements and Certifications
  achievements: [{
    title: String,
    description: String,
    category: {
      type: String,
      enum: ['award', 'certification', 'milestone', 'recognition'],
      default: 'milestone'
    },
    issuer: String,
    achievedAt: Date,
    imageUrl: String,
    verificationUrl: String,
    isPublic: { type: Boolean, default: true }
  }]
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

// NEW: Method to track profile picture change
userSchema.methods.updateProfilePicture = async function(newUrl) {
  const previousUrl = this.profilePicture;
  
  // Update the profile picture
  this.profilePicture = newUrl;
  this.lastProfileUpdate = new Date();
  
  // Track the change in history
  if (!this.profileHistory) {
    this.profileHistory = { profilePicture: [], coverPhoto: [], headline: [], bio: [], location: [], workStatus: [] };
  }
  if (!this.profileHistory.profilePicture) {
    this.profileHistory.profilePicture = [];
  }
  
  this.profileHistory.profilePicture.push({
    url: newUrl,
    changedAt: new Date(),
    previousUrl: previousUrl
  });
  
  // Keep only last 10 changes
  if (this.profileHistory.profilePicture.length > 10) {
    this.profileHistory.profilePicture = this.profileHistory.profilePicture.slice(-10);
  }
  
  await this.save();
  
  // Create activity feed entry
  const Activity = require('./Activity');
  await Activity.createActivity({
    actor: this._id,
    type: 'profile_photo_changed',
    title: `${this.fullName} updated their profile photo`,
    description: 'New profile photo uploaded',
    metadata: {
      changeType: 'photo',
      previousValue: previousUrl,
      newValue: newUrl
    },
    visibility: 'public',
    priority: 'normal'
  });
  
  return this;
};

// NEW: Method to track cover photo change
userSchema.methods.updateCoverPhoto = async function(newUrl) {
  const previousUrl = this.coverPhoto;
  
  // Update the cover photo
  this.coverPhoto = newUrl;
  this.lastProfileUpdate = new Date();
  
  // Track the change in history
  if (!this.profileHistory) {
    this.profileHistory = { profilePicture: [], coverPhoto: [], headline: [], bio: [], location: [], workStatus: [] };
  }
  if (!this.profileHistory.coverPhoto) {
    this.profileHistory.coverPhoto = [];
  }
  
  this.profileHistory.coverPhoto.push({
    url: newUrl,
    changedAt: new Date(),
    previousUrl: previousUrl
  });
  
  // Keep only last 10 changes
  if (this.profileHistory.coverPhoto.length > 10) {
    this.profileHistory.coverPhoto = this.profileHistory.coverPhoto.slice(-10);
  }
  
  await this.save();
  
  // Create activity feed entry
  const Activity = require('./Activity');
  await Activity.createActivity({
    actor: this._id,
    type: 'cover_photo_changed',
    title: `${this.fullName} updated their cover photo`,
    description: 'New cover photo uploaded',
    metadata: {
      changeType: 'cover',
      previousValue: previousUrl,
      newValue: newUrl
    },
    visibility: 'public',
    priority: 'normal'
  });
  
  return this;
};

// NEW: Method to track headline change
userSchema.methods.updateHeadline = async function(newHeadline) {
  const previousHeadline = this.headline;
  
  if (previousHeadline !== newHeadline) {
    this.headline = newHeadline;
    this.lastProfileUpdate = new Date();
    
    // Track the change in history
    if (!this.profileHistory) {
      this.profileHistory = { profilePicture: [], coverPhoto: [], headline: [], bio: [], location: [], workStatus: [] };
    }
    if (!this.profileHistory.headline) {
      this.profileHistory.headline = [];
    }
    
    this.profileHistory.headline.push({
      value: newHeadline,
      changedAt: new Date(),
      previousValue: previousHeadline
    });
    
    // Keep only last 10 changes
    if (this.profileHistory.headline.length > 10) {
      this.profileHistory.headline = this.profileHistory.headline.slice(-10);
    }
    
    await this.save();
    
    // Create activity feed entry for significant headline changes
    if (previousHeadline && previousHeadline.trim() !== '') {
      const Activity = require('./Activity');
      await Activity.createActivity({
        actor: this._id,
        type: 'profile_update',
        title: `${this.fullName} updated their professional headline`,
        description: `Changed from "${previousHeadline}" to "${newHeadline}"`,
        metadata: {
          changeType: 'headline',
          previousValue: previousHeadline,
          newValue: newHeadline
        },
        visibility: 'public',
        priority: 'normal'
      });
    }
  }
  
  return this;
};

// NEW: Method to add skill with activity tracking
userSchema.methods.addSkill = async function(skillName, category = 'technical') {
  if (!this.skills) {
    this.skills = [];
  }
  
  // Check if skill already exists
  const existingSkill = this.skills.find(skill => 
    skill.name.toLowerCase() === skillName.toLowerCase()
  );
  
  if (!existingSkill) {
    this.skills.push({
      name: skillName,
      category: category,
      endorsements: [],
      addedAt: new Date()
    });
    
    this.lastProfileUpdate = new Date();
    await this.save();
    
    // Create activity feed entry
    const Activity = require('./Activity');
    await Activity.createActivity({
      actor: this._id,
      type: 'skill_added',
      title: `${this.fullName} added a new skill: ${skillName}`,
      description: `Added ${skillName} to their skill set`,
      metadata: {
        skillName: skillName,
        category: category
      },
      visibility: 'public',
      priority: 'normal'
    });
  }
  
  return this;
};

// NEW: Method to endorse a skill
userSchema.methods.endorseSkill = async function(skillName, endorserId, note = '') {
  if (!this.skills) {
    this.skills = [];
  }
  
  const skill = this.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
  
  if (skill) {
    // Check if already endorsed by this user
    const existingEndorsement = skill.endorsements.find(e => 
      e.endorsedBy.toString() === endorserId.toString()
    );
    
    if (!existingEndorsement) {
      skill.endorsements.push({
        endorsedBy: endorserId,
        endorsedAt: new Date(),
        note: note
      });
      
      await this.save();
      
      // Create activity feed entry
      const Activity = require('./Activity');
      const endorser = await mongoose.model('User').findById(endorserId);
      
      await Activity.createActivity({
        actor: endorserId,
        type: 'skill_endorsed',
        title: `${endorser.fullName} endorsed ${this.fullName} for ${skillName}`,
        description: note || `Endorsed ${skillName} skill`,
        relatedObjects: {
          user: this._id
        },
        metadata: {
          skillName: skillName,
          endorserCount: skill.endorsements.length
        },
        visibility: 'public',
        priority: 'normal'
      });
    }
  }
  
  return this;
};

// NEW: Method to add achievement
userSchema.methods.addAchievement = async function(achievementData) {
  if (!this.achievements) {
    this.achievements = [];
  }
  
  const achievement = {
    title: achievementData.title,
    description: achievementData.description,
    category: achievementData.category || 'milestone',
    issuer: achievementData.issuer,
    achievedAt: achievementData.achievedAt || new Date(),
    imageUrl: achievementData.imageUrl,
    verificationUrl: achievementData.verificationUrl,
    isPublic: achievementData.isPublic !== false
  };
  
  this.achievements.push(achievement);
  this.lastProfileUpdate = new Date();
  await this.save();
  
  // Create activity feed entry
  if (achievement.isPublic) {
    const Activity = require('./Activity');
    let activityType = 'achievement_added';
    
    if (achievement.category === 'award') {
      activityType = 'award_received';
    } else if (achievement.category === 'certification') {
      activityType = 'certification_earned';
    }
    
    await Activity.createActivity({
      actor: this._id,
      type: activityType,
      title: `${this.fullName} ${achievement.category === 'award' ? 'received an award' : achievement.category === 'certification' ? 'earned a certification' : 'achieved a milestone'}: ${achievement.title}`,
      description: achievement.description,
      metadata: {
        awardName: achievement.title,
        certificationName: achievement.title,
        issuer: achievement.issuer,
        achievedAt: achievement.achievedAt
      },
      visibility: 'public',
      priority: 'high'
    });
  }
  
  return this;
};

// NEW: Method to check work anniversaries
userSchema.methods.checkWorkAnniversaries = async function() {
  if (!this.workAnniversaries || this.workAnniversaries.length === 0) {
    return;
  }
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  
  for (let work of this.workAnniversaries) {
    if (work.startDate) {
      const startDate = new Date(work.startDate);
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();
      
      // Check if it's the anniversary
      if (startMonth === currentMonth && startDay === currentDay) {
        const yearsWorked = today.getFullYear() - startDate.getFullYear();
        
        if (yearsWorked > 0) {
          // Create work anniversary activity
          const Activity = require('./Activity');
          await Activity.createActivity({
            actor: this._id,
            type: 'work_anniversary',
            title: `${this.fullName} is celebrating ${yearsWorked} year${yearsWorked > 1 ? 's' : ''} at ${work.company}`,
            description: `${yearsWorked} year work anniversary as ${work.position}`,
            metadata: {
              anniversaryYears: yearsWorked,
              companyName: work.company,
              jobTitle: work.position
            },
            visibility: 'public',
            priority: 'high'
          });
        }
      }
    }
  }
};

// NEW: Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ professionalType: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ profileComplete: 1 });
userSchema.index({ verificationTier: 1 });
userSchema.index({ subscriptionTier: 1 });
userSchema.index({ location: 1 });
userSchema.index({ workStatus: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActiveAt: -1 });

// NEW: Compound indexes
userSchema.index({ professionalType: 1, profileComplete: 1 });
userSchema.index({ userType: 1, verificationTier: 1 });
userSchema.index({ professionalType: 1, workStatus: 1 });

module.exports = mongoose.model('User', userSchema);