const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const smartFeedService = require('../services/smartFeedService');

/**
 * @route   GET /api/smart-feed
 * @desc    Get personalized feed for authenticated user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      algorithm = null,
      includeAnalytics = false
    } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      algorithmVersion: algorithm,
      includeAnalytics: includeAnalytics === 'true'
    };

    const feed = await smartFeedService.getPersonalizedFeed(req.userId, options);

    res.json({
      success: true,
      data: feed.activities,
      metadata: feed.metadata
    });

  } catch (error) {
    console.error('Smart feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating personalized feed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/smart-feed/interaction
 * @desc    Record user interaction with content for learning
 * @access  Private
 */
router.post('/interaction', auth, async (req, res) => {
  try {
    const {
      activityId,
      interactionType,
      timeSpent,
      scrollDepth,
      clickPosition
    } = req.body;

    if (!activityId || !interactionType) {
      return res.status(400).json({
        success: false,
        message: 'Activity ID and interaction type are required'
      });
    }

    const validInteractionTypes = ['view', 'like', 'comment', 'share', 'click', 'scroll'];
    if (!validInteractionTypes.includes(interactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interaction type'
      });
    }

    const interactionData = {
      timeSpent,
      scrollDepth,
      clickPosition
    };

    await smartFeedService.recordInteraction(
      req.userId,
      activityId,
      interactionType,
      interactionData
    );

    res.json({
      success: true,
      message: 'Interaction recorded successfully'
    });

  } catch (error) {
    console.error('Interaction recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording interaction',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/smart-feed/analytics
 * @desc    Get feed analytics (admin only)
 * @access  Private
 */
router.get('/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin (you may want to add admin middleware)
    const user = req.user;
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { timeframe = '7d' } = req.query;
    const analytics = await smartFeedService.getFeedAnalytics(timeframe);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/smart-feed/algorithm-version
 * @desc    Get user's assigned algorithm version
 * @access  Private
 */
router.get('/algorithm-version', auth, async (req, res) => {
  try {
    const algorithmVersion = await smartFeedService.getAlgorithmVersionForUser(req.userId);

    res.json({
      success: true,
      data: {
        algorithmVersion,
        userId: req.userId
      }
    });

  } catch (error) {
    console.error('Algorithm version error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving algorithm version',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/smart-feed/feedback
 * @desc    Submit user feedback on feed quality
 * @access  Private
 */
router.post('/feedback', auth, async (req, res) => {
  try {
    const {
      rating,
      feedback,
      feedContext
    } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Store feedback for algorithm improvement
    const feedbackData = {
      userId: req.userId,
      rating,
      feedback,
      feedContext,
      timestamp: new Date()
    };

    // You could store this in a FeedbackModel
    console.log('📝 User feedback received:', feedbackData);

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/smart-feed/connection-strength/:userId
 * @desc    Get connection strength with another user
 * @access  Private
 */
router.get('/connection-strength/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const ConnectionStrength = require('../models/ConnectionStrength');

    const connection = await ConnectionStrength.findOne({
      $or: [
        { user1: req.userId, user2: userId },
        { user1: userId, user2: req.userId }
      ]
    });

    if (!connection) {
      return res.json({
        success: true,
        data: {
          strength: 0,
          details: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        strength: connection.overallStrength,
        details: {
          messageFrequency: connection.messageFrequencyScore,
          profileVisits: connection.profileVisitScore,
          contentInteraction: connection.contentInteractionScore,
          mutualConnections: connection.mutualConnectionScore,
          collaboration: connection.collaborationScore,
          industryAlignment: connection.industryAlignmentScore,
          trend: connection.trends.strengthTrend
        }
      }
    });

  } catch (error) {
    console.error('Connection strength error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving connection strength',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/smart-feed/relevance/:activityId
 * @desc    Get content relevance score for specific activity
 * @access  Private
 */
router.get('/relevance/:activityId', auth, async (req, res) => {
  try {
    const { activityId } = req.params;
    const ContentRelevance = require('../models/ContentRelevance');

    const relevance = await ContentRelevance.findOne({
      userId: req.userId,
      activityId
    });

    if (!relevance) {
      return res.json({
        success: true,
        data: {
          relevanceScore: 50,
          details: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        relevanceScore: relevance.relevanceScore,
        details: {
          industryRelevance: relevance.industryRelevanceScore,
          connectionStrength: relevance.connectionStrengthScore,
          engagementPrediction: relevance.engagementPredictionScore,
          contentTypePreference: relevance.contentTypePreferenceScore,
          timeDecay: relevance.timeDecayScore,
          trending: relevance.trendingScore,
          algorithmVersion: relevance.algorithmVersion,
          confidence: relevance.predictionConfidence
        }
      }
    });

  } catch (error) {
    console.error('Relevance score error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving relevance score',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/smart-feed/batch-interactions
 * @desc    Record multiple interactions in batch for performance
 * @access  Private
 */
router.post('/batch-interactions', auth, async (req, res) => {
  try {
    const { interactions } = req.body;

    if (!Array.isArray(interactions)) {
      return res.status(400).json({
        success: false,
        message: 'Interactions must be an array'
      });
    }

    const results = [];
    for (const interaction of interactions) {
      try {
        await smartFeedService.recordInteraction(
          req.userId,
          interaction.activityId,
          interaction.type,
          interaction.data || {}
        );
        results.push({ activityId: interaction.activityId, success: true });
      } catch (error) {
        results.push({ 
          activityId: interaction.activityId, 
          success: false, 
          error: error.message 
        });
      }
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Batch interactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing batch interactions',
      error: error.message
    });
  }
});

module.exports = router; 