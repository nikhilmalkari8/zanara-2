const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const auth = require('../middleware/auth');
const { 
  TechPack, 
  Fabric, 
  ColorPalette, 
  Pattern, 
  DesignProject,
  Moodboard
} = require('../models/DesignTool');
const externalAPIService = require('../services/externalAPIs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'design-tools');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|svg|ai|dxf|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// =============================================================================
// TECH PACKS ROUTES
// =============================================================================

// Get user's tech packs
router.get('/tech-packs', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, season } = req.query;
    const query = { owner: req.user.id };
    
    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { productType: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (season) query.season = season;
    
    const techPacks = await TechPack.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('owner', 'firstName lastName');
    
    const total = await TechPack.countDocuments(query);
    
    res.json({
      techPacks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching tech packs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single tech pack
router.get('/tech-packs/:id', auth, async (req, res) => {
  try {
    const techPack = await TechPack.findById(req.params.id)
      .populate('owner', 'firstName lastName')
      .populate('linkedJobs', 'title')
      .populate('linkedOpportunities', 'title');
    
    if (!techPack) {
      return res.status(404).json({ message: 'Tech pack not found' });
    }
    
    // Check if user has access
    if (techPack.owner._id.toString() !== req.user.id && !techPack.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ techPack });
  } catch (error) {
    console.error('Error fetching tech pack:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create tech pack
router.post('/tech-packs', auth, async (req, res) => {
  try {
    const techPackData = {
      ...req.body,
      owner: req.user.id,
      date: new Date().toISOString().split('T')[0]
    };
    
    const techPack = new TechPack(techPackData);
    await techPack.save();
    
    res.status(201).json({ 
      message: 'Tech pack created successfully',
      techPack 
    });
  } catch (error) {
    console.error('Error creating tech pack:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tech pack
router.put('/tech-packs/:id', auth, async (req, res) => {
  try {
    const techPack = await TechPack.findById(req.params.id);
    
    if (!techPack) {
      return res.status(404).json({ message: 'Tech pack not found' });
    }
    
    if (techPack.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update version number
    const currentVersion = parseFloat(techPack.version);
    req.body.version = (currentVersion + 0.1).toFixed(1);
    
    Object.assign(techPack, req.body);
    await techPack.save();
    
    res.json({ 
      message: 'Tech pack updated successfully',
      techPack 
    });
  } catch (error) {
    console.error('Error updating tech pack:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tech pack
router.delete('/tech-packs/:id', auth, async (req, res) => {
  try {
    const techPack = await TechPack.findById(req.params.id);
    
    if (!techPack) {
      return res.status(404).json({ message: 'Tech pack not found' });
    }
    
    if (techPack.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await TechPack.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Tech pack deleted successfully' });
  } catch (error) {
    console.error('Error deleting tech pack:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================================================
// FABRIC LIBRARY ROUTES
// =============================================================================

// Get fabrics with filtering
router.get('/fabrics', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      weight, 
      sustainability,
      priceRange,
      supplier,
      inStock
    } = req.query;
    
    const query = {};
    
    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { composition: { $regex: search, $options: 'i' } },
        { 'supplier.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') query.category = category;
    if (weight && weight !== 'all') query.weightCategory = weight;
    if (inStock !== undefined) query.inStock = inStock === 'true';
    if (supplier && supplier !== 'all') query['supplier.name'] = supplier;
    
    // Sustainability filter
    if (sustainability === 'sustainable') {
      query.$or = [
        { 'sustainability.isOrganic': true },
        { 'sustainability.isRecycled': true }
      ];
    }
    
    // Price range filter
    if (priceRange && priceRange !== 'all') {
      switch (priceRange) {
        case 'budget':
          query['pricing.pricePerMeter'] = { $lt: 15 };
          break;
        case 'mid':
          query['pricing.pricePerMeter'] = { $gte: 15, $lte: 25 };
          break;
        case 'premium':
          query['pricing.pricePerMeter'] = { $gt: 25 };
          break;
      }
    }
    
    const fabrics = await Fabric.find(query)
      .sort({ trending: -1, featured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Fabric.countDocuments(query);
    
    res.json({
      fabrics,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching fabrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single fabric
router.get('/fabrics/:id', auth, async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    
    if (!fabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }
    
    // Increment view count
    await fabric.incrementViews();
    
    res.json({ fabric });
  } catch (error) {
    console.error('Error fetching fabric:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle fabric favorite
router.post('/fabrics/:id/favorite', auth, async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    
    if (!fabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }
    
    await fabric.toggleFavorite(req.user.id);
    
    const isFavorite = fabric.favorites.includes(req.user.id);
    
    res.json({ 
      message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
      isFavorite 
    });
  } catch (error) {
    console.error('Error toggling fabric favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove fabric favorite
router.delete('/fabrics/:id/favorite', auth, async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    
    if (!fabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }
    
    await fabric.toggleFavorite(req.user.id);
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing fabric favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's favorite fabrics
router.get('/fabrics/favorites', auth, async (req, res) => {
  try {
    const fabrics = await Fabric.find({ 
      favorites: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json({ favorites: fabrics.map(f => f._id) });
  } catch (error) {
    console.error('Error fetching favorite fabrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================================================
// COLOR PALETTES ROUTES
// =============================================================================

// Get user's color palettes
router.get('/color-palettes', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12, search, season, harmony } = req.query;
    const query = { 
      $or: [
        { owner: req.user.id },
        { isPublic: true }
      ]
    };
    
    // Apply filters
    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { theme: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }
    
    if (season) query.season = season;
    if (harmony) query.harmony = harmony;
    
    const colorPalettes = await ColorPalette.find(query)
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('owner', 'firstName lastName');
    
    const total = await ColorPalette.countDocuments(query);
    
    res.json({
      colorPalettes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching color palettes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create color palette
router.post('/color-palettes', auth, async (req, res) => {
  try {
    const colorPalette = new ColorPalette({
      ...req.body,
      owner: req.user.id
    });
    
    await colorPalette.save();
    
    res.status(201).json({ 
      message: 'Color palette created successfully',
      colorPalette 
    });
  } catch (error) {
    console.error('Error creating color palette:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================================================
// PATTERNS ROUTES
// =============================================================================

// Get patterns
router.get('/patterns', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      category, 
      difficulty,
      isPublic 
    } = req.query;
    
    const query = {};
    
    // If not requesting public patterns, show user's patterns
    if (isPublic === 'true') {
      query.isPublic = true;
    } else {
      query.owner = req.user.id;
    }
    
    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    
    const patterns = await Pattern.find(query)
      .sort({ rating: -1, downloads: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('owner', 'firstName lastName');
    
    const total = await Pattern.countDocuments(query);
    
    res.json({
      patterns,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================================================
// DESIGN PROJECTS ROUTES
// =============================================================================

// Get user's design projects
router.get('/projects', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12, type, status, search } = req.query;
    const query = { 
      $or: [
        { owner: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    };
    
    // Apply filters
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }
    
    const projects = await DesignProject.find(query)
      .sort({ lastAccessedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('owner', 'firstName lastName')
      .populate('collaborators.user', 'firstName lastName');
    
    const total = await DesignProject.countDocuments(query);
    
    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching design projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent projects for design tools hub
router.get('/recent', auth, async (req, res) => {
  try {
    const recentProjects = await DesignProject.find({
      $or: [
        { owner: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    })
    .sort({ lastAccessedAt: -1 })
    .limit(5)
    .populate('owner', 'firstName lastName');
    
    res.json({ projects: recentProjects });
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get templates
router.get('/templates', auth, async (req, res) => {
  try {
    // This would typically fetch from a templates collection
    // For now, return mock templates
    const templates = [
      {
        id: 'dress-template',
        name: 'Dress Template',
        type: 'tech-pack',
        category: 'Womenswear',
        description: 'Professional dress tech pack template'
      },
      {
        id: 'shirt-template',
        name: 'Shirt Template',
        type: 'tech-pack',
        category: 'Menswear',
        description: 'Complete shirt tech pack template'
      }
    ];
    
    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create design project
router.post('/projects', auth, async (req, res) => {
  try {
    const project = new DesignProject({
      ...req.body,
      owner: req.user.id,
      lastAccessedAt: new Date()
    });
    
    await project.save();
    
    res.status(201).json({ 
      message: 'Design project created successfully',
      project 
    });
  } catch (error) {
    console.error('Error creating design project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update design project
router.put('/projects/:id', auth, async (req, res) => {
  try {
    const project = await DesignProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user has edit access
    const hasAccess = project.owner.toString() === req.user.id ||
      project.collaborators.some(c => 
        c.user.toString() === req.user.id && 
        ['editor', 'admin'].includes(c.role)
      );
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    Object.assign(project, req.body);
    project.lastAccessedAt = new Date();
    await project.save();
    
    res.json({ 
      message: 'Project updated successfully',
      project 
    });
  } catch (error) {
    console.error('Error updating design project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================================================
// FILE UPLOAD ROUTES
// =============================================================================

// Upload files for design tools
router.post('/upload', auth, upload.array('files', 10), async (req, res) => {
  try {
    const uploadedFiles = req.files.map(file => ({
      name: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/design-tools/${file.filename}`
    }));
    
    res.json({ 
      message: 'Files uploaded successfully',
      files: uploadedFiles 
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================================================
// ANALYTICS & STATISTICS ROUTES
// =============================================================================

// Get design tools statistics
router.get('/statistics', auth, async (req, res) => {
  try {
    const [
      techPacksCount,
      projectsCount,
      favoriteFabricsCount,
      colorPalettesCount
    ] = await Promise.all([
      TechPack.countDocuments({ owner: req.user.id }),
      DesignProject.countDocuments({ owner: req.user.id }),
      Fabric.countDocuments({ favorites: req.user.id }),
      ColorPalette.countDocuments({ owner: req.user.id })
    ]);
    
    res.json({
      techPacks: techPacksCount,
      projects: projectsCount,
      favoriteFabrics: favoriteFabricsCount,
      colorPalettes: colorPalettesCount
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// External API Integration Routes

// Search images for moodboards (Unsplash API)
router.get('/images/search', auth, async (req, res) => {
  try {
    const { query, page = 1, per_page = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await externalAPIService.searchImages(query, page, per_page);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: result.total
      }
    });
  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search images'
    });
  }
});

// Generate color palette (Color API)
router.post('/colors/generate-palette', auth, async (req, res) => {
  try {
    const { baseColor } = req.body;
    
    if (!baseColor) {
      return res.status(400).json({
        success: false,
        message: 'Base color is required'
      });
    }

    const result = await externalAPIService.generateColorPalette(baseColor);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Color palette generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate color palette'
    });
  }
});

// Get Google Fonts
router.get('/fonts', auth, async (req, res) => {
  try {
    const result = await externalAPIService.getGoogleFonts();
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Fonts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fonts'
    });
  }
});

// Moodboard Routes
router.post('/moodboards', auth, async (req, res) => {
  try {
    const moodboardData = {
      ...req.body,
      userId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const moodboard = new DesignProject(moodboardData);
    await moodboard.save();

    res.status(201).json({
      success: true,
      data: moodboard
    });
  } catch (error) {
    console.error('Moodboard creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create moodboard'
    });
  }
});

router.get('/moodboards', auth, async (req, res) => {
  try {
    const moodboards = await DesignProject.find({
      userId: req.user.id,
      type: 'moodboard'
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: moodboards
    });
  } catch (error) {
    console.error('Moodboards fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch moodboards'
    });
  }
});

// Color Palette Routes
router.post('/color-palettes', auth, async (req, res) => {
  try {
    const paletteData = {
      ...req.body,
      userId: req.user.id,
      type: 'color-palette',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const palette = new ColorPalette(paletteData);
    await palette.save();

    res.status(201).json({
      success: true,
      data: palette
    });
  } catch (error) {
    console.error('Color palette creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create color palette'
    });
  }
});

router.get('/color-palettes', auth, async (req, res) => {
  try {
    const palettes = await ColorPalette.find({
      userId: req.user.id
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: palettes
    });
  } catch (error) {
    console.error('Color palettes fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch color palettes'
    });
  }
});

module.exports = router; 