const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Hashtag = require('../models/Hashtag');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/activity-media/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, videos, and documents are allowed'));
    }
  }
});

// Get user's activity feed with enhanced filtering
router.get('/feed', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type = 'all',
      hashtag,
      user: filterUserId 
    } = req.query;
    
    const userId = req.user.id;
    
    // Get user's connections for feed filtering
    const connections = await Connection.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });
    
    const connectionIds = connections.map(conn => 
      conn.requester.toString() === userId ? conn.recipient : conn.requester
    );
    
    // Get user's followed hashtags (from their activity)
    const userActivities = await Activity.find({ 
      actor: userId,
      'content.hashtags': { $exists: true, $ne: [] }
    }).limit(50);
    
    const followedHashtags = [...new Set(
      userActivities.flatMap(activity => activity.content.hashtags || [])
    )];
    
    // Build enhanced query
    let query = {
      isDraft: false,
      $or: [
        { visibility: 'public' },
        {
          visibility: 'connections',
          $or: [
            { actor: userId },
            { actor: { $in: connectionIds } }
          ]
        },
        // Include posts with hashtags user follows
        {
          visibility: 'public',
          'content.hashtags': { $in: followedHashtags }
        },
        // Include posts where user is mentioned
        {
          'content.mentions.user': userId
        }
      ]
    };
    
    // Apply filters
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (hashtag) {
      query['content.hashtags'] = hashtag;
    }
    
    if (filterUserId) {
      query.actor = filterUserId;
    }
    
    const activities = await Activity.find(query)
      .populate('actor', 'firstName lastName userType profilePicture headline')
      .populate('relatedObjects.opportunity', 'title type location compensation')
      .populate('relatedObjects.company', 'companyName industry')
      .populate('relatedObjects.content', 'title category excerpt coverImage')
      .populate('content.mentions.user', 'firstName lastName userType profilePicture')
      .populate('engagement.reactions.user', 'firstName lastName profilePicture')
      .populate('engagement.comments.user', 'firstName lastName profilePicture')
      .populate('engagement.shares.user', 'firstName lastName profilePicture')
      .populate('originalPost', 'title content actor')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count for pagination
    const totalCount = await Activity.countDocuments(query);
    
    res.json({
      activities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Feed fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
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
    const activity = await ActivityService.likeActivity(req.params.id, req.userId);
    
    res.json({
      success: true,
      data: {
        likeCount: activity.likeCount,
        isLiked: activity.isLikedBy(req.userId)
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
      req.userId,
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

// Create new activity/post with rich content
router.post('/create', auth, upload.array('media', 10), async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      content,
      type = 'content_published',
      visibility = 'public',
      hashtags = [],
      mentions = [],
      scheduledFor,
      isDraft = false,
      poll
    } = req.body;
    
    // Process uploaded media
    const mediaFiles = req.files ? req.files.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 
            file.mimetype.startsWith('video/') ? 'video' : 'document',
      url: `/uploads/activity-media/${file.filename}`,
      caption: '',
      alt: file.originalname
    })) : [];
    
    // Process hashtags
    const processedHashtags = [];
    if (hashtags && hashtags.length > 0) {
      for (let hashtag of hashtags) {
        const hashtagObj = await Hashtag.createOrUpdate(hashtag, userId, 'general');
        processedHashtags.push(hashtagObj.tag);
      }
    }
    
    // Process mentions
    const processedMentions = [];
    if (mentions && mentions.length > 0) {
      for (let mentionId of mentions) {
        const mentionedUser = await User.findById(mentionId);
        if (mentionedUser) {
          processedMentions.push({
            user: mentionId,
            username: `${mentionedUser.firstName}${mentionedUser.lastName}`.toLowerCase(),
            displayName: mentionedUser.fullName
          });
          
          // Create notification for mentioned user
          await Notification.create({
            recipient: mentionId,
            sender: userId,
            type: 'mention',
            title: 'You were mentioned in a post',
            message: `${req.user.firstName} ${req.user.lastName} mentioned you in their post`,
            relatedActivity: null // Will be set after activity creation
          });
        }
      }
    }
    
    // Process poll if provided
    let processedPoll = null;
    if (poll && poll.question) {
      processedPoll = {
        question: poll.question,
        options: poll.options.map(option => ({
          text: option,
          votes: []
        })),
        allowMultiple: poll.allowMultiple || false,
        endDate: poll.endDate ? new Date(poll.endDate) : null
      };
    }
    
    // Create activity
    const activityData = {
      actor: userId,
      type,
      title,
      description,
      content: {
        text: content,
        hashtags: processedHashtags,
        mentions: processedMentions,
        media: mediaFiles,
        poll: processedPoll
      },
      visibility,
      isDraft,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null
    };
    
    const activity = await Activity.createActivity(activityData);
    
    // Update notification with activity ID
    if (processedMentions.length > 0) {
      await Notification.updateMany(
        { 
          sender: userId,
          type: 'mention',
          relatedActivity: null
        },
        { relatedActivity: activity._id }
      );
    }
    
    // Populate the created activity for response
    const populatedActivity = await Activity.findById(activity._id)
      .populate('actor', 'firstName lastName userType profilePicture headline')
      .populate('content.mentions.user', 'firstName lastName userType profilePicture');
    
    res.status(201).json(populatedActivity);
  } catch (error) {
    console.error('Activity creation error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// POST /api/activity/:id/react - Add or update reaction with multiple types
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { reactionType = 'like' } = req.body;
    const activityId = req.params.id;
    const userId = req.userId;

    // Validate reaction type
    const validReactions = ['like', 'love', 'celebrate', 'support', 'insightful', 'funny'];
    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user already reacted
    const existingReactionIndex = activity.engagement.reactions.findIndex(
      reaction => reaction.user.toString() === userId
    );

    if (existingReactionIndex !== -1) {
      // Update existing reaction
      const oldReactionType = activity.engagement.reactions[existingReactionIndex].type;
      activity.engagement.reactions[existingReactionIndex].type = reactionType;
      activity.engagement.reactions[existingReactionIndex].reactedAt = new Date();
      
      await activity.save();

      // Create notification for reaction change if different type
      if (oldReactionType !== reactionType && activity.actor.toString() !== userId) {
        const Notification = require('../models/Notification');
        await Notification.createOrBatchNotification({
          recipient: activity.actor,
          sender: userId,
          type: 'activity_reaction',
          title: `New ${reactionType} reaction`,
          message: `reacted ${reactionType} to your post`,
          relatedActivity: activityId,
          batchType: 'reactions'
        });
      }

      return res.json({
        success: true,
        message: `Reaction updated to ${reactionType}`,
        reactionType,
        reactionCounts: activity.getReactionCounts()
      });
    } else {
      // Add new reaction
      activity.engagement.reactions.push({
        user: userId,
        type: reactionType,
        reactedAt: new Date()
      });

      await activity.save();

      // Create batched notification for new reaction
      if (activity.actor.toString() !== userId) {
        const Notification = require('../models/Notification');
        await Notification.createOrBatchNotification({
          recipient: activity.actor,
          sender: userId,
          type: 'activity_reaction',
          title: `New ${reactionType} reaction`,
          message: `reacted ${reactionType} to your post`,
          relatedActivity: activityId,
          batchType: 'reactions'
        });
      }

      return res.json({
        success: true,
        message: `${reactionType} reaction added`,
        reactionType,
        reactionCounts: activity.getReactionCounts()
      });
    }
  } catch (error) {
    console.error('React to activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reacting to activity',
      error: error.message
    });
  }
});

// DELETE /api/activity/:id/react - Remove reaction
router.delete('/:id/react', auth, async (req, res) => {
  try {
    const activityId = req.params.id;
    const userId = req.userId;

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Remove user's reaction
    const reactionIndex = activity.engagement.reactions.findIndex(
      reaction => reaction.user.toString() === userId
    );

    if (reactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reaction not found'
      });
    }

    activity.engagement.reactions.splice(reactionIndex, 1);
    await activity.save();

    res.json({
      success: true,
      message: 'Reaction removed',
      reactionCounts: activity.getReactionCounts()
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing reaction',
      error: error.message
    });
  }
});

// POST /api/activity/:id/share - Share activity with commentary
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { commentary = '', visibility = 'connections' } = req.body;
    const originalActivityId = req.params.id;
    const userId = req.userId;

    // Get original activity
    const originalActivity = await Activity.findById(originalActivityId)
      .populate('actor', 'firstName lastName userType profilePicture');
    
    if (!originalActivity) {
      return res.status(404).json({
        success: false,
        message: 'Original activity not found'
      });
    }

    // Check if user can share this activity
    if (originalActivity.visibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Cannot share private activity'
      });
    }

    // Create share activity
    const shareActivity = await Activity.create({
      actor: userId,
      type: 'share',
      title: commentary ? `Shared with commentary` : 'Shared a post',
      description: commentary || `Shared ${originalActivity.actor.firstName}'s post`,
      content: {
        text: commentary,
        media: [],
        hashtags: extractHashtags(commentary),
        mentions: await extractMentions(commentary)
      },
      originalPost: originalActivityId,
      visibility,
      engagement: {
        views: 0,
        reactions: [],
        comments: [],
        shares: []
      }
    });

    // Add share to original activity
    originalActivity.engagement.shares.push({
      user: userId,
      commentary,
      sharedAt: new Date(),
      visibility
    });
    await originalActivity.save();

    // Create notification for original poster
    if (originalActivity.actor._id.toString() !== userId) {
      const Notification = require('../models/Notification');
      await Notification.createOrBatchNotification({
        recipient: originalActivity.actor._id,
        sender: userId,
        type: 'activity_share',
        title: 'Post shared',
        message: commentary ? 'shared your post with commentary' : 'shared your post',
        relatedActivity: originalActivityId,
        batchType: 'shares'
      });
    }

    // Populate the created share activity
    const populatedShare = await Activity.findById(shareActivity._id)
      .populate('actor', 'firstName lastName userType profilePicture')
      .populate('originalPost')
      .populate({
        path: 'originalPost',
        populate: {
          path: 'actor',
          select: 'firstName lastName userType profilePicture'
        }
      });

    res.status(201).json({
      success: true,
      message: 'Activity shared successfully',
      activity: populatedShare
    });
  } catch (error) {
    console.error('Share activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing activity',
      error: error.message
    });
  }
});

// GET /api/activity/:id/reactions - Get detailed reaction information
router.get('/:id/reactions', auth, async (req, res) => {
  try {
    const activityId = req.params.id;
    const { type } = req.query; // Filter by reaction type

    const activity = await Activity.findById(activityId)
      .populate('engagement.reactions.user', 'firstName lastName userType profilePicture');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    let reactions = activity.engagement.reactions;

    // Filter by reaction type if specified
    if (type && type !== 'all') {
      reactions = reactions.filter(reaction => reaction.type === type);
    }

    // Group reactions by type for summary
    const reactionSummary = activity.getReactionCounts();
    const totalReactions = Object.values(reactionSummary).reduce((sum, count) => sum + count, 0);

    res.json({
      success: true,
      reactions: reactions.map(reaction => ({
        user: reaction.user,
        type: reaction.type,
        reactedAt: reaction.reactedAt
      })),
      summary: reactionSummary,
      totalCount: totalReactions
    });
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reactions',
      error: error.message
    });
  }
});

// GET /api/activity/trending/hashtags - Get trending hashtags
router.get('/trending/hashtags', auth, async (req, res) => {
  try {
    const { limit = 10, period = '7d' } = req.query;
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '24h':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
        break;
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    }

    // Get trending hashtags from activities
    const trendingHashtags = await Activity.aggregate([
      {
        $match: {
          ...dateFilter,
          isDraft: false,
          'content.hashtags': { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$content.hashtags'
      },
      {
        $group: {
          _id: '$content.hashtags',
          count: { $sum: 1 },
          recentActivities: { $push: '$_id' },
          lastUsed: { $max: '$createdAt' }
        }
      },
      {
        $match: {
          count: { $gte: 2 } // Only hashtags used at least twice
        }
      },
      {
        $sort: { count: -1, lastUsed: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          hashtag: '$_id',
          count: 1,
          lastUsed: 1,
          trending: {
            $cond: {
              if: { $gte: ['$count', 5] },
              then: 'hot',
              else: 'rising'
            }
          }
        }
      }
    ]);

    // Get hashtag categories and related info
    const Hashtag = require('../models/Hashtag');
    const enrichedHashtags = await Promise.all(
      trendingHashtags.map(async (trending) => {
        const hashtagDoc = await Hashtag.findOne({ name: trending.hashtag });
        return {
          ...trending,
          category: hashtagDoc?.category || 'general',
          description: hashtagDoc?.description || '',
          isOfficial: hashtagDoc?.isOfficial || false
        };
      })
    );

    res.json({
      success: true,
      trendingHashtags: enrichedHashtags,
      period,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending hashtags',
      error: error.message
    });
  }
});

// GET /api/activity/analytics/engagement - Get engagement analytics
router.get('/analytics/engagement', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const userId = req.userId;
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
    }

    // Get user's activities and their engagement
    const activities = await Activity.find({
      actor: userId,
      isDraft: false,
      ...dateFilter
    });

    let totalReactions = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalViews = 0;
    let reactionsByType = {
      like: 0,
      love: 0,
      celebrate: 0,
      support: 0,
      insightful: 0,
      funny: 0
    };

    activities.forEach(activity => {
      totalReactions += activity.engagement.reactions.length;
      totalComments += activity.engagement.comments.length;
      totalShares += activity.engagement.shares.length;
      totalViews += activity.engagement.views;

      // Count reactions by type
      activity.engagement.reactions.forEach(reaction => {
        reactionsByType[reaction.type]++;
      });
    });

    const totalEngagement = totalReactions + totalComments + totalShares;
    const avgEngagementPerPost = activities.length > 0 ? totalEngagement / activities.length : 0;

    res.json({
      success: true,
      analytics: {
        totalPosts: activities.length,
        totalEngagement,
        avgEngagementPerPost: Math.round(avgEngagementPerPost * 100) / 100,
        breakdown: {
          reactions: totalReactions,
          comments: totalComments,
          shares: totalShares,
          views: totalViews
        },
        reactionsByType,
        period,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get engagement analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching engagement analytics',
      error: error.message
    });
  }
});

module.exports = router;