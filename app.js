// Enhanced Main App Component with All Features Integrated
if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.error('React is not loaded!');
    document.body.innerHTML = '<h1 style="color:red;padding:20px;">Error: React failed to load. Please check your internet connection.</h1>';
} else {
    console.log('React loaded successfully!');
}

// Main App Component
function App() {
    const e = React.createElement;
    const { useState, useEffect } = React;
    
    // State management
    const stateModal = useState(false);
    const authModalOpen = stateModal[0];
    const setAuthModalOpen = stateModal[1];
    
    const stateMode = useState('login');
    const authMode = stateMode[0];
    const setAuthMode = stateMode[1];
    
    const stateLoggedIn = useState(false);
    const isLoggedIn = stateLoggedIn[0];
    const setIsLoggedIn = stateLoggedIn[1];
    
    const stateUserData = useState(null);
    const userData = stateUserData[0];
    const setUserData = stateUserData[1];
    
    const stateCurrentView = useState('home'); // 'home', 'dashboard', 'verification', 'admin', 'booking'
    const currentView = stateCurrentView[0];
    const setCurrentView = stateCurrentView[1];
    
    // State for booking page
    const stateSelectedProperty = useState(null);
    const selectedProperty = stateSelectedProperty[0];
    const setSelectedProperty = stateSelectedProperty[1];
    
    // Check for existing login on mount
    useEffect(function() {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('userData');
        
        if (token && savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setUserData(user);
                setIsLoggedIn(true);
                
                // Redirect based on user type and verification status
                if (user.userType === 'admin') {
                    setCurrentView('admin');
                } else if (!user.isVerified && user.userType !== 'admin') {
                    setCurrentView('verification');
                } else {
                    setCurrentView('dashboard');
                }
            } catch (error) {
                console.error('Error loading saved user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
            }
        }
    }, []);

    // Handle login button click
    const handleLoginClick = function() {
        setAuthMode('login');
        setAuthModalOpen(true);
    };

    // Handle signup button click
    const handleSignUpClick = function() {
        setAuthMode('signup');
        setAuthModalOpen(true);
    };
    
    // Handle successful login/signup
    const handleLoginSuccess = function(user, token) {
        console.log('Login successful:', user);
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        setUserData(user);
        setIsLoggedIn(true);
        setAuthModalOpen(false);
        
        // Route based on user type and verification
        if (user.userType === 'admin') {
            setCurrentView('admin');
        } else if (!user.isVerified) {
            setCurrentView('verification');
        } else {
            setCurrentView('dashboard');
        }
    };
    
    // Handle logout
    const handleLogout = function() {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setIsLoggedIn(false);
        setUserData(null);
        setCurrentView('home');
        setSelectedProperty(null);
    };
    
    // Handle verification complete
    const handleVerificationComplete = function() {
        // Refresh user data
        const token = localStorage.getItem('token');
        if (token) {
            fetch(API_BASE_URL + '/auth/me', {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const updatedUser = data.user;
                    setUserData(updatedUser);
                    localStorage.setItem('userData', JSON.stringify(updatedUser));
                    setCurrentView('dashboard');
                }
            })
            .catch(err => console.error('Error refreshing user:', err));
        }
    };
    
    // Handle skip verification
    const handleSkipVerification = function() {
        setCurrentView('dashboard');
    };
    
    // Handle navigate to booking page
    const handleNavigateToBooking = function(property) {
        setSelectedProperty(property);
        setCurrentView('booking');
    };
    
    // Handle back to dashboard from booking
    const handleBackToDashboard = function() {
        setSelectedProperty(null);
        setCurrentView('dashboard');
    };
    
    // Render based on current view
    const renderContent = function() {
        // Admin Dashboard - NO NAVBAR, ONLY LOGOUT
        if (isLoggedIn && userData && userData.userType === 'admin') {
            return e('div', null,
                e('div', { style: { minHeight: '100vh', background: '#f8fafc' } },
                    e('div', { className: 'container', style: { padding: '40px 20px' } },
                        e('h1', { style: { fontSize: '32px', fontWeight: '700', marginBottom: '10px' } }, 'Admin Dashboard'),
                        e('p', { style: { color: '#64748b', marginBottom: '30px' } }, 'Manage users and properties'),
                        e(AdminDashboard, { user: userData, onLogout: handleLogout })
                    )
                ),
                e(Footer)
            );
        }
        
        // Booking Page - Dedicated booking page - NO NAVBAR
        if (isLoggedIn && currentView === 'booking' && selectedProperty) {
            return e('div', null,
                e(BookingPage, {
                    property: selectedProperty,
                    userData: userData,
                    onBack: handleBackToDashboard,
                    onLogout: handleLogout
                }),
                e(Footer)
            );
        }
        
        // Dashboard (for verified users or if user skipped verification via currentView) - NO NAVBAR
        if (isLoggedIn && currentView === 'dashboard') {
            return e('div', null,
                e(Dashboard, { 
                    userData: userData,
                    onLogout: handleLogout,
                    onNavigateToBooking: handleNavigateToBooking
                }),
                e(Footer)
            );
        }
        
        // Verification Page - Show for non-verified users (except admin) on verification view - NO NAVBAR
        if (isLoggedIn && userData && !userData.isVerified && userData.userType !== 'admin' && currentView === 'verification') {
            return e('div', null,
                e('div', { className: 'dashboard-header', style: { background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '20px 0' } },
                    e('div', { className: 'container' },
                        e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                            e('h1', { style: { color: 'white', fontSize: '24px', margin: 0 } }, 'Estate - Identity Verification'),
                            e('button', { 
                                className: 'btn-logout',
                                onClick: handleLogout,
                                style: { background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
                            }, 
                                e('i', { className: 'fas fa-sign-out-alt' }),
                                ' Logout'
                            )
                        )
                    )
                ),
                e(VerificationPage, {
                    user: userData,
                    onComplete: handleVerificationComplete,
                    onSkip: handleSkipVerification
                }),
                e(Footer)
            );
        }
        
        // Home/Landing Page - WITH NAVBAR (public page)
        return e('div', null,
            e(Navbar, {
                isLoggedIn: isLoggedIn,
                userData: userData,
                onLoginClick: handleLoginClick,
                onSignUpClick: handleSignUpClick,
                onLogout: handleLogout
            }),
            e(Hero, {
                onGetStarted: handleSignUpClick
            }),
            e(Houses),
            e(Testimonials),
            e(Contact),
            e(About),
            e(Footer)
        );
    };
    
    return e('div', { className: 'app' },
        renderContent(),
        e(AuthModal, {
            isOpen: authModalOpen,
            mode: authMode,
            onClose: function() { setAuthModalOpen(false); },
            onLoginSuccess: handleLoginSuccess,
            onSwitchMode: function(newMode) { setAuthMode(newMode); }
        })
    );
}

// Render App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

console.log('App rendered successfully!');
