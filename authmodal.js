// Login and Signup
function AuthModal(props) {
    const e = React.createElement;
    const { useState } = React;
    
    // API URL - connects to backend
    const API_URL = API_BASE_URL;
    
    // form 
    const stateForm = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        userType: ''
    });
    
    const formData = stateForm[0];
    const setFormData = stateForm[1];

    // loading state
    const stateLoading = useState(false);
    const isLoading = stateLoading[0];
    const setIsLoading = stateLoading[1];

    // error state
    const stateError = useState('');
    const error = stateError[0];
    const setError = stateError[1];

    // null if modal not open
    if (!props.isOpen) {
        return null;
    }

    // handle form submit - NOW WITH REAL API CALLS
    const handleSubmit = async function(ev) {
        ev.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            if (props.mode === 'login') {
                // REAL LOGIN API CALL
                const response = await fetch(API_URL + '/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    })
                });

                const text = await response.text();
                if (!text) {
                    throw new Error('Empty response from server');
                }
                const data = JSON.parse(text);
                
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // Store token
                localStorage.setItem('token', data.token);
                
                console.log('Login successful:', data);
                alert('Login successful! Welcome ' + data.user.name);
                
                // call onLoginSuccess to update app state
                if(props.onLoginSuccess) {
                    props.onLoginSuccess(data.user, data.token);
                }
                
            } else {
                // REAL SIGNUP API CALL
                const response = await fetch(API_URL + '/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password,
                        userType: formData.userType
                    })
                });

                const text = await response.text();
                if (!text) {
                    throw new Error('Empty response from server');
                }
                const data = JSON.parse(text);
                
                if (!response.ok) {
                    throw new Error(data.message || 'Signup failed');
                }

                // Store token
                localStorage.setItem('token', data.token);
                
                console.log('Signup successful:', data);
                alert('Account created successfully! Welcome ' + data.user.name);
                
                // call onLoginSuccess to update app state
                if(props.onLoginSuccess) {
                    props.onLoginSuccess(data.user, data.token);
                }
            }
            
            // reset form 
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                userType: ''
            });
            
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message);
            alert('Error: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formElements = [];

    // Show error if exists
    if (error) {
        formElements.push(
            e('div', { 
                className: 'error-message', 
                key: 'error',
                style: { 
                    color: 'red', 
                    padding: '10px', 
                    marginBottom: '10px', 
                    backgroundColor: '#ffebee',
                    borderRadius: '4px' 
                }
            }, error)
        );
    }

    // name for signup
    if (props.mode === 'signup') {
        formElements.push(
            e('div', { className: 'form-group', key: 'name' },
                e('label', null, 'Full Name'),
                e('input', {
                    type: 'text',
                    placeholder: 'Enter your name',
                    value: formData.name,
                    onChange: function(ev) { 
                        setFormData({ 
                            name: ev.target.value, 
                            email: formData.email, 
                            phone: formData.phone, 
                            password: formData.password, 
                            userType: formData.userType 
                        }); 
                    },
                    required: true,
                    disabled: isLoading
                })
            )
        );
    }

    // email field 
    formElements.push(
        e('div', { className: 'form-group', key: 'email' },
            e('label', null, 'Email'),
            e('input', {
                type: 'email',
                placeholder: 'Enter your email',
                value: formData.email,
                onChange: function(ev) { 
                    setFormData({ 
                        name: formData.name, 
                        email: ev.target.value, 
                        phone: formData.phone, 
                        password: formData.password, 
                        userType: formData.userType 
                    }); 
                },
                required: true,
                disabled: isLoading
            })
        )
    );

    // phone field 
    if (props.mode === 'signup') {
        formElements.push(
            e('div', { className: 'form-group', key: 'phone' },
                e('label', null, 'Phone Number'),
                e('input', {
                    type: 'tel',
                    placeholder: 'Enter your phone',
                    value: formData.phone,
                    onChange: function(ev) { 
                        setFormData({ 
                            name: formData.name, 
                            email: formData.email, 
                            phone: ev.target.value, 
                            password: formData.password, 
                            userType: formData.userType 
                        }); 
                    },
                    required: true,
                    disabled: isLoading
                })
            )
        );
    }

    // password field
    formElements.push(
        e('div', { className: 'form-group', key: 'password' },
            e('label', null, 'Password'),
            e('input', {
                type: 'password',
                placeholder: props.mode === 'login' ? 'Enter password' : 'Create password',
                value: formData.password,
                onChange: function(ev) { 
                    setFormData({ 
                        name: formData.name, 
                        email: formData.email, 
                        phone: formData.phone, 
                        password: ev.target.value, 
                        userType: formData.userType 
                    }); 
                },
                required: true,
                disabled: isLoading
            })
        )
    );

    // user type
    if (props.mode === 'signup') {
        formElements.push(
            e('div', { className: 'form-group', key: 'userType' },
                e('label', null, 'I am a'),
                e('select', {
                    value: formData.userType,
                    onChange: function(ev) { 
                        setFormData({ 
                            name: formData.name, 
                            email: formData.email, 
                            phone: formData.phone, 
                            password: formData.password, 
                            userType: ev.target.value 
                        }); 
                    },
                    required: true,
                    disabled: isLoading
                },
                    e('option', { value: '' }, 'Select user type'),
                    e('option', { value: 'renter' }, 'Renter'),
                    e('option', { value: 'landlord' }, 'Landlord'),
                    e('option', { value: 'admin' }, 'Admin (use email ending with @admin.com)')
                )
            )
        );
    }

    // submit button
    formElements.push(
        e('button', { 
            type: 'submit', 
            className: 'btn btn-primary',
            style: { width: '100%' },
            key: 'submit',
            disabled: isLoading
        }, isLoading ? 'Please wait...' : (props.mode === 'login' ? 'Login' : 'Sign Up'))
    );

    return e('div', { 
        className: 'modal active',
        onClick: function(ev) { 
            if (ev.target.className.includes('modal')) {
                props.onClose(); 
            }
        }
    },
        e('div', { className: 'modal-content' },
            // close button
            e('button', { 
                className: 'modal-close', 
                onClick: props.onClose,
                disabled: isLoading
            },
                e('i', { className: 'fas fa-times' })
            ),
            
            // auth form
            e('div', { className: 'auth-form' },
                e('h2', null, props.mode === 'login' ? 'Welcome Back' : 'Create Account'),
                e('p', { className: 'auth-subtitle' }, 
                    props.mode === 'login' ? 'Login to your account' : 'Join us today'
                ),
                
                e('form', { onSubmit: handleSubmit }, formElements),
                
                // switch between login and signup
                e('p', { className: 'auth-switch' },
                    props.mode === 'login' ? "Don't have an account? " : 'Already have an account? ',
                    e('a', {
                        href: '#',
                        onClick: function(ev) { 
                            ev.preventDefault(); 
                            if (props.onSwitchMode) {
                                props.onSwitchMode(props.mode === 'login' ? 'signup' : 'login');
                            }
                        }
                    }, props.mode === 'login' ? 'Sign up' : 'Login')
                )
            )
        )
    );
}
