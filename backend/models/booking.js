// Booking Model for Property Reservations with Unique Reference ID
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Function to generate unique booking reference
const generateBookingReference = function() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return 'BK-' + timestamp + '-' + random;
};

const bookingSchema = new mongoose.Schema({
    // Unique Booking Reference ID
    bookingReference: {
        type: String,
        unique: true,
        index: true
    },
    
    // Property and Users
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Booking must be associated with a property'],
        index: true
    },
    renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must have a renter'],
        index: true
    },
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must have a landlord']
    },
    
    // Booking Details
    checkInDate: {
        type: Date,
        required: [true, 'Check-in date is required']
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Check-out date is required']
    },
    duration: {
        type: Number, // Duration in months
        required: true
    },
    
    // Pricing
    monthlyRent: {
        type: Number,
        required: [true, 'Monthly rent is required']
    },
    securityDeposit: {
        type: Number,
        default: function() {
            return this.monthlyRent * 2; // Default: 2 months rent
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    
    // Payment Information
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed', 'refunded', 'failed'],
        default: 'pending',
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'cash'],
        default: 'card'
    },
    transactionId: {
        type: String,
        trim: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    paymentDate: {
        type: Date
    },
    
    // Booking Status
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
        default: 'pending',
        index: true
    },
    
    // Confirmation
    confirmedAt: {
        type: Date
    },
    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Cancellation
    cancelledAt: {
        type: Date
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancellationReason: {
        type: String,
        trim: true
    },
    
    // Additional Information
    specialRequests: {
        type: String,
        trim: true,
        maxlength: [500, 'Special requests cannot exceed 500 characters']
    },
    numberOfOccupants: {
        type: Number,
        default: 1,
        min: [1, 'At least one occupant is required']
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

// Generate unique booking reference before saving
bookingSchema.pre('save', function(next) {
    if (!this.bookingReference) {
        this.bookingReference = generateBookingReference();
    }
    next();
});

// Update timestamp on save
bookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate total amount before saving
bookingSchema.pre('save', function(next) {
    if (this.isModified('duration') || this.isModified('monthlyRent') || this.isModified('securityDeposit')) {
        this.totalAmount = (this.monthlyRent * this.duration) + this.securityDeposit;
    }
    next();
});

// Method to confirm booking
bookingSchema.methods.confirmBooking = async function(userId) {
    this.bookingStatus = 'confirmed';
    this.confirmedAt = Date.now();
    this.confirmedBy = userId;
    return await this.save();
};

// Method to cancel booking
bookingSchema.methods.cancelBooking = async function(userId, reason) {
    this.bookingStatus = 'cancelled';
    this.cancelledAt = Date.now();
    this.cancelledBy = userId;
    this.cancellationReason = reason;
    return await this.save();
};

// Method to complete payment
bookingSchema.methods.completePayment = async function(amount, transactionId, method) {
    this.paidAmount += amount;
    this.transactionId = transactionId;
    this.paymentMethod = method;
    this.paymentDate = Date.now();
    
    if (this.paidAmount >= this.totalAmount) {
        this.paymentStatus = 'completed';
    } else if (this.paidAmount > 0) {
        this.paymentStatus = 'partial';
    }
    
    return await this.save();
};

// Indexes for better query performance
bookingSchema.index({ property: 1, renter: 1 });
bookingSchema.index({ landlord: 1, bookingStatus: 1 });
bookingSchema.index({ renter: 1, bookingStatus: 1 });
bookingSchema.index({ createdAt: -1 });

bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
