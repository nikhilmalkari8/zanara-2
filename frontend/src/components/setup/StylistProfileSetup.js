// src/components/setup/StylistProfileSetup.js
import React, { useState } from 'react';

const StylistProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: '',
    location: '',

    // Professional Information
    headline: 'Professional Fashion Stylist',
    bio: '',
    yearsExperience: '',
    education: '',
    certifications: '',

    // Styling Specializations
    stylingTypes: [],
    clientTypes: [],
    fashionCategories: [],
    styleAesthetics: [],

    // Services & Expertise
    servicesOffered: [],
    designerKnowledge: [],
    brandRelationships: '',
    trendForecasting: '',
    colorAnalysis: false,
    bodyTypeExpertise: false,

    // Business Information
    consultationProcess: '',
    shoppingServices: false,
    wardrobeAudit: false,
    closetOrganization: false,

    // Rates & Packages
    rates: {
      consultation: '',
      personalStyling: '',
      editorialDay: '',
      shoppingHourly: '',
      packageDeals: '',
      currency: 'USD'
    },

    // Portfolio & Experience
    portfolioWebsite: '',
    editorialWork: '',
    brandCollaborations: '',
    celebrityClients: '',
    publications: '',

    // Social Media & Recognition
    socialMedia: {
      instagram: '',
      pinterest: '',
      linkedin: '',
      blog: '',
      tiktok: ''
    },

    // Work Preferences
    availability: '',
    travelWillingness: '',
    workEnvironments: [],
    collaborationStyle: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Professional Background', icon: '🎓' },
    { number: 3, title: 'Styling Specializations', icon: '👗' },
    { number: 4, title: 'Services & Expertise', icon: '💼' },
    { number: 5, title: 'Business & Rates', icon: '💰' },
    { number: 6, title: 'Portfolio & Social', icon: '📸' },
    { number: 7, title: 'Review & Submit', icon: '✅' }
  ];

  const stylingTypes = [
    'Editorial Styling', 'Personal Styling', 'Commercial Styling',
    'Celebrity Styling', 'Wardrobe Consulting', 'E-commerce Styling',
    'Event Styling', 'Red Carpet Styling', 'Music Video Styling',
    'Fashion Show Styling', 'Photoshoot Styling', 'Brand Styling',
    'Corporate Styling', 'Bridal Styling', 'Maternity Styling'
  ];

  const clientTypes = [
    'Individual Clients', 'Fashion Brands', 'Photographers', 'Models',
    'Celebrities', 'Influencers', 'Corporate Executives', 'Brides',
    'Fashion Magazines', 'Advertising Agencies', 'E-commerce Brands',
    'Music Artists', 'TV/Film Productions', 'Event Planners'
  ];

  const fashionCategories = [
    'Womenswear', 'Menswear', 'Plus-Size Fashion', 'Petite Fashion',
    'Maternity Fashion', 'Teen/Young Adult', 'Professional/Corporate',
    'Casual/Everyday', 'Formal/Evening', 'Street Style', 'Vintage/Retro',
    'Sustainable Fashion', 'Luxury Fashion', 'Budget-Friendly'
  ];

  const styleAesthetics = [
    'Minimalist', 'Bohemian', 'Classic/Timeless', 'Edgy/Alternative',
    'Romantic/Feminine', 'Sporty/Athletic', 'Preppy', 'Glamorous',
    'Vintage-Inspired', 'Street Style', 'Avant-Garde', 'Scandinavian',
    'Mediterranean', 'Urban Chic', 'Country/Rustic'
  ];

  const servicesOffered = [
    'Personal Shopping', 'Wardrobe Audit', 'Closet Organization',
    'Color Analysis', 'Body Type Consultation', 'Occasion Styling',
    'Capsule Wardrobe Creation', 'Shopping List Creation',
    'Style Education/Training', 'Fashion Photography Direction',
    'Trend Forecasting', 'Brand Consulting', 'Styling Workshops'
  ];

  const designerKnowledge = [
    'High-End Designers', 'Contemporary Brands', 'Fast Fashion',
    'Sustainable Brands', 'Emerging Designers', 'Vintage Collectors',
    'International Brands', 'Local/Independent Brands', 'Accessories Specialists',
    'Footwear Brands', 'Beauty Brands', 'Lifestyle Brands'
  ];

  const workEnvironments = [
    'Client Homes', 'Retail Stores', 'Photography Studios', 'Fashion Shows',
    'Corporate Offices', 'Special Events', 'Virtual Consultations',
    'Fashion Weeks', 'Trade Shows', 'Red Carpet Events'
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
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
        setMessage('Stylist profile created successfully! Redirecting to dashboard...');
        setTimeout(onProfileComplete, 2000);
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
      background: 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)',
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
      case 1:
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
            </div>
          </div>
        );

      case 2:
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
                  placeholder="e.g., Editorial & Personal Fashion Stylist"
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
                  <option value="0-1">0-1 years (New Stylist)</option>
                  <option value="2-3">2-3 years (Developing)</option>
                  <option value="4-6">4-6 years (Experienced)</option>
                  <option value="7-10">7-10 years (Senior Stylist)</option>
                  <option value="10+">10+ years (Master Stylist)</option>
                </select>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>About Your Styling Approach *</label>
              <textarea
                style={styles.textarea}
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Describe your styling philosophy, approach to fashion, and what makes your work unique."
              />
            </div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Education & Training</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Fashion school, styling courses, workshops"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Certifications</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="Color analysis certification, etc."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>👗 Styling Specializations</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Styling Types (Select all that apply) *</label>
              <div style={styles.checkboxGrid}>
                {stylingTypes.map(type => (
                  <div
                    key={type}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.stylingTypes.includes(type) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('stylingTypes', type)}
                  >
                    <input type="checkbox" checked={profileData.stylingTypes.includes(type)} readOnly />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Client Types *</label>
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
            <div style={styles.formGroup}>
              <label style={styles.label}>Fashion Categories</label>
              <div style={styles.checkboxGrid}>
                {fashionCategories.map(cat => (
                  <div
                    key={cat}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.fashionCategories.includes(cat) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('fashionCategories', cat)}
                  >
                    <input type="checkbox" checked={profileData.fashionCategories.includes(cat)} readOnly />
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Style Aesthetics</label>
              <div style={styles.checkboxGrid}>
                {styleAesthetics.map(aesthetic => (
                  <div
                    key={aesthetic}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.styleAesthetics.includes(aesthetic) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('styleAesthetics', aesthetic)}
                  >
                    <input type="checkbox" checked={profileData.styleAesthetics.includes(aesthetic)} readOnly />
                    <span>{aesthetic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💼 Services & Expertise</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Services Offered *</label>
              <div style={styles.checkboxGrid}>
                {servicesOffered.map(svc => (
                  <div
                    key={svc}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.servicesOffered.includes(svc) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('servicesOffered', svc)}
                  >
                    <input type="checkbox" checked={profileData.servicesOffered.includes(svc)} readOnly />
                    <span>{svc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Designer & Brand Knowledge</label>
              <div style={styles.checkboxGrid}>
                {designerKnowledge.map(know => (
                  <div
                    key={know}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.designerKnowledge.includes(know) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('designerKnowledge', know)}
                  >
                    <input type="checkbox" checked={profileData.designerKnowledge.includes(know)} readOnly />
                    <span>{know}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Brand Relationships</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.brandRelationships}
                  onChange={(e) => handleInputChange('brandRelationships', e.target.value)}
                  placeholder="PR contacts, showroom access, etc."
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Trend Forecasting Experience</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.trendForecasting}
                  onChange={(e) => handleInputChange('trendForecasting', e.target.value)}
                  placeholder="Experience predicting fashion trends"
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={profileData.colorAnalysis}
                  onChange={(e) => handleInputChange('colorAnalysis', e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                I offer professional color analysis services
              </label>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={profileData.bodyTypeExpertise}
                  onChange={(e) => handleInputChange('bodyTypeExpertise', e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                I specialize in body type consultation
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💰 Business & Rates</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Initial Consultation (USD)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.consultation}
                  onChange={(e) => handleInputChange('rates.consultation', e.target.value)}
                  placeholder="150"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Personal Styling Session (USD)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.personalStyling}
                  onChange={(e) => handleInputChange('rates.personalStyling', e.target.value)}
                  placeholder="400"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Editorial Day Rate (USD)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.editorialDay}
                  onChange={(e) => handleInputChange('rates.editorialDay', e.target.value)}
                  placeholder="800"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Shopping Service Hourly (USD)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.shoppingHourly}
                  onChange={(e) => handleInputChange('rates.shoppingHourly', e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Package Deals</label>
              <textarea
                style={styles.textarea}
                value={profileData.rates.packageDeals}
                onChange={(e) => handleInputChange('rates.packageDeals', e.target.value)}
                placeholder="e.g., 'Wardrobe Overhaul: $2500 includes consultation, shopping, 3 sessions'"
              />
            </div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Consultation Process</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.consultationProcess}
                  onChange={(e) => handleInputChange('consultationProcess', e.target.value)}
                  placeholder="Describe what clients can expect"
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={profileData.shoppingServices}
                  onChange={(e) => handleInputChange('shoppingServices', e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                I offer personal shopping services
              </label>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={profileData.wardrobeAudit}
                  onChange={(e) => handleInputChange('wardrobeAudit', e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                I provide wardrobe audit services
              </label>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={profileData.closetOrganization}
                  onChange={(e) => handleInputChange('closetOrganization', e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                I offer closet organization services
              </label>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>📸 Portfolio & Social Media</h2>
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
                <label style={styles.label}>Instagram</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                  placeholder="@yourstyling"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Pinterest</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.socialMedia.pinterest}
                  onChange={(e) => handleInputChange('socialMedia.pinterest', e.target.value)}
                  placeholder="Pinterest URL"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>LinkedIn</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.socialMedia.linkedin}
                  onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                  placeholder="LinkedIn URL"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Blog/Website</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.socialMedia.blog}
                  onChange={(e) => handleInputChange('socialMedia.blog', e.target.value)}
                  placeholder="Blog URL"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>TikTok</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.socialMedia.tiktok}
                  onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                  placeholder="@yourtiktok"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✅ Review & Submit</h2>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
              <h3 style={{ color: '#a55eea', marginBottom: '15px' }}>Stylist Profile Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))', gap: '15px' }}>
                <div>
                  <strong>Name:</strong> {profileData.fullName}<br/>
                  <strong>Location:</strong> {profileData.location}<br/>
                  <strong>Experience:</strong> {profileData.yearsExperience}<br/>
                  <strong>Specializations:</strong> {profileData.stylingTypes.length} types
                </div>
                <div>
                  <strong>Client Types:</strong> {profileData.clientTypes.slice(0,3).join(', ')}{profileData.clientTypes.length >3 ? '...' : ''}<br/>
                  <strong>Services:</strong> {profileData.servicesOffered.length} offerings<br/>
                  <strong>Consultation Rate:</strong> ${profileData.rates.consultation || 'TBD'}<br/>
                  <strong>Travel:</strong> {profileData.travelWillingness || 'TBD'}
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,193,7,0.1)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,193,7,0.3)', marginBottom: '30px' }}>
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>👗 Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After submitting, you can:<br/>
                • Upload portfolio & before/after photos<br/>
                • Browse & apply for projects<br/>
                • Connect with models, photographers & brands<br/>
                • Manage your bookings & consultations
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
      <div style={styles.setupCard}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>👗 Fashion Stylist Setup</h1>
            <button onClick={onLogout} style={{ ...styles.button, ...styles.secondaryButton }}>
              Logout
            </button>
          </div>
          <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>
            Create your professional styling profile to connect with clients, models, and fashion brands
          </p>
        </div>
        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          {steps.map(step => (
            <div
              key={step.number}
              style={{
                ...styles.step,
                ...(step.number === currentStep
                  ? styles.stepActive
                  : step.number < currentStep
                  ? styles.stepCompleted
                  : styles.stepUpcoming)
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
        <div style={styles.content}>{renderStepContent()}</div>
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
              {isSubmitting ? 'Creating Profile...' : 'Complete Profile ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StylistProfileSetup;
