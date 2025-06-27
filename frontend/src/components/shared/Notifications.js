import React, { useState, useEffect } from 'react';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (status = null) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (status && status !== 'all') {
        queryParams.append('status', status);
      }
      
      const response = await fetch(`http://localhost:8001/api/notifications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchNotifications(filter === 'all' ? null : filter);
    fetchUnreadCount();
  }, [filter]);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, status: 'read', readAt: new Date() }
            : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/notifications/mark-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ 
          ...notif, 
          status: 'read', 
          readAt: new Date() 
        })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        // Update unread count if deleted notification was unread
        const deletedNotif = notifications.find(n => n._id === notificationId);
        if (deletedNotif && deletedNotif.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'new_connection_request': '🤝',
      'connection_accepted': '✅',
      'new_opportunity': '📢',
      'opportunity_application': '📝',
      'opportunity_deadline': '⏰',
      'profile_view': '👀',
      'activity_like': '❤️',
      'activity_comment': '💬',
      'introduction_request': '🤝',
      'opportunity_update': '📝',
      'system_announcement': '📢'
    };
    return iconMap[type] || '📌';
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'urgent') return '#F44336';
    if (priority === 'high') return '#FF9800';
    
    const colorMap = {
      'new_connection_request': '#2196F3',
      'connection_accepted': '#4CAF50',
      'new_opportunity': '#FF9800',
      'opportunity_application': '#9C27B0',
      'opportunity_deadline': '#F44336',
      'profile_view': '#607D8B',
      'activity_like': '#E91E63',
      'activity_comment': '#3F51B5',
      'introduction_request': '#009688',
      'opportunity_update': '#795548',
      'system_announcement': '#9E9E9E'
    };
    return colorMap[type] || '#757575';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMs = now - notifDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return notifDate.toLocaleDateString();
    }
  };

  const renderNotificationCard = (notification) => {
    const isUnread = notification.status === 'unread';
    const isBatched = notification.isBatched;
    
    return (
      <div
        key={notification._id}
        style={{
          background: isUnread 
            ? 'rgba(33, 150, 243, 0.1)' 
            : 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: isUnread 
            ? '1px solid rgba(33, 150, 243, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          padding: '15px',
          marginBottom: '15px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onClick={() => {
          if (isUnread) {
            markAsRead(notification._id);
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
          {/* Notification Icon or Avatar Stack */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {isBatched && notification.batchData?.actors?.length > 1 ? (
              // Stacked avatars for batched notifications
              <div style={{ position: 'relative', width: '50px', height: '40px' }}>
                {notification.batchData.actors.slice(0, 3).map((actor, index) => (
                  <img
                    key={actor.user._id || index}
                    src={actor.user.profilePicture || '/default-avatar.png'}
                    alt={`${actor.user.firstName} ${actor.user.lastName}`}
                    style={{
                      position: 'absolute',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '2px solid white',
                      left: `${index * 8}px`,
                      top: `${index * 4}px`,
                      zIndex: 3 - index
                    }}
                  />
                ))}
                {notification.batchData.count > 3 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#4CAF50',
                      color: 'white',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      border: '2px solid white'
                    }}
                  >
                    +{notification.batchData.count - 3}
                  </div>
                )}
              </div>
            ) : (
              // Single icon for regular notifications
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${getNotificationColor(notification.type, notification.priority)}, ${getNotificationColor(notification.type, notification.priority)}88)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                {notification.sender?.profilePicture ? (
                  <img
                    src={notification.sender.profilePicture}
                    alt={`${notification.sender.firstName} ${notification.sender.lastName}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  getNotificationIcon(notification.type)
                )}
              </div>
            )}
          </div>

          {/* Notification Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h4 style={{ 
                color: 'white', 
                fontSize: '16px', 
                margin: 0,
                fontWeight: isUnread ? 'bold' : 'normal'
              }}>
                {notification.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isBatched && (
                  <div
                    style={{
                      background: 'rgba(76, 175, 80, 0.2)',
                      color: '#4CAF50',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                  >
                    {notification.batchData.count} ACTIONS
                  </div>
                )}
                {isUnread && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#2196F3'
                    }}
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '2px'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <p style={{ 
              color: isUnread ? '#ddd' : '#aaa', 
              fontSize: '14px', 
              margin: '0 0 8px 0',
              lineHeight: '1.4'
            }}>
              {notification.message}
            </p>

            {/* Batched notification details */}
            {isBatched && notification.batchData?.actors?.length > 1 && (
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '8px', 
                padding: '8px', 
                marginBottom: '8px' 
              }}>
                <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                  Recent activity:
                </div>
                {notification.batchData.actors.slice(0, 3).map((actor, index) => (
                  <div key={index} style={{ 
                    fontSize: '12px', 
                    color: '#ccc', 
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <img
                      src={actor.user.profilePicture || '/default-avatar.png'}
                      alt={`${actor.user.firstName} ${actor.user.lastName}`}
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%'
                      }}
                    />
                    <span>
                      {actor.user.firstName} {actor.user.lastName} • {formatTimeAgo(actor.timestamp)}
                    </span>
                  </div>
                ))}
                {notification.batchData.count > 3 && (
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    and {notification.batchData.count - 3} others
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#999', fontSize: '12px' }}>
                {!isBatched && notification.sender && (
                  <>
                    from {notification.sender.firstName} {notification.sender.lastName} • 
                  </>
                )}
                {formatTimeAgo(isBatched ? notification.batchData?.lastActivity || notification.createdAt : notification.createdAt)}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {notification.priority !== 'normal' && (
                  <span
                    style={{
                      background: getNotificationColor(notification.type, notification.priority),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  >
                    {notification.priority}
                  </span>
                )}
                
                {isBatched && (
                  <span
                    style={{
                      background: 'rgba(33, 150, 243, 0.2)',
                      color: '#2196F3',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                  >
                    BATCHED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'center'
          }}
        >
          <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '10px' }}>
            Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  background: '#F44336',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '4px 8px',
                  fontSize: '14px',
                  marginLeft: '10px'
                }}
              >
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ color: '#ddd', fontSize: '1.1rem' }}>
            Stay updated with your professional activities
          </p>
        </div>

        {/* Filter Tabs and Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '15px'
          }}
        >
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'read', label: 'Read' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '10px 18px',
                  background: filter === tab.key 
                    ? 'linear-gradient(45deg, #4CAF50, #66BB6A)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: filter === tab.key ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: filter === tab.key ? 'bold' : 'normal',
                  fontSize: '14px'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '10px 18px',
                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              Mark All Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ color: 'white', fontSize: '18px' }}>Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔔</div>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>No notifications</h3>
            <p style={{ color: '#ddd' }}>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You'll see notifications here when there's activity on your profile."}
            </p>
          </div>
        ) : (
          <div>
            {notifications.map(renderNotificationCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;