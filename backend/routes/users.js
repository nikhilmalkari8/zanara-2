// backend/routes/users.js
const express = require('express');
const User = require('../models/User');
const ModelProfile = require('../models/ModelProfile');
const Company = require('../models/Company');
const Connection = require('../models/Connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Search users for connections
router.get('/search', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20, userType } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Build search query
    const searchRegex = new RegExp(q.trim(), 'i');
    let userQuery = {
      _id: { $ne: req.userId }, // Exclude current user
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ]
    };

    // Filter by user type if specified
    if (userType && ['model', 'hiring'].includes(userType)) {
      userQuery.userType = userType;
    }

    // Find users
    const users = await User.find(userQuery)
      .select('firstName lastName email userType')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ firstName: 1 });

    // Get current user's connections to exclude already connected users
    const connections = await Connection.find({
      $or: [
        { requester: req.userId, status: { $in: ['pending', 'accepted'] } },
        { recipient: req.userId, status: { $in: ['pending', 'accepted'] } }
      ]
    }).select('requester recipient');

    const connectedUserIds = new Set();
    connections.forEach(conn => {
      connectedUserIds.add(conn.requester.toString());
      connectedUserIds.add(conn.recipient.toString());
    });

    // Filter out already connected users
    const availableUsers = users.filter(user => 
      !connectedUserIds.has(user._id.toString())
    );

    // Enhance user data with additional info
    const enhancedUsers = await Promise.all(
      availableUsers.map(async (user) => {
        let additionalInfo = {};
        
        if (user.userType === 'model') {
          const profile = await ModelProfile.findOne({ userId: user._id })
            .select('experience specializations preferredLocations');
          if (profile) {
            additionalInfo = {
              experience: profile.experience?.slice(0, 100) + '...',
              specializations: profile.specializations?.slice(0, 3),
              location: profile.preferredLocations?.[0]
            };
          }
        } else if (user.userType === 'hiring') {
          const company = await Company.findOne({ 
            $or: [{ owner: user._id }, { admins: user._id }]
          }).select('companyName industry address.city address.country');
          if (company) {
            additionalInfo = {
              companyName: company.companyName,
              industry: company.industry,
              location: `${company.address?.city}, ${company.address?.country}`
            };
          }
        }

        return {
          ...user.toObject(),
          ...additionalInfo
        };
      })
    );

    const total = await User.countDocuments(userQuery);

    res.json({
      users: enhancedUsers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total: enhancedUsers.length
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      message: 'Server error during user search'
    });
  }
});

// Get user profile by ID (for viewing other users)
router.get('/:userId/profile', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.userId) {
      return res.status(400).json({
        message: 'Use /me endpoint for your own profile'
      });
    }

    const user = await User.findById(userId)
      .select('firstName lastName email userType createdAt');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    let profileData = { user };

    if (user.userType === 'model') {
      const modelProfile = await ModelProfile.findOne({ userId })
        .select('-photos -videos'); // Exclude sensitive media for privacy
      profileData.modelProfile = modelProfile;
    } else if (user.userType === 'hiring') {
      const company = await Company.findOne({
        $or: [{ owner: userId }, { admins: userId }]
      }).select('-verificationDocuments -team.permissions');
      profileData.company = company;
    }

    // Check connection status
    const connectionStatus = await Connection.getConnectionStatus(req.userId, userId);
    profileData.connectionStatus = connectionStatus;

    // Get mutual connections
    const mutualConnections = await Connection.getMutualConnections(req.userId, userId);
    profileData.mutualConnections = mutualConnections;

    res.json(profileData);

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Server error fetching user profile'
    });
  }
});

// Get mutual connections with another user
router.get('/:userId/mutual-connections', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.userId) {
      return res.status(400).json({
        message: 'Cannot get mutual connections with yourself'
      });
    }

    const mutualConnections = await Connection.getMutualConnections(req.userId, userId);

    res.json({
      mutualConnections,
      count: mutualConnections.length
    });

  } catch (error) {
    console.error('Get mutual connections error:', error);
    res.status(500).json({
      message: 'Server error fetching mutual connections'
    });
  }
});

// Get possible introducers for a specific user
router.get('/:userId/possible-introducers', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.userId) {
      return res.status(400).json({
        message: 'Cannot request introduction to yourself'
      });
    }

    // Check if already connected
    const alreadyConnected = await Connection.areConnected(req.userId, userId);
    if (alreadyConnected) {
      return res.status(400).json({
        message: 'You are already connected to this user'
      });
    }

    // Get mutual connections who can make introductions
    const mutualConnections = await Connection.getMutualConnections(req.userId, userId);

    // Filter out users who have recent introduction requests
    const IntroductionRequest = require('../models/IntroductionRequest');
    const recentRequests = await IntroductionRequest.find({
      requester: req.userId,
      target: userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).select('introducer');

    const recentIntroducerIds = recentRequests.map(req => req.introducer.toString());

    const availableIntroducers = mutualConnections.filter(
      connection => !recentIntroducerIds.includes(connection._id.toString())
    );

    res.json({
      possibleIntroducers: availableIntroducers,
      count: availableIntroducers.length
    });

  } catch (error) {
    console.error('Get possible introducers error:', error);
    res.status(500).json({
      message: 'Server error fetching possible introducers'
    });
  }
});

module.exports = router;