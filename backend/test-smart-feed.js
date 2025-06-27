// backend/test-smart-feed.js
// Test script for Smart Feed Algorithm

const mongoose = require('mongoose');
require('dotenv').config();

const smartFeedService = require('./services/smartFeedService');
const User = require('./models/User');
const Activity = require('./models/Activity');
const ConnectionStrength = require('./models/ConnectionStrength');
const ContentRelevance = require('./models/ContentRelevance');

async function testSmartFeed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const testUser = await User.findOne({ email: { $exists: true } });
    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }

    console.log(`🧪 Testing Smart Feed for user: ${testUser.name} (${testUser.email})`);

    // Test algorithm version assignment
    const algorithmVersion = await smartFeedService.getAlgorithmVersionForUser(testUser._id);
    console.log(`🔬 Algorithm Version: ${algorithmVersion}`);

    // Test personalized feed generation
    console.log('\n🧠 Generating personalized feed...');
    const startTime = Date.now();
    
    const feed = await smartFeedService.getPersonalizedFeed(testUser._id, {
      limit: 5,
      includeAnalytics: true
    });

    const endTime = Date.now();
    
    console.log(`⚡ Feed generated in ${endTime - startTime}ms`);
    console.log(`📊 Metadata:`, feed.metadata);
    console.log(`📝 Activities returned: ${feed.activities.length}`);

    // Display activities with relevance scores
    feed.activities.forEach((activity, index) => {
      console.log(`\n${index + 1}. Activity by ${activity.author?.name || 'Unknown'}`);
      console.log(`   Content: ${activity.content?.substring(0, 100)}...`);
      console.log(`   Relevance Score: ${activity.relevanceScore || 'N/A'}`);
      console.log(`   Algorithm Version: ${activity.relevanceDetails?.algorithmVersion || 'N/A'}`);
      
      if (activity.scoringFactors) {
        console.log(`   Scoring Factors:`);
        console.log(`     - Content Type: ${activity.scoringFactors.contentType}`);
        console.log(`     - Content Age: ${activity.scoringFactors.contentAge?.toFixed(1)}h`);
        console.log(`     - Has Media: ${activity.scoringFactors.hasMedia}`);
      }
    });

    // Test interaction recording
    if (feed.activities.length > 0) {
      const testActivity = feed.activities[0];
      console.log(`\n📝 Testing interaction recording for activity: ${testActivity._id}`);
      
      await smartFeedService.recordInteraction(
        testUser._id,
        testActivity._id,
        'view',
        { timeSpent: 30, scrollDepth: 500 }
      );
      
      console.log('✅ Interaction recorded successfully');
    }

    // Test connection strength (if connections exist)
    const connectionStrengths = await ConnectionStrength.find({
      $or: [
        { user1: testUser._id },
        { user2: testUser._id }
      ]
    }).limit(3);

    if (connectionStrengths.length > 0) {
      console.log(`\n🔗 Connection Strengths (${connectionStrengths.length} found):`);
      connectionStrengths.forEach((conn, index) => {
        console.log(`${index + 1}. Overall Strength: ${conn.overallStrength}`);
        console.log(`   - Message Frequency: ${conn.messageFrequencyScore}`);
        console.log(`   - Profile Visits: ${conn.profileVisitScore}`);
        console.log(`   - Content Interaction: ${conn.contentInteractionScore}`);
        console.log(`   - Trend: ${conn.trends.strengthTrend}`);
      });
    } else {
      console.log('\n🔗 No connection strengths found');
    }

    // Test content relevance scores
    const relevanceScores = await ContentRelevance.find({
      userId: testUser._id
    }).limit(3);

    if (relevanceScores.length > 0) {
      console.log(`\n🎯 Content Relevance Scores (${relevanceScores.length} found):`);
      relevanceScores.forEach((rel, index) => {
        console.log(`${index + 1}. Relevance Score: ${rel.relevanceScore}`);
        console.log(`   - Industry Relevance: ${rel.industryRelevanceScore}`);
        console.log(`   - Connection Strength: ${rel.connectionStrengthScore}`);
        console.log(`   - Engagement Prediction: ${rel.engagementPredictionScore}`);
        console.log(`   - Algorithm Version: ${rel.algorithmVersion}`);
      });
    } else {
      console.log('\n🎯 No content relevance scores found');
    }

    // Test analytics
    console.log('\n📊 Testing analytics...');
    const analytics = await smartFeedService.getFeedAnalytics('7d');
    console.log('Analytics:', analytics);

    console.log('\n✅ Smart Feed testing completed successfully!');

  } catch (error) {
    console.error('❌ Error testing Smart Feed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the test
if (require.main === module) {
  testSmartFeed();
}

module.exports = { testSmartFeed }; 