import React, { useState, useEffect } from 'react';

const BrandDashboard = ({ user, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
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

        // Fetch brand opportunities (posted by this brand)
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

        // Set brand-specific stats
        setStats({
          activeCampaigns: 7,
          talentCollaborations: 24,
          marketingBudget: 125000,
          brandReach: 2400000,
          campaignROI: 3.2,
          connections: connections.length || 56
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
          background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading Brand Hub...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
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
              🏢 Welcome back, {profile?.companyName || user?.firstName}! 
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Your brand command center - manage campaigns, talent, and partnerships
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
              📢 Post New Campaign
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
          {/* Brand Metrics Cards */}
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
              Brand Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                  {stats.activeCampaigns || 7}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Active Campaigns</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.talentCollaborations || 24}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Talent Collabs</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#FF9800', fontWeight: 'bold' }}>
                  {(stats.brandReach / 1000000).toFixed(1)}M
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Brand Reach</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#E91E63', fontWeight: 'bold' }}>
                  {stats.campaignROI || 3.2}x
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Campaign ROI</div>
              </div>
            </div>
          </div>

          {/* Active Campaigns */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>🚀</span>
              Active Campaigns
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
                      Summer Collection Launch
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      12 Influencers • $45K Budget
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#00b894' }}>
                      Launch Date: June 1st
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
                      Brand Ambassador Program
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      8 Models • Long-term Partnership
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#2196F3' }}>
                      Q2 Performance Review Due
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
                      Holiday Campaign Prep
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      Planning Phase • Casting Soon
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#FF9800' }}>
                      Timeline: July - December
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
                    Planning
                  </span>
                </div>
              </div>
            </div>
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
              Brand Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('create-opportunity')}
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
                📢 Post Campaign
              </button>

              <button
                onClick={() => setCurrentPage('campaign-management')}
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
                🚀 Launch Campaign
              </button>

              <button
                onClick={() => setCurrentPage('brand-partnerships')}
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
                🤝 Partnerships
              </button>

              <button
                onClick={() => setCurrentPage('talent-applications')}
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
                📋 Review Apps
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
                🔍 Find Talent
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

          {/* Talent Pipeline */}
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
              Talent Pipeline
            </h3>
            <div style={{ color: '#ccc', lineHeight: '1.6' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#4CAF50', fontWeight: 'bold' }}>47</div>
                  <div style={{ color: '#ccc', fontSize: '14px' }}>New Applications</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#2196F3', fontWeight: 'bold' }}>12</div>
                  <div style={{ color: '#ccc', fontSize: '14px' }}>Shortlisted</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#FF9800', fontWeight: 'bold' }}>8</div>
                  <div style={{ color: '#ccc', fontSize: '14px' }}>In Discussion</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#E91E63', fontWeight: 'bold' }}>5</div>
                  <div style={{ color: '#ccc', fontSize: '14px' }}>Hired</div>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Summer Campaign Casting</span>
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
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Brand Ambassador Search</span>
                  <span style={{ fontSize: '12px', color: '#FF9800' }}>60% Complete</span>
                </div>
                <div style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '60%',
                    height: '100%',
                    background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('talent-pipeline')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(45deg, #00b894, #00a085)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              👥 Manage Talent Pipeline
            </button>
          </div>

          {/* Campaign Performance */}
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
              <span style={{ marginRight: '10px', fontSize: '24px' }}>📈</span>
              Campaign Performance
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
                      Spring Collection Campaign
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      1.2M Reach • 4.8% Engagement
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#00b894' }}>
                      ROI: 3.8x • Budget: $35K
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
                    Excellent
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
                      Influencer Collaboration
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      850K Reach • 3.2% Engagement
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#2196F3' }}>
                      ROI: 2.9x • Budget: $28K
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
                    Good
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
                      Product Launch Event
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      350K Reach • 6.1% Engagement
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#FF9800' }}>
                      ROI: 4.2x • Budget: $18K
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
                    Outstanding
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget & Analytics */}
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
                  ${(stats.marketingBudget / 1000).toFixed(0)}K
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Marketing Budget</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.connections || 56}
                </div>
                <div style={{ color: '#ccc', fontSize: '14px' }}>Connections</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('campaign-dashboard')}
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
                📊 Analytics
              </button>

              <button
                onClick={() => setCurrentPage('talent-crm')}
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
                👥 Talent CRM
              </button>

              <button
                onClick={() => setCurrentPage('budget-tracking')}
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
                💰 Budget
              </button>

              <button
                onClick={() => setCurrentPage('performance-analytics')}
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
                📈 Performance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;