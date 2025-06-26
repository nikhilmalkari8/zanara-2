const mongoose = require('mongoose');

const fashionStudentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Basic Profile Information
  fullName: { type: String, required: true, trim: true },
  headline: { type: String, default: 'Fashion Student', trim: true },
  bio: { type: String, maxlength: 2000, trim: true },
  location: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  website: { type: String, trim: true },
  profilePicture: { type: String, trim: true },
  coverPhoto: { type: String, trim: true },

  // Academic Information
  currentInstitution: { type: String, required: true, trim: true },
  institutionLocation: { type: String, required: true, trim: true },
  degreeProgram: {
    type: String,
    enum: [
      'Fashion Design',
      'Fashion Merchandising',
      'Fashion Marketing',
      'Fashion Business',
      'Textile Design',
      'Fashion Styling',
      'Fashion Photography',
      'Fashion Journalism',
      'Costume Design',
      'Fashion Technology',
      'Sustainable Fashion',
      'Fashion Illustration',
      'Pattern Making',
      'Fashion Communication',
      'Other'
    ],
    required: true
  },
  customDegreeProgram: { type: String, trim: true }, // If 'Other' is selected
  degreeLevel: {
    type: String,
    enum: ['Associate', 'Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma'],
    required: true
  },
  currentYear: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate'],
    required: true
  },
  expectedGraduation: { type: Date, required: true },
  currentGPA: { type: String, trim: true },
  academicAchievements: [{ type: String, trim: true }],
  relevantCoursework: [{ type: String, trim: true }],
  thesis: {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    advisor: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Planning', 'Research', 'Writing', 'Review', 'Complete'],
      default: 'Planning'
    }
  },

  // Specialization & Interests
  primarySpecialization: {
    type: String,
    enum: [
      'Womenswear Design',
      'Menswear Design',
      'Childrenswear Design',
      'Sustainable Fashion',
      'Luxury Fashion',
      'Streetwear',
      'Avant-garde',
      'Bridal Design',
      'Activewear',
      'Lingerie Design',
      'Accessories Design',
      'Footwear Design',
      'Textile Innovation',
      'Fashion Tech',
      'Fashion Business',
      'Fashion Marketing',
      'Fashion Styling',
      'Fashion Photography',
      'Fashion Journalism',
      'Other'
    ],
    required: true
  },
  secondarySpecializations: [{ type: String, trim: true }],
  fashionInterests: [{ type: String, trim: true }],
  designPhilosophy: { type: String, maxlength: 1000, trim: true },
  inspirations: [{ type: String, trim: true }],
  favoriteDesigners: [{ type: String, trim: true }],
  fashionMovements: [{ type: String, trim: true }],

  // Skills & Technical Abilities
  designSkills: [{ type: String, trim: true }],
  technicalSkills: [{ type: String, trim: true }],
  softwareSkills: [{ type: String, trim: true }],
  craftSkills: [{ type: String, trim: true }],
  businessSkills: [{ type: String, trim: true }],
  languageSkills: [{
    language: { type: String, trim: true },
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Native'],
      default: 'Beginner'
    }
  }],
  
  // Skill Development Tracking
  skillDevelopmentGoals: [{
    skill: { type: String, trim: true },
    currentLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    targetLevel: {
      type: String,
      enum: ['Intermediate', 'Advanced', 'Expert', 'Master'],
      default: 'Intermediate'
    },
    targetDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    resources: [{ type: String, trim: true }],
    milestones: [{
      description: { type: String, trim: true },
      completed: { type: Boolean, default: false },
      completedDate: { type: Date }
    }]
  }],

  // Portfolio & Creative Work
  portfolioWebsite: { type: String, trim: true },
  portfolioDescription: { type: String, maxlength: 1000, trim: true },
  photos: [{ type: String, trim: true }],
  videos: [{ type: String, trim: true }],
  projects: [{
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['Academic Project', 'Personal Project', 'Competition Entry', 'Collaboration', 'Freelance Work', 'Other']
    },
    images: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    duration: { type: String, trim: true },
    completionDate: { type: Date },
    awards: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false }
  }],
  competitions: [{
    name: { type: String, trim: true },
    year: { type: String, trim: true },
    category: { type: String, trim: true },
    result: { type: String, trim: true },
    description: { type: String, trim: true },
    images: [{ type: String, trim: true }]
  }],
  exhibitions: [{
    name: { type: String, trim: true },
    venue: { type: String, trim: true },
    date: { type: Date },
    role: { type: String, trim: true },
    description: { type: String, trim: true },
    images: [{ type: String, trim: true }]
  }],

  // Experience & Internships
  experience: [{
    role: { type: String, trim: true },
    company: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['Internship', 'Part-time Job', 'Freelance', 'Volunteer', 'Research Assistant', 'Teaching Assistant', 'Other']
    },
    description: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    achievements: [{ type: String, trim: true }],
    supervisor: { type: String, trim: true },
    recommendation: { type: String, trim: true }
  }],

  // Internship Preferences
  internshipPreferences: {
    seeking: { type: Boolean, default: true },
    availability: {
      type: String,
      enum: ['Summer', 'Fall', 'Spring', 'Year-round', 'Flexible'],
      default: 'Summer'
    },
    duration: {
      type: String,
      enum: ['1-3 months', '3-6 months', '6-12 months', 'Flexible'],
      default: '3-6 months'
    },
    type: {
      type: String,
      enum: ['Paid', 'Unpaid', 'Academic Credit', 'Either'],
      default: 'Either'
    },
    preferredRoles: [{ type: String, trim: true }],
    preferredCompanyTypes: [{ type: String, trim: true }],
    preferredLocations: [{ type: String, trim: true }],
    remoteWork: { type: Boolean, default: true },
    relocationWillingness: { type: Boolean, default: false },
    requirements: { type: String, trim: true },
    startDate: { type: Date },
    additionalInfo: { type: String, trim: true }
  },

  // Career Goals & Aspirations
  careerGoals: {
    shortTerm: { type: String, maxlength: 1000, trim: true }, // 1-2 years
    longTerm: { type: String, maxlength: 1000, trim: true },  // 5-10 years
    dreamJob: { type: String, trim: true },
    targetCompanies: [{ type: String, trim: true }],
    targetRoles: [{ type: String, trim: true }],
    industryInterests: [{ type: String, trim: true }],
    geographicPreferences: [{ type: String, trim: true }],
    salaryExpectations: {
      entry: { type: String, trim: true },
      experienced: { type: String, trim: true },
      currency: { type: String, default: 'USD' }
    }
  },

  // Networking & Mentorship
  mentorshipInterests: {
    seeking: { type: Boolean, default: true },
    areas: [{ type: String, trim: true }],
    preferredMentorBackground: [{ type: String, trim: true }],
    meetingFrequency: {
      type: String,
      enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'As needed'],
      default: 'Monthly'
    },
    mentorshipGoals: { type: String, trim: true }
  },
  networkingPreferences: {
    events: { type: Boolean, default: true },
    onlineCommunities: { type: Boolean, default: true },
    professionalAssociations: [{ type: String, trim: true }],
    alumniNetworks: { type: Boolean, default: true }
  },

  // Social Media & Online Presence
  socialMedia: {
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    behance: { type: String, trim: true },
    dribbble: { type: String, trim: true },
    pinterest: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    youtube: { type: String, trim: true },
    twitter: { type: String, trim: true }
  },
  onlinePortfolios: [{
    platform: { type: String, trim: true },
    url: { type: String, trim: true },
    description: { type: String, trim: true }
  }],

  // Availability & Preferences
  availability: {
    type: String,
    enum: ['Full-time seeking', 'Part-time available', 'Project-based', 'Internship only', 'Flexible'],
    default: 'Internship only'
  },
  workPreferences: {
    environment: {
      type: String,
      enum: ['In-person', 'Remote', 'Hybrid', 'Flexible'],
      default: 'Flexible'
    },
    teamSize: {
      type: String,
      enum: ['Startup (1-10)', 'Small (11-50)', 'Medium (51-250)', 'Large (250+)', 'No preference'],
      default: 'No preference'
    },
    companyStage: [{ type: String, trim: true }],
    industryPreference: [{ type: String, trim: true }]
  },

  // Financial Information
  financialInfo: {
    scholarships: [{ type: String, trim: true }],
    financialAid: { type: Boolean, default: false },
    workStudy: { type: Boolean, default: false },
    budgetConstraints: { type: String, trim: true },
    equipmentNeeds: [{ type: String, trim: true }]
  },

  // Extracurricular Activities
  extracurriculars: [{
    activity: { type: String, trim: true },
    role: { type: String, trim: true },
    organization: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true },
    achievements: [{ type: String, trim: true }]
  }],
  volunteerWork: [{
    organization: { type: String, trim: true },
    role: { type: String, trim: true },
    cause: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true },
    skills: [{ type: String, trim: true }]
  }],

  // Status & Analytics
  isComplete: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  profileViews: { type: Number, default: 0 },
  profileViewsThisMonth: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5, default: null },
  reviewCount: { type: Number, default: 0 },
  connections: { type: Number, default: 0 },
  
  // Academic Performance Tracking
  academicMetrics: {
    projectsCompleted: { type: Number, default: 0 },
    competitionsEntered: { type: Number, default: 0 },
    awardsReceived: { type: Number, default: 0 },
    skillsLearned: { type: Number, default: 0 },
    portfolioPieces: { type: Number, default: 0 },
    internshipApplications: { type: Number, default: 0 },
    networkingConnections: { type: Number, default: 0 }
  },

  // Privacy & Visibility Settings
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['Public', 'Students Only', 'Professionals Only', 'Private'],
      default: 'Public'
    },
    contactInfo: {
      type: String,
      enum: ['Public', 'Connections Only', 'Private'],
      default: 'Connections Only'
    },
    academicInfo: {
      type: String,
      enum: ['Public', 'Professionals Only', 'Private'],
      default: 'Public'
    },
    portfolioAccess: {
      type: String,
      enum: ['Public', 'Registered Users', 'Connections Only', 'Private'],
      default: 'Public'
    }
  },

  // Portfolio & Professional Development
  portfolio: {
    behance: { type: String, trim: true },
    dribbble: { type: String, trim: true },
    instagram: { type: String, trim: true },
    personalWebsite: { type: String, trim: true },
    linkedIn: { type: String, trim: true }
  },
  
  // Specialized Services (Student Level)
  specializedServices: [{
    type: String,
    enum: [
      'Design Assistance',
      'Pattern Making',
      'Sketching Services',
      'Fashion Illustration',
      'Mood Board Creation',
      'Trend Research',
      'Market Research',
      'Social Media Content',
      'Styling Assistance',
      'Wardrobe Organization',
      'Personal Shopping',
      'Fashion Writing',
      'Blog Content',
      'Fashion Photography',
      'Model Coordination',
      'Event Assistance',
      'Trade Show Help',
      'Internship Projects',
      'Academic Research',
      'Presentation Design',
      'Tech Pack Creation',
      'Fabric Sourcing',
      'Vendor Research',
      'Sample Coordination',
      'Quality Control',
      'Fit Model Services',
      'Fashion Show Production',
      'Editorial Styling',
      'Costume Design',
      'Sustainable Fashion Consulting'
    ],
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual: Age calculation
fashionStudentProfileSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual: Time until graduation
fashionStudentProfileSchema.virtual('timeUntilGraduation').get(function() {
  if (!this.expectedGraduation) return null;
  const today = new Date();
  const gradDate = new Date(this.expectedGraduation);
  const diffTime = gradDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Graduated';
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
  return `${Math.ceil(diffDays / 365)} years`;
});

// Virtual: Completion percentage
fashionStudentProfileSchema.virtual('completionPercentage').get(function() {
  let completed = 0;
  const total = 25;

  // Basic info (5 points)
  if (this.fullName?.trim()) completed++;
  if (this.headline?.trim()) completed++;
  if (this.bio?.trim()?.length > 50) completed++;
  if (this.location?.trim()) completed++;
  if (this.profilePicture) completed++;

  // Academic info (8 points)
  if (this.currentInstitution?.trim()) completed++;
  if (this.degreeProgram) completed++;
  if (this.currentYear) completed++;
  if (this.expectedGraduation) completed++;
  if (this.primarySpecialization) completed++;
  if (this.designPhilosophy?.trim()) completed++;
  if (this.relevantCoursework?.length) completed++;
  if (this.academicAchievements?.length) completed++;

  // Skills & Portfolio (7 points)
  if (this.designSkills?.length) completed++;
  if (this.technicalSkills?.length) completed++;
  if (this.softwareSkills?.length) completed++;
  if (this.photos?.length) completed++;
  if (this.projects?.length) completed++;
  if (this.portfolioWebsite?.trim()) completed++;
  if (this.socialMedia?.instagram?.trim() || this.socialMedia?.linkedin?.trim()) completed++;

  // Career & Goals (5 points)
  if (this.careerGoals?.shortTerm?.trim()) completed++;
  if (this.careerGoals?.longTerm?.trim()) completed++;
  if (this.internshipPreferences?.seeking !== undefined) completed++;
  if (this.mentorshipInterests?.seeking !== undefined) completed++;
  if (this.availability) completed++;

  return Math.round((completed / total) * 100);
});

// Profile score calculation
fashionStudentProfileSchema.methods.calculateProfileScore = function() {
  let score = 0;

  // Base completion score (40%)
  score += this.completionPercentage * 0.4;

  // Academic achievements (15%)
  if (this.academicAchievements?.length) score += Math.min(this.academicAchievements.length * 3, 15);

  // Portfolio quality (20%)
  if (this.photos?.length) score += Math.min(this.photos.length * 2, 10);
  if (this.projects?.length) score += Math.min(this.projects.length * 2, 10);

  // Skills diversity (10%)
  const totalSkills = (this.designSkills?.length || 0) + (this.technicalSkills?.length || 0) + (this.softwareSkills?.length || 0);
  score += Math.min(totalSkills * 0.5, 10);

  // Experience & engagement (10%)
  if (this.experience?.length) score += Math.min(this.experience.length * 2, 5);
  if (this.competitions?.length) score += Math.min(this.competitions.length * 1, 3);
  if (this.extracurriculars?.length) score += Math.min(this.extracurriculars.length * 1, 2);

  // Verification & social proof (5%)
  if (this.isVerified) score += 5;

  return Math.min(Math.round(score), 100);
};

// Indexes for optimal performance
fashionStudentProfileSchema.index({ userId: 1 });
fashionStudentProfileSchema.index({ currentInstitution: 1 });
fashionStudentProfileSchema.index({ degreeProgram: 1 });
fashionStudentProfileSchema.index({ primarySpecialization: 1 });
fashionStudentProfileSchema.index({ currentYear: 1 });
fashionStudentProfileSchema.index({ expectedGraduation: 1 });
fashionStudentProfileSchema.index({ location: 1 });
fashionStudentProfileSchema.index({ isComplete: 1 });
fashionStudentProfileSchema.index({ isVerified: 1 });
fashionStudentProfileSchema.index({ profileViews: -1 });
fashionStudentProfileSchema.index({ createdAt: -1 });

// Compound indexes
fashionStudentProfileSchema.index({ degreeProgram: 1, currentYear: 1 });
fashionStudentProfileSchema.index({ primarySpecialization: 1, location: 1 });
fashionStudentProfileSchema.index({ isComplete: 1, isVerified: 1 });
fashionStudentProfileSchema.index({ 'internshipPreferences.seeking': 1, expectedGraduation: 1 });

module.exports = mongoose.model('FashionStudentProfile', fashionStudentProfileSchema); 