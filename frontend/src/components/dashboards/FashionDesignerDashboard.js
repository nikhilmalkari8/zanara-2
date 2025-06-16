import React, { useState, useEffect } from 'react';

const FashionDesignerDashboard = ({ user, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
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

        // Fetch design opportunities
        const opportunitiesResponse = await fetch('http://localhost:8001/api/opportunities/browse?limit=3&type=design', {
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

        // Set designer-specific stats
        setStats({
          designsCompleted: 23,
          collectionsInDevelopment: 3,
          clientOrders: 8,
          patternLibrarySize: 147,
          revenue: 12400,
          connections: connections.length || 28
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
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading Design Studio...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
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
              ✂️ Welcome back, {user?.firstName || profile?.fullName}! 
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Your design studio - manage collections, clients, and creative projects
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
              🎨 Find Design Projects
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
          {/* Design Metrics Cards */}
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
              Design Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  {stats.designsCompleted || 23}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Designs Completed</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.collectionsInDevelopment || 3}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Collections in Dev</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#FF9800', fontWeight: 'bold' }}>
                  {stats.clientOrders || 8}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Client Orders</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#E91E63', fontWeight: 'bold' }}>
                  {stats.patternLibrarySize || 147}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Pattern Library</div>
              </div>
            </div>
          </div>

          {/* Collection Progress */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>👗</span>
              Collection Progress
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Spring Collection 2025</span>
                  <span style={{ fontSize: '12px', color: '#4CAF50' }}>85% Complete</span>
                </div>
                <div style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '85%',
                    height: '100%',
                    background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Summer Capsule</span>
                  <span style={{ fontSize: '12px', color: '#FF9800' }}>45% Complete</span>
                </div>
                <div style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '45%',
                    height: '100%',
                    background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Evening Wear Line</span>
                  <span style={{ fontSize: '12px', color: '#F44336' }}>20% Complete</span>
                </div>
                <div style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '20%',
                    height: '100%',
                    background: 'linear-gradient(45deg, #F44336, #FF6B6B)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('collection-manager')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🗂️ Manage Collections
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
              Design Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('create-collection')}
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
                ✨ New Collection
              </button>

              <button
                onClick={() => setCurrentPage('design-sketches')}
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
                ✏️ Upload Sketches
              </button>

              <button
                onClick={() => setCurrentPage('pattern-library')}
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
                📐 Pattern Library
              </button>

              <button
                onClick={() => setCurrentPage('material-orders')}
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
                🧵 Materials
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

          {/* Client Projects */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>👥</span>
              Client Projects
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
                      Custom Wedding Dress
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Sarah Johnson - June Wedding
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#ff6b6b' }}>
                      Due: May 15th - Final Fitting
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
                    On Track
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
                      Corporate Uniform Design
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      TechCorp Inc. - 50 pieces
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#2196F3' }}>
                      Due: April 30th - Prototype Review
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
                    Review
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
                      Evening Gown Collection
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Luxury Boutique - 12 pieces
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#FF9800' }}>
                      Due: June 1st - Production Start
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
                    Design Phase
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Design Opportunities */}
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
              Design Opportunities
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
                        background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
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
                      Custom Design Commission
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                      NYC • $3,500 • Bridal Collection
                    </p>
                    <button
                      onClick={() => setCurrentPage('opportunities')}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
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
                      Pattern Making Project
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                      LA • $2,800 • Tech Pack Creation
                    </p>
                    <button
                      onClick={() => setCurrentPage('opportunities')}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
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
              Browse All Design Projects →
            </button>
          </div>

          {/* Design Tools */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>🛠️</span>
              Design Tools
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  ${stats.revenue || 12400}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Monthly Revenue</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.connections || 28}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Connections</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('project-management')}
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
                📋 Projects
              </button>

              <button
                onClick={() => setCurrentPage('material-tracking')}
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
                🧵 Materials
              </button>

              <button
                onClick={() => setCurrentPage('pattern-organization')}
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
                📐 Patterns
              </button>

              <button
                onClick={() => setCurrentPage('client-database')}
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
                👥 Clients
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FashionDesignerDashboard;