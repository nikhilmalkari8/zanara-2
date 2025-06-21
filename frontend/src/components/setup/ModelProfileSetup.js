import React, { useState, useCallback } from 'react';

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
    
    // Physical Attributes
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
    modelingTypes: [],
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
    workTypes: [],
    nudityComfort: '',
    
    // Rate Information
    rates: {
      hourly: '',
      halfDay: '',
      fullDay: '',
      currency: 'USD'
    },
    
    // Special Skills
    specialSkills: [],
    wardrobe: '',
    props: '',
    modelType: ''
  });

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

  // Options arrays
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
  const handleInputChange = useCallback((field, value) => {
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
    
    // Clear errors when field is edited
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  const handleArrayChange = useCallback((field, values) => {
    setProfileData(prev => ({
      ...prev,
      [field]: values
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  // Validation function
  const validateStep = useCallback((step) => {
    const stepErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        if (!profileData.fullName?.trim()) {
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
        break;
    }
    
    return stepErrors;
  }, [profileData]);

  // Navigation functions
  const nextStep = useCallback(() => {
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
  }, [currentStep, validateStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setMessage('');
      setMessageType('');
      window.scrollTo(0, 0);
    }
  }, [currentStep]);

  // Submit profile
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage('');
    setMessageType('');
    
    const finalErrors = validateStep(5);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setMessage('Please fix the errors before submitting.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage('Model profile created successfully! Redirecting to dashboard...');
      setMessageType('success');
      setTimeout(() => {
        onProfileComplete();
      }, 2000);
    } catch (error) {
      setMessage('Failed to create profile. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Input Components
  const FormInput = ({ label, type = 'text', value, onChange, placeholder, error, required, className = '' }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent-gold/60 focus:bg-white/10 transition-all duration-300 ${error ? 'border-red-500' : ''} ${className}`}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );

  const FormSelect = ({ label, value, onChange, options, placeholder, error, required }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent-gold/60 focus:bg-white/10 transition-all duration-300 ${error ? 'border-red-500' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800 text-white">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );

  const FormTextarea = ({ label, value, onChange, placeholder, error, required, minHeight = '120px' }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ minHeight }}
        className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent-gold/60 focus:bg-white/10 transition-all duration-300 resize-vertical ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );

  const FormCheckboxGroup = ({ label, options, selectedValues, onChange, error, columns = 3 }) => (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-3`}>
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selectedValues, option]);
                } else {
                  onChange(selectedValues.filter(v => v !== option));
                }
              }}
              className="w-4 h-4 text-accent-gold bg-white/10 border-white/20 rounded focus:ring-accent-gold/20 focus:ring-2"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200">
              {option}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Personal Information
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-display font-light mb-2 text-white">👤 Personal Information</h2>
              <p className="text-gray-400">Tell us about yourself to create your professional profile.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
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
        );

      case 2: // Physical Attributes
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-display font-light mb-2 text-white">📏 Physical Attributes</h2>
              <p className="text-gray-400">Industry-standard measurements help clients find the right fit for their projects.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-display font-light mb-2 text-white">💼 Professional Information</h2>
              <p className="text-gray-400">Share your modeling experience and specialties.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Professional Headline"
                value={profileData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                placeholder="e.g., Fashion Model & Brand Ambassador"
                error={errors.headline}
                required
                className="md:col-span-2"
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
                className="md:col-span-2"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormTextarea
                label="Current/Previous Agencies"
                value={profileData.agencies}
                onChange={(e) => handleInputChange('agencies', e.target.value)}
                placeholder="List any modeling agencies you're currently with or have worked with previously"
                minHeight="100px"
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
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-display font-light mb-2 text-white">📸 Portfolio & Social Media</h2>
              <p className="text-gray-400">Showcase your work and build your professional presence.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Portfolio Website"
                type="url"
                value={profileData.portfolioWebsite}
                onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                placeholder="https://yourportfolio.com"
                className="md:col-span-2"
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
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-display font-light mb-2 text-white">⚙️ Work Preferences</h2>
              <p className="text-gray-400">Define your availability and comfort levels for different types of work.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-display font-light mb-2 text-white">💰 Rates & Special Skills</h2>
              <p className="text-gray-400">Set your professional rates and highlight your unique talents.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormTextarea
                label="Wardrobe Available"
                value={profileData.wardrobe}
                onChange={(e) => handleInputChange('wardrobe', e.target.value)}
                placeholder="Describe your personal wardrobe that can be used for shoots (formal wear, casual, sports, etc.)"
                minHeight="100px"
              />
              <FormTextarea
                label="Props Available"
                value={profileData.props}
                onChange={(e) => handleInputChange('props', e.target.value)}
                placeholder="List any props you own that could be useful for shoots (sports equipment, musical instruments, etc.)"
                minHeight="100px"
              />
            </div>
          </div>
        );

      case 7: // Review & Submit
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-display font-light mb-2 text-white">✅ Review & Submit</h2>
              <p className="text-gray-400">Review your profile information before submitting.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-accent-gold mb-4">Model Profile Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <div><span className="text-gray-400">Name:</span> <span className="text-white">{profileData.fullName}</span></div>
                  <div><span className="text-gray-400">Location:</span> <span className="text-white">{profileData.location}</span></div>
                  <div><span className="text-gray-400">Experience:</span> <span className="text-white">{experienceLevelOptions.find(opt => opt.value === profileData.experienceLevel)?.label || profileData.experienceLevel}</span></div>
                  <div><span className="text-gray-400">Height:</span> <span className="text-white">{profileData.height}</span></div>
                  <div><span className="text-gray-400">Model Type:</span> <span className="text-white">{modelTypeOptions.find(opt => opt.value === profileData.modelType)?.label || profileData.modelType}</span></div>
                </div>
                <div className="space-y-2">
                  <div><span className="text-gray-400">Modeling Types:</span> <span className="text-white">{profileData.modelingTypes.slice(0, 3).join(', ')}{profileData.modelingTypes.length > 3 ? '...' : ''}</span></div>
                  <div><span className="text-gray-400">Work Types:</span> <span className="text-white">{profileData.workTypes.slice(0, 3).join(', ')}{profileData.workTypes.length > 3 ? '...' : ''}</span></div>
                  <div><span className="text-gray-400">Availability:</span> <span className="text-white">{availabilityOptions.find(opt => opt.value === profileData.availability)?.label || profileData.availability}</span></div>
                  <div><span className="text-gray-400">Travel:</span> <span className="text-white">{travelOptions.find(opt => opt.value === profileData.travelWillingness)?.label || profileData.travelWillingness}</span></div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-yellow-400 mb-3">📝 Next Steps</h4>
              <div className="text-gray-300 space-y-2">
                <p>After submitting your profile, you'll be redirected to your dashboard where you can:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Upload portfolio photos</li>
                  <li>Browse and apply for modeling opportunities</li>
                  <li>Connect with photographers, stylists, and brands</li>
                  <li>Manage your bookings and earnings</li>
                </ul>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl border ${
                messageType === 'success' 
                  ? 'bg-green-900/30 border-green-700/50 text-green-300' 
                  : 'bg-red-900/30 border-red-700/50 text-red-300'
              }`}>
                <div className="flex items-center space-x-2">
                  {messageType === 'success' ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl mb-8 overflow-hidden">
          <div className="bg-white/5 p-8 border-b border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-display font-light text-white">
                👑 Model Profile Setup
              </h1>
              <button 
                onClick={onLogout}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-300"
              >
                Logout
              </button>
            </div>
            <p className="text-gray-400 text-lg">
              Create your professional modeling profile to connect with top brands and photographers
            </p>
          </div>

          {/* Step Indicator */}
          <div className="p-6">
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {steps.map(step => (
                <div
                  key={step.number}
                  className={`flex flex-col items-center p-3 rounded-xl min-w-20 transition-all duration-300 ${
                    step.number === currentStep 
                      ? 'bg-white/20 border-2 border-white/50' 
                      : step.number < currentStep 
                        ? 'bg-green-900/30 border-2 border-green-500/50' 
                        : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {step.number < currentStep ? '✅' : step.icon}
                  </div>
                  <div className="text-xs text-center text-white font-medium">
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
          {message && currentStep < 7 && (
            <div className={`mb-8 p-4 rounded-xl border ${
              messageType === 'success' 
                ? 'bg-green-900/30 border-green-700/50 text-green-300' 
                : 'bg-red-900/30 border-red-700/50 text-red-300'
            }`}>
              <div className="flex items-center space-x-2">
                {messageType === 'success' ? (
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}
          
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              currentStep === 1 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30'
            }`}
          >
            ← Previous
          </button>

          <div className="text-white text-sm font-medium">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-accent-gold to-accent-gold-light hover:from-accent-gold-light hover:to-accent-gold-dark text-black font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isSubmitting 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-accent-gold to-accent-gold-light hover:from-accent-gold-light hover:to-accent-gold-dark text-black hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Profile...</span>
                </div>
              ) : 'Complete Profile ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelProfileSetup;