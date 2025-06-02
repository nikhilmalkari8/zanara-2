const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 50000 // 50k characters for long-form content
  },
  excerpt: {
    type: String,
    maxlength: 500 // Short preview for feeds
  },
  coverImage: {
    url: String,
    alt: String,
    caption: String
  },
  images: [{
    url: String,
    alt: String,
    caption: String,
    position: Number // Position in content
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['behind-the-scenes', 'tips-advice', 'industry-news', 'personal-story', 'portfolio-showcase', 'career-advice', 'fashion-trends', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  readTime: {
    type: Number, // Estimated read time in minutes
    default: 1
  },
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comment: {
        type: String,
        required: true,
        maxlength: 1000
      },
      commentedAt: {
        type: Date,
        default: Date.now
      }
    }],
    shares: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    readCount: {
      type: Number,
      default: 0
    },
    lastReadAt: Date,
    featured: {
      type: Boolean,
      default: false
    },
    featuredAt: Date
  },
  seo: {
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  publishedAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
contentSchema.index({ author: 1, status: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ category: 1 });
contentSchema.index({ publishedAt: -1 });
contentSchema.index({ 'engagement.views': -1 });
contentSchema.index({ 'seo.slug': 1 });

// Virtual for like count
contentSchema.virtual('likeCount').get(function() {
  return this.engagement.likes.length;
});

// Virtual for comment count
contentSchema.virtual('commentCount').get(function() {
  return this.engagement.comments.length;
});

// Generate slug from title
contentSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.seo.slug) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Calculate read time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    // Generate excerpt if not provided
    if (!this.excerpt) {
      this.excerpt = this.content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .substring(0, 300) + '...';
    }
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static methods
contentSchema.statics.getPublishedContent = function(options = {}) {
  const {
    page = 1,
    limit = 10,
    category,
    tags,
    author,
    visibility = 'public'
  } = options;
  
  const query = { status: 'published' };
  
  if (category) query.category = category;
  if (tags) query.tags = { $in: tags };
  if (author) query.author = author;
  if (visibility !== 'all') query.visibility = visibility;
  
  return this.find(query)
    .populate('author', 'firstName lastName userType')
    .sort({ publishedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();
};

contentSchema.statics.getTrendingContent = function(days = 7) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    status: 'published',
    publishedAt: { $gte: dateThreshold }
  })
    .populate('author', 'firstName lastName userType')
    .sort({ 'engagement.views': -1, 'engagement.likes': -1 })
    .limit(10)
    .lean();
};

contentSchema.statics.searchContent = function(searchTerm, options = {}) {
  const { page = 1, limit = 10 } = options;
  
  return this.find({
    status: 'published',
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } }
    ]
  })
    .populate('author', 'firstName lastName userType')
    .sort({ publishedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();
};

module.exports = mongoose.model('Content', contentSchema);