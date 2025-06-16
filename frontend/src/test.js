import React, { useState } from 'react';

const MakeupArtistProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phone: '',
    location: '',
    
    // Professional Information
    headline: 'Professional Makeup Artist',
    bio: '',
    yearsExperience: '',
    education: '',
    certifications: '',
    
    // Makeup Specializations
    makeupTypes: [],
    techniques: [],
    clientTypes: [],
    
    // Skills & Expertise
    specialSkills: [],
    colorTheoryExpertise: false,
    skinTypeExpertise: [],
    ageGroupExpertise: [],
    
    // Product & Brand Knowledge
    preferredBrands: [],
    productTypes: [],
    kitInformation: '',
    hygieneStandards: '',
    
    // Business Information
    mobileServices: false,
    studioAccess: '',
    equipmentOwned: [],
    
    // Rates & Services
    rates: {
      bridal: '',
      photoshoot: '',
      special_event: '',
      lesson: '',
      consultation: '',
      currency: 'USD'
    },
    
    // Portfolio & Experience
    portfolioWebsite: '',
    notableWork: '',
    publicationFeatures: '',
    competitions: '',
    
    // Social Media & Marketing
    socialMedia: {
      instagram: '',
      youtube: '',
      tiktok: '',
      facebook: '',
      blog: ''
    },
    
    // Work Preferences
    availability: '',
    travelRadius: '',
    workEnvironments: [],
    bookingAdvance: ''
  });

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Professional', icon: '🎓' },
    { number: 3, title: 'Specializations', icon: '💄' },
    { number: 4, title: 'Skills', icon: '🎨' },
    { number: 5, title: 'Products', icon: '💎' },
    { number: 6, title: 'Business', icon: '💰' },
    { number: 7, title: 'Portfolio', icon: '📸' },
    { number: 8, title: 'Review', icon: '✅' }
  ];

  // Option lists
  const makeupTypes = [
    'Bridal Makeup', 'Editorial Makeup', 'Fashion Makeup', 'Commercial Makeup',
    'Special Effects (SFX)', 'Theatrical Makeup', 'Film/TV Makeup', 'Beauty Makeup',
    'Avant-garde Makeup', 'Airbrushing', 'Body Painting', 'Prosthetics'
  ];

  const techniques = [
    'Contouring & Highlighting', 'Color Correction', 'Airbrushing', 'False Lashes',
    'Eyebrow Shaping', 'Lip Art', 'Cut Crease', 'Smokey Eyes', 'Natural/No-Makeup Look',
    'Glitter Application', 'Face Painting', 'HD Makeup'
  ];

  const clientTypes = [
    'Brides', 'Models', 'Actors/Actresses', 'Musicians/Performers', 'Corporate Clients',
    'Private Individuals', 'Children', 'Seniors', 'Special Events', 'Photoshoots'
  ];

  const specialSkills = [
    'Sensitive Skin Expertise', 'Mature Skin Specialist', 'Men\'s Grooming',
    'Ethnic Skin Tones', 'Acne Coverage', 'Scar Coverage', 'Tattoo Coverage',
    'Waterproof Makeup', 'Long-lasting Techniques', 'Quick Touch-ups'
  ];

  const skinTypeExpertise = [
    'Oily Skin', 'Dry Skin', 'Combination Skin', 'Sensitive Skin', 'Mature Skin',
    'Acne-prone Skin', 'Rosacea', 'Dark Skin Tones', 'Light Skin Tones', 'Medium Skin Tones'
  ];

  const ageGroupExpertise = [
    'Children (5-12)', 'Teens (13-19)', 'Young Adults (20-30)', 'Adults (31-50)',
    'Mature Adults (51-65)', 'Seniors (65+)'
  ];

  const preferredBrands = [
    'MAC', 'NARS', 'Urban Decay', 'Too Faced', 'Charlotte Tilbury', 'Fenty Beauty',
    'Anastasia Beverly Hills', 'Tarte', 'Bobbi Brown', 'Laura Mercier', 'Make Up For Ever',
    'YSL', 'Dior', 'Chanel', 'Tom Ford', 'Pat McGrath Labs'
  ];

  const productTypes = [
    'Foundation', 'Concealer', 'Powder', 'Blush', 'Bronzer', 'Highlighter',
    'Eyeshadow', 'Eyeliner', 'Mascara', 'Lipstick', 'Lip Gloss', 'Brushes',
    'Sponges', 'Setting Spray', 'Primer'
  ];

  const equipmentOwned = [
    'Professional Brush Set', 'Airbrush System', 'Ring Light', 'Makeup Chair',
    'Professional Mirrors', 'Sanitization Equipment', 'Color Palette', 'False Lashes Collection',
    'Prosthetics Kit', 'Special Effects Supplies'
  ];

  const workEnvironments = [
    'Studio', 'On-location', 'Client\'s Home', 'Wedding Venues', 'Photo Studios',
    'Fashion Shows', 'Film Sets', 'Theater', 'Events'
  ];

  // Handlers
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

  const handleToggle = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleBoolToggle = (field) => {
    setProfileData(prev => ({ ...prev, [field]: !prev[field] }));
  };

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
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Profile created successfully! Welcome to Zanara.');
        setTimeout(() => {
          onProfileComplete();
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to create profile. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
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

    const checkboxContainerStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '10px',
      marginTop: '10px'
    };

    const checkboxLabelStyle = {
      display: 'flex',
      alignItems: 'center',
      color: '#ccc',
      fontSize: '14px',
      cursor: 'pointer'
    };

    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              👤 Personal Information
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Full Name *</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                style={inputStyle}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Email *</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={inputStyle}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Phone Number *</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={inputStyle}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Location *</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                style={inputStyle}
                placeholder="City, State/Country"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              🎓 Professional Background
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Professional Headline *</label>
              <input
                type="text"
                value={profileData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                style={inputStyle}
                placeholder="e.g., Professional Bridal Makeup Artist"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Years of Experience *</label>
              <select
                value={profileData.yearsExperience}
                onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Select experience level</option>
                <option value="0-1">0-1 years</option>
                <option value="2-3">2-3 years</option>
                <option value="4-6">4-6 years</option>
                <option value="7-10">7-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>About You *</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                style={inputStyle}
                rows="5"
                placeholder="Tell us about your passion for makeup artistry, your style, and what makes you unique..."
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Education & Training</label>
              <textarea
                value={profileData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                style={inputStyle}
                rows="3"
                placeholder="List your makeup schools, courses, workshops, or relevant education..."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Certifications</label>
              <textarea
                value={profileData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                style={inputStyle}
                rows="3"
                placeholder="List any professional certifications or awards..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              💄 Makeup Specializations
            </h3>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>Makeup Types *</label>
              <div style={checkboxContainerStyle}>
                {makeupTypes.map(type => (
                  <label key={type} style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={profileData.makeupTypes.includes(type)}
                      onChange={() => handleToggle('makeupTypes', type)}
                      style={{ marginRight: '8px' }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>Techniques *</label>
              <div style={checkboxContainerStyle}>
                {techniques.map(technique => (
                  <label key={technique} style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={profileData.techniques.includes(technique)}
                      onChange={() => handleToggle('techniques', technique)}
                      style={{ marginRight: '8px' }}
                    />
                    {technique}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>Client Types *</label>
              <div style={checkboxContainerStyle}>
                {clientTypes.map(clientType => (
                  <label key={clientType} style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={profileData.clientTypes.includes(clientType)}
                      onChange={() => handleToggle('clientTypes', clientType)}
                      style={{ marginRight: '8px' }}
                    />
                    {clientType}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              🎨 Skills & Expertise
            </h3>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>Special Skills</label>
              <div style={checkboxContainerStyle}>
                {specialSkills.map(skill => (
                  <label key={skill} style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={profileData.specialSkills.includes(skill)}
                      onChange={() => handleToggle('specialSkills', skill)}
                      style={{ marginRight: '8px' }}
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={profileData.colorTheoryExpertise}
                  onChange={() => handleBoolToggle('colorTheoryExpertise')}
                  style={{ marginRight: '8px' }}
                />
                Color Theory Expert
              </label>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>Skin Type Expertise</label>
              <div style={checkboxContainerStyle}>
                {skinTypeExpertise.map(skinType => (
                  <label key={skinType} style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={profileData.skinTypeExpertise.includes(skinType)}
                      onChange={() => handleToggle('skinTypeExpertise', skinType)}
                      style={{ marginRight: '8px' }}
                    />
                    {skinType}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>Age Group Expertise</label>
              <div style={checkboxContainerStyle}>
                {ageGroupExpertise.map(ageGroup => (
                  <label key={ageGroup} style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={profileData.ageGroupExpertise.includes(ageGroup)}
                      onChange={() => handleToggle('ageGroupExpertise', ageGroup)}
                      style={{ marginRight: '8px' }}
                    />
                    {ageGroup}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              💎 Products & Kit Information
            </h3>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>Preferred Brands</label>
              <div style={checkboxContainerStyle}>
                {preferredBrands.map(brand => (
                  <label key={brand} style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={profileData.preferredBrands.includes(brand)}
                      onChange={() => handleToggle('preferredBrands', brand)}
                      style={{ marginRight: '8px' }}
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>Product Types in Your Kit</label>
              <div style={checkboxContainerStyle}>
                {productTypes.map(product => (
                  <label key={product} style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={profileData.productTypes.includes(product)}
                      onChange={() => handleToggle('productTypes', product)}
                      style={{ marginRight: '8px' }}
                    />
                    {product}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Kit Information</label>
              <textarea
                value={profileData.kitInformation}
                onChange={(e) => handleInputChange('kitInformation', e.target.value)}
                style={inputStyle}
                rows="4"
                placeholder="Describe your makeup kit, special tools, and professional equipment..."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Hygiene Standards</label>
              <textarea
                value={profileData.hygieneStandards}
                onChange={(e) => handleInputChange('hygieneStandards', e.target.value)}
                style={inputStyle}
                rows="4"
                placeholder="Describe your sanitation practices and safety protocols..."
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              💰 Business & Rates
            </h3>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={profileData.mobileServices}
                  onChange={() => handleBoolToggle('mobileServices')}
                  style={{ marginRight: '8px' }}
                />
                I offer mobile services (travel to clients)
              </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Studio Access</label>
              <input
                type="text"
                value={profileData.studioAccess}
                onChange={(e) => handleInputChange('studioAccess', e.target.value)}
                style={inputStyle}
                placeholder="Describe your studio or workspace access..."
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>Equipment Owned</label>
              <div style={checkboxContainerStyle}>
                {equipmentOwned.map(equipment => (
                  <label key={equipment} style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={profileData.equipmentOwned.includes(equipment)}
                      onChange={() => handleToggle('equipmentOwned', equipment)}
                      style={{ marginRight: '8px' }}
                    />
                    {equipment}
                  </label>
                ))}
              </div>
            </div>

            <h4 style={{ color: 'white', marginBottom: '15px' }}>Service Rates</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {Object.entries(profileData.rates).map(([key, value]) => (
                key !== 'currency' ? (
                  <div key={key}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')} Rate
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleInputChange(`rates.${key}`, e.target.value)}
                      style={inputStyle}
                      placeholder="e.g., $150"
                    />
                  </div>
                ) : null
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Currency</label>
              <select
                value={profileData.rates.currency}
                onChange={(e) => handleInputChange('rates.currency', e.target.value)}
                style={inputStyle}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              📸 Portfolio & Social Media
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Portfolio Website</label>
              <input
                type="url"
                value={profileData.portfolioWebsite}
                onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                style={inputStyle}
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Notable Work</label>
              <textarea
                value={profileData.notableWork}
                onChange={(e) => handleInputChange('notableWork', e.target.value)}
                style={inputStyle}
                rows="4"
                placeholder="Describe your most notable projects, collaborations, or achievements..."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Publication Features</label>
              <textarea
                value={profileData.publicationFeatures}
                onChange={(e) => handleInputChange('publicationFeatures', e.target.value)}
                style={inputStyle}
                rows="3"
                placeholder="List any magazines, blogs, or publications that have featured your work..."
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Competitions & Awards</label>
              <textarea
                value={profileData.competitions}
                onChange={(e) => handleInputChange('competitions', e.target.value)}
                style={inputStyle}
                rows="3"
                placeholder="List any makeup competitions, contests, or awards you've won..."
              />
            </div>

            <h4 style={{ color: 'white', marginBottom: '15px' }}>Social Media</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {Object.entries(profileData.socialMedia).map(([platform, value]) => (
                <div key={platform}>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(`socialMedia.${platform}`, e.target.value)}
                    style={inputStyle}
                    placeholder={`@yourusername or full URL`}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              ✅ Review & Submit
            </h3>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: 'white', marginBottom: '15px' }}>Profile Summary</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', color: '#ccc', fontSize: '14px' }}>
                <div>
                  <p><strong>Name:</strong> {profileData.fullName}</p>
                  <p><strong>Location:</strong> {profileData.location}</p>
                  <p><strong>Experience:</strong> {profileData.yearsExperience || 'Not specified'}</p>
                  <p><strong>Makeup Types:</strong> {profileData.makeupTypes.length} selected</p>
                  <p><strong>Techniques:</strong> {profileData.techniques.length} selected</p>
                </div>
                <div>
                  <p><strong>Mobile Services:</strong> {profileData.mobileServices ? 'Yes' : 'No'}</p>
                  <p><strong>Preferred Brands:</strong> {profileData.preferredBrands.length} selected</p>
                  <p><strong>Equipment:</strong> {profileData.equipmentOwned.length} items</p>
                  <p><strong>Portfolio:</strong> {profileData.portfolioWebsite || 'Not provided'}</p>
                  <p><strong>Currency:</strong> {profileData.rates.currency}</p>
                </div>
              </div>
              
              {profileData.bio && (
                <div style={{ marginTop: '15px' }}>
                  <p style={{ color: '#ccc', fontSize: '14px' }}>
                    <strong>Bio:</strong> {profileData.bio.slice(0, 200)}
                    {profileData.bio.length > 200 && '...'}
                  </p>
                </div>
              )}
            </div>
            
            <div style={{ 
              padding: '15px', 
              borderRadius: '8px', 
              background: 'rgba(76, 175, 80, 0.1)', 
              border: '1px solid rgba(76, 175, 80, 0.3)',
              color: '#81C784',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0 }}>
                📋 Please review all your information above. Once you submit, your profile will be created and you'll be able to start connecting with clients on Zanara.
              </p>
            </div>
          </div>
        );

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
            <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Setup Your Makeup Artist Profile</h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>Welcome {user?.firstName}! Let's create your professional profile.</p>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {steps.map((step, index) => (
              <div key={step.number} style={{ display: 'flex', alignItems: 'center', minWidth: '120px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  background: currentStep >= step.number ? '#4ecdc4' : 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}>
                  {step.icon}
                </div>
                <div style={{ marginLeft: '10px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: currentStep >= step.number ? 'white' : '#ccc',
                    fontWeight: currentStep === step.number ? 'bold' : 'normal'
                  }}>
                    Step {step.number}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: currentStep >= step.number ? '#ccc' : '#999'
                  }}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    width: '20px',
                    height: '2px',
                    margin: '0 10px',
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
                {isLoading ? 'Creating Profile...' : 'Create Makeup Artist Profile'}
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

export default MakeupArtistProfileSetup;