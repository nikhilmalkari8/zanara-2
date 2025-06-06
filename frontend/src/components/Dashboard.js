import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout, setCurrentPage, onViewProfile }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8001/api/profile/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle viewing own profile
  const handleViewOwnProfile = () => {
    if (user && user._id) {
      onViewProfile(); // This will trigger the profile page
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user && !profile) return 0;
    
    const profileData = profile || user;
    const fields = [
      profileData.fullName || profileData.firstName,
      profileData.email,
      profileData.headline,
      profileData.bio,
      profileData.location,
      profileData.profilePicture,
      profileData.photos && profileData.photos.length > 0,
      profileData.experience,
      profileData.skills && profileData.skills.length > 0
    ];
    
    const completedFields = fields.filter(field => field).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 30px' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>
              Welcome back, {user?.firstName || profile?.userId?.firstName}! 👋
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Your modeling dashboard - manage your profile and opportunities
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCurrentPage('opportunities')}
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
              🎯 Browse Opportunities
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}
        >
          {/* Profile Summary Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3
                style={{
                  color: 'white',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ marginRight: '10px', fontSize: '24px' }}>👤</span>
                Profile Summary
              </h3>
              <button
                onClick={handleViewOwnProfile}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                View Complete Profile
              </button>
            </div>
            
            {/* Profile Info with Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {profile?.profilePicture || user?.profilePicture ? (
                  <img 
                    src={`http://localhost:8001${profile?.profilePicture || user?.profilePicture}`}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: 'white', fontSize: '24px' }}>👤</span>
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  color: 'white', 
                  margin: '0 0 5px 0',
                  fontSize: '18px'
                }}>
                  {user?.fullName || profile?.userId?.firstName || 'Complete your profile'}
                </h4>
                <p style={{ 
                  color: '#ccc', 
                  margin: '0 0 10px 0',
                  fontSize: '14px'
                }}>
                  {profile?.headline || 'Add a professional headline'}
                </p>
                
                {/* Profile Completion Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#ccc', fontSize: '12px' }}>
                    Profile: {calculateProfileCompletion()}%
                  </span>
                  <div style={{
                    flex: 1,
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${calculateProfileCompletion()}%`,
                      height: '100%',
                      background: calculateProfileCompletion() < 70 
                        ? 'linear-gradient(45deg, #FF9800, #FFB74D)' 
                        : 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            {profile ? (
              <div style={{ color: '#ccc', lineHeight: '1.6' }}>
                <p>
                  <strong>Height:</strong> {profile.height || 'Not specified'}
                </p>
                <p>
                  <strong>Body Type:</strong> {profile.bodyType || 'Not specified'}
                </p>
                <p>
                  <strong>Experience:</strong> {profile.experience ? profile.experience.slice(0, 100) + '...' : 'Not specified'}
                </p>
                <p>
                  <strong>Skills:</strong> {profile.skills && profile.skills.length > 0 ? profile.skills.slice(0, 3).join(', ') : 'Not specified'}
                </p>
                <p>
                  <strong>Availability:</strong> {profile.availability || 'Not specified'}
                </p>
              </div>
            ) : (
              <p style={{ color: '#ccc' }}>Loading profile...</p>
            )}

            {/* Profile Completion Prompt */}
            {calculateProfileCompletion() < 100 && (
              <div style={{
                marginTop: '15px',
                padding: '12px',
                background: 'rgba(255, 193, 7, 0.2)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '8px'
              }}>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '13px', 
                  color: '#FFD54F' 
                }}>
                  Complete your profile to attract more opportunities!
                </p>
                <button 
                  onClick={handleViewOwnProfile}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255, 193, 7, 0.3)',
                    color: '#FFD54F',
                    border: '1px solid rgba(255, 193, 7, 0.4)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Edit Profile Now →
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3
              style={{
                color: 'white',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '24px' }}>📊</span>
              Quick Stats
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>127</div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Profile Views</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#2196F3', fontWeight: 'bold' }}>8</div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Applications</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#FF9800', fontWeight: 'bold' }}>3</div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Bookings</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#E91E63', fontWeight: 'bold' }}>
                  {profile?.photos?.length || 0}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Portfolio Photos</div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3
              style={{
                color: 'white',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '24px' }}>🔔</span>
              Recent Activity
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.8' }}>
              <div
                style={{
                  marginBottom: '15px',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <p style={{ margin: 0, fontSize: '14px' }}>✅ Profile viewed by Fashion Brand Co.</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>2 hours ago</p>
              </div>
              <div
                style={{
                  marginBottom: '15px',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <p style={{ margin: 0, fontSize: '14px' }}>📩 New casting opportunity available</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>1 day ago</p>
              </div>
              <div
                style={{
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <p style={{ margin: 0, fontSize: '14px' }}>⭐ Received 5-star review from client</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>3 days ago</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('activity-feed')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                marginTop: '15px'
              }}
            >
              📱 View Full Activity Feed
            </button>
          </div>

          {/* Quick Actions Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3
              style={{
                color: 'white',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '24px' }}>⚡</span>
              Quick Actions
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px'
              }}
            >
              {/* Profile Management Actions */}
              <button
                onClick={handleViewOwnProfile}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ✏️ Edit Profile
              </button>

              <button
                onClick={() => setCurrentPage('activity-feed')}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                📱 Activity Feed
              </button>

              <button
                onClick={() => setCurrentPage('notifications')}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(45deg, #F44336, #FF6B6B)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🔔 Notifications
              </button>

              {/* Content Creation Actions */}
              <button
                onClick={() => setCurrentPage('content-creator')}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(45deg, #9C27B0, #BA68C8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ✏️ Create Content
              </button>

              <button
                onClick={() => setCurrentPage('my-content')}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(45deg, #607D8B, #78909C)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                📚 My Content
              </button>

              <button
                onClick={() => setCurrentPage('content-browser')}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(45deg, #795548, #8D6E63)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🔍 Browse Content
              </button>

              {/* Network and Opportunities */}
              <button
                onClick={() => setCurrentPage('opportunities')}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(45deg, #2196F3, #42A5F5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🔍 Browse Opportunities
              </button>

              <button
                onClick={() => setCurrentPage('connections')}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(45deg, #9C27B0, #BA68C8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🌐 My Network
              </button>

              <button
                onClick={() => setCurrentPage('network-visualization')}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🕸️ Network Map
              </button>
            </div>
          </div>

          {/* Applications Status Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3
              style={{
                color: 'white',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '24px' }}>📋</span>
              Recent Applications
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.6' }}>
              <div
                style={{
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    Fashion Week Campaign
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                    Elite Fashion Agency
                  </p>
                </div>
                <span
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(255, 193, 7, 0.3)',
                    color: '#FFD54F',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                >
                  Pending
                </span>
              </div>
              <div
                style={{
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    Summer Catalog Shoot
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                    Trendy Brands Inc.
                  </p>
                </div>
                <span
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(76, 175, 80, 0.3)',
                    color: '#81C784',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                >
                  Shortlisted
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    Beauty Product Ad
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                    Glamour Cosmetics
                  </p>
                </div>
                <span
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(33, 150, 243, 0.3)',
                    color: '#64B5F6',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                >
                  Reviewing
                </span>
              </div>
            </div>
          </div>

          {/* Opportunities Recommendation Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3
              style={{
                color: 'white',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '24px' }}>💡</span>
              Recommended For You
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.6' }}>
              <div
                style={{
                  marginBottom: '15px',
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <p
                  style={{
                    margin: '0 0 5px 0',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  Editorial Fashion Shoot
                </p>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                  NYC • $1,500 • 2 days left
                </p>
                <button
                  onClick={() => setCurrentPage('opportunities')}
                  style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  View Details
                </button>
              </div>
              <div
                style={{
                  marginBottom: '15px',
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <p
                  style={{
                    margin: '0 0 5px 0',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  Commercial Campaign
                </p>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                  LA • $2,000 • 5 days left
                </p>
                <button
                  onClick={() => setCurrentPage('opportunities')}
                  style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('opportunities')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              View All Opportunities →
            </button>
          </div>
        </div>

        {/* Social Media Links */}
        {profile?.socialMedia && Object.values(profile.socialMedia).some(Boolean) && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginTop: '20px'
            }}
          >
            <h3 style={{ color: 'white', marginBottom: '20px' }}>🌐 Social Media</h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {profile.socialMedia.instagram && (
                <a
                  href={
                    profile.socialMedia.instagram.startsWith('http')
                      ? profile.socialMedia.instagram
                      : `https://instagram.com/${profile.socialMedia.instagram.replace('@', '')}`
                  }
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
              {profile.socialMedia.tiktok && (
                <a
                  href={
                    profile.socialMedia.tiktok.startsWith('http')
                      ? profile.socialMedia.tiktok
                      : `https://tiktok.com/@${profile.socialMedia.tiktok.replace('@', '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(45deg, #000000, #333333)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  🎵 TikTok
                </a>
              )}
              {profile.socialMedia.youtube && (
                <a
                  href={profile.socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(45deg, #FF0000, #FF4444)',
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
      </div>
    </div>
  );
};

export default Dashboard;