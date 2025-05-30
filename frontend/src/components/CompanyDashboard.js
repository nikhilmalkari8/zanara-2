import React, { useState, useEffect } from 'react';

const CompanyDashboard = ({ user, onLogout }) => {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8001/api/company/me/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const companyData = await response.json();
          setCompany(companyData);
        }
      } catch (error) {
        console.error('Error fetching company:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 30px' }}>
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
              Welcome back, {company?.companyName || user?.firstName}! 🏢
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Your company dashboard - manage your profile, opportunities, and talent
            </p>
          </div>
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

      {/* Dashboard Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Company Summary Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '25px',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>🏢</span>
              Company Overview
            </h3>
            {company ? (
              <div style={{ color: '#ccc', lineHeight: '1.6' }}>
                <p><strong>Industry:</strong> {company.industry}</p>
                <p><strong>Type:</strong> {company.companyType}</p>
                <p><strong>Location:</strong> {company.address?.city}, {company.address?.country}</p>
                <p><strong>Founded:</strong> {company.foundedYear || 'Not specified'}</p>
                <p><strong>Size:</strong> {company.companySize || 'Not specified'}</p>
                <p><strong>Team Members:</strong> {company.team?.length || 0}</p>
              </div>
            ) : (
              <p style={{ color: '#ccc' }}>Loading company info...</p>
            )}
          </div>

          {/* Quick Stats Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '25px',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>📊</span>
              Quick Stats
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  {company?.stats?.profileViews || 0}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Profile Views</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {company?.stats?.jobsPosted || 0}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Jobs Posted</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#FF9800', fontWeight: 'bold' }}>
                  {company?.stats?.hires || 0}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Total Hires</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#E91E63', fontWeight: 'bold' }}>
                  {company?.stats?.rating || 0}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Rating</div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '25px',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>🔔</span>
              Recent Activity
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.8' }}>
              <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>✅ New model application received</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>2 hours ago</p>
              </div>
              <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>👁️ Company profile viewed 15 times</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>1 day ago</p>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>📝 Job posting "Fashion Model Needed" published</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>3 days ago</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '25px',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>⚡</span>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button style={{
                padding: '15px',
                background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                📝 Post Job
              </button>
              <button style={{
                padding: '15px',
                background: 'linear-gradient(45deg, #2196F3, #42A5F5)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                🔍 Browse Talent
              </button>
              <button style={{
                padding: '15px',
                background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                🏢 Edit Profile
              </button>
              <button style={{
                padding: '15px',
                background: 'linear-gradient(45deg, #E91E63, #EC407A)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                💬 Messages
              </button>
            </div>
          </div>

        </div>

        {/* Company Details Section */}
        {company && (
          <>
            {/* Team Members */}
            {company.team && company.team.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginTop: '20px'
              }}>
                <h3 style={{ color: 'white', marginBottom: '20px' }}>👥 Team Members</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {company.team.slice(0, 6).map((member, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '15px',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                        margin: '0 auto 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {member.name?.charAt(0) || '?'}
                      </div>
                      <p style={{ color: 'white', fontSize: '14px', margin: '0 0 5px 0' }}>
                        {member.name || 'Unknown'}
                      </p>
                      <p style={{ color: '#ccc', fontSize: '12px', margin: 0 }}>
                        {member.position || 'Team Member'}
                      </p>
                    </div>
                  ))}
                </div>
                {company.team.length > 6 && (
                  <p style={{ color: '#ccc', textAlign: 'center', marginTop: '15px' }}>
                    +{company.team.length - 6} more team members
                  </p>
                )}
              </div>
            )}

            {/* Company Specializations */}
            {company.specializations && company.specializations.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginTop: '20px'
              }}>
                <h3 style={{ color: 'white', marginBottom: '20px' }}>🎯 Specializations</h3>
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

            {/* Social Media Links */}
            {company.socialMedia && Object.values(company.socialMedia).some(Boolean) && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginTop: '20px'
              }}>
                <h3 style={{ color: 'white', marginBottom: '20px' }}>🌐 Social Media</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {company.socialMedia.linkedin && (
                    <a 
                      href={company.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(45deg, #0077B5, #005885)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
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
                        padding: '10px 20px',
                        background: 'linear-gradient(45deg, #E4405F, #F56040)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
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
                        padding: '10px 20px',
                        background: 'linear-gradient(45deg, #1877F2, #166FE5)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
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
                        padding: '10px 20px',
                        background: 'linear-gradient(45deg, #1DA1F2, #0D8BD9)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      🐦 Twitter
                    </a>
                  )}
                  {company.socialMedia.youtube && (
                    <a 
                      href={company.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(45deg, #FF0000, #CC0000)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      🎥 YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;