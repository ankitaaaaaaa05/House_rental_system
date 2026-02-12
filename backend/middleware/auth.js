// Enhanced Auth Middleware with Admin Check
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protect routes - check if user is authenticated
exports.protect = async (req, res, next) => {
    let token;
    
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route - No token'
        });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Check if user is active
        if (!req.user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account is deactivated'
            });
        }
        
        // Check if user is blocked
        if (req.user.isBlocked) {
            return res.status(401).json({
                success: false,
                message: 'Your account is blocked: ' + (req.user.blockReason || 'Contact admin')
            });
        }
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route - Invalid token'
        });
    }
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.userType === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Check if user is verified (for landlords and renters)
exports.requireVerified = (req, res, next) => {
    // Admin doesn't need verification
    if (req.user && req.user.userType === 'admin') {
        return next();
    }
    
    // Check if user is verified
    if (req.user && req.user.isVerified) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Account verification required. Please upload your ID proof and wait for admin approval.',
            verificationStatus: req.user.verificationStatus
        });
    }
};

// Landlord only middleware
exports.landlordOnly = (req, res, next) => {
    if (req.user && (req.user.userType === 'landlord' || req.user.userType === 'admin')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Landlord privileges required.'
        });
    }
};

// Optional auth - attach user if token exists, but don't require it
exports.optionalAuth = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
        console.log('Optional auth token invalid, continuing without user');
    }
    
    next()
};