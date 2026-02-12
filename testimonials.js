function Testimonials() {
    const e = React.createElement;

    // function to create star rating
    const renderStars = function(rating) {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                e('i', { 
                    key: i,
                    className: i < rating ? 'fas fa-star' : 'far fa-star'
                })
            );
        }
        return stars;
    };

    return e('section', { id: 'testimonials', className: 'testimonials' },
        e('div', { className: 'container' },
            e('h2', null, 
                'Client ', 
                e('span', null, 'Testimonials')
            ),
            e('p', { className: 'subtitle' }, 
                'What Our Clients Say About Us'
            ),
            
            // testimonials grid
            e('div', { className: 'test_grid' },
                testimonials.map(function(testimonial) {
                    return e('div', { 
                        className: 'testcard',
                        key: testimonial.id 
                    },
                        // avatar
                        e('div', { className: 'testavtar' },
                            e('img', { 
                                src: testimonial.image, 
                                alt: testimonial.name 
                            })
                        ),
                        
                        // name and role
                        e('h3', null, testimonial.name),
                        e('p', { className: 'testrole' }, 
                            testimonial.role
                        ),
                        
                        // rating stars
                        e('div', { className: 'test_rating' },
                            renderStars(testimonial.rating)
                        ),
                        
                        // testimonial text
                        e('p', { className: 'test_text' }, 
                            testimonial.text
                        )
                    );
                })
            )
        )
    );
}