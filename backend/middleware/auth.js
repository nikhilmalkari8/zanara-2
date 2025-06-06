const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Check if it starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.userId;
      next();
    } catch (jwtError) {
      console.error('JWT Error:', jwtError.message);
      
      // Handle specific JWT errors
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else {
        return res.status(401).json({ message: 'Token verification failed' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

module.exports = auth;