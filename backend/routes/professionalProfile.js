const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const ModelProfile = require('../models/ModelProfile');
const MakeupArtistProfile = require('../models/MakeupArtistProfile');
const PhotographerProfile = require('../models/PhotographerProfile');
const FashionDesignerProfile = require('../models/FashionDesignerProfile');
const StylistProfile = require('../models/StylistProfile'); // ADD THIS LINE
// Import other professional profile models as you create them
// const BrandProfile = require('../models/BrandProfile');
// const AgencyProfile = require('../models/AgencyProfile');

const Connection = require('../models/Connection');
const ActivityService = require('../services/activityService');
const auth = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');
const router = express.Router();

// Professional type to model mapping
const getProfileModel = (professionalType) => {
  const modelMap = {
    'model': ModelProfile,
    'makeup-artist': MakeupArtistProfile,
    'photographer': PhotographerProfile,
    'fashion-designer': FashionDesignerProfile,
    'stylist': StylistProfile, // ADD THIS LINE
    // Add more as you create them
    // 'brand': BrandProfile,
    // 'agency': AgencyProfile
  };
  
  return modelMap[professionalType] || ModelProfile; // Fallback to ModelProfile
};

// Professional type to collection name mapping (for references)
const getCollectionName = (professionalType) => {
  const collectionMap = {
    'model': 'modelprofiles',
    'makeup-artist': 'makeupartistprofiles',
    'photographer': 'photographerprofiles',
    'fashion-designer': 'fashiondesignerprofiles',
    'stylist': 'stylistprofiles', // ADD THIS LINE
    // Add more as you create them
    // 'brand': 'brandprofiles',
    // 'agency': 'agencyprofiles'
  };
  
  return collectionMap[professionalType] || 'modelprofiles';
};

// Complete profile - Universal endpoint for all professional types
router.post('/complete', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const profileData = req.body;
    
    // Get user to determine professional type
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Creating profile for professional type:', user.professionalType);
    console.log('Profile data received:', JSON.stringify(profileData, null, 2));
    
    // Add default values and validation based on professional type
    switch (user.professionalType) {
      case 'stylist':
        if (!profileData.serviceModel) {
          profileData.serviceModel = 'fashion-stylist';
        }
        if (!profileData.availability) {
          profileData.availability = 'project-based';
        }
        if (!profileData.travelWillingness) {
          profileData.travelWillingness = 'local-only';
        }
        if (profileData.yearsExperience === '2-3') {
          profileData.yearsExperience = '3-5';
        }
        break;

      case 'makeup-artist':
        if (!profileData.serviceModel) {
          profileData.serviceModel = 'freelance-makeup-artist';
        }
        if (!profileData.availability) {
          profileData.availability = 'project-based';
        }
        if (!profileData.travelWillingness) {
          profileData.travelWillingness = 'local-only';
        }
        if (!profileData.makeupTypes || profileData.makeupTypes.length === 0) {
          profileData.makeupTypes = ['Bridal Makeup'];
        }
        break;

      case 'photographer':
        if (!profileData.serviceModel) {
          profileData.serviceModel = 'freelance-photographer';
        }
        if (!profileData.availability) {
          profileData.availability = 'project-based';
        }
        if (!profileData.travelWillingness) {
          profileData.travelWillingness = 'local-only';
        }
        if (!profileData.photographyTypes || profileData.photographyTypes.length === 0) {
          profileData.photographyTypes = ['Portrait'];
        }
        break;

      case 'fashion-designer':
        if (!profileData.serviceModel) {
          profileData.serviceModel = 'independent-designer';
        }
        if (!profileData.availability) {
          profileData.availability = 'project-based';
        }
        if (!profileData.designCategories || profileData.designCategories.length === 0) {
          profileData.designCategories = ['Ready-to-Wear'];
        }
        break;

      case 'model':
        if (!profileData.modelType) {
          profileData.modelType = 'fashion';
        }
        if (!profileData.availability) {
          profileData.availability = 'project-based';
        }
        if (!profileData.travelWillingness) {
          profileData.travelWillingness = 'local-only';
        }
        if (!profileData.experienceLevel) {
          profileData.experienceLevel = 'beginner';
        }
        break;

      case 'brand':
        if (!profileData.businessType) {
          profileData.businessType = 'fashion-brand';
        }
        if (!profileData.availability) {
          profileData.availability = 'full-time';
        }
        if (!profileData.location) {
          profileData.location = 'Global';
        }
        break;

      case 'agency':
        if (!profileData.agencyType) {
          profileData.agencyType = 'talent-agency';
        }
        if (!profileData.availability) {
          profileData.availability = 'full-time';
        }
        if (!profileData.location) {
          profileData.location = 'Global';
        }
        break;
    }
    
    // Get the appropriate model for this professional type
    const ProfileModel = getProfileModel(user.professionalType);
    
    // Check if profile already exists
    let profile = await ProfileModel.findOne({ userId });
    let isNewProfile = !profile;
    
    if (profile) {
      // Update existing profile
      profile = await ProfileModel.findOneAndUpdate(
        { userId },
        { ...profileData, isComplete: true },
        { new: true, runValidators: true }
      );
      
      console.log('Updated existing profile');
    } else {
      // Create new profile
      profile = new ProfileModel({
        userId,
        ...profileData,
        isComplete: true
      });
      await profile.save();
      
      console.log('Created new profile');
    }
    
    // Update user's profile completion status
    await User.findByIdAndUpdate(userId, {
      profileComplete: true,
      lastProfileUpdate: new Date()
    });
    
    // Create activity for profile completion
    await ActivityService.createProfileUpdateActivity(
      userId,
      'profile',
      { section: 'complete_profile', isUpdate: !isNewProfile, professionalType: user.professionalType }
    );
    
    console.log('Profile creation successful');
    
    res.status(201).json({
      success: true,
      message: 'Profile completed successfully',
      profile,
      professionalType: user.professionalType
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile completion',
      error: error.message
    });
  }
});

// Get profile - Universal endpoint
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user to determine professional type
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the appropriate model for this professional type
    const ProfileModel = getProfileModel(user.professionalType);
    
    const profile = await ProfileModel.findOne({ userId }).populate('userId', 'firstName lastName email');
    
    if (!profile) {
      return res.status(404).json({
        message: 'Profile not found',
        professionalType: user.professionalType
      });
    }
    
    res.json({
      ...profile.toObject(),
      professionalType: user.professionalType
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching profile'
    });
  }
});

// Get specific profile by ID - Universal endpoint
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user to determine professional type
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the appropriate model for this professional type
    const ProfileModel = getProfileModel(user.professionalType);
    
    const profile = await ProfileModel.findOne({ userId: id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
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
      ...profile.toObject(),
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      connectionsCount,
      verified: user.isVerified || false,
      professionalType: user.professionalType,
      createdAt: user.createdAt
    };
    
    res.json(completeProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile - Universal endpoint
router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = req.body;
    
    // Get user to determine professional type
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the appropriate model for this professional type
    const ProfileModel = getProfileModel(user.professionalType);
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { userId },
      { ...updateData, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );
    
    // Update user's last profile update
    await User.findByIdAndUpdate(userId, {
      lastProfileUpdate: new Date()
    });
    
    // Create activity for profile update
    await ActivityService.createProfileUpdateActivity(
      userId,
      'profile',
      { section: 'profile_update', professionalType: user.professionalType }
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
      professionalType: user.professionalType
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: error.message
    });
  }
});

// Upload profile picture - Universal endpoint
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
    
    // Get user to determine professional type
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the appropriate model for this professional type
    const ProfileModel = getProfileModel(user.professionalType);
    
    const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
    console.log('Profile picture URL:', profilePictureUrl);

    const profile = await ProfileModel.findOneAndUpdate(
      { userId: req.userId },
      { 
        profilePicture: profilePictureUrl,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    console.log('Profile updated with picture:', profile.profilePicture);

    res.json({ 
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: profile.profilePicture
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

// Add portfolio photos - Universal endpoint
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
    
    // Get user to determine professional type
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the appropriate model for this professional type
    const ProfileModel = getProfileModel(user.professionalType);

    const profile = await ProfileModel.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'Profile not found' 
      });
    }

    // Check total photo limit
    const currentPhotoCount = profile.photos ? profile.photos.length : 0;
    if (currentPhotoCount + req.files.length > 20) {
      return res.status(400).json({ 
        success: false,
        message: `Photo limit exceeded. You can upload ${20 - currentPhotoCount} more photos.` 
      });
    }

    const newPhotos = req.files.map(file => `/uploads/portfolios/${file.filename}`);
    console.log('New photos:', newPhotos);

    // Add new photos to existing array
    profile.photos = [...(profile.photos || []), ...newPhotos];
    await profile.save();

    console.log('Portfolio updated with photos. Total photos:', profile.photos.length);

    res.json({ 
      success: true,
      message: 'Photos uploaded successfully',
      photos: newPhotos,
      totalPhotos: profile.photos.length
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

// Browse profiles by professional type
router.get('/browse/:professionalType', auth, async (req, res) => {
  try {
    const { professionalType } = req.params;
    const {
      page = 1,
      limit = 20,
      search,
      location,
      sort = 'newest'
    } = req.query;
    
    // Get the appropriate model for this professional type
    const ProfileModel = getProfileModel(professionalType);
    
    let query = { isComplete: true };
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const matchingUsers = await User.find({
        professionalType,
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { headline: searchRegex }
        ]
      }).select('_id');
      const matchingUserIds = matchingUsers.map(user => user._id);
      
      // Add profile-specific search fields based on professional type
      const profileSearchQuery = { userId: { $in: matchingUserIds } };
      
      if (professionalType === 'makeup-artist') {
        profileSearchQuery.$or = [
          { makeupTypes: searchRegex },
          { techniques: searchRegex },
          { specialSkills: searchRegex }
        ];
      } else if (professionalType === 'photographer') {
        profileSearchQuery.$or = [
          { photographyTypes: searchRegex },
          { styles: searchRegex },
          { technicalSkills: searchRegex }
        ];
      } else if (professionalType === 'fashion-designer') {
        profileSearchQuery.$or = [
          { designCategories: searchRegex },
          { designStyles: searchRegex },
          { technicalSkills: searchRegex }
        ];
      } else if (professionalType === 'stylist') {
        profileSearchQuery.$or = [
          { stylingTypes: searchRegex },
          { clientTypes: searchRegex },
          { styleAesthetics: searchRegex }
        ];
      }
      // Add more professional type specific searches as needed
      
      query.$or = [profileSearchQuery];
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Execute query with pagination
    const profiles = await ProfileModel.find(query)
      .populate('userId', 'firstName lastName email professionalType')
      .sort(sort === 'newest' ? { createdAt: -1 } : { profileViews: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await ProfileModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      profiles,
      totalPages,
      currentPage: parseInt(page),
      total,
      hasMore: page < totalPages,
      professionalType
    });
  } catch (error) {
    console.error('Browse profiles error:', error);
    res.status(500).json({
      message: 'Server error while browsing profiles',
      error: error.message
    });
  }
});

module.exports = router;