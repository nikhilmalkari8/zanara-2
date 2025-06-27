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

    if (!token || token.trim() === '') {
      return res.status(401).json({ 
        success: false,
        message: 'Token format invalid, authorization denied' 
      });
    }

    // Basic JWT format validation
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('JWT malformed: Token does not have 3 parts');
      return res.status(401).json({ 
        success: false,
        message: 'Token format is invalid - malformed JWT' 
      });
    }

    // Check if token parts are not empty
    if (tokenParts.some(part => !part || part.trim() === '')) {
      console.error('JWT malformed: One or more token parts are empty');
      return res.status(401).json({ 
        success: false,
        message: 'Token format is invalid - empty token parts' 
      });
    }

    try {
      // Use the same secret as login route (with fallback for consistency)
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database (handle both 'id' and 'userId' properties from token)
      const userId = decoded.id || decoded.userId;
      
      if (!userId) {
        console.error('JWT payload missing user ID');
        return res.status(401).json({ 
          success: false,
          message: 'Token payload invalid - missing user ID' 
        });
      }

      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        console.error('User not found for token:', userId);
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
      console.error('Token that failed:', token.substring(0, 20) + '...');
      
      if (jwtError.name === 'JsonWebTokenError') {
        if (jwtError.message.includes('malformed')) {
          return res.status(401).json({ 
            success: false,
            message: 'Token is malformed - please login again' 
          });
        }
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token format' 
        });
      } else if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired - please login again' 
        });
      } else if (jwtError.name === 'NotBeforeError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token not active yet' 
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