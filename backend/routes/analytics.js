const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const ProfileView = require('../models/ProfileView');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get dashboard analytics for the current user
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get or create analytics record
    let analytics = await Analytics.findOne({ userId });
    
    if (!analytics) {
      analytics = new Analytics({ userId });
      await analytics.save();
    }
    
    // Get real-time data
    const realTimeData = await getRealTimeData(userId);
    
    // Merge analytics with real-time data
    const dashboardData = {
      profileViews: analytics.profileViews.total || 0,
      portfolioPhotos: realTimeData.portfolioPhotos,
      applications: realTimeData.applications,
      bookings: realTimeData.bookings,
      connections: realTimeData.connections,
      earnings: analytics.earnings.total || 0,
      completionRate: analytics.completionRate || 100,
      avgRating: analytics.avgRating || 4.8,
      responseRate: analytics.responseRate || 98,
      monthlyGrowth: analytics.monthlyGrowth.profileViews || 0,
      brandScore: analytics.brandMetrics.brandScore || 85,
      
      // Brand specific metrics
      brandMetrics: {
        activeCampaigns: analytics.brandMetrics.activeCampaigns || realTimeData.activeCampaigns,
        talentCollaborations: analytics.brandMetrics.talentCollaborations || realTimeData.talentCollaborations,
        brandReach: analytics.brandMetrics.brandReach || 0,
        campaignROI: analytics.brandMetrics.campaignROI || 0,
        marketingBudget: analytics.brandMetrics.marketingBudget || 0,
        brandScore: analytics.brandMetrics.brandScore || 85
      },
      
      // Agency specific metrics
      agencyMetrics: {
        talentRosterSize: analytics.agencyMetrics.talentRosterSize || realTimeData.talentRosterSize,
        activePlacements: analytics.agencyMetrics.activePlacements || realTimeData.activePlacements,
        clientRelationships: analytics.agencyMetrics.clientRelationships || realTimeData.clientRelationships,
        commissionRevenue: analytics.agencyMetrics.commissionRevenue || analytics.earnings.total,
        bookingSuccessRate: analytics.agencyMetrics.bookingSuccessRate || 85,
        agencyScore: analytics.agencyMetrics.agencyScore || 90
      }
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics'
    });
  }
});

// Record a profile view
router.post('/profile-view', auth, async (req, res) => {
  try {
    const { profileOwnerId, viewType, source } = req.body;
    const viewerId = req.user.id;
    
    if (!profileOwnerId) {
      return res.status(400).json({
        success: false,
        message: 'Profile owner ID is required'
      });
    }
    
    // Record the view
    const profileView = await ProfileView.recordView(viewerId, profileOwnerId, {
      viewType: viewType || 'profile',
      source: source || 'direct-link',
      userAgent: req.get('User-Agent'),
      ipHash: hashIP(req.ip)
    });
    
    res.json({
      success: true,
      data: profileView
    });
    
  } catch (error) {
    console.error('Error recording profile view:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording profile view'
    });
  }
});

// Update portfolio count
router.post('/portfolio-update', auth, async (req, res) => {
  try {
    const { photoCount, videoCount } = req.body;
    const userId = req.user.id;
    
    let analytics = await Analytics.findOne({ userId });
    if (!analytics) {
      analytics = new Analytics({ userId });
    }
    
    await analytics.updatePortfolioCount(photoCount || 0, videoCount || 0);
    
    res.json({
      success: true,
      message: 'Portfolio count updated'
    });
    
  } catch (error) {
    console.error('Error updating portfolio count:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating portfolio count'
    });
  }
});

// Update application metrics
router.post('/application-update', auth, async (req, res) => {
  try {
    const { status } = req.body; // 'pending', 'accepted', 'rejected'
    const userId = req.user.id;
    
    let analytics = await Analytics.findOne({ userId });
    if (!analytics) {
      analytics = new Analytics({ userId });
    }
    
    await analytics.incrementApplications(status || 'pending');
    
    res.json({
      success: true,
      message: 'Application metrics updated'
    });
    
  } catch (error) {
    console.error('Error updating application metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application metrics'
    });
  }
});

// Update booking metrics
router.post('/booking-update', auth, async (req, res) => {
  try {
    const { status, amount } = req.body; // 'active', 'completed', 'cancelled'
    const userId = req.user.id;
    
    let analytics = await Analytics.findOne({ userId });
    if (!analytics) {
      analytics = new Analytics({ userId });
    }
    
    await analytics.incrementBookings(status || 'active', amount || 0);
    
    res.json({
      success: true,
      message: 'Booking metrics updated'
    });
    
  } catch (error) {
    console.error('Error updating booking metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking metrics'
    });
  }
});

// Update connection count
router.post('/connection-update', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let analytics = await Analytics.findOne({ userId });
    if (!analytics) {
      analytics = new Analytics({ userId });
    }
    
    await analytics.incrementConnections();
    
    res.json({
      success: true,
      message: 'Connection count updated'
    });
    
  } catch (error) {
    console.error('Error updating connection count:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating connection count'
    });
  }
});

// Get profile view statistics
router.get('/profile-views/:timeframe?', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const timeframe = req.params.timeframe || '30d';
    
    const stats = await ProfileView.getViewStats(userId, timeframe);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching profile view stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile view stats'
    });
  }
});

// Update brand/agency specific metrics
router.post('/brand-metrics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      activeCampaigns, 
      talentCollaborations, 
      brandReach, 
      campaignROI, 
      marketingBudget,
      brandScore 
    } = req.body;
    
    let analytics = await Analytics.findOne({ userId });
    if (!analytics) {
      analytics = new Analytics({ userId });
    }
    
    // Update brand metrics
    if (activeCampaigns !== undefined) analytics.brandMetrics.activeCampaigns = activeCampaigns;
    if (talentCollaborations !== undefined) analytics.brandMetrics.talentCollaborations = talentCollaborations;
    if (brandReach !== undefined) analytics.brandMetrics.brandReach = brandReach;
    if (campaignROI !== undefined) analytics.brandMetrics.campaignROI = campaignROI;
    if (marketingBudget !== undefined) analytics.brandMetrics.marketingBudget = marketingBudget;
    if (brandScore !== undefined) analytics.brandMetrics.brandScore = brandScore;
    
    await analytics.save();
    
    res.json({
      success: true,
      message: 'Brand metrics updated'
    });
    
  } catch (error) {
    console.error('Error updating brand metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating brand metrics'
    });
  }
});

// Update agency specific metrics
router.post('/agency-metrics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      talentRosterSize, 
      activePlacements, 
      clientRelationships, 
      commissionRevenue, 
      bookingSuccessRate,
      agencyScore 
    } = req.body;
    
    let analytics = await Analytics.findOne({ userId });
    if (!analytics) {
      analytics = new Analytics({ userId });
    }
    
    // Update agency metrics
    if (talentRosterSize !== undefined) analytics.agencyMetrics.talentRosterSize = talentRosterSize;
    if (activePlacements !== undefined) analytics.agencyMetrics.activePlacements = activePlacements;
    if (clientRelationships !== undefined) analytics.agencyMetrics.clientRelationships = clientRelationships;
    if (commissionRevenue !== undefined) analytics.agencyMetrics.commissionRevenue = commissionRevenue;
    if (bookingSuccessRate !== undefined) analytics.agencyMetrics.bookingSuccessRate = bookingSuccessRate;
    if (agencyScore !== undefined) analytics.agencyMetrics.agencyScore = agencyScore;
    
    await analytics.save();
    
    res.json({
      success: true,
      message: 'Agency metrics updated'
    });
    
  } catch (error) {
    console.error('Error updating agency metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating agency metrics'
    });
  }
});

// Helper function to get real-time data from existing collections
async function getRealTimeData(userId) {
  try {
    // Get connections count
    const Connection = require('../models/Connection');
    const connectionsCount = await Connection.countDocuments({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });
    
    // Get applications count (if Application model exists)
    let applicationsCount = 0;
    try {
      const Application = require('../models/Application');
      applicationsCount = await Application.countDocuments({ userId });
    } catch (e) {
      // Application model might not exist yet
    }
    
    // Get bookings count (if Booking model exists)
    let bookingsCount = 0;
    try {
      const Booking = require('../models/Booking');
      bookingsCount = await Booking.countDocuments({ 
        $or: [{ clientId: userId }, { talentId: userId }],
        status: { $in: ['active', 'confirmed'] }
      });
    } catch (e) {
      // Booking model might not exist yet
    }
    
    // Get portfolio photos count from user profile
    const user = await User.findById(userId);
    const portfolioPhotos = user?.portfolio?.photos?.length || 0;
    
    // Get opportunities count for brands/agencies
    let activeCampaigns = 0;
    let talentCollaborations = 0;
    let talentRosterSize = 0;
    let activePlacements = 0;
    let clientRelationships = 0;
    
    try {
      const Opportunity = require('../models/Opportunity');
      activeCampaigns = await Opportunity.countDocuments({ 
        companyId: userId, 
        status: 'active' 
      });
      
      // Count collaborations (applications to this user's opportunities)
      const opportunities = await Opportunity.find({ companyId: userId });
      const opportunityIds = opportunities.map(opp => opp._id);
      
      if (opportunityIds.length > 0) {
        try {
          const Application = require('../models/Application');
          talentCollaborations = await Application.countDocuments({
            opportunityId: { $in: opportunityIds },
            status: 'accepted'
          });
        } catch (e) {}
      }
    } catch (e) {
      // Opportunity model might not exist yet
    }
    
    // For agencies, count talent roster and placements
    if (user?.userType === 'agency') {
      // This would depend on how you structure agency-talent relationships
      // For now, using connections as a proxy
      talentRosterSize = connectionsCount;
      activePlacements = bookingsCount;
      clientRelationships = Math.floor(connectionsCount * 0.6); // Estimate
    }
    
    return {
      portfolioPhotos,
      applications: applicationsCount,
      bookings: bookingsCount,
      connections: connectionsCount,
      activeCampaigns,
      talentCollaborations,
      talentRosterSize,
      activePlacements,
      clientRelationships
    };
    
  } catch (error) {
    console.error('Error getting real-time data:', error);
    return {
      portfolioPhotos: 0,
      applications: 0,
      bookings: 0,
      connections: 0,
      activeCampaigns: 0,
      talentCollaborations: 0,
      talentRosterSize: 0,
      activePlacements: 0,
      clientRelationships: 0
    };
  }
}

// Helper function to hash IP addresses for privacy
function hashIP(ip) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

// Cron job endpoint to reset monthly counters (should be called by a scheduler)
router.post('/reset-monthly', async (req, res) => {
  try {
    // This should be secured and only called by internal systems
    await Analytics.resetMonthlyCounters();
    
    res.json({
      success: true,
      message: 'Monthly counters reset successfully'
    });
    
  } catch (error) {
    console.error('Error resetting monthly counters:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting monthly counters'
    });
  }
});

module.exports = router; 