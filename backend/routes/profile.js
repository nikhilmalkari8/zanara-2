const express = require('express');
const ModelProfile = require('../models/ModelProfile');
const auth = require('../middleware/auth');

const router = express.Router();

// Complete profile
router.post('/complete', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const profileData = req.body;

    // Check if profile already exists
    let profile = await ModelProfile.findOne({ userId });
    
    if (profile) {
      // Update existing profile
      profile = await ModelProfile.findOneAndUpdate(
        { userId },
        { ...profileData, isComplete: true },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = new ModelProfile({
        userId,
        ...profileData,
        isComplete: true
      });
      await profile.save();
    }

    res.status(201).json({
      message: 'Profile completed successfully',
      profile
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({
      message: 'Server error during profile completion',
      error: error.message
    });
  }
});

// Add this route to backend/routes/profile.js

// Browse models with filtering and pagination
// Browse models with filtering and pagination
router.get('/browse', auth, async (req, res) => {
    try {
      // Only allow hiring users to browse models
      if (req.user.userType !== 'hiring') {
        return res.status(403).json({
          message: 'Access denied. Only hiring users can browse models.'
        });
      }
  
      const {
        page = 1,
        limit = 20,
        search,
        gender,
        location,
        bodyType,
        hairColor,
        eyeColor,
        experience,
        availability,
        skills,
        ageMin,
        ageMax,
        heightMin,
        heightMax,
        sort = 'newest'
      } = req.query;
  
      // Build query
      let query = { isComplete: true };
  
      // Text search - search in user's name, skills, and specializations
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        
        // First get user IDs that match the name search
        const matchingUsers = await require('../models/User').find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex }
          ]
        }).select('_id');
        
        const matchingUserIds = matchingUsers.map(user => user._id);
        
        query.$or = [
          { userId: { $in: matchingUserIds } },
          { skills: searchRegex },
          { specializations: searchRegex },
          { preferredLocations: searchRegex }
        ];
      }
  
      // Gender filter
      if (gender && gender !== 'all') {
        query.gender = gender;
      }
  
      // Body type filter
      if (bodyType && bodyType !== 'all') {
        query.bodyType = bodyType;
      }
  
      // Hair color filter
      if (hairColor) {
        query.hairColor = { $regex: hairColor, $options: 'i' };
      }
  
      // Eye color filter
      if (eyeColor) {
        query.eyeColor = { $regex: eyeColor, $options: 'i' };
      }
  
      // Experience filter
      if (experience && experience !== 'all') {
        query.experience = { $regex: experience, $options: 'i' };
      }
  
      // Availability filter
      if (availability && availability !== 'all') {
        query.availability = availability;
      }
  
      // Skills filter
      if (skills) {
        const skillArray = skills.split(',').map(skill => skill.trim());
        query.skills = { $in: skillArray.map(skill => new RegExp(skill, 'i')) };
      }
  
      // Location filter
      if (location) {
        query.preferredLocations = { $regex: location, $options: 'i' };
      }
  
      console.log('Query:', JSON.stringify(query, null, 2)); // Debug log
  
      // Get all matching profiles first for age filtering
      let profiles = await ModelProfile.find(query)
        .populate('userId', 'firstName lastName email')
        .lean();
  
      console.log('Found profiles:', profiles.length); // Debug log
  
      // Age range filter (calculated from dateOfBirth)
      if (ageMin || ageMax) {
        const today = new Date();
        profiles = profiles.filter(profile => {
          if (!profile.dateOfBirth) return false;
          
          const birthDate = new Date(profile.dateOfBirth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
  
          let ageMatch = true;
          if (ageMin) ageMatch = ageMatch && age >= parseInt(ageMin);
          if (ageMax) ageMatch = ageMatch && age <= parseInt(ageMax);
          
          return ageMatch;
        });
      }
  
      // Height range filter
      if (heightMin || heightMax) {
        profiles = profiles.filter(profile => {
          if (!profile.height) return false;
          
          // Basic height comparison - you might want to improve this
          let heightMatch = true;
          if (heightMin) {
            heightMatch = heightMatch && profile.height.includes(heightMin.replace(/['"]/g, ''));
          }
          if (heightMax) {
            heightMatch = heightMatch && profile.height.includes(heightMax.replace(/['"]/g, ''));
          }
          
          return heightMatch;
        });
      }
  
      // Add additional data for frontend
      profiles = profiles.map(profile => ({
        ...profile,
        profileViews: Math.floor(Math.random() * 1000) + 50,
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 604800000)),
        completionPercentage: Math.floor(Math.random() * 40) + 60,
        location: profile.preferredLocations && profile.preferredLocations.length > 0 
          ? profile.preferredLocations[0] 
          : 'Location not specified'
      }));
  
      // Sorting
      switch (sort) {
        case 'newest':
          profiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'relevance':
          profiles.sort((a, b) => b.profileViews - a.profileViews);
          break;
        case 'experience':
          const experienceOrder = { 'professional': 4, 'experienced': 3, 'intermediate': 2, 'beginner': 1 };
          profiles.sort((a, b) => (experienceOrder[b.experience] || 0) - (experienceOrder[a.experience] || 0));
          break;
        case 'connections':
          profiles.sort((a, b) => b.profileViews - a.profileViews);
          break;
        default:
          profiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
  
      // Pagination
      const total = profiles.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedProfiles = profiles.slice(startIndex, endIndex);
  
      res.json({
        models: paginatedProfiles,
        totalPages,
        currentPage: parseInt(page),
        total,
        hasMore: endIndex < total
      });
  
    } catch (error) {
      console.error('Browse models error:', error);
      res.status(500).json({
        message: 'Server error while browsing models',
        error: error.message
      });
    }
  });

// Get profile
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await ModelProfile.findOne({ userId }).populate('userId', 'firstName lastName email');
    
    if (!profile) {
      return res.status(404).json({
        message: 'Profile not found'
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching profile'
    });
  }
});

// Get all profiles (for testing)
router.get('/all', async (req, res) => {
  try {
    const profiles = await ModelProfile.find({}).populate('userId', 'firstName lastName email');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});

module.exports = router;