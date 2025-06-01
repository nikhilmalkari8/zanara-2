import React, { useState, useEffect } from 'react';

const Connections = ({ user, onLogout, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [introductionRequests, setIntroductionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectionRequestData, setConnectionRequestData] = useState({
    recipientId: '',
    relationship: 'other',
    message: '',
    tags: []
  });

  useEffect(() => {
    fetchConnectionsData();
  }, [activeTab]);

  const fetchConnectionsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'connections') {
        const response = await fetch('http://localhost:8001/api/connections/my-connections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setConnections(data.connections);
        }
      } else if (activeTab === 'received') {
        const response = await fetch('http://localhost:8001/api/connections/requests/received', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setReceivedRequests(data.requests);
        }
      } else if (activeTab === 'sent') {
        const response = await fetch('http://localhost:8001/api/connections/requests/sent', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSentRequests(data.requests);
        }
      } else if (activeTab === 'introductions') {
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
            ...receivedData.requests.map(req => ({ ...req, type: 'received' })),
            ...sentData.requests.map(req => ({ ...req, type: 'sent' }))
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching connections data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionResponse = async (connectionId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/connections/respond/${connectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        fetchConnectionsData();
      }
    } catch (error) {
      console.error('Error responding to connection:', error);
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
        body: JSON.stringify(connectionRequestData)
      });

      if (response.ok) {
        setShowConnectionModal(false);
        setConnectionRequestData({
          recipientId: '',
          relationship: 'other',
          message: '',
          tags: []
        });
        fetchConnectionsData();
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
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

  const renderConnections = () => (
    <div style={{ display: 'grid', gap: '15px' }}>
      {connections.map((connection) => (
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
              background: connection.user.userType === 'model' ? '#ff6b6b' : '#4ecdc4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {connection.user.firstName?.charAt(0)}
            </div>
            
            <div>
              <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>
                {connection.user.firstName} {connection.user.lastName}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '2px 8px',
                  background: getRelationshipColor(connection.relationship),
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '0.7rem'
                }}>
                  {connection.relationship.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span style={{ color: '#ccc', fontSize: '0.8rem' }}>
                  Connected {formatDate(connection.connectedAt)}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontWeight: 'bold' }}>
                {connection.connectionStrength}%
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderReceivedRequests = () => (
    <div style={{ display: 'grid', gap: '15px' }}>
      {receivedRequests.map((request) => (
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
                background: request.requester.userType === 'model' ? '#ff6b6b' : '#4ecdc4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {request.requester.firstName?.charAt(0)}
              </div>
              
              <div>
                <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>
                  {request.requester.firstName} {request.requester.lastName}
                </h4>
                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                  {request.requester.email}
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
      ))}
    </div>
  );

  const renderSentRequests = () => (
    <div style={{ display: 'grid', gap: '15px' }}>
      {sentRequests.map((request) => (
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
              background: request.recipient.userType === 'model' ? '#ff6b6b' : '#4ecdc4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {request.recipient.firstName?.charAt(0)}
            </div>
            
            <div>
              <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>
                {request.recipient.firstName} {request.recipient.lastName}
              </h4>
              <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '3px' }}>
                {request.recipient.email}
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
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderIntroductionRequests = () => (
    <div style={{ display: 'grid', gap: '15px' }}>
      {introductionRequests.map((request) => (
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
                  background: request.type === 'received' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(33, 150, 243,