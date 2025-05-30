const express = require('express');
const Company = require('../models/Company');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Create company profile
router.post('/create', auth, async (req, res) => {
  try {
    // Check if user already has a company
    const existingCompany = await Company.findOne({ owner: req.userId });
    if (existingCompany) {
      return res.status(400).json({
        message: 'User already has a company profile'
      });
    }

    // Create company with owner
    const companyData = {
      ...req.body,
      owner: req.userId,
      admins: [req.userId]
    };

    const company = new Company(companyData);
    await company.save();

    // Update user's userType to 'hiring' if not already
    await User.findByIdAndUpdate(req.userId, { userType: 'hiring' });

    res.status(201).json({
      message: 'Company profile created successfully',
      company
    });

  } catch (error) {
    console.error('Company creation error:', error);
    res.status(500).json({
      message: 'Server error during company creation',
      error: error.message
    });
  }
});

// Get company profile by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is ObjectId or slug
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };
    
    const company = await Company.findOne(query)
      .populate('owner', 'firstName lastName email')
      .populate('admins', 'firstName lastName email')
      .populate('team.userId', 'firstName lastName email');

    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    // Increment profile views (but not for owner/admins)
    if (req.userId && !company.owner._id.equals(req.userId) && 
        !company.admins.some(admin => admin._id.equals(req.userId))) {
      company.stats.profileViews += 1;
      await company.save();
    }

    res.json(company);
  } catch (error) {
    console.error('Company fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching company'
    });
  }
});

// Get current user's company
router.get('/me/profile', auth, async (req, res) => {
  try {
    const company = await Company.findOne({ 
      $or: [
        { owner: req.userId },
        { admins: req.userId }
      ]
    })
    .populate('owner', 'firstName lastName email')
    .populate('admins', 'firstName lastName email')
    .populate('team.userId', 'firstName lastName email');

    if (!company) {
      return res.status(404).json({
        message: 'Company profile not found'
      });
    }

    res.json(company);
  } catch (error) {
    console.error('Company fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching company profile'
    });
  }
});

// Update company profile
router.put('/update', auth, async (req, res) => {
  try {
    const company = await Company.findOne({
      $or: [
        { owner: req.userId },
        { admins: req.userId }
      ]
    });

    if (!company) {
      return res.status(404).json({
        message: 'Company not found or access denied'
      });
    }

    // Update company data
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        company[key] = req.body[key];
      }
    });

    await company.save();

    res.json({
      message: 'Company profile updated successfully',
      company
    });

  } catch (error) {
    console.error('Company update error:', error);
    res.status(500).json({
      message: 'Server error updating company',
      error: error.message
    });
  }
});

// Add team member
router.post('/team/add', auth, async (req, res) => {
  try {
    const company = await Company.findOne({
      $or: [
        { owner: req.userId },
        { admins: req.userId }
      ]
    });

    if (!company) {
      return res.status(404).json({
        message: 'Company not found or access denied'
      });
    }

    const { email, position, department, permissions } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found with this email'
      });
    }

    // Check if user is already in team
    const existingMember = company.team.find(member => 
      member.userId && member.userId.equals(user._id)
    );
    
    if (existingMember) {
      return res.status(400).json({
        message: 'User is already a team member'
      });
    }

    // Add team member
    company.team.push({
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      position,
      department,
      joinDate: new Date(),
      permissions: permissions || {}
    });

    await company.save();

    res.json({
      message: 'Team member added successfully',
      company
    });

  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      message: 'Server error adding team member',
      error: error.message
    });
  }
});

// Update team member
router.put('/team/:memberId', auth, async (req, res) => {
  try {
    const company = await Company.findOne({
      $or: [
        { owner: req.userId },
        { admins: req.userId }
      ]
    });

    if (!company) {
      return res.status(404).json({
        message: 'Company not found or access denied'
      });
    }

    const member = company.team.id(req.params.memberId);
    if (!member) {
      return res.status(404).json({
        message: 'Team member not found'
      });
    }

    // Update member data
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        member[key] = req.body[key];
      }
    });

    await company.save();

    res.json({
      message: 'Team member updated successfully',
      company
    });

  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({
      message: 'Server error updating team member',
      error: error.message
    });
  }
});

// Remove team member
router.delete('/team/:memberId', auth, async (req, res) => {
  try {
    const company = await Company.findOne({
      $or: [
        { owner: req.userId },
        { admins: req.userId }
      ]
    });

    if (!company) {
      return res.status(404).json({
        message: 'Company not found or access denied'
      });
    }

    company.team.pull({ _id: req.params.memberId });
    await company.save();

    res.json({
      message: 'Team member removed successfully'
    });

  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      message: 'Server error removing team member',
      error: error.message
    });
  }
});

// Add project to portfolio
router.post('/portfolio/project', auth, async (req, res) => {
  try {
    const company = await Company.findOne({
      $or: [
        { owner: req.userId },
        { admins: req.userId }
      ]
    });

    if (!company) {
      return res.status(404).json({
        message: 'Company not found or access denied'
      });
    }

    company.portfolio.projects.push(req.body);
    await company.save();

    res.json({
      message: 'Project added successfully',
      company
    });

  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({
      message: 'Server error adding project',
      error: error.message
    });
  }
});

// Search companies
router.get('/search', async (req, res) => {
  try {
    const {
      query,
      industry,
      companyType,
      location,
      size,
      page = 1,
      limit = 10,
      sortBy = 'createdAt'
    } = req.query;

    // Build search filters
    const filters = { status: 'active' };

    if (query) {
      filters.$text = { $search: query };
    }

    if (industry) {
      filters.industry = industry;
    }

    if (companyType) {
      filters.companyType = companyType;
    }

    if (location) {
      filters.$or = [
        { 'address.city': new RegExp(location, 'i') },
        { 'address.state': new RegExp(location, 'i') },
        { 'address.country': new RegExp(location, 'i') }
      ];
    }

    if (size) {
      filters.companySize = size;
    }

    // Execute search
    const companies = await Company.find(filters)
      .select('-verificationDocuments -team.permissions')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('owner', 'firstName lastName');

    const total = await Company.countDocuments(filters);

    res.json({
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Search companies error:', error);
    res.status(500).json({
      message: 'Server error searching companies',
      error: error.message
    });
  }
});

// Get company completion percentage
router.get('/me/completion', auth, async (req, res) => {
  try {
    const company = await Company.findOne({
      $or: [
        { owner: req.userId },
        { admins: req.userId }
      ]
    });

    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    const completionPercentage = company.getCompletionPercentage();

    res.json({
      completionPercentage,
      suggestions: getCompletionSuggestions(company)
    });

  } catch (error) {
    console.error('Get completion error:', error);
    res.status(500).json({
      message: 'Server error getting completion status',
      error: error.message
    });
  }
});

// Helper function for completion suggestions
function getCompletionSuggestions(company) {
  const suggestions = [];

  if (!company.logo) suggestions.push('Add company logo');
  if (!company.coverImage) suggestions.push('Add cover image');
  if (!company.website) suggestions.push('Add company website');
  if (!company.foundedYear) suggestions.push('Add founding year');
  if (!company.companySize) suggestions.push('Specify company size');
  if (!company.values || company.values.length === 0) suggestions.push('Add company values');
  if (!company.specializations || company.specializations.length === 0) suggestions.push('Add specializations');
  if (!company.team || company.team.length === 0) suggestions.push('Add team members');
  if (!company.portfolio.projects || company.portfolio.projects.length === 0) suggestions.push('Add portfolio projects');
  
  const socialCount = Object.values(company.socialMedia || {}).filter(Boolean).length;
  if (socialCount < 2) suggestions.push('Add social media profiles');

  return suggestions.slice(0, 5); // Return top 5 suggestions
}

// Get all companies (for testing/admin)
router.get('/all', async (req, res) => {
  try {
    const companies = await Company.find({})
      .select('companyName industry companyType address.city address.country createdAt')
      .populate('owner', 'firstName lastName email');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

module.exports = router;