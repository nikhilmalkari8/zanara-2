const express = require('express');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
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

// Get connection suggestions (People you may know)
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.userId;
    
    // Get current user's info
    const currentUser = await User.findById(userId).select('professionalType location skills workStatus');
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get existing connections
    const existingConnections = await Connection.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).select('sender receiver');
    
    const connectedUserIds = existingConnections.map(conn => 
      conn.sender.toString() === userId ? conn.receiver : conn.sender
    );
    connectedUserIds.push(userId); // Exclude self
    
    // Get mutual connections for each potential suggestion
    const acceptedConnections = await Connection.find({
      $or: [
        { sender: userId, status: 'accepted' },
        { receiver: userId, status: 'accepted' }
      ]
    });
    
    const userConnections = acceptedConnections.map(conn => 
      conn.sender.toString() === userId ? conn.receiver : conn.sender
    );
    
    // Find potential suggestions
    const suggestions = await User.aggregate([
      {
        $match: {
          _id: { $nin: connectedUserIds.map(id => new ObjectId(id)) },
          profileComplete: true
        }
      },
      {
        $lookup: {
          from: 'connections',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$status', 'accepted'] },
                    {
                      $or: [
                        {
                          $and: [
                            { $in: ['$sender', userConnections.map(id => new ObjectId(id))] },
                            { $eq: ['$receiver', '$$userId'] }
                          ]
                        },
                        {
                          $and: [
                            { $in: ['$receiver', userConnections.map(id => new ObjectId(id))] },
                            { $eq: ['$sender', '$$userId'] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: 'mutualConnectionsData'
        }
      },
      {
        $addFields: {
          mutualConnections: { $size: '$mutualConnectionsData' },
          locationMatch: { $eq: ['$location', currentUser.location] },
          professionMatch: { $eq: ['$professionalType', currentUser.professionalType] },
          commonSkills: {
            $size: {
              $setIntersection: [
                { $ifNull: [{ $map: { input: '$skills', as: 'skill', in: '$$skill.name' } }, []] },
                { $ifNull: [{ $map: { input: currentUser.skills || [], as: 'skill', in: '$$skill.name' } }, []] }
              ]
            }
          }
        }
      },
      {
        $addFields: {
          suggestionScore: {
            $add: [
              { $multiply: ['$mutualConnections', 10] },
              { $cond: ['$locationMatch', 20, 0] },
              { $cond: ['$professionMatch', 15, 0] },
              { $multiply: ['$commonSkills', 5] },
              { $cond: [{ $ne: ['$verificationTier', 'none'] }, 10, 0] }
            ]
          }
        }
      },
      {
        $match: {
          suggestionScore: { $gt: 0 }
        }
      },
      {
        $sort: { suggestionScore: -1, createdAt: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          headline: 1,
          professionalType: 1,
          profilePicture: 1,
          location: 1,
          isVerified: 1,
          verificationTier: 1,
          mutualConnections: 1,
          commonSkills: 1,
          suggestionScore: 1,
          createdAt: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      suggestions: suggestions.map(suggestion => ({
        ...suggestion,
        industryRelevance: suggestion.suggestionScore > 25
      }))
    });
    
  } catch (error) {
    console.error('Get connection suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching connection suggestions',
      error: error.message
    });
  }
});

// WEEK 3: Get connection strength analytics for a user
router.get('/analytics/:userId', auth, async (req, res) => {
  try {
    const analytics = await Connection.getConnectionAnalytics(req.params.userId);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting connection analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// WEEK 3: Get specific connection details with strength analysis
router.get('/:connectionId', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId)
      .populate('requester', 'firstName lastName professionalType profilePicture')
      .populate('recipient', 'firstName lastName professionalType profilePicture');

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Ensure user is part of this connection
    const isRequester = connection.requester._id.toString() === req.user._id.toString();
    const isRecipient = connection.recipient._id.toString() === req.user._id.toString();
    
    if (!isRequester && !isRecipient) {
      return res.status(403).json({ message: 'Not authorized to view this connection' });
    }

    // Add other user info
    const otherUser = isRequester ? connection.recipient : connection.requester;
    const connectionData = {
      ...connection.toObject(),
      otherUser
    };

    res.json(connectionData);
  } catch (error) {
    console.error('Error getting connection details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// WEEK 3: Recalculate connection strength manually
router.post('/:connectionId/recalculate-strength', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Ensure user is part of this connection
    const isRequester = connection.requester.toString() === req.user._id.toString();
    const isRecipient = connection.recipient.toString() === req.user._id.toString();
    
    if (!isRequester && !isRecipient) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const newStrength = await connection.calculateConnectionStrength();
    
    res.json({
      message: 'Connection strength recalculated',
      strength: newStrength,
      factors: connection.connectionStrength.factors,
      trend: connection.connectionStrength.trend
    });
  } catch (error) {
    console.error('Error recalculating connection strength:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// WEEK 3: Add interaction to connection
router.post('/:connectionId/interaction', auth, async (req, res) => {
  try {
    const { type, metadata } = req.body;
    const connection = await Connection.findById(req.params.connectionId);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Ensure user is part of this connection
    const isRequester = connection.requester.toString() === req.user._id.toString();
    const isRecipient = connection.recipient.toString() === req.user._id.toString();
    
    if (!isRequester && !isRecipient) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await connection.addInteraction(type, req.user._id, metadata);
    
    res.json({
      message: 'Interaction added',
      connectionStrength: connection.connectionStrength.score
    });
  } catch (error) {
    console.error('Error adding interaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// WEEK 3: Get strongest connections for a user
router.get('/strongest/:userId', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const strongestConnections = await Connection.getStrongestConnections(
      req.params.userId, 
      parseInt(limit)
    );
    
    res.json(strongestConnections);
  } catch (error) {
    console.error('Error getting strongest connections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// WEEK 3: Update connection preferences
router.put('/:connectionId/preferences', auth, async (req, res) => {
  try {
    const { allowMessages, allowEndorsements, allowCollaborations, notificationFrequency } = req.body;
    const connection = await Connection.findById(req.params.connectionId);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Ensure user is part of this connection
    const isRequester = connection.requester.toString() === req.user._id.toString();
    const isRecipient = connection.recipient.toString() === req.user._id.toString();
    
    if (!isRequester && !isRecipient) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update preferences
    if (allowMessages !== undefined) connection.preferences.allowMessages = allowMessages;
    if (allowEndorsements !== undefined) connection.preferences.allowEndorsements = allowEndorsements;
    if (allowCollaborations !== undefined) connection.preferences.allowCollaborations = allowCollaborations;
    if (notificationFrequency !== undefined) connection.preferences.notificationFrequency = notificationFrequency;

    await connection.save();
    
    res.json({
      message: 'Connection preferences updated',
      preferences: connection.preferences
    });
  } catch (error) {
    console.error('Error updating connection preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// WEEK 3: Add connection notes
router.put('/:connectionId/notes', auth, async (req, res) => {
  try {
    const { notes } = req.body;
    const connection = await Connection.findById(req.params.connectionId);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Ensure user is part of this connection
    const isRequester = connection.requester.toString() === req.user._id.toString();
    const isRecipient = connection.recipient.toString() === req.user._id.toString();
    
    if (!isRequester && !isRecipient) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update notes based on user role
    if (isRequester) {
      connection.notes.requesterNotes = notes;
    } else {
      connection.notes.recipientNotes = notes;
    }

    await connection.save();
    
    res.json({
      message: 'Connection notes updated',
      notes: isRequester ? connection.notes.requesterNotes : connection.notes.recipientNotes
    });
  } catch (error) {
    console.error('Error updating connection notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// WEEK 3: Get connection strength between two users
router.get('/strength/:user1Id/:user2Id', auth, async (req, res) => {
  try {
    const strength = await Connection.getConnectionStrength(
      req.params.user1Id, 
      req.params.user2Id
    );
    
    res.json({ strength });
  } catch (error) {
    console.error('Error getting connection strength:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// WEEK 3: Bulk recalculate connection strengths for a user
router.post('/bulk-recalculate/:userId', auth, async (req, res) => {
  try {
    // Only allow users to recalculate their own connections
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const connections = await Connection.find({
      $or: [
        { requester: req.params.userId },
        { recipient: req.params.userId }
      ],
      status: 'accepted'
    });

    const results = [];
    for (const connection of connections) {
      try {
        const strength = await connection.calculateConnectionStrength();
        results.push({
          connectionId: connection._id,
          strength,
          success: true
        });
      } catch (error) {
        results.push({
          connectionId: connection._id,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      message: 'Bulk recalculation completed',
      totalConnections: connections.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error) {
    console.error('Error bulk recalculating connection strengths:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// WEEK 3: Get connection trends and insights
router.get('/insights/:userId', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const userId = req.params.userId;
    
    // Calculate date range
    const now = new Date();
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now - daysBack * 24 * 60 * 60 * 1000);

    // Get connections made in period
    const newConnections = await Connection.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ],
      status: 'accepted',
      createdAt: { $gte: startDate }
    }).populate('requester recipient', 'firstName lastName professionalType');

    // Get strength changes
    const allConnections = await Connection.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ],
      status: 'accepted'
    });

    const strengthTrends = {
      increasing: allConnections.filter(c => c.connectionStrength.trend === 'increasing').length,
      stable: allConnections.filter(c => c.connectionStrength.trend === 'stable').length,
      decreasing: allConnections.filter(c => c.connectionStrength.trend === 'decreasing').length
    };

    // Professional type distribution of new connections
    const professionalTypes = {};
    newConnections.forEach(conn => {
      const otherUser = conn.requester._id.toString() === userId ? conn.recipient : conn.requester;
      const type = otherUser.professionalType || 'unknown';
      professionalTypes[type] = (professionalTypes[type] || 0) + 1;
    });

    // Get top growing connections
    const topGrowingConnections = allConnections
      .filter(c => c.connectionStrength.trend === 'increasing')
      .sort((a, b) => b.connectionStrength.score - a.connectionStrength.score)
      .slice(0, 5)
      .map(conn => ({
        connectionId: conn._id,
        otherUser: conn.requester._id.toString() === userId ? conn.recipient : conn.requester,
        strength: conn.connectionStrength.score,
        trend: conn.connectionStrength.trend
      }));

    res.json({
      period,
      newConnections: newConnections.length,
      strengthTrends,
      professionalTypes,
      topGrowingConnections,
      totalConnections: allConnections.length,
      avgStrength: allConnections.reduce((sum, c) => sum + c.connectionStrength.score, 0) / allConnections.length || 0
    });
  } catch (error) {
    console.error('Error getting connection insights:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Existing routes...
// Get all connections for a user
router.get('/', auth, async (req, res) => {
  try {
    const { status = 'accepted', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const connections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ],
      status
    })
    .populate('requester', 'firstName lastName professionalType profilePicture location headline')
    .populate('recipient', 'firstName lastName professionalType profilePicture location headline')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalConnections = await Connection.countDocuments({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ],
      status
    });

    // Add connection strength and other user info
    const connectionsWithDetails = connections.map(conn => {
      const isRequester = conn.requester._id.toString() === req.user._id.toString();
      const otherUser = isRequester ? conn.recipient : conn.requester;
      
      return {
        ...conn.toObject(),
        otherUser,
        isRequester
      };
    });

    res.json({
      connections: connectionsWithDetails,
      totalConnections,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalConnections / limit)
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;