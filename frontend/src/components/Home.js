import React from 'react';

const Home = ({ setCurrentPage }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Welcome to Zanara
        </h1>
        
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '40px',
          opacity: '0.9'
        }}>
          Connect talent with opportunity. Whether you're a model looking for work or a company seeking talent, we've got you covered.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          <div 
            onClick={() => setCurrentPage('register-model')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(-5px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              👤
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Register as Model</h3>
            <p style={{ opacity: '0.8' }}>
              Join our platform as a model and get discovered by top brands and agencies.
            </p>
          </div>
          
          <div 
            onClick={() => setCurrentPage('register-company')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(-5px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              💼
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Register for Hiring</h3>
            <p style={{ opacity: '0.8' }}>
              Find the perfect models for your brand, campaign, or project.
            </p>
          </div>

          <div 
            onClick={() => setCurrentPage('login')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              gridColumn: 'span 2',
              maxWidth: '300px',
              margin: '0 auto'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(-5px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, #9b59b6, #8e44ad)',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🔑
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Already have an account?</h3>
            <p style={{ opacity: '0.8' }}>
              Sign in to access your dashboard and manage your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;