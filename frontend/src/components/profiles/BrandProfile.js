import React from 'react';

const BrandProfile = ({ profileId, user, targetUser, onBack, onConnect, onMessage }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1>🏢 Brand Profile</h1>
        <p>Brand profiles coming soon!</p>
        <p>This will show company information, campaigns, and brand identity.</p>
        <button 
          onClick={onBack}
          style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default BrandProfile;