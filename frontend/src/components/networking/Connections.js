import React, { useState, useEffect } from 'react';

const Connections = ({ user, onLogout, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [introductionRequests, setIntroductionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [connectionRequestData, setConnectionRequestData] = useState({
    recipientId: '',
    relationship: 'other',
    message: '',
    tags: []
  });
  const [introRequestData, setIntroRequestData] = useState({
    introducerId: '',
    targetId: '',
    subject: '',
    message: '',
    purpose: 'networking'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [stats, setStats] = useState({});

  const relationshipTypes = [
    { value: 'colleague', label: 'Colleague' },
    { value: 'client', label: 'Client' },
    { value: 'agency-representative', label: 'Agency Representative' },
    { value: 'photographer', label: 'Photographer' },
    { value: 'makeup-artist', label: 'Makeup Artist' },
    { value: 'stylist', label: 'Stylist' },
    { value: 'creative-director', label: 'Creative Director' },
    { value: 'casting-director', label: 'Casting Director' },
    { value: 'brand-representative', label: 'Brand Representative' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'mentee', label: 'Mentee' },
    { value: 'collaborator', label: 'Collaborator' },
    { value: 'other', label: 'Other' }
  ];

  const introductionPurposes = [
    { value: 'business-opportunity', label: 'Business Opportunity' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'networking', label: 'Networking' },
    { value: 'job-opportunity', label: 'Job Opportunity' },
    { value: 'mentorship', label: 'Mentorship' },
    { value: 'advice', label: 'Advice' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchConnectionsData();
    fetchStats();
  }, [activeTab]);

  const fetchConnectionsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'connections') {
        const response = await fetch('http://localhost:8001/api/connections/my-connections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setConnections(data || []);
        } else {
          throw new Error('Failed to fetch connections');
        }
      } else if (activeTab === 'received') {
        // FIXED: Use the correct endpoint that exists in your backend
        const response = await fetch('http://localhost:8001/api/connections/pending-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setReceivedRequests(data || []);
        } else {
          throw new Error('Failed to fetch received requests');
        }
      } else if (activeTab === 'sent') {
        // FIXED: Use the correct endpoint that exists in your backend
        const response = await fetch('http://localhost:8001/api/connections/sent-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSentRequests(data || []);
        } else {
          throw new Error('Failed to fetch sent requests');
        }
      } else if (activeTab === 'introductions') {
        try {
          const [receivedResponse, sentResponse] = await Promise.all([
            fetch('http://localhost:8001/api/introductions/requests/received', {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:8001/api/introductions/requests/sent', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);
          
          if (receivedResponse.ok && sentResponse.ok) {
            const [receivedData, sentData] = await Promise.all([
              receivedResponse.json(),
              sentResponse.json()
            ]);
            
            setIntroductionRequests([
              ...(receivedData.requests || []).map(req => ({ ...req, type: 'received' })),
              ...(sentData.requests || []).map(req => ({ ...req, type: 'sent' }))
            ]);
          } else {
            // Introduction endpoints might not exist yet, just set empty array
            setIntroductionRequests([]);
          }
        } catch (introError) {
          console.error('Introduction endpoints not available:', introError);
          setIntroductionRequests([]);
        }
      }
    } catch (error) {
      console.error('Error fetching connections data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/connections/analytics/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleConnectionResponse = async (connectionId, action) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      if (action === 'accept') {
        endpoint = `http://localhost:8001/api/connections/${connectionId}/accept`;
      } else if (action === 'decline' || action === 'reject') {
        endpoint = `http://localhost:8001/api/connections/${connectionId}/reject`;
      }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchConnectionsData();
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to respond to connection');
      }
    } catch (error) {
      console.error('Error responding to connection:', error);
      alert(error.message);
    }
  };

  const handleIntroductionResponse = async (requestId, action, message = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/introductions/respond/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, message })
      });

      if (response.ok) {
        fetchConnectionsData();
      }
    } catch (error) {
      console.error('Error responding to introduction:', error);
    }
  };

  const sendConnectionRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: connectionRequestData.recipientId,
          receiverId: connectionRequestData.recipientId, // Fallback for different API naming
          message: connectionRequestData.message,
          relationship: connectionRequestData.relationship,
          tags: connectionRequestData.tags
        })
      });

      if (response.ok) {
        setShowConnectionModal(false);
        setConnectionRequestData({
          recipientId: '',
          relationship: 'other',
          message: '',
          tags: []
        });
        setSearchResults([]);
        setSearchQuery('');
        fetchConnectionsData();
        fetchStats();
        alert('Connection request sent successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Error sending connection request');
    }
  };

  const sendIntroductionRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/introductions/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(introRequestData)
      });

      if (response.ok) {
        setShowIntroModal(false);
        setIntroRequestData({
          introducerId: '',
          targetId: '',
          subject: '',
          message: '',
          purpose: 'networking'
        });
        setSearchResults([]);
        setSearchQuery('');
        fetchConnectionsData();
        alert('Introduction request sent successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to send introduction request');
      }
    } catch (error) {
      console.error('Error sending introduction request:', error);
      alert('Error sending introduction request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRelationshipColor = (relationship) => {
    const colors = {
      'colleague': '#4CAF50',
      'client': '#2196F3',
      'photographer': '#FF9800',
      'agency-representative': '#9C27B0',
      'mentor': '#F44336',
      'other': '#666'
    };
    return colors[relationship] || colors.other;
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

  const getOtherUser = (connection) => {
    const currentUserId = user?._id || user?.id;
    
    // Handle different API response structures
    if (connection.sender && connection.receiver) {
      return connection.sender._id === currentUserId || connection.sender.id === currentUserId
        ? connection.receiver
        : connection.sender;
    } else if (connection.user) {
      return connection.user;
    } else if (connection.requester) {
      return connection.requester;
    } else if (connection.recipient) {
      return connection.recipient;
    }
    
    return null;
  };

  const renderConnections = () => (
    <div style={{ display: 'grid', gap: '15px' }}>
      {connections.map((connection) => {
        const otherUser = getOtherUser(connection);
        
        return (
          <div key={connection._id} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: otherUser?.professionalType === 'model' || otherUser?.userType === 'model' ? '#ff6b6b' : '#4ecdc4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {otherUser?.firstName?.charAt(0) || '?'}
              </div>
              
              <div>
                <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>
                  {formatUserName(otherUser)}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '2px 8px',
                    background: getRelationshipColor(connection.relationship || 'other'),
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '0.7rem'
                  }}>
                    {formatProfessionalType(otherUser?.professionalType || otherUser?.userType)}
                  </span>
                  <span style={{ color: '#ccc', fontSize: '0.8rem' }}>
                    Connected {formatDate(connection.connectedAt || connection.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 'bold' }}>
                  {connection.connectionStrength || 50}%
                </div>
                <div style={{ color: '#ccc', fontSize: '0.7rem' }}>Strength</div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSelectedConnection(connection)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  View Details
                </button>
                
                <button
                  style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Message
                </button>

                <button
                  onClick={() => {
                    setIntroRequestData({
                      ...introRequestData,
                      introducerId: otherUser?._id || otherUser?.id
                    });
                    setShowIntroModal(true);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(45deg, #9C27B0, #BA68C8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Request Intro
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderReceivedRequests = () => (
    <div style={{ display: 'grid', gap: '15px' }}>
      {receivedRequests.map((request) => {
        const senderUser = request.requester || request.sender;
        
        return (
          <div key={request._id} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: senderUser?.professionalType === 'model' || senderUser?.userType === 'model' ? '#ff6b6b' : '#4ecdc4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  {senderUser?.firstName?.charAt(0) || '?'}
                </div>
                
                <div>
                  <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>
                    {formatUserName(senderUser)}
                  </h4>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    {formatProfessionalType(senderUser?.professionalType || senderUser?.userType)}
                  </div>
                  <div style={{ color: '#999', fontSize: '0.8rem' }}>
                    Sent {formatDate(request.createdAt)}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleConnectionResponse(request._id, 'accept')}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Accept
                </button>
                
                <button
                  onClick={() => handleConnectionResponse(request._id, 'decline')}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(244, 67, 54, 0.2)',
                    color: '#F44336',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
            
            {request.message && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '10px'
              }}>
                <div style={{ color: '#ccc', fontSize: '0.8rem', marginBottom: '5px' }}>Message:</div>
                <div style={{ color: 'white', fontSize: '0.9rem' }}>{request.message}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderSentRequests = () => (
    <div style={{ display: 'grid', gap: '15px' }}>
      {sentRequests.map((request) => {
        const recipientUser = request.recipient || request.receiver;
        
        return (
          <div key={request._id} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: recipientUser?.professionalType === 'model' || recipientUser?.userType === 'model' ? '#ff6b6b' : '#4ecdc4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {recipientUser?.firstName?.charAt(0) || '?'}
              </div>
              
              <div>
                <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>
                  {formatUserName(recipientUser)}
                </h4>
                <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '3px' }}>
                  {formatProfessionalType(recipientUser?.professionalType || recipientUser?.userType)}
                </div>
                <div style={{ color: '#999', fontSize: '0.8rem' }}>
                  Sent {formatDate(request.createdAt)}
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <span style={{
                padding: '4px 12px',
                background: request.status === 'pending' 
                  ? 'rgba(255, 193, 7, 0.3)' 
                  : 'rgba(244, 67, 54, 0.3)',
                color: request.status === 'pending' ? '#FFD54F' : '#F44336',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {request.status?.charAt(0)?.toUpperCase() + request.status?.slice(1) || 'Pending'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderIntroductionRequests = () => (
    <div style={{ display: 'grid', gap: '15px' }}>
      {introductionRequests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🤝</div>
          <h3 style={{ color: 'white', marginBottom: '10px' }}>No introduction requests</h3>
          <p>Request introductions through mutual connections to expand your network.</p>
        </div>
      ) : (
        introductionRequests.map((request) => (
          <div key={request._id} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    background: request.type === 'received' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(33, 150, 243, 0.3)',
                    color: request.type === 'received' ? '#81C784' : '#64B5F6',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {request.type === 'received' ? 'Received' : 'Sent'}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    background: 'rgba(156, 39, 176, 0.3)',
                    color: '#BA68C8',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    {request.purpose?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Networking'}
                  </span>
                </div>
                
                <h4 style={{ color: 'white', margin: '0 0 8px 0' }}>
                  {request.subject || 'Introduction Request'}
                </h4>
                
                <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '10px' }}>
                  {request.type === 'received' 
                    ? `${formatUserName(request.requester)} wants to be introduced to ${formatUserName(request.target)}`
                    : `Introduction to ${formatUserName(request.target)} via ${formatUserName(request.introducer)}`
                  }
                </div>
                
                <div style={{ color: '#999', fontSize: '0.8rem' }}>
                  {formatDate(request.createdAt)}
                </div>
              </div>
              
              {request.type === 'received' && request.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleIntroductionResponse(request._id, 'accept')}
                    style={{
                      padding: '6px 12px',
                      background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Accept
                  </button>
                  
                  <button
                    onClick={() => handleIntroductionResponse(request._id, 'decline')}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(244, 67, 54, 0.2)',
                      color: '#F44336',
                      border: '1px solid rgba(244, 67, 54, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
            
            {request.message && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <div style={{ color: '#ccc', fontSize: '0.8rem', marginBottom: '5px' }}>Message:</div>
                <div style={{ color: 'white', fontSize: '0.9rem' }}>{request.message}</div>
              </div>
            )}
            
            {request.status && request.status !== 'pending' && (
              <div style={{ marginTop: '10px' }}>
                <span style={{
                  padding: '4px 12px',
                  background: `rgba(${
                    request.status === 'accepted' ? '76, 175, 80' :
                    request.status === 'completed' ? '33, 150, 243' :
                    '244, 67, 54'
                  }, 0.3)`,
                  color: request.status === 'accepted' ? '#81C784' : 
                         request.status === 'completed' ? '#64B5F6' : '#F44336',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderConnectionModal = () => {
    if (!showConnectionModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '15px',
          width: '90%',
          maxWidth: '500px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>Send Connection Request</h3>
          
          {/* Search Users */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Search Users
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  outline: 'none'
                }}
                placeholder="Search by name or email..."
              />
              <button
                onClick={searchUsers}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
              {searchResults.map((searchUser) => (
                <div
                  key={searchUser._id}
                  onClick={() => setConnectionRequestData({
                    ...connectionRequestData,
                    recipientId: searchUser._id
                  })}
                  style={{
                    padding: '10px',
                    background: connectionRequestData.recipientId === searchUser._id 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    marginBottom: '5px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: searchUser.professionalType === 'model' || searchUser.userType === 'model' ? '#ff6b6b' : '#4ecdc4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {searchUser.firstName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ color: 'white', fontSize: '14px' }}>
                      {formatUserName(searchUser)}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '12px' }}>
                      {formatProfessionalType(searchUser.professionalType || searchUser.userType)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Relationship Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Relationship
            </label>
            <select
              value={connectionRequestData.relationship}
              onChange={(e) => setConnectionRequestData({
                ...connectionRequestData,
                relationship: e.target.value
              })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none'
              }}
            >
              {relationshipTypes.map(type => (
                <option key={type.value} value={type.value} style={{ background: '#333' }}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tags Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={connectionRequestData.tags.join(', ')}
              onChange={(e) => setConnectionRequestData({
                ...connectionRequestData,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none'
              }}
              placeholder="e.g. colleague, friend, collaborator"
            />
          </div>

          {/* Personal Message */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Personal Message
            </label>
            <textarea
              value={connectionRequestData.message}
              onChange={(e) => setConnectionRequestData({
                ...connectionRequestData,
                message: e.target.value
              })}
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none',
                resize: 'vertical'
              }}
              placeholder="Why would you like to connect?"
            />
          </div>
          
          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowConnectionModal(false);
                setSearchResults([]);
                setSearchQuery('');
                setConnectionRequestData({
                  recipientId: '',
                  relationship: 'other',
                  message: '',
                  tags: []
                });
              }}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={sendConnectionRequest}
              disabled={!connectionRequestData.recipientId}
              style={{
                padding: '10px 20px',
                background: connectionRequestData.recipientId 
                  ? 'linear-gradient(45deg, #4CAF50, #66BB6A)'
                  : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: connectionRequestData.recipientId ? 'pointer' : 'not-allowed'
              }}
            >
              Send Request
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderIntroModal = () => {
    if (!showIntroModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '15px',
          width: '90%',
          maxWidth: '500px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>Request Introduction</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Target Person (to be introduced to)
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  outline: 'none'
                }}
                placeholder="Search person to be introduced to..."
              />
              <button
                onClick={searchUsers}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
              {searchResults.map((searchUser) => (
                <div
                  key={searchUser._id}
                  onClick={() => setIntroRequestData({
                    ...introRequestData,
                    targetId: searchUser._id
                  })}
                  style={{
                    padding: '10px',
                    background: introRequestData.targetId === searchUser._id 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    marginBottom: '5px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: searchUser.professionalType === 'model' || searchUser.userType === 'model' ? '#ff6b6b' : '#4ecdc4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {searchUser.firstName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ color: 'white', fontSize: '14px' }}>
                      {formatUserName(searchUser)}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '12px' }}>
                      {formatProfessionalType(searchUser.professionalType || searchUser.userType)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Subject
            </label>
            <input
              type="text"
              value={introRequestData.subject}
              onChange={(e) => setIntroRequestData({
                ...introRequestData,
                subject: e.target.value
              })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none'
              }}
              placeholder="Brief subject for the introduction"
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Purpose
            </label>
            <select
              value={introRequestData.purpose}
              onChange={(e) => setIntroRequestData({
                ...introRequestData,
                purpose: e.target.value
              })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none'
              }}
            >
              {introductionPurposes.map(purpose => (
                <option key={purpose.value} value={purpose.value} style={{ background: '#333' }}>
                  {purpose.label}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Message
            </label>
            <textarea
              value={introRequestData.message}
              onChange={(e) => setIntroRequestData({
                ...introRequestData,
                message: e.target.value
              })}
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none',
                resize: 'vertical'
              }}
              placeholder="Explain why you'd like to be introduced and what you hope to achieve..."
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowIntroModal(false);
                setSearchResults([]);
                setSearchQuery('');
                setIntroRequestData({
                  introducerId: '',
                  targetId: '',
                  subject: '',
                  message: '',
                  purpose: 'networking'
                });
              }}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={sendIntroductionRequest}
              disabled={!introRequestData.targetId || !introRequestData.subject}
              style={{
                padding: '10px 20px',
                background: (introRequestData.targetId && introRequestData.subject)
                  ? 'linear-gradient(45deg, #9C27B0, #BA68C8)'
                  : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (introRequestData.targetId && introRequestData.subject) ? 'pointer' : 'not-allowed'
              }}
            >
              Send Request
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderConnectionDetails = () => {
    if (!selectedConnection) return null;

    const otherUser = getOtherUser(selectedConnection);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '15px',
          width: '90%',
          maxWidth: '600px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: 'white', margin: 0 }}>Connection Details</h3>
            <button
              onClick={() => setSelectedConnection(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '20px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: otherUser?.professionalType === 'model' || otherUser?.userType === 'model' ? '#ff6b6b' : '#4ecdc4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '32px'
            }}>
              {otherUser?.firstName?.charAt(0) || '?'}
            </div>
            
            <div>
              <h3 style={{ color: 'white', margin: '0 0 5px 0' }}>
                {formatUserName(otherUser)}
              </h3>
              <p style={{ color: '#ccc', margin: '0 0 10px 0' }}>
                {formatProfessionalType(otherUser?.professionalType || otherUser?.userType)}
              </p>
              <span style={{
                padding: '4px 12px',
                background: getRelationshipColor(selectedConnection.relationship || 'other'),
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.8rem'
              }}>
                Connection
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#4CAF50', fontWeight: 'bold' }}>
                {selectedConnection.connectionStrength || 50}%
              </div>
              <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Connection Strength</div>
            </div>
            
            <div style={{
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#2196F3', fontWeight: 'bold' }}>
                {selectedConnection.mutualConnectionsCount || 0}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Mutual Connections</div>
            </div>
            
            <div style={{
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#FF9800', fontWeight: 'bold' }}>
                {Math.floor((Date.now() - new Date(selectedConnection.connectedAt || selectedConnection.createdAt)) / (1000 * 60 * 60 * 24))}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Days Connected</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: 'white', marginBottom: '10px' }}>Connection Timeline</h4>
            <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
              <p>Connected on {formatDate(selectedConnection.connectedAt || selectedConnection.createdAt)}</p>
              <p>Last interaction: {formatDate(selectedConnection.lastInteraction || selectedConnection.createdAt)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Send Message
            </button>
            <button
              onClick={() => {
                setIntroRequestData({
                  ...introRequestData,
                  introducerId: otherUser?._id || otherUser?.id
                });
                setSelectedConnection(null);
                setShowIntroModal(true);
              }}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #9C27B0, #BA68C8)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Request Introduction
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>
              Professional Network 🌐
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Manage your connections and professional relationships
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowConnectionModal(true)}
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
              + Add Connection
            </button>
            <button
              onClick={() => setCurrentPage('network-visualization')}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #9C27B0, #BA68C8)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🕸️ Visualize Network
            </button>
            <button
              onClick={() => {
                const dashboardPage = user?.userType === 'talent' ? 
                  user?.professionalType === 'model' ? 'model-dashboard' :
                  user?.professionalType === 'photographer' ? 'photographer-dashboard' :
                  user?.professionalType === 'fashion-designer' ? 'designer-dashboard' :
                  user?.professionalType === 'stylist' ? 'stylist-dashboard' :
                  user?.professionalType === 'makeup-artist' ? 'makeup-artist-dashboard' :
                  'dashboard' :
                  user?.professionalType === 'brand' ? 'brand-dashboard' :
                  user?.professionalType === 'agency' ? 'agency-dashboard' :
                  'company-dashboard';
                setCurrentPage(dashboardPage);
              }}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Dashboard
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
      </div>

      {/* Stats Overview */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {Object.entries({
            'Total Connections': stats.totalConnections || connections.length,
            'Pending Received': stats.pendingReceived || receivedRequests.length,
            'Pending Sent': stats.pendingSent || sentRequests.length,
            'Introduction Requests': stats.requestsSent || introductionRequests.length
          }).map(([label, value]) => (
            <div key={label} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: '#4ecdc4', fontWeight: 'bold' }}>
                {value}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px' }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '10px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {[
            { key: 'connections', label: 'My Connections', count: connections.length },
            { key: 'received', label: 'Received Requests', count: receivedRequests.length },
            { key: 'sent', label: 'Sent Requests', count: sentRequests.length },
            { key: 'introductions', label: 'Introductions', count: introductionRequests.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                background: activeTab === tab.key 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'transparent',
                color: activeTab === tab.key ? 'white' : '#ccc',
                border: activeTab === tab.key 
                  ? '1px solid rgba(255, 255, 255, 0.3)' 
                  : 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  padding: '2px 6px',
                  background: '#ff6b6b',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  minWidth: '16px',
                  textAlign: 'center'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '25px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          minHeight: '400px'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: 'white',
              fontSize: '1.2rem'
            }}>
              Loading...
            </div>
          ) : error ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#ff6b6b',
              fontSize: '1.2rem'
            }}>
              Error: {error}
            </div>
          ) : (
            <>
              {activeTab === 'connections' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: 'white', margin: 0 }}>
                      My Connections ({connections?.length || 0})
                    </h3>
                  </div>
                  {connections?.length > 0 ? (
                    renderConnections()
                  ) : (
                    <div style={{ textAlign: 'center', color: '#ccc', padding: '40px' }}>
                      No connections yet. Start connecting with other professionals!
                    </div>
                  )}
                </>
              )}

              {activeTab === 'received' && (
                <>
                  <h3 style={{ color: 'white', marginBottom: '20px' }}>
                    Received Requests ({receivedRequests.length})
                  </h3>
                  {receivedRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📥</div>
                      <h3 style={{ color: 'white', marginBottom: '10px' }}>No pending requests</h3>
                      <p style={{ color: '#ccc' }}>
                        Connection requests from other professionals will appear here.
                      </p>
                    </div>
                  ) : (
                    renderReceivedRequests()
                  )}
                </>
              )}

              {activeTab === 'sent' && (
                <>
                  <h3 style={{ color: 'white', marginBottom: '20px' }}>
                    Sent Requests ({sentRequests.length})
                  </h3>
                  {sentRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📤</div>
                      <h3 style={{ color: 'white', marginBottom: '10px' }}>No sent requests</h3>
                      <p style={{ color: '#ccc', marginBottom: '20px' }}>
                        Start connecting with professionals in your industry.
                      </p>
                      <button
                        onClick={() => setShowConnectionModal(true)}
                        style={{
                          padding: '12px 24px',
                          background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Send Connection Request
                      </button>
                    </div>
                  ) : (
                    renderSentRequests()
                  )}
                </>
              )}

              {activeTab === 'introductions' && (
                <>
                  <h3 style={{ color: 'white', marginBottom: '20px' }}>
                    Introduction Requests ({introductionRequests.length})
                  </h3>
                  {renderIntroductionRequests()}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {renderConnectionModal()}
      {renderIntroModal()}
      {renderConnectionDetails()}
    </div>
  );
};

export default Connections;