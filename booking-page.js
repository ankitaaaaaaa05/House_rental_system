// BookingPage Component - Dedicated booking page for renters
function BookingPage(props) {
    const e = React.createElement;
    const { useState, useEffect } = React;
    
    const property = props.property;
    const userData = props.userData;
    
    // Form state
    const stateForm = useState({
        checkInDate: '',
        duration: '12',
        numberOfOccupants: '1',
        specialRequests: '',
        fullName: userData ? userData.name : '',
        email: userData ? userData.email : '',
        phone: userData ? userData.phone : ''
    });
    const formData = stateForm[0];
    const setFormData = stateForm[1];
    
    // Submission state
    const stateSubmitting = useState(false);
    const isSubmitting = stateSubmitting[0];
    const setIsSubmitting = stateSubmitting[1];
    
    // Success state
    const stateSuccess = useState(false);
    const bookingSuccess = stateSuccess[0];
    const setBookingSuccess = stateSuccess[1];
    
    // Booking result state
    const stateBookingResult = useState(null);
    const bookingResult = stateBookingResult[0];
    const setBookingResult = stateBookingResult[1];
    
    // Handle form input change
    const handleInputChange = function(field) {
        return function(ev) {
            setFormData(Object.assign({}, formData, {
                [field]: ev.target.value
            }));
        };
    };
    
    // Calculate totals
    const calculateTotal = function() {
        if (!property) return { rent: 0, deposit: 0, total: 0 };
        const monthlyRent = property.price;
        const duration = parseInt(formData.duration) || 1;
        const rentTotal = monthlyRent * duration;
        const securityDeposit = monthlyRent * 2;
        return {
            rent: rentTotal,
            deposit: securityDeposit,
            total: rentTotal + securityDeposit
        };
    };
    
    // Handle form submission
    const handleSubmit = async function(ev) {
        ev.preventDefault();
        
        if (!formData.checkInDate) {
            alert('Please select a check-in date');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(API_BASE_URL + '/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    propertyId: property._id,
                    checkInDate: formData.checkInDate,
                    duration: parseInt(formData.duration),
                    numberOfOccupants: parseInt(formData.numberOfOccupants),
                    specialRequests: formData.specialRequests
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setBookingResult(data.booking);
                setBookingSuccess(true);
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to create booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handle PDF download
    const handleDownloadInvoice = async function() {
        if (!bookingResult) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_BASE_URL + '/bookings/' + bookingResult._id + '/invoice', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'booking-invoice-' + (bookingResult.bookingReference || bookingResult._id) + '.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                alert('Failed to download invoice');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download invoice');
        }
    };
    
    const totals = calculateTotal();
    
    // Success View
    if (bookingSuccess && bookingResult) {
        return e('div', { className: 'booking-page' },
            // Header with only Logout
            e('div', { className: 'dashboard-header', style: { background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' } },
                e('div', { className: 'container' },
                    e('div', { className: 'dashboard-header-content', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' } },
                        e('div', { className: 'dashboard-welcome' },
                            e('h1', { style: { color: 'white', margin: 0 } }, 'Booking Confirmed!'),
                            e('p', { style: { color: 'rgba(255,255,255,0.8)', margin: '5px 0 0 0' } }, 'Your booking has been successfully created')
                        ),
                        e('button', { 
                            className: 'btn-logout',
                            onClick: props.onLogout,
                            style: { background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
                        }, 
                            e('i', { className: 'fas fa-sign-out-alt' }),
                            ' Logout'
                        )
                    )
                )
            ),
            
            // Success Content
            e('div', { className: 'container', style: { padding: '40px 20px' } },
                e('div', { className: 'booking-success-card', style: { maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' } },
                    // Success Icon
                    e('div', { style: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '40px', textAlign: 'center' } },
                        e('div', { style: { width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' } },
                            e('i', { className: 'fas fa-check', style: { fontSize: '40px', color: '#10b981' } })
                        ),
                        e('h2', { style: { color: 'white', margin: '0 0 10px 0', fontSize: '28px' } }, 'Booking Successful!'),
                        e('p', { style: { color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '16px' } }, 'Your booking request has been submitted')
                    ),
                    
                    // Booking Details
                    e('div', { style: { padding: '30px' } },
                        e('div', { style: { background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' } },
                            e('h3', { style: { margin: '0 0 15px 0', color: '#1e3a8a' } }, 'Booking Reference'),
                            e('p', { style: { fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', margin: 0 } }, 
                                bookingResult.bookingReference || bookingResult._id.slice(-8).toUpperCase()
                            )
                        ),
                        
                        e('div', { className: 'booking-details-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' } },
                            e('div', null,
                                e('p', { style: { color: '#64748b', margin: '0 0 5px 0', fontSize: '14px' } }, 'Property'),
                                e('p', { style: { fontWeight: '600', margin: 0 } }, property.name)
                            ),
                            e('div', null,
                                e('p', { style: { color: '#64748b', margin: '0 0 5px 0', fontSize: '14px' } }, 'Location'),
                                e('p', { style: { fontWeight: '600', margin: 0 } }, property.location)
                            ),
                            e('div', null,
                                e('p', { style: { color: '#64748b', margin: '0 0 5px 0', fontSize: '14px' } }, 'Check-in Date'),
                                e('p', { style: { fontWeight: '600', margin: 0 } }, new Date(bookingResult.checkInDate).toLocaleDateString())
                            ),
                            e('div', null,
                                e('p', { style: { color: '#64748b', margin: '0 0 5px 0', fontSize: '14px' } }, 'Duration'),
                                e('p', { style: { fontWeight: '600', margin: 0 } }, bookingResult.duration + ' months')
                            ),
                            e('div', null,
                                e('p', { style: { color: '#64748b', margin: '0 0 5px 0', fontSize: '14px' } }, 'Monthly Rent'),
                                e('p', { style: { fontWeight: '600', margin: 0 } }, '₹' + property.price.toLocaleString())
                            ),
                            e('div', null,
                                e('p', { style: { color: '#64748b', margin: '0 0 5px 0', fontSize: '14px' } }, 'Total Amount'),
                                e('p', { style: { fontWeight: '600', margin: 0, color: '#3b82f6', fontSize: '18px' } }, '₹' + bookingResult.totalAmount.toLocaleString())
                            )
                        ),
                        
                        e('div', { style: { background: '#fef3c7', padding: '15px', borderRadius: '8px', marginBottom: '25px' } },
                            e('p', { style: { margin: 0, color: '#92400e', fontSize: '14px' } },
                                e('i', { className: 'fas fa-info-circle', style: { marginRight: '8px' } }),
                                'Your booking is pending landlord confirmation. You will be notified once approved.'
                            )
                        ),
                        
                        // Action Buttons
                        e('div', { style: { display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' } },
                            e('button', {
                                className: 'btn btn-primary',
                                onClick: handleDownloadInvoice,
                                'data-testid': 'download-invoice-btn',
                                style: { padding: '12px 30px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }
                            },
                                e('i', { className: 'fas fa-download' }),
                                ' Download Invoice PDF'
                            ),
                            e('button', {
                                className: 'btn btn-outline',
                                onClick: props.onBack,
                                'data-testid': 'back-to-dashboard-btn',
                                style: { padding: '12px 30px', fontSize: '16px' }
                            },
                                'Back to Dashboard'
                            )
                        )
                    )
                )
            )
        );
    }
    
    // Booking Form View
    return e('div', { className: 'booking-page' },
        // Header with only Logout
        e('div', { className: 'dashboard-header', style: { background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' } },
            e('div', { className: 'container' },
                e('div', { className: 'dashboard-header-content', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' } },
                    e('div', { className: 'dashboard-welcome' },
                        e('h1', { style: { color: 'white', margin: 0 } }, 'Book Property'),
                        e('p', { style: { color: 'rgba(255,255,255,0.8)', margin: '5px 0 0 0' } }, 'Complete your booking details below')
                    ),
                    e('button', { 
                        className: 'btn-logout',
                        onClick: props.onLogout,
                        'data-testid': 'logout-btn',
                        style: { background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
                    }, 
                        e('i', { className: 'fas fa-sign-out-alt' }),
                        ' Logout'
                    )
                )
            )
        ),
        
        // Main Content
        e('div', { className: 'container', style: { padding: '40px 20px' } },
            // Back Button
            e('button', {
                onClick: props.onBack,
                'data-testid': 'back-btn',
                style: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: 0 }
            },
                e('i', { className: 'fas fa-arrow-left' }),
                ' Back to Properties'
            ),
            
            e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px', maxWidth: '1200px' } },
                // Left Column - Booking Form
                e('div', { className: 'booking-form-section', style: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '30px' } },
                    e('h2', { style: { margin: '0 0 25px 0', fontSize: '24px', color: '#1e293b' } }, 'Booking Details'),
                    
                    e('form', { onSubmit: handleSubmit },
                        // Customer Information Section
                        e('div', { style: { marginBottom: '25px' } },
                            e('h3', { style: { fontSize: '16px', color: '#64748b', margin: '0 0 15px 0', textTransform: 'uppercase', letterSpacing: '1px' } }, 'Customer Information'),
                            
                            e('div', { className: 'form-group', style: { marginBottom: '15px' } },
                                e('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' } },
                                    e('i', { className: 'fas fa-user', style: { marginRight: '8px', color: '#3b82f6' } }),
                                    'Full Name'
                                ),
                                e('input', {
                                    type: 'text',
                                    value: formData.fullName,
                                    onChange: handleInputChange('fullName'),
                                    'data-testid': 'fullname-input',
                                    style: { width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px' },
                                    required: true
                                })
                            ),
                            
                            e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' } },
                                e('div', { className: 'form-group' },
                                    e('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' } },
                                        e('i', { className: 'fas fa-envelope', style: { marginRight: '8px', color: '#3b82f6' } }),
                                        'Email'
                                    ),
                                    e('input', {
                                        type: 'email',
                                        value: formData.email,
                                        onChange: handleInputChange('email'),
                                        'data-testid': 'email-input',
                                        style: { width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px' },
                                        required: true
                                    })
                                ),
                                e('div', { className: 'form-group' },
                                    e('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' } },
                                        e('i', { className: 'fas fa-phone', style: { marginRight: '8px', color: '#3b82f6' } }),
                                        'Phone'
                                    ),
                                    e('input', {
                                        type: 'tel',
                                        value: formData.phone,
                                        onChange: handleInputChange('phone'),
                                        'data-testid': 'phone-input',
                                        style: { width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px' },
                                        required: true
                                    })
                                )
                            )
                        ),
                        
                        // Booking Details Section
                        e('div', { style: { marginBottom: '25px' } },
                            e('h3', { style: { fontSize: '16px', color: '#64748b', margin: '0 0 15px 0', textTransform: 'uppercase', letterSpacing: '1px' } }, 'Booking Information'),
                            
                            e('div', { className: 'form-group', style: { marginBottom: '15px' } },
                                e('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' } },
                                    e('i', { className: 'fas fa-calendar', style: { marginRight: '8px', color: '#3b82f6' } }),
                                    'Check-in Date *'
                                ),
                                e('input', {
                                    type: 'date',
                                    value: formData.checkInDate,
                                    onChange: handleInputChange('checkInDate'),
                                    min: new Date().toISOString().split('T')[0],
                                    'data-testid': 'checkin-date-input',
                                    style: { width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px' },
                                    required: true
                                })
                            ),
                            
                            e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' } },
                                e('div', { className: 'form-group' },
                                    e('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' } },
                                        e('i', { className: 'fas fa-clock', style: { marginRight: '8px', color: '#3b82f6' } }),
                                        'Duration (months) *'
                                    ),
                                    e('select', {
                                        value: formData.duration,
                                        onChange: handleInputChange('duration'),
                                        'data-testid': 'duration-select',
                                        style: { width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px' },
                                        required: true
                                    },
                                        e('option', { value: '1' }, '1 Month'),
                                        e('option', { value: '3' }, '3 Months'),
                                        e('option', { value: '6' }, '6 Months'),
                                        e('option', { value: '12' }, '12 Months (1 Year)'),
                                        e('option', { value: '24' }, '24 Months (2 Years)'),
                                        e('option', { value: '36' }, '36 Months (3 Years)')
                                    )
                                ),
                                e('div', { className: 'form-group' },
                                    e('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' } },
                                        e('i', { className: 'fas fa-users', style: { marginRight: '8px', color: '#3b82f6' } }),
                                        'Number of Occupants *'
                                    ),
                                    e('input', {
                                        type: 'number',
                                        value: formData.numberOfOccupants,
                                        onChange: handleInputChange('numberOfOccupants'),
                                        min: 1,
                                        'data-testid': 'occupants-input',
                                        style: { width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px' },
                                        required: true
                                    })
                                )
                            )
                        ),
                        
                        // Special Requests
                        e('div', { className: 'form-group', style: { marginBottom: '25px' } },
                            e('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' } },
                                e('i', { className: 'fas fa-comment', style: { marginRight: '8px', color: '#3b82f6' } }),
                                'Special Requests (Optional)'
                            ),
                            e('textarea', {
                                value: formData.specialRequests,
                                onChange: handleInputChange('specialRequests'),
                                placeholder: 'Any special requirements or requests...',
                                'data-testid': 'special-requests-textarea',
                                rows: 4,
                                style: { width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', resize: 'vertical' }
                            })
                        ),
                        
                        // Submit Button
                        e('button', {
                            type: 'submit',
                            className: 'btn btn-primary',
                            disabled: isSubmitting,
                            'data-testid': 'confirm-booking-btn',
                            style: { width: '100%', padding: '15px', fontSize: '16px', fontWeight: '600' }
                        },
                            isSubmitting ?
                                e('span', null, e('i', { className: 'fas fa-spinner fa-spin', style: { marginRight: '8px' } }), 'Processing...') :
                                e('span', null, e('i', { className: 'fas fa-check-circle', style: { marginRight: '8px' } }), 'Confirm Booking')
                        )
                    )
                ),
                
                // Right Column - Property Summary & Pricing
                e('div', null,
                    // Property Card
                    e('div', { style: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '20px' } },
                        e('img', {
                            src: property.imageBase64 ?
                                'data:image/jpeg;base64,' + property.imageBase64 :
                                property.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
                            alt: property.name,
                            style: { width: '100%', height: '200px', objectFit: 'cover' }
                        }),
                        e('div', { style: { padding: '20px' } },
                            e('div', { style: { display: 'inline-block', background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', marginBottom: '10px' } }, property.type),
                            e('h3', { style: { margin: '0 0 10px 0', fontSize: '18px', color: '#1e293b' } }, property.name),
                            e('p', { style: { margin: '0 0 15px 0', color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' } },
                                e('i', { className: 'fas fa-map-marker-alt' }),
                                property.location
                            ),
                            e('div', { style: { fontSize: '24px', fontWeight: '700', color: '#3b82f6' } },
                                '₹' + property.price.toLocaleString(),
                                e('span', { style: { fontSize: '14px', fontWeight: '400', color: '#64748b' } }, '/month')
                            )
                        )
                    ),
                    
                    // Pricing Summary
                    e('div', { style: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '20px' } },
                        e('h3', { style: { margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b' } }, 'Price Summary'),
                        
                        e('div', { style: { borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' } },
                            e('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' } },
                                e('span', { style: { color: '#64748b' } }, 'Monthly Rent'),
                                e('span', { style: { fontWeight: '500' } }, '₹' + property.price.toLocaleString())
                            ),
                            e('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' } },
                                e('span', { style: { color: '#64748b' } }, 'Duration'),
                                e('span', { style: { fontWeight: '500' } }, formData.duration + ' months')
                            ),
                            e('div', { style: { display: 'flex', justifyContent: 'space-between' } },
                                e('span', { style: { color: '#64748b' } }, 'Rent Total'),
                                e('span', { style: { fontWeight: '500' } }, '₹' + totals.rent.toLocaleString())
                            )
                        ),
                        
                        e('div', { style: { marginBottom: '15px' } },
                            e('div', { style: { display: 'flex', justifyContent: 'space-between' } },
                                e('span', { style: { color: '#64748b' } }, 'Security Deposit (2 months)'),
                                e('span', { style: { fontWeight: '500' } }, '₹' + totals.deposit.toLocaleString())
                            )
                        ),
                        
                        e('div', { style: { borderTop: '2px solid #3b82f6', paddingTop: '15px' } },
                            e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                e('span', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b' } }, 'Total Amount'),
                                e('span', { style: { fontSize: '24px', fontWeight: '700', color: '#3b82f6' } }, '₹' + totals.total.toLocaleString())
                            )
                        )
                    )
                )
            )
        )
    );
}
