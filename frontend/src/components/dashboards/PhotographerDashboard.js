import React, { useState, useEffect } from 'react';

const PhotographerDashboard = ({ user, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
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
        const profileResponse = await fetch('http://localhost:8001/api/professional-profile/me', {
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

        // Fetch photography opportunities
        const opportunitiesResponse = await fetch('http://localhost:8001/api/opportunities/browse?limit=3&type=photography', {
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

        // Set photographer-specific stats
        setStats({
          shootsCompleted: 47,
          portfolioPhotos: profile?.photos?.length || 0,
          clientRating: 4.8,
          bookingsThisMonth: 12,
          revenue: 8500,
          connections: connections.length || 31
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

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading Photography Dashboard...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
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
              📸 Welcome back, {user?.firstName || profile?.fullName}! 
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Your photography dashboard - manage shoots, clients, and portfolio
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
              📷 Find Photography Projects
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
          {/* Photography Metrics Cards */}
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
              Photography Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  {stats.shootsCompleted || 47}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Shoots Completed</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.portfolioPhotos || 0}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Portfolio Photos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#FF9800', fontWeight: 'bold' }}>
                  {stats.clientRating || 4.8}★
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Client Rating</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#E91E63', fontWeight: 'bold' }}>
                  {stats.bookingsThisMonth || 12}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Bookings This Month</div>
              </div>
            </div>
          </div>

          {/* Equipment Status Card */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>📷</span>
              Equipment Status
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Primary Camera:</span>
                <span style={{ color: '#4CAF50' }}>✅ Ready</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Backup Camera:</span>
                <span style={{ color: '#4CAF50' }}>✅ Ready</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Lighting Kit:</span>
                <span style={{ color: '#4CAF50' }}>✅ Available</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Lens Collection:</span>
                <span style={{ color: '#2196F3' }}>12 lenses</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span>Battery Status:</span>
                <span style={{ color: '#FF9800' }}>⚠️ Low (2/6)</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('equipment-manager')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(45deg, #26de81, #20bf6b)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🛠️ Manage Equipment
            </button>
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
              Photography Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('portfolio-manager')}
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
                📸 Upload Photos
              </button>

              <button
                onClick={() => setCurrentPage('shoot-calendar')}
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
                📅 Schedule Shoot
              </button>

              <button
                onClick={() => setCurrentPage('equipment-inventory')}
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
                🛠️ Equipment
              </button>

              <button
                onClick={() => setCurrentPage('availability-update')}
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
                📋 Availability
              </button>

              <button
                onClick={() => setCurrentPage('opportunities')}
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
                🔍 Find Projects
              </button>

              <button
                onClick={() => setCurrentPage('connections')}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(45deg, #E91E63, #F06292)',
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
            </div>
          </div>

          {/* Shoot Calendar */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>📅</span>
              Upcoming Shoots
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                      Fashion Editorial Shoot
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Elite Fashion Magazine
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#26de81' }}>
                      Tomorrow, 10:00 AM - Studio A
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
                    Confirmed
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginBottom: '15px',
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                      Product Photography
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Beauty Brand Co.
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#2196F3' }}>
                      Friday, 2:00 PM - Client Studio
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
              </div>

              <div
                style={{
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                      Portrait Session
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Individual Client
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#FF9800' }}>
                      Saturday, 11:00 AM - Outdoor Location
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
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photography Opportunities */}
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
              Photography Projects
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
                        background: 'linear-gradient(45deg, #26de81, #20bf6b)',
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
                      Fashion Brand Campaign
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                      NYC • $2,500/day • Editorial Style
                    </p>
                    <button
                      onClick={() => setCurrentPage('opportunities')}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #26de81, #20bf6b)',
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
                      Product Photography
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                      LA • $1,800/day • Commercial
                    </p>
                    <button
                      onClick={() => setCurrentPage('opportunities')}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #26de81, #20bf6b)',
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
              Browse All Photography Projects →
            </button>
          </div>

          {/* Business Tools */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>💼</span>
              Business Tools
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  ${stats.revenue || 8500}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Monthly Revenue</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.connections || 31}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Connections</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('invoice-manager')}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                💰 Invoices
              </button>

              <button
                onClick={() => setCurrentPage('contract-templates')}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(45deg, #2196F3, #42A5F5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                📋 Contracts
              </button>

              <button
                onClick={() => setCurrentPage('client-gallery')}
                style={{
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
                🖼️ Galleries
              </button>

              <button
                onClick={() => setCurrentPage('analytics')}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                📊 Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Preview */}
        {profile?.portfolioWebsite && (
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
            <h3 style={{ color: 'white', marginBottom: '20px' }}>🌐 Portfolio & Social Media</h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a
                href={profile.portfolioWebsite}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(45deg, #26de81, #20bf6b)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🌐 Portfolio Website
              </a>
              {profile.instagramBusiness && (
                <a
                  href={
                    profile.instagramBusiness.startsWith('http')
                      ? profile.instagramBusiness
                      : `https://instagram.com/${profile.instagramBusiness.replace('@', '')}`
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
              {profile.behancePortfolio && (
                <a
                  href={profile.behancePortfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(45deg, #1769FF, #4285F4)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  🎨 Behance
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotographerDashboard;