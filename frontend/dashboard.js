
// Dashboard Component - shows different views for renter and landlord
// NO NAVBAR - Only Logout button displayed
function Dashboard(props) {
    const e = React.createElement;
    const { useState } = React;
    
    // Get user data from props
    const userData = props.userData;
    const userType = userData ? userData.userType : 'renter';
    const userName = userData ? userData.name : 'User';
    
    // logout function
    const handleLogout = function() {
        if(confirm('Are you sure you want to logout?')) {
            props.onLogout();
        }
    };
    
    return e('div', { className: 'dashboard' },
        // dashboard header - NO NAVBAR, only Logout button
        e('div', { className: 'dashboard-header' },
            e('div', { className: 'container' },
                e('div', { className: 'dashboard-header-content' },
                    e('div', { className: 'dashboard-welcome' },
                        e('h1', null, 'Welcome back, ' + userName + '!'),
                        e('p', null, userType === 'renter' ? 'Find your perfect home' : 'Manage your properties')
                    ),
                    e('button', { 
                        className: 'btn-logout',
                        onClick: handleLogout,
                        'data-testid': 'logout-btn'
                    }, 
                        e('i', { className: 'fas fa-sign-out-alt' }),
                        ' Logout'
                    )
                )
            )
        ),
        
        // show different content based on user type
        userType === 'renter' ? 
            e(RenterDashboard, { userData: userData, onNavigateToBooking: props.onNavigateToBooking }) : 
            e(LandlordDashboard, { userData: userData, onNavigateToBooking: props.onNavigateToBooking })
    );
}

// Renter Dashboard - for viewing approved properties and bookings
function RenterDashboard(props) {
    const e = React.createElement;
    const { useState, useEffect } = React;
    
    const userData = props.userData;
    
    // state for view toggle
    const stateCurrentView = useState('properties');
    const currentView = stateCurrentView[0];
    const setCurrentView = stateCurrentView[1];
    
    // state for properties
    const stateProperties = useState([]);
    const properties = stateProperties[0];
    const setProperties = stateProperties[1];
    
    const stateLoading = useState(true);
    const loading = stateLoading[0];
    const setLoading = stateLoading[1];
    
    // state for bookings
    const stateBookings = useState([]);
    const bookings = stateBookings[0];
    const setBookings = stateBookings[1];
    
    const stateBookingsLoading = useState(false);
    const bookingsLoading = stateBookingsLoading[0];
    const setBookingsLoading = stateBookingsLoading[1];
    
    // state for filters
    const stateSearch = useState('');
    const searchQuery = stateSearch[0];
    const setSearchQuery = stateSearch[1];
    
    const statePriceRange = useState('all');
    const priceRange = statePriceRange[0];
    const setPriceRange = statePriceRange[1];
    
    const stateLocation = useState('all');
    const selectedLocation = stateLocation[0];
    const setSelectedLocation = stateLocation[1];
    
    // ZIP code search state
    const stateZipSearch = useState('');
    const zipSearch = stateZipSearch[0];
    const setZipSearch = stateZipSearch[1];
    
    const stateIsSearchingByZip = useState(false);
    const isSearchingByZip = stateIsSearchingByZip[0];
    const setIsSearchingByZip = stateIsSearchingByZip[1];
    
    // Fetch approved properties
    useEffect(function() {
        fetchProperties();
    }, []);
    
    const fetchProperties = function(zipcode) {
        const token = localStorage.getItem('token');
        
        let url = '' + API_BASE_URL + '/properties/approved';
        
        // Add ZIP code filter if provided
        if (zipcode && zipcode.length >= 5) {
            url += '?zipcode=' + encodeURIComponent(zipcode);
            setIsSearchingByZip(true);
        } else {
            setIsSearchingByZip(false);
        }
        
        setLoading(true);
        
        fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.text();
        })
        .then(text => {
            if (!text) {
                console.log('Empty response from properties API');
                setLoading(false);
                return;
            }
            const data = JSON.parse(text);
            console.log('Approved properties response:', data);
            if(data.success) {
                setProperties(data.properties);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error('Error fetching properties:', err);
            setLoading(false);
        });
    };
    
    // Fetch user's bookings
    const fetchBookings = function() {
        setBookingsLoading(true);
        const token = localStorage.getItem('token');
        
        fetch('' + API_BASE_URL + '/bookings/my-bookings', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                setBookings(data.bookings);
            }
            setBookingsLoading(false);
        })
        .catch(err => {
            console.error('Error fetching bookings:', err);
            setBookingsLoading(false);
        });
    };
    
    // Load bookings when switching to bookings view
    useEffect(function() {
        if(currentView === 'bookings') {
            fetchBookings();
        }
    }, [currentView]);
    
    // Handle book now button - Navigate to dedicated booking page instead of modal
    const handleBookNow = function(property) {
        if (props.onNavigateToBooking) {
            props.onNavigateToBooking(property);
        }
    };
    
    // Cancel booking
    const handleCancelBooking = function(bookingId) {
        if(!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }
        
        const reason = prompt('Please provide a cancellation reason:');
        if(!reason) return;
        
        const token = localStorage.getItem('token');
        
        fetch('' + API_BASE_URL + '/bookings/' + bookingId + '/cancel', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ cancellationReason: reason })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                alert('Booking cancelled successfully');
                fetchBookings();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(err => {
            console.error('Error cancelling booking:', err);
            alert('Failed to cancel booking');
        });
    };
    
    // filter properties based on search and filters
    const filteredProps = properties.filter(function(prop) {
        // search filter
        const matchSearch = prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prop.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        // price filter
        let matchPrice = true;
        if(priceRange !== 'all') {
            const price = prop.price;
            if(priceRange === 'low') matchPrice = price < 35000;
            else if(priceRange === 'medium') matchPrice = price >= 35000 && price <= 55000;
            else if(priceRange === 'high') matchPrice = price > 55000;
        }
        
        // location filter
        const matchLocation = selectedLocation === 'all' || 
                             prop.location.includes(selectedLocation);
        
        return matchSearch && matchPrice && matchLocation;
    });
    
    // get unique locations
    const locations = ['all'];
    properties.forEach(function(prop) {
        const city = prop.city || prop.location.split(',')[0];
        if(!locations.includes(city)) {
            locations.push(city);
        }
    });
    
    if(loading) {
        return e('div', { className: 'container', style: { padding: '40px 20px', textAlign: 'center' } },
            e('i', { className: 'fas fa-spinner fa-spin', style: { fontSize: '48px', color: '#3b82f6' } }),
            e('p', { style: { marginTop: '20px' } }, 'Loading properties...')
        );
    }
    
    return e('div', { className: 'renter-dashboard' },
        e('div', { className: 'container' },
            // Tab navigation
            e('div', { className: 'dashboard-tabs' },
                e('button', { 
                    className: currentView === 'properties' ? 'tab-btn active' : 'tab-btn',
                    onClick: function() { setCurrentView('properties'); }
                }, 
                    e('i', { className: 'fas fa-home' }),
                    ' Browse Properties'
                ),
                e('button', { 
                    className: currentView === 'bookings' ? 'tab-btn active' : 'tab-btn',
                    onClick: function() { setCurrentView('bookings'); }
                }, 
                    e('i', { className: 'fas fa-calendar-check' }),
                    ' My Bookings'
                )
            ),
            
            // Content based on view
            currentView === 'properties' ?
                // Properties view
                e('div', null,
                    // Rental Trends Widget
                    e(RentalTrendsWidget),
                    
                    // filters section
                    e('div', { className: 'dashboard-filters' },
                        e('h2', null, 'Browse Available Properties'),
                        
                        // ZIP Code Search Box
                        e('div', { 
                            className: 'zip-search-box',
                            style: {
                                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                padding: '20px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                border: '2px solid #bfdbfe'
                            }
                        },
                            e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
                                e('i', { className: 'fas fa-map-pin', style: { color: '#2563eb', fontSize: '18px' } }),
                                e('h3', { style: { margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e40af' } }, 'Search by ZIP Code')
                            ),
                            e('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
                                e('input', {
                                    type: 'text',
                                    placeholder: 'Enter ZIP Code (e.g., 400001)',
                                    value: zipSearch,
                                    onChange: function(ev) { setZipSearch(ev.target.value.replace(/\D/g, '')); },
                                    maxLength: 6,
                                    'data-testid': 'zip-search-input',
                                    style: {
                                        flex: '1',
                                        minWidth: '200px',
                                        padding: '12px 16px',
                                        border: '2px solid #93c5fd',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        outline: 'none'
                                    }
                                }),
                                e('button', {
                                    type: 'button',
                                    onClick: function() { fetchProperties(zipSearch); },
                                    disabled: zipSearch.length < 5,
                                    'data-testid': 'zip-search-btn',
                                    style: {
                                        padding: '12px 24px',
                                        background: zipSearch.length < 5 ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: zipSearch.length < 5 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }
                                },
                                    e('i', { className: 'fas fa-search' }),
                                    'Search'
                                ),
                                isSearchingByZip && e('button', {
                                    type: 'button',
                                    onClick: function() { setZipSearch(''); fetchProperties(); },
                                    'data-testid': 'clear-zip-search-btn',
                                    style: {
                                        padding: '12px 20px',
                                        background: '#f1f5f9',
                                        color: '#64748b',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }
                                },
                                    e('i', { className: 'fas fa-times' }),
                                    'Clear'
                                )
                            ),
                            isSearchingByZip && e('div', { 
                                style: { 
                                    marginTop: '12px', 
                                    padding: '8px 12px', 
                                    background: '#dbeafe', 
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                } 
                            },
                                e('i', { className: 'fas fa-info-circle', style: { color: '#2563eb' } }),
                                e('span', { style: { fontSize: '14px', color: '#1e40af' } }, 
                                    'Showing properties for ZIP code: ' + zipSearch
                                )
                            )
                        ),
                        
                        e('div', { className: 'filter-controls' },
                            // search box
                            e('div', { className: 'filter-item search-filter' },
                                e('i', { className: 'fas fa-search' }),
                                e('input', {
                                    type: 'text',
                                    placeholder: 'Search by name, description...',
                                    value: searchQuery,
                                    onChange: function(ev) { setSearchQuery(ev.target.value); }
                                })
                            ),
                            
                            // price filter
                            e('div', { className: 'filter-item' },
                                e('label', null, 
                                    e('i', { className: 'fas fa-rupee-sign' }),
                                    ' Price Range'
                                ),
                                e('select', {
                                    value: priceRange,
                                    onChange: function(ev) { setPriceRange(ev.target.value); }
                                },
                                    e('option', { value: 'all' }, 'All Prices'),
                                    e('option', { value: 'low' }, 'Under ₹35,000'),
                                    e('option', { value: 'medium' }, '₹35,000 - ₹55,000'),
                                    e('option', { value: 'high' }, 'Above ₹55,000')
                                )
                            ),
                            
                            // location filter
                            e('div', { className: 'filter-item' },
                                e('label', null,
                                    e('i', { className: 'fas fa-map-marker-alt' }),
                                    ' Location'
                                ),
                                e('select', {
                                    value: selectedLocation,
                                    onChange: function(ev) { setSelectedLocation(ev.target.value); }
                                }, locations.map(function(loc) {
                                    return e('option', { value: loc, key: loc }, 
                                        loc === 'all' ? 'All Locations' : loc
                                    );
                                }))
                            )
                        )
                    ),
                    
                    // results count
                    e('div', { className: 'results-info' },
                        e('p', null, 
                            'Found ',
                            e('strong', null, filteredProps.length),
                            ' properties'
                        )
                    ),
                    
                    // properties grid
                    filteredProps.length > 0 ?
                        e('div', { className: 'properties-grid' },
                            filteredProps.map(function(property) {
                                return e('div', { 
                                    className: 'property-card',
                                    key: property._id
                                },
                                    e('div', { className: 'property-image-container' },
                                        e('img', { 
                                            src: property.imageBase64 ? 
                                                'data:image/jpeg;base64,' + property.imageBase64 : 
                                                property.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
                                            alt: property.name 
                                        }),
                                        e('div', { className: 'property-type-badge' },
                                            property.type
                                        )
                                    ),
                                    
                                    e('div', { className: 'property-info' },
                                        e('h3', null, property.name),
                                        e('div', { className: 'property-location' },
                                            e('i', { className: 'fas fa-map-marker-alt' }),
                                            e('span', null, property.location)
                                        ),
                                        e('div', { className: 'property-price' }, 
                                            '₹' + property.price.toLocaleString(),
                                            e('span', null, '/month')
                                        ),
                                        
                                        e('button', { 
                                            className: 'btn btn-primary',
                                            onClick: function() { handleBookNow(property); }
                                        }, 
                                            e('i', { className: 'fas fa-calendar-check' }),
                                            ' Book Now'
                                        )
                                    )
                                );
                            })
                        )
                        :
                        e('div', { className: 'no-properties-message' },
                            e('i', { className: 'fas fa-search' }),
                            e('h3', null, 'No properties found'),
                            e('p', null, 'Try adjusting your search filters')
                        )
                )
                :
                // Bookings view
                e('div', { className: 'my-bookings-section' },
                    e('h2', null, 'My Bookings'),
                    
                    bookingsLoading ?
                        e('div', { style: { textAlign: 'center', padding: '40px' } },
                            e('i', { className: 'fas fa-spinner fa-spin', style: { fontSize: '48px', color: '#3b82f6' } })
                        )
                        :
                        bookings.length > 0 ?
                            e('div', { className: 'bookings-list' },
                                bookings.map(function(booking) {
                                    const checkIn = new Date(booking.checkInDate).toLocaleDateString();
                                    const checkOut = new Date(booking.checkOutDate).toLocaleDateString();
                                    
                                    return e('div', { 
                                        className: 'booking-card',
                                        key: booking._id
                                    },
                                        e('div', { className: 'booking-header' },
                                            e('h3', null, booking.property ? booking.property.name : 'Property'),
                                            e('div', { 
                                                className: 'booking-status-badge ' + booking.bookingStatus,
                                                style: {
                                                    padding: '5px 15px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    backgroundColor: 
                                                        booking.bookingStatus === 'confirmed' ? '#10b981' :
                                                        booking.bookingStatus === 'pending' ? '#f59e0b' :
                                                        booking.bookingStatus === 'cancelled' ? '#ef4444' : '#6b7280',
                                                    color: 'white'
                                                }
                                            }, booking.bookingStatus)
                                        ),
                                        
                                        e('div', { className: 'booking-details' },
                                            e('div', { className: 'booking-detail-item' },
                                                e('i', { className: 'fas fa-calendar' }),
                                                e('span', null, 
                                                    e('strong', null, 'Check-in: '),
                                                    checkIn
                                                )
                                            ),
                                            e('div', { className: 'booking-detail-item' },
                                                e('i', { className: 'fas fa-calendar' }),
                                                e('span', null, 
                                                    e('strong', null, 'Check-out: '),
                                                    checkOut
                                                )
                                            ),
                                            e('div', { className: 'booking-detail-item' },
                                                e('i', { className: 'fas fa-clock' }),
                                                e('span', null, 
                                                    e('strong', null, 'Duration: '),
                                                    booking.duration + ' months'
                                                )
                                            ),
                                            e('div', { className: 'booking-detail-item' },
                                                e('i', { className: 'fas fa-rupee-sign' }),
                                                e('span', null, 
                                                    e('strong', null, 'Total Amount: '),
                                                    '₹' + booking.totalAmount.toLocaleString()
                                                )
                                            ),
                                            e('div', { className: 'booking-detail-item' },
                                                e('i', { className: 'fas fa-credit-card' }),
                                                e('span', null, 
                                                    e('strong', null, 'Payment: '),
                                                    booking.paymentStatus.toUpperCase()
                                                )
                                            )
                                        ),
                                        
                                        e('div', { className: 'booking-actions' },
                                            booking.bookingStatus === 'pending' || booking.bookingStatus === 'confirmed' ?
                                                e('button', { 
                                                    className: 'btn btn-danger btn-small',
                                                    onClick: function() { handleCancelBooking(booking._id); }
                                                }, 
                                                    e('i', { className: 'fas fa-times' }),
                                                    ' Cancel Booking'
                                                )
                                                : null
                                        )
                                    );
                                })
                            )
                            :
                            e('div', { className: 'no-properties-message' },
                                e('i', { className: 'fas fa-calendar-times' }),
                                e('h3', null, 'No bookings yet'),
                                e('p', null, 'Book a property to see your bookings here')
                            )
                )
        )
    );
}

// Landlord Dashboard - for managing properties and viewing bookings
function LandlordDashboard(props) {
    const e = React.createElement;
    const { useState, useEffect } = React;
    
    const userData = props.userData;
    
    // state for view toggle
    const stateCurrentView = useState('my-properties');
    const currentView = stateCurrentView[0];
    const setCurrentView = stateCurrentView[1];
    
    // state for properties
    const stateMyProperties = useState([]);
    const myProperties = stateMyProperties[0];
    const setMyProperties = stateMyProperties[1];
    
    const stateLoading = useState(true);
    const loading = stateLoading[0];
    const setLoading = stateLoading[1];
    
    // state for bookings
    const stateBookings = useState([]);
    const bookings = stateBookings[0];
    const setBookings = stateBookings[1];
    
    const stateBookingsLoading = useState(false);
    const bookingsLoading = stateBookingsLoading[0];
    const setBookingsLoading = stateBookingsLoading[1];
    
    // state for new property form
    const stateNewProperty = useState({
        name: '',
        price: '',
        location: '',
        type: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        description: '',
        imageFile: null,
        dalilFile: null,
        dalilType: 'dalil',
        dalilNumber: ''
    });
    const newProperty = stateNewProperty[0];
    const setNewProperty = stateNewProperty[1];
    
    // Fetch landlord's properties
    useEffect(function() {
        fetchMyProperties();
    }, []);
    
    const fetchMyProperties = function() {
        const token = localStorage.getItem('token');
        
        fetch('' + API_BASE_URL + '/properties/my-properties', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log('My properties response:', data);
            if(data.success) {
                setMyProperties(data.properties);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error('Error fetching properties:', err);
            setLoading(false);
        });
    };
    
    // Fetch landlord's bookings
    const fetchBookings = function() {
        setBookingsLoading(true);
        const token = localStorage.getItem('token');
        
        fetch('' + API_BASE_URL + '/bookings/landlord-bookings', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                setBookings(data.bookings);
            }
            setBookingsLoading(false);
        })
        .catch(err => {
            console.error('Error fetching bookings:', err);
            setBookingsLoading(false);
        });
    };
    
    // Load bookings when switching to bookings view
    useEffect(function() {
        if(currentView === 'bookings') {
            fetchBookings();
        }
    }, [currentView]);
    
    // Confirm booking
    const handleConfirmBooking = function(bookingId) {
        if(!confirm('Confirm this booking request?')) {
            return;
        }
        
        const token = localStorage.getItem('token');
        
        fetch('' + API_BASE_URL + '/bookings/' + bookingId + '/confirm', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                alert('Booking confirmed successfully!');
                fetchBookings();
                fetchMyProperties(); // Refresh to update property status
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(err => {
            console.error('Error confirming booking:', err);
            alert('Failed to confirm booking');
        });
    };
    
    // Reject booking
    const handleRejectBooking = function(bookingId) {
        const reason = prompt('Please provide a rejection reason:');
        if(!reason) return;
        
        const token = localStorage.getItem('token');
        
        fetch('' + API_BASE_URL + '/bookings/' + bookingId + '/cancel', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ cancellationReason: reason })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                alert('Booking rejected');
                fetchBookings();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(err => {
            console.error('Error rejecting booking:', err);
            alert('Failed to reject booking');
        });
    };
    
    // Handle input changes
    const handleInputChange = function(field) {
        return function(ev) {
            setNewProperty({
                ...newProperty,
                [field]: ev.target.value
            });
        };
    };
    
    // Handle file upload
    const handleFileChange = function(field) {
        return function(ev) {
            const file = ev.target.files[0];
            if(file) {
                setNewProperty({
                    ...newProperty,
                    [field]: file
                });
            }
        };
    };
    
    // Convert file to base64
    const fileToBase64 = function(file) {
        return new Promise(function(resolve, reject) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function() { 
                // Remove the data URL prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64); 
            };
            reader.onerror = function(error) { reject(error); };
        });
    };
    
    // Handle add property
    const handleAddProperty = async function(ev) {
        ev.preventDefault();
        
        // Validate dalil file
        if(!newProperty.dalilFile) {
            alert('Please upload property proof document (Dalil)');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            
            // Convert files to base64
            let imageBase64 = null;
            if(newProperty.imageFile) {
                imageBase64 = await fileToBase64(newProperty.imageFile);
            }
            
            const dalilBase64 = await fileToBase64(newProperty.dalilFile);
            
            // Prepare property data
            const propertyData = {
                name: newProperty.name,
                price: parseInt(newProperty.price),
                location: newProperty.location,
                type: newProperty.type,
                bedrooms: parseInt(newProperty.bedrooms) || 0,
                bathrooms: parseInt(newProperty.bathrooms) || 0,
                area: parseInt(newProperty.area) || 0,
                description: newProperty.description,
                imageBase64: imageBase64,
                documents: {
                    propertyProof: {
                        documentType: newProperty.dalilType,
                        documentNumber: newProperty.dalilNumber,
                        documentBase64: dalilBase64
                    }
                }
            };
            
            const response = await fetch('' + API_BASE_URL + '/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(propertyData)
            });
            
            const data = await response.json();
            
            if(data.success) {
                alert('Property added successfully! Waiting for admin approval.');
                // Reset form
                setNewProperty({
                    name: '',
                    price: '',
                    location: '',
                    type: '',
                    bedrooms: '',
                    bathrooms: '',
                    area: '',
                    description: '',
                    imageFile: null,
                    dalilFile: null,
                    dalilType: 'dalil',
                    dalilNumber: ''
                });
                // Clear file inputs
                document.getElementById('image-upload').value = '';
                document.getElementById('dalil-upload').value = '';
                // Refresh properties
                fetchMyProperties();
                setCurrentView('my-properties');
            } else {
                alert('Error: ' + data.message);
            }
        } catch(error) {
            console.error('Error adding property:', error);
            alert('Failed to add property. Please try again.');
        }
    };
    
    // Handle delete property
    const handleDeleteProperty = function(propertyId) {
        if(!confirm('Are you sure you want to delete this property?')) {
            return;
        }
        
        const token = localStorage.getItem('token');
        
        fetch('' + API_BASE_URL + '/properties/' + propertyId, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                alert('Property deleted successfully');
                fetchMyProperties();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(err => {
            console.error('Error deleting property:', err);
            alert('Failed to delete property');
        });
    };
    
    if(loading) {
        return e('div', { className: 'container', style: { padding: '40px 20px', textAlign: 'center' } },
            e('i', { className: 'fas fa-spinner fa-spin', style: { fontSize: '48px', color: '#3b82f6' } }),
            e('p', { style: { marginTop: '20px' } }, 'Loading your properties...')
        );
    }
    
    return e('div', { className: 'landlord-dashboard' },
        e('div', { className: 'container' },
            // view toggle
            e('div', { className: 'dashboard-tabs' },
                e('button', { 
                    className: currentView === 'my-properties' ? 'tab-btn active' : 'tab-btn',
                    onClick: function() { setCurrentView('my-properties'); }
                }, 
                    e('i', { className: 'fas fa-list' }),
                    ' My Properties'
                ),
                e('button', { 
                    className: currentView === 'add-property' ? 'tab-btn active' : 'tab-btn',
                    onClick: function() { setCurrentView('add-property'); }
                }, 
                    e('i', { className: 'fas fa-plus-circle' }),
                    ' Add Property'
                ),
                e('button', { 
                    className: currentView === 'bookings' ? 'tab-btn active' : 'tab-btn',
                    onClick: function() { setCurrentView('bookings'); }
                }, 
                    e('i', { className: 'fas fa-calendar-check' }),
                    ' Booking Requests'
                )
            ),
            
            // content based on view
            currentView === 'my-properties' ?
                // my properties view
                e('div', { className: 'my-properties-section' },
                    e('h2', null, 'My Properties'),
                    
                    myProperties.length > 0 ?
                        e('div', { className: 'properties-grid' },
                            myProperties.map(function(property) {
                                return e('div', { 
                                    className: 'property-card landlord-property',
                                    key: property._id
                                },
                                    // Approval status badge
                                    e('div', { 
                                        className: 'approval-badge ' + property.approvalStatus,
                                        style: {
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            padding: '5px 10px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            backgroundColor: property.approvalStatus === 'approved' ? '#10b981' : 
                                                           property.approvalStatus === 'rejected' ? '#ef4444' : '#f59e0b',
                                            color: 'white'
                                        }
                                    }, property.approvalStatus.toUpperCase()),
                                    
                                    // Property status badge (available/rented)
                                    property.approvalStatus === 'approved' && e('div', { 
                                        style: {
                                            position: 'absolute',
                                            top: '50px',
                                            right: '10px',
                                            padding: '5px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            backgroundColor: property.status === 'available' ? '#10b981' : '#6b7280',
                                            color: 'white'
                                        }
                                    }, property.status.toUpperCase()),
                                    
                                    e('div', { className: 'property-image-container' },
                                        e('img', { 
                                            src: property.imageBase64 ? 
                                                'data:image/jpeg;base64,' + property.imageBase64 : 
                                                property.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
                                            alt: property.name 
                                        }),
                                        e('div', { className: 'property-type-badge' },
                                            property.type
                                        )
                                    ),
                                    
                                    // property details
                                    e('div', { className: 'property-dashboard-info' },
                                        e('h3', null, property.name),
                                        e('div', { className: 'property-location-small' },
                                            e('i', { className: 'fas fa-map-marker-alt' }),
                                            e('span', null, property.location)
                                        ),
                                        e('div', { className: 'property-price-large' }, 
                                            '₹' + property.price.toLocaleString(),
                                            e('span', null, '/month')
                                        ),
                                        
                                        property.approvalStatus === 'rejected' && property.rejectionReason &&
                                            e('div', { 
                                                style: { 
                                                    marginTop: '10px', 
                                                    padding: '10px', 
                                                    backgroundColor: '#fee2e2',
                                                    borderRadius: '5px',
                                                    fontSize: '14px'
                                                }
                                            },
                                                e('strong', null, 'Rejection Reason: '),
                                                property.rejectionReason
                                            ),
                                        
                                        // landlord action buttons
                                        e('div', { className: 'property-actions' },
                                            e('button', { 
                                                className: 'btn btn-danger btn-small',
                                                onClick: function() {
                                                    handleDeleteProperty(property._id);
                                                }
                                            }, 
                                                e('i', { className: 'fas fa-trash' }),
                                                ' Delete'
                                            )
                                        )
                                    )
                                );
                            })
                        )
                        :
                        e('div', { className: 'no-properties-message' },
                            e('i', { className: 'fas fa-home' }),
                            e('h3', null, 'No properties yet'),
                            e('p', null, 'Add your first property to get started'),
                            e('button', {
                                className: 'btn btn-primary',
                                onClick: function() { setCurrentView('add-property'); }
                            }, 'Add Property')
                        )
                )
                :
                currentView === 'add-property' ?
                // add property form
                e('div', { className: 'add-property-section' },
                    e('h2', null, 'Add New Property'),
                    e('p', { style: { color: '#64748b', marginBottom: '20px' } }, 
                        'Fill in the details below. Your property will be visible to renters after admin approval.'
                    ),
                    
                    e('form', { 
                        className: 'add-property-form',
                        onSubmit: handleAddProperty
                    },
                        // property name
                        e('div', { className: 'form-group' },
                            e('label', null, 
                                e('i', { className: 'fas fa-building' }),
                                ' Property Name *'
                            ),
                            e('input', {
                                type: 'text',
                                placeholder: 'e.g., Prestige Palm Court',
                                value: newProperty.name,
                                onChange: handleInputChange('name'),
                                required: true
                            })
                        ),
                        
                        // price and location row
                        e('div', { className: 'form-row' },
                            e('div', { className: 'form-group' },
                                e('label', null,
                                    e('i', { className: 'fas fa-rupee-sign' }),
                                    ' Monthly Rent *'
                                ),
                                e('input', {
                                    type: 'number',
                                    placeholder: 'e.g., 25000',
                                    value: newProperty.price,
                                    onChange: handleInputChange('price'),
                                    required: true
                                })
                            ),
                            e('div', { className: 'form-group' },
                                e('label', null,
                                    e('i', { className: 'fas fa-map-marker-alt' }),
                                    ' Location *'
                                ),
                                e('input', {
                                    type: 'text',
                                    placeholder: 'e.g., Mumbai, Maharashtra',
                                    value: newProperty.location,
                                    onChange: handleInputChange('location'),
                                    required: true
                                })
                            )
                        ),
                        
                        // property type
                        e('div', { className: 'form-group' },
                            e('label', null,
                                e('i', { className: 'fas fa-home' }),
                                ' Property Type *'
                            ),
                            e('select', {
                                value: newProperty.type,
                                onChange: handleInputChange('type'),
                                required: true
                            },
                                e('option', { value: '' }, 'Select property type'),
                                e('option', { value: 'Luxury Apartment' }, 'Luxury Apartment'),
                                e('option', { value: 'Modern Villa' }, 'Modern Villa'),
                                e('option', { value: 'Premium Residence' }, 'Premium Residence'),
                                e('option', { value: 'Urban Home' }, 'Urban Home'),
                                e('option', { value: 'Garden Estate' }, 'Garden Estate'),
                                e('option', { value: 'Coastal Villa' }, 'Coastal Villa'),
                                e('option', { value: 'Modern Apartment' }, 'Modern Apartment'),
                                e('option', { value: 'Luxury Penthouse' }, 'Luxury Penthouse'),
                                e('option', { value: 'Studio Apartment' }, 'Studio Apartment'),
                                e('option', { value: 'Duplex' }, 'Duplex')
                            )
                        ),
                        
                        // bedrooms, bathrooms, area
                        e('div', { className: 'form-row' },
                            e('div', { className: 'form-group' },
                                e('label', null,
                                    e('i', { className: 'fas fa-bed' }),
                                    ' Bedrooms'
                                ),
                                e('input', {
                                    type: 'number',
                                    placeholder: 'e.g., 3',
                                    value: newProperty.bedrooms,
                                    onChange: handleInputChange('bedrooms'),
                                    min: 0
                                })
                            ),
                            e('div', { className: 'form-group' },
                                e('label', null,
                                    e('i', { className: 'fas fa-bath' }),
                                    ' Bathrooms'
                                ),
                                e('input', {
                                    type: 'number',
                                    placeholder: 'e.g., 2',
                                    value: newProperty.bathrooms,
                                    onChange: handleInputChange('bathrooms'),
                                    min: 0
                                })
                            ),
                            e('div', { className: 'form-group' },
                                e('label', null,
                                    e('i', { className: 'fas fa-ruler-combined' }),
                                    ' Area (sqft)'
                                ),
                                e('input', {
                                    type: 'number',
                                    placeholder: 'e.g., 1200',
                                    value: newProperty.area,
                                    onChange: handleInputChange('area'),
                                    min: 0
                                })
                            )
                        ),
                        
                        // description
                        e('div', { className: 'form-group' },
                            e('label', null,
                                e('i', { className: 'fas fa-align-left' }),
                                ' Description'
                            ),
                            e('textarea', {
                                placeholder: 'Describe your property...',
                                value: newProperty.description,
                                onChange: handleInputChange('description'),
                                rows: 4
                            })
                        ),
                        
                        // property image
                        e('div', { className: 'form-group' },
                            e('label', null,
                                e('i', { className: 'fas fa-image' }),
                                ' Property Image'
                            ),
                            e('input', {
                                id: 'image-upload',
                                type: 'file',
                                accept: 'image/*',
                                onChange: handleFileChange('imageFile')
                            }),
                            e('small', null, 'Upload a clear photo of your property')
                        ),
                        
                        // dalil document
                        e('div', { className: 'form-group', style: { backgroundColor: '#fef3c7', padding: '20px', borderRadius: '10px' } },
                            e('label', null,
                                e('i', { className: 'fas fa-file-contract' }),
                                ' Property Proof Document (Dalil) *'
                            ),
                            e('div', { className: 'form-row' },
                                e('div', { className: 'form-group' },
                                    e('label', null, 'Document Type *'),
                                    e('select', {
                                        value: newProperty.dalilType,
                                        onChange: handleInputChange('dalilType'),
                                        required: true
                                    },
                                        e('option', { value: 'dalil' }, 'Dalil'),
                                        e('option', { value: 'sale_deed' }, 'Sale Deed'),
                                        e('option', { value: 'registry' }, 'Registry'),
                                        e('option', { value: 'other' }, 'Other')
                                    )
                                ),
                                e('div', { className: 'form-group' },
                                    e('label', null, 'Document Number'),
                                    e('input', {
                                        type: 'text',
                                        placeholder: 'Document/Registry number',
                                        value: newProperty.dalilNumber,
                                        onChange: handleInputChange('dalilNumber')
                                    })
                                )
                            ),
                            e('input', {
                                id: 'dalil-upload',
                                type: 'file',
                                accept: 'image/*,application/pdf',
                                onChange: handleFileChange('dalilFile'),
                                required: true
                            }),
                            e('small', null, 
                                e('i', { className: 'fas fa-info-circle' }),
                                ' This document is required for verification. Upload your property ownership proof (Dalil, Sale Deed, Registry, etc.)'
                            )
                        ),
                        
                        // submit buttons
                        e('div', { className: 'form-actions' },
                            e('button', { 
                                type: 'submit',
                                className: 'btn btn-primary btn-large'
                            }, 
                                e('i', { className: 'fas fa-plus-circle' }),
                                ' Add Property'
                            ),
                            e('button', { 
                                type: 'button',
                                className: 'btn btn-outline btn-large',
                                onClick: function() { setCurrentView('my-properties'); }
                            }, 'Cancel')
                        )
                    )
                )
                :
                // bookings view
                e('div', { className: 'landlord-bookings-section' },
                    e('h2', null, 'Booking Requests'),
                    
                    bookingsLoading ?
                        e('div', { style: { textAlign: 'center', padding: '40px' } },
                            e('i', { className: 'fas fa-spinner fa-spin', style: { fontSize: '48px', color: '#3b82f6' } })
                        )
                        :
                        bookings.length > 0 ?
                            e('div', { className: 'bookings-list' },
                                bookings.map(function(booking) {
                                    const checkIn = new Date(booking.checkInDate).toLocaleDateString();
                                    const checkOut = new Date(booking.checkOutDate).toLocaleDateString();
                                    
                                    return e('div', { 
                                        className: 'booking-card landlord-booking',
                                        key: booking._id
                                    },
                                        e('div', { className: 'booking-header' },
                                            e('div', null,
                                                e('h3', null, booking.property ? booking.property.name : 'Property'),
                                                e('p', { style: { color: '#64748b' } }, 
                                                    'Requested by: ' + (booking.renter ? booking.renter.name : 'Renter')
                                                )
                                            ),
                                            e('div', { 
                                                className: 'booking-status-badge ' + booking.bookingStatus,
                                                style: {
                                                    padding: '5px 15px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    backgroundColor: 
                                                        booking.bookingStatus === 'confirmed' ? '#10b981' :
                                                        booking.bookingStatus === 'pending' ? '#f59e0b' :
                                                        booking.bookingStatus === 'cancelled' ? '#ef4444' : '#6b7280',
                                                    color: 'white'
                                                }
                                            }, booking.bookingStatus)
                                        ),
                                        
                                        e('div', { className: 'booking-details' },
                                            e('div', { className: 'booking-detail-row' },
                                                e('div', { className: 'booking-detail-item' },
                                                    e('i', { className: 'fas fa-calendar' }),
                                                    e('span', null, 
                                                        e('strong', null, 'Check-in: '),
                                                        checkIn
                                                    )
                                                ),
                                                e('div', { className: 'booking-detail-item' },
                                                    e('i', { className: 'fas fa-calendar' }),
                                                    e('span', null, 
                                                        e('strong', null, 'Check-out: '),
                                                        checkOut
                                                    )
                                                )
                                            ),
                                            e('div', { className: 'booking-detail-row' },
                                                e('div', { className: 'booking-detail-item' },
                                                    e('i', { className: 'fas fa-clock' }),
                                                    e('span', null, 
                                                        e('strong', null, 'Duration: '),
                                                        booking.duration + ' months'
                                                    )
                                                ),
                                                e('div', { className: 'booking-detail-item' },
                                                    e('i', { className: 'fas fa-users' }),
                                                    e('span', null, 
                                                        e('strong', null, 'Occupants: '),
                                                        booking.numberOfOccupants
                                                    )
                                                )
                                            ),
                                            e('div', { className: 'booking-detail-item' },
                                                e('i', { className: 'fas fa-rupee-sign' }),
                                                e('span', null, 
                                                    e('strong', null, 'Total Amount: '),
                                                    '₹' + booking.totalAmount.toLocaleString()
                                                )
                                            ),
                                            booking.specialRequests && e('div', { className: 'booking-detail-item' },
                                                e('i', { className: 'fas fa-comment' }),
                                                e('span', null, 
                                                    e('strong', null, 'Special Requests: '),
                                                    booking.specialRequests
                                                )
                                            ),
                                            booking.renter && e('div', { className: 'booking-detail-item' },
                                                e('i', { className: 'fas fa-envelope' }),
                                                e('span', null, 
                                                    e('strong', null, 'Contact: '),
                                                    booking.renter.email + (booking.renter.phone ? ' | ' + booking.renter.phone : '')
                                                )
                                            )
                                        ),
                                        
                                        e('div', { className: 'booking-actions' },
                                            booking.bookingStatus === 'pending' && e('div', null,
                                                e('button', { 
                                                    className: 'btn btn-primary btn-small',
                                                    onClick: function() { handleConfirmBooking(booking._id); }
                                                }, 
                                                    e('i', { className: 'fas fa-check' }),
                                                    ' Confirm Booking'
                                                ),
                                                e('button', { 
                                                    className: 'btn btn-danger btn-small',
                                                    onClick: function() { handleRejectBooking(booking._id); },
                                                    style: { marginLeft: '10px' }
                                                }, 
                                                    e('i', { className: 'fas fa-times' }),
                                                    ' Reject'
                                                )
                                            )
                                        )
                                    );
                                })
                            )
                            :
                            e('div', { className: 'no-properties-message' },
                                e('i', { className: 'fas fa-calendar-times' }),
                                e('h3', null, 'No booking requests yet'),
                                e('p', null, 'Booking requests for your properties will appear here')
                            )
                )
        )
    );
}
