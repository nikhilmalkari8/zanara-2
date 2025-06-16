// src/components/setup/PhotographerProfileSetup.js
import React, { useState } from 'react';
import TalentSearch from '../search/TalentSearch';
import MyConnections from '../connections/MyConnections';

const PhotographerProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: '',
    location: '',
    website: '',
    
    // Professional Information
    headline: 'Professional Fashion Photographer',
    bio: '',
    yearsExperience: '',
    educationBackground: '',
    certifications: '',
    
    // Photography Specializations
    photographyTypes: [], // Fashion, Portrait, Commercial, etc.
    styles: [], // Editorial, Beauty, Street, etc.
    clientTypes: [], // Brands, Models, Agencies, etc.
    
    // Technical Skills & Equipment
    cameraEquipment: [],
    lensCollection: [],
    lightingEquipment: [],
    editingSoftware: [],
    technicalSkills: [],
    
    // Business Information
    studioAccess: '',
    studioLocation: '',
    mobileServices: false,
    travelRadius: '',
    
    // Pricing Structure
    rates: {
      portraitSession: '',
      fashionShoot: '',
      commercialDay: '',
      editorialDay: '',
      eventHourly: '',
      currency: 'USD'
    },
    packagesOffered: [],
    
    // Portfolio & Social Media
    portfolioWebsite: '',
    instagramBusiness: '',
    behancePortfolio: '',
    linkedinProfile: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
      tiktok: ''
    },
    
    // Work Preferences
    availability: '',
    preferredProjectTypes: [],
    collaborationStyle: '',
    clientCommunication: '',
    
    // Publications & Recognition
    publications: '',
    awards: '',
    exhibitions: '',
    notableClients: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Professional Background', icon: '🎓' },
    { number: 3, title: 'Specializations', icon: '📸' },
    { number: 4, title: 'Equipment & Skills', icon: '🛠️' },
    { number: 5, title: 'Business Setup', icon: '🏢' },
    { number: 6, title: 'Pricing & Packages', icon: '💰' },
    { number: 7, title: 'Portfolio & Social', icon: '🌟' },
    { number: 8, title: 'Review & Submit', icon: '✅' }
  ];

  const photographyTypes = [
    'Fashion Photography', 'Portrait Photography', 'Commercial Photography',
    'Beauty Photography', 'Editorial Photography', 'Product Photography',
    'Lifestyle Photography', 'Event Photography', 'Wedding Photography',
    'Headshot Photography', 'Boudoir Photography', 'Fine Art Photography',
    'Street Photography', 'Architectural Photography', 'Food Photography'
  ];

  const photographyStyles = [
    'High Fashion Editorial', 'Commercial Fashion', 'Street Style',
    'Beauty/Cosmetics', 'Lifestyle/Casual', 'Avant-Garde/Artistic',
    'Classic/Timeless', 'Minimalist', 'Dramatic/Moody', 'Bright/Airy',
    'Black & White', 'Film Photography', 'Digital Art', 'Documentary Style'
  ];

  const clientTypes = [
    'Fashion Brands', 'Beauty Brands', 'Modeling Agencies', 'Individual Models',
    'Influencers/Content Creators', 'Magazines/Publications', 'E-commerce Brands',
    'Advertising Agencies', 'Corporate Clients', 'Event Organizers',
    'Wedding Clients', 'Private Individuals', 'Art Galleries', 'Non-Profits'
  ];

  const cameraEquipment = [
    'Canon EOS R5', 'Canon EOS R6', 'Canon 5D Mark IV', 'Canon 1DX Mark III',
    'Nikon D850', 'Nikon Z9', 'Nikon Z7II', 'Sony A7R V', 'Sony A7 IV',
    'Sony A9 III', 'Fujifilm X-T5', 'Fujifilm GFX 100S', 'Hasselblad X2D',
    'Phase One IQ4', 'Medium Format Film', '35mm Film Cameras'
  ];

  const lensTypes = [
    '24-70mm f/2.8', '70-200mm f/2.8', '85mm f/1.4', '50mm f/1.4',
    '35mm f/1.4', '135mm f/2', '24mm f/1.4', '105mm Macro', '200mm f/2',
    'Tilt-Shift Lenses', 'Vintage Lenses', 'Specialty Portrait Lenses'
  ];

  const lightingEquipment = [
    'Profoto Strobes', 'Godox Strobes', 'Continuous LED Panels',
    'Softboxes', 'Beauty Dishes', 'Ring Lights', 'Reflectors',
    'Natural Light Only', 'Portable Flash Units', 'Studio Monolights',
    'Color Gels', 'Light Modifiers', 'Background Systems'
  ];

  const editingSoftware = [
    'Adobe Lightroom', 'Adobe Photoshop', 'Capture One', 'Luminar',
    'Affinity Photo', 'VSCO', 'DxO PhotoLab', 'Skylum Aurora',
    'Phase One Capture One', 'Final Cut Pro', 'Adobe Premiere',
    'Color Grading Software'
  ];

  const technicalSkills = [
    'Studio Lighting Setup', 'Natural Light Mastery', 'Color Theory',
    'Composition Techniques', 'Posing Direction', 'Retouching/Post-Processing',
    'Color Correction', 'Skin Retouching', 'Fashion Retouching',
    'Tethered Shooting', 'High-Speed Sync', 'Multiple Exposure',
    'HDR Photography', 'Focus Stacking', 'Panoramic Photography'
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
      const response = await fetch('http://localhost:8001/api/professional-profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Photography profile created successfully! Redirecting to dashboard...');
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
      background: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
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
      gap: '10px',
      margin: '20px 0',
      flexWrap: 'wrap'
    },
    step: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      borderRadius: '10px',
      minWidth: '70px',
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
                <label style={styles.label}>Location *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State/Country"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Professional Website</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourphotography.com"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Professional Background
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🎓 Professional Background</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Professional Headline *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  placeholder="e.g., Fashion & Portrait Photographer"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Years of Experience *</label>
                <select
                  style={styles.select}
                  value={profileData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                >
                  <option value="">Select experience level</option>
                  <option value="0-1">0-1 years (Beginner)</option>
                  <option value="2-3">2-3 years (Developing)</option>
                  <option value="4-6">4-6 years (Experienced)</option>
                  <option value="7-10">7-10 years (Professional)</option>
                  <option value="10+">10+ years (Expert)</option>
                </select>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>About You & Your Photography *</label>
              <textarea
                style={styles.textarea}
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Describe your photography style, approach, and what sets you apart. Include your artistic vision and professional philosophy."
              />
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Education Background</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.educationBackground}
                  onChange={(e) => handleInputChange('educationBackground', e.target.value)}
                  placeholder="Photography school, art degree, workshops, masterclasses, etc."
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Certifications</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="Professional certifications, photography associations, etc."
                />
              </div>
            </div>
          </div>
        );

      case 3: // Photography Specializations
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>📸 Photography Specializations</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Photography Types (Select all that apply) *</label>
              <div style={styles.checkboxGrid}>
                {photographyTypes.map(type => (
                  <div
                    key={type}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.photographyTypes.includes(type) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('photographyTypes', type)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.photographyTypes.includes(type)}
                      onChange={() => {}}
                    />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Photography Styles *</label>
              <div style={styles.checkboxGrid}>
                {photographyStyles.map(style => (
                  <div
                    key={style}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.styles.includes(style) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('styles', style)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.styles.includes(style)}
                      onChange={() => {}}
                    />
                    <span>{style}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Preferred Client Types *</label>
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
                    <input
                      type="checkbox"
                      checked={profileData.clientTypes.includes(client)}
                      onChange={() => {}}
                    />
                    <span>{client}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Equipment & Technical Skills
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🛠️ Equipment & Technical Skills</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Camera Equipment *</label>
              <div style={styles.checkboxGrid}>
                {cameraEquipment.map(camera => (
                  <div
                    key={camera}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.cameraEquipment.includes(camera) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('cameraEquipment', camera)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.cameraEquipment.includes(camera)}
                      onChange={() => {}}
                    />
                    <span>{camera}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Lens Collection *</label>
              <div style={styles.checkboxGrid}>
                {lensTypes.map(lens => (
                  <div
                    key={lens}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.lensCollection.includes(lens) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('lensCollection', lens)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.lensCollection.includes(lens)}
                      onChange={() => {}}
                    />
                    <span>{lens}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Lighting Equipment *</label>
              <div style={styles.checkboxGrid}>
                {lightingEquipment.map(light => (
                  <div
                    key={light}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.lightingEquipment.includes(light) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('lightingEquipment', light)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.lightingEquipment.includes(light)}
                      onChange={() => {}}
                    />
                    <span>{light}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Editing Software & Technical Skills</label>
              <div style={styles.checkboxGrid}>
                {[...editingSoftware, ...technicalSkills].map(skill => (
                  <div
                    key={skill}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.editingSoftware.includes(skill) || profileData.technicalSkills.includes(skill) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => {
                      if (editingSoftware.includes(skill)) {
                        handleArrayToggle('editingSoftware', skill);
                      } else {
                        handleArrayToggle('technicalSkills', skill);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.editingSoftware.includes(skill) || profileData.technicalSkills.includes(skill)}
                      onChange={() => {}}
                    />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // Business Setup
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🏢 Business Setup</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Studio Access *</label>
                <select
                  style={styles.select}
                  value={profileData.studioAccess}
                  onChange={(e) => handleInputChange('studioAccess', e.target.value)}
                >
                  <option value="">Select studio access</option>
                  <option value="own-studio">I own my studio</option>
                  <option value="rent-studio">I rent studio space</option>
                  <option value="partner-studios">I have partner studios</option>
                  <option value="location-only">Location shoots only</option>
                  <option value="client-studio">I work in client studios</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Studio Location</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.studioLocation}
                  onChange={(e) => handleInputChange('studioLocation', e.target.value)}
                  placeholder="Studio address or area"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Travel Radius *</label>
                <select
                  style={styles.select}
                  value={profileData.travelRadius}
                  onChange={(e) => handleInputChange('travelRadius', e.target.value)}
                >
                  <option value="">Select travel preference</option>
                  <option value="local-30">Local only (30 miles)</option>
                  <option value="regional-100">Regional (100 miles)</option>
                  <option value="state-wide">State-wide</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={profileData.mobileServices}
                  onChange={(e) => handleInputChange('mobileServices', e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                I offer mobile photography services (on-location shoots)
              </label>
            </div>
          </div>
        );

      case 6: // Pricing & Packages
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💰 Pricing & Packages</h2>
            <p style={{ marginBottom: '30px', color: '#ddd' }}>
              Set your starting rates. You can always adjust these later and create custom packages.
            </p>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Portrait Session (Starting Rate)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.portraitSession}
                  onChange={(e) => handleInputChange('rates.portraitSession', e.target.value)}
                  placeholder="300"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Fashion Shoot (Half Day)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.fashionShoot}
                  onChange={(e) => handleInputChange('rates.fashionShoot', e.target.value)}
                  placeholder="800"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Commercial Day Rate</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.commercialDay}
                  onChange={(e) => handleInputChange('rates.commercialDay', e.target.value)}
                  placeholder="1500"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Editorial Day Rate</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.editorialDay}
                  onChange={(e) => handleInputChange('rates.editorialDay', e.target.value)}
                  placeholder="1200"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Event Hourly Rate</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.eventHourly}
                  onChange={(e) => handleInputChange('rates.eventHourly', e.target.value)}
                  placeholder="150"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Packages Offered</label>
              <textarea
                style={styles.textarea}
                value={profileData.packagesOffered.join('\n')}
                onChange={(e) => handleInputChange('packagesOffered', e.target.value.split('\n').filter(p => p.trim()))}
                placeholder="List your photography packages (one per line):&#10;Basic Portrait Package - $300&#10;Premium Fashion Shoot - $1200&#10;Full Campaign Package - $3000"
              />
            </div>
          </div>
        );

      case 7: // Portfolio & Social Media
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🌟 Portfolio & Social Media</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Portfolio Website *</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.portfolioWebsite}
                  onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Business Instagram</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.instagramBusiness}
                  onChange={(e) => handleInputChange('instagramBusiness', e.target.value)}
                  placeholder="@yourphotography or full URL"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Behance Portfolio</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.behancePortfolio}
                  onChange={(e) => handleInputChange('behancePortfolio', e.target.value)}
                  placeholder="https://behance.net/yourwork"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>LinkedIn Profile</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.linkedinProfile}
                  onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Personal Instagram</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                  placeholder="@yourpersonal"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Facebook Page</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.socialMedia.facebook}
                  onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                  placeholder="Facebook business page"
                />
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Publications & Features</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.publications}
                  onChange={(e) => handleInputChange('publications', e.target.value)}
                  placeholder="Magazines, blogs, websites where your work has been featured"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Notable Clients</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.notableClients}
                  onChange={(e) => handleInputChange('notableClients', e.target.value)}
                  placeholder="Well-known clients, brands, celebrities you've worked with"
                />
              </div>
            </div>
          </div>
        );

      case 8: // Review & Submit
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✅ Review & Submit</h2>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
              <h3 style={{ color: '#26de81', marginBottom: '15px' }}>Photography Profile Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Name:</strong> {profileData.fullName}<br/>
                  <strong>Location:</strong> {profileData.location}<br/>
                  <strong>Experience:</strong> {profileData.yearsExperience}<br/>
                  <strong>Studio Access:</strong> {profileData.studioAccess}
                </div>
                <div>
                  <strong>Specializations:</strong> {profileData.photographyTypes.slice(0, 3).join(', ')}{profileData.photographyTypes.length > 3 ? '...' : ''}<br/>
                  <strong>Styles:</strong> {profileData.styles.slice(0, 3).join(', ')}{profileData.styles.length > 3 ? '...' : ''}<br/>
                  <strong>Travel:</strong> {profileData.travelRadius}<br/>
                  <strong>Equipment:</strong> {profileData.cameraEquipment.length} cameras, {profileData.lensCollection.length} lenses
                </div>
              </div>
            </div>
            
            <div style={{ background: 'rgba(255, 193, 7, 0.1)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255, 193, 7, 0.3)', marginBottom: '30px' }}>
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>📸 Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After submitting your profile, you'll be redirected to your dashboard where you can:
                <br/>• Upload your best portfolio images
                <br/>• Browse and apply for photography projects
                <br/>• Connect with models, stylists, and brands
                <br/>• Manage your bookings and client relationships
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
              📸 Photography Profile Setup
            </h1>
            <button 
              onClick={onLogout}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Logout
            </button>
          </div>
          <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>
            Create your professional photography profile to connect with models, brands, and creative teams
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
              <div style={{ fontSize: '20px', marginBottom: '3px' }}>
                {step.number < currentStep ? '✅' : step.icon}
              </div>
              <div style={{ fontSize: '10px', textAlign: 'center', color: 'white' }}>
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
              {isSubmitting ? 'Creating Profile...' : 'Complete Profile 🚀'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotographerProfileSetup;