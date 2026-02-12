// Enhanced Property Model with ZIP Code and Approval Workflow
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: [true, 'Please provide a property name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot be more than 2000 characters'],
        default: ''
    },
    
    // Pricing
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    
    // Location Details
    location: {
        type: String,
        required: [true, 'Please provide a location'],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true,
        index: true
    },
    state: {
        type: String,
        trim: true
    },
    zipCode: {
        type: String,
        trim: true,
        index: true,
        match: [/^\d{5,6}$/, 'Please provide a valid ZIP code (5-6 digits)']
    },
    
    // Property Details
    type: {
        type: String,
        required: [true, 'Please specify property type'],
        enum: [
            'Luxury Apartment',
            'Modern Villa',
            'Premium Residence',
            'Urban Home',
            'Garden Estate',
            'Coastal Villa',
            'Modern Apartment',
            'Luxury Penthouse',
            'Studio Apartment',
            'Duplex'
        ]
    },
    bedrooms: {
        type: Number,
        required: [true, 'Please specify number of bedrooms'],
        min: [0, 'Bedrooms cannot be negative'],
        default: 1
    },
    bathrooms: {
        type: Number,
        required: [true, 'Please specify number of bathrooms'],
        min: [0, 'Bathrooms cannot be negative'],
        default: 1
    },
    area: {
        type: Number,
        min: [0, 'Area cannot be negative'],
        default: 0
    },
    areaUnit: {
        type: String,
        enum: ['sqft', 'sqm'],
        default: 'sqft'
    },
    
    // Documents
    documents: {
        propertyProof: {
            documentType: {
                type: String,
                enum: ['sale_deed', 'registry', 'agreement', 'power_of_attorney', 'other']
            },
            documentNumber: {
                type: String,
                trim: true
            },
            documentBase64: {
                type: String
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        },
        additionalDocuments: [{
            documentName: String,
            documentType: {
                type: String,
                enum: ['noc', 'tax_receipt', 'utility_bill', 'society_letter', 'other']
            },
            documentBase64: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    
    // Approval Workflow
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'under_review'],
        default: 'pending',
        index: true
    },
    isApproved: {
        type: Boolean,
        default: false,
        index: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    
    // Availability Status
    status: {
        type: String,
        enum: ['available', 'rented', 'maintenance', 'unlisted'],
        default: 'available',
        index: true
    },
    
    // Owner Reference
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Property must have an owner'],
        index: true
    },
    
    // Images
    image: {
        type: String,
        default: ''
    },
    imageBase64: {
        type: String
    },
    images: [{
        url: String,
        base64: String,
        caption: String
    }],
    
    // Amenities
    amenities: [{
        type: String,
        trim: true
    }],
    
    // Additional Features
    furnishing: {
        type: String,
        enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
        default: 'unfurnished'
    },
    parking: {
        type: Boolean,
        default: false
    },
    petFriendly: {
        type: Boolean,
        default: false
    },
    
    // Favorites (Users who favorited this property)
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // Views Count
    views: {
        type: Number,
        default: 0
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

// Update timestamp on save
propertySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for better search performance
propertySchema.index({ location: 'text', name: 'text', description: 'text' });
propertySchema.index({ price: 1 });
propertySchema.index({ city: 1, zipCode: 1 });
propertySchema.index({ isApproved: 1, status: 1 });
propertySchema.index({ owner: 1, createdAt: -1 });

// Virtual for formatted price
propertySchema.virtual('formattedPrice').get(function() {
    return '₹' + this.price.toLocaleString('en-IN');
});

// Method to check if property is available
propertySchema.methods.isAvailable = function() {
    return this.isApproved && this.status === 'available';
};

// Method to approve property
propertySchema.methods.approve = async function(adminId) {
    this.isApproved = true;
    this.approvalStatus = 'approved';
    this.approvedBy = adminId;
    this.approvedAt = Date.now();
    return await this.save();
};

// Method to reject property
propertySchema.methods.reject = async function(adminId, reason) {
    this.isApproved = false;
    this.approvalStatus = 'rejected';
    this.approvedBy = adminId;
    this.rejectionReason = reason;
    return await this.save();
};

// Method to mark as rented
propertySchema.methods.markAsRented = async function() {
    this.status = 'rented';
    return await this.save();
};

// Method to mark as available
propertySchema.methods.markAsAvailable = async function() {
    this.status = 'available';
    return await this.save();
};

// Static method to find by ZIP code
propertySchema.statics.findByZipCode = function(zipCode) {
    return this.find({ 
        zipCode: zipCode,
        isApproved: true,
        status: 'available'
    });
};

// Static method to search properties
propertySchema.statics.searchProperties = function(filters) {
    const query = {
        isApproved: true,
        status: 'available'
    };
    
    if (filters.zipCode) {
        query.zipCode = new RegExp(filters.zipCode, 'i');
    }
    if (filters.city) {
        query.city = new RegExp(filters.city, 'i');
    }
    if (filters.minPrice) {
        query.price = { ...query.price, $gte: filters.minPrice };
    }
    if (filters.maxPrice) {
        query.price = { ...query.price, $lte: filters.maxPrice };
    }
    if (filters.bedrooms) {
        query.bedrooms = filters.bedrooms;
    }
    if (filters.type) {
        query.type = filters.type;
    }
    return this.find(query).populate('owner', 'name email phone');
};

propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Property || mongoose.model('Property', propertySchema);