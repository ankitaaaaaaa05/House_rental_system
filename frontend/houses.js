function Houses() {
    const e = React.createElement;
    const { useState } = React;
    
    // state for search and filter
    const stateSearch = useState('');
    const searchTerm = stateSearch[0];
    const setSearchTerm = stateSearch[1];
    
    const stateFilter = useState('all');
    const selectedFilter = stateFilter[0];
    const setSelectedFilter = stateFilter[1];
    
    // state for current slide index
    const stateCurrentIndex = useState(0);
    const currentIndex = stateCurrentIndex[0];
    const setCurrentIndex = stateCurrentIndex[1];

    // filter properties based on search and filter
    const filteredProperties = properties.filter(function(property) {
        const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            property.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = selectedFilter === 'all' || property.type === selectedFilter;
        
        return matchesSearch && matchesFilter;
    });

    // card calculate
    const cardsPerView = 3;
    const totalSlides = Math.max(0, filteredProperties.length - cardsPerView + 1);

    // next slide function
    const nextSlide = function() {
        if (currentIndex < totalSlides - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // previous slide function
    const prevSlide = function() {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // get unique property types for filter
    const propertyTypes = ['all'];
    properties.forEach(function(property) {
        if (!propertyTypes.includes(property.type)) {
            propertyTypes.push(property.type);
        }
    });

    // checking search
    const isSearchActive = searchTerm !== '' || selectedFilter !== 'all';

    return e('section', { id: 'houses', className: 'houses' },
        e('div', { className: 'container' },
            // heading section
            e('h2', null, 
                'Houses For ', 
                e('span', null, 'Rent')
            ),
            e('p', { className: 'subtitle' }, 
                'Discover Your Perfect Living Space'
            ),
            
            // search section
            e('div', { className: 'search-section' },
                e('div', { className: 'search-bar' },
                    // search input
                    e('div', { className: 'search-input-wrapper' },
                        e('i', { className: 'fas fa-search search-icon' }),
                        e('input', {
                            type: 'text',
                            className: 'search-input',
                            placeholder: 'Search by name, location, or type...',
                            value: searchTerm,
                            onChange: function(ev) {
                                setSearchTerm(ev.target.value);
                                setCurrentIndex(0);
                            }
                        }),
                        searchTerm && e('button', {
                            className: 'clear-search',
                            onClick: function() {
                                setSearchTerm('');
                                setCurrentIndex(0);
                            }
                        }, e('i', { className: 'fas fa-times' }))
                    ),
                    
                    // filter dropdown
                    e('select', {
                        className: 'search-filter',
                        value: selectedFilter,
                        onChange: function(ev) {
                            setSelectedFilter(ev.target.value);
                            setCurrentIndex(0);
                        }
                    }, propertyTypes.map(function(type) {
                        return e('option', { 
                            value: type, 
                            key: type 
                        }, type === 'all' ? 'All Types' : type);
                    }))
                ),
                
                // search results info
                e('div', { className: 'search-results-info' },
                    filteredProperties.length > 0 ? 
                        e('p', { className: 'results-count' },
                            'Showing ',
                            e('strong', null, filteredProperties.length),
                            ' ',
                            filteredProperties.length === 1 ? 'property' : 'properties'
                        ) :
                        e('p', { className: 'no-results' },
                            e('i', { className: 'fas fa-exclamation-circle' }),
                            'No properties found. Try different search terms.'
                        )
                )
            ),
            
            // show as grid when search
            filteredProperties.length > 0 && (
                isSearchActive ? 
                    // Grid view for search results
                    e('div', { className: 'properties-grid' },
                        filteredProperties.map(function(property) {
                            return e('div', { 
                                className: 'property-card-single',
                                key: property.id 
                            },
                                e('div', { className: 'property-image-large' },
                                    e('img', { 
                                        src: property.image, 
                                        alt: property.name 
                                    }),
                                    // property type badge
                                    e('div', { className: 'property-badge' },
                                        property.type
                                    )
                                ),
                                e('div', { className: 'property-info' },
                                    e('h3', null, property.name),
                                    e('div', { className: 'property-location' },
                                        e('i', { className: 'fas fa-map-marker-alt' }),
                                        e('span', null, property.location)
                                    ),
                                    e('p', { className: 'property-price' }, 
                                        property.price
                                    )
                                )
                            );
                        })
                    )
                    :
                    // Slider view for all properties
                    e('div', { className: 'houses-slider-container' },
                        // previous button
                        filteredProperties.length > cardsPerView && currentIndex > 0 && 
                            e('button', {
                                className: 'slid_nav_btn prev-btn',
                                onClick: prevSlide,
                                'aria-label': 'Previous'
                            }, e('i', { className: 'fas fa-chevron-left' })),
                        
                        // slider wrapper
                        e('div', { className: 'houses-slider-wrapper' },
                            e('div', { 
                                className: 'houses-slider-track',
                                style: { 
                                    transform: 'translateX(-' + (currentIndex * (100 / cardsPerView)) + '%)',
                                    transition: 'transform 0.4s ease'
                                }
                            },
                                filteredProperties.map(function(property) {
                                    return e('div', { 
                                        className: 'property-slide',
                                        key: property.id 
                                    },
                                        e('div', { className: 'property-card' },
                                            e('div', { className: 'property-image' },
                                                e('img', { 
                                                    src: property.image, 
                                                    alt: property.name 
                                                }),
                                                // property type badge
                                                e('div', { className: 'property-badge' },
                                                    property.type
                                                )
                                            ),
                                            e('div', { className: 'property-info' },
                                                e('h3', null, property.name),
                                                e('div', { className: 'property-location' },
                                                    e('i', { className: 'fas fa-map-marker-alt' }),
                                                    e('span', null, property.location)
                                                ),
                                                e('p', { className: 'property-price' }, 
                                                    property.price
                                                )
                                            )
                                        )
                                    );
                                })
                            )
                        ),
                        
                        // next button
                        filteredProperties.length > cardsPerView && currentIndex < totalSlides - 1 && 
                            e('button', {
                                className: 'slid_nav_btn next-btn',
                                onClick: nextSlide,
                                'aria-label': 'Next'
                            }, e('i', { className: 'fas fa-chevron-right' }))
                    )
            )
        )
    );
}