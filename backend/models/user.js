// Enhanced User Model with Admin Role and ID Verification
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic info
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        trim: true
    },
    userType: {
        type: String,
        required: [true, 'Please specify user type'],
        enum: ['admin', 'renter', 'landlord'],
        default: 'renter'
    },
    
    // Additional info
    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=User&background=2563eb&color=fff'
    },
    address: {
        type: String,
        trim: true
    },
    
    // ID Verification fields
    idProof: {
        documentType: {
            type: String,
            enum: ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id', ''],
            default: ''
        },
        documentNumber: {
            type: String,
            trim: true
        },
        documentBase64: {
            type: String  // Store document as base64 string
        },
        uploadedAt: {
            type: Date
        }
    },
    
    // Verification status
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    verifiedAt: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    
    // Landlord specific
    properties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    
    // Renter specific
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockReason: {
        type: String,
        trim: true
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Update timestamp on save
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to verify user
userSchema.methods.verifyUser = async function(adminId) {
    this.isVerified = true;
    this.verificationStatus = 'approved';
    this.verifiedAt = Date.now();
    this.verifiedBy = adminId;
    this.rejectionReason = undefined;
    return await this.save();
};

// Method to reject user verification
userSchema.methods.rejectVerification = async function(adminId, reason) {
    this.isVerified = false;
    this.verificationStatus = 'rejected';
    this.verifiedAt = Date.now();
    this.verifiedBy = adminId;
    this.rejectionReason = reason;
    return await this.save();
};

// Method to block user
userSchema.methods.blockUser = async function(adminId, reason) {
    this.isBlocked = true;
    this.isActive = false;
    this.blockReason = reason;
    return await this.save();
};

// Method to unblock user
userSchema.methods.unblockUser = async function() {
    this.isBlocked = false;
    this.isActive = true;
    this.blockReason = undefined;
    return await this.save();
};

// Method to get user without sensitive data
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);