import React, { useState, useEffect } from 'react';

const MyConnections = () => {
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('connections');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
    fetchPendingRequests();
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
        setConnections(data);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/connections/pending-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
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
        const acceptedConnection = await response.json();
        setConnections(prev => [acceptedConnection, ...prev]);
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
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
      }
    } catch (error) {
      console.error('Error rejecting connection:', error);
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
      }
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    tabs: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      borderBottom: '1px solid #ddd',
      paddingBottom: '10px'
    },
    tab: {
      padding: '10px 20px',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      fontSize: '16px',
      color: '#666'
    },
    activeTab: {
      color: '#007bff',
      borderBottom: '2px solid #007bff'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px'
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '15px'
    },
    profileImage: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover'
    },
    profileInfo: {
      flex: 1
    },
    name: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: 0
    },
    title: {
      color: '#666',
      margin: '5px 0'
    },
    location: {
      color: '#888',
      fontSize: '14px'
    },
    message: {
      background: '#f8f9fa',
      padding: '10px',
      borderRadius: '4px',
      marginTop: '10px',
      fontSize: '14px',
      color: '#666'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      marginTop: '15px'
    },
    button: {
      flex: 1,
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      background: 'white',
      cursor: 'pointer'
    },
    acceptButton: {
      borderColor: '#28a745',
      color: '#28a745'
    },
    rejectButton: {
      borderColor: '#dc3545',
      color: '#dc3545'
    },
    removeButton: {
      borderColor: '#dc3545',
      color: '#dc3545'
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
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
          Pending Requests ({pendingRequests.length})
        </button>
      </div>

      {activeTab === 'connections' ? (
        <div style={styles.grid}>
          {connections.map(connection => {
            const otherUser = connection.sender._id === localStorage.getItem('userId')
              ? connection.receiver
              : connection.sender;

            return (
              <div key={connection._id} style={styles.card}>
                <div style={styles.header}>
                  <img
                    src={otherUser.profilePicture || '/default-avatar.png'}
                    alt={otherUser.fullName}
                    style={styles.profileImage}
                  />
                  <div style={styles.profileInfo}>
                    <h3 style={styles.name}>{otherUser.fullName}</h3>
                    <div style={styles.title}>{otherUser.headline}</div>
                    <div style={styles.location}>{otherUser.location}</div>
                  </div>
                </div>
                <button
                  style={{ ...styles.button, ...styles.removeButton }}
                  onClick={() => handleRemoveConnection(connection._id)}
                >
                  Remove Connection
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.grid}>
          {pendingRequests.map(request => (
            <div key={request._id} style={styles.card}>
              <div style={styles.header}>
                <img
                  src={request.sender.profilePicture || '/default-avatar.png'}
                  alt={request.sender.fullName}
                  style={styles.profileImage}
                />
                <div style={styles.profileInfo}>
                  <h3 style={styles.name}>{request.sender.fullName}</h3>
                  <div style={styles.title}>{request.sender.headline}</div>
                  <div style={styles.location}>{request.sender.location}</div>
                </div>
              </div>
              {request.message && (
                <div style={styles.message}>{request.message}</div>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MyConnections; 