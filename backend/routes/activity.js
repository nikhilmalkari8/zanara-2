const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const ActivityService = require('../services/activityService');
const auth = require('../middleware/auth');

// Get user's activity feed
router.get('/feed', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type = null
    } = req.query;
    
    const activities = await ActivityService.getUserFeed(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      type: type
    });
    
    res.json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: activities.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity feed',
      error: error.message
    });
  }
});

// Get specific activity details
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('actor', 'firstName lastName userType')
      .populate('relatedObjects.opportunity', 'title type compensation.type location.city')
      .populate('relatedObjects.company', 'companyName industry')
      .populate('relatedObjects.user', 'firstName lastName userType')
      .populate('engagement.likes.user', 'firstName lastName')
      .populate('engagement.comments.user', 'firstName lastName');
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    // Increment view count
    activity.engagement.views += 1;
    await activity.save();
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity',
      error: error.message
    });
  }
});

// Like/unlike activity
router.post('/:id/like', auth, async (req, res) => {
  try {
    const activity = await ActivityService.likeActivity(req.params.id, req.user.id);
    
    res.json({
      success: true,
      data: {
        likeCount: activity.likeCount,
        isLiked: activity.isLikedBy(req.user.id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking activity',
      error: error.message
    });
  }
});

// Comment on activity
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { comment } = req.body;
    
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty'
      });
    }
    
    const activity = await ActivityService.commentOnActivity(
      req.params.id,
      req.user.id,
      comment.trim()
    );
    
    // Get the updated activity with populated comments
    const updatedActivity = await Activity.findById(req.params.id)
      .populate('engagement.comments.user', 'firstName lastName')
      .select('engagement.comments');
    
    res.json({
      success: true,
      data: {
        comments: updatedActivity.engagement.comments,
        commentCount: updatedActivity.engagement.comments.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error commenting on activity',
      error: error.message
    });
  }
});

// Get activity engagement details
router.get('/:id/engagement', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('engagement.likes.user', 'firstName lastName userType')
      .populate('engagement.comments.user', 'firstName lastName userType')
      .select('engagement');
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        likes: activity.engagement.likes,
        comments: activity.engagement.comments,
        views: activity.engagement.views,
        shares: activity.engagement.shares
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching engagement details',
      error: error.message
    });
  }
});

// Get trending activities
router.get('/trending/activities', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get activities from last 7 days with high engagement
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trendingActivities = await Activity.find({
      createdAt: { $gte: sevenDaysAgo },
      visibility: 'public'
    })
    .populate('actor', 'firstName lastName userType')
    .populate('relatedObjects.opportunity', 'title type')
    .populate('relatedObjects.company', 'companyName')
    .sort({
      'engagement.likes': -1,
      'engagement.comments': -1,
      'engagement.views': -1
    })
    .limit(parseInt(limit))
    .lean();
    
    res.json({
      success: true,
      data: trendingActivities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trending activities',
      error: error.message
    });
  }
});

// Create manual activity (for testing or manual posts)
router.post('/create', auth, async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      visibility = 'connections',
      metadata = {}
    } = req.body;
    
    const activityData = {
      actor: req.user.id,
      type,
      title,
      description,
      metadata,
      visibility
    };
    
    const activity = await Activity.createActivity(activityData);
    
    const populatedActivity = await Activity.findById(activity._id)
      .populate('actor', 'firstName lastName userType');
    
    res.status(201).json({
      success: true,
      data: populatedActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating activity',
      error: error.message
    });
  }
});

module.exports = router;