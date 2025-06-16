import React, { useState } from 'react';

const CompanyProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [profileData, setProfileData] = useState({
    // Basic Information
    companyName: '',
    legalName: '',
    industry: '',
    companyType: '',
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
    
    // Company Details
    foundedYear: '',
    companySize: '',
    
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
    services: [],
    clientTypes: []
  });

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Contact & Address' },
    { number: 3, title: 'Company Details' },
    { number: 4, title: 'Social Media & Culture' },
    { number: 5, title: 'Services & Review' }
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
      const response = await fetch('http://localhost:8001/api/company/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Company profile created successfully! Welcome to Zanara.');
        setTimeout(() => {
          onProfileComplete();
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to create company profile. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={profileData} setFormData={setProfileData} />;
      case 2:
        return <ContactAddressStep formData={profileData} setFormData={setProfileData} />;
      case 3:
        return <CompanyDetailsStep formData={profileData} setFormData={setProfileData} />;
      case 4:
        return <SocialCultureStep formData={profileData} setFormData={setProfileData} />;
      case 5:
        return <ServicesReviewStep formData={profileData} setFormData={setProfileData} />;
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
            <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Setup Your Company Profile</h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>Welcome {user?.firstName}! Let's create your company profile.</p>
          </div>
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
          {renderCurrentStep()}

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
                {isLoading ? 'Creating Profile...' : 'Create Company Profile'}
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

// Step Components
const BasicInfoStep = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Basic Company Information</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Company Name *</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          style={inputStyle}
          placeholder="Enter company name"
          required
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Legal Name *</label>
        <input
          type="text"
          name="legalName"
          value={formData.legalName}
          onChange={handleChange}
          style={inputStyle}
          placeholder="Enter legal company name"
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Industry *</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select Industry</option>
            <option value="fashion">Fashion</option>
            <option value="photography">Photography</option>
            <option value="advertising">Advertising</option>
            <option value="entertainment">Entertainment</option>
            <option value="modeling-agency">Modeling Agency</option>
            <option value="beauty">Beauty</option>
            <option value="retail">Retail</option>
            <option value="media">Media</option>
            <option value="events">Events</option>
            <option value="luxury-brands">Luxury Brands</option>
            <option value="e-commerce">E-commerce</option>
            <option value="cosmetics">Cosmetics</option>
            <option value="jewelry">Jewelry</option>
            <option value="automotive">Automotive</option>
            <option value="technology">Technology</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Company Type *</label>
          <select
            name="companyType"
            value={formData.companyType}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select Type</option>
            <option value="agency">Agency</option>
            <option value="brand">Brand</option>
            <option value="photographer">Photographer</option>
            <option value="production-house">Production House</option>
            <option value="casting-director">Casting Director</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Tagline</label>
        <input
          type="text"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
          style={inputStyle}
          placeholder="A brief tagline for your company"
          maxLength="150"
        />
      </div>

      <div>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Company Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
          style={inputStyle}
          placeholder="Tell us about your company, what you do, and your mission..."
          required
        />
      </div>
    </div>
  );
};

const ContactAddressStep = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
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
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Contact & Address Information</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Company phone number"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            style={inputStyle}
            placeholder="https://yourcompany.com"
          />
        </div>
      </div>

      <h4 style={{ color: 'white', marginBottom: '15px' }}>Company Address</h4>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Street Address *</label>
        <input
          type="text"
          name="street"
          value={formData.address.street}
          onChange={handleAddressChange}
          style={inputStyle}
          placeholder="Street address"
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>City *</label>
          <input
            type="text"
            name="city"
            value={formData.address.city}
            onChange={handleAddressChange}
            style={inputStyle}
            placeholder="City"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>State/Province *</label>
          <input
            type="text"
            name="state"
            value={formData.address.state}
            onChange={handleAddressChange}
            style={inputStyle}
            placeholder="State or Province"
            required
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Country *</label>
          <input
            type="text"
            name="country"
            value={formData.address.country}
            onChange={handleAddressChange}
            style={inputStyle}
            placeholder="Country"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>ZIP/Postal Code *</label>
          <input
            type="text"
            name="zipCode"
            value={formData.address.zipCode}
            onChange={handleAddressChange}
            style={inputStyle}
            placeholder="ZIP or Postal Code"
            required
          />
        </div>
      </div>
    </div>
  );
};

const CompanyDetailsStep = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Company Details</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Founded Year</label>
          <input
            type="number"
            name="foundedYear"
            value={formData.foundedYear}
            onChange={handleChange}
            style={inputStyle}
            placeholder="e.g., 2020"
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Company Size</label>
          <select
            name="companySize"
            value={formData.companySize}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Company Values (comma separated)</label>
        <input
          type="text"
          value={formData.values.join(', ')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            values: e.target.value.split(',').map(val => val.trim()).filter(val => val)
          }))}
          style={inputStyle}
          placeholder="e.g., Creativity, Innovation, Diversity, Excellence"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Company Culture</label>
        <textarea
          name="culture"
          value={formData.culture}
          onChange={handleChange}
          rows="4"
          style={inputStyle}
          placeholder="Describe your company culture and work environment..."
        />
      </div>

      <div>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Benefits (comma separated)</label>
        <input
          type="text"
          value={formData.benefits.join(', ')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            benefits: e.target.value.split(',').map(benefit => benefit.trim()).filter(benefit => benefit)
          }))}
          style={inputStyle}
          placeholder="e.g., Health Insurance, Flexible Hours, Remote Work, Paid Time Off"
        />
      </div>
    </div>
  );
};

const SocialCultureStep = ({ formData, setFormData }) => {
  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
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
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Social Media & Online Presence</h3>
      
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#ccc', marginBottom: '15px' }}>Social Media Links</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              value={formData.socialMedia.linkedin}
              onChange={handleSocialMediaChange}
              style={inputStyle}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Instagram</label>
            <input
              type="text"
              name="instagram"
              value={formData.socialMedia.instagram}
              onChange={handleSocialMediaChange}
              style={inputStyle}
              placeholder="@yourcompany or full URL"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Facebook</label>
            <input
              type="url"
              name="facebook"
              value={formData.socialMedia.facebook}
              onChange={handleSocialMediaChange}
              style={inputStyle}
              placeholder="https://facebook.com/yourcompany"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Twitter</label>
            <input
              type="text"
              name="twitter"
              value={formData.socialMedia.twitter}
              onChange={handleSocialMediaChange}
              style={inputStyle}
              placeholder="@yourcompany or full URL"
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>YouTube</label>
          <input
            type="url"
            name="youtube"
            value={formData.socialMedia.youtube}
            onChange={handleSocialMediaChange}
            style={inputStyle}
            placeholder="https://youtube.com/c/yourcompany"
          />
        </div>
      </div>
    </div>
  );
};

const ServicesReviewStep = ({ formData, setFormData }) => {
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
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Services & Specializations</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Specializations (comma separated)</label>
        <input
          type="text"
          value={formData.specializations.join(', ')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            specializations: e.target.value.split(',').map(spec => spec.trim()).filter(spec => spec)
          }))}
          style={inputStyle}
          placeholder="e.g., Fashion Photography, Runway Shows, Commercial Campaigns"
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Client Types (select multiple)</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
          {[
            'fashion-models', 'commercial-models', 'plus-size-models', 'fitness-models',
            'child-models', 'senior-models', 'alternative-models', 'runway-models'
          ].map(type => (
                          <label key={type} style={{ display: 'flex', alignItems: 'center', color: '#ccc', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={formData.clientTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        clientTypes: [...prev.clientTypes, type]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        clientTypes: prev.clientTypes.filter(t => t !== type)
                      }));
                    }
                  }}
                  style={{ marginRight: '8px' }}
                />
                {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
            ))}
        </div>
      </div>

      {/* Review Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: 'white', marginBottom: '15px' }}>Review Your Information</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', color: '#ccc', fontSize: '14px' }}>
          <div>
            <p><strong>Company:</strong> {formData.companyName}</p>
            <p><strong>Industry:</strong> {formData.industry}</p>
            <p><strong>Type:</strong> {formData.companyType}</p>
            <p><strong>Founded:</strong> {formData.foundedYear || 'Not specified'}</p>
          </div>
          <div>
            <p><strong>Location:</strong> {formData.address.city}, {formData.address.country}</p>
            <p><strong>Size:</strong> {formData.companySize || 'Not specified'}</p>
            <p><strong>Website:</strong> {formData.website || 'Not provided'}</p>
            <p><strong>Specializations:</strong> {formData.specializations.length} listed</p>
          </div>
        </div>
        
        {formData.description && (
          <div style={{ marginTop: '15px' }}>
            <p style={{ color: '#ccc', fontSize: '14px' }}>
              <strong>Description:</strong> {formData.description.slice(0, 200)}
              {formData.description.length > 200 && '...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfileSetup;