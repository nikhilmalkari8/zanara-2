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
    const { receiverId, message, receiverType } = req.body;
    const senderId = req.userId;

    // Get sender's professional type
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    const connection = new Connection({
      sender: senderId,
      receiver: receiverId,
      message,
      senderType: sender.professionalType,
      receiverType
    });

    await connection.save();
    res.status(201).json(connection);
  } catch (error) {
    console.error('Connection request error:', error);
    res.status(500).json({ message: 'Error sending connection request' });
  }
});

// Accept connection request
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (connection.receiver.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    connection.status = 'accepted';
    await connection.save();

    res.json(connection);
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ message: 'Error accepting connection request' });
  }
});

// Reject connection request
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (connection.receiver.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    connection.status = 'rejected';
    await connection.save();

    res.json(connection);
  } catch (error) {
    console.error('Reject connection error:', error);
    res.status(500).json({ message: 'Error rejecting connection request' });
  }
});

// Get user's connections
router.get('/my-connections', auth, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { sender: req.userId },
        { receiver: req.userId }
      ],
      status: 'accepted'
    })
    .populate('sender', 'fullName profilePicture professionalType')
    .populate('receiver', 'fullName profilePicture professionalType')
    .sort('-createdAt');

    res.json(connections);
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ message: 'Error fetching connections' });
  }
});

// Get pending connection requests
router.get('/pending-requests', auth, async (req, res) => {
  try {
    const pendingRequests = await Connection.find({
      receiver: req.userId,
      status: 'pending'
    })
    .populate('sender', 'fullName profilePicture professionalType')
    .sort('-createdAt');

    res.json(pendingRequests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Error fetching pending requests' });
  }
});

// Remove connection
router.delete('/:id', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    if (connection.sender.toString() !== req.userId && 
        connection.receiver.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to remove this connection' });
    }

    await connection.remove();
    res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({ message: 'Error removing connection' });
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
    const isRequester = connection.sender.toString() === req.userId;
    const isRecipient = connection.receiver.toString() === req.userId;
    
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

// Get connection analytics
router.get('/analytics/stats', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    const stats = await Promise.all([
      // Total connections
      Connection.countDocuments({
        $or: [
          { sender: req.userId, status: 'accepted' },
          { receiver: req.userId, status: 'accepted' }
        ]
      }),
      
      // Pending received requests
      Connection.countDocuments({
        receiver: req.userId,
        status: 'pending'
      }),
      
      // Pending sent requests
      Connection.countDocuments({
        sender: req.userId,
        status: 'pending'
      }),
      
      // Connections by relationship type
      Connection.aggregate([
        {
          $match: {
            $or: [
              { sender: new mongoose.Types.ObjectId(req.userId), status: 'accepted' },
              { receiver: new mongoose.Types.ObjectId(req.userId), status: 'accepted' }
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