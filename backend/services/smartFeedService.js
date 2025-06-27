const Activity = require('../models/Activity');
const User = require('../models/User');
const ConnectionStrength = require('../models/ConnectionStrength');
const ContentRelevance = require('../models/ContentRelevance');

class SmartFeedService {
  constructor() {
    this.algorithmVersions = {
      'v1.0': this.algorithmV1,
      'v1.1': this.algorithmV1_1,
      'v2.0': this.algorithmV2
    };
    
    // A/B testing configuration
    this.abTestConfig = {
      'v1.0': 40, // 40% of users
      'v1.1': 40, // 40% of users  
      'v2.0': 20  // 20% of users (experimental)
    };
  }

  /**
   * Get personalized feed for a user
   */
  async getPersonalizedFeed(userId, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        algorithmVersion = null,
        includeAnalytics = false
      } = options;

      // Determine algorithm version (A/B testing)
      const version = algorithmVersion || await this.getAlgorithmVersionForUser(userId);
      
      console.log(`🧠 Smart Feed: Using algorithm ${version} for user ${userId}`);

      // Get user profile and preferences
      const userProfile = await this.getUserProfileWithPreferences(userId);
      
      // Get candidate activities (recent activities from network)
      const candidateActivities = await this.getCandidateActivities(userId, {
        limit: limit * 5, // Get more candidates for better ranking
        lookbackDays: 7
      });

      if (candidateActivities.length === 0) {
        return {
          activities: [],
          metadata: {
            algorithmVersion: version,
            candidateCount: 0,
            processingTime: 0
          }
        };
      }

      const startTime = Date.now();

      // Calculate relevance scores for all candidates
      const scoredActivities = await this.scoreActivities(
        userId, 
        candidateActivities, 
        userProfile, 
        version
      );

      // Apply algorithm-specific ranking
      const algorithm = this.algorithmVersions[version];
      const rankedActivities = await algorithm.call(this, scoredActivities, userProfile);

      // Apply pagination
      const paginatedActivities = rankedActivities.slice(offset, offset + limit);

      // Track feed generation for analytics
      if (includeAnalytics) {
        await this.trackFeedGeneration(userId, version, {
          candidateCount: candidateActivities.length,
          finalCount: paginatedActivities.length,
          processingTime: Date.now() - startTime
        });
      }

      return {
        activities: paginatedActivities,
        metadata: {
          algorithmVersion: version,
          candidateCount: candidateActivities.length,
          processingTime: Date.now() - startTime,
          totalAvailable: rankedActivities.length
        }
      };

    } catch (error) {
      console.error('Smart Feed Error:', error);
      throw error;
    }
  }

  /**
   * Get algorithm version for user (A/B testing)
   */
  async getAlgorithmVersionForUser(userId) {
    // Use user ID hash to consistently assign algorithm version
    const userHash = this.hashUserId(userId);
    const percentage = userHash % 100;
    
    let cumulative = 0;
    for (const [version, weight] of Object.entries(this.abTestConfig)) {
      cumulative += weight;
      if (percentage < cumulative) {
        return version;
      }
    }
    
    return 'v1.0'; // Fallback
  }

  /**
   * Hash user ID for consistent A/B testing
   */
  hashUserId(userId) {
    let hash = 0;
    const str = userId.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get user profile with engagement preferences
   */
  async getUserProfileWithPreferences(userId) {
    const user = await User.findById(userId);
    
    // Calculate user engagement preferences from history
    const engagementHistory = await this.calculateUserEngagementHistory(userId);
    const contentPreferences = await this.calculateContentTypePreferences(userId);
    
    return {
      ...user.toObject(),
      engagementHistory,
      contentPreferences
    };
  }

  /**
   * Get candidate activities from user's network
   */
  async getCandidateActivities(userId, options = {}) {
    const { limit = 100, lookbackDays = 7 } = options;
    
    // Get user's connections
    const connections = await this.getUserConnections(userId);
    const connectionIds = connections.map(conn => conn._id);
    
    // Include user's own activities and their network's activities
    const authorIds = [userId, ...connectionIds];
    
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

    const activities = await Activity.find({
      author: { $in: authorIds },
      createdAt: { $gte: lookbackDate },
      // Exclude activities user has already interacted with recently
      _id: { $nin: await this.getRecentlyViewedActivities(userId) }
    })
    .populate('author', 'name professionalType profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

    return activities;
  }

  /**
   * Score activities for relevance to user
   */
  async scoreActivities(userId, activities, userProfile, algorithmVersion) {
    const scoringPromises = activities.map(async (activity) => {
      try {
        // Calculate or get existing relevance score
        const relevance = await ContentRelevance.calculateRelevanceForUser(
          userId, 
          activity._id, 
          {
            algorithmVersion,
            userEngagementHistory: userProfile.engagementHistory,
            userContentPreferences: userProfile.contentPreferences
          }
        );

        return {
          ...activity,
          relevanceScore: relevance.relevanceScore,
          relevanceDetails: relevance,
          scoringFactors: relevance.scoringFactors
        };
      } catch (error) {
        console.error(`Error scoring activity ${activity._id}:`, error);
        return {
          ...activity,
          relevanceScore: 50, // Default score
          relevanceDetails: null,
          scoringFactors: {}
        };
      }
    });

    return await Promise.all(scoringPromises);
  }

  /**
   * Algorithm V1.0 - Basic relevance ranking
   */
  async algorithmV1(scoredActivities, userProfile) {
    return scoredActivities.sort((a, b) => {
      // Primary sort by relevance score
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      
      // Secondary sort by recency
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  /**
   * Algorithm V1.1 - Enhanced with diversity and engagement velocity
   */
  async algorithmV1_1(scoredActivities, userProfile) {
    // Add diversity scoring to prevent filter bubbles
    const diversityScored = this.addDiversityScoring(scoredActivities);
    
    // Add engagement velocity scoring
    const velocityScored = await this.addEngagementVelocityScoring(diversityScored);
    
    return velocityScored.sort((a, b) => {
      // Composite score: relevance + diversity + velocity
      const scoreA = a.relevanceScore + (a.diversityBonus || 0) + (a.velocityBonus || 0);
      const scoreB = b.relevanceScore + (b.diversityBonus || 0) + (b.velocityBonus || 0);
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  /**
   * Algorithm V2.0 - Machine learning enhanced
   */
  async algorithmV2(scoredActivities, userProfile) {
    // Enhanced ML-based scoring (simplified for now)
    const mlScored = await this.addMLScoring(scoredActivities, userProfile);
    
    // Apply collaborative filtering
    const collaborativeScored = await this.addCollaborativeFiltering(mlScored, userProfile);
    
    return collaborativeScored.sort((a, b) => {
      const scoreA = (a.relevanceScore * 0.6) + (a.mlScore || 0) * 0.3 + (a.collaborativeScore || 0) * 0.1;
      const scoreB = (b.relevanceScore * 0.6) + (b.mlScore || 0) * 0.3 + (b.collaborativeScore || 0) * 0.1;
      
      return scoreB - scoreA;
    });
  }

  /**
   * Add diversity scoring to prevent filter bubbles
   */
  addDiversityScoring(activities) {
    const authorCounts = {};
    const contentTypeCounts = {};
    
    return activities.map((activity, index) => {
      const authorId = activity.author._id.toString();
      const contentType = activity.type;
      
      // Penalize repeated authors
      authorCounts[authorId] = (authorCounts[authorId] || 0) + 1;
      const authorPenalty = Math.max(0, (authorCounts[authorId] - 1) * 5);
      
      // Penalize repeated content types
      contentTypeCounts[contentType] = (contentTypeCounts[contentType] || 0) + 1;
      const typePenalty = Math.max(0, (contentTypeCounts[contentType] - 1) * 3);
      
      // Diversity bonus for varied content
      const diversityBonus = Math.max(0, 10 - authorPenalty - typePenalty);
      
      return {
        ...activity,
        diversityBonus
      };
    });
  }

  /**
   * Add engagement velocity scoring
   */
  async addEngagementVelocityScoring(activities) {
    return activities.map(activity => {
      const ageHours = (Date.now() - new Date(activity.createdAt).getTime()) / (1000 * 60 * 60);
      const totalEngagements = (activity.reactions?.length || 0) + (activity.comments?.length || 0);
      
      // Calculate engagement velocity (engagements per hour)
      const velocity = ageHours > 0 ? totalEngagements / ageHours : 0;
      
      // Convert to bonus points (max 15 points)
      const velocityBonus = Math.min(15, velocity * 3);
      
      return {
        ...activity,
        velocityBonus,
        engagementVelocity: velocity
      };
    });
  }

  /**
   * Add simplified ML scoring
   */
  async addMLScoring(activities, userProfile) {
    // Simplified ML scoring based on user patterns
    return activities.map(activity => {
      let mlScore = 50; // Base score
      
      // Time-of-day preference
      const activityHour = new Date(activity.createdAt).getHours();
      const userActiveHours = userProfile.engagementHistory?.preferredHours || [];
      if (userActiveHours.includes(activityHour)) {
        mlScore += 10;
      }
      
      // Content length preference
      const contentLength = activity.content?.length || 0;
      const userPreferredLength = userProfile.engagementHistory?.preferredContentLength || 500;
      const lengthDiff = Math.abs(contentLength - userPreferredLength);
      const lengthScore = Math.max(0, 10 - (lengthDiff / 100));
      mlScore += lengthScore;
      
      // Hashtag affinity
      const activityHashtags = activity.hashtags || [];
      const userPreferredHashtags = userProfile.engagementHistory?.preferredHashtags || [];
      const hashtagMatches = activityHashtags.filter(tag => userPreferredHashtags.includes(tag)).length;
      mlScore += hashtagMatches * 5;
      
      return {
        ...activity,
        mlScore: Math.min(100, mlScore)
      };
    });
  }

  /**
   * Add collaborative filtering
   */
  async addCollaborativeFiltering(activities, userProfile) {
    // Find similar users based on engagement patterns
    const similarUsers = await this.findSimilarUsers(userProfile._id);
    
    return activities.map(activity => {
      let collaborativeScore = 0;
      
      // Check if similar users engaged with this content
      const engagedSimilarUsers = activity.reactions?.filter(reaction => 
        similarUsers.includes(reaction.user.toString())
      ).length || 0;
      
      collaborativeScore = Math.min(20, engagedSimilarUsers * 5);
      
      return {
        ...activity,
        collaborativeScore
      };
    });
  }

  /**
   * Calculate user engagement history
   */
  async calculateUserEngagementHistory(userId) {
    // This would analyze user's historical interactions
    // For now, return mock data structure
    return {
      averageEngagementRate: 0.15,
      preferredContentTypes: {
        'post': 0.8,
        'photo': 0.9,
        'video': 0.6,
        'article': 0.4
      },
      preferredHours: [9, 10, 11, 14, 15, 16, 18, 19, 20],
      preferredContentLength: 300,
      preferredHashtags: ['fashion', 'modeling', 'photography']
    };
  }

  /**
   * Calculate content type preferences
   */
  async calculateContentTypePreferences(userId) {
    // Analyze user's interaction patterns with different content types
    return {
      'post': 0.7,
      'photo': 0.9,
      'video': 0.8,
      'article': 0.5,
      'poll': 0.6
    };
  }

  /**
   * Get user's connections
   */
  async getUserConnections(userId) {
    // This would get actual connections from Connection model
    // For now, return empty array
    return [];
  }

  /**
   * Get recently viewed activities to avoid repetition
   */
  async getRecentlyViewedActivities(userId) {
    const recentViews = await ContentRelevance.find({
      userId,
      'actualInteraction.viewed': true,
      'actualInteraction.viewedAt': {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    }).select('activityId');
    
    return recentViews.map(view => view.activityId);
  }

  /**
   * Find similar users for collaborative filtering
   */
  async findSimilarUsers(userId) {
    // This would implement user similarity based on engagement patterns
    // For now, return empty array
    return [];
  }

  /**
   * Track feed generation for analytics
   */
  async trackFeedGeneration(userId, algorithmVersion, metrics) {
    // This would track feed generation metrics for analysis
    console.log(`📊 Feed Analytics: User ${userId}, Algorithm ${algorithmVersion}`, metrics);
  }

  /**
   * Record user interaction for learning
   */
  async recordInteraction(userId, activityId, interactionType, data = {}) {
    try {
      // Update connection strength if applicable
      const activity = await Activity.findById(activityId).populate('author');
      if (activity && activity.author._id.toString() !== userId.toString()) {
        await ConnectionStrength.updateContentInteraction(
          userId, 
          activity.author._id, 
          interactionType
        );
      }

      // Update content relevance with actual interaction
      const relevance = await ContentRelevance.findOne({ userId, activityId });
      if (relevance) {
        await relevance.recordInteraction(interactionType, data);
      }

      console.log(`📝 Interaction recorded: ${userId} ${interactionType} ${activityId}`);
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }

  /**
   * Get feed analytics for admin dashboard
   */
  async getFeedAnalytics(timeframe = '7d') {
    // This would provide analytics on feed performance
    return {
      algorithmPerformance: {
        'v1.0': { engagementRate: 0.12, avgTimeSpent: 45 },
        'v1.1': { engagementRate: 0.15, avgTimeSpent: 52 },
        'v2.0': { engagementRate: 0.18, avgTimeSpent: 58 }
      },
      userDistribution: this.abTestConfig,
      topPerformingContent: []
    };
  }
}

module.exports = new SmartFeedService(); 