const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'pro'],
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'],
    default: 'active'
  },
  stripeCustomerId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripePriceId: {
    type: String
  },
  currentPeriodStart: {
    type: Date
  },
  currentPeriodEnd: {
    type: Date
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  features: {
    maxApplicationsPerMonth: {
      type: Number,
      default: 5 // Basic plan limit
    },
    priorityListing: {
      type: Boolean,
      default: false
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    premiumSupport: {
      type: Boolean,
      default: false
    },
    portfolioThemes: {
      type: Boolean,
      default: false
    },
    verifiedBadge: {
      type: Boolean,
      default: false
    }
  },
  usage: {
    applicationsThisMonth: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  paymentHistory: [{
    amount: Number,
    currency: String,
    status: String,
    stripePaymentIntentId: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  trialEndsAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get plan features
subscriptionSchema.statics.getPlanFeatures = function(planType) {
  const plans = {
    basic: {
      maxApplicationsPerMonth: 5,
      priorityListing: false,
      advancedAnalytics: false,
      premiumSupport: false,
      portfolioThemes: false,
      verifiedBadge: false,
      price: 0,
      name: 'Basic',
      description: 'Perfect for getting started'
    },
    premium: {
      maxApplicationsPerMonth: 50,
      priorityListing: true,
      advancedAnalytics: true,
      premiumSupport: true,
      portfolioThemes: true,
      verifiedBadge: true,
      price: 9.99,
      name: 'Premium',
      description: 'Advanced features for professionals'
    },
    pro: {
      maxApplicationsPerMonth: -1, // Unlimited
      priorityListing: true,
      advancedAnalytics: true,
      premiumSupport: true,
      portfolioThemes: true,
      verifiedBadge: true,
      price: 19.99,
      name: 'Pro',
      description: 'Everything you need to succeed'
    }
  };
  
  return plans[planType] || plans.basic;
};

// Instance method to check if user can perform action
subscriptionSchema.methods.canPerformAction = function(action) {
  const features = this.features;
  
  switch(action) {
    case 'apply_to_job':
      if (features.maxApplicationsPerMonth === -1) return true;
      return this.usage.applicationsThisMonth < features.maxApplicationsPerMonth;
    case 'priority_listing':
      return features.priorityListing;
    case 'advanced_analytics':
      return features.advancedAnalytics;
    case 'premium_support':
      return features.premiumSupport;
    case 'portfolio_themes':
      return features.portfolioThemes;
    case 'verified_badge':
      return features.verifiedBadge;
    default:
      return false;
  }
};

// Instance method to increment usage
subscriptionSchema.methods.incrementUsage = function(action) {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  // Reset monthly usage if it's a new month
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.applicationsThisMonth = 0;
    this.usage.lastResetDate = now;
  }
  
  if (action === 'apply_to_job') {
    this.usage.applicationsThisMonth += 1;
  }
  
  return this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema); 