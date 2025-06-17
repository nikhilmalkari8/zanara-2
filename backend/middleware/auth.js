// middleware/auth.js - Complete fixed version
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    let token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Remove Bearer from string if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token format invalid, authorization denied' 
      });
    }

    try {
      // Use the same secret as login route (with fallback for consistency)
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database (handle both 'id' and 'userId' properties from token)
      const userId = decoded.id || decoded.userId;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found, token invalid' 
        });
      }

      // Add user info to request object
      req.user = user;
      req.userId = user._id.toString();
      
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      } else if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired' 
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Token verification failed' 
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = auth;