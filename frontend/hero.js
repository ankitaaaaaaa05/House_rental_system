function Hero() {
    const e = React.createElement;

    // function to scroll to a section
    const scrollTo = function(id) {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return e('section', { id: 'home', className: 'hero' },
        e('div', { className: 'hero-content' },
            e('h1', null, 'Explore homes that fit your dreams'),
            e('div', { className: 'hero-buttons' },
                e('button', { 
                    className: 'btn btn-outline', 
                    onClick: function() { scrollTo('houses'); } 
                }, 'Houses'),
                e('button', { 
                    className: 'btn btn-primary', 
                    onClick: function() { scrollTo('contact'); } 
                }, 'Contact Us')
            )
        )
    );
}