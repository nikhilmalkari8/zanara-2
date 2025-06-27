const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Collaboration = require('../models/Collaboration');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/collaboration/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for fashion files
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and design files
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|ai|psd|sketch|fig|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype.includes('application/') || 
                     file.mimetype.includes('image/');

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type for collaboration'));
    }
  }
});

// Get all collaborations for user
router.get('/my-projects', auth, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    
    let query = {
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId }
      ]
    };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const collaborations = await Collaboration.find(query)
      .populate('owner', 'firstName lastName profilePicture')
      .populate('collaborators.user', 'firstName lastName profilePicture')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Collaboration.countDocuments(query);
    
    res.json({
      success: true,
      collaborations,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaborations'
    });
  }
});

// Create new collaboration project
router.post('/create', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      fashionMetadata,
      visibility = 'team',
      collaborators = []
    } = req.body;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and type are required'
      });
    }

    // Create collaboration
    const collaboration = new Collaboration({
      title,
      description,
      type,
      owner: req.userId,
      fashionMetadata,
      visibility,
      status: 'active'
    });

    // Add initial collaborators
    for (const collaboratorData of collaborators) {
      if (collaboratorData.userId !== req.userId) {
        await collaboration.addCollaborator(
          collaboratorData.userId,
          collaboratorData.role || 'contributor',
          req.userId
        );
      }
    }

    await collaboration.save();
    await collaboration.populate('owner', 'firstName lastName profilePicture');
    await collaboration.populate('collaborators.user', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      collaboration,
      message: 'Collaboration project created successfully'
    });
  } catch (error) {
    console.error('Error creating collaboration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create collaboration project'
    });
  }
});

// Get collaboration details
router.get('/:id', auth, async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id)
      .populate('owner', 'firstName lastName profilePicture')
      .populate('collaborators.user', 'firstName lastName profilePicture')
      .populate('tasks.assignedTo', 'firstName lastName profilePicture')
      .populate('tasks.createdBy', 'firstName lastName profilePicture')
      .populate('comments.user', 'firstName lastName profilePicture')
      .populate('files.uploadedBy', 'firstName lastName profilePicture');

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration project not found'
      });
    }

    // Check if user has access
    if (!collaboration.isCollaborator(req.userId) && collaboration.visibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get user permissions
    const permissions = collaboration.getUserPermissions(req.userId);

    // Increment view count
    collaboration.analytics.views += 1;
    await collaboration.save();

    res.json({
      success: true,
      collaboration,
      permissions
    });
  } catch (error) {
    console.error('Error fetching collaboration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration project'
    });
  }
});

// Update collaboration
router.put('/:id', auth, async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration project not found'
      });
    }

    const permissions = collaboration.getUserPermissions(req.userId);
    if (!permissions.canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'fashionMetadata', 'visibility', 
      'status', 'timeline', 'settings'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        collaboration[field] = req.body[field];
      }
    });

    await collaboration.recordActivity(req.userId);
    await collaboration.save();

    res.json({
      success: true,
      collaboration,
      message: 'Collaboration project updated successfully'
    });
  } catch (error) {
    console.error('Error updating collaboration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update collaboration project'
    });
  }
});

// Add collaborator
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const { userId, role = 'contributor' } = req.body;
    
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration project not found'
      });
    }

    const permissions = collaboration.getUserPermissions(req.userId);
    if (!permissions.canInvite) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await collaboration.addCollaborator(userId, role, req.userId);
    await collaboration.populate('collaborators.user', 'firstName lastName profilePicture');

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('collaboration_invite', {
        collaboration: {
          _id: collaboration._id,
          title: collaboration.title,
          type: collaboration.type
        },
        invitedBy: {
          _id: req.userId,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        }
      });
    }

    res.json({
      success: true,
      collaborators: collaboration.collaborators,
      message: 'Collaborator added successfully'
    });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add collaborator'
    });
  }
});

// Create task
router.post('/:id/tasks', auth, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration project not found'
      });
    }

    const permissions = collaboration.getUserPermissions(req.userId);
    if (!permissions.canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    const task = {
      title,
      description,
      assignedTo: assignedTo || [],
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.userId,
      status: 'todo'
    };

    collaboration.tasks.push(task);
    await collaboration.updateTaskCompletionRate();
    await collaboration.recordActivity(req.userId);

    await collaboration.populate('tasks.assignedTo', 'firstName lastName profilePicture');
    await collaboration.populate('tasks.createdBy', 'firstName lastName profilePicture');

    // Notify assigned users
    const io = req.app.get('io');
    if (io && assignedTo) {
      assignedTo.forEach(userId => {
        io.to(`user_${userId}`).emit('task_assigned', {
          collaboration: {
            _id: collaboration._id,
            title: collaboration.title
          },
          task: collaboration.tasks[collaboration.tasks.length - 1]
        });
      });
    }

    res.status(201).json({
      success: true,
      task: collaboration.tasks[collaboration.tasks.length - 1],
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
});

// Update task status
router.put('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const { status, title, description, assignedTo, priority, dueDate } = req.body;
    
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration project not found'
      });
    }

    const permissions = collaboration.getUserPermissions(req.userId);
    if (!permissions.canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    const task = collaboration.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update task fields
    if (status !== undefined) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      }
    }
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

    await collaboration.updateTaskCompletionRate();
    await collaboration.recordActivity(req.userId);

    res.json({
      success: true,
      task,
      completionPercentage: collaboration.completionPercentage,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
});

// Upload files to collaboration
router.post('/:id/files', auth, upload.array('files', 10), async (req, res) => {
  try {
    const { category = 'other', tags = '' } = req.body;
    
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration project not found'
      });
    }

    const permissions = collaboration.getUserPermissions(req.userId);
    if (!permissions.canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/collaboration/${file.filename}`,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      uploadedBy: req.userId
    }));

    collaboration.files.push(...uploadedFiles);
    await collaboration.recordActivity(req.userId);

    await collaboration.populate('files.uploadedBy', 'firstName lastName profilePicture');

    res.json({
      success: true,
      files: uploadedFiles,
      message: 'Files uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files'
    });
  }
});

// Add comment to collaboration
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content, mentions = [] } = req.body;
    
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration project not found'
      });
    }

    const permissions = collaboration.getUserPermissions(req.userId);
    if (!permissions.canComment) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    const comment = {
      user: req.userId,
      content,
      mentions: mentions || [],
      createdAt: new Date()
    };

    collaboration.comments.push(comment);
    await collaboration.recordActivity(req.userId);

    await collaboration.populate('comments.user', 'firstName lastName profilePicture');

    // Notify mentioned users
    const io = req.app.get('io');
    if (io && mentions.length > 0) {
      mentions.forEach(userId => {
        io.to(`user_${userId}`).emit('collaboration_mention', {
          collaboration: {
            _id: collaboration._id,
            title: collaboration.title
          },
          comment: collaboration.comments[collaboration.comments.length - 1]
        });
      });
    }

    res.status(201).json({
      success: true,
      comment: collaboration.comments[collaboration.comments.length - 1],
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

// Update moodboard
router.put('/:id/moodboard', auth, async (req, res) => {
  try {
    const { layout, backgroundColor, images, textElements, colorPalette } = req.body;
    
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration project not found'
      });
    }

    const permissions = collaboration.getUserPermissions(req.userId);
    if (!permissions.canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Update moodboard
    if (layout !== undefined) collaboration.moodboard.layout = layout;
    if (backgroundColor !== undefined) collaboration.moodboard.backgroundColor = backgroundColor;
    if (images !== undefined) collaboration.moodboard.images = images;
    if (textElements !== undefined) collaboration.moodboard.textElements = textElements;
    if (colorPalette !== undefined) collaboration.moodboard.colorPalette = colorPalette;

    await collaboration.recordActivity(req.userId);

    res.json({
      success: true,
      moodboard: collaboration.moodboard,
      message: 'Moodboard updated successfully'
    });
  } catch (error) {
    console.error('Error updating moodboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update moodboard'
    });
  }
});

// Request approval
router.post('/:id/approvals', auth, async (req, res) => {
  try {
    const { type, approvers, deadline, attachments } = req.body;
    
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration project not found'
      });
    }

    const permissions = collaboration.getUserPermissions(req.userId);
    if (!permissions.canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    const approval = {
      type,
      requestedBy: req.userId,
      approvers: approvers.map(userId => ({
        user: userId,
        status: 'pending'
      })),
      deadline: deadline ? new Date(deadline) : null,
      attachments: attachments || []
    };

    collaboration.approvals.push(approval);
    await collaboration.recordActivity(req.userId);

    // Notify approvers
    const io = req.app.get('io');
    if (io) {
      approvers.forEach(userId => {
        io.to(`user_${userId}`).emit('approval_request', {
          collaboration: {
            _id: collaboration._id,
            title: collaboration.title
          },
          approval: collaboration.approvals[collaboration.approvals.length - 1]
        });
      });
    }

    res.status(201).json({
      success: true,
      approval: collaboration.approvals[collaboration.approvals.length - 1],
      message: 'Approval request sent successfully'
    });
  } catch (error) {
    console.error('Error requesting approval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request approval'
    });
  }
});

// Respond to approval request
router.put('/:id/approvals/:approvalId/respond', auth, async (req, res) => {
  try {
    const { status, comment } = req.body;
    
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration project not found'
      });
    }

    const approval = collaboration.approvals.id(req.params.approvalId);
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    const approver = approval.approvers.find(a => a.user.toString() === req.userId);
    if (!approver) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this approval'
      });
    }

    // Update approver response
    approver.status = status;
    approver.comment = comment;
    approver.approvedAt = new Date();

    // Check if all approvers have responded
    const allResponded = approval.approvers.every(a => a.status !== 'pending');
    const allApproved = approval.approvers.every(a => a.status === 'approved');
    
    if (allResponded) {
      approval.status = allApproved ? 'approved' : 'rejected';
    }

    await collaboration.save();

    // Notify requester
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${approval.requestedBy}`).emit('approval_response', {
        collaboration: {
          _id: collaboration._id,
          title: collaboration.title
        },
        approval,
        responder: {
          _id: req.userId,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        }
      });
    }

    res.json({
      success: true,
      approval,
      message: 'Approval response submitted successfully'
    });
  } catch (error) {
    console.error('Error responding to approval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to approval'
    });
  }
});

// Get collaboration statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = {
      totalProjects: await Collaboration.countDocuments({
        $or: [
          { owner: req.userId },
          { 'collaborators.user': req.userId }
        ]
      }),
      activeProjects: await Collaboration.countDocuments({
        $or: [
          { owner: req.userId },
          { 'collaborators.user': req.userId }
        ],
        status: 'active'
      }),
      completedProjects: await Collaboration.countDocuments({
        $or: [
          { owner: req.userId },
          { 'collaborators.user': req.userId }
        ],
        status: 'completed'
      }),
      ownedProjects: await Collaboration.countDocuments({
        owner: req.userId
      })
    };

    // Get project breakdown by type
    const typeBreakdown = await Collaboration.aggregate([
      {
        $match: {
          $or: [
            { owner: req.userId },
            { 'collaborators.user': req.userId }
          ]
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    stats.byType = typeBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching collaboration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration statistics'
    });
  }
});

module.exports = router; 