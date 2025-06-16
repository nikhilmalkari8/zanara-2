const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

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

module.exports = router;