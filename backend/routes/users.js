// User Routes - User-specific operations
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Property = require('../models/property');
const { protect, isRenter } = require('../middleware/auth');

// @route   GET /api/users/favorites
// @desc    Get user's favorite properties
// @access  Private
router.get('/favorites', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'favorites',
                populate: { path: 'owner', select: 'name email phone' }
            });
        
        res.status(200).json({
            success: true,
            count: user.favorites.length,
            favorites: user.favorites
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorites',
            error: error.message
        });
    }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const stats = {};
        
        if (req.user.userType === 'landlord') {
            // Landlord stats
            const properties = await Property.find({ owner: req.user._id });
            
            stats.totalProperties = properties.length;
            stats.availableProperties = properties.filter(p => p.status === 'available').length;
            stats.rentedProperties = properties.filter(p => p.status === 'rented').length;
            stats.totalViews = properties.reduce((sum, p) => sum + p.views, 0);
            stats.totalFavorites = properties.reduce((sum, p) => sum + p.favoritedBy.length, 0);
            
            // Most viewed property
            const mostViewed = properties.sort((a, b) => b.views - a.views)[0];
            if (mostViewed) {
                stats.mostViewedProperty = {
                    id: mostViewed._id,
                    name: mostViewed.name,
                    views: mostViewed.views
                };
            }
        } else {
            // Renter stats
            const user = await User.findById(req.user._id).populate('favorites');
            
            stats.totalFavorites = user.favorites.length;
            
            if (user.favorites.length > 0) {
                const avgPrice = user.favorites.reduce((sum, p) => sum + p.price, 0) / user.favorites.length;
                stats.averageFavoritePrice = Math.round(avgPrice);
            }
        }
        
        res.status(200).json({
            success: true,
            stats
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

// @route   GET /api/users/search
// @desc    Search users (for admin or contact purposes)
// @access  Private
router.get('/search', protect, async (req, res) => {
    try {
        const { query, userType } = req.query;
        
        const searchQuery = {};
        
        if (query) {
            searchQuery.$or = [
                { name: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') }
            ];
        }
        
        if (userType) {
            searchQuery.userType = userType;
        }
        
        const users = await User.find(searchQuery)
            .select('name email phone userType avatar')
            .limit(20);
        
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching users',
            error: error.message
        });
    }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', protect, async (req, res) => {
    try {
        // If landlord, delete all their properties
        if (req.user.userType === 'landlord') {
            await Property.deleteMany({ owner: req.user._id });
        }
        
        // Remove user from all favorites
        await Property.updateMany(
            { favoritedBy: req.user._id },
            { $pull: { favoritedBy: req.user._id } }
        );
        
        // Delete user
        await User.findByIdAndDelete(req.user._id);
        
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting account',
            error: error.message
        });
    }
});

module.exports = router;