import React, { useState } from 'react';

const CreateOpportunity = ({ user, onLogout, setCurrentPage }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [opportunityData, setOpportunityData] = useState({
    // Basic Information
    title: '',
    description: '',
    type: '',
    
    targetProfessionalTypes: [],

    // Location
    location: {
      type: 'on-location',
      city: '',
      state: '',
      country: '',
      address: '',
      venue: '',
      isRemoteAvailable: false
    },
    
    // Compensation
    compensation: {
      type: 'paid',
      amount: {
        min: '',
        max: '',
        currency: 'USD'
      },
      paymentStructure: 'project-based',
      details: '',
      additionalBenefits: []
    },
    
    // Timeline
    shootDate: '',
    endDate: '',
    applicationDeadline: '',
    duration: {
      hours: '',
      days: '',
      details: ''
    },
    timeFlexible: false,
    
    // Requirements
    requirements: {
      gender: 'any',
      ageRange: {
        min: '',
        max: ''
      },
      height: {
        min: '',
        max: '',
        unit: 'cm'
      },
      experienceLevel: 'any',
      bodyType: [],
      ethnicity: [],
      hairColor: [],
      eyeColor: [],
      specialSkills: [],
      languages: [],
      wardrobeRequirements: [],
      additionalNotes: ''
    },
    
    // Application Process
    applicationProcess: {
      requiresPortfolio: true,
      requiresCoverLetter: false,
      customQuestions: [],
      applicationLimit: '',
      instructions: ''
    },
    
    // Settings
    settings: {
      isPublic: true,
      allowMessages: true,
      autoReply: {
        enabled: false,
        message: ''
      }
    }
  });

  const steps = [
    { number: 1, title: 'Basic Details' },
    { number: 2, title: 'Target Professionals' }, // NEW STEP
    { number: 3, title: 'Location & Timeline' },
    { number: 4, title: 'Compensation' },
    { number: 5, title: 'Requirements' },
    { number: 6, title: 'Application Process' }
  ];

  const opportunityTypes = [
    { value: 'fashion-shoot', label: 'Fashion Shoot' },
    { value: 'commercial-shoot', label: 'Commercial Shoot' },
    { value: 'runway-show', label: 'Runway Show' },
    { value: 'catalog-shoot', label: 'Catalog Shoot' },
    { value: 'editorial-shoot', label: 'Editorial Shoot' },
    { value: 'beauty-shoot', label: 'Beauty Shoot' },
    { value: 'lifestyle-shoot', label: 'Lifestyle Shoot' },
    { value: 'product-modeling', label: 'Product Modeling' },
    { value: 'brand-ambassador', label: 'Brand Ambassador' },
    { value: 'event-modeling', label: 'Event Modeling' },
    { value: 'fit-modeling', label: 'Fit Modeling' },
    { value: 'promotional-work', label: 'Promotional Work' },
    { value: 'other', label: 'Other' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/opportunities/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(opportunityData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Opportunity created successfully! Redirecting...');
        setTimeout(() => {
          // Redirect to the correct dashboard based on user's professional type
          const dashboardPage = user.userType === 'hiring' 
            ? (user.professionalType === 'agency' ? 'agency-dashboard' : 'brand-dashboard')
            : 'dashboard';
          setCurrentPage(dashboardPage);
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to create opportunity. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateNestedField = (path, value) => {
    const keys = path.split('.');
    setOpportunityData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addToArray = (path, value) => {
    const keys = path.split('.');
    setOpportunityData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      const finalKey = keys[keys.length - 1];
      if (!current[finalKey]) current[finalKey] = [];
      
      if (!current[finalKey].includes(value)) {
        current[finalKey] = [...current[finalKey], value];
      }
      
      return newData;
    });
  };

  const removeFromArray = (path, value) => {
    const keys = path.split('.');
    setOpportunityData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      const finalKey = keys[keys.length - 1];
      if (current[finalKey]) {
        current[finalKey] = current[finalKey].filter(item => item !== value);
      }
      
      return newData;
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicDetailsStep data={opportunityData} updateField={updateNestedField} types={opportunityTypes} />;
      case 2:
        return <TargetProfessionalsStep data={opportunityData} updateField={updateNestedField} addToArray={addToArray} removeFromArray={removeFromArray} />;
      case 3:
        return <LocationTimelineStep data={opportunityData} updateField={updateNestedField} />;
      case 4:
        return <CompensationStep data={opportunityData} updateField={updateNestedField} />;
      case 5:
        return <RequirementsStep data={opportunityData} updateField={updateNestedField} addToArray={addToArray} removeFromArray={removeFromArray} />;
      case 6:
        return <ApplicationProcessStep data={opportunityData} updateField={updateNestedField} addToArray={addToArray} removeFromArray={removeFromArray} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '800px', margin: '0 auto 30px' }}>
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
            <h1 style={{ color: 'white', fontSize: '1.8rem', margin: 0 }}>
              Create New Opportunity
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Post a modeling opportunity to find the perfect talent
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCurrentPage('company-dashboard')}
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

      {/* Progress Bar */}
      <div style={{ maxWidth: '800px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {steps.map((step, index) => (
              <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  background: currentStep >= step.number ? '#4ecdc4' : 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}>
                  {step.number}
                </div>
                <span style={{
                  marginLeft: '10px',
                  fontSize: '14px',
                  color: currentStep >= step.number ? 'white' : '#ccc'
                }}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div style={{
                    width: '30px',
                    height: '2px',
                    margin: '0 15px',
                    background: currentStep > step.number ? '#4ecdc4' : 'rgba(255, 255, 255, 0.2)'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '30px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {renderStep()}

          {message && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              borderRadius: '8px',
              background: message.includes('successfully') 
                ? 'rgba(76, 175, 80, 0.2)' 
                : 'rgba(244, 67, 54, 0.2)',
              border: `1px solid ${message.includes('successfully') ? '#4CAF50' : '#F44336'}`,
              color: message.includes('successfully') ? '#81C784' : '#EF5350'
            }}>
              {message}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              style={{
                padding: '12px 24px',
                background: currentStep === 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                color: currentStep === 1 ? '#666' : 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            {currentStep === steps.length ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  background: isLoading ? '#666' : 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? 'Creating...' : 'Create Opportunity'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TargetProfessionalsStep = ({ data, updateField, addToArray, removeFromArray }) => {
  const professionalTypes = [
    { id: 'model', label: 'Models', icon: '👗', description: 'Runway, photoshoot, or commercial models' },
    { id: 'photographer', label: 'Photographers', icon: '📸', description: 'Fashion, portrait, or commercial photographers' },
    { id: 'fashion-designer', label: 'Fashion Designers', icon: '✂️', description: 'Clothing and accessory designers' },
    { id: 'stylist', label: 'Stylists', icon: '👔', description: 'Fashion stylists for shoots, events, or personal styling' },
    { id: 'makeup-artist', label: 'Makeup Artists', icon: '💄', description: 'Beauty, fashion, or special effects makeup' }
  ];

  return (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Target Professionals</h3>
      
      <p style={{ color: '#ccc', marginBottom: '20px', lineHeight: '1.6' }}>
        Select which types of professionals can apply to this opportunity. Each professional type will see 
        specialized application fields relevant to their expertise.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        {professionalTypes.map(type => (
          <div 
            key={type.id}
            onClick={() => {
              if (data.targetProfessionalTypes.includes(type.id)) {
                removeFromArray('targetProfessionalTypes', type.id);
              } else {
                addToArray('targetProfessionalTypes', type.id);
              }
            }}
            style={{
              padding: '20px',
              background: data.targetProfessionalTypes.includes(type.id)
                ? 'linear-gradient(45deg, rgba(78, 205, 196, 0.4), rgba(78, 205, 196, 0.2))'
                : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              border: data.targetProfessionalTypes.includes(type.id)
                ? '2px solid #4ecdc4'
                : '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px', marginRight: '10px' }}>{type.icon}</span>
              <h4 style={{ color: 'white', margin: '0', fontSize: '18px' }}>{type.label}</h4>
            </div>
            <p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
              {type.description}
            </p>
            {data.targetProfessionalTypes.includes(type.id) && (
              <div style={{ 
                marginTop: '10px', 
                color: '#4ecdc4', 
                fontSize: '14px', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '5px' }}>✓</span> Selected
              </div>
            )}
          </div>
        ))}
      </div>
      
      {data.targetProfessionalTypes.length === 0 && (
        <div style={{
          padding: '15px',
          background: 'rgba(244, 67, 54, 0.2)',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          borderRadius: '8px',
          color: '#f44336',
          marginBottom: '20px'
        }}>
          Please select at least one professional type that can apply to this opportunity.
        </div>
      )}
      
      {data.targetProfessionalTypes.length > 0 && (
        <div style={{
          padding: '15px',
          background: 'rgba(76, 175, 80, 0.2)',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          borderRadius: '8px',
          color: '#81c784'
        }}>
          You've selected {data.targetProfessionalTypes.length} professional type(s) that can apply to this opportunity.
        </div>
      )}
    </div>
  );
};

// Step Components
const BasicDetailsStep = ({ data, updateField, types }) => {
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
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Basic Details</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
          Opportunity Title *
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          style={inputStyle}
          placeholder="e.g., Fashion Model for Summer Campaign"
          required
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
          Type of Opportunity *
        </label>
        <select
          value={data.type}
          onChange={(e) => updateField('type', e.target.value)}
          style={inputStyle}
          required
        >
          <option value="">Select Type</option>
          {types.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
          Description *
        </label>
        <textarea
          value={data.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows="6"
          style={inputStyle}
          placeholder="Describe the opportunity, what you're looking for, and what models can expect..."
          required
        />
      </div>
    </div>
  );
};

const LocationTimelineStep = ({ data, updateField }) => {
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

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Location & Timeline</h3>
      
      {/* Location Section */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: 'white', marginBottom: '15px' }}>Location Details</h4>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            Location Type
          </label>
          <select
            value={data.location.type}
            onChange={(e) => updateField('location.type', e.target.value)}
            style={inputStyle}
          >
            <option value="on-location">On Location</option>
            <option value="studio">Studio</option>
            <option value="remote">Remote</option>
            <option value="multiple-locations">Multiple Locations</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              City *
            </label>
            <input
              type="text"
              value={data.location.city}
              onChange={(e) => updateField('location.city', e.target.value)}
              style={inputStyle}
              placeholder="e.g., New York"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Country *
            </label>
            <input
              type="text"
              value={data.location.country}
              onChange={(e) => updateField('location.country', e.target.value)}
              style={inputStyle}
              placeholder="e.g., United States"
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            State/Province
          </label>
          <input
            type="text"
            value={data.location.state}
            onChange={(e) => updateField('location.state', e.target.value)}
            style={inputStyle}
            placeholder="e.g., New York"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            Venue/Address
          </label>
          <input
            type="text"
            value={data.location.venue}
            onChange={(e) => updateField('location.venue', e.target.value)}
            style={inputStyle}
            placeholder="e.g., Manhattan Photography Studio"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
            <input
              type="checkbox"
              checked={data.location.isRemoteAvailable}
              onChange={(e) => updateField('location.isRemoteAvailable', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Remote participation available
          </label>
        </div>
      </div>

      {/* Timeline Section */}
      <div>
        <h4 style={{ color: 'white', marginBottom: '15px' }}>Timeline</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Shoot Date *
            </label>
            <input
              type="date"
              value={data.shootDate}
              onChange={(e) => updateField('shootDate', e.target.value)}
              style={inputStyle}
              min={getTomorrowDate()}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Application Deadline *
            </label>
            <input
              type="date"
              value={data.applicationDeadline}
              onChange={(e) => updateField('applicationDeadline', e.target.value)}
              style={inputStyle}
              min={getTomorrowDate()}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            End Date (if multi-day)
          </label>
          <input
            type="date"
            value={data.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
            style={inputStyle}
            min={data.shootDate || getTomorrowDate()}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Duration (Hours)
            </label>
            <input
              type="number"
              value={data.duration.hours}
              onChange={(e) => updateField('duration.hours', e.target.value)}
              style={inputStyle}
              placeholder="e.g., 8"
              min="1"
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Duration (Days)
            </label>
            <input
              type="number"
              value={data.duration.days}
              onChange={(e) => updateField('duration.days', e.target.value)}
              style={inputStyle}
              placeholder="e.g., 1"
              min="1"
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            Duration Details
          </label>
          <input
            type="text"
            value={data.duration.details}
            onChange={(e) => updateField('duration.details', e.target.value)}
            style={inputStyle}
            placeholder="e.g., 9 AM - 5 PM with 1 hour lunch break"
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
            <input
              type="checkbox"
              checked={data.timeFlexible}
              onChange={(e) => updateField('timeFlexible', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Dates and times are flexible
          </label>
        </div>
      </div>
    </div>
  );
};

const CompensationStep = ({ data, updateField }) => {
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
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Compensation Details</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
          Compensation Type *
        </label>
        <select
          value={data.compensation.type}
          onChange={(e) => updateField('compensation.type', e.target.value)}
          style={inputStyle}
          required
        >
          <option value="paid">Paid</option>
          <option value="tfp">TFP (Trade for Prints)</option>
          <option value="expenses-only">Expenses Only</option>
          <option value="mixed">Mixed (Paid + TFP)</option>
        </select>
      </div>

      {data.compensation.type === 'paid' || data.compensation.type === 'mixed' ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Payment Structure
            </label>
            <select
              value={data.compensation.paymentStructure}
              onChange={(e) => updateField('compensation.paymentStructure', e.target.value)}
              style={inputStyle}
            >
              <option value="project-based">Project Based</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="per-shot">Per Shot</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                Minimum Amount
              </label>
              <input
                type="number"
                value={data.compensation.amount.min}
                onChange={(e) => updateField('compensation.amount.min', e.target.value)}
                style={inputStyle}
                placeholder="e.g., 500"
                min="0"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                Maximum Amount
              </label>
              <input
                type="number"
                value={data.compensation.amount.max}
                onChange={(e) => updateField('compensation.amount.max', e.target.value)}
                style={inputStyle}
                placeholder="e.g., 1000"
                min="0"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                Currency
              </label>
              <select
                value={data.compensation.amount.currency}
                onChange={(e) => updateField('compensation.amount.currency', e.target.value)}
                style={inputStyle}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>
        </>
      ) : null}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
          Compensation Details
        </label>
        <textarea
          value={data.compensation.details}
          onChange={(e) => updateField('compensation.details', e.target.value)}
          rows="4"
          style={inputStyle}
          placeholder="Provide additional details about compensation, payment terms, etc..."
        />
      </div>

      <div>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
          Additional Benefits (comma separated)
        </label>
        <input
          type="text"
          value={data.compensation.additionalBenefits.join(', ')}
          onChange={(e) => updateField('compensation.additionalBenefits', 
            e.target.value.split(',').map(benefit => benefit.trim()).filter(benefit => benefit)
          )}
          style={inputStyle}
          placeholder="e.g., Travel expenses, Meals provided, Professional photos"
        />
      </div>
    </div>
  );
};

const RequirementsStep = ({ data, updateField, addToArray, removeFromArray }) => {
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

  const tagStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    margin: '2px',
    background: 'rgba(78, 205, 196, 0.3)',
    color: 'white',
    borderRadius: '12px',
    fontSize: '14px',
    cursor: 'pointer'
  };

  const commonOptions = {
    bodyTypes: ['Slim', 'Athletic', 'Average', 'Muscular', 'Curvy', 'Plus Size'],
    ethnicities: ['Caucasian', 'African American', 'Hispanic/Latino', 'Asian', 'Middle Eastern', 'Mixed Race', 'Native American', 'Pacific Islander'],
    hairColors: ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Dyed/Colored'],
    eyeColors: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber'],
    skills: ['Acting', 'Dancing', 'Singing', 'Sports', 'Martial Arts', 'Yoga', 'Swimming', 'Horseback Riding', 'Motorcycle Riding'],
    languages: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Arabic', 'Russian']
  };

  return (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Model Requirements</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            Gender
          </label>
          <select
            value={data.requirements.gender}
            onChange={(e) => updateField('requirements.gender', e.target.value)}
            style={inputStyle}
          >
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-Binary</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            Experience Level
          </label>
          <select
            value={data.requirements.experienceLevel}
            onChange={(e) => updateField('requirements.experienceLevel', e.target.value)}
            style={inputStyle}
          >
            <option value="any">Any</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="experienced">Experienced</option>
            <option value="professional">Professional</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            Minimum Age
          </label>
          <input
            type="number"
            value={data.requirements.ageRange.min}
            onChange={(e) => updateField('requirements.ageRange.min', e.target.value)}
            style={inputStyle}
            placeholder="e.g., 18"
            min="16"
            max="100"
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            Maximum Age
          </label>
          <input
            type="number"
            value={data.requirements.ageRange.max}
            onChange={(e) => updateField('requirements.ageRange.max', e.target.value)}
            style={inputStyle}
            placeholder="e.g., 35"
            min="16"
            max="100"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            Min Height
          </label>
          <input
            type="text"
            value={data.requirements.height.min}
            onChange={(e) => updateField('requirements.height.min', e.target.value)}
            style={inputStyle}
            placeholder="e.g., 170cm or 5'7&quot;"
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            Max Height
          </label>
          <input
            type="text"
            value={data.requirements.height.max}
            onChange={(e) => updateField('requirements.height.max', e.target.value)}
            style={inputStyle}
            placeholder="e.g., 180cm or 5'11&quot;"
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
            Unit
          </label>
          <select
            value={data.requirements.height.unit}
            onChange={(e) => updateField('requirements.height.unit', e.target.value)}
            style={inputStyle}
          >
            <option value="cm">Centimeters</option>
            <option value="ft">Feet/Inches</option>
          </select>
        </div>
      </div>

      {Object.entries(commonOptions).map(([key, options]) => (
        <div key={key} style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
            {options.map(option => (
              <span
                key={option}
                onClick={() => {
                  const fieldPath = `requirements.${key === 'skills' ? 'specialSkills' : key}`;
                  const currentArray = data.requirements[key === 'skills' ? 'specialSkills' : key] || [];
                  
                  if (currentArray.includes(option)) {
                    removeFromArray(fieldPath, option);
                  } else {
                    addToArray(fieldPath, option);
                  }
                }}
                style={{
                  ...tagStyle,
                  background: (data.requirements[key === 'skills' ? 'specialSkills' : key] || []).includes(option)
                    ? 'rgba(78, 205, 196, 0.6)'
                    : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {option}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
          Wardrobe Requirements (comma separated)
        </label>
        <input
          type="text"
          value={data.requirements.wardrobeRequirements.join(', ')}
          onChange={(e) => updateField('requirements.wardrobeRequirements', 
            e.target.value.split(',').map(item => item.trim()).filter(item => item)
          )}
          style={inputStyle}
          placeholder="e.g., Formal wear, Swimwear, Casual clothes"
        />
      </div>

      <div>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
          Additional Notes
        </label>
        <textarea
          value={data.requirements.additionalNotes}
          onChange={(e) => updateField('requirements.additionalNotes', e.target.value)}
          rows="4"
          style={inputStyle}
          placeholder="Any additional requirements or preferences..."
        />
      </div>
    </div>
  );
};

const ApplicationProcessStep = ({ data, updateField, addToArray, removeFromArray }) => {
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

  const addCustomQuestion = () => {
    const newQuestions = [...(data.applicationProcess.customQuestions || [])];
    newQuestions.push({
      question: '',
      type: 'text',
      options: [],
      required: false
    });
    updateField('applicationProcess.customQuestions', newQuestions);
  };

  const updateCustomQuestion = (index, field, value) => {
    const newQuestions = [...(data.applicationProcess.customQuestions || [])];
    newQuestions[index][field] = value;
    updateField('applicationProcess.customQuestions', newQuestions);
  };

  const removeCustomQuestion = (index) => {
    const newQuestions = [...(data.applicationProcess.customQuestions || [])];
    newQuestions.splice(index, 1);
    updateField('applicationProcess.customQuestions', newQuestions);
  };

  return (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Application Process</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: 'white', marginBottom: '15px' }}>Application Requirements</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
            <input
              type="checkbox"
              checked={data.applicationProcess.requiresPortfolio}
              onChange={(e) => updateField('applicationProcess.requiresPortfolio', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Require portfolio/photos
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
            <input
              type="checkbox"
              checked={data.applicationProcess.requiresCoverLetter}
              onChange={(e) => updateField('applicationProcess.requiresCoverLetter', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Require cover letter
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
          Application Limit (optional)
        </label>
        <input
          type="number"
          value={data.applicationProcess.applicationLimit}
          onChange={(e) => updateField('applicationProcess.applicationLimit', e.target.value)}
          style={inputStyle}
          placeholder="e.g., 50"
          min="1"
        />
        <p style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
          Leave empty for unlimited applications
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
          Application Instructions
        </label>
        <textarea
          value={data.applicationProcess.instructions}
          onChange={(e) => updateField('applicationProcess.instructions', e.target.value)}
          rows="4"
          style={inputStyle}
          placeholder="Provide any specific instructions for applicants..."
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ color: 'white', margin: 0 }}>Custom Questions</h4>
          <button
            type="button"
            onClick={addCustomQuestion}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            + Add Question
          </button>
        </div>
        
        {(data.applicationProcess.customQuestions || []).map((question, index) => (
          <div key={index} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>Question {index + 1}</span>
              <button
                type="button"
                onClick={() => removeCustomQuestion(index)}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(244, 67, 54, 0.2)',
                  color: '#F44336',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Remove
              </button>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={question.question}
                onChange={(e) => updateCustomQuestion(index, 'question', e.target.value)}
                style={inputStyle}
                placeholder="Enter your question"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select
                value={question.type}
                onChange={(e) => updateCustomQuestion(index, 'type', e.target.value)}
                style={inputStyle}
              >
                <option value="text">Short Text</option>
                <option value="textarea">Long Text</option>
                <option value="select">Dropdown</option>
                <option value="radio">Multiple Choice</option>
                <option value="file">File Upload</option>
              </select>
              
              <label style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => updateCustomQuestion(index, 'required', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Required
              </label>
            </div>
            
            {(question.type === 'select' || question.type === 'radio') && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  value={question.options.join(', ')}
                  onChange={(e) => updateCustomQuestion(index, 'options', 
                    e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                  )}
                  style={inputStyle}
                  placeholder="Enter options separated by commas"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <h4 style={{ color: 'white', marginBottom: '15px' }}>Settings</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
            <input
              type="checkbox"
              checked={data.settings.isPublic}
              onChange={(e) => updateField('settings.isPublic', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Make this opportunity publicly visible
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
            <input
              type="checkbox"
              checked={data.settings.allowMessages}
              onChange={(e) => updateField('settings.allowMessages', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Allow direct messages from applicants
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
            <input
              type="checkbox"
              checked={data.settings.autoReply.enabled}
              onChange={(e) => updateField('settings.autoReply.enabled', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable auto-reply for applications
          </label>
        </div>
        
        {data.settings.autoReply.enabled && (
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
              Auto-reply Message
            </label>
            <textarea
              value={data.settings.autoReply.message}
              onChange={(e) => updateField('settings.autoReply.message', e.target.value)}
              rows="3"
              style={inputStyle}
              placeholder="Thank you for your application. We will review it and get back to you soon."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateOpportunity;