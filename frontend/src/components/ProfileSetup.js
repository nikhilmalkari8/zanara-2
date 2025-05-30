import React, { useState } from 'react';

const ProfileSetup = ({ user, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [profileData, setProfileData] = useState({
    dateOfBirth: '',
    gender: '',
    nationality: '',
    languages: [],
    height: '',
    weight: '',
    bodyType: '',
    hairColor: '',
    eyeColor: '',
    skinTone: '',
    experience: '',
    skills: [],
    specializations: [],
    achievements: [],
    socialMedia: {
      instagram: '',
      tiktok: '',
      youtube: ''
    },
    preferredLocations: [],
    preferredTypes: [],
    availability: '',
    rate: {
      hourly: '',
      daily: '',
      currency: 'USD'
    }
  });

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Physical Attributes' },
    { number: 3, title: 'Professional Info' },
    { number: 4, title: 'Portfolio' },
    { number: 5, title: 'Review & Submit' }
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
      const response = await fetch('http://localhost:8001/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Profile completed successfully! Welcome to Zanara.');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          onProfileComplete();
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to save profile. Please try again.');
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
        return <PhysicalAttributesStep formData={profileData} setFormData={setProfileData} />;
      case 3:
        return <ProfessionalInfoStep formData={profileData} setFormData={setProfileData} />;
      case 4:
        return <PortfolioStep formData={profileData} setFormData={setProfileData} />;
      case 5:
        return <ReviewStep formData={profileData} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Complete Your Profile</h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>Welcome {user?.firstName}! Let's set up your modeling profile.</p>
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
                  background: currentStep >= step.number ? '#667eea' : 'rgba(255, 255, 255, 0.2)',
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
                    background: currentStep > step.number ? '#667eea' : 'rgba(255, 255, 255, 0.2)'
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
                {isLoading ? 'Submitting...' : 'Complete Profile'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
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
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Basic Information</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Date of Birth</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          style={inputStyle}
          required
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          style={inputStyle}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Nationality</label>
        <input
          type="text"
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
          style={inputStyle}
          placeholder="e.g., American, British, Indian"
          required
        />
      </div>

      <div>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Languages (comma separated)</label>
        <input
          type="text"
          value={formData.languages.join(', ')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            languages: e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang)
          }))}
          style={inputStyle}
          placeholder="e.g., English, Spanish, French"
        />
      </div>
    </div>
  );
};

const PhysicalAttributesStep = ({ formData, setFormData }) => {
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
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Physical Attributes</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Height</label>
          <input
            type="text"
            name="height"
            value={formData.height}
            onChange={handleChange}
            style={inputStyle}
            placeholder="e.g., 5'10&quot; or 178cm"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Weight</label>
          <input
            type="text"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            style={inputStyle}
            placeholder="e.g., 150 lbs or 68kg"
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Body Type</label>
        <select
          name="bodyType"
          value={formData.bodyType}
          onChange={handleChange}
          style={inputStyle}
          required
        >
          <option value="">Select Body Type</option>
          <option value="athletic">Athletic</option>
          <option value="slim">Slim</option>
          <option value="average">Average</option>
          <option value="muscular">Muscular</option>
          <option value="curvy">Curvy</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Hair Color</label>
          <input
            type="text"
            name="hairColor"
            value={formData.hairColor}
            onChange={handleChange}
            style={inputStyle}
            placeholder="e.g., Brown, Blonde"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Eye Color</label>
          <input
            type="text"
            name="eyeColor"
            value={formData.eyeColor}
            onChange={handleChange}
            style={inputStyle}
            placeholder="e.g., Blue, Brown"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Skin Tone</label>
          <input
            type="text"
            name="skinTone"
            value={formData.skinTone}
            onChange={handleChange}
            style={inputStyle}
            placeholder="e.g., Fair, Medium, Dark"
            required
          />
        </div>
      </div>
    </div>
  );
};

const ProfessionalInfoStep = ({ formData, setFormData }) => {
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
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Professional Information</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Experience</label>
        <textarea
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          rows="4"
          style={inputStyle}
          placeholder="Describe your modeling experience..."
          required
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Skills (comma separated)</label>
        <input
          type="text"
          value={formData.skills.join(', ')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            skills: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
          }))}
          style={inputStyle}
          placeholder="e.g., Fashion, Commercial, Print"
          required
        />
      </div>

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
          placeholder="e.g., Runway, Editorial, Catalog"
        />
      </div>

      <div>
        <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Achievements (comma separated)</label>
        <input
          type="text"
          value={formData.achievements.join(', ')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            achievements: e.target.value.split(',').map(ach => ach.trim()).filter(ach => ach)
          }))}
          style={inputStyle}
          placeholder="e.g., Vogue Cover, Fashion Week Debut"
        />
      </div>
    </div>
  );
};

const PortfolioStep = ({ formData, setFormData }) => {
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
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Portfolio & Social Media</h3>
      
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#ccc', marginBottom: '15px' }}>Social Media Links</h4>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Instagram</label>
          <input
            type="text"
            name="instagram"
            value={formData.socialMedia.instagram}
            onChange={handleSocialMediaChange}
            style={inputStyle}
            placeholder="@username or full URL"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>TikTok</label>
          <input
            type="text"
            name="tiktok"
            value={formData.socialMedia.tiktok}
            onChange={handleSocialMediaChange}
            style={inputStyle}
            placeholder="@username or full URL"
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>YouTube</label>
          <input
            type="text"
            name="youtube"
            value={formData.socialMedia.youtube}
            onChange={handleSocialMediaChange}
            style={inputStyle}
            placeholder="Channel URL"
          />
        </div>
      </div>

      <div>
        <h4 style={{ color: '#ccc', marginBottom: '15px' }}>Preferences & Rates</h4>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Preferred Locations (comma separated)</label>
          <input
            type="text"
            value={formData.preferredLocations.join(', ')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              preferredLocations: e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc)
            }))}
            style={inputStyle}
            placeholder="e.g., New York, Los Angeles, Miami"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Preferred Job Types (comma separated)</label>
          <input
            type="text"
            value={formData.preferredTypes.join(', ')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              preferredTypes: e.target.value.split(',').map(type => type.trim()).filter(type => type)
            }))}
            style={inputStyle}
            placeholder="e.g., Fashion, Commercial, Editorial"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Availability</label>
          <select
            name="availability"
            value={formData.availability}
            onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
            style={inputStyle}
            required
          >
            <option value="">Select Availability</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="freelance">Freelance</option>
            <option value="weekends-only">Weekends Only</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Hourly Rate (USD)</label>
            <input
              type="number"
              value={formData.rate.hourly}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                rate: { ...prev.rate, hourly: e.target.value }
              }))}
              style={inputStyle}
              placeholder="e.g., 150"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Daily Rate (USD)</label>
            <input
              type="number"
              value={formData.rate.daily}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                rate: { ...prev.rate, daily: e.target.value }
              }))}
              style={inputStyle}
              placeholder="e.g., 1200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewStep = ({ formData }) => {
  return (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Review Your Profile</h3>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: 'white', marginBottom: '15px' }}>Basic Information</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#ccc' }}>
          <p><span style={{ color: '#999' }}>Date of Birth:</span> {formData.dateOfBirth}</p>
          <p><span style={{ color: '#999' }}>Gender:</span> {formData.gender}</p>
          <p><span style={{ color: '#999' }}>Nationality:</span> {formData.nationality}</p>
          <p><span style={{ color: '#999' }}>Languages:</span> {formData.languages.join(', ')}</p>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: 'white', marginBottom: '15px' }}>Physical Attributes</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', color: '#ccc' }}>
          <p><span style={{ color: '#999' }}>Height:</span> {formData.height}</p>
          <p><span style={{ color: '#999' }}>Weight:</span> {formData.weight}</p>
          <p><span style={{ color: '#999' }}>Body Type:</span> {formData.bodyType}</p>
          <p><span style={{ color: '#999' }}>Hair Color:</span> {formData.hairColor}</p>
          <p><span style={{ color: '#999' }}>Eye Color:</span> {formData.eyeColor}</p>
          <p><span style={{ color: '#999' }}>Skin Tone:</span> {formData.skinTone}</p>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: 'white', marginBottom: '15px' }}>Professional Information</h4>
        <div style={{ color: '#ccc' }}>
          <p style={{ marginBottom: '10px' }}><span style={{ color: '#999' }}>Experience:</span> {formData.experience}</p>
          <p style={{ marginBottom: '10px' }}><span style={{ color: '#999' }}>Skills:</span> {formData.skills.join(', ')}</p>
          <p style={{ marginBottom: '10px' }}><span style={{ color: '#999' }}>Specializations:</span> {formData.specializations.join(', ')}</p>
          <p><span style={{ color: '#999' }}>Achievements:</span> {formData.achievements.join(', ')}</p>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <h4 style={{ color: 'white', marginBottom: '15px' }}>Portfolio & Social Media</h4>
        <div style={{ color: '#ccc' }}>
          <p style={{ marginBottom: '10px' }}><span style={{ color: '#999' }}>Instagram:</span> {formData.socialMedia.instagram || 'Not provided'}</p>
          <p style={{ marginBottom: '10px' }}><span style={{ color: '#999' }}>TikTok:</span> {formData.socialMedia.tiktok || 'Not provided'}</p>
          <p style={{ marginBottom: '10px' }}><span style={{ color: '#999' }}>YouTube:</span> {formData.socialMedia.youtube || 'Not provided'}</p>
          <p style={{ marginBottom: '10px' }}><span style={{ color: '#999' }}>Preferred Locations:</span> {formData.preferredLocations.join(', ')}</p>
          <p style={{ marginBottom: '10px' }}><span style={{ color: '#999' }}>Preferred Types:</span> {formData.preferredTypes.join(', ')}</p>
          <p style={{ marginBottom: '10px' }}><span style={{ color: '#999' }}>Availability:</span> {formData.availability}</p>
          <p style={{ marginBottom: '5px' }}><span style={{ color: '#999' }}>Hourly Rate:</span> ${formData.rate.hourly || 'Not set'}</p>
          <p><span style={{ color: '#999' }}>Daily Rate:</span> ${formData.rate.daily || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;