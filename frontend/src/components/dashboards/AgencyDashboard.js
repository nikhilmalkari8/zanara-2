import React, { useState, useEffect } from 'react';

const AgencyDashboard = ({ user, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
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
        
        // Fetch company profile data
        const profileResponse = await fetch('http://localhost:8001/api/company/me/profile', {
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

        // Fetch agency opportunities (posted by this agency)
        const opportunitiesResponse = await fetch('http://localhost:8001/api/opportunities/company/mine?limit=5', {
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

        // Set agency-specific stats
        setStats({
          talentRosterSize: 87,
          activePlacements: 34,
          clientRelationships: 42,
          commissionRevenue: 184000,
          bookingSuccessRate: 73,
          connections: connections.length || 128
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
          background: 'linear-gradient(135deg, #6c5ce7 0%, #5f3dc4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading Agency Hub...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6c5ce7 0%, #5f3dc4 100%)',
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
              🎭 Welcome back, {profile?.companyName || user?.firstName}! 
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Your agency command center - manage talent roster, clients, and bookings
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
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
              📢 Post Casting Call
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
          {/* Agency Metrics Cards */}
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
              Agency Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  {stats.talentRosterSize || 87}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Talent Roster</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.activePlacements || 34}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Active Placements</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#FF9800', fontWeight: 'bold' }}>
                  {stats.clientRelationships || 42}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Client Relations</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#E91E63', fontWeight: 'bold' }}>
                  {stats.bookingSuccessRate || 73}%
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Success Rate</div>
              </div>
            </div>
          </div>

          {/* Talent Roster Overview */}
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
              Talent Roster Overview
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.6' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#4CAF50', fontWeight: 'bold' }}>32</div>
                  <div style={{ color: '#ccc', fontSize: '14px' }}>Models</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#2196F3', fontWeight: 'bold' }}>18</div>
                  <div style={{ color: '#ccc', fontSize: '14px' }}>Photographers</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#FF9800', fontWeight: 'bold' }}>15</div>
                  <div style={{ color: '#ccc', fontSize: '14px' }}>Stylists</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#E91E63', fontWeight: 'bold' }}>22</div>
                  <div style={{ color: '#ccc', fontSize: '14px' }}>MUA/Other</div>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Active Talent (Available)</span>
                  <span style={{ fontSize: '12px', color: '#4CAF50' }}>72/87 (83%)</span>
                </div>
                <div style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '83%',
                    height: '100%',
                    background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Currently Booked</span>
                  <span style={{ fontSize: '12px', color: '#FF9800' }}>34/87 (39%)</span>
                </div>
                <div style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '39%',
                    height: '100%',
                    background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('talent-roster')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(45deg, #6c5ce7, #5f3dc4)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              👥 Manage Roster
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
              Agency Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('add-talent')}
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
                ➕ Add Talent
              </button>

              <button
                onClick={() => setCurrentPage('create-opportunity')}
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
                📢 Post Casting
              </button>

              <button
                onClick={() => setCurrentPage('client-relationships')}
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
                🤝 Clients
              </button>

              <button
                onClick={() => setCurrentPage('talent-performance')}
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
                📊 Performance
              </button>

              <button
                onClick={() => setCurrentPage('browse-talent')}
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
                🔍 Scout Talent
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

          {/* Active Client Projects */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>🎬</span>
              Active Client Projects
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
                      Fashion Week Casting
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Elite Fashion Magazine - 15 Models
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6c5ce7' }}>
                      Deadline: June 25th
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
                      Commercial Campaign
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Global Beauty Brand - Multi-talent
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#2196F3' }}>
                      Production: July 1-15
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
                    Casting
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
                      TV Commercial Series
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Automotive Client - Ongoing
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#FF9800' }}>
                      Q3 Production Schedule
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
                    Development
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Casting Call Management */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>📢</span>
              Casting Management
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.6' }}>
              {opportunities.length > 0 ? (
                opportunities.slice(0, 3).map((opportunity, index) => (
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
                      {opportunity.applications?.length || 0} Applications • {opportunity.location?.city}
                    </p>
                    <button
                      onClick={() => setCurrentPage(`opportunity-detail-${opportunity._id}`)}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #6c5ce7, #5f3dc4)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Manage Casting
                    </button>
                  </div>
                ))
              ) : (
                <>
                  <div style={{ marginBottom: '15px', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                      Summer Campaign Casting
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                      47 Applications • NYC Location
                    </p>
                    <button
                      onClick={() => setCurrentPage('create-opportunity')}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #6c5ce7, #5f3dc4)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Create Casting
                    </button>
                  </div>
                  <div style={{ marginBottom: '15px', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                      Editorial Shoot Talent
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                      23 Applications • LA Studio
                    </p>
                    <button
                      onClick={() => setCurrentPage('create-opportunity')}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #6c5ce7, #5f3dc4)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Create Casting
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage('casting-call-manager')}
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
              Manage All Casting Calls →
            </button>
          </div>

          {/* Business Analytics */}
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
                  ${(stats.commissionRevenue / 1000).toFixed(0)}K
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Commission Revenue</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.connections || 128}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Industry Contacts</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('talent-roster-management')}
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
                👥 Roster
              </button>

              <button
                onClick={() => setCurrentPage('client-crm')}
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
                🤝 Client CRM
              </button>

              <button
                onClick={() => setCurrentPage('booking-calendar')}
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
                📅 Calendar
              </button>

              <button
                onClick={() => setCurrentPage('commission-tracking')}
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
                💰 Commission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;