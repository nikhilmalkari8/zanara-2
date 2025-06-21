import React, { useState } from 'react';

const Login = ({ setCurrentPage, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Login successful! Redirecting...');
        onLogin(data.user, data.token);
      } else {
        setMessage(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '16px',
    outline: 'none'
  };

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
        maxWidth: '400px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '15px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <button 
            onClick={() => setCurrentPage('home')}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            ←
          </button>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'inline' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '1rem', opacity: 0.8, marginTop: '10px', margin: '10px 0 0 0' }}>
            Sign in to your Zanara account
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="Enter your password"
              required
            />
          </div>
          
          {message && (
            <div style={{
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              background: message.includes('successful') 
                ? 'rgba(76, 175, 80, 0.2)' 
                : 'rgba(244, 67, 54, 0.2)',
              border: `1px solid ${message.includes('successful') ? '#4CAF50' : '#F44336'}`,
              color: message.includes('successful') ? '#81C784' : '#EF5350'
            }}>
              {message}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              background: isLoading ? '#666' : 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {/* UPDATED: Link to unified registration */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#ccc' }}>
            New to Zanara?{' '}
            <span 
              onClick={() => setCurrentPage('register')}
              style={{ color: '#667eea', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
            >
              Join the fashion ecosystem
            </span>
          </p>
        </div>

        {/* Forgot Password */}
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <span 
            style={{ color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer', fontSize: '14px' }}
            onClick={() => {
              // TODO: Implement forgot password functionality
              setMessage('Forgot password feature coming soon!');
            }}
          >
            Forgot your password?
          </span>
        </div>

        {/* Benefits Reminder */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '16px' }}>Welcome Back To:</h4>
          <ul style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px', margin: 0 }}>
            <li>Your professional fashion portfolio</li>
            <li>Industry collaboration opportunities</li>
            <li>Verified professional network</li>
            <li>Real-time fashion industry insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;