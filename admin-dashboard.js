// Admin Dashboard Component - Manage users and properties
function AdminDashboard(props) {
    const e = React.createElement;
    const { useState, useEffect } = React;
    
    const API_URL = API_BASE_URL;
    
    // States
    const stateView = useState('stats'); // 'stats', 'users', 'properties'
    const currentView = stateView[0];
    const setCurrentView = stateView[1];
    
    const stateStats = useState(null);
    const stats = stateStats[0];
    const setStats = stateStats[1];
    
    const statePendingUsers = useState([]);
    const pendingUsers = statePendingUsers[0];
    const setPendingUsers = statePendingUsers[1];
    
    const statePendingProps = useState([]);
    const pendingProps = statePendingProps[0];
    const setPendingProps = statePendingProps[1];
    
    const stateLoading = useState(true);
    const isLoading = stateLoading[0];
    const setIsLoading = stateLoading[1];
    
    const stateSelectedUser = useState(null);
    const selectedUser = stateSelectedUser[0];
    const setSelectedUser = stateSelectedUser[1];
    
    const stateSelectedProp = useState(null);
    const selectedProp = stateSelectedProp[0];
    const setSelectedProp = stateSelectedProp[1];
    
    // Load data on mount
    useEffect(function() {
        loadStats();
        loadPendingUsers();
        loadPendingProperties();
    }, []);
    
    // Load stats
    const loadStats = async function() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/admin/stats', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Load pending users
    const loadPendingUsers = async function() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/admin/users/pending', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await response.json();
            if (data.success) {
                setPendingUsers(data.users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };
    
    // Load pending properties
    const loadPendingProperties = async function() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/admin/properties/pending', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await response.json();
            if (data.success) {
                setPendingProps(data.properties);
            }
        } catch (error) {
            console.error('Error loading properties:', error);
        }
    };
    
    // Verify user
    const handleVerifyUser = async function(userId) {
        if (!confirm('Approve this user verification?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/admin/users/' + userId + '/verify', {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await response.json();
            if (data.success) {
                alert('User verified successfully!');
                loadPendingUsers();
                loadStats();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error verifying user');
        }
    };
    
    // Reject user
    const handleRejectUser = async function(userId) {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/admin/users/' + userId + '/reject', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: reason })
            });
            const data = await response.json();
            if (data.success) {
                alert('User verification rejected');
                loadPendingUsers();
                loadStats();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error rejecting user');
        }
    };
    
    // Approve property
    const handleApproveProperty = async function(propId) {
        if (!confirm('Approve this property listing?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/admin/properties/' + propId + '/approve', {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await response.json();
            if (data.success) {
                alert('Property approved successfully!');
                loadPendingProperties();
                loadStats();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error approving property');
        }
    };
    
    // Reject property
    const handleRejectProperty = async function(propId) {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/admin/properties/' + propId + '/reject', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: reason })
            });
            const data = await response.json();
            if (data.success) {
                alert('Property rejected');
                loadPendingProperties();
                loadStats();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error rejecting property');
        }
    };
    
    if (isLoading) {
        return e('div', { className: 'loading' }, 'Loading admin dashboard...');
    }
    
    return e('div', { className: 'admin-dashboard-content' },
        // Tab navigation with logout button
        e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' } },
            e('div', { className: 'dashboard-tabs', style: { marginBottom: '0' } },
                e('button', {
                    className: 'tab-btn' + (currentView === 'stats' ? ' active' : ''),
                    onClick: function() { setCurrentView('stats'); }
                },
                    e('i', { className: 'fas fa-chart-bar' }),
                    ' Dashboard'
                ),
                e('button', {
                    className: 'tab-btn' + (currentView === 'users' ? ' active' : ''),
                    onClick: function() { setCurrentView('users'); }
                },
                    e('i', { className: 'fas fa-users' }),
                    ' Pending Users (' + pendingUsers.length + ')'
                ),
                e('button', {
                    className: 'tab-btn' + (currentView === 'properties' ? ' active' : ''),
                    onClick: function() { setCurrentView('properties'); }
                },
                    e('i', { className: 'fas fa-building' }),
                    ' Pending Properties (' + pendingProps.length + ')'
                )
            ),
            // Logout button
            e('button', {
                className: 'btn btn-danger',
                onClick: props.onLogout,
                style: { display: 'flex', alignItems: 'center', gap: '8px' }
            },
                e('i', { className: 'fas fa-sign-out-alt' }),
                ' Logout'
            )
        ),
        
        // Content based on current view
        currentView === 'stats' && stats && e('div', { className: 'stats-view' },
            e('h2', null, 'System Statistics'),
            
            // Stats grid
            e('div', { className: 'stats-grid' },
                // User stats
                e('div', { className: 'stat-card' },
                    e('div', { className: 'stat-icon' }, e('i', { className: 'fas fa-users' })),
                    e('div', { className: 'stat-info' },
                        e('h3', null, stats.users.total),
                        e('p', null, 'Total Users')
                    )
                ),
                e('div', { className: 'stat-card' },
                    e('div', { className: 'stat-icon' }, e('i', { className: 'fas fa-clock' })),
                    e('div', { className: 'stat-info' },
                        e('h3', null, stats.users.pending),
                        e('p', null, 'Pending Verifications')
                    )
                ),
                e('div', { className: 'stat-card' },
                    e('div', { className: 'stat-icon' }, e('i', { className: 'fas fa-check-circle' })),
                    e('div', { className: 'stat-info' },
                        e('h3', null, stats.users.verified),
                        e('p', null, 'Verified Users')
                    )
                ),
                
                // Property stats
                e('div', { className: 'stat-card' },
                    e('div', { className: 'stat-icon' }, e('i', { className: 'fas fa-building' })),
                    e('div', { className: 'stat-info' },
                        e('h3', null, stats.properties.total),
                        e('p', null, 'Total Properties')
                    )
                ),
                e('div', { className: 'stat-card' },
                    e('div', { className: 'stat-icon' }, e('i', { className: 'fas fa-hourglass-half' })),
                    e('div', { className: 'stat-info' },
                        e('h3', null, stats.properties.pending),
                        e('p', null, 'Pending Approval')
                    )
                ),
                e('div', { className: 'stat-card' },
                    e('div', { className: 'stat-icon' }, e('i', { className: 'fas fa-check-double' })),
                    e('div', { className: 'stat-info' },
                        e('h3', null, stats.properties.approved),
                        e('p', null, 'Approved Properties')
                    )
                )
            )
        ),
        
        // Pending users view
        currentView === 'users' && e('div', { className: 'users-view' },
            e('h2', null, 'Pending User Verifications'),
            
            pendingUsers.length === 0 ?
                e('div', { className: 'no-data' },
                    e('i', { className: 'fas fa-check-circle', style: { fontSize: '48px', color: '#10b981' } }),
                    e('p', null, 'No pending user verifications')
                )
                :
                e('div', { className: 'users-grid' },
                    pendingUsers.map(function(user) {
                        return e('div', { key: user._id, className: 'user-card' },
                            e('div', { className: 'user-header' },
                                e('h3', null, user.name),
                                e('span', { className: 'user-type-badge' }, user.userType)
                            ),
                            e('div', { className: 'user-info' },
                                e('p', null, e('i', { className: 'fas fa-envelope' }), ' ', user.email),
                                e('p', null, e('i', { className: 'fas fa-phone' }), ' ', user.phone)
                            ),
                            user.idProof && e('div', { className: 'user-docs' },
                                e('p', null, 'Document: ' + user.idProof.documentType),
                                e('p', null, 'Number: ' + user.idProof.documentNumber),
                                e('button', {
                                    className: 'btn btn-small btn-outline',
                                    onClick: function() { setSelectedUser(user); }
                                }, 'View Document')
                            ),
                            e('div', { className: 'user-actions' },
                                e('button', {
                                    className: 'btn btn-small btn-success',
                                    onClick: function() { handleVerifyUser(user._id); }
                                }, e('i', { className: 'fas fa-check' }), ' Approve'),
                                e('button', {
                                    className: 'btn btn-small btn-danger',
                                    onClick: function() { handleRejectUser(user._id); }
                                }, e('i', { className: 'fas fa-times' }), ' Reject')
                            )
                        );
                    })
                )
        ),
        
        // Pending properties view
        currentView === 'properties' && e('div', { className: 'properties-view' },
            e('h2', null, 'Pending Property Approvals'),
            
            pendingProps.length === 0 ?
                e('div', { className: 'no-data' },
                    e('i', { className: 'fas fa-check-circle', style: { fontSize: '48px', color: '#10b981' } }),
                    e('p', null, 'No pending property approvals')
                )
                :
                e('div', { className: 'properties-dashboard-grid' },
                    pendingProps.map(function(prop) {
                        return e('div', { key: prop._id, className: 'property-dashboard-card' },
                            prop.imageBase64 && e('img', {
                                src: prop.imageBase64,
                                alt: prop.name,
                                className: 'property-image'
                            }),
                            e('div', { className: 'property-dashboard-info' },
                                e('h3', null, prop.name),
                                e('p', { className: 'property-location-small' },
                                    e('i', { className: 'fas fa-map-marker-alt' }),
                                    ' ' + prop.location
                                ),
                                e('p', { className: 'property-price-large' },
                                    '\u20b9' + (prop.price || 0).toLocaleString() + '/mo'
                                ),
                                e('p', null, 'Owner: ' + (prop.owner ? prop.owner.name : 'Unknown')),
                                e('button', {
                                    className: 'btn btn-small btn-outline',
                                    style: { width: '100%', marginTop: '10px' },
                                    onClick: function() { setSelectedProp(prop); }
                                }, 'View Details'),
                                e('div', { className: 'property-actions', style: { marginTop: '10px' } },
                                    e('button', {
                                        className: 'btn btn-small btn-success',
                                        onClick: function() { handleApproveProperty(prop._id); }
                                    }, e('i', { className: 'fas fa-check' }), ' Approve'),
                                    e('button', {
                                        className: 'btn btn-small btn-danger',
                                        onClick: function() { handleRejectProperty(prop._id); }
                                    }, e('i', { className: 'fas fa-times' }), ' Reject')
                                )
                            )
                        );
                    })
                )
        ),
        
        // User document modal
        selectedUser && e('div', {
            className: 'modal active',
            onClick: function() { setSelectedUser(null); }
        },
            e('div', {
                className: 'modal-content',
                onClick: function(ev) { ev.stopPropagation(); }
            },
                e('h2', null, 'ID Document - ' + selectedUser.name),
                e('p', null, selectedUser.idProof.documentType + ' - ' + selectedUser.idProof.documentNumber),
                selectedUser.idProof.documentBase64 && e('img', {
                    src: selectedUser.idProof.documentBase64,
                    alt: 'ID Document',
                    style: { width: '100%', marginTop: '20px' }
                }),
                e('button', {
                    className: 'btn btn-primary',
                    style: { width: '100%', marginTop: '20px' },
                    onClick: function() { setSelectedUser(null); }
                }, 'Close')
            )
        ),
        
        // Property details modal
        selectedProp && e('div', {
            className: 'modal active',
            onClick: function() { setSelectedProp(null); }
        },
            e('div', {
                className: 'modal-content',
                onClick: function(ev) { ev.stopPropagation(); }
            },
                e('h2', null, selectedProp.name),
                e('p', null, selectedProp.location),
                selectedProp.imageBase64 && e('img', {
                    src: selectedProp.imageBase64,
                    alt: selectedProp.name,
                    style: { width: '100%', marginTop: '10px' }
                }),
                e('div', { style: { marginTop: '20px' } },
                    e('p', null, 'Price: \u20b9' + (selectedProp.price || 0).toLocaleString() + '/month'),
                    e('p', null, 'Type: ' + selectedProp.type),
                    e('p', null, 'Owner: ' + (selectedProp.owner ? selectedProp.owner.name : 'Unknown')),
                    selectedProp.description && e('p', null, 'Description: ' + selectedProp.description)
                ),
                selectedProp.documents && selectedProp.documents.propertyProof && e('div', { style: { marginTop: '20px' } },
                    e('h3', null, 'Property Document'),
                    e('p', null, 'Type: ' + selectedProp.documents.propertyProof.documentType),
                    selectedProp.documents.propertyProof.documentBase64 && e('img', {
                        src: selectedProp.documents.propertyProof.documentBase64,
                        alt: 'Property Document',
                        style: { width: '100%', marginTop: '10px' }
                    })
                ),
                e('button', {
                    className: 'btn btn-primary',
                    style: { width: '100%', marginTop: '20px' },
                    onClick: function() { setSelectedProp(null); }
                }, 'Close')
            )
        )
    );
}
