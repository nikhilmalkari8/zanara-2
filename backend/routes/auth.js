const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// UPDATED: Register user with professional types
router.post('/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      password, 
      professionalType,
      userType,
      workStatus
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !password || !professionalType) {
      return res.status(400).json({
        message: 'All fields are required including professional type'
      });
    }

    // Validate professional type
    const validTypes = [
      'fashion-designer', 'stylist', 'photographer', 
      'makeup-artist', 'model', 'brand', 'agency', 'fashion-student'
    ];
    
    if (!validTypes.includes(professionalType)) {
      return res.status(400).json({
        message: 'Invalid professional type'
      });
    }

    // Validate work status if provided
    const validWorkStatuses = [
      'freelancer', 'full-time', 'part-time', 'contract', 
      'seeking-work', 'student', 'not-specified'
    ];
    
    if (workStatus && !validWorkStatuses.includes(workStatus)) {
      return res.status(400).json({
        message: 'Invalid work status'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Determine user type based on professional type if not provided
    let finalUserType = userType;
    if (!finalUserType) {
      finalUserType = ['brand', 'agency'].includes(professionalType) ? 'hiring' : 'talent';
    }

    // Set default work status based on professional type if not provided
    let finalWorkStatus = workStatus || 'not-specified';
    if (!workStatus) {
      if (professionalType === 'fashion-student') {
        finalWorkStatus = 'student';
      } else if (['brand', 'agency'].includes(professionalType)) {
        finalWorkStatus = 'full-time';
      } else {
        finalWorkStatus = 'freelancer'; // Default for creative professionals
      }
    }

    // Create new user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      password,
      professionalType,
      userType: finalUserType,
      workStatus: finalWorkStatus,
      headline: `${professionalType.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')} | New to Zanara`,
      profileCompletionScore: 25 // Base score for having basic info
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data with professional info
    const professionalInfo = user.getProfessionalInfo();

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        professionalType: user.professionalType,
        userType: user.userType,
        workStatus: user.workStatus,
        headline: user.headline,
        profileComplete: user.profileComplete,
        profileCompletionScore: user.profileCompletionScore,
        verificationTier: user.verificationTier,
        professionalInfo,
        subscriptionTier: user.subscriptionTier
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate email error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'An account with this email already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      message: 'Server error during registration'
    });
  }
});

// UPDATED: Login route with enhanced user data and lockout logic
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked and still within lock period
    if (user.accountLocked && user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message: 'Account is temporarily locked. Please try again later.'
      });
    }

    // If lock period has expired, reset account lock fields
    if (user.accountLocked && user.lockUntil && user.lockUntil <= Date.now()) {
      user.accountLocked = false;
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.accountLocked = true;
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await user.save();

      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Password is valid: reset login attempts and lock fields
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.accountLocked = false;
      user.lockUntil = undefined;
    }

    // Update last active timestamp
    user.lastActiveAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Get professional info
    const professionalInfo = user.getProfessionalInfo();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        professionalType: user.professionalType,
        userType: user.userType,
        workStatus: user.workStatus,
        headline: user.headline,
        bio: user.bio,
        location: user.location,
        website: user.website,
        profilePicture: user.profilePicture,
        coverPhoto: user.coverPhoto,
        profileComplete: user.profileComplete,
        profileCompletionScore: user.profileCompletionScore,
        verificationTier: user.verificationTier,
        profileVisibility: user.profileVisibility,
        subscriptionTier: user.subscriptionTier,
        professionalInfo,
        notificationSettings: user.notificationSettings
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login'
    });
  }
});

// UPDATED: Get current user with enhanced data
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile completion score
    const completionScore = user.calculateProfileCompletion();
    if (completionScore !== user.profileCompletionScore) {
      user.profileCompletionScore = completionScore;
      user.profileComplete = completionScore >= 80;
      await user.save();
    }

    // Get professional info
    const professionalInfo = user.getProfessionalInfo();

    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      professionalType: user.professionalType,
      userType: user.userType,
      workStatus: user.workStatus,
      headline: user.headline,
      bio: user.bio,
      location: user.location,
      website: user.website,
      profilePicture: user.profilePicture,
      coverPhoto: user.coverPhoto,
      profileComplete: user.profileComplete,
      profileCompletionScore: user.profileCompletionScore,
      verificationTier: user.verificationTier,
      profileVisibility: user.profileVisibility,
      profileViews: user.profileViews,
      profileViewsThisMonth: user.profileViewsThisMonth,
      connectionsCount: user.connectionsCount,
      subscriptionTier: user.subscriptionTier,
      professionalInfo,
      notificationSettings: user.notificationSettings,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// NEW: Update user profile basic info
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      headline, 
      bio, 
      location, 
      website,
      workStatus,
      profileVisibility,
      notificationSettings 
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (headline) user.headline = headline.trim();
    if (bio) user.bio = bio.trim();
    if (location) user.location = location.trim();
    if (website) user.website = website.trim();
    if (workStatus) user.workStatus = workStatus;
    if (profileVisibility) user.profileVisibility = profileVisibility;
    if (notificationSettings) {
      user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
    }

    // Update profile completion and timestamp
    user.profileCompletionScore = user.calculateProfileCompletion();
    user.profileComplete = user.profileCompletionScore >= 80;
    user.lastProfileUpdate = new Date();

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      profileCompletionScore: user.profileCompletionScore,
      profileComplete: user.profileComplete
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// NEW: Get professional type statistics
router.get('/stats/professional-types', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$professionalType',
          count: { $sum: 1 },
          verified: {
            $sum: {
              $cond: [{ $ne: ['$verificationTier', 'none'] }, 1, 0]
            }
          },
          premium: {
            $sum: {
              $cond: [{ $ne: ['$subscriptionTier', 'free'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// NEW: Professional type validation endpoint
router.get('/validate-professional-type/:type', (req, res) => {
  const { type } = req.params;
  const validTypes = [
    'fashion-designer', 'stylist', 'photographer', 
    'makeup-artist', 'model', 'brand', 'agency'
  ];

  const isValid = validTypes.includes(type);
  
  if (isValid) {
    const typeMap = {
      'fashion-designer': { label: 'Fashion Designer', category: 'Creative' },
      'stylist': { label: 'Fashion Stylist', category: 'Creative' },
      'photographer': { label: 'Fashion Photographer', category: 'Creative' },
      'makeup-artist': { label: 'Makeup Artist', category: 'Beauty' },
      'model': { label: 'Model', category: 'Talent' },
      'brand': { label: 'Fashion Brand', category: 'Business' },
      'agency': { label: 'Modeling Agency', category: 'Business' }
    };

    res.json({
      valid: true,
      info: typeMap[type]
    });
  } else {
    res.json({
      valid: false,
      message: 'Invalid professional type'
    });
  }
});

// EXISTING: Test route to see all users (keep for development)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;
