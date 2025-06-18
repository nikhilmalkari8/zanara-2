// src/components/setup/AgencyProfileSetup.js
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

const AgencyProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Basic Information
    companyName: '',
    legalName: '',
    industry: 'modeling-agency',
    companyType: 'agency',
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
    
    // Agency Details
    foundedYear: '',
    companySize: '',
    agencyType: '',
    licenseNumber: '',
    
    // Agency Specializations
    agencyServices: [],
    talentTypes: [],
    industryFocus: [],
    clientTypes: [],
    
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
    services: []
  });

  // Form validation and state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const steps = [
    { number: 1, title: 'Agency Basics', icon: '🎭' },
    { number: 2, title: 'Contact & Location', icon: '📍' },
    { number: 3, title: 'Services & Talent', icon: '⭐' },
    { number: 4, title: 'Social & Culture', icon: '📱' },
    { number: 5, title: 'Review & Submit', icon: '✅' }
  ];

  // Option arrays
  const agencyTypes = [
    'Full-Service Modeling Agency',
    'Fashion Modeling Agency', 
    'Commercial Modeling Agency',
    'Talent Management Agency',
    'Casting Agency',
    'Boutique Agency',
    'Plus-Size Modeling Agency',
    'Child Modeling Agency',
    'Fitness Modeling Agency',
    'Hand/Parts Modeling Agency'
  ];

  const agencyServices = [
    'Model Representation', 'Talent Scouting', 'Career Development',
    'Portfolio Development', 'Casting Services', 'Event Planning',
    'Brand Partnerships', 'Social Media Management', 'PR Services',
    'Training & Workshops', 'Contract Negotiation', 'International Placements'
  ];

  const talentTypes = [
    'Fashion Models', 'Commercial Models', 'Runway Models',
    'Print Models', 'Plus-Size Models', 'Petite Models',
    'Fitness Models', 'Hand Models', 'Child Models',
    'Senior Models', 'Alternative Models', 'Influencers',
    'Actors', 'Dancers', 'Musicians', 'Voice Talent'
  ];

  const industryFocus = [
    'High Fashion', 'Commercial Fashion', 'Beauty & Cosmetics',
    'Fitness & Athletic', 'Lifestyle', 'Luxury Brands',
    'E-commerce', 'Advertising', 'Editorial', 'Catalog',
    'Automotive', 'Technology', 'Food & Beverage', 'Travel'
  ];

  const clientTypes = [
    'Fashion Brands', 'Beauty Brands', 'Advertising Agencies',
    'Photographers', 'Fashion Magazines', 'E-commerce Companies',
    'Luxury Brands', 'Retail Companies', 'Casting Directors',
    'Production Companies', 'Event Planners', 'PR Agencies'
  ];

  const companySizeOptions = [
    { value: '1-5', label: '1-5 employees' },
    { value: '6-15', label: '6-15 employees' },
    { value: '16-50', label: '16-50 employees' },
    { value: '51+', label: '51+ employees' }
  ];

  const agencyTypeOptions = agencyTypes.map(type => ({ value: type, label: type }));

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

  const handleValuesChange = (value) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v);
    setProfileData(prev => ({
      ...prev,
      values: values
    }));
  };

  const handleBenefitsChange = (value) => {
    const benefits = value.split(',').map(b => b.trim()).filter(b => b);
    setProfileData(prev => ({
      ...prev,
      benefits: benefits
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
      case 1: // Agency Basics
        if (!profileData.companyName || profileData.companyName.trim() === '') {
          stepErrors.companyName = 'Agency name is required';
        }
        if (!profileData.agencyType) {
          stepErrors.agencyType = 'Agency type is required';
        }
        if (!profileData.description || profileData.description.trim() === '') {
          stepErrors.description = 'Agency description is required';
        }
        break;
      
      case 2: // Contact & Location
        if (!profileData.email || !/^\S+@\S+\.\S+$/.test(profileData.email)) {
          stepErrors.email = 'Valid email is required';
        }
        if (!profileData.phone) {
          stepErrors.phone = 'Phone number is required';
        }
        if (!profileData.address.street) {
          stepErrors['address.street'] = 'Street address is required';
        }
        if (!profileData.address.city) {
          stepErrors['address.city'] = 'City is required';
        }
        if (!profileData.address.state) {
          stepErrors['address.state'] = 'State is required';
        }
        if (!profileData.address.country) {
          stepErrors['address.country'] = 'Country is required';
        }
        if (!profileData.address.zipCode) {
          stepErrors['address.zipCode'] = 'ZIP code is required';
        }
        break;
      
      case 3: // Services & Talent
        if (profileData.agencyServices.length === 0) {
          stepErrors.agencyServices = 'Select at least one agency service';
        }
        if (profileData.talentTypes.length === 0) {
          stepErrors.talentTypes = 'Select at least one talent type';
        }
        break;
      
      default:
        // No validation for other steps
        break;
    }
    
    return stepErrors;
  };

  // Submit profile - note this uses a different API endpoint for company creation
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
      // Prepare the data for submission
      const submissionData = {
        ...profileData,
        // Convert foundedYear to number if provided
        foundedYear: profileData.foundedYear ? parseInt(profileData.foundedYear) : undefined
      };

      // Note: Using company/create endpoint instead of profileService
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/company/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Agency profile created successfully! Redirecting to dashboard...');
        setMessageType('success');
        setTimeout(() => {
          onProfileComplete();
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to create agency profile');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
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
      gap: '20px',
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
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Agency Basics
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🎭 Agency Basics</h2>
            <div style={styles.formGrid}>
              <FormInput
                label="Agency Name"
                value={profileData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter your agency name"
                error={errors.companyName}
                required
              />
              <FormInput
                label="Legal Company Name"
                value={profileData.legalName}
                onChange={(e) => handleInputChange('legalName', e.target.value)}
                placeholder="Legal business name"
              />
              <FormSelect
                label="Agency Type"
                value={profileData.agencyType}
                onChange={(e) => handleInputChange('agencyType', e.target.value)}
                options={agencyTypeOptions}
                placeholder="Select Agency Type"
                error={errors.agencyType}
                required
              />
              <FormInput
                label="Tagline"
                value={profileData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="Your agency's tagline or motto"
              />
            </div>
            
            <FormTextarea
              label="Agency Description"
              value={profileData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your agency, mission, and what makes you unique..."
              error={errors.description}
              required
              minHeight="120px"
            />

            <div style={styles.formGrid}>
              <FormInput
                label="Founded Year"
                type="number"
                value={profileData.foundedYear}
                onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
              />
              <FormSelect
                label="Agency Size"
                value={profileData.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                options={companySizeOptions}
                placeholder="Select Size"
              />
              <FormInput
                label="License Number"
                value={profileData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Agency license or registration number (if applicable)"
              />
            </div>
          </div>
        );

      case 2: // Contact & Location
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>📍 Contact & Location</h2>
            <div style={styles.formGrid}>
              <FormInput
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="agency@example.com"
                error={errors.email}
                required
              />
              <FormInput
                label="Phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                error={errors.phone}
                required
              />
              <FormInput
                label="Website"
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://youragency.com"
              />
            </div>

            <h3 style={{ color: 'white', marginTop: '30px', marginBottom: '20px' }}>Office Address</h3>
            
            <FormInput
              label="Street Address"
              value={profileData.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              placeholder="123 Talent Avenue"
              error={errors['address.street']}
              required
            />

            <div style={styles.formGrid}>
              <FormInput
                label="City"
                value={profileData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                placeholder="Los Angeles"
                error={errors['address.city']}
                required
              />
              <FormInput
                label="State/Province"
                value={profileData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                placeholder="CA"
                error={errors['address.state']}
                required
              />
              <FormInput
                label="ZIP/Postal Code"
                value={profileData.address.zipCode}
                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                placeholder="90210"
                error={errors['address.zipCode']}
                required
              />
            </div>

            <FormInput
              label="Country"
              value={profileData.address.country}
              onChange={(e) => handleInputChange('address.country', e.target.value)}
              placeholder="United States"
              error={errors['address.country']}
              required
            />
          </div>
        );

      case 3: // Services & Talent
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>⭐ Services & Talent</h2>
            
            <FormCheckboxGroup
              label="Agency Services (Select all that apply)"
              options={agencyServices}
              selectedValues={profileData.agencyServices}
              onChange={(values) => handleArrayChange('agencyServices', values)}
              error={errors.agencyServices}
              columns={3}
            />

            <FormCheckboxGroup
              label="Talent Types We Represent (Select all that apply)"
              options={talentTypes}
              selectedValues={profileData.talentTypes}
              onChange={(values) => handleArrayChange('talentTypes', values)}
              error={errors.talentTypes}
              columns={3}
            />

            <FormCheckboxGroup
              label="Industry Focus"
              options={industryFocus}
              selectedValues={profileData.industryFocus}
              onChange={(values) => handleArrayChange('industryFocus', values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Client Types"
              options={clientTypes}
              selectedValues={profileData.clientTypes}
              onChange={(values) => handleArrayChange('clientTypes', values)}
              columns={3}
            />
          </div>
        );

      case 4: // Social Media & Culture
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>📱 Social Media & Culture</h2>
            
            <h3 style={{ color: '#ddd', marginBottom: '20px' }}>Social Media Presence</h3>
            <div style={styles.formGrid}>
              <FormInput
                label="Instagram"
                value={profileData.socialMedia.instagram}
                onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                placeholder="@youragency"
              />
              <FormInput
                label="LinkedIn"
                type="url"
                value={profileData.socialMedia.linkedin}
                onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                placeholder="LinkedIn company page URL"
              />
              <FormInput
                label="Facebook"
                value={profileData.socialMedia.facebook}
                onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                placeholder="Facebook page URL"
              />
              <FormInput
                label="Twitter/X"
                value={profileData.socialMedia.twitter}
                onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                placeholder="@youragency"
              />
              <FormInput
                label="YouTube"
                type="url"
                value={profileData.socialMedia.youtube}
                onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                placeholder="YouTube channel URL"
              />
            </div>
            
            <h3 style={{ color: '#ddd', marginTop: '30px', marginBottom: '20px' }}>Agency Culture & Values</h3>
            
            <FormTextarea
              label="Agency Culture & Values"
              value={profileData.culture}
              onChange={(e) => handleInputChange('culture', e.target.value)}
              placeholder="Describe your agency culture, values, and what makes working with you special..."
              minHeight="100px"
            />
            
            <FormInput
              label="Core Values"
              value={profileData.values.join(', ')}
              onChange={(e) => handleValuesChange(e.target.value)}
              placeholder="Integrity, Excellence, Diversity, Innovation (comma separated)"
            />
            
            <FormInput
              label="Benefits for Talent"
              value={profileData.benefits.join(', ')}
              onChange={(e) => handleBenefitsChange(e.target.value)}
              placeholder="Career Development, Training, International Opportunities, Health Insurance (comma separated)"
            />
          </div>
        );

      case 5: // Review & Submit
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✅ Review & Submit</h2>
            <Card>
              <h3 style={{ color: '#feca57', marginBottom: '15px' }}>Agency Profile Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Agency:</strong> {profileData.companyName}<br/>
                  <strong>Type:</strong> {profileData.agencyType}<br/>
                  <strong>Location:</strong> {profileData.address.city}, {profileData.address.state}<br/>
                  <strong>Founded:</strong> {profileData.foundedYear || 'Not specified'}<br/>
                  <strong>Size:</strong> {
                    companySizeOptions.find(option => option.value === profileData.companySize)?.label || 
                    'Not specified'
                  }
                </div>
                <div>
                  <strong>Website:</strong> {profileData.website || 'Not specified'}<br/>
                  <strong>Services:</strong> {profileData.agencyServices.slice(0, 3).join(', ')}{profileData.agencyServices.length > 3 ? '...' : ''}<br/>
                  <strong>Talent Types:</strong> {profileData.talentTypes.slice(0, 3).join(', ')}{profileData.talentTypes.length > 3 ? '...' : ''}<br/>
                  <strong>Industry Focus:</strong> {profileData.industryFocus.slice(0, 3).join(', ')}{profileData.industryFocus.length > 3 ? '...' : ''}<br/>
                  <strong>Client Types:</strong> {profileData.clientTypes.slice(0, 3).join(', ')}{profileData.clientTypes.length > 3 ? '...' : ''}
                </div>
              </div>
              
              {profileData.description && (
                <div style={{ marginTop: '15px' }}>
                  <p style={{ color: '#ddd', fontSize: '14px' }}>
                    <strong>Description:</strong> {profileData.description.slice(0, 200)}
                    {profileData.description.length > 200 && '...'}
                  </p>
                </div>
              )}
            </Card>
            
            <Card style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>🎭 Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After creating your agency profile, you'll be redirected to your dashboard where you can:
                <br/>• Add your talent roster and manage models
                <br/>• Post casting calls and job opportunities
                <br/>• Connect with brands, photographers, and clients
                <br/>• Manage talent applications and bookings
                <br/>• Build your agency's industry presence and reputation
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
              🎭 Agency Profile Setup
            </h1>
            <Button 
              type="secondary"
              onClick={onLogout}
            >
              Logout
            </Button>
          </div>
          <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>
            Create your talent agency profile to connect with models, talent, and industry professionals
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
          {message && currentStep < 5 && (
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
              ) : 'Complete Agency Profile ✨'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgencyProfileSetup;