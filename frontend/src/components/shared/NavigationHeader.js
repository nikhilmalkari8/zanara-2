import React, { useState, useEffect } from 'react';

const NavigationHeader = ({ user, currentPage, setCurrentPage, onLogout }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Set up polling for unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Function to get the correct dashboard based on user's professional type
  const getDashboardPage = (userData) => {
    if (!userData) return 'dashboard';
    
    if (userData.userType === 'talent') {
      const dashboardMapping = {
        'model': 'model-dashboard',
        'photographer': 'photographer-dashboard',
        'fashion-designer': 'designer-dashboard',
        'stylist': 'stylist-dashboard',
        'makeup-artist': 'makeup-artist-dashboard'
      };
      return dashboardMapping[userData.professionalType] || 'dashboard';
    } else if (userData.userType === 'hiring') {
      const dashboardMapping = {
        'brand': 'brand-dashboard',
        'agency': 'agency-dashboard'
      };
      // Make sure we never route to 'company-dashboard' - use the same mapping as App.js
      return dashboardMapping[userData.professionalType] || 'agency-dashboard';
    }
    
    return 'dashboard'; // fallback
  };

  // Get the correct dashboard page for this user
  const dashboardPage = getDashboardPage(user);

  const navigationItems = [
    {
      key: dashboardPage,
      label: '🏠 Dashboard',
      color: '#4CAF50'
    },
    {
      key: 'activity-feed',
      label: '📱 Activity Feed',
      color: '#667eea'
    },
    {
      key: 'search',
      label: '🔍 Search',
      color: '#FF9800'
    },
    {
      key: 'content-browser',
      label: '📚 Content',
      color: '#9C27B0'
    },
    {
      key: 'notifications',
      label: `🔔 Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}`,
      color: '#F44336',
      hasNotification: unreadCount > 0
    },
    {
      key: 'messages',
      label: '💬 Messages',
      color: '#00BCD4'
    },
    {
      key: 'subscription-plans',
      label: '⭐ Upgrade',
      color: '#FFD700'
    },
    // Show both opportunities and browse talent for all users
    {
      key: 'opportunities',
      label: '📢 Opportunities',
      color: '#FF9800'
    },
    {
      key: 'browse-talent',
      label: '👥 Browse Talent',
      color: '#2196F3'
    },
    {
      key: 'connections',
      label: '🤝 Network',
      color: '#2196F3'
    }
  ];

  if (!user) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderBottom: '3px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Logo/Brand */}
      <div 
        onClick={() => setCurrentPage(dashboardPage)}
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white',
          cursor: 'pointer',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
        }}
      >
        Zanara
      </div>

      {/* Navigation Items */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        {navigationItems.map(item => (
          <button
            key={item.key}
            onClick={() => setCurrentPage(item.key)}
            style={{
              background: currentPage === item.key
                ? `linear-gradient(45deg, ${item.color}, ${item.color}88)`
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontWeight: currentPage === item.key ? 'bold' : 'normal',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            {item.label}
            {item.hasNotification && (
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ff4444',
                borderRadius: '50%',
                width: '12px',
                height: '12px',
                animation: 'pulse 2s infinite'
              }} />
            )}
          </button>
        ))}
      </div>

      {/* User Menu */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span style={{
          color: 'white',
          fontSize: '14px',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
        }}>
          👋 {user.firstName} ({user.professionalType?.replace('-', ' ')})
        </span>
        <button
          onClick={onLogout}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default NavigationHeader;