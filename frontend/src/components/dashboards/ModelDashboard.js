import React, { useState, useEffect } from 'react';

const ModelDashboard = ({ user, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch profile data
        const profileResponse = await fetch('http://localhost:8001/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData);
        }

        // Fetch recent activity
        const activityResponse = await fetch('http://localhost:8001/api/activity/feed?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData.activities || []);
        }

        // Fetch opportunities
        const opportunitiesResponse = await fetch('http://localhost:8001/api/opportunities/browse?limit=3', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (opportunitiesResponse.ok) {
          const opportunitiesData = await opportunitiesResponse.json();
          setOpportunities(opportunitiesData.opportunities || []);
        }

        // Fetch connections
        const connectionsResponse = await fetch('http://localhost:8001/api/connections/my-connections?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (connectionsResponse.ok) {
          const connectionsData = await connectionsResponse.json();
          setConnections(connectionsData.connections || []);
        }

        // Set stats
        setStats({
          profileViews: profile?.profileViews || 127,
          applications: 8,
          bookings: 3,
          portfolioPhotos: profile?.photos?.length || 0,
          connections: connections.length || 24,
          completionRate: calculateProfileCompletion()
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle viewing own profile
  const handleViewOwnProfile = () => {
    if (user && (user._id || user.id)) {
      setViewingProfileId(user._id || user.id);
      setCurrentPage('my-profile');
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
          {/* Key Metrics Cards */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>📊</span>
              Model Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  {stats.profileViews || 127}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Profile Views</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.applications || 8}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Applications</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#FF9800', fontWeight: 'bold' }}>
                  {stats.bookings || 3}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Bookings</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#E91E63', fontWeight: 'bold' }}>
                  {stats.portfolioPhotos || 0}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Portfolio Photos</div>
              </div>
            </div>
          </div>

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
              <h3 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center' }}>
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
                Edit Profile
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
                <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '18px' }}>
                  {user?.fullName || profile?.userId?.firstName || 'Complete your profile'}
                </h4>
                <p style={{ color: '#ccc', margin: '0 0 10px 0', fontSize: '14px' }}>
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

            {profile && (
              <div style={{ color: '#ccc', lineHeight: '1.6' }}>
                <p><strong>Height:</strong> {profile.height || 'Not specified'}</p>
                <p><strong>Body Type:</strong> {profile.bodyType || 'Not specified'}</p>
                <p><strong>Experience:</strong> {profile.experience ? profile.experience.slice(0, 100) + '...' : 'Not specified'}</p>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>⚡</span>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
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
                🔍 Find Jobs
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
                🌐 Network
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
                📚 Portfolio
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
                📱 Activity
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
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>🔔</span>
              Recent Activity
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.8' }}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '15px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px'
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '14px' }}>{activity.title}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                      {new Date(activity.createdAt).toRelativeTimeString()}
                    </p>
                  </div>
                ))
              ) : (
                <>
                  <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>✅ Profile viewed by Fashion Brand Co.</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>2 hours ago</p>
                  </div>
                  <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>📩 New casting opportunity available</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>1 day ago</p>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>⭐ Received 5-star review from client</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>3 days ago</p>
                  </div>
                </>
              )}
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

          {/* Relevant Opportunities */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>💡</span>
              Recommended For You
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.6' }}>
              {opportunities.length > 0 ? (
                opportunities.map((opportunity, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '15px',
                      padding: '15px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px'
                    }}
                  >
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                      {opportunity.title}
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                      {opportunity.location?.city} • {opportunity.compensation?.type} • {opportunity.type}
                    </p>
                    <button
                      onClick={() => setCurrentPage(`opportunity-detail-${opportunity._id}`)}
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
                ))
              ) : (
                <>
                  <div style={{ marginBottom: '15px', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
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
                  <div style={{ marginBottom: '15px', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
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
                </>
              )}
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

          {/* Professional Network */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>🌐</span>
              Professional Network
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  {connections.length || 24}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Connections</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#2196F3', fontWeight: 'bold' }}>5</div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>New Requests</div>
              </div>
            </div>
            
            {connections.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '10px' }}>Recent Connections:</p>
                {connections.slice(0, 3).map((connection, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {connection.user?.firstName?.[0] || '?'}
                    </div>
                    <span style={{ color: '#ccc', fontSize: '12px' }}>
                      {connection.user?.firstName} {connection.user?.lastName}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setCurrentPage('connections')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(45deg, #9C27B0, #BA68C8)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🌐 Manage Network
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

export default ModelDashboard;