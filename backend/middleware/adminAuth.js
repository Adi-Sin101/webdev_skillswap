import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Middleware to verify admin role
export const verifyAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        error: 'Your account has been banned.' 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ 
      error: 'Authentication failed.',
      message: error.message 
    });
  }
};
