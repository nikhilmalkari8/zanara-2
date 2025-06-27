const express = require('express');
const mongoose = require('mongoose');
const ModelProfile = require('../models/ModelProfile');
const User = require('../models/User');
const Connection = require('../models/Connection');
const ProfileView = require('../models/ProfileView');
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
    const viewerId = req.userId;
    
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

    // Track profile view (don't wait for it to complete)
    if (viewerId !== id) {
      ProfileView.recordView(viewerId, id, {
        viewType: 'profile',
        source: req.get('referer') ? 'browse-talent' : 'direct-link',
        userAgent: req.get('User-Agent')
      }).catch(err => {
        console.error('Error recording profile view:', err);
      });
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
// UPDATED: Removed permission restriction - allows both talent and hiring users
// Replace ONLY the browse endpoint in routes/profile.js with this:

// Replace the entire browse endpoint in routes/profile.js with this:

router.get('/browse', auth, async (req, res) => {
    try {
      // Get user data using userId from auth middleware
      const userData = await User.findById(req.userId).select('userType professionalType firstName lastName');
      
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      console.log('Browse request from user:', userData.userType, userData.professionalType);
      
      const {
        page = 1,
        limit = 20,
        search,
        location,
        experience,
        availability,
        skills,
        sort = 'newest',
        professionalTypes, // New parameter for professional types
        // Model-specific filters
        gender,
        bodyType,
        hairColor,
        eyeColor,
        ageMin,
        ageMax,
        heightMin,
        heightMax
      } = req.query;
      
      // Import all profile models
      const ModelProfile = require('../models/ModelProfile');
      const PhotographerProfile = require('../models/PhotographerProfile');
      const FashionDesignerProfile = require('../models/FashionDesignerProfile');
      const StylistProfile = require('../models/StylistProfile');
      const MakeupArtistProfile = require('../models/MakeupArtistProfile');
      
      // Determine which professional types to search
      const typesToSearch = professionalTypes 
        ? professionalTypes.split(',').map(type => type.trim())
        : ['model']; // Default to models if not specified
      
      console.log('Searching professional types:', typesToSearch);
      
      let allProfiles = [];
      const breakdown = {};
      
      // Search each professional type
      for (const profType of typesToSearch) {
        try {
          let ProfileModel;
          
          // Map professional type to model
          switch (profType) {
            case 'model':
              ProfileModel = ModelProfile;
              break;
            case 'photographer':
              ProfileModel = PhotographerProfile;
              break;
            case 'fashion-designer':
              ProfileModel = FashionDesignerProfile;
              break;
            case 'stylist':
              ProfileModel = StylistProfile;
              break;
            case 'makeup-artist':
              ProfileModel = MakeupArtistProfile;
              break;
            default:
              console.log(`Unknown professional type: ${profType}`);
              continue;
          }
          
          let query = { isComplete: true };
          
          // Build search query for this profile type
          if (search) {
            const searchRegex = new RegExp(search, 'i');
            
            // Find matching users of this professional type
            const matchingUsers = await User.find({
              professionalType: profType,
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
              { specializations: searchRegex }
            ];
            
            // Add profession-specific search fields
            if (['photographer', 'fashion-designer', 'stylist', 'makeup-artist'].includes(profType)) {
              query.$or.push({ location: searchRegex });
            } else if (profType === 'model') {
              query.$or.push({ preferredLocations: searchRegex });
            }
          }
          
          // Apply universal filters
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
            if (profType === 'model') {
              query.preferredLocations = { $regex: location, $options: 'i' };
            } else {
              query.location = { $regex: location, $options: 'i' };
            }
          }
          
          // Apply model-specific filters only if searching models
          if (profType === 'model') {
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
          }
          
          console.log(`Query for ${profType}:`, JSON.stringify(query, null, 2));
          
          // Fetch profiles for this professional type
          const profiles = await ProfileModel.find(query)
            .populate('userId', 'firstName lastName email professionalType')
            .lean();
          
          console.log(`Found ${profiles.length} ${profType} profiles`);
          
          // Add professional type info to each profile
          const profilesWithType = profiles.map(profile => ({
            ...profile,
            professionalType: profType,
            displayName: profType.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
          }));
          
          allProfiles.push(...profilesWithType);
          breakdown[profType] = profiles.length;
          
        } catch (error) {
          console.error(`Error searching ${profType} profiles:`, error);
          // Continue with other profile types
          breakdown[profType] = 0;
        }
      }
      
      console.log('Total profiles found across all types:', allProfiles.length);
      console.log('Breakdown by type:', breakdown);
      
      // Apply age filter (mainly for models)
      if ((ageMin || ageMax) && typesToSearch.includes('model')) {
        const today = new Date();
        allProfiles = allProfiles.filter(profile => {
          // Only apply age filter to models
          if (profile.professionalType !== 'model' || !profile.dateOfBirth) {
            return true;
          }
          
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
      
      // Apply height filter (mainly for models)
      if ((heightMin || heightMax) && typesToSearch.includes('model')) {
        allProfiles = allProfiles.filter(profile => {
          // Only apply height filter to models
          if (profile.professionalType !== 'model' || !profile.height) {
            return true;
          }
          
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
      
      // Add computed display fields
      allProfiles = allProfiles.map(profile => ({
        ...profile,
        profileViews: Math.floor(Math.random() * 1000) + 50,
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 604800000)),
        completionPercentage: Math.floor(Math.random() * 40) + 60,
        location: profile.preferredLocations && profile.preferredLocations.length > 0
          ? profile.preferredLocations[0]
          : profile.location || 'Location not specified'
      }));
      
      // Sort profiles
      switch (sort) {
        case 'newest':
          allProfiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'relevance':
          allProfiles.sort((a, b) => b.profileViews - a.profileViews);
          break;
        case 'experience':
          const experienceOrder = { 'professional': 4, 'experienced': 3, 'intermediate': 2, 'beginner': 1 };
          allProfiles.sort((a, b) => (experienceOrder[b.experience] || 0) - (experienceOrder[a.experience] || 0));
          break;
        case 'professional-type':
          allProfiles.sort((a, b) => a.professionalType.localeCompare(b.professionalType));
          break;
        default:
          allProfiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      // Paginate results
      const total = allProfiles.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedProfiles = allProfiles.slice(startIndex, endIndex);
      
      console.log('Returning profiles:', paginatedProfiles.length, 'of', total);
      
      // Return results
      res.json({
        models: paginatedProfiles, // Keep same key for frontend compatibility
        totalPages,
        currentPage: parseInt(page),
        total,
        hasMore: endIndex < total,
        breakdown, // Breakdown by professional type
        searchedTypes: typesToSearch, // Which types were searched
        searchContext: {
          searcherType: userData.userType,
          searcherProfession: userData.professionalType,
          canContact: true,
          canInviteToProjects: userData.userType === 'hiring'
        }
      });
    } catch (error) {
      console.error('Browse profiles error:', error);
      res.status(500).json({
        message: 'Server error while browsing profiles',
        error: error.message
    });
  }
});

// GET /api/prof le/me - Get current user's profile
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

// GET /api/profile/viewers - Get profile viewers
router.get('/viewers', auth, async (req, res) => {
  try {
    const { period = '7d', type = 'all', page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    
    // Calculate date range
    const now = new Date();
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now - daysBack * 24 * 60 * 60 * 1000);

    // Build query
    let query = {
      profileOwner: userId,
      viewedAt: { $gte: startDate }
    };

    // Filter by viewer type
    if (type === 'identified') {
      query.isAnonymous = false;
    } else if (type === 'anonymous') {
      query.isAnonymous = true;
    }

    // Get viewers with pagination
    const skip = (page - 1) * limit;
    const viewers = await ProfileView.find(query)
      .populate('viewer', 'firstName lastName professionalType profilePicture location headline isVerified')
      .sort({ viewedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Process viewers data
    const processedViewers = viewers.map(view => {
      if (view.isAnonymous || !view.viewer) {
        return {
          isAnonymous: true,
          professionalType: view.anonymousData?.professionalType,
          location: view.anonymousData?.location,
          viewedAt: view.viewedAt,
          viewCount: view.viewCount,
          connectionStrength: 0
        };
      }

      return {
        ...view.viewer.toObject(),
        isAnonymous: false,
        viewedAt: view.viewedAt,
        viewCount: view.viewCount,
        connectionStrength: view.connectionStrength || 0,
        isOnline: view.viewer.lastActive && (Date.now() - view.viewer.lastActive) < 15 * 60 * 1000 // 15 minutes
      };
    });

    const totalViewers = await ProfileView.countDocuments(query);

    res.json({
      viewers: processedViewers,
      totalViewers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalViewers / limit)
    });
  } catch (error) {
    console.error('Error fetching profile viewers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/profile/analytics - Get profile analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const userId = req.userId;
    
    let dateFilter = {};
    let previousDateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        previousDateFilter = { 
          createdAt: { 
            $gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            $lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        previousDateFilter = { 
          createdAt: { 
            $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
            $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        previousDateFilter = { 
          createdAt: { 
            $gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
            $lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          }
        };
        break;
    }
    
    const Activity = require('../models/Activity');
    
    // Get current period stats
    const currentStats = await Activity.aggregate([
      {
        $match: {
          type: 'profile_view',
          'relatedObjects.user': new require('mongoose').Types.ObjectId(userId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 },
          uniqueViewers: { $addToSet: '$actor' }
        }
      }
    ]);
    
    // Get previous period stats for comparison
    const previousStats = await Activity.aggregate([
      {
        $match: {
          type: 'profile_view',
          'relatedObjects.user': new require('mongoose').Types.ObjectId(userId),
          ...previousDateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 },
          uniqueViewers: { $addToSet: '$actor' }
        }
      }
    ]);
    
    // Get top viewer types
    const topViewerTypes = await Activity.aggregate([
      {
        $match: {
          type: 'profile_view',
          'relatedObjects.user': new require('mongoose').Types.ObjectId(userId),
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'actor',
          foreignField: '_id',
          as: 'actorData'
        }
      },
      {
        $unwind: '$actorData'
      },
      {
        $group: {
          _id: '$actorData.professionalType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    const current = currentStats[0] || { totalViews: 0, uniqueViewers: [] };
    const previous = previousStats[0] || { totalViews: 0, uniqueViewers: [] };
    
    // Calculate percentage changes
    const viewsChange = previous.totalViews > 0 
      ? Math.round(((current.totalViews - previous.totalViews) / previous.totalViews) * 100)
      : current.totalViews > 0 ? 100 : 0;
      
    const viewersChange = previous.uniqueViewers.length > 0 
      ? Math.round(((current.uniqueViewers.length - previous.uniqueViewers.length) / previous.uniqueViewers.length) * 100)
      : current.uniqueViewers.length > 0 ? 100 : 0;
    
    // Map professional types to display labels
    const typeLabels = {
      'fashion-designer': 'Fashion Designers',
      'stylist': 'Stylists',
      'photographer': 'Photographers',
      'makeup-artist': 'Makeup Artists',
      'model': 'Models',
      'brand': 'Brands',
      'agency': 'Agencies',
      'fashion-student': 'Students'
    };
    
    const formattedViewerTypes = topViewerTypes.map(type => ({
      professionalType: type._id,
      label: typeLabels[type._id] || type._id,
      count: type.count
    }));
    
    res.json({
      success: true,
      totalViews: current.totalViews,
      uniqueViewers: current.uniqueViewers.length,
      viewsChange,
      viewersChange,
      searchAppearances: Math.floor(Math.random() * 50) + 10, // Mock data
      topViewerTypes: formattedViewerTypes
    });
    
  } catch (error) {
    console.error('Get profile analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile analytics',
      error: error.message
    });
  }
});

// Get comprehensive viewer analytics
router.get('/viewer-analytics', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const userId = req.user._id;
    
    // Calculate date ranges
    const now = new Date();
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const currentPeriodStart = new Date(now - daysBack * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(currentPeriodStart - daysBack * 24 * 60 * 60 * 1000);

    // Get current period views
    const currentViews = await ProfileView.find({
      profileOwner: userId,
      viewedAt: { $gte: currentPeriodStart }
    }).populate('viewer', 'professionalType location');

    // Get previous period views for comparison
    const previousViews = await ProfileView.find({
      profileOwner: userId,
      viewedAt: { $gte: previousPeriodStart, $lt: currentPeriodStart }
    });

    // Calculate basic metrics
    const totalViews = currentViews.length;
    const uniqueViewers = new Set(currentViews.map(v => v.viewer?._id?.toString() || 'anonymous')).size;
    const returnViewers = currentViews.filter(v => v.viewCount > 1).length;
    const avgDailyViews = Math.round(totalViews / daysBack);

    // Calculate trends (comparison with previous period)
    const previousTotalViews = previousViews.length;
    const previousUniqueViewers = new Set(previousViews.map(v => v.viewer?._id?.toString() || 'anonymous')).size;
    const previousAvgDaily = Math.round(previousTotalViews / daysBack);

    const trends = {
      totalViews: previousTotalViews > 0 ? Math.round(((totalViews - previousTotalViews) / previousTotalViews) * 100) : 0,
      uniqueViewers: previousUniqueViewers > 0 ? Math.round(((uniqueViewers - previousUniqueViewers) / previousUniqueViewers) * 100) : 0,
      avgDailyViews: previousAvgDaily > 0 ? Math.round(((avgDailyViews - previousAvgDaily) / previousAvgDaily) * 100) : 0
    };

    // Analyze viewer types
    const viewerTypes = {};
    currentViews.forEach(view => {
      if (view.isAnonymous) {
        const type = view.anonymousData?.professionalType || 'unknown';
        viewerTypes[type] = (viewerTypes[type] || 0) + 1;
      } else if (view.viewer?.professionalType) {
        const type = view.viewer.professionalType;
        viewerTypes[type] = (viewerTypes[type] || 0) + 1;
      }
    });

    const viewerTypesArray = Object.entries(viewerTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Analyze geographic distribution
    const locations = {};
    currentViews.forEach(view => {
      let location = 'Unknown';
      if (view.isAnonymous && view.anonymousData?.location) {
        location = view.anonymousData.location;
      } else if (view.viewer?.location?.city) {
        location = view.viewer.location.city;
      }
      locations[location] = (locations[location] || 0) + 1;
    });

    const topLocations = Object.entries(locations)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Analyze viewing patterns by hour
    const hourlyViews = new Array(24).fill(0);
    currentViews.forEach(view => {
      const hour = new Date(view.viewedAt).getHours();
      hourlyViews[hour]++;
    });

    const peakHours = hourlyViews
      .map((views, hour) => ({ hour, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    // Analyze weekly patterns
    const weeklyViews = new Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    currentViews.forEach(view => {
      const dayOfWeek = new Date(view.viewedAt).getDay();
      weeklyViews[dayOfWeek]++;
    });

    const weeklyPattern = weeklyViews
      .map((views, index) => ({ day: dayNames[index], views }))
      .sort((a, b) => b.views - a.views);

    // Engagement after profile views (mock data - would need actual tracking)
    const engagementAfterView = {
      connectionRequests: Math.round(totalViews * 0.15), // 15% conversion rate
      messages: Math.round(totalViews * 0.08), // 8% message rate
      activityLikes: Math.round(totalViews * 0.25), // 25% like activities
      profileViews: Math.round(totalViews * 0.12) // 12% return views
    };

    res.json({
      // Key metrics
      totalViews,
      uniqueViewers,
      returnViewers,
      avgDailyViews,
      
      // Trends
      trends,
      
      // Demographics
      viewerTypes: viewerTypesArray,
      topLocations,
      
      // Patterns
      peakHours,
      weeklyPattern,
      
      // Engagement
      engagementAfterView,
      
      // Meta
      period,
      dateRange: {
        start: currentPeriodStart,
        end: now
      }
    });
  } catch (error) {
    console.error('Error fetching viewer analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track a profile view
router.post('/track-view/:profileId', auth, async (req, res) => {
  try {
    const { profileId } = req.params;
    const viewerId = req.user._id;
    const { isAnonymous = false, source = 'direct' } = req.body;

    // Don't track self-views
    if (profileId === viewerId.toString()) {
      return res.json({ message: 'Self-view not tracked' });
    }

    // Check if user exists
    const profileOwner = await User.findById(profileId);
    if (!profileOwner) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Find existing view record
    let profileView = await ProfileView.findOne({
      profileOwner: profileId,
      viewer: isAnonymous ? null : viewerId,
      sessionId: req.sessionID
    });

    if (profileView) {
      // Update existing view
      profileView.viewCount += 1;
      profileView.viewedAt = new Date();
      profileView.source = source;
    } else {
      // Create new view record
      const viewerData = await User.findById(viewerId);
      
      profileView = new ProfileView({
        profileOwner: profileId,
        viewer: isAnonymous ? null : viewerId,
        sessionId: req.sessionID,
        isAnonymous,
        source,
        anonymousData: isAnonymous ? {
          professionalType: viewerData.professionalType,
          location: viewerData.location?.city || 'Unknown'
        } : null
      });
    }

    // Calculate connection strength if not anonymous
    if (!isAnonymous) {
      const Connection = require('../models/Connection');
      profileView.connectionStrength = await Connection.getConnectionStrength(viewerId, profileId);
    }

    await profileView.save();

    res.json({ message: 'Profile view tracked' });
  } catch (error) {
    console.error('Error tracking profile view:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile view insights for profile owner
router.get('/view-insights', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;
    
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Get views with source tracking
    const views = await ProfileView.find({
      profileOwner: userId,
      viewedAt: { $gte: startDate }
    });

    // Analyze traffic sources
    const sources = {};
    views.forEach(view => {
      const source = view.source || 'direct';
      sources[source] = (sources[source] || 0) + 1;
    });

    const trafficSources = Object.entries(sources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // Analyze view duration patterns (mock data)
    const viewDurations = {
      quick: Math.round(views.length * 0.4), // < 30 seconds
      medium: Math.round(views.length * 0.35), // 30s - 2min
      long: Math.round(views.length * 0.25) // > 2min
    };

    // Device type analysis (mock data)
    const deviceTypes = {
      desktop: Math.round(views.length * 0.6),
      mobile: Math.round(views.length * 0.35),
      tablet: Math.round(views.length * 0.05)
    };

    // Referral analysis
    const referralSources = {
      search: Math.round(views.length * 0.3),
      direct: Math.round(views.length * 0.25),
      social: Math.round(views.length * 0.2),
      connections: Math.round(views.length * 0.15),
      recommendations: Math.round(views.length * 0.1)
    };

    res.json({
      totalViews: views.length,
      period,
      trafficSources,
      viewDurations,
      deviceTypes,
      referralSources,
      insights: [
        {
          type: 'tip',
          title: 'Peak Viewing Time',
          description: 'Most of your profile views happen between 9-11 AM. Consider posting content during this time.',
          priority: 'medium'
        },
        {
          type: 'opportunity',
          title: 'Mobile Optimization',
          description: '35% of your views are from mobile devices. Ensure your profile looks great on mobile.',
          priority: 'high'
        },
        {
          type: 'success',
          title: 'Search Visibility',
          description: '30% of views come from search. Your profile SEO is working well!',
          priority: 'low'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching view insights:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;