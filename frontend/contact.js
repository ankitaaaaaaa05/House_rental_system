// Contact Section Component
function Contact() {
    const e = React.createElement;
    const { useState } = React;
    
    // form state
    const stateForm = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    
    const formData = stateForm[0];
    const setFormData = stateForm[1];

    // handle form submission
    const handleSubmit = function(ev) {
        ev.preventDefault();
        console.log('Form submitted:', formData);
        alert('Thank you for contacting us! We will get back to you soon.');
        
        // reset form
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });
    };

    // handle input change
    const handleChange = function(field) {
        return function(ev) {
            setFormData({
                name: field === 'name' ? ev.target.value : formData.name,
                email: field === 'email' ? ev.target.value : formData.email,
                phone: field === 'phone' ? ev.target.value : formData.phone,
                subject: field === 'subject' ? ev.target.value : formData.subject,
                message: field === 'message' ? ev.target.value : formData.message
            });
        };
    };

    return e('section', { id: 'contact', className: 'contact' },
        e('div', { className: 'container' },
            e('h2', null, 
                'Get In ', 
                e('span', null, 'Touch')
            ),
            e('p', { className: 'subtitle' }, 
                "We'd Love to Hear From You"
            ),
            
            // contact form
            e('form', { 
                className: 'contact-form',
                onSubmit: handleSubmit 
            },
                // name and email row
                e('div', { className: 'form-row' },
                    e('div', { className: 'form-group' },
                        e('label', null, 'Full Name'),
                        e('input', {
                            type: 'text',
                            placeholder: 'Enter your name',
                            value: formData.name,
                            onChange: handleChange('name'),
                            required: true
                        })
                    ),
                    e('div', { className: 'form-group' },
                        e('label', null, 'Email Address'),
                        e('input', {
                            type: 'email',
                            placeholder: 'Enter your email',
                            value: formData.email,
                            onChange: handleChange('email'),
                            required: true
                        })
                    )
                ),
                
                // phone and subject row
                e('div', { className: 'form-row' },
                    e('div', { className: 'form-group' },
                        e('label', null, 'Phone Number'),
                        e('input', {
                            type: 'tel',
                            placeholder: 'Enter your phone',
                            value: formData.phone,
                            onChange: handleChange('phone'),
                            required: true
                        })
                    ),
                    e('div', { className: 'form-group' },
                        e('label', null, 'Subject'),
                        e('input', {
                            type: 'text',
                            placeholder: 'What is this about?',
                            value: formData.subject,
                            onChange: handleChange('subject'),
                            required: true
                        })
                    )
                ),
                
                // message
                e('div', { className: 'form-group' },
                    e('label', null, 'Message'),
                    e('textarea', {
                        rows: 5,
                        placeholder: 'Write your message here...',
                        value: formData.message,
                        onChange: handleChange('message'),
                        required: true
                    })
                ),
                
                // submit button
                e('button', { 
                    type: 'submit',
                    className: 'btn btn-primary btn-large'
                }, 'Send Message')
            )
        )
    );
}