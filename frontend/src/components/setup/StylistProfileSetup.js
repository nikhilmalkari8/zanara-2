// src/components/setup/StylistProfileSetup.js
import React, { useState } from 'react';
import { 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckboxGroup,
  Button,
  Card,
  LoadingSpinner,
  Notification
} from '../shared';
import { profileService } from '../../services/api';

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

  // Form validation and state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Professional Background', icon: '🎓' },
    { number: 3, title: 'Styling Specializations', icon: '👗' },
    { number: 4, title: 'Services & Expertise', icon: '💼' },
    { number: 5, title: 'Business & Rates', icon: '💰' },
    { number: 6, title: 'Portfolio & Social', icon: '📸' },
    { number: 7, title: 'Review & Submit', icon: '✅' }
  ];

  // Option arrays
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

  const yearsExperienceOptions = [
    { value: '0-1', label: '0-1 years (New Stylist)' },
    { value: '2-3', label: '2-3 years (Developing)' },
    { value: '4-6', label: '4-6 years (Experienced)' },
    { value: '7-10', label: '7-10 years (Senior Stylist)' },
    { value: '10+', label: '10+ years (Master Stylist)' }
  ];

  const availabilityOptions = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'freelance', label: 'Freelance/Project Based' },
    { value: 'weekends-only', label: 'Weekends Only' },
    { value: 'seasonal', label: 'Seasonal' }
  ];

  const travelWillingnessOptions = [
    { value: 'local-only', label: 'Local Only (0-50 miles)' },
    { value: 'regional', label: 'Regional (50-200 miles)' },
    { value: 'national', label: 'National' },
    { value: 'international', label: 'International' },
    { value: 'anywhere', label: 'Travel Anywhere' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'CAD', label: 'CAD' }
  ];

  // Form handling functions
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
      
      // Clear errors when field is edited
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: null
        }));
      }
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Clear errors when field is edited
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: null
        }));
      }
    }
  };

  const handleArrayChange = (field, values) => {
    setProfileData(prev => ({
      ...prev,
      [field]: values
    }));
    
    // Clear errors when field is edited
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleBooleanChange = (field) => {
    setProfileData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Navigation functions
  const nextStep = () => {
    // Validate current step
    const currentStepErrors = validateStep(currentStep);
    
    if (Object.keys(currentStepErrors).length > 0) {
      setErrors(currentStepErrors);
      setMessage('Please fix the errors before proceeding.');
      setMessageType('error');
      return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setMessage('');
      setMessageType('');
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setMessage('');
      setMessageType('');
      window.scrollTo(0, 0);
    }
  };

  // Validation function for each step
  const validateStep = (step) => {
    const stepErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        if (!profileData.fullName || profileData.fullName.trim() === '') {
          stepErrors.fullName = 'Full name is required';
        }
        if (!profileData.email || !/^\S+@\S+\.\S+$/.test(profileData.email)) {
          stepErrors.email = 'Valid email is required';
        }
        if (!profileData.phone) {
          stepErrors.phone = 'Phone number is required';
        }
        if (!profileData.location) {
          stepErrors.location = 'Location is required';
        }
        break;
      
      case 2: // Professional Background
        if (!profileData.headline) {
          stepErrors.headline = 'Professional headline is required';
        }
        if (!profileData.bio) {
          stepErrors.bio = 'Bio is required';
        }
        if (!profileData.yearsExperience) {
          stepErrors.yearsExperience = 'Years of experience is required';
        }
        break;
      
      case 3: // Styling Specializations
        if (profileData.stylingTypes.length === 0) {
          stepErrors.stylingTypes = 'Select at least one styling type';
        }
        if (profileData.clientTypes.length === 0) {
          stepErrors.clientTypes = 'Select at least one client type';
        }
        break;
      
      case 4: // Services & Expertise
        if (profileData.servicesOffered.length === 0) {
          stepErrors.servicesOffered = 'Select at least one service offered';
        }
        break;
      
      case 6: // Portfolio & Social
        if (!profileData.portfolioWebsite) {
          stepErrors.portfolioWebsite = 'Portfolio website is required';
        }
        break;
      
      default:
        // No validation for other steps
        break;
    }
    
    return stepErrors;
  };

  // Submit profile
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage('');
    setMessageType('');
    
    // Validate final step
    const finalErrors = validateStep(6); // Validate key requirements
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setMessage('Please fix the errors before submitting.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Use the profileService to submit the data
      const response = await profileService.completeProfile(profileData);

      if (response) {
        setMessage('Stylist profile created successfully! Redirecting to dashboard...');
        setMessageType('success');
        setTimeout(() => {
          onProfileComplete();
        }, 2000);
      }
    } catch (error) {
      setMessage(error.message || 'Failed to create profile. Please try again.');
      setMessageType('error');
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
    navigation: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '30px 40px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    checkboxContainer: {
      marginBottom: '25px'
    },
    booleanCheckbox: {
      display: 'flex', 
      alignItems: 'center', 
      color: '#fff', 
      fontSize: '14px', 
      cursor: 'pointer',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.3s ease'
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Personal Information
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>👤 Personal Information</h2>
            <div style={styles.formGrid}>
              <FormInput
                label="Full Name"
                value={profileData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Your professional name"
                error={errors.fullName}
                required
              />
              <FormInput
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="professional@email.com"
                error={errors.email}
                required
              />
              <FormInput
                label="Phone Number"
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                error={errors.phone}
                required
              />
              <FormInput
                label="Location"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State/Country"
                error={errors.location}
                required
              />
            </div>
          </div>
        );

      case 2: // Professional Background
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🎓 Professional Background</h2>
            <div style={styles.formGrid}>
              <FormInput
                label="Professional Headline"
                value={profileData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                placeholder="e.g., Editorial & Personal Fashion Stylist"
                error={errors.headline}
                required
              />
              <FormSelect
                label="Years of Experience"
                value={profileData.yearsExperience}
                onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                options={yearsExperienceOptions}
                placeholder="Select experience level"
                error={errors.yearsExperience}
                required
              />
            </div>
            
            <FormTextarea
              label="About Your Styling Approach"
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Describe your styling philosophy, approach to fashion, and what makes your work unique."
              error={errors.bio}
              required
            />

            <div style={styles.formGrid}>
              <FormTextarea
                label="Education & Training"
                value={profileData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="Fashion school, styling courses, workshops"
                minHeight="80px"
              />
              <FormTextarea
                label="Certifications"
                value={profileData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                placeholder="Color analysis certification, etc."
                minHeight="80px"
              />
            </div>
          </div>
        );

      case 3: // Styling Specializations
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>👗 Styling Specializations</h2>
            
            <FormCheckboxGroup
              label="Styling Types (Select all that apply)"
              options={stylingTypes}
              selectedValues={profileData.stylingTypes}
              onChange={(values) => handleArrayChange('stylingTypes', values)}
              error={errors.stylingTypes}
              columns={3}
            />

            <FormCheckboxGroup
              label="Client Types (Select all that apply)"
              options={clientTypes}
              selectedValues={profileData.clientTypes}
              onChange={(values) => handleArrayChange('clientTypes', values)}
              error={errors.clientTypes}
              columns={3}
            />

            <FormCheckboxGroup
              label="Fashion Categories"
              options={fashionCategories}
              selectedValues={profileData.fashionCategories}
              onChange={(values) => handleArrayChange('fashionCategories', values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Style Aesthetics"
              options={styleAesthetics}
              selectedValues={profileData.styleAesthetics}
              onChange={(values) => handleArrayChange('styleAesthetics', values)}
              columns={3}
            />
          </div>
        );

      case 4: // Services & Expertise
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💼 Services & Expertise</h2>
            
            <FormCheckboxGroup
              label="Services Offered (Select all that apply)"
              options={servicesOffered}
              selectedValues={profileData.servicesOffered}
              onChange={(values) => handleArrayChange('servicesOffered', values)}
              error={errors.servicesOffered}
              columns={3}
            />

            <FormCheckboxGroup
              label="Designer & Brand Knowledge"
              options={designerKnowledge}
              selectedValues={profileData.designerKnowledge}
              onChange={(values) => handleArrayChange('designerKnowledge', values)}
              columns={3}
            />

            <div style={styles.formGrid}>
              <FormTextarea
                label="Brand Relationships"
                value={profileData.brandRelationships}
                onChange={(e) => handleInputChange('brandRelationships', e.target.value)}
                placeholder="PR contacts, showroom access, etc."
                minHeight="80px"
              />
              <FormTextarea
                label="Trend Forecasting Experience"
                value={profileData.trendForecasting}
                onChange={(e) => handleInputChange('trendForecasting', e.target.value)}
                placeholder="Experience predicting fashion trends"
                minHeight="80px"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ 
                ...styles.booleanCheckbox,
                background: profileData.colorAnalysis ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <input
                  type="checkbox"
                  checked={profileData.colorAnalysis}
                  onChange={() => handleBooleanChange('colorAnalysis')}
                  style={{ marginRight: '10px' }}
                />
                I offer professional color analysis services
              </label>
              
              <label style={{ 
                ...styles.booleanCheckbox,
                background: profileData.bodyTypeExpertise ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <input
                  type="checkbox"
                  checked={profileData.bodyTypeExpertise}
                  onChange={() => handleBooleanChange('bodyTypeExpertise')}
                  style={{ marginRight: '10px' }}
                />
                I specialize in body type consultation
              </label>
            </div>
          </div>
        );

      case 5: // Business & Rates
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💰 Business & Rates</h2>
            
            <div style={styles.formGrid}>
              <FormInput
                label="Initial Consultation Rate"
                type="number"
                value={profileData.rates.consultation}
                onChange={(e) => handleInputChange('rates.consultation', e.target.value)}
                placeholder="150"
              />
              <FormInput
                label="Personal Styling Session Rate"
                type="number"
                value={profileData.rates.personalStyling}
                onChange={(e) => handleInputChange('rates.personalStyling', e.target.value)}
                placeholder="400"
              />
              <FormInput
                label="Editorial Day Rate"
                type="number"
                value={profileData.rates.editorialDay}
                onChange={(e) => handleInputChange('rates.editorialDay', e.target.value)}
                placeholder="800"
              />
              <FormInput
                label="Shopping Service Hourly Rate"
                type="number"
                value={profileData.rates.shoppingHourly}
                onChange={(e) => handleInputChange('rates.shoppingHourly', e.target.value)}
                placeholder="100"
              />
              <FormSelect
                label="Currency"
                value={profileData.rates.currency}
                onChange={(e) => handleInputChange('rates.currency', e.target.value)}
                options={currencyOptions}
                placeholder="Select currency"
              />
            </div>

            <FormTextarea
              label="Package Deals"
              value={profileData.rates.packageDeals}
              onChange={(e) => handleInputChange('rates.packageDeals', e.target.value)}
              placeholder="e.g., 'Wardrobe Overhaul: $2500 includes consultation, shopping, 3 sessions'"
              minHeight="80px"
            />

            <div style={styles.formGrid}>
              <FormTextarea
                label="Consultation Process"
                value={profileData.consultationProcess}
                onChange={(e) => handleInputChange('consultationProcess', e.target.value)}
                placeholder="Describe what clients can expect during consultations"
                minHeight="100px"
              />
              <FormSelect
                label="Availability"
                value={profileData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                options={availabilityOptions}
                placeholder="Select availability"
              />
              <FormSelect
                label="Travel Willingness"
                value={profileData.travelWillingness}
                onChange={(e) => handleInputChange('travelWillingness', e.target.value)}
                options={travelWillingnessOptions}
                placeholder="Select travel preference"
              />
            </div>

            <FormCheckboxGroup
              label="Work Environments"
              options={workEnvironments}
              selectedValues={profileData.workEnvironments}
              onChange={(values) => handleArrayChange('workEnvironments', values)}
              columns={3}
            />

            <FormTextarea
              label="Collaboration Style"
              value={profileData.collaborationStyle}
              onChange={(e) => handleInputChange('collaborationStyle', e.target.value)}
              placeholder="Describe your working style and approach to collaborating with clients and teams"
              minHeight="80px"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '25px' }}>
              <label style={{ 
                ...styles.booleanCheckbox,
                background: profileData.shoppingServices ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <input
                  type="checkbox"
                  checked={profileData.shoppingServices}
                  onChange={() => handleBooleanChange('shoppingServices')}
                  style={{ marginRight: '10px' }}
                />
                I offer personal shopping services
              </label>
              
              <label style={{ 
                ...styles.booleanCheckbox,
                background: profileData.wardrobeAudit ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <input
                  type="checkbox"
                  checked={profileData.wardrobeAudit}
                  onChange={() => handleBooleanChange('wardrobeAudit')}
                  style={{ marginRight: '10px' }}
                />
                I provide wardrobe audit services
              </label>
              
              <label style={{ 
                ...styles.booleanCheckbox,
                background: profileData.closetOrganization ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <input
                  type="checkbox"
                  checked={profileData.closetOrganization}
                  onChange={() => handleBooleanChange('closetOrganization')}
                  style={{ marginRight: '10px' }}
                />
                I offer closet organization services
              </label>
            </div>
          </div>
        );

      case 6: // Portfolio & Social Media
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>📸 Portfolio & Social Media</h2>
            
            <div style={styles.formGrid}>
              <FormInput
                label="Portfolio Website"
                type="url"
                value={profileData.portfolioWebsite}
                onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                placeholder="https://yourportfolio.com"
                error={errors.portfolioWebsite}
                required
              />
              <FormInput
                label="Instagram"
                value={profileData.socialMedia.instagram}
                onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                placeholder="@yourstyling"
              />
              <FormInput
                label="Pinterest"
                value={profileData.socialMedia.pinterest}
                onChange={(e) => handleInputChange('socialMedia.pinterest', e.target.value)}
                placeholder="Pinterest URL"
              />
              <FormInput
                label="LinkedIn"
                type="url"
                value={profileData.socialMedia.linkedin}
                onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                placeholder="LinkedIn URL"
              />
              <FormInput
                label="Blog/Website"
                type="url"
                value={profileData.socialMedia.blog}
                onChange={(e) => handleInputChange('socialMedia.blog', e.target.value)}
                placeholder="Blog URL"
              />
              <FormInput
                label="TikTok"
                value={profileData.socialMedia.tiktok}
                onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                placeholder="@yourtiktok"
              />
            </div>

            <div style={styles.formGrid}>
              <FormTextarea
                label="Editorial Work"
                value={profileData.editorialWork}
                onChange={(e) => handleInputChange('editorialWork', e.target.value)}
                placeholder="Describe your editorial styling work, publications, campaigns"
                minHeight="100px"
              />
              <FormTextarea
                label="Brand Collaborations"
                value={profileData.brandCollaborations}
                onChange={(e) => handleInputChange('brandCollaborations', e.target.value)}
                placeholder="Notable brand partnerships and collaborations"
                minHeight="100px"
              />
              <FormTextarea
                label="Celebrity Clients"
                value={profileData.celebrityClients}
                onChange={(e) => handleInputChange('celebrityClients', e.target.value)}
                placeholder="High-profile clients you've worked with (if comfortable sharing)"
                minHeight="80px"
              />
              <FormTextarea
                label="Publications"
                value={profileData.publications}
                onChange={(e) => handleInputChange('publications', e.target.value)}
                placeholder="Magazines, blogs, websites where your work has been featured"
                minHeight="80px"
              />
            </div>
          </div>
        );

      case 7: // Review & Submit
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✅ Review & Submit</h2>
            <Card>
              <h3 style={{ color: '#a55eea', marginBottom: '15px' }}>Stylist Profile Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Name:</strong> {profileData.fullName}<br/>
                  <strong>Location:</strong> {profileData.location}<br/>
                  <strong>Experience:</strong> {
                    yearsExperienceOptions.find(option => option.value === profileData.yearsExperience)?.label || 
                    profileData.yearsExperience
                  }<br/>
                  <strong>Color Analysis:</strong> {profileData.colorAnalysis ? 'Yes' : 'No'}<br/>
                  <strong>Body Type Expertise:</strong> {profileData.bodyTypeExpertise ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Specializations:</strong> {profileData.stylingTypes.slice(0, 3).join(', ')}{profileData.stylingTypes.length > 3 ? '...' : ''}<br/>
                  <strong>Client Types:</strong> {profileData.clientTypes.slice(0, 3).join(', ')}{profileData.clientTypes.length > 3 ? '...' : ''}<br/>
                  <strong>Services:</strong> {profileData.servicesOffered.length} offerings<br/>
                  <strong>Consultation Rate:</strong> ${profileData.rates.consultation || 'TBD'}<br/>
                  <strong>Portfolio:</strong> {profileData.portfolioWebsite || 'Not provided'}
                </div>
              </div>
              
              {profileData.bio && (
                <div style={{ marginTop: '15px' }}>
                  <p style={{ color: '#ddd', fontSize: '14px' }}>
                    <strong>Bio:</strong> {profileData.bio.slice(0, 200)}
                    {profileData.bio.length > 200 && '...'}
                  </p>
                </div>
              )}
            </Card>
            
            <Card style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>👗 Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After submitting your profile, you'll be redirected to your dashboard where you can:
                <br/>• Upload portfolio photos and before/after styling examples
                <br/>• Browse and apply for styling projects
                <br/>• Connect with models, photographers, and brands
                <br/>• Manage your bookings and client consultations
              </p>
            </Card>

            {message && (
              <Notification
                type={messageType}
                message={message}
                onClose={() => { setMessage(''); setMessageType(''); }}
              />
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
              👗 Fashion Stylist Setup
            </h1>
            <Button 
              type="secondary"
              onClick={onLogout}
            >
              Logout
            </Button>
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
          {message && currentStep < 7 && (
            <Notification
              type={messageType}
              message={message}
              onClose={() => { setMessage(''); setMessageType(''); }}
            />
          )}
          
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <Button
            type="secondary"
            onClick={prevStep}
            disabled={currentStep === 1}
            style={{
              opacity: currentStep === 1 ? 0.5 : 1,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous
          </Button>

          <div style={{ color: 'white', fontSize: '14px' }}>
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < steps.length ? (
            <Button
              type="primary"
              onClick={nextStep}
            >
              Next →
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={16} style={{ display: 'inline-block', marginRight: '10px' }} />
                  Creating Profile...
                </>
              ) : 'Complete Profile ✨'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StylistProfileSetup;