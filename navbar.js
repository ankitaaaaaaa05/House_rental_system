// Navbar Component
function Navbar(props) {
    const e = React.createElement;
    const { useState, useEffect } = React;
    
    const stateScrolled = useState(false);
    const isScrolled = stateScrolled[0];
    const setIsScrolled = stateScrolled[1];
    
    const stateMobileMenu = useState(false);
    const isMobileMenuOpen = stateMobileMenu[0];
    const setIsMobileMenuOpen = stateMobileMenu[1];
    
    const stateActiveSection = useState('home');
    const activeSection = stateActiveSection[0];
    const setActiveSection = stateActiveSection[1];

    // scroll effect
    useEffect(function() {
        const handleScroll = function() {
            setIsScrolled(window.scrollY > 50);
            
            // check which section is active
            const sections = ['home', 'about', 'houses', 'testimonials', 'contact'];
            const current = sections.find(function(section) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return rect.top <= 200 && rect.bottom >= 200;
                }
                return false;
            });
            if (current) setActiveSection(current);
        };
        
        window.addEventListener('scroll', handleScroll);
        return function() { 
            window.removeEventListener('scroll', handleScroll); 
        };
    }, []);

    // smooth scroll function
    const scrollTo = function(id) {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    return e('nav', { className: 'navbar' + (isScrolled ? ' scrolled' : '') },
        e('div', { className: 'container' },
            e('div', { className: 'nav-wrapper' },
                // logo
                e('div', { 
                    className: 'logo', 
                    onClick: function() { scrollTo('home'); } 
                },
                    e('i', { className: 'fas fa-home' }),
                    e('span', null, 'Estate')
                ),
                
                // navigation menu
                e('div', { className: 'nav-menu' + (isMobileMenuOpen ? ' active' : '') },
                    e('a', { 
                        href: '#home', 
                        className: 'nav-link' + (activeSection === 'home' ? ' active' : ''),
                        onClick: function(ev) { 
                            ev.preventDefault(); 
                            scrollTo('home'); 
                        }
                    }, 'Home'),
                    e('a', { 
                        href: '#about', 
                        className: 'nav-link' + (activeSection === 'about' ? ' active' : ''),
                        onClick: function(ev) { 
                            ev.preventDefault(); 
                            scrollTo('about'); 
                        }
                    }, 'About'),
                    e('a', { 
                        href: '#houses', 
                        className: 'nav-link' + (activeSection === 'houses' ? ' active' : ''),
                        onClick: function(ev) { 
                            ev.preventDefault(); 
                            scrollTo('houses'); 
                        }
                    }, 'Houses For Rent'),
                    e('a', { 
                        href: '#testimonials', 
                        className: 'nav-link' + (activeSection === 'testimonials' ? ' active' : ''),
                        onClick: function(ev) { 
                            ev.preventDefault(); 
                            scrollTo('testimonials'); 
                        }
                    }, 'Testimonials'),
                    e('a', { 
                        href: '#contact', 
                        className: 'nav-link' + (activeSection === 'contact' ? ' active' : ''),
                        onClick: function(ev) { 
                            ev.preventDefault(); 
                            scrollTo('contact'); 
                        }
                    }, 'Contact')
                ),
                
                // login and signup buttons
                e('div', { className: 'nav-actions' + (isMobileMenuOpen ? ' active' : '') },
                    e('button', { 
                        className: 'btn-login', 
                        onClick: props.onLoginClick 
                    }, 'Login'),
                    e('button', { 
                        className: 'btn-signup', 
                        onClick: props.onSignUpClick 
                    }, 'Sign up')
                ),
                
                // hamburger menu for mobile
                e('div', { 
                    className: 'hamburger' + (isMobileMenuOpen ? ' active' : ''),
                    onClick: function() { 
                        setIsMobileMenuOpen(!isMobileMenuOpen); 
                    }
                },
                    e('span'), 
                    e('span'), 
                    e('span')
                )
            )
        )
    );
}