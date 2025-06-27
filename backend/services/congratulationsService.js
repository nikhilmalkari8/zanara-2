const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Connection = require('../models/Connection');

class CongratulationsService {
  constructor() {
    this.congratulationTemplates = {
      work_anniversary: [
        "Congratulations on your work anniversary! 🎉",
        "Happy work anniversary! Here's to many more successful years! 🥳",
        "Celebrating your dedication and hard work! Happy anniversary! 🎊"
      ],
      new_job: [
        "Congratulations on your new position! 🎉",
        "Wishing you success in your new role! 🚀",
        "Excited to see what you'll achieve in your new position! 💪"
      ],
      promotion: [
        "Congratulations on your promotion! Well deserved! 🎉",
        "Your hard work has paid off! Congrats on the promotion! 🌟",
        "So proud of your achievement! Congratulations! 🎊"
      ],
      achievement: [
        "Congratulations on this amazing achievement! 🏆",
        "Your success is truly inspiring! Well done! ⭐",
        "Celebrating your incredible accomplishment! 🎉"
      ],
      certification: [
        "Congratulations on earning your certification! 📜",
        "Your commitment to learning is admirable! Congrats! 🎓",
        "Well done on achieving this certification! 🏅"
      ],
      project_completion: [
        "Congratulations on completing your project! 🎯",
        "Amazing work on bringing this project to completion! 👏",
        "Your dedication to excellence shows! Congrats! ✨"
      ]
    };
  }

  /**
   * Check for congratulation opportunities and send automated messages
   */
  async checkAndSendCongratulations() {
    try {
      console.log('🎉 Running congratulations automation...');
      
      // Check for work anniversaries
      await this.checkWorkAnniversaries();
      
      // Check for new achievements
      await this.checkNewAchievements();
      
      // Check for profile updates that warrant congratulations
      await this.checkProfileMilestones();
      
      console.log('✅ Congratulations automation completed');
    } catch (error) {
      console.error('Error in congratulations automation:', error);
    }
  }

  /**
   * Check for work anniversaries and send congratulations
   */
  async checkWorkAnniversaries() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // Find users with work anniversaries today
    const users = await User.find({
      'workAnniversaries.startDate': {
        $exists: true
      }
    }).populate('workAnniversaries');

    for (const user of users) {
      for (const anniversary of user.workAnniversaries) {
        if (anniversary.startDate) {
          const anniversaryDate = new Date(anniversary.startDate);
          
          // Check if anniversary is today
          if (anniversaryDate.getMonth() === currentMonth && 
              anniversaryDate.getDate() === currentDay &&
              anniversaryDate.getFullYear() < today.getFullYear()) {
            
            const yearsOfService = today.getFullYear() - anniversaryDate.getFullYear();
            await this.sendCongratulationsToConnections(
              user._id,
              'work_anniversary',
              {
                company: anniversary.company,
                position: anniversary.position,
                years: yearsOfService
              }
            );
          }
        }
      }
    }
  }

  /**
   * Check for new achievements and send congratulations
   */
  async checkNewAchievements() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Find achievements added in the last 24 hours
    const users = await User.find({
      'achievements.achievedAt': {
        $gte: yesterday
      }
    });

    for (const user of users) {
      const recentAchievements = user.achievements.filter(
        achievement => achievement.achievedAt >= yesterday
      );

      for (const achievement of recentAchievements) {
        await this.sendCongratulationsToConnections(
          user._id,
          achievement.category === 'certification' ? 'certification' : 'achievement',
          {
            title: achievement.title,
            category: achievement.category,
            issuer: achievement.issuer
          }
        );
      }
    }
  }

  /**
   * Check for profile milestones
   */
  async checkProfileMilestones() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Find recent activities that warrant congratulations
    const activities = await Activity.find({
      type: { $in: ['job_change', 'promotion', 'project_completion'] },
      createdAt: { $gte: yesterday }
    }).populate('actor');

    for (const activity of activities) {
      await this.sendCongratulationsToConnections(
        activity.actor._id,
        activity.type,
        activity.metadata || {}
      );
    }
  }

  /**
   * Send congratulations to user's connections
   */
  async sendCongratulationsToConnections(userId, congratulationType, metadata = {}) {
    try {
      // Get user's connections
      const connections = await Connection.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      });

      const user = await User.findById(userId);
      if (!user) return;

      // Limit to top connections to avoid spam
      const topConnections = connections
        .filter(conn => conn.connectionStrength.score > 30) // Only strong connections
        .sort((a, b) => b.connectionStrength.score - a.connectionStrength.score)
        .slice(0, 10); // Top 10 connections

      for (const connection of topConnections) {
        const connectionUserId = connection.requester.toString() === userId.toString() 
          ? connection.recipient 
          : connection.requester;

        // Check if connection has congratulations enabled
        if (connection.preferences.allowCongratulations !== false) {
          await this.sendCongratulationNotification(
            connectionUserId,
            userId,
            congratulationType,
            metadata
          );
        }
      }
    } catch (error) {
      console.error('Error sending congratulations to connections:', error);
    }
  }

  /**
   * Send congratulation notification
   */
  async sendCongratulationNotification(recipientId, userId, type, metadata) {
    try {
      const templates = this.congratulationTemplates[type] || this.congratulationTemplates.achievement;
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      const user = await User.findById(userId);
      const title = `Congratulate ${user.firstName} ${user.lastName}`;
      
      let message = template;
      
      // Customize message based on type and metadata
      switch (type) {
        case 'work_anniversary':
          message = `${user.firstName} is celebrating ${metadata.years} year${metadata.years > 1 ? 's' : ''} at ${metadata.company}! ${template}`;
          break;
        case 'new_job':
          message = `${user.firstName} started a new position${metadata.position ? ` as ${metadata.position}` : ''}! ${template}`;
          break;
        case 'achievement':
          message = `${user.firstName} achieved: ${metadata.title}! ${template}`;
          break;
        case 'certification':
          message = `${user.firstName} earned a new certification: ${metadata.title}! ${template}`;
          break;
      }

      await Notification.create({
        recipient: recipientId,
        sender: userId,
        type: 'congratulation_suggestion',
        title,
        message,
        metadata: {
          congratulationType: type,
          suggestedAction: 'send_congratulation',
          ...metadata
        },
        priority: 'low'
      });

    } catch (error) {
      console.error('Error sending congratulation notification:', error);
    }
  }

  /**
   * Send congratulation message
   */
  async sendCongratulationMessage(senderId, recipientId, congratulationType, customMessage = null) {
    try {
      const templates = this.congratulationTemplates[congratulationType] || this.congratulationTemplates.achievement;
      const message = customMessage || templates[Math.floor(Math.random() * templates.length)];
      
      // Create message conversation
      const Message = require('../models/Message');
      const Conversation = require('../models/Conversation');
      
      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] }
      });
      
      if (!conversation) {
        conversation = new Conversation({
          participants: [senderId, recipientId],
          type: 'direct'
        });
        await conversation.save();
      }
      
      // Send congratulation message
      const congratulationMessage = new Message({
        conversationId: conversation._id,
        sender: senderId,
        recipient: recipientId,
        content: message,
        messageType: 'congratulation',
        metadata: {
          congratulationType,
          isAutomated: !customMessage
        }
      });
      
      await congratulationMessage.save();
      
      // Create notification
      const sender = await User.findById(senderId);
      await Notification.create({
        recipient: recipientId,
        sender: senderId,
        type: 'congratulation_received',
        title: 'Congratulations!',
        message: `${sender.firstName} ${sender.lastName} sent you congratulations`,
        relatedObjects: {
          message: congratulationMessage._id
        }
      });
      
      return congratulationMessage;
    } catch (error) {
      console.error('Error sending congratulation message:', error);
      throw error;
    }
  }

  /**
   * Get congratulation suggestions for a user
   */
  async getCongratulationSuggestions(userId) {
    try {
      // Get recent notifications for congratulation suggestions
      const suggestions = await Notification.find({
        recipient: userId,
        type: 'congratulation_suggestion',
        status: 'unread',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }).populate('sender', 'firstName lastName professionalType profilePicture')
        .sort({ createdAt: -1 })
        .limit(10);

      return suggestions;
    } catch (error) {
      console.error('Error getting congratulation suggestions:', error);
      return [];
    }
  }

  /**
   * Schedule congratulations automation (to be called by cron job)
   */
  scheduleAutomation() {
    // Run every day at 9 AM
    const cron = require('node-cron');
    
    cron.schedule('0 9 * * *', async () => {
      console.log('🕘 Running daily congratulations automation...');
      await this.checkAndSendCongratulations();
    });
    
    console.log('📅 Congratulations automation scheduled for 9 AM daily');
  }
}

module.exports = new CongratulationsService(); 