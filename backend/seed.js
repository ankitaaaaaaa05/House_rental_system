// Seed Script - Populate database with sample data
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');
const Property = require('./models/property');

// Load environment variables
dotenv.config();

// ---------------- SAMPLE USERS ----------------
const users = [
    {
        name: 'Rupesh',
        email: 'rupesh@example.com',
        password: 'password123',
        phone: '9876540000',
        userType: 'landlord'
    },
    {
        name: 'Oishi',
        email: 'oishi.ad@renter.com',
        password: '987456123',
        phone: '9876543210',
        userType: 'renter'
    },
    {
        name: 'Ankita Chattarj',
        email: 'anki16@admin.com',
        password: '123456789',
        phone: '9876543210',
        userType: 'admin'
    },
    {
        name: 'Rick',
        email: 'rick@renter.com',
        password: '123456',
        phone: '9876543210',
        userType: 'renter'
    }
];

// ---------------- SAMPLE PROPERTIES WITH ZIP CODES ----------------
const properties = [
    {
        name: "Prestige Palm Court",
        price: 25000,
        location: "Kolkata, West Bengal",
        city: "Kolkata",
        state: "West Bengal",
        zipCode: "700001",  // ✅ ZIP Code
        type: "Luxury Apartment",
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        description: "Beautiful apartment in prime location with modern amenities",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        amenities: ["Parking", "Gym", "Swimming Pool", "Security"]
    },
    {
        name: "DLF Garden City",
        price: 65000,
        location: "Delhi NCR",
        city: "Delhi",
        state: "Delhi",
        zipCode: "110001",  // ✅ ZIP Code
        type: "Modern Villa",
        bedrooms: 4,
        bathrooms: 3,
        area: 2500,
        description: "Spacious villa with garden and modern facilities",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        amenities: ["Garden", "Parking", "Gym", "Club House"]
    },
    // ... (other properties with zipCode field)
];

// ---------------- SEED FUNCTION ----------------
const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        await User.deleteMany();
        await Property.deleteMany();

        const createdUsers = await User.create(users);
        const landlord = createdUsers.find(u => u.userType === 'landlord');

        const docTypeEnum = Property.schema.path('documents.propertyProof.documentType').enumValues;

        const propertiesWithOwner = properties.map(prop => ({
            ...prop,
            owner: landlord._id,
            zipCode: prop.zipCode,  // ✅ Include zipCode
            isApproved: true,
            approvalStatus: 'approved',
            status: 'available',
            documents: {
                propertyProof: {
                    documentType: docTypeEnum[0],
                    documentNumber: 'SEED-' + Date.now(),
                    documentBase64: Buffer.from('Seeded document').toString('base64')
                }
            }
        }));

        await Property.create(propertiesWithOwner);
        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedDatabase();