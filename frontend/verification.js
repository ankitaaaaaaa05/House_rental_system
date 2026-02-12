// ID Verification Component - Upload ID proof for verification
function VerificationPage(props) {
    const e = React.createElement;
    const { useState } = React;
    
    const API_URL = API_BASE_URL;
    
    // Form state
    const stateForm = useState({
        documentType: 'aadhaar',
        documentNumber: '',
        documentFile: null
    });
    const formData = stateForm[0];
    const setFormData = stateForm[1];
    
    // Loading state
    const stateLoading = useState(false);
    const isLoading = stateLoading[0];
    const setIsLoading = stateLoading[1];
    
    // Handle file selection
    const handleFileChange = function(ev) {
        const file = ev.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            setFormData({
                documentType: formData.documentType,
                documentNumber: formData.documentNumber,
                documentFile: file
            });
        }
    };
    
    // Handle form submit
    const handleSubmit = async function(ev) {
        ev.preventDefault();
        
        if (!formData.documentFile) {
            alert('Please select a document file');
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(formData.documentFile);
            
            reader.onload = async function() {
                const base64 = reader.result;
                
                const token = localStorage.getItem('token');
                const response = await fetch(API_URL + '/auth/upload-id', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        documentType: formData.documentType,
                        documentNumber: formData.documentNumber,
                        documentBase64: base64
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Upload failed');
                }
                
                alert('ID proof uploaded successfully! Awaiting admin approval.');
                
                // Go back to dashboard
                if (props.onComplete) {
                    props.onComplete();
                }
            };
            
            reader.onerror = function() {
                alert('Error reading file');
                setIsLoading(false);
            };
            
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error: ' + error.message);
            setIsLoading(false);
        }
    };
    
    return e('div', { className: 'verification-page' },
        e('div', { className: 'container' },
            e('div', { className: 'verification-card' },
                // Header
                e('div', { className: 'verification-header' },
                    e('i', { className: 'fas fa-id-card', style: { fontSize: '48px', color: '#4F46E5', marginBottom: '20px' } }),
                    e('h2', null, 'Identity Verification'),
                    e('p', null, 'Upload your ID proof to verify your account')
                ),
                
                // Form
                e('form', { onSubmit: handleSubmit, className: 'verification-form' },
                    // Document type
                    e('div', { className: 'form-group' },
                        e('label', null, 'Document Type'),
                        e('select', {
                            value: formData.documentType,
                            onChange: function(ev) {
                                setFormData({
                                    documentType: ev.target.value,
                                    documentNumber: formData.documentNumber,
                                    documentFile: formData.documentFile
                                });
                            },
                            disabled: isLoading,
                            required: true
                        },
                            e('option', { value: 'aadhaar' }, 'Aadhaar Card'),
                            e('option', { value: 'pan' }, 'PAN Card'),
                            e('option', { value: 'passport' }, 'Passport'),
                            e('option', { value: 'driving_license' }, 'Driving License'),
                            e('option', { value: 'voter_id' }, 'Voter ID')
                        )
                    ),
                    
                    // Document number
                    e('div', { className: 'form-group' },
                        e('label', null, 'Document Number'),
                        e('input', {
                            type: 'text',
                            placeholder: 'Enter document number',
                            value: formData.documentNumber,
                            onChange: function(ev) {
                                setFormData({
                                    documentType: formData.documentType,
                                    documentNumber: ev.target.value,
                                    documentFile: formData.documentFile
                                });
                            },
                            disabled: isLoading,
                            required: true
                        })
                    ),
                    
                    // File upload
                    e('div', { className: 'form-group' },
                        e('label', null, 'Upload Document (Image/PDF, Max 5MB)'),
                        e('input', {
                            type: 'file',
                            accept: 'image/*,.pdf',
                            onChange: handleFileChange,
                            disabled: isLoading,
                            required: true
                        }),
                        formData.documentFile && e('p', { style: { color: 'green', fontSize: '14px', marginTop: '5px' } },
                            '\u2713 ' + formData.documentFile.name
                        )
                    ),
                    
                    // Submit button
                    e('button', {
                        type: 'submit',
                        className: 'btn btn-primary',
                        style: { width: '100%' },
                        disabled: isLoading
                    }, isLoading ? 'Uploading...' : 'Submit for Verification'),
                    
                    // Skip button - Always show to allow user to skip verification
                    e('button', {
                        type: 'button',
                        className: 'btn btn-outline',
                        style: { width: '100%', marginTop: '10px' },
                        onClick: function() { if (props.onSkip) props.onSkip(); },
                        disabled: isLoading,
                        'data-testid': 'skip-verification-btn'
                    }, 'Skip for Now')
                )
            )
        )
    );
}
