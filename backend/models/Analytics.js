const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Profile metrics
  profileViews: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    lastMonth: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    daily: { type: Number, default: 0 }
  },
  
  // Portfolio metrics
  portfolioPhotos: { type: Number, default: 0 },
  portfolioVideos: { type: Number, default: 0 },
  
  // Application metrics
  applications: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 }
  },
  
  // Booking metrics
  bookings: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 }
  },
  
  // Connection metrics
  connections: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    mutualConnections: { type: Number, default: 0 }
  },
  
  // Financial metrics
  earnings: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    lastMonth: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    paid: { type: Number, default: 0 }
  },
  
  // Performance metrics
  responseRate: { type: Number, default: 100 }, // Percentage
  completionRate: { type: Number, default: 100 }, // Percentage
  avgRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  
  // Growth metrics
  monthlyGrowth: {
    profileViews: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    connections: { type: Number, default: 0 }
  },
  
  // Brand/Agency specific metrics
  brandMetrics: {
    activeCampaigns: { type: Number, default: 0 },
    talentCollaborations: { type: Number, default: 0 },
    brandReach: { type: Number, default: 0 },
    campaignROI: { type: Number, default: 0 },
    marketingBudget: { type: Number, default: 0 },
    brandScore: { type: Number, default: 0 }
  },
  
  // Agency specific metrics
  agencyMetrics: {
    talentRosterSize: { type: Number, default: 0 },
    activePlacements: { type: Number, default: 0 },
    clientRelationships: { type: Number, default: 0 },
    commissionRevenue: { type: Number, default: 0 },
    bookingSuccessRate: { type: Number, default: 0 },
    agencyScore: { type: Number, default: 0 }
  },
  
  // Last updated timestamps for monthly calculations
  lastMonthlyReset: { type: Date, default: Date.now },
  lastWeeklyReset: { type: Date, default: Date.now },
  lastDailyReset: { type: Date, default: Date.now }
  
}, {
  timestamps: true
});

// Indexes for better performance
analyticsSchema.index({ userId: 1 });
analyticsSchema.index({ 'profileViews.total': -1 });
analyticsSchema.index({ 'earnings.total': -1 });
analyticsSchema.index({ lastMonthlyReset: 1 });

// Method to calculate monthly growth
analyticsSchema.methods.calculateMonthlyGrowth = function() {
  const currentMonth = this.profileViews.thisMonth;
  const lastMonth = this.profileViews.lastMonth;
  
  if (lastMonth === 0) return 0;
  return Math.round(((currentMonth - lastMonth) / lastMonth) * 100);
};

// Method to update profile views
analyticsSchema.methods.incrementProfileViews = function() {
  this.profileViews.total += 1;
  this.profileViews.thisMonth += 1;
  this.profileViews.weekly += 1;
  this.profileViews.daily += 1;
  return this.save();
};

// Method to update portfolio count
analyticsSchema.methods.updatePortfolioCount = function(photoCount, videoCount = 0) {
  this.portfolioPhotos = photoCount;
  this.portfolioVideos = videoCount;
  return this.save();
};

// Method to update application metrics
analyticsSchema.methods.incrementApplications = function(status = 'pending') {
  this.applications.total += 1;
  this.applications.thisMonth += 1;
  this.applications[status] += 1;
  return this.save();
};

// Method to update booking metrics
analyticsSchema.methods.incrementBookings = function(status = 'active', amount = 0) {
  this.bookings.total += 1;
  this.bookings.thisMonth += 1;
  this.bookings[status] += 1;
  
  if (amount > 0) {
    this.earnings.total += amount;
    this.earnings.thisMonth += amount;
    if (status === 'completed') {
      this.earnings.paid += amount;
    } else {
      this.earnings.pending += amount;
    }
  }
  
  return this.save();
};

// Method to update connection count
analyticsSchema.methods.incrementConnections = function() {
  this.connections.total += 1;
  this.connections.thisMonth += 1;
  return this.save();
};

// Static method to reset monthly counters
analyticsSchema.statics.resetMonthlyCounters = async function() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const analytics = await this.find({
    lastMonthlyReset: { $lt: oneMonthAgo }
  });
  
  for (let analytic of analytics) {
    // Move current month to last month
    analytic.profileViews.lastMonth = analytic.profileViews.thisMonth;
    analytic.earnings.lastMonth = analytic.earnings.thisMonth;
    
    // Reset current month counters
    analytic.profileViews.thisMonth = 0;
    analytic.applications.thisMonth = 0;
    analytic.bookings.thisMonth = 0;
    analytic.connections.thisMonth = 0;
    analytic.earnings.thisMonth = 0;
    
    // Calculate growth
    analytic.monthlyGrowth.profileViews = analytic.calculateMonthlyGrowth();
    
    analytic.lastMonthlyReset = new Date();
    await analytic.save();
  }
};

module.exports = mongoose.model('Analytics', analyticsSchema); 