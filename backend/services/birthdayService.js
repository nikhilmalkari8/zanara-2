const User = require('../models/User');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const smartTimingService = require('./smartTimingService');
const moment = require('moment-timezone');

class BirthdayService {
  constructor() {
    this.birthdayTemplates = [
      "🎉 Happy Birthday! Wishing you an amazing year ahead!",
      "🎂 Hope your special day is filled with happiness and joy!",
      "🌟 Another year of awesome! Happy Birthday!",
      "🎈 Sending you warm birthday wishes and lots of love!",
      "🥳 May this new year of life bring you endless opportunities!",
      "🎁 Happy Birthday! Hope all your wishes come true!",
      "🌈 Celebrating you today! Have a wonderful birthday!",
      "✨ Another trip around the sun! Happy Birthday!",
      "🎊 Wishing you a day filled with love, laughter, and cake!",
      "🌺 Happy Birthday! May this year be your best one yet!"
    ];

    this.birthdayWishes = {
      professional: [
        "Wishing you continued success and happiness in the year ahead!",
        "May this new year bring exciting opportunities and achievements!",
        "Happy Birthday! Here's to another year of professional growth!",
        "Celebrating your special day and your inspiring work in fashion!",
        "May your creativity and talent shine even brighter this year!"
      ],
      personal: [
        "Hope your birthday is as amazing as you are!",
        "Sending you lots of love and birthday wishes!",
        "May your day be filled with all your favorite things!",
        "Wishing you joy, laughter, and wonderful memories!",
        "Hope this new year of life is absolutely fantastic!"
      ]
    };
  }

  /**
   * Check for birthdays today and send notifications
   */
  async checkDailyBirthdays() {
    try {
      console.log('🎂 Checking for birthdays today...');

      const today = new Date();
      const todayMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
      const todayDay = today.getDate();

      // Find users with birthdays today
      const birthdayUsers = await User.find({
        dateOfBirth: {
          $exists: true,
          $ne: null
        },
        $expr: {
          $and: [
            { $eq: [{ $month: '$dateOfBirth' }, todayMonth] },
            { $eq: [{ $dayOfMonth: '$dateOfBirth' }, todayDay] }
          ]
        }
      }).select('_id firstName lastName dateOfBirth birthdayPrivacy professionalType');

      console.log(`🎉 Found ${birthdayUsers.length} birthday(s) today!`);

      for (const birthdayUser of birthdayUsers) {
        await this.processBirthdayNotifications(birthdayUser);
        
        // Add small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return birthdayUsers.length;

    } catch (error) {
      console.error('Error checking daily birthdays:', error);
      return 0;
    }
  }

  /**
   * Process birthday notifications for a specific user
   */
  async processBirthdayNotifications(birthdayUser) {
    try {
      console.log(`🎂 Processing birthday for ${birthdayUser.firstName} ${birthdayUser.lastName}`);

      // Calculate age
      const age = this.calculateAge(birthdayUser.dateOfBirth);

      // Get connections based on privacy settings
      const connections = await this.getBirthdayConnections(birthdayUser);

      console.log(`📨 Sending birthday suggestions to ${connections.length} connections`);

      // Send birthday suggestion notifications to connections
      for (const connection of connections) {
        await this.sendBirthdaySuggestion(connection.userId, birthdayUser, age);
      }

      // Send birthday celebration notification to the birthday user
      await this.sendBirthdayCelebrationNotification(birthdayUser, age);

      return connections.length;

    } catch (error) {
      console.error(`Error processing birthday for ${birthdayUser.firstName}:`, error);
      return 0;
    }
  }

  /**
   * Get connections who should be notified about the birthday
   */
  async getBirthdayConnections(birthdayUser) {
    try {
      let connections = [];

      // Get all accepted connections
      const allConnections = await Connection.find({
        $or: [
          { requester: birthdayUser._id, status: 'accepted' },
          { recipient: birthdayUser._id, status: 'accepted' }
        ]
      }).populate('requester recipient', 'firstName lastName notificationSettings');

      // Filter based on birthday privacy settings
      for (const conn of allConnections) {
        const connectionUser = conn.requester._id.toString() === birthdayUser._id.toString() 
          ? conn.recipient 
          : conn.requester;

        // Check if connection wants birthday notifications
        if (connectionUser.notificationSettings?.contentEngagement !== false) {
          
          // Apply privacy filter
          if (birthdayUser.birthdayPrivacy === 'public' ||
              (birthdayUser.birthdayPrivacy === 'connections' && this.isStrongConnection(conn))) {
            
            connections.push({
              userId: connectionUser._id,
              user: connectionUser,
              connectionStrength: conn.connectionStrength?.score || 50
            });
          }
        }
      }

      // Sort by connection strength (strongest first)
      connections.sort((a, b) => b.connectionStrength - a.connectionStrength);

      // Limit to top 20 connections to avoid spam
      return connections.slice(0, 20);

    } catch (error) {
      console.error('Error getting birthday connections:', error);
      return [];
    }
  }

  /**
   * Check if connection is strong enough for birthday notifications
   */
  isStrongConnection(connection) {
    const strength = connection.connectionStrength?.score || 0;
    const recentInteraction = connection.lastInteraction && 
      (Date.now() - connection.lastInteraction.getTime()) < (90 * 24 * 60 * 60 * 1000); // 90 days

    return strength > 30 || recentInteraction;
  }

  /**
   * Send birthday suggestion notification to a connection
   */
  async sendBirthdaySuggestion(connectionUserId, birthdayUser, age) {
    try {
      const template = this.birthdayTemplates[Math.floor(Math.random() * this.birthdayTemplates.length)];
      const professionalWish = this.birthdayWishes.professional[
        Math.floor(Math.random() * this.birthdayWishes.professional.length)
      ];

      const notificationData = {
        recipient: connectionUserId,
        sender: birthdayUser._id,
        type: 'birthday_suggestion',
        title: `🎂 Say Happy Birthday to ${birthdayUser.firstName}!`,
        message: `${birthdayUser.firstName} ${birthdayUser.lastName} is celebrating their birthday today${age ? ` (turning ${age})` : ''}! ${template}`,
        metadata: {
          birthdayUserId: birthdayUser._id,
          birthdayUserName: `${birthdayUser.firstName} ${birthdayUser.lastName}`,
          age: age,
          suggestedMessage: professionalWish,
          actionType: 'send_birthday_wish'
        },
        priority: 'normal',
        actionUrl: `/profile/${birthdayUser._id}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires after 24 hours
      };

      // Use smart timing for delivery
      await smartTimingService.scheduleOptimalNotification(notificationData, connectionUserId);

      console.log(`📨 Sent birthday suggestion to connection for ${birthdayUser.firstName}`);
      return true;

    } catch (error) {
      console.error('Error sending birthday suggestion:', error);
      return false;
    }
  }

  /**
   * Send birthday celebration notification to the birthday user
   */
  async sendBirthdayCelebrationNotification(birthdayUser, age) {
    try {
      const notificationData = {
        recipient: birthdayUser._id,
        sender: birthdayUser._id, // System notification
        type: 'birthday_celebration',
        title: `🎉 Happy Birthday, ${birthdayUser.firstName}!`,
        message: `It's your special day! ${age ? `Happy ${age}th birthday! ` : ''}We hope you have a wonderful celebration filled with joy and success.`,
        metadata: {
          age: age,
          celebrationType: 'birthday',
          isSystemMessage: true
        },
        priority: 'normal',
        actionUrl: '/dashboard'
      };

      // Send immediately (birthday notifications are special)
      await Notification.createNotification(notificationData);

      console.log(`🎂 Sent birthday celebration to ${birthdayUser.firstName}`);
      return true;

    } catch (error) {
      console.error('Error sending birthday celebration:', error);
      return false;
    }
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get upcoming birthdays for a user's connections
   */
  async getUpcomingBirthdays(userId, days = 7) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      // Get user's connections
      const connections = await Connection.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      }).populate('requester recipient', 'firstName lastName dateOfBirth birthdayPrivacy professionalType');

      const upcomingBirthdays = [];
      const today = new Date();

      for (const conn of connections) {
        const connectionUser = conn.requester._id.toString() === userId.toString() 
          ? conn.recipient 
          : conn.requester;

        if (connectionUser.dateOfBirth && 
            (connectionUser.birthdayPrivacy === 'public' || 
             connectionUser.birthdayPrivacy === 'connections')) {
          
          const birthday = this.getNextBirthday(connectionUser.dateOfBirth);
          const daysUntil = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));

          if (daysUntil >= 0 && daysUntil <= days) {
            upcomingBirthdays.push({
              user: {
                _id: connectionUser._id,
                firstName: connectionUser.firstName,
                lastName: connectionUser.lastName,
                professionalType: connectionUser.professionalType
              },
              birthday: birthday,
              daysUntil: daysUntil,
              age: this.calculateAge(connectionUser.dateOfBirth) + 1 // Next age
            });
          }
        }
      }

      // Sort by days until birthday
      upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

      return upcomingBirthdays;

    } catch (error) {
      console.error('Error getting upcoming birthdays:', error);
      return [];
    }
  }

  /**
   * Get next birthday date for a given date of birth
   */
  getNextBirthday(dateOfBirth) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const birthDate = new Date(dateOfBirth);
    
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    // If birthday has passed this year, get next year's birthday
    if (nextBirthday < today) {
      nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    return nextBirthday;
  }

  /**
   * Send birthday wish from one user to another
   */
  async sendBirthdayWish(fromUserId, toUserId, message = null) {
    try {
      const fromUser = await User.findById(fromUserId);
      const toUser = await User.findById(toUserId);

      if (!fromUser || !toUser) {
        throw new Error('User not found');
      }

      // Use provided message or generate one
      const birthdayMessage = message || this.birthdayWishes.professional[
        Math.floor(Math.random() * this.birthdayWishes.professional.length)
      ];

      const notificationData = {
        recipient: toUserId,
        sender: fromUserId,
        type: 'birthday_wish_received',
        title: `🎂 Birthday Wish from ${fromUser.firstName}!`,
        message: birthdayMessage,
        metadata: {
          wishType: 'birthday',
          isPersonalMessage: !!message
        },
        priority: 'normal',
        actionUrl: `/profile/${fromUserId}`
      };

      await Notification.createNotification(notificationData);

      console.log(`🎉 Birthday wish sent from ${fromUser.firstName} to ${toUser.firstName}`);
      return true;

    } catch (error) {
      console.error('Error sending birthday wish:', error);
      return false;
    }
  }

  /**
   * Get birthday statistics for analytics
   */
  async getBirthdayStats() {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;

      // Count birthdays this month
      const birthdaysThisMonth = await User.countDocuments({
        dateOfBirth: {
          $exists: true,
          $ne: null
        },
        $expr: {
          $eq: [{ $month: '$dateOfBirth' }, currentMonth]
        }
      });

      // Count users with birthdays set
      const usersWithBirthdays = await User.countDocuments({
        dateOfBirth: { $exists: true, $ne: null }
      });

      // Count birthday notifications sent today
      const birthdayNotificationsToday = await Notification.countDocuments({
        type: { $in: ['birthday_suggestion', 'birthday_celebration', 'birthday_wish_received'] },
        createdAt: {
          $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        }
      });

      return {
        birthdaysThisMonth,
        usersWithBirthdays,
        birthdayNotificationsToday,
        totalUsers: await User.countDocuments()
      };

    } catch (error) {
      console.error('Error getting birthday stats:', error);
      return null;
    }
  }

  /**
   * Clean up expired birthday notifications
   */
  async cleanupExpiredBirthdayNotifications() {
    try {
      const result = await Notification.deleteMany({
        type: { $in: ['birthday_suggestion'] },
        expiresAt: { $lt: new Date() }
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} expired birthday notifications`);
      return result.deletedCount;

    } catch (error) {
      console.error('Error cleaning up birthday notifications:', error);
      return 0;
    }
  }
}

module.exports = new BirthdayService(); 