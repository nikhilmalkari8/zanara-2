import React, { useState, useEffect, useCallback } from 'react';

const OpportunityDetail = ({ opportunityId, user, onLogout, setCurrentPage }) => {
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    customAnswers: [],
    portfolioUrls: []
  });
  const [userApplication, setUserApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [message, setMessage] = useState('');

  // Check if user owns this opportunity
  const isOwner = user && opportunity && opportunity.company && 
    (opportunity.company.owner === user.id || 
     (opportunity.company.admins && opportunity.company.admins.includes(user.id)));

  const fetchOpportunity = useCallback(async () => {
    try {
      const headers = {};
      if (user) {
        const token = localStorage.getItem('token');
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:8001/api/opportunities/${opportunityId}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setOpportunity(data);
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
    } finally {
      setLoading(false);
    }
  }, [opportunityId, user]);

  const checkApplicationStatus = useCallback(async () => {
    if (!user || user.userType !== 'model') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/opportunities/${opportunityId}/my-application`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserApplication(data);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  }, [opportunityId, user]);

  const fetchApplications = useCallback(async () => {
    if (!user || user.userType !== 'hiring' || !isOwner) return;
    
    setLoadingApplications(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/opportunities/${opportunityId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  }, [opportunityId, user, isOwner]);

  useEffect(() => {
    fetchOpportunity();
    if (user && user.userType === 'model') {
      checkApplicationStatus();
    }
  }, [fetchOpportunity, checkApplicationStatus, user]);

  useEffect(() => {
    // If user is hiring and owns this opportunity, fetch applications
    if (user && user.userType === 'hiring' && opportunity && isOwner) {
      fetchApplications();
    }
  }, [fetchApplications, user, opportunity, isOwner]);

  // Update handling in OpportunityDetail.js to check for valid professional type

const handleApply = async () => {
  if (!user) {
    setCurrentPage('login');
    return;
  }

  // Check if user's professional type is eligible to apply
  if (!opportunity.targetProfessionalTypes?.includes(user.professionalType)) {
    setMessage(`This opportunity is not open to ${user.professionalType.replace('-', ' ')}s. It's only available for ${opportunity.targetProfessionalTypes?.map(t => t.replace('-', ' ')).join(', ')}.`);
    return;
  }

  setApplying(true);
  setMessage('');

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8001/api/opportunities/${opportunityId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(applicationData)
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Application submitted successfully!');
      setUserApplication({
        hasApplied: true,
        canApply: false,
        application: {
          status: 'pending',
          appliedAt: new Date().toISOString(),
          coverLetter: applicationData.coverLetter
        }
      });
      // Refresh the opportunity to get updated application count
      fetchOpportunity();
    } else {
      setMessage(data.message || 'Failed to submit application');
    }
  } catch (error) {
    setMessage('Error submitting application. Please try again.');
  } finally {
    setApplying(false);
  }
};

  const updateApplicationStatus = async (applicationId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/opportunities/${opportunityId}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, companyNotes: notes })
      });

      if (response.ok) {
        // Refresh applications
        fetchApplications();
        setMessage(`Application ${status} successfully!`);
      }
    } catch (error) {
      console.error('Error updating application:', error);
      setMessage('Error updating application status');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFB74D';
      case 'reviewing': return '#42A5F5';
      case 'shortlisted': return '#66BB6A';
      case 'selected': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#ccc';
    }
  };

  const getApplicationStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'reviewing': return 'Under Review';
      case 'shortlisted': return 'Shortlisted';
      case 'selected': return 'Selected';
      case 'rejected': return 'Not Selected';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading opportunity...</div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem', marginBottom: '20px' }}>
          Opportunity not found
        </div>
        <button
          onClick={() => setCurrentPage('opportunities')}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Opportunities
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px' }}>
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
          <button
            onClick={() => setCurrentPage('opportunities')}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to Opportunities
          </button>
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

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isOwner ? '1fr' : '2fr 1fr', gap: '30px' }}>
          
          {/* Left Column - Opportunity Details */}
          <div>
            {/* Hero Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '30px',
              marginBottom: '20px'
            }}>
              {/* Company Logo and Info */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                {opportunity.company?.logo ? (
                  <img
                    src={opportunity.company.logo}
                    alt={opportunity.company.companyName}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      marginRight: '15px'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    marginRight: '15px'
                  }}>
                    {opportunity.company?.companyName?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h2 style={{ color: 'white', fontSize: '1.1rem', margin: 0 }}>
                    {opportunity.company?.companyName}
                  </h2>
                  <p style={{ color: '#ccc', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                    {opportunity.location.city}, {opportunity.location.country}
                  </p>
                </div>
              </div>

              {/* Title and Type */}
              {/* Title and Type */}
              <h1 style={{ color: 'white', fontSize: '2.5rem', margin: '0 0 15px 0', lineHeight: '1.2' }}>
                {opportunity.title}
              </h1>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '6px 16px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {opportunity.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span style={{
                  padding: '6px 16px',
                  background: opportunity.compensation.type === 'paid' 
                    ? 'rgba(76, 175, 80, 0.3)' 
                    : 'rgba(255, 193, 7, 0.3)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {getCompensationDisplay(opportunity.compensation)}
                </span>
              </div>

              {/* Target Professional Types */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 8px 0' }}>Open to:</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(opportunity.targetProfessionalTypes || ['model']).map(type => (
                    <span key={type} style={{
                      padding: '4px 12px',
                      background: user?.professionalType === type ? 'rgba(78, 205, 196, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                      color: user?.professionalType === type ? '#4ecdc4' : '#ccc',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      border: user?.professionalType === type ? '1px solid #4ecdc4' : 'none'
                    }}>
                      {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {user?.professionalType === type && <span style={{ marginLeft: '4px' }}>✓</span>}
                    </span>
                  ))}
                </div>
              </div>


              {/* Key Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Shoot Date</h4>
                  <p style={{ color: 'white', fontSize: '1rem', margin: 0 }}>
                    {formatDate(opportunity.shootDate)}
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Application Deadline</h4>
                  <p style={{ 
                    color: getDaysRemaining(opportunity.applicationDeadline).includes('day') ? '#FFB74D' : '#F44336',
                    fontSize: '1rem', 
                    margin: 0,
                    fontWeight: 'bold'
                  }}>
                    {formatDate(opportunity.applicationDeadline)} ({getDaysRemaining(opportunity.applicationDeadline)})
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Location</h4>
                  <p style={{ color: 'white', fontSize: '1rem', margin: 0 }}>
                    {opportunity.location.venue || `${opportunity.location.city}, ${opportunity.location.country}`}
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Duration</h4>
                  <p style={{ color: 'white', fontSize: '1rem', margin: 0 }}>
                    {opportunity.duration.hours && `${opportunity.duration.hours} hours`}
                    {opportunity.duration.days && ` • ${opportunity.duration.days} days`}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '25px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>
                About This Opportunity
              </h3>
              <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '1rem', whiteSpace: 'pre-line' }}>
                {opportunity.description}
              </p>
            </div>

            {/* Requirements */}
            {opportunity.requirements && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '25px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>
                  Requirements
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {opportunity.requirements.gender !== 'any' && (
                    <div>
                      <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Gender</h4>
                      <p style={{ color: 'white', margin: 0 }}>{opportunity.requirements.gender}</p>
                    </div>
                  )}
                  {(opportunity.requirements.ageRange.min || opportunity.requirements.ageRange.max) && (
                    <div>
                      <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Age Range</h4>
                      <p style={{ color: 'white', margin: 0 }}>
                        {opportunity.requirements.ageRange.min && opportunity.requirements.ageRange.max
                          ? `${opportunity.requirements.ageRange.min} - ${opportunity.requirements.ageRange.max} years`
                          : opportunity.requirements.ageRange.min
                            ? `${opportunity.requirements.ageRange.min}+ years`
                            : `Up to ${opportunity.requirements.ageRange.max} years`
                        }
                      </p>
                    </div>
                  )}
                  {(opportunity.requirements.height.min || opportunity.requirements.height.max) && (
                    <div>
                      <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Height</h4>
                      <p style={{ color: 'white', margin: 0 }}>
                        {opportunity.requirements.height.min && opportunity.requirements.height.max
                          ? `${opportunity.requirements.height.min} - ${opportunity.requirements.height.max}`
                          : opportunity.requirements.height.min
                            ? `Min: ${opportunity.requirements.height.min}`
                            : `Max: ${opportunity.requirements.height.max}`
                        }
                      </p>
                    </div>
                  )}
                  {opportunity.requirements.experienceLevel !== 'any' && (
                    <div>
                      <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Experience</h4>
                      <p style={{ color: 'white', margin: 0 }}>
                        {opportunity.requirements.experienceLevel.charAt(0).toUpperCase() + 
                         opportunity.requirements.experienceLevel.slice(1)}
                      </p>
                    </div>
                  )}
                </div>
                
                {opportunity.requirements.additionalNotes && (
                  <div style={{ marginTop: '15px' }}>
                    <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Additional Notes</h4>
                    <p style={{ color: 'white', margin: 0, lineHeight: '1.5' }}>
                      {opportunity.requirements.additionalNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Compensation Details */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '25px'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>
                Compensation & Benefits
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Type</h4>
                <p style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>
                  {getCompensationDisplay(opportunity.compensation)}
                </p>
              </div>
              
              {opportunity.compensation.paymentStructure && (
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Payment Structure</h4>
                  <p style={{ color: 'white', margin: 0 }}>
                    {opportunity.compensation.paymentStructure.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              )}
              
              {opportunity.compensation.details && (
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Details</h4>
                  <p style={{ color: 'white', margin: 0, lineHeight: '1.5' }}>
                    {opportunity.compensation.details}
                  </p>
                </div>
              )}
              
              {opportunity.compensation.additionalBenefits && opportunity.compensation.additionalBenefits.length > 0 && (
                <div>
                  <h4 style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 10px 0' }}>Additional Benefits</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {opportunity.compensation.additionalBenefits.map((benefit, index) => (
                      <span key={index} style={{
                        padding: '4px 12px',
                        background: 'rgba(76, 175, 80, 0.2)',
                        color: '#81C784',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                      }}>
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Application Panel or Applications List */}
          {!isOwner && (
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '25px',
                position: 'sticky',
                top: '20px'
              }}>
                <h3 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '20px' }}>
                  Application
                </h3>

                {/* Application Status */}
                {userApplication?.hasApplied ? (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: getApplicationStatusColor(userApplication.application.status),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 15px',
                      fontSize: '24px'
                    }}>
                      {userApplication.application.status === 'selected' ? '🎉' : 
                       userApplication.application.status === 'rejected' ? '❌' : 
                       userApplication.application.status === 'shortlisted' ? '⭐' : '⏳'}
                    </div>
                    <h4 style={{
                      color: getApplicationStatusColor(userApplication.application.status),
                      margin: '0 0 10px 0',
                      fontSize: '1.1rem'
                    }}>
                      {getApplicationStatusText(userApplication.application.status)}
                    </h4>
                    <p style={{ color: '#ccc', fontSize: '0.9rem', margin: 0 }}>
                      Applied on {formatDate(userApplication.application.appliedAt)}
                    </p>
                  </div>
                ) : (
                  <>
                    {opportunity.applicationProcess?.requiresCoverLetter && (
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>
                          Cover Letter {opportunity.applicationProcess.requiresCoverLetter ? '*' : '(Optional)'}
                        </label>
                        <textarea
                          value={applicationData.coverLetter}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                          rows="4"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical'
                          }}
                          placeholder="Tell them why you're perfect for this opportunity..."
                        />
                      </div>
                    )}

                    {/* Portfolio URLs */}
                    {opportunity.applicationProcess?.requiresPortfolio && (
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>
                          Portfolio URLs (comma separated)
                        </label>
                        <input
                          type="text"
                          value={applicationData.portfolioUrls.join(', ')}
                          onChange={(e) => setApplicationData(prev => ({
                            ...prev,
                            portfolioUrls: e.target.value.split(',').map(url => url.trim()).filter(url => url)
                          }))}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                          placeholder="https://instagram.com/yourprofile, https://yourwebsite.com"
                        />
                      </div>
                    )}

                    {message && (
                      <div style={{
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        background: message.includes('successfully') 
                          ? 'rgba(76, 175, 80, 0.2)' 
                          : 'rgba(244, 67, 54, 0.2)',
                        border: `1px solid ${message.includes('successfully') ? '#4CAF50' : '#F44336'}`,
                        color: message.includes('successfully') ? '#81C784' : '#EF5350',
                        fontSize: '0.9rem'
                      }}>
                        {message}
                      </div>
                    )}

                    {/* Apply Button */}
                    <button
                      onClick={handleApply}
                      disabled={applying || getDaysRemaining(opportunity.applicationDeadline) === 'Expired'}
                      style={{
                        width: '100%',
                        padding: '15px',
                        background: applying 
                          ? '#666' 
                          : getDaysRemaining(opportunity.applicationDeadline) === 'Expired'
                            ? '#666'
                            : 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: applying || getDaysRemaining(opportunity.applicationDeadline) === 'Expired' 
                          ? 'not-allowed' 
                          : 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        marginBottom: '15px'
                      }}
                    >
                      {applying 
                        ? 'Submitting Application...' 
                        : getDaysRemaining(opportunity.applicationDeadline) === 'Expired'
                          ? 'Application Deadline Passed'
                          : 'Apply Now'
                      }
                    </button>
                  </>
                )}

                {/* Application Stats */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>
                    {applications.length || opportunity.applicationCount || 0} applications received
                  </p>
                  <p style={{ color: '#999', fontSize: '0.8rem', margin: 0 }}>
                    {opportunity.views || 0} views
                  </p>
                </div>

                {/* Application Instructions */}
                {opportunity.applicationProcess?.instructions && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '15px',
                    borderRadius: '8px',
                    marginTop: '15px'
                  }}>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', margin: '0 0 8px 0' }}>
                      Application Instructions
                    </h4>
                    <p style={{ color: '#ccc', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
                      {opportunity.applicationProcess.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Applications Management Section (for hiring companies) */}
        {isOwner && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '25px',
            marginTop: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>
                Applications ({applications.length})
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 193, 7, 0.3)',
                  color: '#FFD54F',
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}>
                  {applications.filter(app => app.status === 'pending').length} Pending
                </span>
                <span style={{
                  padding: '6px 12px',
                  background: 'rgba(76, 175, 80, 0.3)',
                  color: '#81C784',
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}>
                  {applications.filter(app => app.status === 'shortlisted').length} Shortlisted
                </span>
                <span style={{
                  padding: '6px 12px',
                  background: 'rgba(33, 150, 243, 0.3)',
                  color: '#64B5F6',
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}>
                  {applications.filter(app => app.status === 'selected').length} Selected
                </span>
              </div>
            </div>

            {message && (
              <div style={{
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                background: message.includes('successfully') 
                  ? 'rgba(76, 175, 80, 0.2)' 
                  : 'rgba(244, 67, 54, 0.2)',
                border: `1px solid ${message.includes('successfully') ? '#4CAF50' : '#F44336'}`,
                color: message.includes('successfully') ? '#81C784' : '#EF5350',
                fontSize: '0.9rem'
              }}>
                {message}
              </div>
            )}

            {loadingApplications ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📝</div>
                <h4 style={{ color: 'white', marginBottom: '10px' }}>No Applications Yet</h4>
                <p style={{ color: '#ccc' }}>Applications will appear here when models apply to your opportunity.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {applications.map((application) => (
                  <div key={application._id} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div>
                        <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '1.1rem' }}>
                          {application.applicant?.firstName} {application.applicant?.lastName}
                        </h4>
                        <p style={{ color: '#ccc', margin: '0 0 5px 0', fontSize: '0.9rem' }}>
                          {application.applicant?.email}
                        </p>
                        <p style={{ color: '#999', margin: 0, fontSize: '0.8rem' }}>
                          Applied: {formatDate(application.appliedAt)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          padding: '4px 12px',
                          background: `rgba(${
                            application.status === 'selected' ? '76, 175, 80' :
                            application.status === 'shortlisted' ? '255, 193, 7' :
                            application.status === 'reviewing' ? '33, 150, 243' :
                            application.status === 'rejected' ? '244, 67, 54' :
                            '158, 158, 158'
                          }, 0.3)`,
                          color: getApplicationStatusColor(application.status),
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {getApplicationStatusText(application.status)}
                        </span>
                      </div>
                    </div>

                    {application.coverLetter && (
                      <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ color: '#ccc', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Cover Letter:</h5>
                        <p style={{ color: 'white', margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                    {application.portfolioUrls && application.portfolioUrls.length > 0 && (
                      <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ color: '#ccc', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Portfolio:</h5>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {application.portfolioUrls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#4ecdc4',
                                textDecoration: 'underline',
                                fontSize: '0.8rem'
                              }}
                            >
                              Portfolio {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {application.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'reviewing')}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(45deg, #42A5F5, #1E88E5)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Mark as Reviewing
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(45deg, #66BB6A, #4CAF50)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(45deg, #F44336, #D32F2F)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {(application.status === 'reviewing' || application.status === 'shortlisted') && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {application.status === 'reviewing' && (
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(45deg, #66BB6A, #4CAF50)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Shortlist
                          </button>
                        )}
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'selected')}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(45deg, #4CAF50, #388E3C)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Select
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(45deg, #F44336, #D32F2F)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {application.companyNotes && (
                      <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                        <h5 style={{ color: '#ccc', margin: '0 0 5px 0', fontSize: '0.8rem' }}>Notes:</h5>
                        <p style={{ color: 'white', margin: 0, fontSize: '0.8rem' }}>
                          {application.companyNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityDetail;