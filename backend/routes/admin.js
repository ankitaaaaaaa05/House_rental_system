// Admin Routes - User and Property Management
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Property = require('../models/property');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ userType: { $ne: 'admin' } });
        const pendingUsers = await User.countDocuments({ verificationStatus: 'pending', userType: { $ne: 'admin' } });
        const verifiedUsers = await User.countDocuments({ isVerified: true, userType: { $ne: 'admin' } });
        const rejectedUsers = await User.countDocuments({ verificationStatus: 'rejected', userType: { $ne: 'admin' } });
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        
        const totalProperties = await Property.countDocuments({});
        const pendingProperties = await Property.countDocuments({ approvalStatus: 'pending' });
        const approvedProperties = await Property.countDocuments({ isApproved: true });
        const rejectedProperties = await Property.countDocuments({ approvalStatus: 'rejected' });
        
        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    pending: pendingUsers,
                    verified: verifiedUsers,
                    rejected: rejectedUsers,
                    blocked: blockedUsers
                },
                properties: {
                    total: totalProperties,
                    pending: pendingProperties,
                    approved: approvedProperties,
                    rejected: rejectedProperties
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

// @route   GET /api/admin/users/pending
// @desc    Get all pending user verifications
// @access  Private/Admin
router.get('/users/pending', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find({
            verificationStatus: 'pending',
            userType: { $ne: 'admin' }
        }).select('-password').sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get pending users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending users',
            error: error.message
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find({ userType: { $ne: 'admin' } })
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Approve user verification
// @access  Private/Admin
router.put('/users/:id/verify', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        await user.verifyUser(req.user.id);
        
        res.status(200).json({
            success: true,
            message: 'User verified successfully',
            user
        });
    } catch (error) {
        console.error('Verify user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying user',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id/reject
// @desc    Reject user verification
// @access  Private/Admin
router.put('/users/:id/reject', protect, adminOnly, async (req, res) => {
    try {
        const { reason } = req.body;
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        await user.rejectVerification(req.user.id, reason || 'Invalid or unclear ID proof');
        
        res.status(200).json({
            success: true,
            message: 'User verification rejected',
            user
        });
    } catch (error) {
        console.error('Reject user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting user',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block user account
// @access  Private/Admin
router.put('/users/:id/block', protect, adminOnly, async (req, res) => {
    try {
        const { reason } = req.body;
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        await user.blockUser(req.user.id, reason || 'Violated terms of service');
        
        res.status(200).json({
            success: true,
            message: 'User blocked successfully',
            user
        });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error blocking user',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id/unblock
// @desc    Unblock user account
// @access  Private/Admin
router.put('/users/:id/unblock', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        await user.unblockUser();
        
        res.status(200).json({
            success: true,
            message: 'User unblocked successfully',
            user
        });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unblocking user',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Delete user's properties first
        await Property.deleteMany({ owner: user._id });
        
        // Delete user
        await user.remove();
        
        res.status(200).json({
            success: true,
            message: 'User and their properties deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

// @route   GET /api/admin/properties/pending
// @desc    Get all pending property approvals
// @access  Private/Admin
router.get('/properties/pending', protect, adminOnly, async (req, res) => {
    try {
        const properties = await Property.find({ approvalStatus: 'pending' })
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            properties
        });
    } catch (error) {
        console.error('Get pending properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending properties',
            error: error.message
        });
    }
});

// @route   GET /api/admin/properties
// @desc    Get all properties
// @access  Private/Admin
router.get('/properties', protect, adminOnly, async (req, res) => {
    try {
        const properties = await Property.find({})
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            properties
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching properties',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/properties/:id/approve
// @desc    Approve property listing
// @access  Private/Admin
router.put('/properties/:id/approve', protect, adminOnly, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        
        await property.approveProperty(req.user.id);
        
        res.status(200).json({
            success: true,
            message: 'Property approved successfully',
            property
        });
    } catch (error) {
        console.error('Approve property error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving property',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/properties/:id/reject
// @desc    Reject property listing
// @access  Private/Admin
router.put('/properties/:id/reject', protect, adminOnly, async (req, res) => {
    try {
        const { reason } = req.body;
        
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        
        await property.rejectProperty(req.user.id, reason || 'Invalid or incomplete property details');
        
        res.status(200).json({
            success: true,
            message: 'Property rejected',
            property
        });
    } catch (error) {
        console.error('Reject property error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting property',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/properties/:id
// @desc    Delete property
// @access  Private/Admin
router.delete('/properties/:id', protect, adminOnly, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        
        await property.remove();
        
        res.status(200).json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting property',
            error: error.message
        });
    }
});

module.exports = router;