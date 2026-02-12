// Booking Routes with Invoice PDF Generation
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const Booking = require('../models/booking');
const Property = require('../models/property');
const User = require('../models/user');
const { protect, landlordOnly } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (Renter)
router.post('/', [protect], [
    body('propertyId').notEmpty().withMessage('Property ID is required'),
    body('checkInDate').isISO8601().withMessage('Valid check-in date is required'),
    body('duration').isNumeric().withMessage('Duration in months is required'),
    body('numberOfOccupants').optional().isNumeric()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    
    try {
        const { propertyId, checkInDate, duration, numberOfOccupants, specialRequests } = req.body;
        
        // Get property details
        const property = await Property.findById(propertyId).populate('owner');
        
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        
        // Check if property is available
        if (property.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: 'Property is not available for booking'
            });
        }
        
        // Check if property is approved
        if (!property.isApproved) {
            return res.status(400).json({
                success: false,
                message: 'Property is not approved yet'
            });
        }
        
        // Calculate check-out date
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkIn);
        checkOut.setMonth(checkOut.getMonth() + parseInt(duration));
        
        // Calculate totals
        const monthlyRent = property.price;
        const durationMonths = parseInt(duration);
        const securityDeposit = monthlyRent * 2;
        const totalAmount = (monthlyRent * durationMonths) + securityDeposit;
        
        // Create booking with unique reference
        const booking = await Booking.create({
            property: propertyId,
            renter: req.user._id,
            landlord: property.owner._id,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            duration: durationMonths,
            monthlyRent: monthlyRent,
            securityDeposit: securityDeposit,
            totalAmount: totalAmount,
            numberOfOccupants: numberOfOccupants || 1,
            specialRequests: specialRequests || ''
        });
        
        // Populate the booking
        await booking.populate('property renter landlord');
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
});

// @route   GET /api/bookings/:id/invoice
// @desc    Generate and download booking invoice PDF
// @access  Private
router.get('/:id/invoice', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('property')
            .populate('renter', 'name email phone')
            .populate('landlord', 'name email phone');
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Check if user is authorized to download this invoice
        if (booking.renter._id.toString() !== req.user._id.toString() &&
            booking.landlord._id.toString() !== req.user._id.toString() &&
            req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this invoice'
            });
        }
        
        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=booking-invoice-${booking.bookingReference || booking._id}.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Colors
        const primaryColor = '#1e3a8a';
        const accentColor = '#3b82f6';
        const textColor = '#374151';
        const lightGray = '#9ca3af';
        
        // Header
        doc.fillColor(primaryColor)
           .fontSize(28)
           .font('Helvetica-Bold')
           .text('ESTATE', 50, 50);
        
        doc.fillColor(lightGray)
           .fontSize(10)
           .font('Helvetica')
           .text('House Rental System', 50, 80);
        
        // Invoice Title
        doc.fillColor(primaryColor)
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('BOOKING INVOICE', 350, 50, { align: 'right' });
        
        // Invoice Number and Date
        doc.fillColor(textColor)
           .fontSize(10)
           .font('Helvetica')
           .text(`Invoice No: ${booking.bookingReference || booking._id.toString().slice(-8).toUpperCase()}`, 350, 85, { align: 'right' })
           .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 350, 100, { align: 'right' });
        
        // Horizontal Line
        doc.moveTo(50, 130)
           .lineTo(550, 130)
           .strokeColor(accentColor)
           .lineWidth(2)
           .stroke();
        
        // Customer Details Section
        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('BILL TO:', 50, 150);
        
        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica')
           .text(booking.renter.name, 50, 170)
           .text(booking.renter.email, 50, 185)
           .text(booking.renter.phone || 'N/A', 50, 200);
        
        // Booking Reference Section
        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('BOOKING REFERENCE:', 350, 150);
        
        doc.fillColor(accentColor)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text(booking.bookingReference || booking._id.toString().slice(-8).toUpperCase(), 350, 170);
        
        doc.fillColor(textColor)
           .fontSize(10)
           .font('Helvetica')
           .text(`Status: ${booking.bookingStatus.toUpperCase()}`, 350, 195);
        
        // Property Details Section
        doc.fillColor(primaryColor)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('PROPERTY DETAILS', 50, 240);
        
        // Property Box
        doc.roundedRect(50, 260, 500, 80, 5)
           .fillColor('#f3f4f6')
           .fill();
        
        doc.fillColor(textColor)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(booking.property.name, 70, 275);
        
        doc.fillColor(lightGray)
           .fontSize(10)
           .font('Helvetica')
           .text(booking.property.location, 70, 295)
           .text(`Type: ${booking.property.type || 'Residential'}`, 70, 310);
        
        // Booking Details
        doc.fillColor(primaryColor)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('BOOKING DETAILS', 50, 360);
        
        // Table Header
        const tableTop = 385;
        doc.fillColor('#f3f4f6')
           .rect(50, tableTop, 500, 25)
           .fill();
        
        doc.fillColor(textColor)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('Description', 60, tableTop + 8)
           .text('Details', 400, tableTop + 8, { align: 'right' });
        
        // Table Rows
        const rows = [
            ['Check-in Date', new Date(booking.checkInDate).toLocaleDateString('en-IN')],
            ['Check-out Date', new Date(booking.checkOutDate).toLocaleDateString('en-IN')],
            ['Duration', `${booking.duration} months`],
            ['Number of Occupants', booking.numberOfOccupants.toString()],
            ['Monthly Rent', `₹${booking.monthlyRent.toLocaleString('en-IN')}`]
        ];
        
        let rowY = tableTop + 35;
        rows.forEach((row, i) => {
            if (i % 2 === 1) {
                doc.fillColor('#f9fafb')
                   .rect(50, rowY - 5, 500, 25)
                   .fill();
            }
            doc.fillColor(textColor)
               .fontSize(10)
               .font('Helvetica')
               .text(row[0], 60, rowY)
               .font('Helvetica-Bold')
               .text(row[1], 400, rowY, { align: 'right' });
            rowY += 25;
        });
        
        // Payment Summary
        const summaryTop = rowY + 20;
        doc.fillColor(primaryColor)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('PAYMENT SUMMARY', 50, summaryTop);
        
        doc.roundedRect(300, summaryTop + 20, 250, 120, 5)
           .fillColor('#f3f4f6')
           .fill();
        
        const rentTotal = booking.monthlyRent * booking.duration;
        const securityDeposit = booking.securityDeposit || booking.monthlyRent * 2;
        
        doc.fillColor(textColor)
           .fontSize(10)
           .font('Helvetica')
           .text('Rent Total:', 320, summaryTop + 35)
           .text(`₹${rentTotal.toLocaleString('en-IN')}`, 530, summaryTop + 35, { align: 'right' })
           .text('Security Deposit (2 months):', 320, summaryTop + 55)
           .text(`₹${securityDeposit.toLocaleString('en-IN')}`, 530, summaryTop + 55, { align: 'right' });
        
        // Total Line
        doc.moveTo(320, summaryTop + 80)
           .lineTo(530, summaryTop + 80)
           .strokeColor(primaryColor)
           .lineWidth(1)
           .stroke();
        
        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Total Amount:', 320, summaryTop + 95)
           .fontSize(14)
           .text(`₹${booking.totalAmount.toLocaleString('en-IN')}`, 530, summaryTop + 95, { align: 'right' });
        
        doc.fillColor(lightGray)
           .fontSize(9)
           .font('Helvetica')
           .text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`, 320, summaryTop + 120);
        
        // Special Requests
        if (booking.specialRequests) {
            doc.fillColor(primaryColor)
               .fontSize(12)
               .font('Helvetica-Bold')
               .text('Special Requests:', 50, summaryTop + 30);
            
            doc.fillColor(textColor)
               .fontSize(10)
               .font('Helvetica')
               .text(booking.specialRequests, 50, summaryTop + 50, { width: 230 });
        }
        
        // Footer
        const pageHeight = doc.page.height;
        doc.fillColor(lightGray)
           .fontSize(9)
           .font('Helvetica')
           .text('Thank you for choosing Estate - Your Trusted Partner for House Rentals', 50, pageHeight - 80, { align: 'center', width: 500 })
           .text('This is a computer-generated invoice.', 50, pageHeight - 65, { align: 'center', width: 500 })
           .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, pageHeight - 50, { align: 'center', width: 500 });
        
        // Finalize PDF
        doc.end();
        
    } catch (error) {
        console.error('Generate invoice error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating invoice',
            error: error.message
        });
    }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get current user's bookings (renter)
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ renter: req.user._id })
            .populate('property')
            .populate('landlord', 'name email phone')
            .sort('-createdAt');
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
});

// @route   GET /api/bookings/landlord-bookings
// @desc    Get bookings for landlord's properties
// @access  Private (Landlord)
router.get('/landlord-bookings', [protect, landlordOnly], async (req, res) => {
    try {
        const bookings = await Booking.find({ landlord: req.user._id })
            .populate('property')
            .populate('renter', 'name email phone')
            .sort('-createdAt');
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get landlord bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('property')
            .populate('renter', 'name email phone')
            .populate('landlord', 'name email phone');
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Check if user is authorized to view this booking
        if (booking.renter._id.toString() !== req.user._id.toString() &&
            booking.landlord._id.toString() !== req.user._id.toString() &&
            req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }
        
        res.status(200).json({
            success: true,
            booking
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
});

// @route   PUT /api/bookings/:id/confirm
// @desc    Confirm a booking (landlord only)
// @access  Private (Landlord)
router.put('/:id/confirm', [protect, landlordOnly], async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Check if landlord owns the property
        if (booking.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to confirm this booking'
            });
        }
        
        // Check if booking is pending
        if (booking.bookingStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending bookings can be confirmed'
            });
        }
        
        await booking.confirmBooking(req.user._id);
        
        // Update property status to rented (no longer available to other renters)
        await Property.findByIdAndUpdate(booking.property, {
            status: 'rented'
        });
        
        res.status(200).json({
            success: true,
            message: 'Booking confirmed successfully',
            booking
        });
    } catch (error) {
        console.error('Confirm booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error confirming booking',
            error: error.message
        });
    }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const { cancellationReason } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Check if user can cancel (renter or landlord)
        if (booking.renter.toString() !== req.user._id.toString() &&
            booking.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }
        
        // Check if booking can be cancelled
        if (booking.bookingStatus === 'completed' || booking.bookingStatus === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'This booking cannot be cancelled'
            });
        }
        
        await booking.cancelBooking(req.user._id, cancellationReason);
        
        // Update property status back to available
        await Property.findByIdAndUpdate(booking.property, {
            status: 'available'
        });
        
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            booking
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        });
    }
});

// @route   POST /api/bookings/:id/payment
// @desc    Process payment for booking
// @access  Private
router.post('/:id/payment', protect, [
    body('amount').isNumeric().withMessage('Payment amount is required'),
    body('paymentMethod').isIn(['card', 'upi', 'netbanking', 'wallet', 'cash']).withMessage('Valid payment method is required'),
    body('transactionId').optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    
    try {
        const { amount, paymentMethod, transactionId } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Check if user is the renter
        if (booking.renter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to make payment for this booking'
            });
        }
        
        // Check if booking is confirmed
        if (booking.bookingStatus !== 'confirmed' && booking.bookingStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Booking must be confirmed before payment'
            });
        }
        
        // In a real application, integrate with payment gateway here
        // For now, we'll simulate successful payment
        const txnId = transactionId || 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        await booking.completePayment(parseFloat(amount), txnId, paymentMethod);
        
        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            booking,
            transactionId: txnId
        });
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
});

// @route   GET /api/bookings/property/:propertyId
// @desc    Get all bookings for a specific property (landlord only)
// @access  Private (Landlord)
router.get('/property/:propertyId', [protect, landlordOnly], async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        
        // Check if user owns the property
        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view bookings for this property'
            });
        }
        
        const bookings = await Booking.find({ property: req.params.propertyId })
            .populate('renter', 'name email phone')
            .sort('-createdAt');
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get property bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
});

module.exports = router;
