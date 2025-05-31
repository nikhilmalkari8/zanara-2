import React, { useState, useEffect, useCallback } from 'react';

const Opportunities = ({ user, onLogout, setCurrentPage }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    location: 'all',
    compensation: 'all',
    sort: 'newest'
  });
  const [currentPage, setCurrentPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const opportunityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'fashion-shoot', label: 'Fashion Shoot' },
    { value: 'commercial-shoot', label: 'Commercial Shoot' },
    { value: 'runway-show', label: 'Runway Show' },
    { value: 'catalog-shoot', label: 'Catalog Shoot' },
    { value: 'editorial-shoot', label: 'Editorial Shoot' },
    { value: 'beauty-shoot', label: 'Beauty Shoot' },
    { value: 'lifestyle-shoot', label: 'Lifestyle Shoot' },
    { value: 'product-modeling', label: 'Product Modeling' },
    { value: 'brand-ambassador', label: 'Brand Ambassador' },
    { value: 'event-modeling', label: 'Event Modeling' },
    { value: 'other', label: 'Other' }
  ];

  const compensationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'paid', label: 'Paid' },
    { value: 'tfp', label: 'TFP (Trade for Prints)' },
    { value: 'expenses-only', label: 'Expenses Only' },
    { value: 'mixed', label: 'Mixed' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'title', label: 'Title A-Z' }
  ];

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        ...filters
      });

      const response = await fetch(`http://localhost:8001/api/opportunities/browse?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPageNum(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPageNum(1);
    fetchOpportunities();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  const getCompensationDisplay = (compensation) => {
    if (compensation.type === 'paid') {
      if (compensation.amount && compensation.amount.min) {
        const min = compensation.amount.min;
        const max = compensation.amount.max;
        const currency = compensation.amount.currency || 'USD';
        
        if (max && max !== min) {
          return `${currency} ${min} - ${max}`;
        }
        return `${currency} ${min}+`;
      }
      return 'Paid';
    }
    return compensation.type.toUpperCase();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>
              Browse Opportunities 🎯
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Discover modeling opportunities from top brands and agencies
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {user && user.userType === 'hiring' && (
              <button
                onClick={() => setCurrentPage('create-opportunity')}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                + Post Opportunity
              </button>
            )}
            <button
              onClick={onLogout}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 0, 0, 0.2)',
                color: '#ff6b6b',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search opportunities..."
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Filters
              </button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  {opportunityTypes.map(type => (
                    <option key={type.value} value={type.value} style={{ background: '#333', color: 'white' }}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                  Compensation
                </label>
                <select
                  value={filters.compensation}
                  onChange={(e) => handleFilterChange('compensation', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  {compensationTypes.map(comp => (
                    <option key={comp.value} value={comp.value} style={{ background: '#333', color: 'white' }}>
                      {comp.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location === 'all' ? '' : filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value || 'all')}
                  placeholder="City or Country"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}>
            <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading opportunities...</div>
          </div>
        ) : opportunities.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '60px 20px',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>
              No opportunities found
            </h3>
            <p style={{ color: '#ccc' }}>
              Try adjusting your search filters to find more opportunities.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '25px',
              marginBottom: '30px'
            }}>
              {opportunities.map((opportunity) => (
                <div
                  key={opportunity._id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentPage(`opportunity-detail-${opportunity._id}`)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Company Logo */}
                  <div style={{ padding: '20px 20px 0 20px' }}>
                    {opportunity.company?.logo ? (
                      <img
                        src={opportunity.company.logo}
                        alt={opportunity.company.companyName}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        {opportunity.company?.companyName?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '0 20px 20px 20px' }}>
                    {/* Title */}
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.3rem',
                      margin: '15px 0 10px 0',
                      lineHeight: '1.4'
                    }}>
                      {opportunity.title}
                    </h3>

                    {/* Company */}
                    <p style={{
                      color: '#ccc',
                      fontSize: '0.9rem',
                      margin: '0 0 15px 0'
                    }}>
                      {opportunity.company?.companyName}
                    </p>

                    {/* Type and Compensation */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '15px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {opportunity.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        background: opportunity.compensation.type === 'paid' 
                          ? 'rgba(76, 175, 80, 0.3)' 
                          : 'rgba(255, 193, 7, 0.3)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {getCompensationDisplay(opportunity.compensation)}
                      </span>
                    </div>

                    {/* Location */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#ccc',
                      fontSize: '0.9rem',
                      marginBottom: '15px'
                    }}>
                      <span style={{ marginRight: '8px' }}>📍</span>
                      {opportunity.location.city}, {opportunity.location.country}
                    </div>

                    {/* Deadline */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '15px'
                    }}>
                      <div style={{
                        color: '#ccc',
                        fontSize: '0.85rem'
                      }}>
                        <span style={{ marginRight: '8px' }}>⏰</span>
                        Apply by: {formatDate(opportunity.applicationDeadline)}
                      </div>
                      <div style={{
                        color: getDaysRemaining(opportunity.applicationDeadline).includes('day') 
                          ? '#FFB74D' 
                          : getDaysRemaining(opportunity.applicationDeadline) === 'Today' 
                            ? '#F44336' 
                            : '#66BB6A',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {getDaysRemaining(opportunity.applicationDeadline)}
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '15px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{
                        color: '#999',
                        fontSize: '0.8rem'
                      }}>
                        {opportunity.applicationCount || 0} applications
                      </div>
                      <div style={{
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        View Details →
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '30px'
              }}>
                <button
                  onClick={() => setCurrentPageNum(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '10px 20px',
                    background: currentPage === 1 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(255, 255, 255, 0.2)',
                    color: currentPage === 1 ? '#666' : 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>

                <span style={{ color: 'white', padding: '0 20px' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPageNum(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '10px 20px',
                    background: currentPage === totalPages 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(255, 255, 255, 0.2)',
                    color: currentPage === totalPages ? '#666' : 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Opportunities;