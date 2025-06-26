const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/messages/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all conversations for user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      $expr: {
        $not: {
          $in: [
            req.user.id,
            {
              $map: {
                input: '$archivedBy',
                as: 'archive',
                in: '$$archive.user'
              }
            }
          ]
        }
      }
    })
    .populate('participants', 'firstName lastName email profilePicture userType professionalType')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'firstName lastName'
      }
    })
    .sort({ lastActivity: -1 });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          recipient: req.user.id,
          'readBy.user': { $ne: req.user.id },
          deletedAt: { $exists: false }
        });

        return {
          ...conversation.toObject(),
          unreadCount,
          otherParticipant: conversation.getOtherParticipant(req.user.id)
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithUnread
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Get or create conversation with another user
router.post('/conversations', auth, async (req, res) => {
  try {
    const { recipientId, opportunityId, bookingId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreateDirectConversation(
      req.user.id,
      recipientId
    );

    // Add metadata if provided
    if (opportunityId || bookingId) {
      if (opportunityId) conversation.metadata.opportunityId = opportunityId;
      if (bookingId) conversation.metadata.bookingId = bookingId;
      await conversation.save();
    }

    res.json({
      success: true,
      conversation: {
        ...conversation.toObject(),
        otherParticipant: conversation.getOtherParticipant(req.user.id)
      }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.hasParticipant(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const messages = await Message.find({
      conversationId: conversationId,
      deletedAt: { $exists: false }
    })
    .populate('sender', 'firstName lastName profilePicture')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Mark messages as read
    await Message.markConversationAsRead(conversationId, req.user.id);

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to get chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text', replyToId } = req.body;

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.hasParticipant(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get recipient (for direct conversations)
    const recipient = conversation.getOtherParticipant(req.user.id);
    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation'
      });
    }

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/messages/${file.filename}`
    })) : [];

    // Create message
    const message = new Message({
      conversationId: conversationId,
      sender: req.user.id,
      recipient: recipient._id,
      content: content || '',
      messageType,
      attachments,
      replyTo: replyToId || null
    });

    await message.save();
    await message.populate('sender', 'firstName lastName profilePicture');

    // Update conversation last activity
    await conversation.updateLastActivity(message._id);

    // Emit real-time message (Socket.IO)
    const io = req.app.get('io');
    if (io) {
      // Emit to recipient
      io.to(`user_${recipient._id}`).emit('new_message', {
        message: message.toObject(),
        conversation: conversation.toObject()
      });

      // Emit to sender for confirmation
      io.to(`user_${req.user.id}`).emit('message_sent', {
        message: message.toObject(),
        conversation: conversation.toObject()
      });
    }

    res.json({
      success: true,
      message: message.toObject()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Mark message as read
router.put('/messages/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await message.markAsRead(req.user.id);

    // Emit read receipt (Socket.IO)
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${message.sender}`).emit('message_read', {
        messageId: message._id,
        readBy: req.user.id,
        readAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// Delete message
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    message.deletedAt = new Date();
    await message.save();

    // Emit message deletion (Socket.IO)
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${message.recipient}`).emit('message_deleted', {
        messageId: message._id,
        conversationId: message.conversationId
      });
    }

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// Add reaction to message
router.post('/messages/:messageId/reactions', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.user.id && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(
        r => !(r.user.toString() === req.user.id && r.emoji === emoji)
      );
    } else {
      // Add reaction
      message.reactions.push({
        user: req.user.id,
        emoji,
        createdAt: new Date()
      });
    }

    await message.save();

    // Emit reaction update (Socket.IO)
    const io = req.app.get('io');
    if (io) {
      const participants = [message.sender, message.recipient];
      participants.forEach(participantId => {
        io.to(`user_${participantId}`).emit('message_reaction', {
          messageId: message._id,
          reactions: message.reactions
        });
      });
    }

    res.json({
      success: true,
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Error updating reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reaction'
    });
  }
});

// Archive conversation
router.put('/conversations/:conversationId/archive', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.hasParticipant(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await conversation.archiveForUser(req.user.id);

    res.json({
      success: true,
      message: 'Conversation archived'
    });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive conversation'
    });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Message.getUnreadCount(req.user.id);

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

module.exports = router; 