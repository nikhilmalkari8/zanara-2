import React, { useState, useEffect } from 'react';

const MakeupArtistDashboard = ({ user, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
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

        // Fetch makeup opportunities
        const opportunitiesResponse = await fetch('http://localhost:8001/api/opportunities/browse?limit=3&type=makeup', {
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

        // Set makeup artist-specific stats
        setStats({
          makeupSessions: 89,
          clientBookings: 23,
          kitProducts: 147,
          portfolioPhotos: profile?.photos?.length || 0,
          monthlyRevenue: 6800,
          connections: connections.length || 38
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
          background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading Beauty Studio...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
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
              💄 Welcome back, {user?.firstName || profile?.fullName}! 
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Your beauty studio - manage bookings, kit, and stunning looks
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
              ✨ Find Makeup Gigs
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
          {/* Makeup Metrics Cards */}
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
              Beauty Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  {stats.makeupSessions || 89}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Makeup Sessions</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.clientBookings || 23}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Bookings This Month</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#FF9800', fontWeight: 'bold' }}>
                  {stats.kitProducts || 147}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Kit Products</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#E91E63', fontWeight: 'bold' }}>
                  {stats.portfolioPhotos || 0}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Portfolio Looks</div>
              </div>
            </div>
          </div>

          {/* Kit Inventory Status */}
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
              Kit Inventory
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Foundation Range:</span>
                <span style={{ color: '#4CAF50' }}>✅ Well Stocked</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Eyeshadow Palettes:</span>
                <span style={{ color: '#4CAF50' }}>✅ Complete</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Lipstick Collection:</span>
                <span style={{ color: '#2196F3' }}>45 shades</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Brushes & Tools:</span>
                <span style={{ color: '#4CAF50' }}>✅ Professional Set</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span>Setting Products:</span>
                <span style={{ color: '#FF9800' }}>⚠️ Running Low (3)</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('kit-inventory')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(45deg, #fd79a8, #e84393)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🛍️ Manage Kit Inventory
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
              Beauty Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('upload-makeup-looks')}
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
                📸 Upload Looks
              </button>

              <button
                onClick={() => setCurrentPage('kit-management')}
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
                💼 Manage Kit
              </button>

              <button
                onClick={() => setCurrentPage('schedule-appointments')}
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
                📅 Appointments
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
                🔍 Find Gigs
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

          {/* Upcoming Appointments */}
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
              Upcoming Appointments
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
                      Bridal Makeup Trial
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Emma Roberts - June Wedding
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#fd79a8' }}>
                      Tomorrow, 2:00 PM - Studio
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
                      Fashion Shoot Makeup
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Vogue Editorial - 3 Models
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#2196F3' }}>
                      Thursday, 8:00 AM - Location Shoot
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
                    Prep Required
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
                      Special Event Glam
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Celebrity Client - Red Carpet
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#FF9800' }}>
                      Saturday, 4:00 PM - Private Location
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
                    VIP Client
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Makeup Opportunities */}
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
              Beauty Opportunities
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
                        background: 'linear-gradient(45deg, #fd79a8, #e84393)',
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
                      Bridal Makeup Bookings
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                      NYC • $350/session • Wedding Season
                    </p>
                    <button
                      onClick={() => setCurrentPage('opportunities')}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #fd79a8, #e84393)',
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
                      Fashion Shoot Makeup
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                      LA • $800/day • Editorial Work
                    </p>
                    <button
                      onClick={() => setCurrentPage('opportunities')}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #fd79a8, #e84393)',
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
              Browse All Beauty Gigs →
            </button>
          </div>

          {/* Look Inspiration Gallery */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>🎨</span>
              Beauty Tools
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  ${stats.monthlyRevenue || 6800}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Monthly Revenue</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.connections || 38}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Connections</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('kit-inventory')}
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
                💼 Kit Manager
              </button>

              <button
                onClick={() => setCurrentPage('look-inspiration')}
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
                🎨 Inspiration
              </button>

              <button
                onClick={() => setCurrentPage('skin-tone-database')}
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
                🎭 Skin Tones
              </button>

              <button
                onClick={() => setCurrentPage('product-tracking')}
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
                📦 Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeupArtistDashboard;