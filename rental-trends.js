// Rental Trends Component - ZIP code based rental price trends
// Displays a line graph showing average rental price trend over 2 months

function RentalTrendsWidget(props) {
    const e = React.createElement;
    const { useState, useEffect, useRef } = React;
    
    // State
    const stateZipCode = useState('');
    const zipCode = stateZipCode[0];
    const setZipCode = stateZipCode[1];
    
    const stateLoading = useState(false);
    const loading = stateLoading[0];
    const setLoading = stateLoading[1];
    
    const stateTrendData = useState(null);
    const trendData = stateTrendData[0];
    const setTrendData = stateTrendData[1];
    
    const stateError = useState('');
    const error = stateError[0];
    const setError = stateError[1];
    
    const stateChartInstance = useState(null);
    const chartInstance = stateChartInstance[0];
    const setChartInstance = stateChartInstance[1];
    
    // Chart canvas ref
    const chartRef = useRef(null);
    
    // Fetch rental trends data
    const fetchTrends = async function() {
        if (!zipCode || zipCode.length < 5) {
            setError('Please enter a valid 5+ digit ZIP code');
            return;
        }
        
        setLoading(true);
        setError('');
        setTrendData(null);
        
        try {
            const response = await fetch(API_BASE_URL + '/properties/rental-trends/' + zipCode);
            const text = await response.text();
            
            if (!text) {
                throw new Error('Empty response from server');
            }
            
            const data = JSON.parse(text);
            
            if (data.success) {
                setTrendData(data);
            } else {
                setError(data.message || 'Failed to fetch rental trends');
            }
        } catch (err) {
            console.error('Error fetching trends:', err);
            setError('Failed to fetch rental trends. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Create/Update chart when data changes
    useEffect(function() {
        if (trendData && chartRef.current) {
            // Destroy existing chart if any
            if (chartInstance) {
                chartInstance.destroy();
            }
            
            const ctx = chartRef.current.getContext('2d');
            
            const newChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: trendData.labels,
                    datasets: [{
                        label: 'Average Rent (₹)',
                        data: trendData.prices,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    family: 'Inter',
                                    size: 12
                                },
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            titleFont: {
                                family: 'Inter',
                                size: 13
                            },
                            bodyFont: {
                                family: 'Inter',
                                size: 12
                            },
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    return '₹' + context.parsed.y.toLocaleString('en-IN');
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    family: 'Inter',
                                    size: 11
                                }
                            }
                        },
                        y: {
                            beginAtZero: false,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                font: {
                                    family: 'Inter',
                                    size: 11
                                },
                                callback: function(value) {
                                    return '₹' + (value / 1000).toFixed(0) + 'K';
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
            
            setChartInstance(newChart);
        }
        
        // Cleanup function
        return function() {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [trendData]);
    
    // Handle form submit
    const handleSubmit = function(ev) {
        ev.preventDefault();
        fetchTrends();
    };
    
    // Handle input change
    const handleZipChange = function(ev) {
        const value = ev.target.value.replace(/\D/g, ''); // Only digits
        setZipCode(value);
        setError('');
    };
    
    return e('div', { 
        className: 'rental-trends-widget',
        style: {
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '24px',
            marginBottom: '24px'
        }
    },
        // Header
        e('div', { style: { marginBottom: '20px' } },
            e('h3', { 
                style: { 
                    margin: '0 0 8px 0', 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                } 
            }, 
                e('i', { className: 'fas fa-chart-line', style: { color: '#3b82f6' } }),
                'Rental Price Trends'
            ),
            e('p', { 
                style: { 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#64748b' 
                } 
            }, 'Enter a ZIP code to see average rental price trends over the last 2 months')
        ),
        
        // Search Form
        e('form', { 
            onSubmit: handleSubmit,
            style: { 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '20px',
                flexWrap: 'wrap'
            }
        },
            e('div', { style: { flex: '1', minWidth: '200px' } },
                e('input', {
                    type: 'text',
                    value: zipCode,
                    onChange: handleZipChange,
                    placeholder: 'Enter ZIP Code (e.g., 400001)',
                    maxLength: 6,
                    'data-testid': 'zipcode-input',
                    style: {
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '15px',
                        transition: 'border-color 0.2s',
                        outline: 'none'
                    }
                })
            ),
            e('button', {
                type: 'submit',
                disabled: loading || zipCode.length < 5,
                'data-testid': 'fetch-trends-btn',
                style: {
                    padding: '12px 24px',
                    background: loading || zipCode.length < 5 ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: loading || zipCode.length < 5 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }
            },
                loading ? 
                    e('i', { className: 'fas fa-spinner fa-spin' }) :
                    e('i', { className: 'fas fa-search' }),
                loading ? 'Loading...' : 'Get Trends'
            )
        ),
        
        // Error Message
        error && e('div', {
            style: {
                padding: '12px 16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }
        },
            e('i', { className: 'fas fa-exclamation-circle' }),
            error
        ),
        
        // Chart Container
        trendData && e('div', null,
            // Statistics Cards
            e('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px'
                }
            },
                // Average Price
                e('div', {
                    style: {
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        padding: '16px',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }
                },
                    e('p', { style: { margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' } }, 'Avg. Price'),
                    e('p', { style: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#0369a1' } }, 
                        '₹' + trendData.statistics.averagePrice.toLocaleString('en-IN')
                    )
                ),
                
                // Min Price
                e('div', {
                    style: {
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        padding: '16px',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }
                },
                    e('p', { style: { margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' } }, 'Min Price'),
                    e('p', { style: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#15803d' } }, 
                        '₹' + trendData.statistics.minPrice.toLocaleString('en-IN')
                    )
                ),
                
                // Max Price
                e('div', {
                    style: {
                        background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
                        padding: '16px',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }
                },
                    e('p', { style: { margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' } }, 'Max Price'),
                    e('p', { style: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#a16207' } }, 
                        '₹' + trendData.statistics.maxPrice.toLocaleString('en-IN')
                    )
                ),
                
                // Trend
                e('div', {
                    style: {
                        background: trendData.statistics.trend === 'increasing' ? 
                            'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)' : 
                            'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
                        padding: '16px',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }
                },
                    e('p', { style: { margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' } }, '2-Month Change'),
                    e('p', { 
                        style: { 
                            margin: 0, 
                            fontSize: '20px', 
                            fontWeight: '700', 
                            color: trendData.statistics.trend === 'increasing' ? '#dc2626' : '#15803d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                        } 
                    }, 
                        e('i', { 
                            className: trendData.statistics.trend === 'increasing' ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
                            style: { fontSize: '14px' }
                        }),
                        (trendData.statistics.percentChange >= 0 ? '+' : '') + trendData.statistics.percentChange + '%'
                    )
                )
            ),
            
            // Chart
            e('div', {
                style: {
                    height: '300px',
                    position: 'relative',
                    padding: '10px',
                    background: '#fafafa',
                    borderRadius: '12px'
                }
            },
                e('canvas', {
                    ref: chartRef,
                    id: 'rentalTrendsChart',
                    'data-testid': 'rental-trends-chart'
                })
            ),
            
            // Footer Info
            e('div', {
                style: {
                    marginTop: '16px',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px'
                }
            },
                e('span', { style: { fontSize: '13px', color: '#64748b' } },
                    e('i', { className: 'fas fa-map-marker-alt', style: { marginRight: '6px', color: '#3b82f6' } }),
                    'ZIP Code: ' + trendData.zipcode
                ),
                e('span', { style: { fontSize: '13px', color: '#64748b' } },
                    e('i', { className: 'fas fa-home', style: { marginRight: '6px', color: '#3b82f6' } }),
                    trendData.propertiesFound + ' properties analyzed'
                ),
                e('span', { style: { fontSize: '13px', color: '#64748b' } },
                    e('i', { className: 'fas fa-calendar', style: { marginRight: '6px', color: '#3b82f6' } }),
                    'Period: ' + trendData.period
                )
            )
        ),
        
        // Empty State
        !trendData && !loading && !error && e('div', {
            style: {
                textAlign: 'center',
                padding: '40px 20px',
                color: '#64748b'
            }
        },
            e('i', { 
                className: 'fas fa-chart-area', 
                style: { fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' } 
            }),
            e('p', { style: { margin: 0, fontSize: '15px' } }, 
                'Enter a ZIP code above to view rental price trends'
            )
        )
    );
}
