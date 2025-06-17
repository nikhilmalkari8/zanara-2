import React, { useState, useEffect } from 'react';

const MyConnections = ({ user, onLogout, setCurrentPage }) => {
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('connections');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
    fetchPendingRequests();
    fetchSentRequests();
  }, []);

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/connections/my-connections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched connections:', data);
        setConnections(data);
      } else {
        console.error('Failed to fetch connections:', response.status);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      console.log('=== FRONTEND: Fetching pending requests ===');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/connections/pending-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Frontend received pending requests:', data);
        console.log('Is array?', Array.isArray(data));
        console.log('Length:', data.length);
        
        if (data.length > 0) {
          console.log('First request:', data[0]);
          console.log('Sender data:', data[0].sender);
        }
        
        setPendingRequests(data);
        console.log('State updated with:', data.length, 'requests');
      } else {
        console.error('Failed to fetch pending requests:', response.status);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/connections/sent-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched sent requests:', data);
        setSentRequests(data);
      } else {
        console.error('Failed to fetch sent requests:', response.status);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/connections/${connectionId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setPendingRequests(prev => prev.filter(req => req._id !== connectionId));
        const result = await response.json();
        setConnections(prev => [result.connection, ...prev]);
        alert('Connection request accepted!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to accept connection request');
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      alert('Error accepting connection request');
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/connections/${connectionId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPendingRequests(prev => prev.filter(req => req._id !== connectionId));
        alert('Connection request rejected.');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to reject connection request');
      }
    } catch (error) {
      console.error('Error rejecting connection:', error);
      alert('Error rejecting connection request');
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setConnections(prev => prev.filter(conn => conn._id !== connectionId));
        alert('Connection removed successfully.');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to remove connection');
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      alert('Error removing connection');
    }
  };

  const handleCancelSentRequest = async (connectionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSentRequests(prev => prev.filter(req => req._id !== connectionId));
        alert('Connection request cancelled.');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to cancel connection request');
      }
    } catch (error) {
      console.error('Error cancelling sent request:', error);
      alert('Error cancelling connection request');
    }
  };

  const formatUserName = (user) => {
    if (!user) return 'Unknown User';
    if (user.fullName) return user.fullName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return 'Unknown User';
  };

  const formatProfessionalType = (type) => {
    if (!type) return 'Professional';
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // FIXED: Get professional type from either the connection object or populated sender
  const getProfessionalType = (request) => {
    // Try to get from the connection's senderType field first
    if (request.senderType) {
      return formatProfessionalType(request.senderType);
    }
    // Fallback to populated sender's professionalType
    if (request.sender && request.sender.professionalType) {
      return formatProfessionalType(request.sender.professionalType);
    }
    return 'Professional';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      padding: '20px'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '20px',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    contentCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    tabs: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      paddingBottom: '10px'
    },
    tab: {
      padding: '10px 20px',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      fontSize: '16px',
      color: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    },
    activeTab: {
      color: 'white',
      background: 'rgba(255, 255, 255, 0.1)',
      borderBottom: '2px solid #4CAF50'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '20px'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'transform 0.3s ease'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '15px'
    },
    profileImage: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    },
    profileInfo: {
      flex: 1
    },
    name: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: 0,
      color: 'white'
    },
    title: {
      color: 'rgba(255, 255, 255, 0.8)',
      margin: '5px 0',
      fontSize: '14px'
    },
    location: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '12px'
    },
    message: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '12px',
      borderRadius: '8px',
      marginTop: '15px',
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      marginTop: '15px'
    },
    button: {
      flex: 1,
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    },
    acceptButton: {
      background: '#4CAF50',
      color: 'white'
    },
    rejectButton: {
      background: 'rgba(255, 107, 107, 0.8)',
      color: 'white'
    },
    removeButton: {
      background: 'rgba(255, 107, 107, 0.6)',
      color: 'white'
    },
    cancelButton: {
      background: 'rgba(255, 152, 0, 0.8)',
      color: 'white'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: 'rgba(255, 255, 255, 0.7)'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', color: 'white', fontSize: '18px', marginTop: '50px' }}>
          Loading connections...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>
            🤝 My Network
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: '5px 0 0 0' }}>
            Manage your professional connections
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setCurrentPage('browse-talent')}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Find Talent
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 0, 0, 0.2)',
              color: '#ff6b6b',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.3)', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <strong>Debug Info:</strong> Active Tab: {activeTab} | 
        Pending Requests: {pendingRequests.length} | 
        Connections: {connections.length} | 
        Sent Requests: {sentRequests.length}
      </div>

      {/* Content */}
      <div style={styles.contentCard}>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'connections' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('connections')}
          >
            My Connections ({connections.length})
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'requests' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('requests')}
          >
            Received Requests ({pendingRequests.length})
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'sent' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('sent')}
          >
            Sent Requests ({sentRequests.length})
          </button>
        </div>

        {activeTab === 'connections' ? (
          connections.length > 0 ? (
            <div style={styles.grid}>
              {connections.map(connection => {
                // Get the other user (not the current user)
                const currentUserId = user?._id || user?.id;
                const otherUser = connection.sender._id === currentUserId
                  ? connection.receiver
                  : connection.sender;

                return (
                  <div key={connection._id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div style={styles.profileImage}>
                        {otherUser.profilePicture ? (
                          <img
                            src={`http://localhost:8001${otherUser.profilePicture}`}
                            alt={formatUserName(otherUser)}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div style={styles.profileInfo}>
                        <h3 style={styles.name}>
                          {formatUserName(otherUser)}
                        </h3>
                        <div style={styles.title}>
                          {formatProfessionalType(otherUser.professionalType)}
                        </div>
                        <div style={styles.location}>
                          Connected on {new Date(connection.connectedAt || connection.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      style={{ ...styles.button, ...styles.removeButton }}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to remove this connection?')) {
                          handleRemoveConnection(connection._id);
                        }
                      }}
                    >
                      Remove Connection
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🤝</div>
              <h3 style={{ color: 'white', marginBottom: '10px' }}>No connections yet</h3>
              <p style={{ marginBottom: '20px' }}>Start building your professional network!</p>
              <button
                onClick={() => setCurrentPage('browse-talent')}
                style={{
                  padding: '12px 24px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Find Professionals
              </button>
            </div>
          )
        ) : activeTab === 'requests' ? (
          // FIXED: Pending requests tab (received requests)
          <div>
            <h3 style={{ color: 'white', marginBottom: '20px' }}>
              Received Requests ({pendingRequests.length})
            </h3>
            {pendingRequests.length > 0 ? (
              <div style={styles.grid}>
                {pendingRequests.map(request => {
                  console.log('Rendering request:', request);
                  return (
                    <div key={request._id} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <div style={styles.profileImage}>
                          {request.sender && request.sender.profilePicture ? (
                            <img
                              src={`http://localhost:8001${request.sender.profilePicture}`}
                              alt={formatUserName(request.sender)}
                              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span>👤</span>
                          )}
                        </div>
                        <div style={styles.profileInfo}>
                          <h3 style={styles.name}>
                            {formatUserName(request.sender)}
                          </h3>
                          <div style={styles.title}>
                            {getProfessionalType(request)}
                          </div>
                          <div style={styles.location}>
                            Sent {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {request.message && (
                        <div style={styles.message}>
                          <strong>Message:</strong> {request.message}
                        </div>
                      )}
                      <div style={styles.buttonGroup}>
                        <button
                          style={{ ...styles.button, ...styles.acceptButton }}
                          onClick={() => handleAcceptRequest(request._id)}
                        >
                          Accept
                        </button>
                        <button
                          style={{ ...styles.button, ...styles.rejectButton }}
                          onClick={() => handleRejectRequest(request._id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📬</div>
                <h3 style={{ color: 'white', marginBottom: '10px' }}>No pending requests</h3>
                <p>All caught up! You have no pending connection requests.</p>
              </div>
            )}
          </div>
        ) : (
          // Sent requests tab
          sentRequests.length > 0 ? (
            <div style={styles.grid}>
              {sentRequests.map(request => (
                <div key={request._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.profileImage}>
                      {request.receiver && request.receiver.profilePicture ? (
                        <img
                          src={`http://localhost:8001${request.receiver.profilePicture}`}
                          alt={formatUserName(request.receiver)}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div style={styles.profileInfo}>
                      <h3 style={styles.name}>
                        {formatUserName(request.receiver)}
                      </h3>
                      <div style={styles.title}>
                        {formatProfessionalType(request.receiver && request.receiver.professionalType)}
                      </div>
                      <div style={styles.location}>
                        Sent {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {request.message && (
                    <div style={styles.message}>
                      <strong>Your message:</strong> {request.message}
                    </div>
                  )}
                  <button
                    style={{ ...styles.button, ...styles.cancelButton }}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this connection request?')) {
                        handleCancelSentRequest(request._id);
                      }
                    }}
                  >
                    Cancel Request
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📤</div>
              <h3 style={{ color: 'white', marginBottom: '10px' }}>No sent requests</h3>
              <p>You haven't sent any connection requests yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyConnections;