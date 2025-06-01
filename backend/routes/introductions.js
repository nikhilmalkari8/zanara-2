const express = require('express');
const IntroductionRequest = require('../models/IntroductionRequest');
const Connection = require('../models/Connection');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Request an introduction
router.post('/request', auth, async (req, res) => {
  try {
    const { introducerId, targetId, subject, message, purpose } = req.body;
    
    // Validate that all users are different
    if (req.userId === introducerId || req.userId === targetId || introducerId === targetId) {
      return res.status(400).json({
        message: 'All users in introduction request must be different'
      });
    }
    
    // Check if introduction is possible
    const canIntroduce = await IntroductionRequest.canIntroduce(req.userId, introducerId, targetId);
    
    if (!canIntroduce.possible) {
      return res.status(400).json({
        message: canIntroduce.reason
      });
    }
    
    // Verify all users exist
    const [introducer, target] = await Promise.all([
      User.findById(introducerId).select('firstName lastName email'),
      User.findById(targetId).select('firstName lastName email')
    ]);
    
    if (!introducer || !target) {
      return res.status(404).json({
        message: 'One or more users not found'
      });
    }
    
    // Create introduction request
    const introRequest = new IntroductionRequest({
      requester: req.userId,
      introducer: introducerId,
      target: targetId,
      subject,
      message,
      purpose
    });
    
    await introRequest.save();
    
    // Populate user details for response
    await introRequest.populate([
      { path: 'requester', select: 'firstName lastName email userType' },
      { path: 'introducer', select: 'firstName lastName email userType' },
      { path: 'target', select: 'firstName lastName email userType' }
    ]);
    
    res.status(201).json({
      message: 'Introduction request sent successfully',
      introductionRequest: introRequest
    });
    
  } catch (error) {
    console.error('Request introduction error:', error);
    res.status(500).json({
      message: 'Server error requesting introduction'
    });
  }
});

// Respond to introduction request (as introducer)
router.put('/respond/:requestId', auth, async (req, res) => {
  try {
    const { action, message, customIntroMessage } = req.body; // action: 'accept' or 'decline'
    
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        message: 'Invalid action. Must be accept or decline'
      });
    }
    
    const introRequest = await IntroductionRequest.findById(req.params.requestId);
    
    if (!introRequest) {
      return res.status(404).json({
        message: 'Introduction request not found'
      });
    }
    
    // Check if user is the introducer
    if (introRequest.introducer.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Unauthorized to respond to this introduction request'
      });
    }
    
    if (introRequest.status !== 'pending') {
      return res.status(400).json({
        message: 'Introduction request has already been responded to'
      });
    }
    
    // Update request with response
    introRequest.status = action === 'accept' ? 'accepted' : 'declined';
    introRequest.introducerResponse = {
      message: message || '',
      respondedAt: new Date()
    };
    
    // If accepted, send the introduction
    if (action === 'accept') {
      await introRequest.sendIntroduction(customIntroMessage);
    }
    
    await introRequest.save();
    
    // Populate user details for response
    await introRequest.populate([
      { path: 'requester', select: 'firstName lastName email userType' },
      { path: 'introducer', select: 'firstName lastName email userType' },
      { path: 'target', select: 'firstName lastName email userType' }
    ]);
    
    res.json({
      message: `Introduction request ${action}ed successfully`,
      introductionRequest: introRequest
    });
    
  } catch (error) {
    console.error('Respond to introduction request error:', error);
    res.status(500).json({
      message: 'Server error responding to introduction request'
    });
  }
});

// Get introduction requests received (as introducer)
router.get('/requests/received', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    let query = { introducer: req.userId };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    const requests = await IntroductionRequest.find(query)
      .populate('requester', 'firstName lastName email userType')
      .populate('target', 'firstName lastName email userType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await IntroductionRequest.countDocuments(query);
    
    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get received introduction requests error:', error);
    res.status(500).json({
      message: 'Server error fetching received introduction requests'
    });
  }
});

// Get introduction requests sent (as requester)
router.get('/requests/sent', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    let query = { requester: req.userId };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    const requests = await IntroductionRequest.find(query)
      .populate('introducer', 'firstName lastName email userType')
      .populate('target', 'firstName lastName email userType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await IntroductionRequest.countDocuments(query);
    
    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get sent introduction requests error:', error);
    res.status(500).json({
      message: 'Server error fetching sent introduction requests'
    });
  }
});

// Get possible introducers for a target user
router.get('/possible-introducers/:targetId', auth, async (req, res) => {
  try {
    const { targetId } = req.params;
    
    if (targetId === req.userId) {
      return res.status(400).json({
        message: 'Cannot request introduction to yourself'
      });
    }
    
    // Check if already connected
    const alreadyConnected = await Connection.areConnected(req.userId, targetId);
    if (alreadyConnected) {
      return res.status(400).json({
        message: 'You are already connected to this user'
      });
    }
    
    // Get mutual connections who can make introductions
    const mutualConnections = await Connection.getMutualConnections(req.userId, targetId);
    
    // Filter out users who have recent introduction requests
    const recentRequests = await IntroductionRequest.find({
      requester: req.userId,
      target: targetId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).select('introducer');
    
    const recentIntroducerIds = recentRequests.map(req => req.introducer.toString());
    
    const availableIntroducers = mutualConnections.filter(
      connection => !recentIntroducerIds.includes(connection._id.toString())
    );
    
    res.json({
      possibleIntroducers: availableIntroducers,
      count: availableIntroducers.length
    });
    
  } catch (error) {
    console.error('Get possible introducers error:', error);
    res.status(500).json({
      message: 'Server error fetching possible introducers'
    });
  }
});

// Cancel introduction request (as requester)
router.delete('/:requestId', auth, async (req, res) => {
  try {
    const introRequest = await IntroductionRequest.findById(req.params.requestId);
    
    if (!introRequest) {
      return res.status(404).json({
        message: 'Introduction request not found'
      });
    }
    
    // Check if user is the requester
    if (introRequest.requester.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Unauthorized to cancel this introduction request'
      });
    }
    
    if (introRequest.status !== 'pending') {
      return res.status(400).json({
        message: 'Can only cancel pending introduction requests'
      });
    }
    
    introRequest.status = 'cancelled';
    await introRequest.save();
    
    res.json({
      message: 'Introduction request cancelled successfully'
    });
    
  } catch (error) {
    console.error('Cancel introduction request error:', error);
    res.status(500).json({
      message: 'Server error cancelling introduction request'
    });
  }
});

// Mark introduction as completed (when users actually connect)
router.put('/:requestId/complete', auth, async (req, res) => {
  try {
    const { targetResponse, targetMessage } = req.body;
    
    const introRequest = await IntroductionRequest.findById(req.params.requestId);
    
    if (!introRequest) {
      return res.status(404).json({
        message: 'Introduction request not found'
      });
    }
    
    // Check if user is the target
    if (introRequest.target.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Unauthorized to complete this introduction'
      });
    }
    
    if (introRequest.status !== 'completed') {
      return res.status(400).json({
        message: 'Introduction must be completed by introducer first'
      });
    }
    
    // Update target response
    introRequest.targetResponse = {
      accepted: targetResponse === 'accept',
      message: targetMessage || '',
      respondedAt: new Date()
    };
    
    await introRequest.save();
    
    res.json({
      message: 'Introduction response recorded successfully',
      introductionRequest: introRequest
    });
    
  } catch (error) {
    console.error('Complete introduction error:', error);
    res.status(500).json({
      message: 'Server error completing introduction'
    });
  }
});

// Get introduction analytics
router.get('/analytics/stats', auth, async (req, res) => {
  try {
    const stats = await Promise.all([
      // Requests sent by user
      IntroductionRequest.countDocuments({ requester: req.userId }),
      
      // Requests received by user (as introducer)
      IntroductionRequest.countDocuments({ introducer: req.userId }),
      
      // Pending requests as introducer
      IntroductionRequest.countDocuments({ 
        introducer: req.userId, 
        status: 'pending' 
      }),
      
      // Successful introductions made
      IntroductionRequest.countDocuments({ 
        introducer: req.userId, 
        status: 'completed' 
      }),
      
      // Introduction requests by status
      IntroductionRequest.aggregate([
        {
          $match: {
            $or: [
              { requester: mongoose.Types.ObjectId(req.userId) },
              { introducer: mongoose.Types.ObjectId(req.userId) }
            ]
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    res.json({
      requestsSent: stats[0],
      requestsReceived: stats[1],
      pendingRequests: stats[2],
      successfulIntroductions: stats[3],
      requestsByStatus: stats[4]
    });
    
  } catch (error) {
    console.error('Get introduction analytics error:', error);
    res.status(500).json({
      message: 'Server error fetching introduction analytics'
    });
  }
});

module.exports = router;