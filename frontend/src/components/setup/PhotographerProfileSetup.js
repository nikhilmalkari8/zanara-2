// src/components/setup/PhotographerProfileSetup.js
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

  // Form validation and state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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

  // Option arrays
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

  const yearsExperienceOptions = [
    { value: '0-1', label: '0-1 years (Beginner)' },
    { value: '2-3', label: '2-3 years (Developing)' },
    { value: '4-6', label: '4-6 years (Experienced)' },
    { value: '7-10', label: '7-10 years (Professional)' },
    { value: '10+', label: '10+ years (Expert)' }
  ];

  const studioAccessOptions = [
    { value: 'own-studio', label: 'I own my studio' },
    { value: 'rent-studio', label: 'I rent studio space' },
    { value: 'partner-studios', label: 'I have partner studios' },
    { value: 'location-only', label: 'Location shoots only' },
    { value: 'client-studio', label: 'I work in client studios' }
  ];

  const travelRadiusOptions = [
    { value: 'local-30', label: 'Local only (30 miles)' },
    { value: 'regional-100', label: 'Regional (100 miles)' },
    { value: 'state-wide', label: 'State-wide' },
    { value: 'national', label: 'National' },
    { value: 'international', label: 'International' }
  ];

  const availabilityOptions = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'freelance', label: 'Freelance/Project Based' },
    { value: 'weekends-only', label: 'Weekends Only' },
    { value: 'seasonal', label: 'Seasonal' }
  ];

  const preferredProjectOptions = [
    'Fashion Editorials', 'Commercial Campaigns', 'Portrait Sessions',
    'Product Photography', 'Event Coverage', 'Brand Content',
    'Social Media Content', 'Lookbooks', 'E-commerce', 'Art Projects'
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

  const handlePackagesChange = (value) => {
    const packages = value.split('\n').filter(p => p.trim());
    setProfileData(prev => ({
      ...prev,
      packagesOffered: packages
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
      
      case 3: // Photography Specializations
        if (profileData.photographyTypes.length === 0) {
          stepErrors.photographyTypes = 'Select at least one photography type';
        }
        if (profileData.styles.length === 0) {
          stepErrors.styles = 'Select at least one photography style';
        }
        if (profileData.clientTypes.length === 0) {
          stepErrors.clientTypes = 'Select at least one client type';
        }
        break;
      
      case 4: // Equipment & Skills
        if (profileData.cameraEquipment.length === 0) {
          stepErrors.cameraEquipment = 'Select at least one camera';
        }
        if (profileData.lensCollection.length === 0) {
          stepErrors.lensCollection = 'Select at least one lens type';
        }
        if (profileData.lightingEquipment.length === 0) {
          stepErrors.lightingEquipment = 'Select at least one lighting option';
        }
        break;
      
      case 5: // Business Setup
        if (!profileData.studioAccess) {
          stepErrors.studioAccess = 'Studio access information is required';
        }
        if (!profileData.travelRadius) {
          stepErrors.travelRadius = 'Travel radius is required';
        }
        break;
      
      case 7: // Portfolio & Social
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
    const finalErrors = validateStep(7); // Validate key requirements
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
        setMessage('Photography profile created successfully! Redirecting to dashboard...');
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
              <FormInput
                label="Professional Website"
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourphotography.com"
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
                placeholder="e.g., Fashion & Portrait Photographer"
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
              label="About You & Your Photography"
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Describe your photography style, approach, and what sets you apart. Include your artistic vision and professional philosophy."
              error={errors.bio}
              required
            />

            <div style={styles.formGrid}>
              <FormTextarea
                label="Education Background"
                value={profileData.educationBackground}
                onChange={(e) => handleInputChange('educationBackground', e.target.value)}
                placeholder="Photography school, art degree, workshops, masterclasses, etc."
                minHeight="80px"
              />
              <FormTextarea
                label="Certifications"
                value={profileData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                placeholder="Professional certifications, photography associations, etc."
                minHeight="80px"
              />
            </div>
          </div>
        );

      case 3: // Photography Specializations
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>📸 Photography Specializations</h2>
            
            <FormCheckboxGroup
              label="Photography Types (Select all that apply)"
              options={photographyTypes}
              selectedValues={profileData.photographyTypes}
              onChange={(values) => handleArrayChange('photographyTypes', values)}
              error={errors.photographyTypes}
              columns={3}
            />

            <FormCheckboxGroup
              label="Photography Styles (Select all that apply)"
              options={photographyStyles}
              selectedValues={profileData.styles}
              onChange={(values) => handleArrayChange('styles', values)}
              error={errors.styles}
              columns={3}
            />

            <FormCheckboxGroup
              label="Preferred Client Types (Select all that apply)"
              options={clientTypes}
              selectedValues={profileData.clientTypes}
              onChange={(values) => handleArrayChange('clientTypes', values)}
              error={errors.clientTypes}
              columns={3}
            />
          </div>
        );

      case 4: // Equipment & Technical Skills
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🛠️ Equipment & Technical Skills</h2>
            
            <FormCheckboxGroup
              label="Camera Equipment (Select all that apply)"
              options={cameraEquipment}
              selectedValues={profileData.cameraEquipment}
              onChange={(values) => handleArrayChange('cameraEquipment', values)}
              error={errors.cameraEquipment}
              columns={3}
            />

            <FormCheckboxGroup
              label="Lens Collection (Select all that apply)"
              options={lensTypes}
              selectedValues={profileData.lensCollection}
              onChange={(values) => handleArrayChange('lensCollection', values)}
              error={errors.lensCollection}
              columns={3}
            />

            <FormCheckboxGroup
              label="Lighting Equipment (Select all that apply)"
              options={lightingEquipment}
              selectedValues={profileData.lightingEquipment}
              onChange={(values) => handleArrayChange('lightingEquipment', values)}
              error={errors.lightingEquipment}
              columns={3}
            />

            <FormCheckboxGroup
              label="Editing Software"
              options={editingSoftware}
              selectedValues={profileData.editingSoftware}
              onChange={(values) => handleArrayChange('editingSoftware', values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Technical Skills"
              options={technicalSkills}
              selectedValues={profileData.technicalSkills}
              onChange={(values) => handleArrayChange('technicalSkills', values)}
              columns={3}
            />
          </div>
        );

      case 5: // Business Setup
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🏢 Business Setup</h2>
            
            <div style={styles.formGrid}>
              <FormSelect
                label="Studio Access"
                value={profileData.studioAccess}
                onChange={(e) => handleInputChange('studioAccess', e.target.value)}
                options={studioAccessOptions}
                placeholder="Select studio access"
                error={errors.studioAccess}
                required
              />
              <FormInput
                label="Studio Location"
                value={profileData.studioLocation}
                onChange={(e) => handleInputChange('studioLocation', e.target.value)}
                placeholder="Studio address or area"
              />
              <FormSelect
                label="Travel Radius"
                value={profileData.travelRadius}
                onChange={(e) => handleInputChange('travelRadius', e.target.value)}
                options={travelRadiusOptions}
                placeholder="Select travel preference"
                error={errors.travelRadius}
                required
              />
              <FormSelect
                label="Availability"
                value={profileData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                options={availabilityOptions}
                placeholder="Select availability"
              />
            </div>

            <div style={styles.checkboxContainer}>
              <label style={{ 
                ...styles.booleanCheckbox,
                background: profileData.mobileServices ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <input
                  type="checkbox"
                  checked={profileData.mobileServices}
                  onChange={(e) => handleInputChange('mobileServices', e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                I offer mobile photography services (on-location shoots)
              </label>
            </div>

            <FormCheckboxGroup
              label="Preferred Project Types"
              options={preferredProjectOptions}
              selectedValues={profileData.preferredProjectTypes}
              onChange={(values) => handleArrayChange('preferredProjectTypes', values)}
              columns={3}
            />

            <div style={styles.formGrid}>
              <FormTextarea
                label="Collaboration Style"
                value={profileData.collaborationStyle}
                onChange={(e) => handleInputChange('collaborationStyle', e.target.value)}
                placeholder="Describe your working style and approach to collaborating with teams..."
                minHeight="80px"
              />
              <FormTextarea
                label="Client Communication"
                value={profileData.clientCommunication}
                onChange={(e) => handleInputChange('clientCommunication', e.target.value)}
                placeholder="How do you prefer to communicate with clients during projects..."
                minHeight="80px"
              />
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
              <FormInput
                label="Portrait Session (Starting Rate)"
                type="number"
                value={profileData.rates.portraitSession}
                onChange={(e) => handleInputChange('rates.portraitSession', e.target.value)}
                placeholder="300"
              />
              <FormInput
                label="Fashion Shoot (Half Day)"
                type="number"
                value={profileData.rates.fashionShoot}
                onChange={(e) => handleInputChange('rates.fashionShoot', e.target.value)}
                placeholder="800"
              />
              <FormInput
                label="Commercial Day Rate"
                type="number"
                value={profileData.rates.commercialDay}
                onChange={(e) => handleInputChange('rates.commercialDay', e.target.value)}
                placeholder="1500"
              />
              <FormInput
                label="Editorial Day Rate"
                type="number"
                value={profileData.rates.editorialDay}
                onChange={(e) => handleInputChange('rates.editorialDay', e.target.value)}
                placeholder="1200"
              />
              <FormInput
                label="Event Hourly Rate"
                type="number"
                value={profileData.rates.eventHourly}
                onChange={(e) => handleInputChange('rates.eventHourly', e.target.value)}
                placeholder="150"
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
              label="Packages Offered"
              value={profileData.packagesOffered.join('\n')}
              onChange={(e) => handlePackagesChange(e.target.value)}
              placeholder="List your photography packages (one per line):
Basic Portrait Package - $300
Premium Fashion Shoot - $1200
Full Campaign Package - $3000"
              minHeight="120px"
            />
          </div>
        );

      case 7: // Portfolio & Social Media
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🌟 Portfolio & Social Media</h2>
            
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
                label="Business Instagram"
                value={profileData.instagramBusiness}
                onChange={(e) => handleInputChange('instagramBusiness', e.target.value)}
                placeholder="@yourphotography or full URL"
              />
              <FormInput
                label="Behance Portfolio"
                type="url"
                value={profileData.behancePortfolio}
                onChange={(e) => handleInputChange('behancePortfolio', e.target.value)}
                placeholder="https://behance.net/yourwork"
              />
              <FormInput
                label="LinkedIn Profile"
                type="url"
                value={profileData.linkedinProfile}
                onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
              />
              <FormInput
                label="Personal Instagram"
                value={profileData.socialMedia.instagram}
                onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                placeholder="@yourpersonal"
              />
              <FormInput
                label="Facebook Page"
                value={profileData.socialMedia.facebook}
                onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                placeholder="Facebook business page"
              />
              <FormInput
                label="Twitter/X"
                value={profileData.socialMedia.twitter}
                onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                placeholder="@yourusername"
              />
              <FormInput
                label="TikTok"
                value={profileData.socialMedia.tiktok}
                onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                placeholder="@yourusername"
              />
            </div>

            <div style={styles.formGrid}>
              <FormTextarea
                label="Publications & Features"
                value={profileData.publications}
                onChange={(e) => handleInputChange('publications', e.target.value)}
                placeholder="Magazines, blogs, websites where your work has been featured"
                minHeight="100px"
              />
              <FormTextarea
                label="Notable Clients"
                value={profileData.notableClients}
                onChange={(e) => handleInputChange('notableClients', e.target.value)}
                placeholder="Well-known clients, brands, celebrities you've worked with"
                minHeight="100px"
              />
            </div>

            <div style={styles.formGrid}>
              <FormTextarea
                label="Awards & Recognition"
                value={profileData.awards}
                onChange={(e) => handleInputChange('awards', e.target.value)}
                placeholder="Photography awards, competitions, industry recognition"
                minHeight="80px"
              />
              <FormTextarea
                label="Exhibitions"
                value={profileData.exhibitions}
                onChange={(e) => handleInputChange('exhibitions', e.target.value)}
                placeholder="Art galleries, photography exhibitions, shows"
                minHeight="80px"
              />
            </div>
          </div>
        );

      case 8: // Review & Submit
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✅ Review & Submit</h2>
            <Card>
              <h3 style={{ color: '#26de81', marginBottom: '15px' }}>Photography Profile Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Name:</strong> {profileData.fullName}<br/>
                  <strong>Location:</strong> {profileData.location}<br/>
                  <strong>Experience:</strong> {
                    yearsExperienceOptions.find(option => option.value === profileData.yearsExperience)?.label || 
                    profileData.yearsExperience
                  }<br/>
                  <strong>Studio Access:</strong> {
                    studioAccessOptions.find(option => option.value === profileData.studioAccess)?.label || 
                    profileData.studioAccess
                  }<br/>
                  <strong>Mobile Services:</strong> {profileData.mobileServices ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Specializations:</strong> {profileData.photographyTypes.slice(0, 3).join(', ')}{profileData.photographyTypes.length > 3 ? '...' : ''}<br/>
                  <strong>Styles:</strong> {profileData.styles.slice(0, 3).join(', ')}{profileData.styles.length > 3 ? '...' : ''}<br/>
                  <strong>Travel:</strong> {
                    travelRadiusOptions.find(option => option.value === profileData.travelRadius)?.label || 
                    profileData.travelRadius
                  }<br/>
                  <strong>Equipment:</strong> {profileData.cameraEquipment.length} cameras, {profileData.lensCollection.length} lenses<br/>
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
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>📸 Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After submitting your profile, you'll be redirected to your dashboard where you can:
                <br/>• Upload your best portfolio images
                <br/>• Browse and apply for photography projects
                <br/>• Connect with models, stylists, and brands
                <br/>• Manage your bookings and client relationships
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
              📸 Photography Profile Setup
            </h1>
            <Button 
              type="secondary"
              onClick={onLogout}
            >
              Logout
            </Button>
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
          {message && currentStep < 8 && (
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
              ) : 'Complete Profile 🚀'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotographerProfileSetup;