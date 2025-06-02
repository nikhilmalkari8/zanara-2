const express = require('express');
const Opportunity = require('../models/Opportunity');
const Company = require('../models/Company');
const ModelProfile = require('../models/ModelProfile');
const User = require('../models/User');
const ActivityService = require('../services/activityService');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new opportunity
router.post('/create', auth, async (req, res) => {
  try {
    // Check if user has a company profile
    const company = await Company.findOne({
      $or: [
        { owner: req.userId },
        { admins: req.userId }
      ]
    });

    if (!company) {
      return res.status(400).json({
        message: 'You must have a company profile to create opportunities'
      });
    }

    // Create opportunity
    const opportunityData = {
      ...req.body,
      company: company._id,
      createdBy: req.userId
    };

    const opportunity = new Opportunity(opportunityData);
    await opportunity.save();

    // Update company stats
    company.stats.jobsPosted = (company.stats.jobsPosted || 0) + 1;
    await company.save();

    // Create activity for opportunity posting
    await ActivityService.createOpportunityActivity(
      opportunity._id,
      req.userId,
      {
        type: opportunity.type,
        title: opportunity.title,
        location: opportunity.location,
        compensation: opportunity.compensation
      }
    );

    res.status(201).json({
      message: 'Opportunity created successfully',
      opportunity
    });

  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({
      message: 'Server error creating opportunity',
      error: error.message
    });
  }
});

// Get all opportunities (public browsing)
router.get('/browse', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      location,
      compensation,
      sort = 'newest',
      search
    } = req.query;

    // Build query
    let query = { 
      status: 'published',
      applicationDeadline: { $gte: new Date() },
      'settings.isPublic': true
    };

    // Filters
    if (type && type !== 'all') {
      query.type = type;
    }

    if (location && location !== 'all') {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') }
      ];
    }

    if (compensation && compensation !== 'all') {
      query['compensation.type'] = compensation;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'deadline':
        sortOptions = { applicationDeadline: 1 };
        break;
      case 'title':
        sortOptions = { title: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Execute query
    const opportunities = await Opportunity.find(query)
      .populate('company', 'companyName logo address.city address.country')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-applications -companyNotes');

    // Add application count to each opportunity
    const opportunitiesWithCount = opportunities.map(opp => {
      const oppObj = opp.toObject();
      oppObj.applicationCount = opp.applications ? opp.applications.length : 0;
      return oppObj;
    });

    const total = await Opportunity.countDocuments(query);

    res.json({
      opportunities: opportunitiesWithCount,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasMore: page * limit < total
    });

  } catch (error) {
    console.error('Browse opportunities error:', error);
    res.status(500).json({
      message: 'Server error fetching opportunities'
    });
  }
});

// Get single opportunity details
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('company', 'companyName logo address description website socialMedia foundedYear companySize owner admins');

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      });
    }

    // Check if user can view this opportunity
    if (!opportunity.settings.isPublic) {
      if (!req.user) {
        return res.status(403).json({
          message: 'This opportunity is private'
        });
      }

      const company = await Company.findById(opportunity.company);
      if (!company.owner.equals(req.userId) && !company.admins.includes(req.userId)) {
        return res.status(403).json({
          message: 'You do not have permission to view this opportunity'
        });
      }
    }

    // Increment views
    opportunity.views = (opportunity.views || 0) + 1;
    await opportunity.save();

    // Prepare response data
    let responseData = opportunity.toObject();
    
    // Add application count
    responseData.applicationCount = opportunity.applications ? opportunity.applications.length : 0;

    // Handle application data based on user type and ownership
    if (!req.user) {
      // Public user - remove applications
      delete responseData.applications;
    } else {
      const company = await Company.findById(opportunity.company);
      const isOwner = company.owner.equals(req.userId) || company.admins.includes(req.userId);
      
      if (req.user.userType === 'hiring' && isOwner) {
        // Company owner/admin - keep all applications for management view
        // Applications will be fetched separately via /applications endpoint
        delete responseData.applications;
      } else if (req.user.userType === 'model') {
        // Model user - only show their own application status
        const userApplication = opportunity.applications.find(app => 
          app.applicant.toString() === req.userId
        );
        responseData.userApplication = userApplication || null;
        delete responseData.applications;
      } else {
        // Other users - remove applications
        delete responseData.applications;
      }
    }

    res.json(responseData);

  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({
      message: 'Server error fetching opportunity'
    });
  }
});

// Get company's opportunities
router.get('/company/mine', auth, async (req, res) => {
  try {
    const company = await Company.findOne({
      $or: [
        { owner: req.userId },
        { admins: req.userId }
      ]
    });

    if (!company) {
      return res.status(404).json({
        message: 'Company profile not found'
      });
    }

    const opportunities = await Opportunity.find({ company: company._id })
      .sort({ createdAt: -1 })
      .populate('company', 'companyName logo');

    // Add application count to each opportunity
    const opportunitiesWithCount = opportunities.map(opp => {
      const oppObj = opp.toObject();
      oppObj.applicationCount = opp.applications ? opp.applications.length : 0;
      return oppObj;
    });

    res.json(opportunitiesWithCount);

  } catch (error) {
    console.error('Get company opportunities error:', error);
    res.status(500).json({
      message: 'Server error fetching opportunities'
    });
  }
});

// Update opportunity
router.put('/:id', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      });
    }

    // Check ownership
    const company = await Company.findById(opportunity.company);
    if (!company || (!company.owner.equals(req.userId) && !company.admins.includes(req.userId))) {
      return res.status(403).json({
        message: 'Not authorized to update this opportunity'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== '_id' && key !== 'company' && key !== 'createdBy') {
        opportunity[key] = req.body[key];
      }
    });

    await opportunity.save();

    res.json({
      message: 'Opportunity updated successfully',
      opportunity
    });

  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({
      message: 'Server error updating opportunity'
    });
  }
});

// Delete opportunity
router.delete('/:id', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      });
    }

    // Check ownership
    const company = await Company.findById(opportunity.company);
    if (!company || (!company.owner.equals(req.userId) && !company.admins.includes(req.userId))) {
      return res.status(403).json({
        message: 'Not authorized to delete this opportunity'
      });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    // Update company stats
    company.stats.jobsPosted = Math.max(0, (company.stats.jobsPosted || 1) - 1);
    await company.save();

    res.json({
      message: 'Opportunity deleted successfully'
    });

  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({
      message: 'Server error deleting opportunity'
    });
  }
});

// Apply to opportunity
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      });
    }

    // Check if user has model profile
    const modelProfile = await ModelProfile.findOne({ userId: req.userId });
    if (!modelProfile) {
      return res.status(400).json({
        message: 'You must complete your model profile before applying to opportunities'
      });
    }

    // Check if can apply
    if (!opportunity.canUserApply(req.userId)) {
      return res.status(400).json({
        message: 'You cannot apply to this opportunity'
      });
    }

    // Create application
    const application = {
      applicant: req.userId,
      coverLetter: req.body.coverLetter || '',
      customAnswers: req.body.customAnswers || [],
      portfolioUrls: req.body.portfolioUrls || []
    };

    opportunity.applications.push(application);
    await opportunity.save();

    // Get company owner for notification
    const company = await Company.findById(opportunity.company);
    
    // Create activity for application
    await ActivityService.createApplicationActivity(
      req.userId,
      opportunity._id,
      company.owner
    );

    res.json({
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Apply to opportunity error:', error);
    res.status(500).json({
      message: 'Server error submitting application'
    });
  }
});

// Get applications for an opportunity (company owners only)
router.get('/:id/applications', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate({
        path: 'applications.applicant',
        select: 'firstName lastName email phoneNumber'
      });

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      });
    }

    // Check ownership
    const company = await Company.findById(opportunity.company);
    if (!company || (!company.owner.equals(req.userId) && !company.admins.includes(req.userId))) {
      return res.status(403).json({
        message: 'Not authorized to view applications'
      });
    }

    res.json({
      applications: opportunity.applications,
      totalApplications: opportunity.applications.length,
      opportunityTitle: opportunity.title
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      message: 'Server error fetching applications'
    });
  }
});

// Update application status
router.put('/:id/applications/:applicationId', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      });
    }

    // Check ownership
    const company = await Company.findById(opportunity.company);
    if (!company || (!company.owner.equals(req.userId) && !company.admins.includes(req.userId))) {
      return res.status(403).json({
        message: 'Not authorized to update applications'
      });
    }

    // Find application
    const application = opportunity.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({
        message: 'Application not found'
      });
    }

    // Update application
    if (req.body.status) application.status = req.body.status;
    if (req.body.companyNotes !== undefined) application.companyNotes = req.body.companyNotes;
    if (req.body.rating) application.rating = req.body.rating;

    // Update company stats if selected
    if (req.body.status === 'selected') {
      company.stats.hires = (company.stats.hires || 0) + 1;
      await company.save();
    }

    await opportunity.save();

    res.json({
      message: 'Application updated successfully',
      application
    });

  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      message: 'Server error updating application'
    });
  }
});

// Check user's application status
router.get('/:id/my-application', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      });
    }

    const application = opportunity.getApplicationByUser(req.userId);

    if (!application) {
      return res.json({
        hasApplied: false,
        canApply: opportunity.canUserApply(req.userId)
      });
    }

    res.json({
      hasApplied: true,
      canApply: false,
      application: {
        status: application.status,
        appliedAt: application.appliedAt,
        coverLetter: application.coverLetter
      }
    });

  } catch (error) {
    console.error('Check application status error:', error);
    res.status(500).json({
      message: 'Server error checking application status'
    });
  }
});

// Save/Unsave opportunity
router.post('/:id/save', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      });
    }

    const existingSave = opportunity.saves.find(save => 
      save.user.toString() === req.userId
    );

    if (existingSave) {
      // Unsave
      opportunity.saves = opportunity.saves.filter(save => 
        save.user.toString() !== req.userId
      );
      await opportunity.save();
      
      res.json({
        message: 'Opportunity removed from saved',
        saved: false
      });
    } else {
      // Save
      opportunity.saves.push({ user: req.userId });
      await opportunity.save();
      
      res.json({
        message: 'Opportunity saved successfully',
        saved: true
      });
    }

  } catch (error) {
    console.error('Save opportunity error:', error);
    res.status(500).json({
      message: 'Server error saving opportunity'
    });
  }
});

// Get user's saved opportunities
router.get('/saved/mine', auth, async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      'saves.user': req.userId,
      status: 'published'
    })
    .populate('company', 'companyName logo address.city address.country')
    .select('-applications')
    .sort({ 'saves.savedAt': -1 });

    // Add application count to each opportunity
    const opportunitiesWithCount = opportunities.map(opp => {
      const oppObj = opp.toObject();
      oppObj.applicationCount = opp.applications ? opp.applications.length : 0;
      return oppObj;
    });

    res.json(opportunitiesWithCount);

  } catch (error) {
    console.error('Get saved opportunities error:', error);
    res.status(500).json({
      message: 'Server error fetching saved opportunities'
    });
  }
});

module.exports = router;