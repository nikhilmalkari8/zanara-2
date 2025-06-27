const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const notificationScheduler = require('../services/notificationScheduler');
const smartTimingService = require('../services/smartTimingService');
const birthdayService = require('../services/birthdayService');
const digestService = require('../services/digestService');
const contextualSuggestionsService = require('../services/contextualSuggestionsService');

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = null,
      type = null
    } = req.query;
    
    const notifications = await Notification.getUserNotifications(req.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      type
    });
    
    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: notifications.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.userId);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
});

// Mark notifications as read
router.put('/mark-read', auth, async (req, res) => {
  try {
    const { notificationIds = [] } = req.body;
    
    await Notification.markAsRead(req.userId, notificationIds);
    
    res.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
});

// Mark single notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { 
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
});

// Get notification statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    const stats = await Notification.aggregate([
      { $match: { recipient: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification statistics',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, status: 'unread' },
      { 
        status: 'read',
        readAt: new Date()
      }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
});

// Get notification by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.userId
    })
    .populate('sender', 'firstName lastName userType')
    .populate('relatedObjects.opportunity', 'title type')
    .populate('relatedObjects.company', 'companyName');
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification',
      error: error.message
    });
  }
});

// Create notification (for admin/testing purposes)
router.post('/create', auth, async (req, res) => {
  try {
    const {
      recipient,
      type,
      title,
      message,
      priority = 'normal',
      relatedObjects = {}
    } = req.body;
    
    if (!recipient || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, type, title, and message are required'
      });
    }
    
    const notification = await Notification.createNotification({
      recipient,
      sender: req.userId,
      type,
      title,
      message,
      priority,
      relatedObjects
    });
    
    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
});

// Archive notification
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { status: 'archived' },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification,
      message: 'Notification archived'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error archiving notification',
      error: error.message
    });
  }
});

// Bulk delete notifications
router.delete('/bulk-delete', auth, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'notificationIds array is required'
      });
    }
    
    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      recipient: req.userId
    });
    
    res.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notifications',
      error: error.message
    });
  }
});

// Bulk mark as read
router.put('/bulk-mark-read', auth, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'notificationIds array is required'
      });
    }
    
    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: req.userId
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
});

// Get notifications by type
router.get('/type/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const notifications = await Notification.getUserNotifications(req.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type
    });
    
    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: notifications.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications by type',
      error: error.message
    });
  }
});

// Get notification settings (placeholder for future user preferences)
router.get('/settings', auth, async (req, res) => {
  try {
    // This would typically fetch user notification preferences from a settings model
    // For now, return default settings
    const defaultSettings = {
      emailNotifications: {
        newConnections: true,
        opportunities: true,
        applications: true,
        messages: true
      },
      pushNotifications: {
        newConnections: true,
        opportunities: false,
        applications: true,
        messages: true
      },
      inAppNotifications: {
        all: true
      }
    };
    
    res.json({
      success: true,
      data: defaultSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification settings',
      error: error.message
    });
  }
});

// Update notification settings (placeholder for future implementation)
router.put('/settings', auth, async (req, res) => {
  try {
    const { settings } = req.body;
    
    // This would typically update user notification preferences in a settings model
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Notification settings updated',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings',
      error: error.message
    });
  }
});

// Phase 4: Intelligent Notification Management Routes

// Get scheduler status
router.get('/scheduler/status', async (req, res) => {
  try {
    const status = notificationScheduler.getSchedulerStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduler status'
    });
  }
});

// Get comprehensive notification statistics
router.get('/scheduler/stats', async (req, res) => {
  try {
    const stats = await notificationScheduler.getComprehensiveStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification statistics'
    });
  }
});

// Manually run a specific notification task
router.post('/scheduler/run/:taskName', async (req, res) => {
  try {
    const { taskName } = req.params;
    const result = await notificationScheduler.runTaskManually(taskName);
    
    res.json({
      success: result.success,
      data: result,
      message: result.success ? `Task ${taskName} completed successfully` : `Task ${taskName} failed`
    });
  } catch (error) {
    console.error('Error running manual task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run task'
    });
  }
});

// Start/stop scheduler
router.post('/scheduler/:action', async (req, res) => {
  try {
    const { action } = req.params;
    
    let result;
    switch (action) {
      case 'start':
        await notificationScheduler.startScheduler();
        result = { message: 'Notification scheduler started' };
        break;
      case 'stop':
        await notificationScheduler.stopScheduler();
        result = { message: 'Notification scheduler stopped' };
        break;
      case 'restart':
        await notificationScheduler.restartScheduler();
        result = { message: 'Notification scheduler restarted' };
        break;
      case 'emergency-stop':
        result = await notificationScheduler.emergencyStop();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use: start, stop, restart, or emergency-stop'
        });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error controlling scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to control scheduler'
    });
  }
});

// Test all notification services
router.post('/scheduler/test', async (req, res) => {
  try {
    const testResults = await notificationScheduler.testAllServices();
    res.json({
      success: testResults.overall === 'passed',
      data: testResults
    });
  } catch (error) {
    console.error('Error testing services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test services'
    });
  }
});

// Get user's activity patterns
router.get('/activity-patterns', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('activityPatterns notificationDelivery');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        activityPatterns: user.activityPatterns,
        notificationDelivery: user.notificationDelivery
      }
    });
  } catch (error) {
    console.error('Error getting activity patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity patterns'
    });
  }
});

// Update user's notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationDelivery } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { notificationDelivery },
      { new: true, runValidators: true }
    ).select('notificationDelivery');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.notificationDelivery,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
});

// Trigger activity pattern analysis for current user
router.post('/analyze-patterns', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await smartTimingService.analyzeUserActivityPatterns(userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found or insufficient activity data'
      });
    }
    
    res.json({
      success: true,
      data: {
        activityPatterns: result.activityPatterns,
        message: 'Activity patterns analyzed successfully'
      }
    });
  } catch (error) {
    console.error('Error analyzing activity patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze activity patterns'
    });
  }
});

// Get upcoming birthdays for user's connections
router.get('/birthdays/upcoming', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { days = 7 } = req.query;
    
    const upcomingBirthdays = await birthdayService.getUpcomingBirthdays(userId, parseInt(days));
    
    res.json({
      success: true,
      data: upcomingBirthdays
    });
  } catch (error) {
    console.error('Error getting upcoming birthdays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming birthdays'
    });
  }
});

// Send birthday wish
router.post('/birthdays/wish', auth, async (req, res) => {
  try {
    const fromUserId = req.userId;
    const { toUserId, message } = req.body;
    
    if (!toUserId) {
      return res.status(400).json({
        success: false,
        message: 'toUserId is required'
      });
    }
    
    const result = await birthdayService.sendBirthdayWish(fromUserId, toUserId, message);
    
    res.json({
      success: result,
      message: result ? 'Birthday wish sent successfully' : 'Failed to send birthday wish'
    });
  } catch (error) {
    console.error('Error sending birthday wish:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send birthday wish'
    });
  }
});

// Get notification digest preview
router.get('/digest/preview/:type', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.params; // daily, weekly, monthly
    
    let digestContent;
    switch (type) {
      case 'daily':
        digestContent = await digestService.generateDailyDigestContent(userId);
        break;
      case 'weekly':
        digestContent = await digestService.generateWeeklyDigestContent(userId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid digest type. Use: daily or weekly'
        });
    }
    
    res.json({
      success: true,
      data: digestContent || { message: 'No digest content available' }
    });
  } catch (error) {
    console.error('Error generating digest preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate digest preview'
    });
  }
});

module.exports = router;