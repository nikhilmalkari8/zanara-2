// src/components/setup/DesignerProfileSetup.js
import React, { useState } from 'react';

const DesignerProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: '',
    location: '',
    
    // Professional Information
    headline: 'Fashion Designer',
    bio: '',
    yearsExperience: '',
    education: '',
    designPhilosophy: '',
    
    // Design Specializations
    designCategories: [], // Womenswear, Menswear, etc.
    productTypes: [], // Dresses, Suits, Accessories, etc.
    designStyles: [], // Minimalist, Avant-garde, etc.
    targetMarket: [], // Luxury, Contemporary, etc.
    
    // Technical Skills
    technicalSkills: [], // Pattern making, Draping, etc.
    softwareSkills: [], // Adobe Creative Suite, CLO 3D, etc.
    constructionSkills: [], // Sewing, Fitting, etc.
    materialKnowledge: [], // Fabrics, Trims, etc.
    
    // Business & Production
    businessModel: '',
    productionCapacity: '',
    manufacturingKnowledge: '',
    sustainabilityPractices: '',
    qualityStandards: '',
    
    // Portfolio & Collections
    portfolioWebsite: '',
    collections: '',
    designAwards: '',
    exhibitions: '',
    collaborations: '',
    
    // Social Media & Professional
    socialMedia: {
      instagram: '',
      behance: '',
      linkedin: '',
      website: '',
      blog: ''
    },
    
    // Services & Pricing
    servicesOffered: [],
    customDesign: false,
    consultingServices: false,
    rates: {
      consultationHourly: '',
      customDesignStarting: '',
      patternMaking: '',
      technicalDrawings: '',
      currency: 'USD'
    },
    
    // Work Preferences
    availability: '',
    projectTypes: [],
    collaborationStyle: '',
    clientTypes: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Professional Background', icon: '🎓' },
    { number: 3, title: 'Design Specializations', icon: '✂️' },
    { number: 4, title: 'Technical Skills', icon: '🛠️' },
    { number: 5, title: 'Business & Production', icon: '🏭' },
    { number: 6, title: 'Portfolio & Collections', icon: '📚' },
    { number: 7, title: 'Services & Rates', icon: '💰' },
    { number: 8, title: 'Review & Submit', icon: '✅' }
  ];

  const designCategories = [
    'Womenswear', 'Menswear', 'Childrenswear', 'Plus-Size Fashion',
    'Petite Fashion', 'Maternity Fashion', 'Unisex Fashion', 'Accessories',
    'Footwear', 'Bags & Handbags', 'Jewelry', 'Lingerie & Intimates',
    'Swimwear', 'Activewear & Sportswear', 'Outerwear', 'Formal/Evening Wear'
  ];

  const productTypes = [
    'Dresses', 'Tops & Blouses', 'Pants & Trousers', 'Skirts', 'Suits',
    'Jackets & Blazers', 'Coats', 'Knitwear', 'T-Shirts & Casual Tops',
    'Jeans & Denim', 'Shorts', 'Jumpsuits & Rompers', 'Sleepwear',
    'Undergarments', 'Scarves & Wraps', 'Hats & Headwear'
  ];

  const designStyles = [
    'Minimalist', 'Avant-Garde', 'Classic/Timeless', 'Bohemian',
    'Urban/Street Style', 'Vintage-Inspired', 'Romantic/Feminine',
    'Edgy/Alternative', 'Preppy', 'Glamorous', 'Casual/Relaxed',
    'Formal/Professional', 'Sustainable/Eco-Friendly', 'High Fashion',
    'Contemporary', 'Retro/Nostalgic'
  ];

  const targetMarket = [
    'Luxury ($500+)', 'Contemporary ($100-500)', 'Bridge ($50-150)',
    'Fast Fashion ($10-50)', 'Budget-Friendly (<$25)', 'Custom/Couture',
    'Sustainable Fashion', 'Slow Fashion', 'Made-to-Order',
    'Limited Edition', 'Mass Market', 'Niche Market'
  ];

  const technicalSkills = [
    'Pattern Making', 'Pattern Grading', 'Draping', 'Flat Pattern Design',
    'Garment Construction', 'Fitting & Alterations', 'Technical Drawing',
    'Specification Writing', 'Size Chart Development', 'Cost Analysis',
    'Fabric Sourcing', 'Trim Selection', 'Color Theory', 'Print Design',
    'Embellishment Techniques', 'Quality Control'
  ];

  const softwareSkills = [
    'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign',
    'CLO 3D', 'Browzwear VStitcher', 'Optitex', 'Gerber AccuMark',
    'Lectra Modaris', 'TUKAcad', 'Marvelous Designer', 'Sketch',
    'Figma', 'AutoCAD', 'Rhino 3D', 'Blender', 'Procreate'
  ];

  const constructionSkills = [
    'Machine Sewing', 'Hand Sewing', 'Serging/Overlocking', 'Blind Hemming',
    'Buttonhole Making', 'Zipper Installation', 'Seam Finishing',
    'Pressing & Steaming', 'Tailoring Techniques', 'Couture Techniques',
    'Embroidery', 'Beading', 'Appliqué', 'Quilting', 'Leather Working'
  ];

  const materialKnowledge = [
    'Natural Fibers (Cotton, Wool, Silk, Linen)', 'Synthetic Fibers',
    'Blended Fabrics', 'Knit Fabrics', 'Woven Fabrics', 'Denim',
    'Leather & Suede', 'Fur & Faux Fur', 'Technical Fabrics',
    'Sustainable Materials', 'Organic Materials', 'Recycled Materials',
    'Trims & Notions', 'Hardware', 'Interfacing', 'Linings'
  ];

  const servicesOffered = [
    'Custom Design', 'Pattern Making', 'Technical Drawings',
    'Garment Construction', 'Fitting Services', 'Design Consultation',
    'Trend Forecasting', 'Collection Development', 'Brand Development',
    'Fashion Illustration', 'CAD Services', 'Production Planning',
    'Quality Control', 'Sourcing Assistance', 'Design Education'
  ];

  const projectTypes = [
    'Custom Garments', 'Collection Development', 'Pattern Creation',
    'Technical Consultation', 'Design Collaboration', 'Brand Projects',
    'Fashion Week Preparation', 'Startup Assistance', 'Redesign Projects',
    'Sustainable Design', 'Costume Design', 'Uniform Design'
  ];

  const clientTypes = [
    'Fashion Brands', 'Individual Clients', 'Celebrities', 'Influencers',
    'Retail Companies', 'Startups', 'Costume Departments', 'Theater Companies',
    'Dance Companies', 'Wedding Clients', 'Corporate Clients', 'Non-Profits'
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
        setMessage('Designer profile created successfully! Redirecting to dashboard...');
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
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
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
                  placeholder="e.g., Sustainable Fashion Designer & Pattern Maker"
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
                  <option value="0-2">0-2 years (Emerging Designer)</option>
                  <option value="3-5">3-5 years (Developing Designer)</option>
                  <option value="6-10">6-10 years (Experienced Designer)</option>
                  <option value="11-15">11-15 years (Senior Designer)</option>
                  <option value="15+">15+ years (Master Designer)</option>
                </select>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Design Philosophy & Approach *</label>
              <textarea
                style={styles.textarea}
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Describe your design philosophy, creative process, and what drives your work. What makes your design approach unique?"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Design Philosophy Statement</label>
              <textarea
                style={{ ...styles.textarea, minHeight: '80px' }}
                value={profileData.designPhilosophy}
                onChange={(e) => handleInputChange('designPhilosophy', e.target.value)}
                placeholder="Your core design beliefs and values that guide your creative decisions"
              />
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Education & Training</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Fashion design school, degrees, workshops, apprenticeships"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Design Specializations
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✂️ Design Specializations</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Design Categories (Select all that apply) *</label>
              <div style={styles.checkboxGrid}>
                {designCategories.map(category => (
                  <div
                    key={category}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.designCategories.includes(category) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('designCategories', category)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.designCategories.includes(category)}
                      onChange={() => {}}
                    />
                    <span>{category}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Product Types</label>
              <div style={styles.checkboxGrid}>
                {productTypes.map(product => (
                  <div
                    key={product}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.productTypes.includes(product) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('productTypes', product)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.productTypes.includes(product)}
                      onChange={() => {}}
                    />
                    <span>{product}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Design Styles</label>
              <div style={styles.checkboxGrid}>
                {designStyles.map(style => (
                  <div
                    key={style}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.designStyles.includes(style) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('designStyles', style)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.designStyles.includes(style)}
                      onChange={() => {}}
                    />
                    <span>{style}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Target Market</label>
              <div style={styles.checkboxGrid}>
                {targetMarket.map(market => (
                  <div
                    key={market}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.targetMarket.includes(market) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('targetMarket', market)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.targetMarket.includes(market)}
                      onChange={() => {}}
                    />
                    <span>{market}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Technical Skills
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🛠️ Technical Skills</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Technical Design Skills *</label>
              <div style={styles.checkboxGrid}>
                {technicalSkills.map(skill => (
                  <div
                    key={skill}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.technicalSkills.includes(skill) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('technicalSkills', skill)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.technicalSkills.includes(skill)}
                      onChange={() => {}}
                    />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Software & Technology Skills</label>
              <div style={styles.checkboxGrid}>
                {softwareSkills.map(software => (
                  <div
                    key={software}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.softwareSkills.includes(software) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('softwareSkills', software)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.softwareSkills.includes(software)}
                      onChange={() => {}}
                    />
                    <span>{software}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Construction & Sewing Skills</label>
              <div style={styles.checkboxGrid}>
                {constructionSkills.map(skill => (
                  <div
                    key={skill}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.constructionSkills.includes(skill) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('constructionSkills', skill)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.constructionSkills.includes(skill)}
                      onChange={() => {}}
                    />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Material & Fabric Knowledge</label>
              <div style={styles.checkboxGrid}>
                {materialKnowledge.map(material => (
                  <div
                    key={material}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.materialKnowledge.includes(material) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('materialKnowledge', material)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.materialKnowledge.includes(material)}
                      onChange={() => {}}
                    />
                    <span>{material}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // Business & Production
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🏭 Business & Production</h2>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Business Model *</label>
                <select
                  style={styles.select}
                  value={profileData.businessModel}
                  onChange={(e) => handleInputChange('businessModel', e.target.value)}
                >
                  <option value="">Select business model</option>
                  <option value="independent-designer">Independent Designer</option>
                  <option value="fashion-brand-owner">Fashion Brand Owner</option>
                  <option value="freelance-designer">Freelance Designer</option>
                  <option value="design-consultant">Design Consultant</option>
                  <option value="custom-couture">Custom/Couture Designer</option>
                  <option value="pattern-maker">Pattern Making Service</option>
                  <option value="design-studio">Design Studio</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Production Capacity</label>
                <select
                  style={styles.select}
                  value={profileData.productionCapacity}
                  onChange={(e) => handleInputChange('productionCapacity', e.target.value)}
                >
                  <option value="">Select production capacity</option>
                  <option value="single-pieces">Single Pieces/Prototypes</option>
                  <option value="small-batch">Small Batch (1-50 pieces)</option>
                  <option value="medium-batch">Medium Batch (51-500 pieces)</option>
                  <option value="large-scale">Large Scale (500+ pieces)</option>
                  <option value="no-production">Design Only (No Production)</option>
                </select>
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Manufacturing Knowledge</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.manufacturingKnowledge}
                  onChange={(e) => handleInputChange('manufacturingKnowledge', e.target.value)}
                  placeholder="Experience with manufacturers, suppliers, production processes, quality control"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sustainability Practices</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.sustainabilityPractices}
                  onChange={(e) => handleInputChange('sustainabilityPractices', e.target.value)}
                  placeholder="Eco-friendly practices, sustainable materials, ethical production methods"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Quality Standards & Processes</label>
              <textarea
                style={{ ...styles.textarea, minHeight: '80px' }}
                value={profileData.qualityStandards}
                onChange={(e) => handleInputChange('qualityStandards', e.target.value)}
                placeholder="Quality control processes, standards, testing procedures, attention to detail"
              />
            </div>
          </div>
        );

      case 6: // Portfolio & Collections
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>📚 Portfolio & Collections</h2>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Portfolio Website *</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.portfolioWebsite}
                  onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                  placeholder="https://yourdesignportfolio.com"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Instagram</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileData.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                  placeholder="@yourdesignername or full URL"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Behance Portfolio</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.socialMedia.behance}
                  onChange={(e) => handleInputChange('socialMedia.behance', e.target.value)}
                  placeholder="https://behance.net/yourwork"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>LinkedIn Profile</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.socialMedia.linkedin}
                  onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Personal Website</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.socialMedia.website}
                  onChange={(e) => handleInputChange('socialMedia.website', e.target.value)}
                  placeholder="https://yourpersonalsite.com"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Design Blog</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profileData.socialMedia.blog}
                  onChange={(e) => handleInputChange('socialMedia.blog', e.target.value)}
                  placeholder="Your design blog or publication"
                />
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Collections & Past Work</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '100px' }}
                  value={profileData.collections}
                  onChange={(e) => handleInputChange('collections', e.target.value)}
                  placeholder="Describe your notable collections, signature pieces, and design milestones"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Design Awards & Recognition</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '100px' }}
                  value={profileData.designAwards}
                  onChange={(e) => handleInputChange('designAwards', e.target.value)}
                  placeholder="Awards, competitions won, industry recognition"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Exhibitions & Shows</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.exhibitions}
                  onChange={(e) => handleInputChange('exhibitions', e.target.value)}
                  placeholder="Fashion weeks, exhibitions, trunk shows, pop-ups"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Collaborations</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={profileData.collaborations}
                  onChange={(e) => handleInputChange('collaborations', e.target.value)}
                  placeholder="Brand collaborations, partnerships, notable projects"
                />
              </div>
            </div>
          </div>
        );

      case 7: // Services & Rates
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💰 Services & Rates</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Services Offered</label>
              <div style={styles.checkboxGrid}>
                {servicesOffered.map(service => (
                  <div
                    key={service}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.servicesOffered.includes(service) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('servicesOffered', service)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.servicesOffered.includes(service)}
                      onChange={() => {}}
                    />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Consultation Rate (USD/hour)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.consultationHourly}
                  onChange={(e) => handleInputChange('rates.consultationHourly', e.target.value)}
                  placeholder="125"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Custom Design Starting Rate (USD)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.customDesignStarting}
                  onChange={(e) => handleInputChange('rates.customDesignStarting', e.target.value)}
                  placeholder="800"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Pattern Making Rate (USD)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.patternMaking}
                  onChange={(e) => handleInputChange('rates.patternMaking', e.target.value)}
                  placeholder="200"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Technical Drawings Rate (USD)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={profileData.rates.technicalDrawings}
                  onChange={(e) => handleInputChange('rates.technicalDrawings', e.target.value)}
                  placeholder="75"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Project Types</label>
              <div style={styles.checkboxGrid}>
                {projectTypes.map(type => (
                  <div
                    key={type}
                    style={{
                      ...styles.checkbox,
                      ...(profileData.projectTypes.includes(type) ? styles.checkboxChecked : {})
                    }}
                    onClick={() => handleArrayToggle('projectTypes', type)}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.projectTypes.includes(type)}
                      onChange={() => {}}
                    />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
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

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Availability</label>
                <select
                  style={styles.select}
                  value={profileData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                >
                  <option value="">Select availability</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="project-based">Project Based</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="by-commission">By Commission Only</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Collaboration Style</label>
              <textarea
                style={{ ...styles.textarea, minHeight: '80px' }}
                value={profileData.collaborationStyle}
                onChange={(e) => handleInputChange('collaborationStyle', e.target.value)}
                placeholder="Describe your working style, communication preferences, and project approach"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={profileData.customDesign}
                  onChange={(e) => handleInputChange('customDesign', e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                I offer custom design services
              </label>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={profileData.consultingServices}
                  onChange={(e) => handleInputChange('consultingServices', e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                I provide design consulting services
              </label>
            </div>
          </div>
        );

      case 8: // Review & Submit
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✅ Review & Submit</h2>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
              <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>Fashion Designer Profile Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Name:</strong> {profileData.fullName}<br/>
                  <strong>Location:</strong> {profileData.location}<br/>
                  <strong>Experience:</strong> {profileData.yearsExperience}<br/>
                  <strong>Business Model:</strong> {profileData.businessModel}
                </div>
                <div>
                  <strong>Categories:</strong> {profileData.designCategories.slice(0, 3).join(', ')}{profileData.designCategories.length > 3 ? '...' : ''}<br/>
                  <strong>Technical Skills:</strong> {profileData.technicalSkills.length} skills<br/>
                  <strong>Consultation Rate:</strong> ${profileData.rates.consultationHourly || 'TBD'}/hr<br/>
                  <strong>Services:</strong> {profileData.servicesOffered.length} offerings
                </div>
              </div>
            </div>
            
            <div style={{ background: 'rgba(255, 193, 7, 0.1)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255, 193, 7, 0.3)', marginBottom: '30px' }}>
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>✂️ Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After submitting your profile, you'll be redirected to your dashboard where you can:
                <br/>• Upload your design portfolio and collections
                <br/>• Browse and apply for design projects and collaborations
                <br/>• Connect with brands, manufacturers, and other designers
                <br/>• Showcase your technical drawings and creative process
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
              ✂️ Fashion Designer Setup
            </h1>
            <button 
              onClick={onLogout}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Logout
            </button>
          </div>
          <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>
            Create your professional fashion designer profile to connect with brands and showcase your creativity
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
              {isSubmitting ? 'Creating Profile...' : 'Complete Profile ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerProfileSetup;