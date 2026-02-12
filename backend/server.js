// Enhanced Main Server File with Admin Routes
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin'); // NEW
const bookingRoutes = require('./routes/bookings'); // NEW - Booking System

// Initialize express app
const app = express();

// Middleware - CORS fixed to allow all origins
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with larger limits for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'RentBase API - Enhanced with Admin Features',
        version: '2.0.0',
        features: [
            'User Roles: Admin, Landlord, Renter',
            'ID Verification System',
            'Property Approval Workflow',
            'Admin Dashboard',
            'Base64 Document Storage'
        ],
        endpoints: {
            auth: '/api/auth',
            properties: '/api/properties',
            users: '/api/users',
            admin: '/api/admin',
            bookings: '/api/bookings'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); // NEW ADMIN ROUTES
app.use('/api/bookings', bookingRoutes); // NEW BOOKING ROUTES

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`\n✨ RentBase Enhanced Backend is ready!`);
    console.log(`\n📋 New Features:`);
    console.log(`   - Admin Role & Dashboard`);
    console.log(`   - ID Verification System`);
    console.log(`   - Property Approval Workflow`);
    console.log(`   - User Management\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`❌ Error: ${err.message}`);
    process.exit(1);
});