function About() {
    const e = React.createElement;

    return e('section', { id: 'about', className: 'about' },
        e('div', { className: 'container' },
            e('div', { className: 'about-content' },
                // left side image
                e('div', { className: 'about-image' },
                    e('img', { 
                        src: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', 
                        alt: 'Modern Building' 
                    })
                ),
                e('div', { className: 'about-text' },
                    e('h2', null, 
                        'About ', 
                        e('span', null, 'Our Brand')
                    ),
                    e('p', { className: 'subtitle' }, 
                        'Passionate About Properties, Dedicated to Your Vision'
                    ),
                    
                    // stats 
                    e('div', { className: 'stats-grid' },
                        e('div', { className: 'stat-item' },
                            e('h3', null, '10+'),
                            e('p', null, 'Years of Excellence')
                        )
                    ),
                    
                    // description
                    e('p', { className: 'description' }, 
                        'We are a leading real house rental company in India, specializing in premium residential and commercial properties. With over a decade of experience, We have our brand across major India cities include Mumbai , Pune , Chennai , Kolkata and Bangalore .'
                    ),
                    
                    // button
                    e('button', { 
                        className: 'btn btn-primary',
                        onClick: function() {
                            const element = document.getElementById('contact');
                            if(element) element.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 'Get in Touch')
                )
            )
        )
    );
}