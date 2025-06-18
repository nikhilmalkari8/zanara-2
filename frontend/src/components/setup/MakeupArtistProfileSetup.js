// src/components/setup/MakeupArtistProfileSetup.js
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

const MakeupArtistProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
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

  // Form validation and state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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

  // Option arrays
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

  const yearsExperienceOptions = [
    { value: '0-1', label: '0-1 years' },
    { value: '2-3', label: '2-3 years' },
    { value: '4-6', label: '4-6 years' },
    { value: '7-10', label: '7-10 years' },
    { value: '10+', label: '10+ years' }
  ];

  const availabilityOptions = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'freelance', label: 'Freelance/Project Based' },
    { value: 'weekends-only', label: 'Weekends Only' },
    { value: 'seasonal', label: 'Seasonal' }
  ];

  const travelRadiusOptions = [
    { value: 'local-only', label: 'Local Only (0-25 miles)' },
    { value: 'regional', label: 'Regional (25-100 miles)' },
    { value: 'state-wide', label: 'State-wide' },
    { value: 'national', label: 'National' },
    { value: 'international', label: 'International' }
  ];

  const bookingAdvanceOptions = [
    { value: 'same-day', label: 'Same Day' },
    { value: '1-3-days', label: '1-3 Days' },
    { value: '1-week', label: '1 Week' },
    { value: '2-weeks', label: '2 Weeks' },
    { value: '1-month', label: '1 Month+' }
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
      
      case 3: // Makeup Specializations
        if (profileData.makeupTypes.length === 0) {
          stepErrors.makeupTypes = 'Select at least one makeup type';
        }
        if (profileData.techniques.length === 0) {
          stepErrors.techniques = 'Select at least one technique';
        }
        if (profileData.clientTypes.length === 0) {
          stepErrors.clientTypes = 'Select at least one client type';
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
    const finalErrors = validateStep(3); // Validate key requirements
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
        setMessage('Makeup artist profile created successfully! Redirecting to dashboard...');
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
      background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
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
                placeholder="e.g., Professional Bridal Makeup Artist"
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
              label="About You"
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about your passion for makeup artistry, your style, and what makes you unique..."
              error={errors.bio}
              required
            />

            <div style={styles.formGrid}>
              <FormTextarea
                label="Education & Training"
                value={profileData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="List your makeup schools, courses, workshops, or relevant education..."
                minHeight="80px"
              />
              <FormTextarea
                label="Certifications"
                value={profileData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                placeholder="List any professional certifications or awards..."
                minHeight="80px"
              />
            </div>
          </div>
        );

      case 3: // Makeup Specializations
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💄 Makeup Specializations</h2>
            
            <FormCheckboxGroup
              label="Makeup Types (Select all that apply)"
              options={makeupTypes}
              selectedValues={profileData.makeupTypes}
              onChange={(values) => handleArrayChange('makeupTypes', values)}
              error={errors.makeupTypes}
              columns={3}
            />

            <FormCheckboxGroup
              label="Techniques (Select all that apply)"
              options={techniques}
              selectedValues={profileData.techniques}
              onChange={(values) => handleArrayChange('techniques', values)}
              error={errors.techniques}
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
          </div>
        );

      case 4: // Skills & Expertise
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🎨 Skills & Expertise</h2>
            
            <FormCheckboxGroup
              label="Special Skills"
              options={specialSkills}
              selectedValues={profileData.specialSkills}
              onChange={(values) => handleArrayChange('specialSkills', values)}
              columns={3}
            />

            <div style={styles.checkboxContainer}>
              <label style={{ 
                ...styles.booleanCheckbox,
                background: profileData.colorTheoryExpertise ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <input
                  type="checkbox"
                  checked={profileData.colorTheoryExpertise}
                  onChange={() => handleBooleanChange('colorTheoryExpertise')}
                  style={{ marginRight: '10px' }}
                />
                Color Theory Expert
              </label>
            </div>

            <FormCheckboxGroup
              label="Skin Type Expertise"
              options={skinTypeExpertise}
              selectedValues={profileData.skinTypeExpertise}
              onChange={(values) => handleArrayChange('skinTypeExpertise', values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Age Group Expertise"
              options={ageGroupExpertise}
              selectedValues={profileData.ageGroupExpertise}
              onChange={(values) => handleArrayChange('ageGroupExpertise', values)}
              columns={3}
            />
          </div>
        );

      case 5: // Products & Kit Information
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💎 Products & Kit Information</h2>
            
            <FormCheckboxGroup
              label="Preferred Brands"
              options={preferredBrands}
              selectedValues={profileData.preferredBrands}
              onChange={(values) => handleArrayChange('preferredBrands', values)}
              columns={4}
            />

            <FormCheckboxGroup
              label="Product Types in Your Kit"
              options={productTypes}
              selectedValues={profileData.productTypes}
              onChange={(values) => handleArrayChange('productTypes', values)}
              columns={3}
            />

            <div style={styles.formGrid}>
              <FormTextarea
                label="Kit Information"
                value={profileData.kitInformation}
                onChange={(e) => handleInputChange('kitInformation', e.target.value)}
                placeholder="Describe your makeup kit, special tools, and professional equipment..."
                minHeight="100px"
              />
              <FormTextarea
                label="Hygiene Standards"
                value={profileData.hygieneStandards}
                onChange={(e) => handleInputChange('hygieneStandards', e.target.value)}
                placeholder="Describe your sanitation practices and safety protocols..."
                minHeight="100px"
              />
            </div>
          </div>
        );

      case 6: // Business & Rates
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💰 Business & Rates</h2>
            
            <div style={styles.checkboxContainer}>
              <label style={{ 
                ...styles.booleanCheckbox,
                background: profileData.mobileServices ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <input
                  type="checkbox"
                  checked={profileData.mobileServices}
                  onChange={() => handleBooleanChange('mobileServices')}
                  style={{ marginRight: '10px' }}
                />
                I offer mobile services (travel to clients)
              </label>
            </div>

            <div style={styles.formGrid}>
              <FormInput
                label="Studio Access"
                value={profileData.studioAccess}
                onChange={(e) => handleInputChange('studioAccess', e.target.value)}
                placeholder="Describe your studio or workspace access..."
              />
              <FormSelect
                label="Availability"
                value={profileData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                options={availabilityOptions}
                placeholder="Select availability"
              />
              <FormSelect
                label="Travel Radius"
                value={profileData.travelRadius}
                onChange={(e) => handleInputChange('travelRadius', e.target.value)}
                options={travelRadiusOptions}
                placeholder="Select travel radius"
              />
              <FormSelect
                label="Booking Advance Notice"
                value={profileData.bookingAdvance}
                onChange={(e) => handleInputChange('bookingAdvance', e.target.value)}
                options={bookingAdvanceOptions}
                placeholder="Select booking advance"
              />
            </div>

            <FormCheckboxGroup
              label="Equipment Owned"
              options={equipmentOwned}
              selectedValues={profileData.equipmentOwned}
              onChange={(values) => handleArrayChange('equipmentOwned', values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Work Environments"
              options={workEnvironments}
              selectedValues={profileData.workEnvironments}
              onChange={(values) => handleArrayChange('workEnvironments', values)}
              columns={3}
            />

            <h4 style={{ color: 'white', marginBottom: '15px', marginTop: '30px' }}>Service Rates</h4>
            
            <div style={styles.formGrid}>
              <FormInput
                label="Bridal Rate"
                type="number"
                value={profileData.rates.bridal}
                onChange={(e) => handleInputChange('rates.bridal', e.target.value)}
                placeholder="150"
              />
              <FormInput
                label="Photoshoot Rate"
                type="number"
                value={profileData.rates.photoshoot}
                onChange={(e) => handleInputChange('rates.photoshoot', e.target.value)}
                placeholder="100"
              />
              <FormInput
                label="Special Event Rate"
                type="number"
                value={profileData.rates.special_event}
                onChange={(e) => handleInputChange('rates.special_event', e.target.value)}
                placeholder="75"
              />
              <FormInput
                label="Lesson Rate"
                type="number"
                value={profileData.rates.lesson}
                onChange={(e) => handleInputChange('rates.lesson', e.target.value)}
                placeholder="50"
              />
              <FormInput
                label="Consultation Rate"
                type="number"
                value={profileData.rates.consultation}
                onChange={(e) => handleInputChange('rates.consultation', e.target.value)}
                placeholder="40"
              />
              <FormSelect
                label="Currency"
                value={profileData.rates.currency}
                onChange={(e) => handleInputChange('rates.currency', e.target.value)}
                options={currencyOptions}
                placeholder="Select currency"
              />
            </div>
          </div>
        );

      case 7: // Portfolio & Social Media
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
              />
              <FormInput
                label="Instagram"
                value={profileData.socialMedia.instagram}
                onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                placeholder="@yourusername or full URL"
              />
              <FormInput
                label="YouTube"
                value={profileData.socialMedia.youtube}
                onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                placeholder="YouTube channel URL"
              />
              <FormInput
                label="TikTok"
                value={profileData.socialMedia.tiktok}
                onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                placeholder="@yourusername or full URL"
              />
              <FormInput
                label="Facebook"
                value={profileData.socialMedia.facebook}
                onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                placeholder="Facebook page URL"
              />
              <FormInput
                label="Blog/Website"
                type="url"
                value={profileData.socialMedia.blog}
                onChange={(e) => handleInputChange('socialMedia.blog', e.target.value)}
                placeholder="Your blog or website URL"
              />
            </div>

            <div style={styles.formGrid}>
              <FormTextarea
                label="Notable Work"
                value={profileData.notableWork}
                onChange={(e) => handleInputChange('notableWork', e.target.value)}
                placeholder="Describe your most notable projects, collaborations, or achievements..."
                minHeight="100px"
              />
              <FormTextarea
                label="Publication Features"
                value={profileData.publicationFeatures}
                onChange={(e) => handleInputChange('publicationFeatures', e.target.value)}
                placeholder="List any magazines, blogs, or publications that have featured your work..."
                minHeight="100px"
              />
            </div>

            <FormTextarea
              label="Competitions & Awards"
              value={profileData.competitions}
              onChange={(e) => handleInputChange('competitions', e.target.value)}
              placeholder="List any makeup competitions, contests, or awards you've won..."
              minHeight="80px"
            />
          </div>
        );

      case 8: // Review & Submit
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✅ Review & Submit</h2>
            <Card>
              <h3 style={{ color: '#4ecdc4', marginBottom: '15px' }}>Makeup Artist Profile Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Name:</strong> {profileData.fullName}<br/>
                  <strong>Location:</strong> {profileData.location}<br/>
                  <strong>Experience:</strong> {
                    yearsExperienceOptions.find(option => option.value === profileData.yearsExperience)?.label || 
                    profileData.yearsExperience
                  }<br/>
                  <strong>Mobile Services:</strong> {profileData.mobileServices ? 'Yes' : 'No'}<br/>
                  <strong>Color Theory Expert:</strong> {profileData.colorTheoryExpertise ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Makeup Types:</strong> {profileData.makeupTypes.slice(0, 3).join(', ')}{profileData.makeupTypes.length > 3 ? '...' : ''}<br/>
                  <strong>Techniques:</strong> {profileData.techniques.length} techniques<br/>
                  <strong>Preferred Brands:</strong> {profileData.preferredBrands.length} brands<br/>
                  <strong>Equipment:</strong> {profileData.equipmentOwned.length} items<br/>
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
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>💄 Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After submitting your profile, you'll be redirected to your dashboard where you can:
                <br/>• Upload your makeup portfolio and before/after photos
                <br/>• Browse and apply for makeup artist opportunities
                <br/>• Connect with models, photographers, and clients
                <br/>• Manage your bookings and showcase your artistry
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
              💄 Makeup Artist Setup
            </h1>
            <Button 
              type="secondary"
              onClick={onLogout}
            >
              Logout
            </Button>
          </div>
          <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>
            Create your professional makeup artist profile to connect with clients and showcase your artistry
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
              ) : 'Complete Profile ✨'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakeupArtistProfileSetup;