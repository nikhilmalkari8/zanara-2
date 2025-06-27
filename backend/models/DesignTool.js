const mongoose = require('mongoose');

// Tech Pack Schema
const techPackSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  season: { type: String, trim: true },
  category: { type: String, trim: true },
  productType: { type: String, trim: true },
  designer: { type: String, trim: true },
  version: { type: String, default: '1.0' },
  
  // Design Details
  designDetails: {
    silhouette: String,
    fit: String,
    style: String,
    inspiration: String,
    targetCustomer: String,
    pricePoint: String
  },
  
  // Technical Specifications
  measurements: {
    sizeRange: [String],
    measurementPoints: [{
      name: String,
      xs: String,
      s: String,
      m: String,
      l: String,
      xl: String
    }]
  },
  
  // Materials & Fabrics
  materials: {
    mainFabric: {
      name: String,
      composition: String,
      weight: String,
      width: String,
      supplier: String,
      color: String,
      pantone: String,
      consumption: String
    },
    lining: {
      name: String,
      composition: String,
      color: String,
      consumption: String
    },
    interfacing: {
      name: String,
      type: String,
      placement: String
    },
    trims: [{
      name: String,
      type: String,
      color: String,
      supplier: String,
      quantity: String
    }]
  },
  
  // Construction Details
  construction: {
    seams: String,
    stitching: String,
    finishing: String,
    specialInstructions: String,
    qualityStandards: String
  },
  
  // Colors & Colorways
  colors: [{
    name: String,
    hex: String,
    pantone: String,
    description: String
  }],
  
  // Sketches & Images
  images: {
    frontSketch: String,
    backSketch: String,
    sideSketch: String,
    detailSketches: [String],
    inspirationImages: [String],
    fabricSwatches: [String]
  },
  
  // Production Notes
  production: {
    minimumOrder: String,
    leadTime: String,
    packagingRequirements: String,
    labelingInstructions: String,
    careInstructions: String,
    specialRequirements: String
  },
  
  // Metadata
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: { type: Boolean, default: false },
  tags: [String],
  linkedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  linkedOpportunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  }]
}, {
  timestamps: true
});

// Fabric Schema
const fabricSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['Cotton', 'Linen', 'Silk', 'Wool', 'Synthetic', 'Denim', 'Knit', 'Other'],
    required: true 
  },
  composition: { type: String, required: true, trim: true },
  weight: { type: Number, required: true }, // in gsm
  weightCategory: {
    type: String,
    enum: ['light', 'medium', 'heavy'],
    required: true
  },
  width: { type: Number, required: true }, // in cm
  
  // Visual Properties
  color: { type: String, required: true }, // hex color
  pantone: { type: String, trim: true },
  texture: { type: String, trim: true },
  swatchImage: { type: String, trim: true },
  
  // Supplier Information
  supplier: {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    leadTime: { type: String, trim: true },
    contactInfo: {
      email: String,
      phone: String,
      website: String
    }
  },
  
  // Pricing Information
  pricing: {
    minimumOrder: { type: Number, required: true },
    pricePerMeter: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    bulkDiscount: String,
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Sustainability Information
  sustainability: {
    isOrganic: { type: Boolean, default: false },
    isRecycled: { type: Boolean, default: false },
    certifications: [String],
    carbonFootprint: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    waterUsage: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Reduced'],
      default: 'Medium'
    }
  },
  
  // Technical Properties
  properties: {
    breathability: {
      type: String,
      enum: ['Poor', 'Fair', 'Good', 'High', 'Excellent'],
      default: 'Good'
    },
    stretch: {
      type: String,
      enum: ['None', 'Slight', 'Moderate', 'High'],
      default: 'None'
    },
    drape: {
      type: String,
      enum: ['Structured', 'Semi-structured', 'Fluid'],
      default: 'Semi-structured'
    },
    opacity: {
      type: String,
      enum: ['Transparent', 'Semi-transparent', 'Semi-opaque', 'Opaque'],
      default: 'Opaque'
    },
    careInstructions: String
  },
  
  // Applications
  applications: [String],
  
  // Inventory & Status
  inStock: { type: Boolean, default: true },
  trending: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  
  // User Interactions
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: { type: Number, default: 0 },
  
  // Admin
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Color Palette Schema
const colorPaletteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  season: { type: String, trim: true },
  theme: { type: String, trim: true },
  
  colors: [{
    name: String,
    hex: { type: String, required: true },
    pantone: String,
    cmyk: {
      c: Number,
      m: Number,
      y: Number,
      k: Number
    },
    rgb: {
      r: Number,
      g: Number,
      b: Number
    },
    usage: {
      type: String,
      enum: ['primary', 'secondary', 'accent', 'neutral'],
      default: 'primary'
    },
    percentage: Number // percentage of palette
  }],
  
  // Palette Properties
  harmony: {
    type: String,
    enum: ['monochromatic', 'analogous', 'complementary', 'triadic', 'tetradic', 'custom'],
    default: 'custom'
  },
  mood: [String], // warm, cool, vibrant, muted, etc.
  applications: [String], // fashion, interior, branding, etc.
  
  // Metadata
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: { type: Boolean, default: false },
  tags: [String],
  
  // Trends & Inspiration
  trendSource: String,
  inspirationImages: [String],
  
  // Usage Tracking
  usageCount: { type: Number, default: 0 },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Pattern Schema
const patternSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ['dress', 'top', 'bottom', 'outerwear', 'lingerie', 'accessories'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  
  // Pattern Files
  files: {
    pdf: String,
    dxf: String,
    svg: String,
    ai: String
  },
  
  // Size Information
  sizes: [{
    name: String, // XS, S, M, L, XL, etc.
    measurements: {
      bust: Number,
      waist: Number,
      hip: Number,
      length: Number
    }
  }],
  
  // Construction Details
  construction: {
    seams: [String],
    notches: [String],
    grainlines: [String],
    instructions: String
  },
  
  // Materials Required
  materials: {
    fabricYardage: Number,
    fabricWidth: Number,
    liningYardage: Number,
    interfacing: String,
    notions: [String]
  },
  
  // Metadata
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  
  // Reviews & Ratings
  rating: { type: Number, min: 1, max: 5, default: 5 },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    images: [String],
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Design Project Schema (for general design tools usage)
const designProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['moodboard', 'tech-pack', 'color-palette', 'pattern', 'collection', 'sketch'],
    required: true
  },
  description: { type: String, trim: true },
  
  // Project Data (flexible schema for different tool types)
  data: mongoose.Schema.Types.Mixed,
  
  // Files & Assets
  files: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Collaboration
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Status & Visibility
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'private'
  },
  
  // Metadata
  tags: [String],
  category: String,
  season: String,
  
  // Analytics
  views: { type: Number, default: 0 },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastAccessedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Moodboard Schema
const moodboardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['inspiration', 'color-palette', 'texture', 'silhouette', 'seasonal'],
    default: 'inspiration'
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    id: String,
    url: String,
    alt_description: String,
    photographer: String,
    source: {
      type: String,
      enum: ['unsplash', 'upload', 'url'],
      default: 'unsplash'
    }
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
techPackSchema.index({ owner: 1, createdAt: -1 });
techPackSchema.index({ name: 'text', description: 'text' });
techPackSchema.index({ tags: 1 });

fabricSchema.index({ category: 1, inStock: 1 });
fabricSchema.index({ 'sustainability.isOrganic': 1, 'sustainability.isRecycled': 1 });
fabricSchema.index({ 'pricing.pricePerMeter': 1 });
fabricSchema.index({ name: 'text', composition: 'text' });

colorPaletteSchema.index({ owner: 1, createdAt: -1 });
colorPaletteSchema.index({ name: 'text', description: 'text' });
colorPaletteSchema.index({ tags: 1, isPublic: 1 });

patternSchema.index({ category: 1, difficulty: 1 });
patternSchema.index({ owner: 1, isPublic: 1 });
patternSchema.index({ rating: -1, downloads: -1 });

designProjectSchema.index({ owner: 1, type: 1, status: 1 });
designProjectSchema.index({ name: 'text', description: 'text' });
designProjectSchema.index({ lastAccessedAt: -1 });

// Virtual for fabric price range category
fabricSchema.virtual('priceCategory').get(function() {
  const price = this.pricing.pricePerMeter;
  if (price < 15) return 'budget';
  if (price <= 25) return 'mid';
  return 'premium';
});

// Method to increment fabric views
fabricSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle fabric favorite
fabricSchema.methods.toggleFavorite = function(userId) {
  const index = this.favorites.indexOf(userId);
  if (index > -1) {
    this.favorites.splice(index, 1);
  } else {
    this.favorites.push(userId);
  }
  return this.save();
};

// Method to calculate color palette dominant colors
colorPaletteSchema.methods.getDominantColors = function() {
  return this.colors
    .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
    .slice(0, 3);
};

// Method to seed mock fabric data
fabricSchema.statics.seedMockData = async function() {
  const mockFabrics = [
    {
      name: 'Organic Cotton Twill',
      category: 'Cotton',
      composition: '100% Organic Cotton',
      weight: 280,
      weightCategory: 'medium',
      width: 150,
      color: '#F5F5DC',
      pantone: '11-0105 TPX',
      texture: 'Diagonal weave with soft hand feel',
      supplier: {
        name: 'EcoTex Portugal',
        location: 'Porto, Portugal',
        rating: 4.8,
        leadTime: '3-4 weeks',
        contactInfo: {
          email: 'orders@ecotex.pt',
          phone: '+351 22 123 4567',
          website: 'www.ecotex.pt'
        }
      },
      pricing: {
        minimumOrder: 50,
        pricePerMeter: 18.50,
        currency: 'EUR',
        bulkDiscount: '5% for 500m+, 10% for 1000m+'
      },
      sustainability: {
        isOrganic: true,
        isRecycled: false,
        certifications: ['GOTS', 'OEKO-TEX Standard 100'],
        carbonFootprint: 'Low',
        waterUsage: 'Reduced'
      },
      properties: {
        breathability: 'High',
        stretch: 'None',
        drape: 'Semi-structured',
        opacity: 'Opaque',
        careInstructions: 'Machine wash cold, tumble dry low'
      },
      applications: ['Shirts', 'Dresses', 'Pants', 'Jackets'],
      inStock: true,
      trending: true,
      featured: true
    },
    {
      name: 'Recycled Polyester Crepe',
      category: 'Synthetic',
      composition: '100% Recycled Polyester',
      weight: 120,
      weightCategory: 'light',
      width: 145,
      color: '#E6E6FA',
      pantone: '14-3207 TPX',
      texture: 'Crinkled surface with fluid drape',
      supplier: {
        name: 'GreenWeave Italy',
        location: 'Milan, Italy',
        rating: 4.6,
        leadTime: '2-3 weeks',
        contactInfo: {
          email: 'info@greenweave.it',
          phone: '+39 02 1234 5678',
          website: 'www.greenweave.it'
        }
      },
      pricing: {
        minimumOrder: 25,
        pricePerMeter: 22.00,
        currency: 'EUR',
        bulkDiscount: '8% for 200m+, 15% for 500m+'
      },
      sustainability: {
        isOrganic: false,
        isRecycled: true,
        certifications: ['GRS', 'OEKO-TEX Standard 100'],
        carbonFootprint: 'Medium',
        waterUsage: 'Low'
      },
      properties: {
        breathability: 'Good',
        stretch: 'Slight',
        drape: 'Fluid',
        opacity: 'Semi-opaque',
        careInstructions: 'Hand wash or delicate cycle, hang dry'
      },
      applications: ['Blouses', 'Dresses', 'Scarves', 'Linings'],
      inStock: true,
      trending: false,
      featured: true
    },
    {
      name: 'Linen Blend Canvas',
      category: 'Linen',
      composition: '60% Linen, 40% Organic Cotton',
      weight: 320,
      weightCategory: 'heavy',
      width: 140,
      color: '#F0E68C',
      pantone: '13-0859 TPX',
      texture: 'Structured with natural slub texture',
      supplier: {
        name: 'Natural Fibers Belgium',
        location: 'Ghent, Belgium',
        rating: 4.9,
        leadTime: '4-5 weeks',
        contactInfo: {
          email: 'sales@naturalfibers.be',
          phone: '+32 9 123 4567',
          website: 'www.naturalfibers.be'
        }
      },
      pricing: {
        minimumOrder: 30,
        pricePerMeter: 28.75,
        currency: 'EUR',
        bulkDiscount: '6% for 300m+, 12% for 750m+'
      },
      sustainability: {
        isOrganic: true,
        isRecycled: false,
        certifications: ['OEKO-TEX Standard 100', 'European Flax'],
        carbonFootprint: 'Low',
        waterUsage: 'Medium'
      },
      properties: {
        breathability: 'Excellent',
        stretch: 'None',
        drape: 'Structured',
        opacity: 'Opaque',
        careInstructions: 'Machine wash warm, line dry recommended'
      },
      applications: ['Jackets', 'Bags', 'Home Textiles', 'Upholstery'],
      inStock: true,
      trending: false,
      featured: false
    }
  ];

  try {
    const existingCount = await this.countDocuments();
    if (existingCount === 0) {
      await this.insertMany(mockFabrics);
      console.log('✅ Mock fabric data seeded successfully');
    }
  } catch (error) {
    console.error('❌ Error seeding mock fabric data:', error);
  }
};

// Export models
const TechPack = mongoose.model('TechPack', techPackSchema);
const Fabric = mongoose.model('Fabric', fabricSchema);
const ColorPalette = mongoose.model('ColorPalette', colorPaletteSchema);
const Pattern = mongoose.model('Pattern', patternSchema);
const DesignProject = mongoose.model('DesignProject', designProjectSchema);
const Moodboard = mongoose.model('Moodboard', moodboardSchema);

module.exports = {
  TechPack,
  Fabric,
  ColorPalette,
  Pattern,
  DesignProject,
  Moodboard
}; 