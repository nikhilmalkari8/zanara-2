import React, { useState } from 'react';

const PROFESSIONAL_TYPES = {
  'fashion-designer': {
    label: 'Fashion Designer',
    description: 'Create collections, tech packs, and showcase your design philosophy',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    icon: '✂️'
  },
  'stylist': {
    label: 'Fashion Stylist', 
    description: 'Create mood boards, style clients, and showcase transformations',
    gradient: 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)',
    icon: '👗'
  },
  'photographer': {
    label: 'Fashion Photographer',
    description: 'Showcase your fashion photography and build your portfolio',
    gradient: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
    icon: '📸'
  },
  'makeup-artist': {
    label: 'Makeup Artist (MUA)',
    description: 'Display before/after transformations and beauty expertise',
    gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
    icon: '💄'
  },
  'model': {
    label: 'Model',
    description: 'Build your portfolio and connect with industry professionals',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🌟'
  },
  'brand': {
    label: 'Fashion Brand',
    description: 'Showcase campaigns, find talent, and build brand presence',
    gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
    icon: '🏢'
  },
  'agency': {
    label: 'Modeling/Talent Agency',
    description: 'Manage talent roster and connect with industry clients',
    gradient: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
    icon: '🎭'
  }
};

const UnifiedRegister = ({ setCurrentPage }) => {
  const [step, setStep] = useState(1); // Step 1: Select Type, Step 2: Registration Form
  const [selectedType, setSelectedType] = useState('');
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

  const handleTypeSelection = (type) => {
    setSelectedType(type);
    setStep(2);
  };

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
          professionalType: selectedType,
          userType: ['brand', 'agency'].includes(selectedType) ? 'hiring' : 'talent'
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

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    borderRadius: '15px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    color: 'white'
  };

  // Step 1: Professional Type Selection
  if (step === 1) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '40px'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <button 
              onClick={() => setCurrentPage('home')}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                position: 'absolute',
                left: '20px',
                top: '20px'
              }}
            >
              ←
            </button>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '10px'
            }}>
              Join the Fashion Ecosystem
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Choose your professional path and connect with the fashion industry
            </p>
          </div>

          {/* Professional Type Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {Object.entries(PROFESSIONAL_TYPES).map(([key, type]) => (
              <div
                key={key}
                style={{
                  ...cardStyle,
                  background: type.gradient,
                  transform: 'scale(1)',
                }}
                onClick={() => handleTypeSelection(key)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                  {type.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  marginBottom: '10px',
                  color: 'white'
                }}>
                  {type.label}
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: '1.5'
                }}>
                  {type.description}
                </p>
              </div>
            ))}
          </div>

          {/* Alternative Login Link */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Already have an account?{' '}
              <span 
                onClick={() => setCurrentPage('login')}
                style={{ 
                  color: 'white', 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  fontWeight: 'bold'
                }}
              >
                Login here
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  const selectedTypeData = PROFESSIONAL_TYPES[selectedType];

  return (
    <div style={{
      minHeight: '100vh',
      background: selectedTypeData.gradient,
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
        {/* Header with Back Button */}
        <div style={{ marginBottom: '30px' }}>
          <button 
            onClick={() => setStep(1)}
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
          <div style={{ display: 'inline-block' }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
              {selectedTypeData.icon}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0' }}>
              Register as {selectedTypeData.label}
            </h2>
          </div>
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
              background: isLoading ? '#666' : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? 'Registering...' : `Register as ${selectedTypeData.label}`}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#ccc' }}>
            Already have an account?{' '}
            <span 
              onClick={() => setCurrentPage('login')}
              style={{ color: 'white', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Login here
            </span>
          </p>
        </div>

        {/* What's Next Section */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '16px' }}>What's Next?</h4>
          <ul style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li>Complete your professional profile setup</li>
            <li>Build your portfolio and showcase your work</li>
            <li>Connect with industry professionals</li>
            <li>Discover collaboration opportunities</li>
            <li>Build your presence in the fashion industry</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRegister;