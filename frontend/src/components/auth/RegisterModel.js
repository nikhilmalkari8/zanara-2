import React, { useState } from 'react';

const RegisterModel = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
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
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          userType: 'model'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          setCurrentPage('login');
        }, 1500);
      } else {
        setMessage(data.message || 'Registration failed. Please try again.');
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
            Register as Model
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          
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
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="Enter phone number"
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
              placeholder="Enter password"
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="Confirm password"
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
              background: isLoading ? '#666' : 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#ccc' }}>
            Already have an account?{' '}
            <span 
              onClick={() => setCurrentPage('login')}
              style={{ color: '#ff6b6b', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModel;