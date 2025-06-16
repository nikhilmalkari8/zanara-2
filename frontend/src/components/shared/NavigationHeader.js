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

  const navigationItems = [
    {
      key: user?.userType === 'model' ? 'dashboard' : 'company-dashboard',
      label: '🏠 Dashboard',
      color: '#4CAF50'
    },
    {
      key: 'activity-feed',
      label: '📱 Activity Feed',
      color: '#667eea'
    },
    // Replace the browse-talent/opportunities logic with this:
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
      key: user?.userType === 'model' ? 'opportunities' : 'browse-talent',
      label: user?.userType === 'model' ? '📢 Opportunities' : '👥 Browse Talent',
      color: '#FF9800'
    },
    {
      key: 'connections',
      label: '🤝 Network',
      color: '#2196F3'
    }
  ];

  if (!user) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '15px 20px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
        onClick={() => setCurrentPage(user.userType === 'model' ? 'dashboard' : 'company-dashboard')}
      >
        Zanara
      </div>

      {/* Navigation Items */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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
              <div
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '12px',
                  height: '12px',
                  background: '#F44336',
                  borderRadius: '50%',
                  border: '2px solid rgba(0, 0, 0, 0.9)'
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ color: 'white', fontSize: '14px' }}>
          👋 {user.firstName}
        </span>
        <button
          onClick={onLogout}
          style={{
            background: 'linear-gradient(45deg, #F44336, #FF6B6B)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default NavigationHeader;