// src/components/setup/BrandProfileSetup.js
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

const BrandProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Basic Information
    companyName: '',
    legalName: '',
    industry: 'fashion',
    companyType: 'brand',
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
    
    // Company Details
    foundedYear: '',
    companySize: '',
    
    // Brand Specific
    brandValues: [],
    targetAudience: [],
    priceRange: '',
    brandAesthetic: [],
    
    // Social Media
    socialMedia: {
      linkedin: '',
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: '',
      tiktok: ''
    },
    
    // Company Culture
    values: [],
    culture: '',
    benefits: [],
    
    // Specializations
    specializations: [],
    services: [],
    clientTypes: []
  });

  // Form validation and state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const steps = [
    { number: 1, title: 'Brand Basics', icon: '🏢' },
    { number: 2, title: 'Contact & Location', icon: '📍' },
    { number: 3, title: 'Brand Identity', icon: '🎨' },
    { number: 4, title: 'Social & Culture', icon: '📱' },
    { number: 5, title: 'Review & Submit', icon: '✅' }
  ];

  // Option arrays
  const brandAesthetics = [
    'Minimalist', 'Luxury', 'Streetwear', 'Bohemian', 'Classic',
    'Avant-Garde', 'Sustainable', 'Athletic', 'Romantic', 'Edgy',
    'Vintage', 'Modern', 'Artisanal', 'Tech-Inspired', 'Natural'
  ];

  const targetAudiences = [
    'Gen Z (18-24)', 'Millennials (25-40)', 'Gen X (41-56)', 'Baby Boomers (57+)',
    'Fashion Enthusiasts', 'Luxury Consumers', 'Budget Conscious', 'Eco-Conscious',
    'Professional Women', 'Professional Men', 'Students', 'Athletes',
    'Urban Professionals', 'Creative Professionals', 'Entrepreneurs'
  ];

  const priceRangeOptions = [
    { value: 'budget', label: 'Budget Friendly ($-$$)' },
    { value: 'mid-range', label: 'Mid-Range ($$-$$$)' },
    { value: 'premium', label: 'Premium ($$$-$$$$)' },
    { value: 'luxury', label: 'Luxury ($$$$+)' }
  ];

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201+', label: '201+ employees' }
  ];

  const servicesOptions = [
    'Fashion Design', 'Product Development', 'Retail', 'E-commerce',
    'Wholesale', 'Custom Design', 'Brand Consulting', 'Manufacturing',
    'Private Label', 'Licensing', 'Digital Marketing', 'Brand Strategy'
  ];

  const clientTypesOptions = [
    'Direct Consumers', 'Retail Partners', 'Wholesale Buyers', 'Online Marketplaces',
    'Department Stores', 'Boutiques', 'Influencers', 'Celebrity Stylists',
    'Fashion Magazines', 'E-commerce Platforms'
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

  const handleBrandValuesChange = (value) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v);
    setProfileData(prev => ({
      ...prev,
      brandValues: values
    }));
  };

  const handleServicesChange = (values) => {
    setProfileData(prev => ({
      ...prev,
      services: values
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
      case 1: // Brand Basics
        if (!profileData.companyName || profileData.companyName.trim() === '') {
          stepErrors.companyName = 'Brand/Company name is required';
        }
        if (!profileData.description || profileData.description.trim() === '') {
          stepErrors.description = 'Brand description is required';
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
      
      case 3: // Brand Identity
        if (profileData.brandAesthetic.length === 0) {
          stepErrors.brandAesthetic = 'Select at least one brand aesthetic';
        }
        if (profileData.targetAudience.length === 0) {
          stepErrors.targetAudience = 'Select at least one target audience';
        }
        break;
      
      default:
        // No validation for other steps
        break;
    }
    
    return stepErrors;
  };

  // Submit profile - note this uses company/create endpoint like agencies
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
        setMessage('Brand profile created successfully! Redirecting to dashboard...');
        setMessageType('success');
        setTimeout(() => {
          onProfileComplete();
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to create brand profile');
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
      case 1: // Brand Basics
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🏢 Brand Basics</h2>
            <div style={styles.formGrid}>
              <FormInput
                label="Brand/Company Name"
                value={profileData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter your brand name"
                error={errors.companyName}
                required
              />
              <FormInput
                label="Legal Company Name"
                value={profileData.legalName}
                onChange={(e) => handleInputChange('legalName', e.target.value)}
                placeholder="Legal business name"
              />
              <FormInput
                label="Brand Tagline"
                value={profileData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="Your brand's memorable tagline"
              />
            </div>
            
            <FormTextarea
              label="Brand Description"
              value={profileData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your brand, mission, and what makes you unique..."
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
                label="Company Size"
                value={profileData.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                options={companySizeOptions}
                placeholder="Select Size"
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
                placeholder="brand@example.com"
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
                placeholder="https://yourbrand.com"
              />
            </div>

            <h3 style={{ color: 'white', marginTop: '30px', marginBottom: '20px' }}>Business Address</h3>
            
            <FormInput
              label="Street Address"
              value={profileData.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              placeholder="123 Fashion Avenue"
              error={errors['address.street']}
              required
            />

            <div style={styles.formGrid}>
              <FormInput
                label="City"
                value={profileData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                placeholder="New York"
                error={errors['address.city']}
                required
              />
              <FormInput
                label="State/Province"
                value={profileData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                placeholder="NY"
                error={errors['address.state']}
                required
              />
              <FormInput
                label="ZIP/Postal Code"
                value={profileData.address.zipCode}
                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                placeholder="10001"
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

      case 3: // Brand Identity
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🎨 Brand Identity</h2>
            
            <FormCheckboxGroup
              label="Brand Aesthetic (Select all that apply)"
              options={brandAesthetics}
              selectedValues={profileData.brandAesthetic}
              onChange={(values) => handleArrayChange('brandAesthetic', values)}
              error={errors.brandAesthetic}
              columns={3}
            />

            <FormCheckboxGroup
              label="Target Audience (Select all that apply)"
              options={targetAudiences}
              selectedValues={profileData.targetAudience}
              onChange={(values) => handleArrayChange('targetAudience', values)}
              error={errors.targetAudience}
              columns={3}
            />

            <div style={styles.formGrid}>
              <FormSelect
                label="Price Range"
                value={profileData.priceRange}
                onChange={(e) => handleInputChange('priceRange', e.target.value)}
                options={priceRangeOptions}
                placeholder="Select Price Range"
              />
            </div>

            <FormInput
              label="Brand Values"
              value={profileData.brandValues.join(', ')}
              onChange={(e) => handleBrandValuesChange(e.target.value)}
              placeholder="Sustainability, Quality, Innovation, Inclusivity (comma separated)"
            />

            <FormCheckboxGroup
              label="Services Offered"
              options={servicesOptions}
              selectedValues={profileData.services}
              onChange={(values) => handleServicesChange(values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Client Types"
              options={clientTypesOptions}
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
                placeholder="@yourbrand"
              />
              <FormInput
                label="TikTok"
                value={profileData.socialMedia.tiktok}
                onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                placeholder="@yourbrand"
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
                placeholder="@yourbrand"
              />
              <FormInput
                label="YouTube"
                type="url"
                value={profileData.socialMedia.youtube}
                onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                placeholder="YouTube channel URL"
              />
            </div>
            
            <h3 style={{ color: '#ddd', marginTop: '30px', marginBottom: '20px' }}>Company Culture & Values</h3>
            
            <FormTextarea
              label="Company Culture Description"
              value={profileData.culture}
              onChange={(e) => handleInputChange('culture', e.target.value)}
              placeholder="Describe your company culture, work environment, and values..."
              minHeight="100px"
            />

            <FormInput
              label="Employee Benefits"
              value={profileData.benefits.join(', ')}
              onChange={(e) => {
                const benefits = e.target.value.split(',').map(b => b.trim()).filter(b => b);
                setProfileData(prev => ({ ...prev, benefits }));
              }}
              placeholder="Health Insurance, Remote Work, Professional Development (comma separated)"
            />
          </div>
        );

      case 5: // Review & Submit
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✅ Review & Submit</h2>
            <Card>
              <h3 style={{ color: '#4ecdc4', marginBottom: '15px' }}>Brand Profile Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Brand:</strong> {profileData.companyName}<br/>
                  <strong>Location:</strong> {profileData.address.city}, {profileData.address.state}<br/>
                  <strong>Founded:</strong> {profileData.foundedYear || 'Not specified'}<br/>
                  <strong>Company Size:</strong> {
                    companySizeOptions.find(option => option.value === profileData.companySize)?.label || 
                    'Not specified'
                  }<br/>
                  <strong>Website:</strong> {profileData.website || 'Not specified'}
                </div>
                <div>
                  <strong>Aesthetic:</strong> {profileData.brandAesthetic.slice(0, 3).join(', ')}{profileData.brandAesthetic.length > 3 ? '...' : ''}<br/>
                  <strong>Target Audience:</strong> {profileData.targetAudience.slice(0, 3).join(', ')}{profileData.targetAudience.length > 3 ? '...' : ''}<br/>
                  <strong>Price Range:</strong> {
                    priceRangeOptions.find(option => option.value === profileData.priceRange)?.label || 
                    'Not specified'
                  }<br/>
                  <strong>Services:</strong> {profileData.services.slice(0, 3).join(', ')}{profileData.services.length > 3 ? '...' : ''}<br/>
                  <strong>Values:</strong> {profileData.brandValues.slice(0, 3).join(', ')}{profileData.brandValues.length > 3 ? '...' : ''}
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
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>🏢 Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After creating your brand profile, you'll be redirected to your dashboard where you can:
                <br/>• Showcase your product collections and lookbooks
                <br/>• Connect with models, photographers, and influencers
                <br/>• Post collaboration opportunities and casting calls
                <br/>• Manage brand partnerships and campaigns
                <br/>• Build your brand's industry presence and network
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
              🏢 Brand Profile Setup
            </h1>
            <Button 
              type="secondary"
              onClick={onLogout}
            >
              Logout
            </Button>
          </div>
          <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>
            Create your fashion brand profile to connect with models, photographers, and industry professionals
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
              ) : 'Complete Brand Profile ✨'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandProfileSetup;