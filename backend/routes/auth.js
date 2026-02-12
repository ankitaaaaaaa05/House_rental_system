// Enhanced Authentication Routes with Admin and ID Verification
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/signup
// @desc    Register a new user (with admin support)
// @access  Public
router.post('/signup', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('userType').isIn(['admin', 'renter', 'landlord']).withMessage('Invalid user type')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    
    try {
        const { name, email, password, phone, userType } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Auto-detect admin based on email
        const isAdmin = email.toLowerCase().endsWith('@admin.com');
        
        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            userType: isAdmin ? 'admin' : userType,
            isVerified: isAdmin, // Admin auto-verified
            verificationStatus: isAdmin ? 'approved' : 'pending'
        });
        
        // Generate token
        const token = generateToken(user._id);
        
        // Send response
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                avatar: user.avatar,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating account',
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }
        
        if (user.isBlocked) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been blocked: ' + (user.blockReason || 'Contact admin')
            });
        }
        
        const token = generateToken(user._id);
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                avatar: user.avatar,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('properties', 'name price location image')
            .populate('favorites', 'name price location image');
        
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// @route   POST /api/auth/upload-id
// @desc    Upload ID proof for verification
// @access  Private
router.post('/upload-id', protect, [
    body('documentType').isIn(['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id']).withMessage('Invalid document type'),
    body('documentNumber').notEmpty().withMessage('Document number is required'),
    body('documentBase64').notEmpty().withMessage('Document file is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    
    try {
        const { documentType, documentNumber, documentBase64 } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (user.userType === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Admin accounts do not require verification'
            });
        }
        
        user.idProof = {
            documentType,
            documentNumber,
            documentBase64,
            uploadedAt: Date.now()
        };
        user.verificationStatus = 'pending';
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'ID proof uploaded successfully. Awaiting admin approval.',
            verificationStatus: user.verificationStatus
        });
    } catch (error) {
        console.error('Upload ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading ID proof',
            error: error.message
        });
    }
});

module.exports = router;