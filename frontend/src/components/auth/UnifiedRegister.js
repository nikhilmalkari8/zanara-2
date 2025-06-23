import React, { useState, useCallback, useMemo } from 'react';

const PROFESSIONAL_TYPES = {
  'fashion-designer': {
    label: 'Fashion Designer',
    description: 'Architect of style. Create collections, craft tech packs, and define aesthetic narratives that shape the future of fashion.',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    icon: '◊',
    features: ['Collection Design', 'Tech Pack Creation', 'Trend Forecasting', 'Brand Collaboration']
  },
  'stylist': {
    label: 'Fashion Stylist', 
    description: 'Visual storyteller. Curate transformative experiences through wardrobe alchemy and editorial vision.',
    gradient: 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)',
    icon: '✦',
    features: ['Editorial Styling', 'Wardrobe Curation', 'Brand Campaigns', 'Celebrity Styling']
  },
  'photographer': {
    label: 'Fashion Photographer',
    description: 'Moment architect. Capture the essence of fashion through lens mastery and artistic composition.',
    gradient: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
    icon: '◈',
    features: ['Editorial Photography', 'Campaign Shoots', 'Portfolio Creation', 'Visual Storytelling']
  },
  'makeup-artist': {
    label: 'Makeup Artist',
    description: 'Beauty alchemist. Transform faces into canvases of artistic expression and emotional storytelling.',
    gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
    icon: '◉',
    features: ['Beauty Makeup', 'Editorial Looks', 'Special Effects', 'Brand Partnerships']
  },
  'model': {
    label: 'Model',
    description: 'Living canvas. Embody brand narratives and bring creative visions to life through authentic performance.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '✧',
    features: ['Fashion Modeling', 'Commercial Work', 'Editorial Shoots', 'Runway Shows']
  },
  'brand': {
    label: 'Fashion House',
    description: 'Vision architects. Build legacy brands that define cultural moments and shape industry standards.',
    gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
    icon: '◆',
    features: ['Brand Building', 'Campaign Development', 'Talent Acquisition', 'Market Expansion']
  },
  'agency': {
    label: 'Creative Agency',
    description: 'Talent curators. Connect exceptional creatives with industry leaders to forge powerful collaborations.',
    gradient: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
    icon: '◎',
    features: ['Talent Management', 'Project Coordination', 'Industry Connections', 'Career Development']
  }
};

// Memoized professional card component
const ProfessionalCard = React.memo(({ 
  type, 
  typeKey, 
  isHovered, 
  onHover, 
  onSelect 
}) => {
  const handleMouseEnter = useCallback(() => onHover(typeKey, true), [typeKey, onHover]);
  const handleMouseLeave = useCallback(() => onHover(typeKey, false), [typeKey, onHover]);
  const handleClick = useCallback(() => onSelect(typeKey), [typeKey, onSelect]);

  return (
    <div
      className={`professional-card ${isHovered ? 'hovered' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="card-gradient-overlay"
        style={{ background: type.gradient }}
      />
      
      <div className="card-content">
        <span className="card-icon">{type.icon}</span>
        <h3 className="card-title">{type.label}</h3>
        <p className="card-description">{type.description}</p>
      </div>
      
      <div className="card-features">
        {type.features.map((feature, index) => (
          <div key={index} className="feature">
            • {feature}
          </div>
        ))}
      </div>
    </div>
  );
});

const UnifiedRegister = ({ setCurrentPage = () => {} }) => {
  const [step, setStep] = useState(1);
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
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleTypeSelection = useCallback((type) => {
    setSelectedType(type);
    setTimeout(() => setStep(2), 300); // Reduced delay
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCardHover = useCallback((type, isEntering) => {
    setHoveredCard(isEntering ? type : null);
  }, []);

  const handleSubmit = useCallback(async (e) => {
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
      // Simulate API call since we don't have actual backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage('Welcome to the collective. Redirecting...');
      setTimeout(() => {
        setCurrentPage('login');
      }, 1000);
    } catch (error) {
      setMessage('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, selectedType, setCurrentPage]);

  const selectedTypeData = useMemo(() => 
    PROFESSIONAL_TYPES[selectedType], [selectedType]
  );

  const goBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
    } else {
      setCurrentPage('home');
    }
  }, [step, setCurrentPage]);

  const goToLogin = useCallback(() => {
    setCurrentPage('login');
  }, [setCurrentPage]);

  // Step 1: Professional Type Selection
  if (step === 1) {
    return (
      <div className="register-container">
        <style jsx>{`
          .register-container {
            position: relative;
            min-height: 100vh;
            background: #0a0a0a;
            color: #fafafa;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow-x: hidden;
          }

          .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #d4af37, #e6c659);
            width: 50%;
            z-index: 1000;
            transition: width 0.4s ease;
          }

          .header {
            position: relative;
            z-index: 10;
            padding: 1.5rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .back-button {
            background: none;
            border: none;
            color: #fafafa;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            opacity: 0.7;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.5rem;
            height: 2.5rem;
          }

          .back-button:hover {
            opacity: 1;
            transform: scale(1.1);
            background: rgba(255, 255, 255, 0.1);
          }

          .header-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(1.5rem, 4vw, 2.5rem);
            font-weight: 300;
            text-align: center;
            background: linear-gradient(135deg, #fafafa 0%, #d4af37 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .content {
            position: relative;
            z-index: 10;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem 4rem;
          }

          .subtitle {
            text-align: center;
            font-size: clamp(1rem, 2.5vw, 1.3rem);
            font-weight: 300;
            opacity: 0.8;
            margin: 0 auto 3rem;
            max-width: 600px;
            line-height: 1.6;
          }

          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
            animation: fadeInUp 0.6s ease-out;
          }

          .professional-card {
            position: relative;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 2rem 1.5rem;
            cursor: pointer;
            min-height: 280px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
          }

          .professional-card:hover {
            transform: translateY(-8px) scale(1.01);
            border-color: rgba(212, 175, 55, 0.3);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }

          .card-gradient-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0;
            transition: opacity 0.3s ease;
            border-radius: 20px;
          }

          .professional-card.hovered .card-gradient-overlay {
            opacity: 0.08;
          }

          .card-content {
            flex: 1;
          }

          .card-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            display: block;
            color: #d4af37;
            transition: transform 0.3s ease;
          }

          .professional-card:hover .card-icon {
            transform: scale(1.1) rotate(5deg);
          }

          .card-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #fafafa;
          }

          .card-description {
            font-size: 0.9rem;
            line-height: 1.5;
            opacity: 0.8;
            font-weight: 300;
            margin-bottom: 1.25rem;
          }

          .card-features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.4rem;
            margin-top: auto;
          }

          .feature {
            font-size: 0.75rem;
            opacity: 0.6;
            padding: 0.2rem 0;
            line-height: 1.3;
          }

          .login-link {
            text-align: center;
            margin-top: 3rem;
            font-size: 0.9rem;
            opacity: 0.7;
          }

          .login-link-text {
            color: #d4af37;
            cursor: pointer;
            text-decoration: underline;
            font-weight: 500;
            transition: opacity 0.2s ease;
          }

          .login-link-text:hover {
            opacity: 0.8;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            .header {
              padding: 1rem;
            }
            
            .content {
              padding: 0 1rem 2rem;
            }
            
            .cards-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
            
            .professional-card {
              min-height: 240px;
              padding: 1.5rem 1.25rem;
            }
          }

          @media (max-width: 480px) {
            .header-title {
              font-size: 1.5rem;
            }
            
            .subtitle {
              font-size: 1rem;
              margin-bottom: 2rem;
            }
          }
        `}</style>

        <div className="progress-bar" />

        <div className="header">
          <button className="back-button" onClick={goBack}>
            ←
          </button>
          <div className="header-title">Join the Collective</div>
          <div style={{width: '2.5rem'}} />
        </div>

        <div className="content">
          <p className="subtitle">
            Select your creative discipline and become part of fashion's most exclusive network
          </p>

          <div className="cards-grid">
            {Object.entries(PROFESSIONAL_TYPES).map(([key, type]) => (
              <ProfessionalCard
                key={key}
                type={type}
                typeKey={key}
                isHovered={hoveredCard === key}
                onHover={handleCardHover}
                onSelect={handleTypeSelection}
              />
            ))}
          </div>

          <div className="login-link">
            Already part of the collective?{' '}
            <span className="login-link-text" onClick={goToLogin}>
              Sign in here
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  return (
    <div className="register-container step-2">
      <style jsx>{`
        .register-container.step-2 {
          position: relative;
          min-height: 100vh;
          background: ${selectedTypeData.gradient};
          color: #fafafa;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
        }

        .progress-bar.complete {
          width: 100%;
        }

        .form-container {
          max-width: 480px;
          margin: 2rem auto 0;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2.5rem;
          animation: scaleIn 0.4s ease-out;
        }

        .selected-type-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .selected-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          display: block;
          color: #d4af37;
        }

        .selected-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .selected-subtitle {
          font-size: 0.9rem;
          opacity: 0.7;
          font-weight: 300;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
          color: #fafafa;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          outline: none;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }

        .form-input:focus {
          border-color: rgba(212, 175, 55, 0.5);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .submit-button {
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          color: #0a0a0a;
          background: linear-gradient(135deg, #d4af37 0%, #e6c659 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .message {
          padding: 0.875rem;
          border-radius: 10px;
          text-align: center;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          border: 1px solid;
        }

        .message.success {
          background: rgba(76, 175, 80, 0.15);
          border-color: #4CAF50;
          color: #81C784;
        }

        .message.error {
          background: rgba(244, 67, 54, 0.15);
          border-color: #F44336;
          color: #EF5350;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .form-container {
            margin: 1rem;
            padding: 2rem 1.5rem;
          }
          
          .input-group {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .form-container {
            padding: 1.5rem 1rem;
          }
          
          .selected-title {
            font-size: 1.2rem;
          }
        }
      `}</style>

      <div className="progress-bar complete" />

      <div className="header">
        <button className="back-button" onClick={goBack}>
          ←
        </button>
        <div className="header-title">Complete Your Profile</div>
        <div style={{width: '2.5rem'}} />
      </div>

      <div className="content">
        <div className="form-container">
          <div className="selected-type-header">
            <span className="selected-icon">{selectedTypeData.icon}</span>
            <h2 className="selected-title">{selectedTypeData.label}</h2>
            <p className="selected-subtitle">Join as {selectedTypeData.label.toLowerCase()}</p>
          </div>
          
          <div className="form">
            <div className="input-group">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="First Name"
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Last Name"
                required
              />
            </div>
            
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Professional Email"
              required
            />
            
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Phone Number"
              required
            />
            
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Create Password"
              required
            />
            
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Confirm Password"
              required
            />
            
            {message && (
              <div className={`message ${message.includes('Welcome') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
            
            <button 
              type="button" 
              disabled={isLoading}
              className="submit-button"
              onClick={handleSubmit}
            >
              {isLoading ? 'Joining the Collective...' : `Join as ${selectedTypeData.label}`}
            </button>
          </div>
          
          <div className="login-link">
            Already have an account?{' '}
            <span className="login-link-text" onClick={goToLogin}>
              Sign in here
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRegister;