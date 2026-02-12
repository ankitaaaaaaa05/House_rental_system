function Footer() {
    const e = React.createElement;

    return e('footer', { className: 'footer' },
        e('div', { className: 'container' },
            // footer grid content here
            e('div', { className: 'ftr_content' },
                // about section
                e('div', { className: 'ftr_sec' },
                    e('h4', null, 'Estate'),
                    e('p', null, 'Your trusted partner in finding the perfect home. Quality properties, exceptional service.')
                ),
                
                // links
                e('div', { className: 'ftr_sec' },
                    e('h4', null, 'Quick Links'),
                    e('a', { href: '#home' }, 'Home'),
                    e('a', { href: '#about' }, 'About'),
                    e('a', { href: '#houses' }, 'Houses'),
                    e('a', { href: '#contact' }, 'Contact')
                ),
                
                // contact part
                e('div', { className: 'ftr_sec' },
                    e('h4', null, 'Contact Info'),
                    e('p', null, 'Email: info@estate.com'),
                    e('p', null, 'Phone: +91 99999 00000'),
                    e('p', null, 'Address: Mumbai, India')
                ),
                
                // social media section
                e('div', { className: 'ftr_sec' },
                    e('h4', null, 'Follow Us'),
                    e('div', { className: 'social-links' },
                        e('a', { 
                            href: '#',
                            'aria-label': 'Facebook' 
                        }, e('i', { className: 'fab fa-facebook-f' })),
                        e('a', { 
                            href: '#',
                            'aria-label': 'Twitter' 
                        }, e('i', { className: 'fab fa-twitter' })),
                        e('a', { 
                            href: '#',
                            'aria-label': 'Instagram' 
                        }, e('i', { className: 'fab fa-instagram' })),
                        e('a', { 
                            href: '#',
                            'aria-label': 'LinkedIn' 
                        }, e('i', { className: 'fab fa-linkedin-in' }))
                    )
                )
            ),
            
            // last part of footer
            e('div', { className: 'fter_bottom' },
                e('p', null, '© 2024 Estate. All rights reserved.')
            )
        )
    );
}