// src/components/setup/ModelProfileSetup.js
import React, { useState } from 'react';

const ModelProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    location: '',
    languages: [],
    
    // Physical Attributes (Industry Standard)
    height: '',
    weight: '',
    bust: '',
    waist: '',
    hips: '',
    dressSize: '',
    shoeSize: '',
    bodyType: '',
    hairColor: '',
    eyeColor: '',
    skinTone: '',
    
    // Professional Information
    headline: 'Professional Model',
    bio: '',
    experience: '',
    modelingTypes: [], // Fashion, Commercial, Runway, etc.
    experienceLevel: '',
    agencies: '',
    unionMembership: '',
    
    // Portfolio & Media
    portfolioWebsite: '',
    socialMedia: {
      instagram: '',
      tiktok: '',
      linkedin: '',
      twitter: ''
    },
    
    // Work Preferences
    availability: '',
    travelWillingness: '',
    preferredLocations: [],
    workTypes: [], // Editorial, Commercial, Runway, etc.
    nudityComfort: '',
    
    // Rate Information
    rates: {
      hourly: '',
      halfDay: '',
      fullDay: '',
      currency: 'USD'
    },
    
    // Special Skills
    specialSkills: [], // Acting, Dancing, Sports, etc.
    wardrobe: '',
    props: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Physical Attributes', icon: '📏' },
    { number: 3, title: 'Professional Info', icon: '💼' },
    { number: 4, title: 'Portfolio & Social', icon: '📸' },
    { number: 5, title: 'Work Preferences', icon: '⚙️' },
    { number: 6, title: 'Rates & Skills', icon: '💰' },
    { number: 7, title: 'Review & Submit', icon: '✅' }
  ];

  const modelingTypes = [
    'Fashion Modeling', 'Commercial Modeling', 'Runway/Catwalk', 'Editorial',
    'Beauty Modeling', 'Fitness Modeling', 'Plus-Size Modeling', 'Petite Modeling',
    'Hand/Foot Modeling', 'Hair Modeling', 'Lingerie Modeling', 'Swimwear Modeling',
    'Art/Figure Modeling', 'Promotional Modeling', 'Trade Show Modeling'
  ];

  const bodyTypes = [
    'Straight/Athletic', 'Pear', 'Apple', 'Hourglass', 'Inverted Triangle',
    'Rectangle', 'Plus-Size', 'Petite', 'Tall', 'Curvy'
  ];

  const experienceLevels = [
    'Beginner (0-1 years)', 'Amateur (1-2 years)', 'Semi-Professional (2-5 years)',
    'Professional (5+ years)', 'Veteran (10+ years)'
  ];

  const workTypes = [
    'Editorial Shoots', 'Commercial Campaigns', 'Fashion Shows/Runway',
    'Catalog Work', 'E-commerce', 'Lifestyle Shoots', 'Product Modeling',
    'Brand Ambassador', 'Event Modeling', 'Video/Commercial Acting'
  ];

  const specialSkillsList = [
    'Acting', 'Dancing', 'Singing', 'Sports/Athletics', 'Martial Arts',
    'Yoga/Pilates', 'Musical Instruments', 'Languages', 'Acrobatics',
    'Horseback Riding', 'Swimming/Diving', 'Rock Climbing', 'Skateboarding'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
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

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          onProfileComplete();
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to create profile');
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    setupCard: {
      maxWidth: '900px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      overflow: 'hidden'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '30px',
      textAlign: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      margin: '20px 0',
      flexWrap: 'wrap'
    },
    step: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px',
      borderRadius: '10px',
      minWidth: '80px',
      transition: 'all 0.3s ease'
    },
    stepActive: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.5)'
    },
    stepCompleted: {
      background: 'rgba(76, 175, 80, 0.3)',
      border: '2px solid #4CAF50'
    },
    stepUpcoming: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    content: {
      padding: '40px',
      color: 'white'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none'
    },
    select: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical'
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
    navigation: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '30px 40px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px',
      transition: 'all 0.3s ease'
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
      case 1: // Personal Information
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>👤 Personal Information</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Your professional name"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  style={styles.input}
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="professional@email.com"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  style={styles.input}
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth *</label>
                <input
                  type="date"
                  style={styles.input}
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Gender *</label>
                <select
                  style={styles.select}
                  value={profileData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nationality</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="e.g., American, British, etc."
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Current Location *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State/Country"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Languages Spoken</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.languages.join(', ')}
                  onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(l => l.trim()))}
                  placeholder="English, Spanish, French (comma separated)"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Physical Attributes
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>📏 Physical Attributes</h2>
            <p style={{ marginBottom: '30px', color: '#ddd' }}>
              Industry-standard measurements help clients find the right fit for their projects.
            </p>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Height *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="5'8\ or 173 cm"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Weight</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="130 lbs or 59 kg"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bust/Chest *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.bust}
                  onChange={(e) => handleInputChange('bust', e.target.value)}
                  placeholder="34\ or 86 cm"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Waist *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.waist}
                  onChange={(e) => handleInputChange('waist', e.target.value)}
                  placeholder="26\ or 66 cm"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hips *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.hips}
                  onChange={(e) => handleInputChange('hips', e.target.value)}
                  placeholder="36\ or 91 cm"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Dress Size</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.dressSize}
                  onChange={(e) => handleInputChange('dressSize', e.target.value)}
                  placeholder="US 6, EU 38, UK 10"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Shoe Size</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.shoeSize}
                  onChange={(e) => handleInputChange('shoeSize', e.target.value)}
                  placeholder="US 8, EU 39, UK 6"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Body Type *</label>
                <select
                  style={styles.select}
                  value={profileData.bodyType}
                  onChange={(e) => handleInputChange('bodyType', e.target.value)}
                >
                  <option value="">Select body type</option>
                  {bodyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hair Color *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.hairColor}
                  onChange={(e) => handleInputChange('hairColor', e.target.value)}
                  placeholder="Blonde, Brunette, Black, Red, etc."
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Eye Color *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.eyeColor}
                  onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                  placeholder="Blue, Brown, Green, Hazel, etc."
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Skin Tone</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.skinTone}
                  onChange={(e) => handleInputChange('skinTone', e.target.value)}
                  placeholder="Fair, Medium, Olive, Dark, etc."
                />
              </div>
            </div>
          </div>
        );

      case 3: // Professional Information
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💼 Professional Information</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Professional Headline *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  placeholder="e.g., Fashion Model & Brand Ambassador"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Experience Level *</label>
                <select
                  style={styles.select}
                  value={profileData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Bio/About You *</label>
              <textarea
                style={styles.textarea}
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell clients about your modeling experience, personality, and what makes you unique. Include any notable work, publications, or achievements."
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Modeling Types (Select all that apply) *</label>
              <div style={styles.checkboxGrid}>
                {modelingTypes.map(type => (
                  <div
                    key={type}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.modelingTypes.includes(type) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('modelingTypes', type)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.modelingTypes.includes(type)}
                      onChange={() => {}}
                    />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Current/Previous Agencies</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.agencies}
                  onChange={(e) => handleInputChange('agencies', e.target.value)}
                  placeholder="List any modeling agencies you're currently with or have worked with previously"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Union Memberships</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.unionMembership}
                  onChange={(e) => handleInputChange('unionMembership', e.target.value)}
                  placeholder="SAG-AFTRA, AEA, etc."
                />
              </div>
            </div>
          </div>
        );

      case 4: // Portfolio & Social Media
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>📸 Portfolio & Social Media</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Portfolio Website</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.portfolioWebsite}
                  onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Instagram</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                  placeholder="@yourusername or full URL"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>TikTok</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.socialMedia.tiktok}
                  onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                  placeholder="@yourusername or full URL"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>LinkedIn</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.socialMedia.linkedin}
                  onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                  placeholder="LinkedIn profile URL"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Twitter/X</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.socialMedia.twitter}
                  onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                  placeholder="@yourusername or full URL"
                />
              </div>
            </div>
          </div>
        );

      case 5: // Work Preferences
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>⚙️ Work Preferences</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Availability *</label>
                <select
                  style={styles.select}
                  value={profileData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                >
                  <option value="">Select availability</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="freelance">Freelance/Project Based</option>
                  <option value="weekends-only">Weekends Only</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Travel Willingness *</label>
                <select
                  style={styles.select}
                  value={profileData.travelWillingness}
                  onChange={(e) => handleInputChange('travelWillingness', e.target.value)}
                >
                  <option value="">Select travel preference</option>
                  <option value="local-only">Local Only</option>
                  <option value="regional">Regional (within 200 miles)</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                  <option value="anywhere">Travel Anywhere</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nudity Comfort Level *</label>
                <select
                  style={styles.select}
                  value={profileData.nudityComfort}
                  onChange={(e) => handleInputChange('nudityComfort', e.target.value)}
                >
                  <option value="">Select comfort level</option>
                  <option value="none">No Nudity</option>
                  <option value="implied">Implied/Covered</option>
                  <option value="artistic">Artistic/Tasteful</option>
                  <option value="partial">Partial Nudity</option>
                  <option value="full">Full Nudity</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Preferred Work Types (Select all that apply) *</label>
              <div style={styles.checkboxGrid}>
                {workTypes.map(type => (
                  <div
                    key={type}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.workTypes.includes(type) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('workTypes', type)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.workTypes.includes(type)}
                      onChange={() => {}}
                    />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Preferred Locations</label>
              <input
                type="text"
                style={styles.input}
                value={profileData.preferredLocations.join(', ')}
                onChange={(e) => handleInputChange('preferredLocations', e.target.value.split(',').map(l => l.trim()))}
                placeholder="New York, Los Angeles, Miami (comma separated)"
              />
            </div>
          </div>
        );

      case 6: // Rates & Skills
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💰 Rates & Special Skills</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hourly Rate (USD)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.hourly}
                  onChange={(e) => handleInputChange('rates.hourly', e.target.value)}
                  placeholder="75"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Half Day Rate (USD)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.halfDay}
                  onChange={(e) => handleInputChange('rates.halfDay', e.target.value)}
                  placeholder="300"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Day Rate (USD)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.fullDay}
                  onChange={(e) => handleInputChange('rates.fullDay', e.target.value)}
                  placeholder="500"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Special Skills & Talents</label>
              <div style={styles.checkboxGrid}>
                {specialSkillsList.map(skill => (
                  <div
                    key={skill}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.specialSkills.includes(skill) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('specialSkills', skill)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.specialSkills.includes(skill)}
                      onChange={() => {}}
                    />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Wardrobe Available</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.wardrobe}
                  onChange={(e) => handleInputChange('wardrobe', e.target.value)}
                  placeholder="Describe your personal wardrobe that can be used for shoots (formal wear, casual, sports, etc.)"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Props Available</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.props}
                  onChange={(e) => handleInputChange('props', e.target.value)}
                  placeholder="List any props you own that could be useful for shoots (sports equipment, musical instruments, etc.)"
                />
              </div>
            </div>
          </div>
        );

      case 7: // Review & Submit
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✅ Review & Submit</h2>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
              <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>Profile Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Name:</strong> {profileData.fullName}<br/>
                  <strong>Location:</strong> {profileData.location}<br/>
                  <strong>Experience:</strong> {profileData.experienceLevel}<br/>
                  <strong>Height:</strong> {profileData.height}
                </div>
                <div>
                  <strong>Modeling Types:</strong> {profileData.modelingTypes.slice(0, 3).join(', ')}{profileData.modelingTypes.length > 3 ? '...' : ''}<br/>
                  <strong>Work Types:</strong> {profileData.workTypes.slice(0, 3).join(', ')}{profileData.workTypes.length > 3 ? '...' : ''}<br/>
                  <strong>Availability:</strong> {profileData.availability}<br/>
                  <strong>Travel:</strong> {profileData.travelWillingness}
                </div>
              </div>
            </div>
            
            <div style={{ background: 'rgba(255, 193, 7, 0.1)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255, 193, 7, 0.3)', marginBottom: '30px' }}>
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>📝 Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After submitting your profile, you'll be redirected to your dashboard where you can:
                <br/>• Upload portfolio photos
                <br/>• Browse and apply for modeling opportunities
                <br/>• Connect with photographers, stylists, and brands
                <br/>• Manage your bookings and earnings
              </p>
            </div>

            {message && (
              <div style={{
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                background: message.includes('success') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
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
      <div style={styles.setupCard}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>
              👑 Model Profile Setup
            </h1>
            <button 
              onClick={onLogout}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Logout
            </button>
          </div>
          <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>
            Create your professional modeling profile to connect with top brands and photographers
          </p>
        </div>

        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          {steps.map(step => (
            <div
              key={step.number}
              style={{
                ...styles.step,
                ...(step.number === currentStep ? styles.stepActive : 
                   step.number < currentStep ? styles.stepCompleted : styles.stepUpcoming)
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

        {/* Content */}
        <div style={styles.content}>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
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

          <div style={{ color: 'white', fontSize: '14px' }}>
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              style={{ ...styles.button, ...styles.primaryButton }}
            >
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
              {isSubmitting ? 'Creating Profile...' : 'Complete Profile ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelProfileSetup;