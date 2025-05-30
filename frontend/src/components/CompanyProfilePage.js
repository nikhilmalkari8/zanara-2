import React, { useState, useEffect } from 'react';

const CompanyProfilePage = ({ companyId, onBack }) => {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/company/${companyId}`);
        
        if (response.ok) {
          const companyData = await response.json();
          setCompany(companyData);
        } else {
          setError('Company not found');
        }
      } catch (error) {
        setError('Error loading company profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading company profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem', marginBottom: '20px' }}>{error}</div>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
      padding: '20px'
    }}>
      {/* Header with Back Button */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Company Header Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden'
        }}>
          {/* Cover Image */}
          <div style={{
            height: '200px',
            background: company.coverImage 
              ? `url(${company.coverImage}) center/cover`
              : 'linear-gradient(45deg, #4ecdc4, #44a08d)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              display: 'flex',
              alignItems: 'end',
              gap: '20px'
            }}>
              {/* Company Logo */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '10px',
                background: company.logo 
                  ? `url(${company.logo}) center/cover`
                  : 'rgba(255, 255, 255, 0.2)',
                border: '3px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                {!company.logo && company.companyName?.charAt(0)}
              </div>

              {/* Company Name and Info */}
              <div style={{ marginBottom: '10px' }}>
                <h1 style={{ 
                  color: 'white', 
                  fontSize: '2.5rem', 
                  margin: 0,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {company.companyName}
                </h1>
                {company.tagline && (
                  <p style={{ 
                    color: 'white', 
                    fontSize: '1.2rem', 
                    margin: '5px 0 0 0',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {company.tagline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Company Quick Info */}
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ color: '#ccc' }}>
                <span style={{ fontWeight: 'bold' }}>Industry:</span> {company.industry}
              </div>
              <div style={{ color: '#ccc' }}>
                <span style={{ fontWeight: 'bold' }}>Type:</span> {company.companyType}
              </div>
              <div style={{ color: '#ccc' }}>
                <span style={{ fontWeight: 'bold' }}>Size:</span> {company.companySize || 'Not specified'}
              </div>
              <div style={{ color: '#ccc' }}>
                <span style={{ fontWeight: 'bold' }}>Founded:</span> {company.foundedYear || 'Not specified'}
              </div>
              <div style={{ color: '#ccc' }}>
                <span style={{ fontWeight: 'bold' }}>Location:</span> {company.address?.city}, {company.address?.country}
              </div>
              {company.website && (
                <div style={{ color: '#ccc' }}>
                  <span style={{ fontWeight: 'bold' }}>Website:</span>{' '}
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#4ecdc4', textDecoration: 'underline' }}
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* Left Column - Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* About Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h3 style={{ color: 'white', marginBottom: '15px' }}>About {company.companyName}</h3>
              <p style={{ color: '#ccc', lineHeight: '1.6' }}>{company.description}</p>
            </div>

            {/* Specializations */}
            {company.specializations && company.specializations.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h3 style={{ color: 'white', marginBottom: '15px' }}>Specializations</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {company.specializations.map((spec, index) => (
                    <span key={index} style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Projects */}
            {company.portfolio?.projects && company.portfolio.projects.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h3 style={{ color: 'white', marginBottom: '15px' }}>Portfolio</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  {company.portfolio.projects.map((project, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '15px',
                      borderRadius: '10px'
                    }}>
                      <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '8px' }}>
                        {project.title}
                      </h4>
                      {project.year && (
                        <p style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>
                          {project.year}
                        </p>
                      )}
                      {project.description && (
                        <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.4' }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Culture */}
            {company.culture && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h3 style={{ color: 'white', marginBottom: '15px' }}>Company Culture</h3>
                <p style={{ color: '#ccc', lineHeight: '1.6' }}>{company.culture}</p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Contact Information */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h4 style={{ color: 'white', marginBottom: '15px' }}>Contact Information</h4>
              <div style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>
                <p><strong>Email:</strong> {company.email}</p>
                <p><strong>Phone:</strong> {company.phone}</p>
                <p><strong>Address:</strong><br />{company.fullAddress}</p>
              </div>
            </div>

            {/* Company Values */}
            {company.values && company.values.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h4 style={{ color: 'white', marginBottom: '15px' }}>Values</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {company.values.map((value, index) => (
                    <span key={index} style={{
                      color: '#ccc',
                      fontSize: '14px',
                      padding: '5px 0',
                      borderLeft: '3px solid #4ecdc4',
                      paddingLeft: '10px'
                    }}>
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Team Members */}
            {company.team && company.team.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h4 style={{ color: 'white', marginBottom: '15px' }}>Team ({company.team.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {company.team.filter(member => member.isPublic !== false).slice(0, 5).map((member, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {member.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>
                          {member.name || 'Team Member'}
                        </p>
                        <p style={{ color: '#ccc', fontSize: '12px', margin: 0 }}>
                          {member.position || 'Employee'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {company.team.length > 5 && (
                    <p style={{ color: '#ccc', fontSize: '12px', textAlign: 'center', margin: '10px 0 0 0' }}>
                      +{company.team.length - 5} more team members
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Social Media */}
            {company.socialMedia && Object.values(company.socialMedia).some(Boolean) && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h4 style={{ color: 'white', marginBottom: '15px' }}>Follow Us</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {company.socialMedia.linkedin && (
                    <a 
                      href={company.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#4ecdc4',
                        textDecoration: 'none',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      💼 LinkedIn
                    </a>
                  )}
                  {company.socialMedia.instagram && (
                    <a 
                      href={company.socialMedia.instagram.startsWith('http') ? company.socialMedia.instagram : `https://instagram.com/${company.socialMedia.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#4ecdc4',
                        textDecoration: 'none',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      📷 Instagram
                    </a>
                  )}
                  {company.socialMedia.facebook && (
                    <a 
                      href={company.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#4ecdc4',
                        textDecoration: 'none',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      📘 Facebook
                    </a>
                  )}
                  {company.socialMedia.twitter && (
                    <a 
                      href={company.socialMedia.twitter.startsWith('http') ? company.socialMedia.twitter : `https://twitter.com/${company.socialMedia.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#4ecdc4',
                        textDecoration: 'none',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      🐦 Twitter
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;