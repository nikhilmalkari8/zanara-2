const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const { uploadMiddleware, processUploadedFiles, deleteFile } = require('../middleware/upload');
const ActivityService = require('../services/activityService');

// GET /api/content - Get published content with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tags,
      author,
      search,
      sort = 'newest'
    } = req.query;

    let query = { status: 'published', visibility: 'public' };
    let sortOption = {};

    // Apply filters
    if (category && category !== 'all') {
      query.category = category;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray.map(tag => tag.toLowerCase().trim()) };
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply sorting
    switch (sort) {
      case 'oldest':
        sortOption = { publishedAt: 1 };
        break;
      case 'popular':
        sortOption = { 'engagement.views': -1, 'engagement.likes': -1 };
        break;
      case 'trending':
        // Recent content with high engagement
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - 7);
        query.publishedAt = { $gte: dateThreshold };
        sortOption = { 'engagement.views': -1, publishedAt: -1 };
        break;
      default: // newest
        sortOption = { publishedAt: -1 };
    }

    const content = await Content.find(query)
      .populate('author', 'firstName lastName userType')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Content.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasMore: parseInt(page) < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content'
    });
  }
});

// GET /api/content/my - Get current user's content
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    let query = { author: req.user.id };
    
    if (status !== 'all') {
      query.status = status;
    }

    const content = await Content.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Content.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasMore: parseInt(page) < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching user content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your content'
    });
  }
});

// GET /api/content/trending - Get trending content
router.get('/trending', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const content = await Content.getTrendingContent(parseInt(days));
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching trending content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending content'
    });
  }
});

// GET /api/content/:id - Get specific content by ID
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('author', 'firstName lastName userType')
      .populate('engagement.likes.user', 'firstName lastName')
      .populate('engagement.comments.user', 'firstName lastName');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if content is accessible
    if (content.status !== 'published' && content.visibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Content not accessible'
      });
    }

    // Increment view count
    content.engagement.views += 1;
    content.metadata.lastReadAt = new Date();
    await content.save();

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content'
    });
  }
});

// POST /api/content - Create new content
router.post('/', auth, uploadMiddleware.mixed, async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      tags,
      category,
      status = 'draft',
      visibility = 'public'
    } = req.body;

    // Process uploaded files
    let coverImage = null;
    let images = [];

    if (req.files) {
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        const file = req.files.coverImage[0];
        coverImage = {
          url: `uploads/${file.path.split('uploads/')[1]}`,
          alt: req.body.coverImageAlt || title,
          caption: req.body.coverImageCaption || ''
        };
      }

      if (req.files.contentImages && req.files.contentImages.length > 0) {
        images = req.files.contentImages.map((file, index) => ({
          url: `uploads/${file.path.split('uploads/')[1]}`,
          alt: req.body[`imageAlt${index}`] || `Image ${index + 1}`,
          caption: req.body[`imageCaption${index}`] || '',
          position: index
        }));
      }
    }

    const newContent = new Content({
      author: req.user.id,
      title,
      content,
      excerpt,
      coverImage,
      images,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
      category,
      status,
      visibility
    });

    await newContent.save();

    // Create activity if published
    if (status === 'published') {
      await ActivityService.createContentActivity(req.user.id, newContent._id, {
        title: newContent.title,
        category: newContent.category,
        type: 'content_published'
      });
    }

    await newContent.populate('author', 'firstName lastName userType');

    res.status(201).json({
      success: true,
      data: newContent,
      message: 'Content created successfully'
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content'
    });
  }
}, uploadMiddleware.handleUploadErrors);

// PUT /api/content/:id - Update content
router.put('/:id', auth, uploadMiddleware.mixed, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check ownership
    if (content.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this content'
      });
    }

    const {
      title,
      content: contentText,
      excerpt,
      tags,
      category,
      status,
      visibility
    } = req.body;

    // Update fields
    if (title) content.title = title;
    if (contentText) content.content = contentText;
    if (excerpt) content.excerpt = excerpt;
    if (tags) content.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (category) content.category = category;
    if (status) content.status = status;
    if (visibility) content.visibility = visibility;

    // Handle file uploads
    if (req.files) {
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        // Delete old cover image if exists
        if (content.coverImage && content.coverImage.url) {
          deleteFile(content.coverImage.url);
        }

        const file = req.files.coverImage[0];
        content.coverImage = {
          url: `uploads/${file.path.split('uploads/')[1]}`,
          alt: req.body.coverImageAlt || title,
          caption: req.body.coverImageCaption || ''
        };
      }

      if (req.files.contentImages && req.files.contentImages.length > 0) {
        // Add new images (could enhance to replace/update existing ones)
        const newImages = req.files.contentImages.map((file, index) => ({
          url: `uploads/${file.path.split('uploads/')[1]}`,
          alt: req.body[`imageAlt${index}`] || `Image ${index + 1}`,
          caption: req.body[`imageCaption${index}`] || '',
          position: content.images.length + index
        }));
        content.images = [...content.images, ...newImages];
      }
    }

    content.updatedAt = new Date();

    // If publishing for the first time, create activity
    const wasPublished = content.status === 'published';
    await content.save();

    if (!wasPublished && status === 'published') {
      await ActivityService.createContentActivity(req.user.id, content._id, {
        title: content.title,
        category: content.category,
        type: 'content_published'
      });
    }

    await content.populate('author', 'firstName lastName userType');

    res.json({
      success: true,
      data: content,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content'
    });
  }
}, uploadMiddleware.handleUploadErrors);

// DELETE /api/content/:id - Delete content
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check ownership
    if (content.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this content'
      });
    }

    // Delete associated files
    if (content.coverImage && content.coverImage.url) {
      deleteFile(content.coverImage.url);
    }

    content.images.forEach(image => {
      if (image.url) {
        deleteFile(image.url);
      }
    });

    await Content.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content'
    });
  }
});

// POST /api/content/:id/like - Like/unlike content
router.post('/:id/like', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const userId = req.user.id;
    const likeIndex = content.engagement.likes.findIndex(
      like => like.user.toString() === userId
    );

    if (likeIndex > -1) {
      // Unlike
      content.engagement.likes.splice(likeIndex, 1);
    } else {
      // Like
      content.engagement.likes.push({
        user: userId,
        likedAt: new Date()
      });

      // Create notification if not self-like
      if (content.author.toString() !== userId) {
        // This would be implemented in ActivityService
        await ActivityService.createContentEngagementActivity(userId, content._id, {
          type: 'content_liked',
          contentTitle: content.title,
          authorId: content.author
        });
      }
    }

    await content.save();

    res.json({
      success: true,
      data: {
        likeCount: content.engagement.likes.length,
        isLiked: likeIndex === -1
      },
      message: likeIndex > -1 ? 'Content unliked' : 'Content liked'
    });
  } catch (error) {
    console.error('Error liking content:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking content'
    });
  }
});

// POST /api/content/:id/comment - Add comment to content
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    content.engagement.comments.push({
      user: req.user.id,
      comment: comment.trim(),
      commentedAt: new Date()
    });

    await content.save();

    // Create notification if not self-comment
    if (content.author.toString() !== req.user.id) {
      await ActivityService.createContentEngagementActivity(req.user.id, content._id, {
        type: 'content_commented',
        contentTitle: content.title,
        authorId: content.author,
        comment: comment.trim()
      });
    }

    await content.populate('engagement.comments.user', 'firstName lastName');

    res.json({
      success: true,
      data: {
        comments: content.engagement.comments,
        commentCount: content.engagement.comments.length
      },
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
});

// GET /api/content/categories - Get available categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    { value: 'behind-the-scenes', label: 'Behind the Scenes', icon: '🎬' },
    { value: 'tips-advice', label: 'Tips & Advice', icon: '💡' },
    { value: 'industry-news', label: 'Industry News', icon: '📰' },
    { value: 'personal-story', label: 'Personal Story', icon: '📖' },
    { value: 'portfolio-showcase', label: 'Portfolio Showcase', icon: '🎨' },
    { value: 'career-advice', label: 'Career Advice', icon: '🚀' },
    { value: 'fashion-trends', label: 'Fashion Trends', icon: '👗' },
    { value: 'other', label: 'Other', icon: '📝' }
  ];

  res.json({
    success: true,
    data: categories
  });
});

module.exports = router;