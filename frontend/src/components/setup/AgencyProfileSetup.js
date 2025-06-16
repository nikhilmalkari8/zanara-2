// src/components/setup/AgencyProfileSetup.js
import React, { useState } from 'react';

const AgencyProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Basic Information
    companyName: '',
    legalName: '',
    industry: 'modeling-agency',
    companyType: 'agency',
    description: '',
    tagline: '',
    
    // Contact Information
    email: user?.email || '',
    phone: '',
    website: '',
    
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    
    // Agency Details
    foundedYear: '',
    companySize: '',
    agencyType: '',
    licenseNumber: '',
    
    // Agency Specializations
    agencyServices: [],
    talentTypes: [],
    industryFocus: [],
    clientTypes: [],
    
    // Social Media
    socialMedia: {
      linkedin: '',
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: ''
    },
    
    // Company Culture
    values: [],
    culture: '',
    benefits: [],
    
    // Specializations
    specializations: [],
    services: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const steps = [
    { number: 1, title: 'Agency Basics', icon: '🎭' },
    { number: 2, title: 'Contact & Location', icon: '📍' },
    { number: 3, title: 'Services & Talent', icon: '⭐' },
    { number: 4, title: 'Social & Culture', icon: '📱' },
    { number: 5, title: 'Review & Submit', icon: '✅' }
  ];

  const agencyTypes = [
    'Full-Service Modeling Agency',
    'Fashion Modeling Agency', 
    'Commercial Modeling Agency',
    'Talent Management Agency',
    'Casting Agency',
    'Boutique Agency',
    'Plus-Size Modeling Agency',
    'Child Modeling Agency',
    'Fitness Modeling Agency',
    'Hand/Parts Modeling Agency'
  ];

  const agencyServices = [
    'Model Representation', 'Talent Scouting', 'Career Development',
    'Portfolio Development', 'Casting Services', 'Event Planning',
    'Brand Partnerships', 'Social Media Management', 'PR Services',
    'Training & Workshops', 'Contract Negotiation', 'International Placements'
  ];

  const talentTypes = [
    'Fashion Models', 'Commercial Models', 'Runway Models',
    'Print Models', 'Plus-Size Models', 'Petite Models',
    'Fitness Models', 'Hand Models', 'Child Models',
    'Senior Models', 'Alternative Models', 'Influencers',
    'Actors', 'Dancers', 'Musicians', 'Voice Talent'
  ];

  const industryFocus = [
    'High Fashion', 'Commercial Fashion', 'Beauty & Cosmetics',
    'Fitness & Athletic', 'Lifestyle', 'Luxury Brands',
    'E-commerce', 'Advertising', 'Editorial', 'Catalog',
    'Automotive', 'Technology', 'Food & Beverage', 'Travel'
  ];

  const clientTypes = [
    'Fashion Brands', 'Beauty Brands', 'Advertising Agencies',
    'Photographers', 'Fashion Magazines', 'E-commerce Companies',
    'Luxury Brands', 'Retail Companies', 'Casting Directors',
    'Production Companies', 'Event Planners', 'PR Agencies'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayToggle = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, steps.length));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/company/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Agency profile created successfully! Redirecting...');
        setTimeout(onProfileComplete, 2000);
      } else {
        setMessage(data.message || 'Failed to create agency profile');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)', // Agency yellow-pink theme
      padding: '20px'
    },
    card: {
      maxWidth: '800px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '40px'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      color: 'white',
      marginBottom: '5px',
      fontWeight: 'bold'
    },
    checkboxGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '10px',
      marginTop: '10px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background 0.2s ease'
    },
    checkboxChecked: {
      background: 'rgba(76, 175, 80, 0.2)'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px'
    },
    primaryButton: {
      background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
      color: 'white'
    },
    secondaryButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 style={{ color: 'white', marginBottom: '30px' }}>🎭 Agency Basics</h2>
            <label style={styles.label}>Agency Name *</label>
            <input
              style={styles.input}
              value={profileData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Enter your agency name"
            />
            <label style={styles.label}>Legal Company Name</label>
            <input
              style={styles.input}
              value={profileData.legalName}
              onChange={(e) => handleInputChange('legalName', e.target.value)}
              placeholder="Legal business name"
            />
            <label style={styles.label}>Agency Type *</label>
            <select
              style={styles.input}
              value={profileData.agencyType}
              onChange={(e) => handleInputChange('agencyType', e.target.value)}
            >
              <option value="">Select Agency Type</option>
              {agencyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <label style={styles.label}>Agency Description *</label>
            <textarea
              style={{ ...styles.input, minHeight: '120px' }}
              value={profileData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your agency, mission, and what makes you unique..."
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={styles.label}>Founded Year</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.foundedYear}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                  placeholder="2020"
                />
              </div>
              <div>
                <label style={styles.label}>Agency Size</label>
                <select
                  style={styles.input}
                  value={profileData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                >
                  <option value="">Select Size</option>
                  <option value="1-5">1-5 employees</option>
                  <option value="6-15">6-15 employees</option>
                  <option value="16-50">16-50 employees</option>
                  <option value="51+">51+ employees</option>
                </select>
              </div>
            </div>
            <label style={styles.label}>License Number (if applicable)</label>
            <input
              style={styles.input}
              value={profileData.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              placeholder="Agency license or registration number"
            />
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{ color: 'white', marginBottom: '30px' }}>📍 Contact & Location</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  style={styles.input}
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>Phone *</label>
                <input
                  type="tel"
                  style={styles.input}
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <label style={styles.label}>Website</label>
            <input
              type="url"
              style={styles.input}
              value={profileData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://youragency.com"
            />
            <h3 style={{ color: 'white', marginTop: '30px', marginBottom: '20px' }}>Office Address</h3>
            <label style={styles.label}>Street Address *</label>
            <input
              style={styles.input}
              value={profileData.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              placeholder="123 Talent Ave"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <label style={styles.label}>City *</label>
                <input
                  style={styles.input}
                  value={profileData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="Los Angeles"
                />
              </div>
              <div>
                <label style={styles.label}>State *</label>
                <input
                  style={styles.input}
                  value={profileData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="CA"
                />
              </div>
              <div>
                <label style={styles.label}>ZIP Code *</label>
                <input
                  style={styles.input}
                  value={profileData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  placeholder="90210"
                />
              </div>
            </div>
            <label style={styles.label}>Country *</label>
            <input
              style={styles.input}
              value={profileData.address.country}
              onChange={(e) => handleInputChange('address.country', e.target.value)}
              placeholder="United States"
            />
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{ color: 'white', marginBottom: '30px' }}>⭐ Services & Talent</h2>
            <div>
              <label style={styles.label}>Agency Services (Select all that apply)</label>
              <div style={styles.checkboxGrid}>
                {agencyServices.map(service => (
                  <div
                    key={service}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.agencyServices.includes(service) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('agencyServices', service)}
                  >
                    <input type="checkbox" checked={profileData.agencyServices.includes(service)} readOnly />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: '30px' }}>
              <label style={styles.label}>Talent Types We Represent</label>
              <div style={styles.checkboxGrid}>
                {talentTypes.map(talent => (
                  <div
                    key={talent}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.talentTypes.includes(talent) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('talentTypes', talent)}
                  >
                    <input type="checkbox" checked={profileData.talentTypes.includes(talent)} readOnly />
                    <span>{talent}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <label style={styles.label}>Industry Focus</label>
              <div style={styles.checkboxGrid}>
                {industryFocus.map(industry => (
                  <div
                    key={industry}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.industryFocus.includes(industry) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('industryFocus', industry)}
                  >
                    <input type="checkbox" checked={profileData.industryFocus.includes(industry)} readOnly />
                    <span>{industry}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <label style={styles.label}>Client Types</label>
              <div style={styles.checkboxGrid}>
                {clientTypes.map(client => (
                  <div
                    key={client}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.clientTypes.includes(client) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('clientTypes', client)}
                  >
                    <input type="checkbox" checked={profileData.clientTypes.includes(client)} readOnly />
                    <span>{client}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={{ color: 'white', marginBottom: '30px' }}>📱 Social Media & Culture</h2>
            <h3 style={{ color: '#ddd', marginBottom: '20px' }}>Social Media Presence</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={styles.label}>Instagram</label>
                <input
                  style={styles.input}
                  value={profileData.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                  placeholder="@youragency"
                />
              </div>
              <div>
                <label style={styles.label}>LinkedIn</label>
                <input
                  style={styles.input}
                  value={profileData.socialMedia.linkedin}
                  onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                  placeholder="LinkedIn company page"
                />
              </div>
              <div>
                <label style={styles.label}>Facebook</label>
                <input
                  style={styles.input}
                  value={profileData.socialMedia.facebook}
                  onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                  placeholder="Facebook page"
                />
              </div>
              <div>
                <label style={styles.label}>Twitter</label>
                <input
                  style={styles.input}
                  value={profileData.socialMedia.twitter}
                  onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                  placeholder="@youragency"
                />
              </div>
            </div>
            
            <h3 style={{ color: '#ddd', marginTop: '30px', marginBottom: '20px' }}>Agency Culture</h3>
            <label style={styles.label}>Agency Culture & Values</label>
            <textarea
              style={{ ...styles.input, minHeight: '100px' }}
              value={profileData.culture}
              onChange={(e) => handleInputChange('culture', e.target.value)}
              placeholder="Describe your agency culture, values, and what makes working with you special..."
            />
            
            <label style={styles.label}>Core Values (comma separated)</label>
            <input
              style={styles.input}
              value={profileData.values.join(', ')}
              onChange={(e) => handleInputChange('values', e.target.value.split(',').map(v => v.trim()).filter(v => v))}
              placeholder="Integrity, Excellence, Diversity, Innovation"
            />
            
            <label style={styles.label}>Benefits for Talent (comma separated)</label>
            <input
              style={styles.input}
              value={profileData.benefits.join(', ')}
              onChange={(e) => handleInputChange('benefits', e.target.value.split(',').map(b => b.trim()).filter(b => b))}
              placeholder="Career Development, Training, International Opportunities, Health Insurance"
            />
          </div>
        );

      case 5:
        return (
          <div>
            <h2 style={{ color: 'white', marginBottom: '30px' }}>✅ Review & Submit</h2>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
              <h3 style={{ color: '#feca57', marginBottom: '15px' }}>Agency Profile Summary</h3>
              <div style={{ color: 'white', lineHeight: '1.6' }}>
                <p><strong>Agency:</strong> {profileData.companyName}</p>
                <p><strong>Type:</strong> {profileData.agencyType}</p>
                <p><strong>Location:</strong> {profileData.address.city}, {profileData.address.state}</p>
                <p><strong>Founded:</strong> {profileData.foundedYear || 'Not specified'}</p>
                <p><strong>Services:</strong> {profileData.agencyServices.slice(0,3).join(', ')}{profileData.agencyServices.length > 3 ? '...' : ''}</p>
                <p><strong>Talent Types:</strong> {profileData.talentTypes.slice(0,3).join(', ')}{profileData.talentTypes.length > 3 ? '...' : ''}</p>
                <p><strong>Industry Focus:</strong> {profileData.industryFocus.slice(0,3).join(', ')}{profileData.industryFocus.length > 3 ? '...' : ''}</p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,193,7,0.1)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,193,7,0.3)', marginBottom: '30px' }}>
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>🎭 Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After creating your agency profile, you can:<br/>
                • Add your talent roster<br/>
                • Post casting calls and opportunities<br/>
                • Connect with brands and photographers<br/>
                • Manage talent applications and bookings<br/>
                • Build your agency's industry presence
              </p>
            </div>
            {message && (
              <div style={{
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                background: message.includes('success') ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)',
                border: `1px solid ${message.includes('success') ? '#4CAF50' : '#F44336'}`,
                color: message.includes('success') ? '#81C784' : '#EF5350'
              }}>
                {message}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>🎭 Agency Profile Setup</h1>
            <button onClick={onLogout} style={{ ...styles.button, ...styles.secondaryButton }}>
              Logout
            </button>
          </div>
          <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>
            Create your talent agency profile to connect with models, talent, and industry professionals
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          {steps.map(step => (
            <div
              key={step.number}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px',
                borderRadius: '10px',
                minWidth: '80px',
                ...(step.number === currentStep ? { background: 'rgba(255, 255, 255, 0.2)', border: '2px solid rgba(255, 255, 255, 0.5)' } : {})
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                {step.number < currentStep ? '✅' : step.icon}
              </div>
              <div style={{ fontSize: '12px', textAlign: 'center', color: 'white' }}>
                {step.title}
              </div>
            </div>
          ))}
        </div>

        {renderStepContent()}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              opacity: currentStep === 1 ? 0.5 : 1,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous
          </button>
          
          {currentStep < steps.length ? (
            <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Agency Profile ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgencyProfileSetup;