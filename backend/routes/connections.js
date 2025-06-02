const express = require('express');
const Connection = require('../models/Connection');
const IntroductionRequest = require('../models/IntroductionRequest');
const User = require('../models/User');
const ActivityService = require('../services/activityService');
const auth = require('../middleware/auth');

const router = express.Router();

// Send connection request
router.post('/request', auth, async (req, res) => {
  try {
    const { recipientId, relationship, message, tags } = req.body;
    
    if (req.userId === recipientId) {
      return res.status(400).json({
        message: 'Cannot send connection request to yourself'
      });
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.userId, recipient: recipientId },
        { requester: recipientId, recipient: req.userId }
      ]
    });
    
    if (existingConnection) {
      return res.status(400).json({
        message: 'Connection request already exists or users are already connected'
      });
    }
    
    // Create connection request
    const connection = new Connection({
      requester: req.userId,
      recipient: recipientId,
      relationship: relationship || 'other',
      message,
      tags: tags || []
    });
    
    await connection.save();
    
    // Populate user details for response
    await connection.populate([
      { path: 'requester', select: 'firstName lastName email userType' },
      { path: 'recipient', select: 'firstName lastName email userType' }
    ]);
    
    res.status(201).json({
      message: 'Connection request sent successfully',
      connection
    });
    
  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({
      message: 'Server error sending connection request'
    });
  }
});

// Respond to connection request (accept/decline)
router.put('/respond/:connectionId', auth, async (req, res) => {
  try {
    const { action, notes } = req.body; // action: 'accept' or 'decline'
    
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        message: 'Invalid action. Must be accept or decline'
      });
    }
    
    const connection = await Connection.findById(req.params.connectionId);
    
    if (!connection) {
      return res.status(404).json({
        message: 'Connection request not found'
      });
    }
    
    // Check if user is the recipient
    if (connection.recipient.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Unauthorized to respond to this connection request'
      });
    }
    
    if (connection.status !== 'pending') {
      return res.status(400).json({
        message: 'Connection request has already been responded to'
      });
    }
    
    // Update connection status
    connection.status = action === 'accept' ? 'accepted' : 'cancelled';
    
    if (notes) {
      connection.notes.recipientNotes = notes;
    }
    
    await connection.save();
    
    // Create activity for accepted connections
    if (action === 'accept') {
      await ActivityService.createConnectionActivity(
        connection._id,
        req.userId, // The person who accepted
        connection.requester // The person who sent the request
      );
    }
    
    // Populate user details for response
    await connection.populate([
      { path: 'requester', select: 'firstName lastName email userType' },
      { path: 'recipient', select: 'firstName lastName email userType' }
    ]);
    
    res.json({
      message: `Connection request ${action}ed successfully`,
      connection
    });
    
  } catch (error) {
    console.error('Respond to connection request error:', error);
    res.status(500).json({
      message: 'Server error responding to connection request'
    });
  }
});

// Get user's connections
router.get('/my-connections', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, relationship, sort = 'newest' } = req.query;
    
    // Build query
    let query = {
      $or: [
        { requester: req.userId, status: 'accepted' },
        { recipient: req.userId, status: 'accepted' }
      ]
    };
    
    if (relationship && relationship !== 'all') {
      query.relationship = relationship;
    }
    
    // Get connections
    let connections = await Connection.find(query)
      .populate('requester', 'firstName lastName email userType')
      .populate('recipient', 'firstName lastName email userType')
      .sort({ [sort === 'newest' ? 'connectedAt' : 'lastInteraction']: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Transform connections to include the "other" user
    connections = connections.map(conn => {
      const isRequester = conn.requester._id.toString() === req.userId;
      const otherUser = isRequester ? conn.recipient : conn.requester;
      
      return {
        _id: conn._id,
        user: otherUser,
        relationship: conn.relationship,
        connectionStrength: conn.connectionStrength,
        connectedAt: conn.connectedAt,
        lastInteraction: conn.lastInteraction,
        tags: conn.tags,
        mutualConnectionsCount: conn.mutualConnectionsCount
      };
    });
    
    // Apply search filter on transformed data
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      connections = connections.filter(conn => 
        searchRegex.test(`${conn.user.firstName} ${conn.user.lastName}`) ||
        searchRegex.test(conn.user.email)
      );
    }
    
    const total = await Connection.countDocuments(query);
    
    res.json({
      connections,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      message: 'Server error fetching connections'
    });
  }
});

// Get pending connection requests (received)
router.get('/requests/received', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const requests = await Connection.find({
      recipient: req.userId,
      status: 'pending'
    })
    .populate('requester', 'firstName lastName email userType')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const total = await Connection.countDocuments({
      recipient: req.userId,
      status: 'pending'
    });
    
    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({
      message: 'Server error fetching received requests'
    });
  }
});

// Get sent connection requests
router.get('/requests/sent', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const requests = await Connection.find({
      requester: req.userId,
      status: { $in: ['pending', 'cancelled'] }
    })
    .populate('recipient', 'firstName lastName email userType')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const total = await Connection.countDocuments({
      requester: req.userId,
      status: { $in: ['pending', 'cancelled'] }
    });
    
    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({
      message: 'Server error fetching sent requests'
    });
  }
});

// Get mutual connections between current user and another user
router.get('/mutual/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.userId) {
      return res.status(400).json({
        message: 'Cannot get mutual connections with yourself'
      });
    }
    
    const mutualConnections = await Connection.getMutualConnections(req.userId, userId);
    
    res.json({
      mutualConnections,
      count: mutualConnections.length
    });
    
  } catch (error) {
    console.error('Get mutual connections error:', error);
    res.status(500).json({
      message: 'Server error fetching mutual connections'
    });
  }
});

// Get connection status with another user
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.userId) {
      return res.json({ status: 'self' });
    }
    
    const connectionStatus = await Connection.getConnectionStatus(req.userId, userId);
    
    if (!connectionStatus) {
      return res.json({ status: 'not_connected' });
    }
    
    res.json(connectionStatus);
    
  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json({
      message: 'Server error checking connection status'
    });
  }
});

// Update connection (add notes, update relationship, etc.)
router.put('/:connectionId', auth, async (req, res) => {
  try {
    const { relationship, tags, notes } = req.body;
    
    const connection = await Connection.findById(req.params.connectionId);
    
    if (!connection) {
      return res.status(404).json({
        message: 'Connection not found'
      });
    }
    
    // Check if user is part of this connection
    const isRequester = connection.requester.toString() === req.userId;
    const isRecipient = connection.recipient.toString() === req.userId;
    
    if (!isRequester && !isRecipient) {
      return res.status(403).json({
        message: 'Unauthorized to update this connection'
      });
    }
    
    // Update fields
    if (relationship) connection.relationship = relationship;
    if (tags) connection.tags = tags;
    if (notes) {
      if (isRequester) {
        connection.notes.requesterNotes = notes;
      } else {
        connection.notes.recipientNotes = notes;
      }
    }
    
    await connection.save();
    
    res.json({
      message: 'Connection updated successfully',
      connection
    });
    
  } catch (error) {
    console.error('Update connection error:', error);
    res.status(500).json({
      message: 'Server error updating connection'
    });
  }
});

// Remove/Block connection
router.delete('/:connectionId', auth, async (req, res) => {
  try {
    const { action = 'remove' } = req.body; // 'remove' or 'block'
    
    const connection = await Connection.findById(req.params.connectionId);
    
    if (!connection) {
      return res.status(404).json({
        message: 'Connection not found'
      });
    }
    
    // Check if user is part of this connection
    const isRequester = connection.requester.toString() === req.userId;
    const isRecipient = connection.recipient.toString() === req.userId;
    
    if (!isRequester && !isRecipient) {
      return res.status(403).json({
        message: 'Unauthorized to modify this connection'
      });
    }
    
    if (action === 'block') {
      connection.status = 'blocked';
      await connection.save();
      
      res.json({
        message: 'User blocked successfully'
      });
    } else {
      await Connection.findByIdAndDelete(req.params.connectionId);
      
      res.json({
        message: 'Connection removed successfully'
      });
    }
    
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({
      message: 'Server error removing connection'
    });
  }
});

// Get connection analytics
router.get('/analytics/stats', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    const stats = await Promise.all([
      // Total connections
      Connection.countDocuments({
        $or: [
          { requester: req.userId, status: 'accepted' },
          { recipient: req.userId, status: 'accepted' }
        ]
      }),
      
      // Pending received requests
      Connection.countDocuments({
        recipient: req.userId,
        status: 'pending'
      }),
      
      // Pending sent requests
      Connection.countDocuments({
        requester: req.userId,
        status: 'pending'
      }),
      
      // Connections by relationship type
      Connection.aggregate([
        {
          $match: {
            $or: [
              { requester: new mongoose.Types.ObjectId(req.userId), status: 'accepted' },
              { recipient: new mongoose.Types.ObjectId(req.userId), status: 'accepted' }
            ]
          }
        },
        {
          $group: {
            _id: '$relationship',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    res.json({
      totalConnections: stats[0],
      pendingReceived: stats[1],
      pendingSent: stats[2],
      connectionsByType: stats[3]
    });
    
  } catch (error) {
    console.error('Get connection analytics error:', error);
    res.status(500).json({
      message: 'Server error fetching connection analytics'
    });
  }
});

module.exports = router;