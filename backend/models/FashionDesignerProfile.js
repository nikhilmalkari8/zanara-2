const mongoose = require('mongoose');

const fashionDesignerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Basic Profile Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  headline: {
    type: String,
    default: 'Fashion Designer',
    trim: true
  },
  bio: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },

  // Professional Background
  yearsExperience: {
    type: String,
    enum: ['0-2', '3-5', '6-10', '11-15', '15+'],
    required: true
  },
  education: {
    type: String,
    trim: true
  },
  designPhilosophy: {
    type: String,
    trim: true
  },

  // Design Specializations
  designCategories: [{
    type: String,
    enum: [
      'Womenswear', 'Menswear', 'Childrenswear', 'Plus-Size Fashion',
      'Petite Fashion', 'Maternity Fashion', 'Unisex Fashion', 'Accessories',
      'Footwear', 'Bags & Handbags', 'Jewelry', 'Lingerie & Intimates',
      'Swimwear', 'Activewear & Sportswear', 'Outerwear', 'Formal/Evening Wear'
    ]
  }],

  productTypes: [{
    type: String,
    enum: [
      'Dresses', 'Tops & Blouses', 'Pants & Trousers', 'Skirts', 'Suits',
      'Jackets & Blazers', 'Coats', 'Knitwear', 'T-Shirts & Casual Tops',
      'Jeans & Denim', 'Shorts', 'Jumpsuits & Rompers', 'Sleepwear',
      'Undergarments', 'Scarves & Wraps', 'Hats & Headwear'
    ]
  }],

  designStyles: [{
    type: String,
    enum: [
      'Minimalist', 'Avant-Garde', 'Classic/Timeless', 'Bohemian',
      'Urban/Street Style', 'Vintage-Inspired', 'Romantic/Feminine',
      'Edgy/Alternative', 'Preppy', 'Glamorous', 'Casual/Relaxed',
      'Formal/Professional', 'Sustainable/Eco-Friendly', 'High Fashion',
      'Contemporary', 'Retro/Nostalgic'
    ]
  }],

  targetMarket: [{
    type: String,
    enum: [
      'Luxury ($500+)', 'Contemporary ($100-500)', 'Bridge ($50-150)',
      'Fast Fashion ($10-50)', 'Budget-Friendly (<$25)', 'Custom/Couture',
      'Sustainable Fashion', 'Slow Fashion', 'Made-to-Order',
      'Limited Edition', 'Mass Market', 'Niche Market'
    ]
  }],

  // Technical Skills
  technicalSkills: [{
    type: String,
    enum: [
      'Pattern Making', 'Pattern Grading', 'Draping', 'Flat Pattern Design',
      'Garment Construction', 'Fitting & Alterations', 'Technical Drawing',
      'Specification Writing', 'Size Chart Development', 'Cost Analysis',
      'Fabric Sourcing', 'Trim Selection', 'Color Theory', 'Print Design',
      'Embellishment Techniques', 'Quality Control'
    ]
  }],

  softwareSkills: [{
    type: String,
    enum: [
      'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign',
      'CLO 3D', 'Browzwear VStitcher', 'Optitex', 'Gerber AccuMark',
      'Lectra Modaris', 'TUKAcad', 'Marvelous Designer', 'Sketch',
      'Figma', 'AutoCAD', 'Rhino 3D', 'Blender', 'Procreate'
    ]
  }],

  constructionSkills: [{
    type: String,
    enum: [
      'Machine Sewing', 'Hand Sewing', 'Serging/Overlocking', 'Blind Hemming',
      'Buttonhole Making', 'Zipper Installation', 'Seam Finishing',
      'Pressing & Steaming', 'Tailoring Techniques', 'Couture Techniques',
      'Embroidery', 'Beading', 'Appliqué', 'Quilting', 'Leather Working'
    ]
  }],

  materialKnowledge: [{
    type: String,
    enum: [
      'Natural Fibers (Cotton, Wool, Silk, Linen)', 'Synthetic Fibers',
      'Blended Fabrics', 'Knit Fabrics', 'Woven Fabrics', 'Denim',
      'Leather & Suede', 'Fur & Faux Fur', 'Technical Fabrics',
      'Sustainable Materials', 'Organic Materials', 'Recycled Materials',
      'Trims & Notions', 'Hardware', 'Interfacing', 'Linings'
    ]
  }],

  // Business & Production
  businessModel: {
    type: String,
    enum: [
      'independent-designer', 'fashion-brand-owner', 'freelance-designer',
      'design-consultant', 'custom-couture', 'pattern-maker', 'design-studio'
    ],
    required: true
  },
  
  productionCapacity: {
    type: String,
    enum: [
      'single-pieces', 'small-batch', 'medium-batch', 'large-scale', 'no-production'
    ]
  },

  manufacturingKnowledge: {
    type: String,
    trim: true
  },

  sustainabilityPractices: {
    type: String,
    trim: true
  },

  qualityStandards: {
    type: String,
    trim: true
  },

  // Portfolio & Collections
  portfolioWebsite: {
    type: String,
    trim: true
  },

  collections: {
    type: String,
    trim: true
  },

  designAwards: {
    type: String,
    trim: true
  },

  exhibitions: {
    type: String,
    trim: true
  },

  collaborations: {
    type: String,
    trim: true
  },

  // Social Media & Professional Links
  socialMedia: {
    instagram: {
      type: String,
      trim: true
    },
    behance: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    blog: {
      type: String,
      trim: true
    }
  },

  // Services & Pricing
  servicesOffered: [{
    type: String,
    enum: [
      'Custom Design', 'Pattern Making', 'Technical Drawings',
      'Garment Construction', 'Fitting Services', 'Design Consultation',
      'Trend Forecasting', 'Collection Development', 'Brand Development',
      'Fashion Illustration', 'CAD Services', 'Production Planning',
      'Quality Control', 'Sourcing Assistance', 'Design Education'
    ]
  }],

  customDesign: {
    type: Boolean,
    default: false
  },

  consultingServices: {
    type: Boolean,
    default: false
  },

  rates: {
    consultationHourly: {
      type: String,
      trim: true
    },
    customDesignStarting: {
      type: String,
      trim: true
    },
    patternMaking: {
      type: String,
      trim: true
    },
    technicalDrawings: {
      type: String,
      trim: true
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    }
  },

  // Work Preferences
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'project-based', 'seasonal', 'by-commission']
  },

  projectTypes: [{
    type: String,
    enum: [
      'Custom Garments', 'Collection Development', 'Pattern Creation',
      'Technical Consultation', 'Design Collaboration', 'Brand Projects',
      'Fashion Week Preparation', 'Startup Assistance', 'Redesign Projects',
      'Sustainable Design', 'Costume Design', 'Uniform Design'
    ]
  }],

  collaborationStyle: {
    type: String,
    trim: true
  },

  clientTypes: [{
    type: String,
    enum: [
      'Fashion Brands', 'Individual Clients', 'Celebrities', 'Influencers',
      'Retail Companies', 'Startups', 'Costume Departments', 'Theater Companies',
      'Dance Companies', 'Wedding Clients', 'Corporate Clients', 'Non-Profits'
    ]
  }],

  // Portfolio Images
  photos: [{
    type: String, // File paths
    trim: true
  }],
  
  profilePicture: {
    type: String,
    trim: true
  },
  
  coverPhoto: {
    type: String,
    trim: true
  },

  // Status & Analytics
  isComplete: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileViews: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  reviewCount: {
    type: Number,
    default: 0
  },

  // Legacy fields for compatibility
  skills: [{
    type: String,
    trim: true
  }],
  specializations: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    trim: true
  },
  preferredTypes: [{
    type: String,
    trim: true
  }],
  website: {
    type: String,
    trim: true
  }

}, {
  timestamps: true
});

// Indexes for performance
fashionDesignerProfileSchema.index({ userId: 1 });
fashionDesignerProfileSchema.index({ location: 1 });
fashionDesignerProfileSchema.index({ designCategories: 1 });
fashionDesignerProfileSchema.index({ designStyles: 1 });
fashionDesignerProfileSchema.index({ businessModel: 1 });
fashionDesignerProfileSchema.index({ isComplete: 1 });
fashionDesignerProfileSchema.index({ isVerified: 1 });
fashionDesignerProfileSchema.index({ profileViews: -1 });
fashionDesignerProfileSchema.index({ createdAt: -1 });

// Compound indexes
fashionDesignerProfileSchema.index({ designCategories: 1, location: 1 });
fashionDesignerProfileSchema.index({ isComplete: 1, isVerified: 1 });
fashionDesignerProfileSchema.index({ businessModel: 1, designCategories: 1 });

// Virtual for profile completion percentage
fashionDesignerProfileSchema.virtual('completionPercentage').get(function() {
  let completed = 0;
  const total = 16; // Total checkpoints

  // Basic information (4 points)
  if (this.fullName && this.fullName.trim()) completed++;
  if (this.headline && this.headline.trim()) completed++;
  if (this.bio && this.bio.trim().length > 20) completed++;
  if (this.location && this.location.trim()) completed++;

  // Professional background (3 points)
  if (this.yearsExperience) completed++;
  if (this.designCategories && this.designCategories.length > 0) completed++;
  if (this.businessModel) completed++;

  // Technical skills (3 points)
  if (this.technicalSkills && this.technicalSkills.length > 0) completed++;
  if (this.softwareSkills && this.softwareSkills.length > 0) completed++;
  if (this.materialKnowledge && this.materialKnowledge.length > 0) completed++;

  // Portfolio & services (3 points)
  if (this.portfolioWebsite && this.portfolioWebsite.trim()) completed++;
  if (this.servicesOffered && this.servicesOffered.length > 0) completed++;
  if (this.photos && this.photos.length > 0) completed++;

  // Business setup (2 points)
  if (this.availability) completed++;
  if (this.rates && (this.rates.consultationHourly || this.rates.customDesignStarting)) completed++;

  // Profile assets (1 point)
  if (this.profilePicture) completed++;

  return Math.round((completed / total) * 100);
});

// Method to calculate profile score for search ranking
fashionDesignerProfileSchema.methods.calculateProfileScore = function() {
  let score = 0;
  
  // Completion bonus
  score += this.completionPercentage * 0.4;
  
  // Verification bonus
  if (this.isVerified) score += 20;
  
  // Portfolio size bonus
  if (this.photos && this.photos.length > 0) {
    score += Math.min(this.photos.length * 2, 20);
  }
  
  // Professional experience bonus
  const expMap = { '0-2': 5, '3-5': 10, '6-10': 15, '11-15': 20, '15+': 25 };
  score += expMap[this.yearsExperience] || 0;
  
  // Specialization diversity bonus
  if (this.designCategories && this.designCategories.length > 0) {
    score += Math.min(this.designCategories.length * 2, 15);
  }
  
  // Technical skills bonus
  if (this.technicalSkills && this.technicalSkills.length > 0) {
    score += Math.min(this.technicalSkills.length * 1, 10);
  }
  
  // View count bonus (normalized)
  if (this.profileViews > 0) {
    score += Math.min(Math.log10(this.profileViews) * 5, 15);
  }
  
  return Math.min(Math.round(score), 100);
};

// Pre-save middleware to set legacy fields for compatibility
fashionDesignerProfileSchema.pre('save', function(next) {
  // Map new fields to legacy fields for backward compatibility
  if (this.technicalSkills && this.softwareSkills) {
    this.skills = [...this.technicalSkills, ...this.softwareSkills];
  }
  
  if (this.designCategories) {
    this.specializations = this.designCategories;
  }
  
  if (this.bio) {
    this.experience = this.bio;
  }
  
  if (this.servicesOffered) {
    this.preferredTypes = this.servicesOffered;
  }
  
  if (this.portfolioWebsite) {
    this.website = this.portfolioWebsite;
  }
  
  // Update isComplete based on required fields
  const requiredFields = [
    'fullName', 'location', 'yearsExperience', 'businessModel'
  ];
  
  const hasRequiredArrays = 
    this.designCategories && this.designCategories.length > 0;
  
  const hasAllRequired = requiredFields.every(field => 
    this[field] && this[field].toString().trim()
  );
  
  this.isComplete = hasAllRequired && hasRequiredArrays;
  next();
});

module.exports = mongoose.model('FashionDesignerProfile', fashionDesignerProfileSchema);