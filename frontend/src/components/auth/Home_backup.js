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
          The complete fashion industry ecosystem. Connect designers, stylists, photographers, models, makeup artists, brands, and agencies in one powerful platform.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          {/* UPDATED: Changed from register-model to register */}
          <div
            onClick={() => setCurrentPage('register')}
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
              🌟
            </div>
            {/* UPDATED: Changed title and description */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Join as Creative Professional</h3>
            <p style={{ opacity: '0.8' }}>
              Models, designers, stylists, photographers, and makeup artists - showcase your talent and get discovered.
            </p>
          </div>
          
          {/* UPDATED: Changed from register-company to register */}
          <div
            onClick={() => setCurrentPage('register')}
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
              🏢
            </div>
            {/* UPDATED: Changed title and description */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Join as Brand or Agency</h3>
            <p style={{ opacity: '0.8' }}>
              Fashion brands and modeling agencies - find verified talent and build your creative team.
            </p>
          </div>
          
          {/* KEPT: Login section unchanged */}
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
  );;
};

export default Home;