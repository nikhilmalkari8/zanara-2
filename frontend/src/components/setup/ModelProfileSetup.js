// src/components/setup/ModelProfileSetup.js
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
    experienceLevel: '',
    modelingTypes: [], // Fashion, Commercial, Runway, etc.
    yearsExperience: '',
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
    props: '',
    modelType: ''
  });

  // Form validation and state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Physical Attributes', icon: '📏' },
    { number: 3, title: 'Professional Info', icon: '💼' },
    { number: 4, title: 'Portfolio & Social', icon: '📸' },
    { number: 5, title: 'Work Preferences', icon: '⚙️' },
    { number: 6, title: 'Rates & Skills', icon: '💰' },
    { number: 7, title: 'Review & Submit', icon: '✅' }
  ];

  // Option arrays
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

  const genderOptions = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const experienceLevelOptions = [
    { value: 'beginner', label: 'Beginner (0-2 years)' },
    { value: 'intermediate', label: 'Intermediate (3-5 years)' },
    { value: 'experienced', label: 'Experienced (6-10 years)' },
    { value: 'professional', label: 'Professional (10+ years)' }
  ];

  const yearsExperienceOptions = [
    { value: '0-2', label: '0-2 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '6-10', label: '6-10 years' },
    { value: '11-15', label: '11-15 years' },
    { value: '15+', label: '15+ years' }
  ];

  const modelTypeOptions = [
    { value: 'fashion', label: 'Fashion Model' },
    { value: 'commercial', label: 'Commercial Model' },
    { value: 'runway', label: 'Runway Model' },
    { value: 'editorial', label: 'Editorial Model' },
    { value: 'fitness', label: 'Fitness Model' },
    { value: 'plus-size', label: 'Plus-Size Model' },
    { value: 'petite', label: 'Petite Model' },
    { value: 'mature', label: 'Mature Model' }
  ];

  const availabilityOptions = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'freelance', label: 'Freelance/Project Based' },
    { value: 'weekends-only', label: 'Weekends Only' },
    { value: 'seasonal', label: 'Seasonal' }
  ];

  const travelOptions = [
    { value: 'local-only', label: 'Local Only' },
    { value: 'regional', label: 'Regional (within 200 miles)' },
    { value: 'national', label: 'National' },
    { value: 'international', label: 'International' },
    { value: 'anywhere', label: 'Travel Anywhere' }
  ];

  const nudityComfortOptions = [
    { value: 'none', label: 'No Nudity' },
    { value: 'implied', label: 'Implied/Covered' },
    { value: 'artistic', label: 'Artistic/Tasteful' },
    { value: 'partial', label: 'Partial Nudity' },
    { value: 'full', label: 'Full Nudity' }
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
        if (!profileData.dateOfBirth) {
          stepErrors.dateOfBirth = 'Date of birth is required';
        }
        if (!profileData.gender) {
          stepErrors.gender = 'Gender is required';
        }
        if (!profileData.location) {
          stepErrors.location = 'Location is required';
        }
        break;
      
      case 2: // Physical Attributes
        if (!profileData.height) {
          stepErrors.height = 'Height is required';
        }
        if (!profileData.bust) {
          stepErrors.bust = 'Bust/Chest measurement is required';
        }
        if (!profileData.waist) {
          stepErrors.waist = 'Waist measurement is required';
        }
        if (!profileData.hips) {
          stepErrors.hips = 'Hip measurement is required';
        }
        if (!profileData.bodyType) {
          stepErrors.bodyType = 'Body type is required';
        }
        if (!profileData.hairColor) {
          stepErrors.hairColor = 'Hair color is required';
        }
        if (!profileData.eyeColor) {
          stepErrors.eyeColor = 'Eye color is required';
        }
        break;
      
      case 3: // Professional Information
        if (!profileData.headline) {
          stepErrors.headline = 'Professional headline is required';
        }
        if (!profileData.bio) {
          stepErrors.bio = 'Bio is required';
        }
        if (!profileData.experienceLevel) {
          stepErrors.experienceLevel = 'Experience level is required';
        }
        if (!profileData.yearsExperience) {
          stepErrors.yearsExperience = 'Years of experience is required';
        }
        if (!profileData.modelType) {
          stepErrors.modelType = 'Model type is required';
        }
        if (profileData.modelingTypes.length === 0) {
          stepErrors.modelingTypes = 'Select at least one modeling type';
        }
        break;
      
      case 5: // Work Preferences
        if (!profileData.availability) {
          stepErrors.availability = 'Availability is required';
        }
        if (!profileData.travelWillingness) {
          stepErrors.travelWillingness = 'Travel willingness is required';
        }
        if (!profileData.nudityComfort) {
          stepErrors.nudityComfort = 'Nudity comfort level is required';
        }
        if (profileData.workTypes.length === 0) {
          stepErrors.workTypes = 'Select at least one work type';
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
    const finalErrors = validateStep(5); // Validate key requirements
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
        setMessage('Model profile created successfully! Redirecting to dashboard...');
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
                label="Date of Birth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                error={errors.dateOfBirth}
                required
              />
              <FormSelect
                label="Gender"
                value={profileData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                options={genderOptions}
                placeholder="Select gender"
                error={errors.gender}
                required
              />
              <FormInput
                label="Nationality"
                value={profileData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                placeholder="e.g., American, British, etc."
              />
              <FormInput
                label="Current Location"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State/Country"
                error={errors.location}
                required
              />
              <FormInput
                label="Languages Spoken"
                value={Array.isArray(profileData.languages) ? profileData.languages.join(', ') : ''}
                onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(l => l.trim()).filter(l => l))}
                placeholder="English, Spanish, French (comma separated)"
              />
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
              <FormInput
                label="Height"
                value={profileData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="5'8\ or 173 cm"
                error={errors.height}
                required
              />
              <FormInput
                label="Weight"
                value={profileData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="130 lbs or 59 kg"
              />
              <FormInput
                label="Bust/Chest"
                value={profileData.bust}
                onChange={(e) => handleInputChange('bust', e.target.value)}
                placeholder="34\ or 86 cm"
                error={errors.bust}
                required
              />
              <FormInput
                label="Waist"
                value={profileData.waist}
                onChange={(e) => handleInputChange('waist', e.target.value)}
                placeholder="26\ or 66 cm"
                error={errors.waist}
                required
              />
              <FormInput
                label="Hips"
                value={profileData.hips}
                onChange={(e) => handleInputChange('hips', e.target.value)}
                placeholder="36\ or 91 cm"
                error={errors.hips}
                required
              />
              <FormInput
                label="Dress Size"
                value={profileData.dressSize}
                onChange={(e) => handleInputChange('dressSize', e.target.value)}
                placeholder="US 6, EU 38, UK 10"
              />
              <FormInput
                label="Shoe Size"
                value={profileData.shoeSize}
                onChange={(e) => handleInputChange('shoeSize', e.target.value)}
                placeholder="US 8, EU 39, UK 6"
              />
              <FormSelect
                label="Body Type"
                value={profileData.bodyType}
                onChange={(e) => handleInputChange('bodyType', e.target.value)}
                options={bodyTypes.map(type => ({ value: type, label: type }))}
                placeholder="Select body type"
                error={errors.bodyType}
                required
              />
              <FormInput
                label="Hair Color"
                value={profileData.hairColor}
                onChange={(e) => handleInputChange('hairColor', e.target.value)}
                placeholder="Blonde, Brunette, Black, Red, etc."
                error={errors.hairColor}
                required
              />
              <FormInput
                label="Eye Color"
                value={profileData.eyeColor}
                onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                placeholder="Blue, Brown, Green, Hazel, etc."
                error={errors.eyeColor}
                required
              />
              <FormInput
                label="Skin Tone"
                value={profileData.skinTone}
                onChange={(e) => handleInputChange('skinTone', e.target.value)}
                placeholder="Fair, Medium, Olive, Dark, etc."
              />
            </div>
          </div>
        );

      case 3: // Professional Information
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💼 Professional Information</h2>
            <div style={styles.formGrid}>
              <FormInput
                label="Professional Headline"
                value={profileData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                placeholder="e.g., Fashion Model & Brand Ambassador"
                error={errors.headline}
                required
              />
              <FormSelect
                label="Experience Level"
                value={profileData.experienceLevel}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                options={experienceLevelOptions}
                placeholder="Select experience level"
                error={errors.experienceLevel}
                required
              />
              <FormSelect
                label="Years of Experience"
                value={profileData.yearsExperience}
                onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                options={yearsExperienceOptions}
                placeholder="Select years of experience"
                error={errors.yearsExperience}
                required
              />
              <FormSelect
                label="Model Type"
                value={profileData.modelType}
                onChange={(e) => handleInputChange('modelType', e.target.value)}
                options={modelTypeOptions}
                placeholder="Select model type"
                error={errors.modelType}
                required
              />
            </div>
            
            <FormTextarea
              label="Bio/About You"
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell clients about your modeling experience, personality, and what makes you unique. Include any notable work, publications, or achievements."
              error={errors.bio}
              required
            />

            <FormCheckboxGroup
              label="Modeling Types (Select all that apply)"
              options={modelingTypes}
              selectedValues={profileData.modelingTypes}
              onChange={(values) => handleArrayChange('modelingTypes', values)}
              error={errors.modelingTypes}
              columns={3}
            />

            <div style={styles.formGrid}>
              <FormTextarea
                label="Current/Previous Agencies"
                value={profileData.agencies}
                onChange={(e) => handleInputChange('agencies', e.target.value)}
                placeholder="List any modeling agencies you're currently with or have worked with previously"
                minHeight="80px"
              />
              <FormInput
                label="Union Memberships"
                value={profileData.unionMembership}
                onChange={(e) => handleInputChange('unionMembership', e.target.value)}
                placeholder="SAG-AFTRA, AEA, etc."
              />
            </div>
          </div>
        );

      case 4: // Portfolio & Social Media
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
                label="TikTok"
                value={profileData.socialMedia.tiktok}
                onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                placeholder="@yourusername or full URL"
              />
              <FormInput
                label="LinkedIn"
                value={profileData.socialMedia.linkedin}
                onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                placeholder="LinkedIn profile URL"
              />
              <FormInput
                label="Twitter/X"
                value={profileData.socialMedia.twitter}
                onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                placeholder="@yourusername or full URL"
              />
            </div>
          </div>
        );

      case 5: // Work Preferences
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>⚙️ Work Preferences</h2>
            <div style={styles.formGrid}>
              <FormSelect
                label="Availability"
                value={profileData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                options={availabilityOptions}
                placeholder="Select availability"
                error={errors.availability}
                required
              />
              <FormSelect
                label="Travel Willingness"
                value={profileData.travelWillingness}
                onChange={(e) => handleInputChange('travelWillingness', e.target.value)}
                options={travelOptions}
                placeholder="Select travel preference"
                error={errors.travelWillingness}
                required
              />
              <FormSelect
                label="Nudity Comfort Level"
                value={profileData.nudityComfort}
                onChange={(e) => handleInputChange('nudityComfort', e.target.value)}
                options={nudityComfortOptions}
                placeholder="Select comfort level"
                error={errors.nudityComfort}
                required
              />
            </div>

            <FormCheckboxGroup
              label="Preferred Work Types (Select all that apply)"
              options={workTypes}
              selectedValues={profileData.workTypes}
              onChange={(values) => handleArrayChange('workTypes', values)}
              error={errors.workTypes}
              columns={3}
            />

            <FormInput
              label="Preferred Locations"
              value={Array.isArray(profileData.preferredLocations) ? profileData.preferredLocations.join(', ') : ''}
              onChange={(e) => handleInputChange('preferredLocations', e.target.value.split(',').map(l => l.trim()).filter(l => l))}
              placeholder="New York, Los Angeles, Miami (comma separated)"
            />
          </div>
        );

      case 6: // Rates & Skills
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💰 Rates & Special Skills</h2>
            <div style={styles.formGrid}>
              <FormInput
                label="Hourly Rate (USD)"
                type="number"
                value={profileData.rates.hourly}
                onChange={(e) => handleInputChange('rates.hourly', e.target.value)}
                placeholder="75"
              />
              <FormInput
                label="Half Day Rate (USD)"
                type="number"
                value={profileData.rates.halfDay}
                onChange={(e) => handleInputChange('rates.halfDay', e.target.value)}
                placeholder="300"
              />
              <FormInput
                label="Full Day Rate (USD)"
                type="number"
                value={profileData.rates.fullDay}
                onChange={(e) => handleInputChange('rates.fullDay', e.target.value)}
                placeholder="500"
              />
            </div>

            <FormCheckboxGroup
              label="Special Skills & Talents"
              options={specialSkillsList}
              selectedValues={profileData.specialSkills}
              onChange={(values) => handleArrayChange('specialSkills', values)}
              columns={3}
            />

            <div style={styles.formGrid}>
              <FormTextarea
                label="Wardrobe Available"
                value={profileData.wardrobe}
                onChange={(e) => handleInputChange('wardrobe', e.target.value)}
                placeholder="Describe your personal wardrobe that can be used for shoots (formal wear, casual, sports, etc.)"
                minHeight="80px"
              />
              <FormTextarea
                label="Props Available"
                value={profileData.props}
                onChange={(e) => handleInputChange('props', e.target.value)}
                placeholder="List any props you own that could be useful for shoots (sports equipment, musical instruments, etc.)"
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
              <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>Model Profile Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Name:</strong> {profileData.fullName}<br/>
                  <strong>Location:</strong> {profileData.location}<br/>
                  <strong>Experience:</strong> {profileData.experienceLevel}<br/>
                  <strong>Height:</strong> {profileData.height}<br/>
                  <strong>Model Type:</strong> {
                    modelTypeOptions.find(option => option.value === profileData.modelType)?.label || 
                    profileData.modelType
                  }
                </div>
                <div>
                  <strong>Modeling Types:</strong> {profileData.modelingTypes.slice(0, 3).join(', ')}{profileData.modelingTypes.length > 3 ? '...' : ''}<br/>
                  <strong>Work Types:</strong> {profileData.workTypes.slice(0, 3).join(', ')}{profileData.workTypes.length > 3 ? '...' : ''}<br/>
                  <strong>Availability:</strong> {
                    availabilityOptions.find(option => option.value === profileData.availability)?.label || 
                    profileData.availability
                  }<br/>
                  <strong>Travel:</strong> {
                    travelOptions.find(option => option.value === profileData.travelWillingness)?.label || 
                    profileData.travelWillingness
                  }
                </div>
              </div>
            </Card>
            
            <Card style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
              <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>📝 Next Steps</h4>
              <p style={{ margin: 0, color: '#ddd' }}>
                After submitting your profile, you'll be redirected to your dashboard where you can:
                <br/>• Upload portfolio photos
                <br/>• Browse and apply for modeling opportunities
                <br/>• Connect with photographers, stylists, and brands
                <br/>• Manage your bookings and earnings
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
              👑 Model Profile Setup
            </h1>
            <Button 
              type="secondary"
              onClick={onLogout}
            >
              Logout
            </Button>
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

export default ModelProfileSetup;