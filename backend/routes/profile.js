const express = require('express');
const mongoose = require('mongoose');
const ModelProfile = require('../models/ModelProfile');
const User = require('../models/User');
const Connection = require('../models/Connection');
const ActivityService = require('../services/activityService');
const auth = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');
const router = express.Router();

// Complete profile
router.post('/complete', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const profileData = req.body;
    
    // Check if profile already exists
    let profile = await ModelProfile.findOne({ userId });
    let isNewProfile = !profile;
    
    if (profile) {
      // Update existing profile
      profile = await ModelProfile.findOneAndUpdate(
        { userId },
        { ...profileData, isComplete: true },
        { new: true, runValidators: true }
      );
      
      // Create activity for profile update
      await ActivityService.createProfileUpdateActivity(
        userId,
        'profile',
        { section: 'complete_profile', isUpdate: true }
      );
    } else {
      // Create new profile
      profile = new ModelProfile({
        userId,
        ...profileData,
        isComplete: true
      });
      await profile.save();
      
      // Create activity for new profile completion
      await ActivityService.createProfileUpdateActivity(
        userId,
        'profile',
        { section: 'complete_profile', isUpdate: false }
      );
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

// Update specific profile sections
router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const {
      fullName,
      headline,
      bio,
      location,
      email,
      phone,
      website,
      skills,
      experience,
      measurements,
      characteristics,
      socialMedia,
      dateOfBirth,
      gender,
      nationality,
      languages,
      height,
      weight,
      bodyType,
      hairColor,
      eyeColor,
      skinTone,
      specializations,
      achievements,
      preferredLocations,
      preferredTypes,
      availability,
      rate
    } = req.body;

    // Update User model (basic info)
    const userUpdateData = {};
    if (fullName) userUpdateData.fullName = fullName;
    if (email) userUpdateData.email = email;

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdateData);
    }

    // Handle experience: convert array of objects to string
    let processedExperience = experience;
    if (Array.isArray(experience)) {
      processedExperience = experience.map(exp => {
        if (typeof exp === 'object') {
          return `${exp.role || ''} at ${exp.company || ''} (${exp.duration || ''})`;
        }
        return exp;
      }).join('\n');
    }

    // Build profile update object
    const profileUpdateData = {
      headline,
      bio,
      location,
      phone,
      website,
      skills: Array.isArray(skills) ? skills : [],
      experience: processedExperience || '',
      measurements,
      characteristics,
      socialMedia,
      dateOfBirth,
      gender,
      nationality,
      languages: Array.isArray(languages) ? languages : [],
      height,
      weight,
      bodyType,
      hairColor,
      eyeColor,
      skinTone,
      specializations: Array.isArray(specializations) ? specializations : [],
      achievements: Array.isArray(achievements) ? achievements : [],
      preferredLocations: Array.isArray(preferredLocations) ? preferredLocations : [],
      preferredTypes: Array.isArray(preferredTypes) ? preferredTypes : [],
      availability,
      rate,
      updatedAt: new Date()
    };

    // Remove undefined fields
    Object.keys(profileUpdateData).forEach(key => {
      if (profileUpdateData[key] === undefined) {
        delete profileUpdateData[key];
      }
    });

    const updatedProfile = await ModelProfile.findOneAndUpdate(
      { userId },
      profileUpdateData,
      { new: true, upsert: true }
    );

    // Get updated user info
    const updatedUser = await User.findById(userId);

    // Get connections count
    const connectionsCount = await Connection.countDocuments({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });

    // Build complete profile response
    const completeProfile = {
      userId: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      headline: updatedProfile.headline,
      bio: updatedProfile.bio,
      location: updatedProfile.location,
      profilePicture: updatedProfile.profilePicture,
      coverPhoto: updatedProfile.coverPhoto,
      photos: updatedProfile.photos || [],
      experience: updatedProfile.experience || '',
      skills: updatedProfile.skills || [],
      dateOfBirth: updatedProfile.dateOfBirth,
      gender: updatedProfile.gender,
      nationality: updatedProfile.nationality,
      languages: updatedProfile.languages || [],
      height: updatedProfile.height,
      weight: updatedProfile.weight,
      bodyType: updatedProfile.bodyType,
      hairColor: updatedProfile.hairColor,
      eyeColor: updatedProfile.eyeColor,
      skinTone: updatedProfile.skinTone,
      specializations: updatedProfile.specializations || [],
      achievements: updatedProfile.achievements || [],
      preferredLocations: updatedProfile.preferredLocations || [],
      preferredTypes: updatedProfile.preferredTypes || [],
      availability: updatedProfile.availability,
      rate: updatedProfile.rate || {},
      measurements: updatedProfile.measurements,
      characteristics: updatedProfile.characteristics,
      socialMedia: updatedProfile.socialMedia,
      externalPortfolios: updatedProfile.externalPortfolios || [],
      connectionsCount,
      verified: updatedUser.verified || false,
      website: updatedProfile.website,
      phone: updatedProfile.phone,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedProfile.updatedAt
    };

    res.json(completeProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Server error during profile update',
      error: error.message
    });
  }
});

// GET /api/profile/model/:id - Get complete model profile
router.get('/model/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user basic info
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get model profile
    const modelProfile = await ModelProfile.findOne({ userId: id });
    if (!modelProfile) {
      return res.status(404).json({ message: 'Model profile not found' });
    }

    // Get connections count
    const connectionsCount = await Connection.countDocuments({
      $or: [
        { requester: id, status: 'accepted' },
        { recipient: id, status: 'accepted' }
      ]
    });

    // Build complete profile response
    const completeProfile = {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      headline: modelProfile.headline,
      bio: modelProfile.bio,
      location: modelProfile.location,
      profilePicture: modelProfile.profilePicture,
      coverPhoto: modelProfile.coverPhoto,
      photos: modelProfile.photos || [],
      experience: modelProfile.experience || '',
      skills: modelProfile.skills || [],
      dateOfBirth: modelProfile.dateOfBirth,
      gender: modelProfile.gender,
      nationality: modelProfile.nationality,
      languages: modelProfile.languages || [],
      height: modelProfile.height,
      weight: modelProfile.weight,
      bodyType: modelProfile.bodyType,
      hairColor: modelProfile.hairColor,
      eyeColor: modelProfile.eyeColor,
      skinTone: modelProfile.skinTone,
      specializations: modelProfile.specializations || [],
      achievements: modelProfile.achievements || [],
      preferredLocations: modelProfile.preferredLocations || [],
      preferredTypes: modelProfile.preferredTypes || [],
      availability: modelProfile.availability,
      rate: modelProfile.rate || {},
      measurements: modelProfile.measurements,
      characteristics: modelProfile.characteristics,
      socialMedia: modelProfile.socialMedia,
      externalPortfolios: modelProfile.externalPortfolios || [],
      connectionsCount,
      verified: user.verified || false,
      website: modelProfile.website,
      phone: modelProfile.phone,
      createdAt: user.createdAt,
      updatedAt: modelProfile.updatedAt
    };

    res.json(completeProfile);
  } catch (error) {
    console.error('Error fetching model profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/profile/my-complete - Get current user's complete profile
router.get('/my-complete', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const modelProfile = await ModelProfile.findOne({ userId: req.userId });
    
    if (!modelProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get connections count
    const connectionsCount = await Connection.countDocuments({
      $or: [
        { requester: req.userId, status: 'accepted' },
        { recipient: req.userId, status: 'accepted' }
      ]
    });

    // Build complete profile response
    const completeProfile = {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      headline: modelProfile.headline,
      bio: modelProfile.bio,
      location: modelProfile.location,
      profilePicture: modelProfile.profilePicture,
      coverPhoto: modelProfile.coverPhoto,
      photos: modelProfile.photos || [],
      experience: modelProfile.experience || '',
      skills: modelProfile.skills || [],
      dateOfBirth: modelProfile.dateOfBirth,
      gender: modelProfile.gender,
      nationality: modelProfile.nationality,
      languages: modelProfile.languages || [],
      height: modelProfile.height,
      weight: modelProfile.weight,
      bodyType: modelProfile.bodyType,
      hairColor: modelProfile.hairColor,
      eyeColor: modelProfile.eyeColor,
      skinTone: modelProfile.skinTone,
      specializations: modelProfile.specializations || [],
      achievements: modelProfile.achievements || [],
      preferredLocations: modelProfile.preferredLocations || [],
      preferredTypes: modelProfile.preferredTypes || [],
      availability: modelProfile.availability,
      rate: modelProfile.rate || {},
      measurements: modelProfile.measurements,
      characteristics: modelProfile.characteristics,
      socialMedia: modelProfile.socialMedia,
      externalPortfolios: modelProfile.externalPortfolios || [],
      connectionsCount,
      verified: user.verified || false,
      website: modelProfile.website,
      phone: modelProfile.phone,
      createdAt: user.createdAt,
      updatedAt: modelProfile.updatedAt
    };

    res.json(completeProfile);
  } catch (error) {
    console.error('Error fetching complete profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile/picture - Upload profile picture (FIXED)
router.put('/picture', auth, uploadMiddleware.profilePicture, async (req, res) => {
  try {
    console.log('Profile picture upload request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No profile picture provided' 
      });
    }

    const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
    console.log('Profile picture URL:', profilePictureUrl);

    const modelProfile = await ModelProfile.findOneAndUpdate(
      { userId: req.userId },
      { 
        profilePicture: profilePictureUrl,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    console.log('Profile updated with picture:', modelProfile.profilePicture);

    res.json({ 
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: modelProfile.profilePicture
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating profile picture',
      error: error.message 
    });
  }
});

// PUT /api/profile/cover-photo - Update cover photo (FIXED)
router.put('/cover-photo', auth, uploadMiddleware.profilePicture, async (req, res) => {
  try {
    console.log('Cover photo upload request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No cover photo provided' 
      });
    }

    const coverPhotoUrl = `/uploads/profiles/${req.file.filename}`;
    console.log('Cover photo URL:', coverPhotoUrl);

    const modelProfile = await ModelProfile.findOneAndUpdate(
      { userId: req.userId },
      { 
        coverPhoto: coverPhotoUrl,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    console.log('Profile updated with cover photo:', modelProfile.coverPhoto);

    res.json({ 
      success: true,
      message: 'Cover photo updated successfully',
      coverPhoto: modelProfile.coverPhoto
    });
  } catch (error) {
    console.error('Error updating cover photo:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating cover photo',
      error: error.message 
    });
  }
});

// POST /api/profile/photos - Add portfolio photos (FIXED)
router.post('/photos', auth, uploadMiddleware.portfolioPhotos, async (req, res) => {
  try {
    console.log('Portfolio photos upload request received');
    console.log('Files:', req.files);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No photos provided' 
      });
    }

    const modelProfile = await ModelProfile.findOne({ userId: req.userId });
    if (!modelProfile) {
      return res.status(404).json({ 
        success: false,
        message: 'Profile not found' 
      });
    }

    // Check total photo limit
    const currentPhotoCount = modelProfile.photos ? modelProfile.photos.length : 0;
    if (currentPhotoCount + req.files.length > 20) {
      return res.status(400).json({ 
        success: false,
        message: `Photo limit exceeded. You can upload ${20 - currentPhotoCount} more photos.` 
      });
    }

    const newPhotos = req.files.map(file => `/uploads/portfolios/${file.filename}`);
    console.log('New photos:', newPhotos);

    // Add new photos to existing array
    modelProfile.photos = [...(modelProfile.photos || []), ...newPhotos];
    await modelProfile.save();

    console.log('Portfolio updated with photos. Total photos:', modelProfile.photos.length);

    res.json({ 
      success: true,
      message: 'Photos uploaded successfully',
      photos: newPhotos,
      totalPhotos: modelProfile.photos.length
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error uploading photos',
      error: error.message 
    });
  }
});

// DELETE /api/profile/photos/:photoId - Delete specific portfolio photo (FIXED)
router.delete('/photos/:photoId', auth, async (req, res) => {
  try {
    const { photoId } = req.params;
    console.log('Delete photo request for index:', photoId);
    
    const modelProfile = await ModelProfile.findOne({ userId: req.userId });
    if (!modelProfile) {
      return res.status(404).json({ 
        success: false,
        message: 'Profile not found' 
      });
    }

    const photoIndex = parseInt(photoId);
    if (photoIndex < 0 || photoIndex >= modelProfile.photos.length) {
      return res.status(404).json({ 
        success: false,
        message: 'Photo not found' 
      });
    }

    const photoToDelete = modelProfile.photos[photoIndex];
    console.log('Deleting photo:', photoToDelete);
    
    // Remove file from filesystem
    if (photoToDelete) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '..', photoToDelete);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('File deleted from filesystem:', filePath);
      }
    }

    // Remove photo from array
    modelProfile.photos.splice(photoIndex, 1);
    await modelProfile.save();

    console.log('Photo deleted. Remaining photos:', modelProfile.photos.length);

    res.json({ 
      success: true,
      message: 'Photo deleted successfully',
      photos: modelProfile.photos
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting photo',
      error: error.message 
    });
  }
});

// PUT /api/profile/photo-caption/:photoId - Update photo caption
router.put('/photo-caption/:photoId', auth, async (req, res) => {
  try {
    const { photoId } = req.params;
    const { caption } = req.body;
    
    const modelProfile = await ModelProfile.findOne({ userId: req.userId });
    if (!modelProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const photoIndex = parseInt(photoId);
    if (photoIndex < 0 || photoIndex >= modelProfile.photos.length) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Note: If you need captions, update schema to store objects instead of strings.
    // Currently, this route acknowledges update without storing caption.
    res.json({ 
      message: 'Photo caption updated successfully',
      photo: modelProfile.photos[photoIndex]
    });
  } catch (error) {
    console.error('Error updating photo caption:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile/external-portfolios - Update external portfolios
router.put('/external-portfolios', auth, async (req, res) => {
  try {
    const { externalPortfolios } = req.body;
    
    if (!Array.isArray(externalPortfolios)) {
      return res.status(400).json({ message: 'External portfolios must be an array' });
    }

    for (const portfolio of externalPortfolios) {
      if (!portfolio.title || !portfolio.url) {
        return res.status(400).json({ 
          message: 'Each portfolio must have a title and URL' 
        });
      }
      try {
        new URL(portfolio.url);
      } catch (error) {
        return res.status(400).json({ message: `Invalid URL: ${portfolio.url}` });
      }
    }

    const modelProfile = await ModelProfile.findOneAndUpdate(
      { userId: req.userId },
      { 
        externalPortfolios,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({ 
      message: 'External portfolios updated successfully',
      externalPortfolios: modelProfile.externalPortfolios
    });
  } catch (error) {
    console.error('Error updating external portfolios:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile/contact-info - Update contact information
router.put('/contact-info', auth, async (req, res) => {
  try {
    const { phone, website } = req.body;
    
    if (website && website.trim()) {
      try {
        new URL(website);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid website URL' });
      }
    }

    const modelProfile = await ModelProfile.findOneAndUpdate(
      { userId: req.userId },
      { 
        phone: phone || '',
        website: website || '',
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({ 
      message: 'Contact information updated successfully',
      phone: modelProfile.phone,
      website: modelProfile.website
    });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/profile/achievement - Add achievement
router.post('/achievement', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { achievement } = req.body;
    
    if (!achievement) {
      return res.status(400).json({
        message: 'Achievement data is required'
      });
    }
    
    const profile = await ModelProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        message: 'Profile not found'
      });
    }
    
    profile.achievements = profile.achievements || [];
    profile.achievements.push(achievement);
    await profile.save();
    
    await ActivityService.createAchievementActivity(userId, {
      type: achievement.type || 'general',
      name: achievement.name || achievement,
      description: achievement.description || `Added new achievement: ${achievement.name || achievement}`
    });
    
    res.json({
      message: 'Achievement added successfully',
      profile
    });
  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({
      message: 'Server error adding achievement',
      error: error.message
    });
  }
});

// PUT /api/profile/portfolio - Update portfolio
router.put('/portfolio', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { photos, videos, socialMedia } = req.body;
    
    const profile = await ModelProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        message: 'Profile not found'
      });
    }
    
    if (photos) profile.photos = photos;
    if (videos) profile.videos = videos;
    if (socialMedia) profile.socialMedia = { ...profile.socialMedia, ...socialMedia };
    
    await profile.save();
    
    await ActivityService.createProfileUpdateActivity(
      userId,
      'portfolio',
      {
        section: 'portfolio',
        updatedItems: {
          photos: photos ? photos.length : 0,
          videos: videos ? videos.length : 0,
          socialMedia: socialMedia ? Object.keys(socialMedia) : []
        }
      }
    );
    
    res.json({
      message: 'Portfolio updated successfully',
      profile
    });
  } catch (error) {
    console.error('Portfolio update error:', error);
    res.status(500).json({
      message: 'Server error updating portfolio',
      error: error.message
    });
  }
});

// GET /api/profile/browse - Browse models with filtering and pagination
router.get('/browse', auth, async (req, res) => {
  try {
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
    
    let query = { isComplete: true };
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const matchingUsers = await User.find({
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
    
    if (gender && gender !== 'all') {
      query.gender = gender;
    }
    if (bodyType && bodyType !== 'all') {
      query.bodyType = bodyType;
    }
    if (hairColor) {
      query.hairColor = { $regex: hairColor, $options: 'i' };
    }
    if (eyeColor) {
      query.eyeColor = { $regex: eyeColor, $options: 'i' };
    }
    if (experience && experience !== 'all') {
      query.experience = { $regex: experience, $options: 'i' };
    }
    if (availability && availability !== 'all') {
      query.availability = availability;
    }
    if (skills) {
      const skillArray = skills.split(',').map(skill => skill.trim());
      query.skills = { $in: skillArray.map(skill => new RegExp(skill, 'i')) };
    }
    if (location) {
      query.preferredLocations = { $regex: location, $options: 'i' };
    }
    
    // Fetch all matching profiles first for age and height filters
    let profiles = await ModelProfile.find(query)
      .populate('userId', 'firstName lastName email')
      .lean();
    
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
    
    if (heightMin || heightMax) {
      profiles = profiles.filter(profile => {
        if (!profile.height) return false;
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
    
    profiles = profiles.map(profile => ({
      ...profile,
      profileViews: Math.floor(Math.random() * 1000) + 50,
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 604800000)),
      completionPercentage: Math.floor(Math.random() * 40) + 60,
      location: profile.preferredLocations && profile.preferredLocations.length > 0
        ? profile.preferredLocations[0]
        : 'Location not specified'
    }));
    
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

// GET /api/profile/me - Get current user's profile
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

// GET /api/profile/all - Get all profiles (for testing)
router.get('/all', async (req, res) => {
  try {
    const profiles = await ModelProfile.find({}).populate('userId', 'firstName lastName email');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});

module.exports = router;
