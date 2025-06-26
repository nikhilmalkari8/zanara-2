const express = require('express');
const Connection = require('../models/Connection');
const IntroductionRequest = require('../models/IntroductionRequest');
const User = require('../models/User');
const ActivityService = require('../services/activityService');
const auth = require('../middleware/auth');

const router = express.Router();

// Send connection request - IMPROVED VERSION
router.post('/request', auth, async (req, res) => {
  try {
    const { receiverId, message, receiverType } = req.body;
    const senderId = req.userId;

    console.log('Connection request received:', {
      senderId,
      receiverId,
      message,
      receiverType
    });

    // Validate required fields
    if (!senderId) {
      return res.status(400).json({ 
        success: false,
        message: 'Authentication required - sender ID missing'
      });
    }

    if (!receiverId) {
      return res.status(400).json({ 
        success: false,
        message: 'Receiver ID is required' 
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot send connection request to yourself' 
      });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingConnection) {
      let statusMessage = 'Connection already exists';
      let frontendStatus = existingConnection.status;
      
      if (existingConnection.status === 'pending') {
        if (existingConnection.sender.toString() === senderId) {
          statusMessage = 'Connection request already sent';
          frontendStatus = 'pending_sent';
        } else {
          statusMessage = 'You have a pending connection request from this user';
          frontendStatus = 'pending_received';
        }
      } else if (existingConnection.status === 'accepted') {
        statusMessage = 'You are already connected';
        frontendStatus = 'connected';
      } else if (existingConnection.status === 'rejected') {
        statusMessage = 'Connection request was previously rejected';
        frontendStatus = 'rejected';
      }
      
      return res.status(400).json({ 
        success: false,
        message: statusMessage,
        status: frontendStatus,
        connectionId: existingConnection._id
      });
    }

    // Get sender's professional type
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ 
        success: false,
        message: 'Sender user not found' 
      });
    }

    // Get receiver info to validate
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ 
        success: false,
        message: 'Receiver user not found' 
      });
    }

    // Create connection with correct field names
    const connectionData = {
      sender: senderId,
      receiver: receiverId,
      message: message || '',
      senderType: sender.professionalType,
      receiverType: receiverType || receiver.professionalType,
      status: 'pending'
    };

    console.log('Creating connection with data:', connectionData);

    const connection = new Connection(connectionData);
    await connection.save();
    
    console.log('Connection created successfully:', connection._id);

    // Create activity for connection request
    try {
      if (ActivityService && ActivityService.createConnectionActivity) {
        await ActivityService.createConnectionActivity(connection._id, senderId, receiverId);
      }
    } catch (activityError) {
      console.error('Error creating connection activity:', activityError);
      // Don't fail the request if activity creation fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      status: 'pending_sent',
      connection: {
        _id: connection._id,
        status: connection.status,
        message: connection.message,
        createdAt: connection.createdAt,
        receiver: {
          _id: receiver._id,
          firstName: receiver.firstName,
          lastName: receiver.lastName,
          professionalType: receiver.professionalType
        }
      }
    });
  } catch (error) {
    console.error('Connection request error:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Connection request already exists between these users'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error sending connection request',
      error: error.message 
    });
  }
});

// Accept connection request
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({ 
        success: false,
        message: 'Connection request not found' 
      });
    }

    if (connection.receiver.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to accept this request' 
      });
    }

    if (connection.status === 'accepted') {
      return res.status(400).json({ 
        success: false,
        message: 'Connection already accepted' 
      });
    }

    connection.status = 'accepted';
    connection.connectedAt = new Date();
    await connection.save();

    // Populate the response with user details
    await connection.populate('sender', 'firstName lastName fullName professionalType profilePicture');
    await connection.populate('receiver', 'firstName lastName fullName professionalType profilePicture');

    // Create activity for connection acceptance
    try {
      if (ActivityService && ActivityService.createConnectionActivity) {
        await ActivityService.createConnectionActivity(connection._id, connection.sender._id, connection.receiver._id);
      }
    } catch (activityError) {
      console.error('Error creating connection activity:', activityError);
    }

    res.json({
      success: true,
      message: 'Connection request accepted',
      connection
    });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error accepting connection request' 
    });
  }
});

// Reject connection request
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({ 
        success: false,
        message: 'Connection request not found' 
      });
    }

    if (connection.receiver.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to reject this request' 
      });
    }

    connection.status = 'rejected';
    await connection.save();

    res.json({
      success: true,
      message: 'Connection request rejected',
      connection
    });
  } catch (error) {
    console.error('Reject connection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error rejecting connection request' 
    });
  }
});

// Get user's connections - BACKWARD COMPATIBLE
router.get('/my-connections', auth, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { sender: req.userId },
        { receiver: req.userId }
      ],
      status: 'accepted'
    })
    .populate('sender', 'firstName lastName fullName professionalType profilePicture')
    .populate('receiver', 'firstName lastName fullName professionalType profilePicture')
    .sort('-connectedAt');

    // Return direct array for backward compatibility
    res.json(connections);
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching connections' 
    });
  }
});

// Get pending connection requests (received by current user) - BACKWARD COMPATIBLE
router.get('/pending-requests', auth, async (req, res) => {
  try {
    console.log('Fetching pending requests for user:', req.userId);
    
    const pendingRequests = await Connection.find({
      receiver: req.userId,
      status: 'pending'
    })
    .populate('sender', 'firstName lastName fullName professionalType profilePicture')
    .sort('-createdAt');

    console.log('Found pending requests:', pendingRequests.length);
    
    if (pendingRequests.length > 0) {
      console.log('Pending requests details:', pendingRequests.map(req => ({
        id: req._id,
        senderName: req.sender ? req.sender.firstName + ' ' + req.sender.lastName : 'Unknown',
        senderType: req.senderType,
        message: req.message,
        createdAt: req.createdAt
      })));
    }

    // Return the array directly for backward compatibility with existing frontend
    res.json(pendingRequests);
    
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching pending requests',
      error: error.message 
    });
  }
});

// Get sent connection requests (sent by current user) - BACKWARD COMPATIBLE
router.get('/sent-requests', auth, async (req, res) => {
  try {
    const sentRequests = await Connection.find({
      sender: req.userId,
      status: 'pending'
    })
    .populate('receiver', 'firstName lastName fullName professionalType profilePicture')
    .sort('-createdAt');

    // Return direct array for backward compatibility
    res.json(sentRequests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching sent requests' 
    });
  }
});

// Remove connection
router.delete('/:id', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({ 
        success: false,
        message: 'Connection not found' 
      });
    }

    if (connection.sender.toString() !== req.userId && 
        connection.receiver.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to remove this connection' 
      });
    }

    await Connection.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true,
      message: 'Connection removed successfully' 
    });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing connection' 
    });
  }
});

// Get connection status with another user
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Checking connection status between:', req.userId, 'and', userId);
    
    if (userId === req.userId) {
      return res.json({ 
        success: true,
        status: 'self' 
      });
    }
    
    const connection = await Connection.findOne({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    });
    
    if (!connection) {
      return res.json({ 
        success: true,
        status: 'none' 
      });
    }
    
    // Determine the status from current user's perspective
    let status = connection.status;
    if (connection.status === 'pending') {
      if (connection.sender.toString() === req.userId) {
        status = 'pending_sent';
      } else {
        status = 'pending_received';
      }
    }
    
    res.json({
      success: true,
      status: status,
      connectionId: connection._id,
      sender: connection.sender.toString(),
      receiver: connection.receiver.toString()
    });
    
  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking connection status'
    });
  }
});

// Get mutual connections between current user and another user
router.get('/mutual/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot get mutual connections with yourself'
      });
    }
    
    const mutualConnections = await Connection.getMutualConnections(req.userId, userId);
    
    res.json({
      success: true,
      mutualConnections,
      count: mutualConnections.length
    });
    
  } catch (error) {
    console.error('Get mutual connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching mutual connections'
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
        success: false,
        message: 'Connection not found'
      });
    }
    
    // Check if user is part of this connection
    const isSender = connection.sender.toString() === req.userId;
    const isReceiver = connection.receiver.toString() === req.userId;
    
    if (!isSender && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this connection'
      });
    }
    
    // Update fields
    if (relationship) connection.relationship = relationship;
    if (tags) connection.tags = tags;
    if (notes) {
      if (isSender) {
        connection.notes.senderNotes = notes;
      } else {
        connection.notes.receiverNotes = notes;
      }
    }
    
    await connection.save();
    
    res.json({
      success: true,
      message: 'Connection updated successfully',
      connection
    });
    
  } catch (error) {
    console.error('Update connection error:', error);
    res.status(500).json({
      success: false,
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
      success: true,
      totalConnections: stats[0],
      pendingReceived: stats[1],
      pendingSent: stats[2],
      connectionsByType: stats[3]
    });
    
  } catch (error) {
    console.error('Get connection analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching connection analytics'
    });
  }
});

module.exports = router;