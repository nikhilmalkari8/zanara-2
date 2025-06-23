import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// Hoisted, memoized form field components to preserve focus
const FormInput = React.memo(function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  className = '',
  unit,
  onUnitChange,
  unitOptions = [],
}) {
  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-gold transition-colors duration-200">
        {label} {required && <span className="text-accent-gold">*</span>}
      </label>
      <div className="relative flex">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${unitOptions.length ? 'rounded-l-xl rounded-r-none' : 'rounded-xl'} flex-1 px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 text-white placeholder-gray-400 
            focus:outline-none focus:border-accent-gold/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-gold/20
            transition-all duration-300 hover:border-gray-500/70 ${error ? 'border-rose-500 focus:border-rose-400' : ''} ${className}`}
        />
        {unitOptions.length > 0 && (
          <select
            value={unit}
            onChange={onUnitChange}
            className="px-3 py-3.5 bg-gray-700/50 border border-l-0 border-gray-600/30 rounded-r-xl text-white focus:outline-none focus:border-accent-gold/60 focus:bg-gray-800/50 transition-all duration-300"
          >
            {unitOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
        )}
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
      {error && <p className="text-rose-400 text-sm mt-1 animate-pulse">{error}</p>}
    </div>
  );
});

const FormSelect = React.memo(function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
}) {
  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-gold transition-colors duration-200">
        {label} {required && <span className="text-accent-gold">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 rounded-xl text-white 
            focus:outline-none focus:border-accent-gold/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-gold/20
            transition-all duration-300 hover:border-gray-500/70 appearance-none cursor-pointer ${error ? 'border-rose-500' : ''}`}
        >
          <option value="" className="bg-gray-800">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-rose-400 text-sm mt-1 animate-pulse">{error}</p>}
    </div>
  );
});

const FormTextarea = React.memo(function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  rows = 4,
}) {
  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-gold transition-colors duration-200">
        {label} {required && <span className="text-accent-gold">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 
          focus:outline-none focus:border-accent-gold/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-gold/20
          transition-all duration-300 hover:border-gray-500/70 resize-none ${error ? 'border-rose-500' : ''}`}
      />
      {error && <p className="text-rose-400 text-sm mt-1 animate-pulse">{error}</p>}
    </div>
  );
});

const FormCheckboxGroup = React.memo(function FormCheckboxGroup({
  label,
  options,
  selectedValues,
  onChange,
  error,
  columns = 3,
}) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-3`}>
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <label key={option} className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter(v => v !== option));
                    }
                  }}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                  isSelected ? 'bg-accent-gold border-accent-gold' : 'border-gray-500 group-hover:border-gray-400'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-primary-black m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200">
                {option}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-rose-400 text-sm mt-2 animate-pulse">{error}</p>}
    </div>
  );
});

const PhotographerProfileSetup = ({
  user = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
  onLogout,
  onProfileComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    photographyTypes: [],
    styles: [],
    clientTypes: [],
    
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
    packagesOffered: '',
    
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const contentRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorFollowerRef = useRef(null);
  const bgAnimationRef = useRef(null);

  // Cursor effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${x - 10}px, ${y - 10}px, 0)`;
      if (cursorFollowerRef.current) cursorFollowerRef.current.style.transform = `translate3d(${x - 20}px, ${y - 20}px, 0)`;
    };
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particles effect
  useEffect(() => {
    if (!bgAnimationRef.current) return;
    const maxParticles = 8;
    let particleCount = 0;
    const createParticle = () => {
      if (particleCount >= maxParticles) return;
      const particle = document.createElement('div');
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.3 + 0.1;
      const duration = Math.random() * 10 + 8;
      particle.className = 'absolute rounded-full pointer-events-none will-change-transform';
      particle.style.cssText = `
        width: ${size}px; height: ${size}px; background: #d4af37;
        left: ${Math.random() * 100}%; top: 100%; opacity: ${opacity};
        animation: float-up-simple ${duration}s linear infinite;
      `;
      bgAnimationRef.current.appendChild(particle);
      particleCount++;
      setTimeout(() => {
        particle.parentNode?.removeChild(particle);
        particleCount--;
      }, duration * 1000);
    };
    const interval = setInterval(createParticle, 3000);
    for (let i = 0; i < 3; i++) setTimeout(createParticle, i * 1000);
    return () => clearInterval(interval);
  }, []);

  const steps = useMemo(() => [
    { number: 1, title: 'Personal', icon: '✦', color: 'from-green-400 to-green-600' },
    { number: 2, title: 'Professional', icon: '◈', color: 'from-blue-400 to-blue-600' },
    { number: 3, title: 'Specializations', icon: '◊', color: 'from-purple-400 to-purple-600' },
    { number: 4, title: 'Equipment', icon: '◯', color: 'from-pink-400 to-pink-600' },
    { number: 5, title: 'Business', icon: '✧', color: 'from-amber-400 to-amber-600' },
    { number: 6, title: 'Pricing', icon: '⬡', color: 'from-rose-400 to-rose-600' },
    { number: 7, title: 'Portfolio', icon: '⬢', color: 'from-indigo-400 to-indigo-600' },
    { number: 8, title: 'Review', icon: '⬟', color: 'from-cyan-400 to-cyan-600' },
  ], []);

  const options = useMemo(() => ({
    photographyTypes: [
      'Fashion Photography', 'Portrait Photography', 'Commercial Photography',
      'Beauty Photography', 'Editorial Photography', 'Product Photography',
      'Lifestyle Photography', 'Event Photography', 'Wedding Photography',
      'Headshot Photography', 'Boudoir Photography', 'Fine Art Photography',
      'Street Photography', 'Architectural Photography', 'Food Photography'
    ],
    photographyStyles: [
      'High Fashion Editorial', 'Commercial Fashion', 'Street Style',
      'Beauty/Cosmetics', 'Lifestyle/Casual', 'Avant-Garde/Artistic',
      'Classic/Timeless', 'Minimalist', 'Dramatic/Moody', 'Bright/Airy',
      'Black & White', 'Film Photography', 'Digital Art', 'Documentary Style'
    ],
    clientTypes: [
      'Fashion Brands', 'Beauty Brands', 'Modeling Agencies', 'Individual Models',
      'Influencers/Content Creators', 'Magazines/Publications', 'E-commerce Brands',
      'Advertising Agencies', 'Corporate Clients', 'Event Organizers',
      'Wedding Clients', 'Private Individuals', 'Art Galleries', 'Non-Profits'
    ],
    cameraEquipment: [
      'Canon EOS R5', 'Canon EOS R6', 'Canon 5D Mark IV', 'Canon 1DX Mark III',
      'Nikon D850', 'Nikon Z9', 'Nikon Z7II', 'Sony A7R V', 'Sony A7 IV',
      'Sony A9 III', 'Fujifilm X-T5', 'Fujifilm GFX 100S', 'Hasselblad X2D',
      'Phase One IQ4', 'Medium Format Film', '35mm Film Cameras'
    ],
    lensTypes: [
      '24-70mm f/2.8', '70-200mm f/2.8', '85mm f/1.4', '50mm f/1.4',
      '35mm f/1.4', '135mm f/2', '24mm f/1.4', '105mm Macro', '200mm f/2',
      'Tilt-Shift Lenses', 'Vintage Lenses', 'Specialty Portrait Lenses'
    ],
    lightingEquipment: [
      'Profoto Strobes', 'Godox Strobes', 'Continuous LED Panels',
      'Softboxes', 'Beauty Dishes', 'Ring Lights', 'Reflectors',
      'Natural Light Only', 'Portable Flash Units', 'Studio Monolights',
      'Color Gels', 'Light Modifiers', 'Background Systems'
    ],
    editingSoftware: [
      'Adobe Lightroom', 'Adobe Photoshop', 'Capture One', 'Luminar',
      'Affinity Photo', 'VSCO', 'DxO PhotoLab', 'Skylum Aurora',
      'Phase One Capture One', 'Final Cut Pro', 'Adobe Premiere',
      'Color Grading Software'
    ],
    technicalSkills: [
      'Studio Lighting Setup', 'Natural Light Mastery', 'Color Theory',
      'Composition Techniques', 'Posing Direction', 'Retouching/Post-Processing',
      'Color Correction', 'Skin Retouching', 'Fashion Retouching',
      'Tethered Shooting', 'High-Speed Sync', 'Multiple Exposure',
      'HDR Photography', 'Focus Stacking', 'Panoramic Photography'
    ],
    yearsExperience: [
      { value: '0-1', label: '0-1 years (Beginner)' },
      { value: '2-3', label: '2-3 years (Developing)' },
      { value: '4-6', label: '4-6 years (Experienced)' },
      { value: '7-10', label: '7-10 years (Professional)' },
      { value: '10+', label: '10+ years (Expert)' }
    ],
    studioAccess: [
      { value: 'own-studio', label: 'I own my studio' },
      { value: 'rent-studio', label: 'I rent studio space' },
      { value: 'partner-studios', label: 'I have partner studios' },
      { value: 'location-only', label: 'Location shoots only' },
      { value: 'client-studio', label: 'I work in client studios' }
    ],
    travelRadius: [
      { value: 'local-30', label: 'Local only (30 miles)' },
      { value: 'regional-100', label: 'Regional (100 miles)' },
      { value: 'state-wide', label: 'State-wide' },
      { value: 'national', label: 'National' },
      { value: 'international', label: 'International' }
    ],
    availability: [
      { value: 'full-time', label: 'Full Time' },
      { value: 'part-time', label: 'Part Time' },
      { value: 'freelance', label: 'Freelance/Project Based' },
      { value: 'weekends-only', label: 'Weekends Only' },
      { value: 'seasonal', label: 'Seasonal' }
    ],
    preferredProjects: [
      'Fashion Editorials', 'Commercial Campaigns', 'Portrait Sessions',
      'Product Photography', 'Event Coverage', 'Brand Content',
      'Social Media Content', 'Lookbooks', 'E-commerce', 'Art Projects'
    ],
    currencies: [
      { value: 'USD', label: 'USD ($)' },
      { value: 'EUR', label: 'EUR (€)' },
      { value: 'GBP', label: 'GBP (£)' },
      { value: 'CAD', label: 'CAD ($)' }
    ]
  }), []);

  const handleInputChange = useCallback((field, value) => {
    setProfileData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
    
    setErrors(prev => {
      if (prev[field]) {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      }
      return prev;
    });
  }, []);

  const validateStep = useCallback((step) => {
    const errs = {};
    switch (step) {
      case 1:
        if (!profileData.fullName?.trim()) errs.fullName = 'Full name is required';
        if (!profileData.email || !/^\S+@\S+\.\S+$/.test(profileData.email)) errs.email = 'Valid email is required';
        if (!profileData.phone) errs.phone = 'Phone number is required';
        if (!profileData.location) errs.location = 'Location is required';
        break;
      case 2:
        if (!profileData.headline) errs.headline = 'Professional headline is required';
        if (!profileData.bio) errs.bio = 'Bio is required';
        if (!profileData.yearsExperience) errs.yearsExperience = 'Years of experience is required';
        break;
      case 3:
        if (profileData.photographyTypes.length === 0) errs.photographyTypes = 'Select at least one photography type';
        if (profileData.styles.length === 0) errs.styles = 'Select at least one photography style';
        if (profileData.clientTypes.length === 0) errs.clientTypes = 'Select at least one client type';
        break;
      case 4:
        if (profileData.cameraEquipment.length === 0) errs.cameraEquipment = 'Select at least one camera';
        if (profileData.lensCollection.length === 0) errs.lensCollection = 'Select at least one lens type';
        if (profileData.lightingEquipment.length === 0) errs.lightingEquipment = 'Select at least one lighting option';
        break;
      case 5:
        if (!profileData.studioAccess) errs.studioAccess = 'Studio access information is required';
        if (!profileData.travelRadius) errs.travelRadius = 'Travel radius is required';
        break;
      case 7:
        if (!profileData.portfolioWebsite) errs.portfolioWebsite = 'Portfolio website is required';
        break;
    }
    return errs;
  }, [profileData]);

  const navigateToStep = useCallback(async (targetStep) => {
    if (targetStep === currentStep) return;
    if (targetStep > currentStep) {
      const stepErrs = validateStep(currentStep);
      if (Object.keys(stepErrs).length) {
        setErrors(stepErrs);
        return;
      }
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    setIsTransitioning(true);
    setErrors({});
    await new Promise(r => setTimeout(r, 300));
    setCurrentStep(targetStep);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentStep, validateStep]);

  const nextStep = () => navigateToStep(currentStep + 1);
  const prevStep = () => navigateToStep(currentStep - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        onProfileComplete?.();
      } else {
        alert(data.message || 'Failed to save profile. Please try again.');
      }
    } catch (e) {
      console.error('Profile submission failed:', e);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const commonProps = {
      className: `transition-all duration-700 ${isTransitioning ? 'opacity-0 translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'}`
    };

    switch (currentStep) {
      case 1:
        return (
          <div {...commonProps}>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
                <span className="text-gradient-gold">✦</span>
              </div>
              <h2 className="text-3xl font-display font-light text-white mb-3">Personal <span className="text-gradient-gold">Information</span></h2>
              <p className="text-gray-400 font-light">Share your professional details and contact information</p>
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

      case 2:
        return (
          <div {...commonProps}>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
                <span className="text-gradient-gold">◈</span>
              </div>
              <h2 className="text-3xl font-display font-light text-white mb-3">Professional <span className="text-gradient-gold">Background</span></h2>
              <p className="text-gray-400 font-light">Tell us about your photography journey and expertise</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  options={options.yearsExperience}
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
                rows={5}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormTextarea
                  label="Education Background"
                  value={profileData.educationBackground}
                  onChange={(e) => handleInputChange('educationBackground', e.target.value)}
                  placeholder="Photography school, art degree, workshops, masterclasses, etc."
                  rows={3}
                />
                <FormTextarea
                  label="Certifications"
                  value={profileData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="Professional certifications, photography associations, etc."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div {...commonProps}>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
                <span className="text-gradient-gold">◊</span>
              </div>
              <h2 className="text-3xl font-display font-light text-white mb-3">Photography <span className="text-gradient-gold">Specializations</span></h2>
              <p className="text-gray-400 font-light">Define your photography focus and client types</p>
            </div>
            
            <div className="space-y-8">
              <FormCheckboxGroup
                label="Photography Types"
                options={options.photographyTypes}
                selectedValues={profileData.photographyTypes}
                onChange={(values) => handleInputChange('photographyTypes', values)}
                error={errors.photographyTypes}
                columns={3}
              />

              <FormCheckboxGroup
                label="Photography Styles"
                options={options.photographyStyles}
                selectedValues={profileData.styles}
                onChange={(values) => handleInputChange('styles', values)}
                error={errors.styles}
                columns={3}
              />

              <FormCheckboxGroup
                label="Preferred Client Types"
                options={options.clientTypes}
                selectedValues={profileData.clientTypes}
                onChange={(values) => handleInputChange('clientTypes', values)}
                error={errors.clientTypes}
                columns={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div {...commonProps}>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
                <span className="text-gradient-gold">◯</span>
              </div>
              <h2 className="text-3xl font-display font-light text-white mb-3">Equipment & <span className="text-gradient-gold">Technical Skills</span></h2>
             <p className="text-gray-400 font-light">Showcase your photography equipment and technical expertise</p>
           </div>
           
           <div className="space-y-8">
             <FormCheckboxGroup
               label="Camera Equipment"
               options={options.cameraEquipment}
               selectedValues={profileData.cameraEquipment}
               onChange={(values) => handleInputChange('cameraEquipment', values)}
               error={errors.cameraEquipment}
               columns={3}
             />

             <FormCheckboxGroup
               label="Lens Collection"
               options={options.lensTypes}
               selectedValues={profileData.lensCollection}
               onChange={(values) => handleInputChange('lensCollection', values)}
               error={errors.lensCollection}
               columns={3}
             />

             <FormCheckboxGroup
               label="Lighting Equipment"
               options={options.lightingEquipment}
               selectedValues={profileData.lightingEquipment}
               onChange={(values) => handleInputChange('lightingEquipment', values)}
               error={errors.lightingEquipment}
               columns={3}
             />

             <FormCheckboxGroup
               label="Editing Software"
               options={options.editingSoftware}
               selectedValues={profileData.editingSoftware}
               onChange={(values) => handleInputChange('editingSoftware', values)}
               columns={3}
             />

             <FormCheckboxGroup
               label="Technical Skills"
               options={options.technicalSkills}
               selectedValues={profileData.technicalSkills}
               onChange={(values) => handleInputChange('technicalSkills', values)}
               columns={3}
             />
           </div>
         </div>
       );

     case 5:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-gold">✧</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Business <span className="text-gradient-gold">Setup</span></h2>
             <p className="text-gray-400 font-light">Define your business model and service offerings</p>
           </div>
           
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormSelect
                 label="Studio Access"
                 value={profileData.studioAccess}
                 onChange={(e) => handleInputChange('studioAccess', e.target.value)}
                 options={options.studioAccess}
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
                 options={options.travelRadius}
                 placeholder="Select travel preference"
                 error={errors.travelRadius}
                 required
               />
               <FormSelect
                 label="Availability"
                 value={profileData.availability}
                 onChange={(e) => handleInputChange('availability', e.target.value)}
                 options={options.availability}
                 placeholder="Select availability"
               />
             </div>

             <div className="glass-effect rounded-xl p-6">
               <label className="flex items-center space-x-3 cursor-pointer group">
                 <div className="relative">
                   <input
                     type="checkbox"
                     checked={profileData.mobileServices}
                     onChange={(e) => handleInputChange('mobileServices', e.target.checked)}
                     className="sr-only"
                   />
                   <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                     profileData.mobileServices ? 'bg-accent-gold border-accent-gold' : 'border-gray-500 group-hover:border-gray-400'
                   }`}>
                     {profileData.mobileServices && (
                       <svg className="w-3 h-3 text-primary-black m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                     )}
                   </div>
                 </div>
                 <span className="text-white">I offer mobile photography services (on-location shoots)</span>
               </label>
             </div>

             <FormCheckboxGroup
               label="Preferred Project Types"
               options={options.preferredProjects}
               selectedValues={profileData.preferredProjectTypes}
               onChange={(values) => handleInputChange('preferredProjectTypes', values)}
               columns={3}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Collaboration Style"
                 value={profileData.collaborationStyle}
                 onChange={(e) => handleInputChange('collaborationStyle', e.target.value)}
                 placeholder="Describe your working style and approach to collaborating with teams..."
                 rows={4}
               />
               <FormTextarea
                 label="Client Communication"
                 value={profileData.clientCommunication}
                 onChange={(e) => handleInputChange('clientCommunication', e.target.value)}
                 placeholder="How do you prefer to communicate with clients during projects..."
                 rows={4}
               />
             </div>
           </div>
         </div>
       );

     case 6:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-gold">⬡</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Pricing & <span className="text-gradient-gold">Packages</span></h2>
             <p className="text-gray-400 font-light">Set your rates and define your service packages</p>
           </div>
           
           <div className="space-y-6">
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                 <span className="text-accent-gold mr-2">💰</span> Starting Rates
               </h3>
               <p className="text-gray-400 text-sm mb-4">
                 Set your starting rates. You can always adjust these later and create custom packages.
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <FormInput
                   label="Portrait Session"
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
                   options={options.currencies}
                   placeholder="Select currency"
                 />
               </div>
             </div>

             <FormTextarea
               label="Packages Offered"
               value={profileData.packagesOffered}
               onChange={(e) => handleInputChange('packagesOffered', e.target.value)}
               placeholder="Describe your photography packages:

Basic Portrait Package - $300
- 1 hour session
- 10 edited photos
- Online gallery

Premium Fashion Shoot - $1200
- 4 hour session
- 30 edited photos
- Styling consultation
- Online gallery + USB

Full Campaign Package - $3000
- Full day shoot
- 50+ edited photos
- Creative direction
- Commercial usage rights"
               rows={8}
             />
           </div>
         </div>
       );

     case 7:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-gold">⬢</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Portfolio & <span className="text-gradient-gold">Social Media</span></h2>
             <p className="text-gray-400 font-light">Showcase your work and professional presence</p>
           </div>
           
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                 placeholder="@yourphotography"
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

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Publications & Features"
                 value={profileData.publications}
                 onChange={(e) => handleInputChange('publications', e.target.value)}
                 placeholder="Magazines, blogs, websites where your work has been featured"
                 rows={4}
               />
               <FormTextarea
                 label="Notable Clients"
                 value={profileData.notableClients}
                 onChange={(e) => handleInputChange('notableClients', e.target.value)}
                 placeholder="Well-known clients, brands, celebrities you've worked with"
                 rows={4}
               />
               <FormTextarea
                 label="Awards & Recognition"
                 value={profileData.awards}
                 onChange={(e) => handleInputChange('awards', e.target.value)}
                 placeholder="Photography awards, competitions, industry recognition"
                 rows={4}
               />
               <FormTextarea
                 label="Exhibitions"
                 value={profileData.exhibitions}
                 onChange={(e) => handleInputChange('exhibitions', e.target.value)}
                 placeholder="Art galleries, photography exhibitions, shows"
                 rows={4}
               />
             </div>

             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                 <span className="text-accent-gold mr-2">✧</span> Portfolio Tips
               </h3>
               <ul className="text-gray-300 text-sm space-y-2">
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Include your best 20-30 images across different styles</li>
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Show variety in lighting, composition, and subjects</li>
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Keep your portfolio updated with recent work</li>
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Organize by categories (Fashion, Portrait, Commercial, etc.)</li>
               </ul>
             </div>
           </div>
         </div>
       );

     case 8:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-gold">⬟</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Review & <span className="text-gradient-gold">Submit</span></h2>
             <p className="text-gray-400 font-light">Finalize your professional photography profile</p>
           </div>
           
           <div className="space-y-8">
             {/* Personal Information Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">✦</span>
                 Personal Information
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Name:</span> <span className="text-white">{profileData.fullName}</span></div>
                 <div><span className="text-gray-400">Email:</span> <span className="text-white">{profileData.email}</span></div>
                 <div><span className="text-gray-400">Phone:</span> <span className="text-white">{profileData.phone}</span></div>
                 <div><span className="text-gray-400">Location:</span> <span className="text-white">{profileData.location}</span></div>
                 <div><span className="text-gray-400">Website:</span> <span className="text-white">{profileData.website || 'Not provided'}</span></div>
               </div>
             </div>

             {/* Professional Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◈</span>
                 Professional Information
               </h3>
               <div className="space-y-3 text-sm">
                 <div><span className="text-gray-400">Headline:</span> <span className="text-white">{profileData.headline}</span></div>
                 <div><span className="text-gray-400">Experience:</span> <span className="text-white">{
                   options.yearsExperience.find(option => option.value === profileData.yearsExperience)?.label || 
                   profileData.yearsExperience
                 }</span></div>
                 <div><span className="text-gray-400">Studio Access:</span> <span className="text-white">{
                   options.studioAccess.find(option => option.value === profileData.studioAccess)?.label || 
                   profileData.studioAccess
                 }</span></div>
                 <div><span className="text-gray-400">Mobile Services:</span> <span className="text-white">{profileData.mobileServices ? 'Yes' : 'No'}</span></div>
                 {profileData.bio && (
                   <div><span className="text-gray-400">Bio:</span> <span className="text-white">{profileData.bio.substring(0, 200)}...</span></div>
                 )}
               </div>
             </div>

             {/* Specializations Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◊</span>
                 Photography Specializations
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Types:</span> <span className="text-white">{profileData.photographyTypes.slice(0, 3).join(', ')}{profileData.photographyTypes.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Styles:</span> <span className="text-white">{profileData.styles.slice(0, 3).join(', ')}{profileData.styles.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Client Types:</span> <span className="text-white">{profileData.clientTypes.slice(0, 3).join(', ')}{profileData.clientTypes.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Travel:</span> <span className="text-white">{
                   options.travelRadius.find(option => option.value === profileData.travelRadius)?.label || 
                   profileData.travelRadius
                 }</span></div>
               </div>
             </div>

             {/* Equipment Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◯</span>
                 Equipment & Skills
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Cameras:</span> <span className="text-white">{profileData.cameraEquipment.length} cameras</span></div>
                 <div><span className="text-gray-400">Lenses:</span> <span className="text-white">{profileData.lensCollection.length} lens types</span></div>
                 <div><span className="text-gray-400">Lighting:</span> <span className="text-white">{profileData.lightingEquipment.length} options</span></div>
                 <div><span className="text-gray-400">Software:</span> <span className="text-white">{profileData.editingSoftware.length} programs</span></div>
               </div>
             </div>

             {/* Portfolio Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">⬢</span>
                 Portfolio & Rates
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Portfolio:</span> <span className="text-white">{profileData.portfolioWebsite || 'Not provided'}</span></div>
                 <div><span className="text-gray-400">Business Instagram:</span> <span className="text-white">{profileData.instagramBusiness || 'Not provided'}</span></div>
                 {profileData.rates.portraitSession && (
                   <div><span className="text-gray-400">Portrait Rate:</span> <span className="text-white">{profileData.rates.currency} {profileData.rates.portraitSession}</span></div>
                 )}
                 {profileData.rates.fashionShoot && (
                   <div><span className="text-gray-400">Fashion Shoot:</span> <span className="text-white">{profileData.rates.currency} {profileData.rates.fashionShoot}</span></div>
                 )}
               </div>
             </div>

             <div className="glass-effect-strong rounded-xl p-6 border border-emerald-500/30">
               <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 </div>
                 <div>
                   <h4 className="text-accent-gold font-medium">Ready to Launch</h4>
                   <p className="text-gray-300 text-sm">Your photography profile is complete. Click submit to launch your professional profile.</p>
                 </div>
               </div>
             </div>
           </div>
         </div>
       );

     default:
       return null;
   }
 };

 // Main component render
 return (
   <div className="min-h-screen bg-primary-black cursor-none">
     {/* Stylesheets for animations */}
     <style jsx>{`
       @keyframes float-up-simple {
         0% {
           transform: translateY(0) rotate(0deg);
           opacity: 0;
         }
         10% {
           opacity: 1;
         }
         90% {
           opacity: 1;
         }
         100% {
           transform: translateY(-100vh) rotate(360deg);
           opacity: 0;
         }
       }
       
       @keyframes pulse-gold {
         0%, 100% {
           opacity: 0.6;
         }
         50% {
           opacity: 1;
         }
       }
       
       @keyframes shimmer-simple {
         0% {
           background-position: -200% 0;
         }
         100% {
           background-position: 200% 0;
         }
       }
       
       .text-gradient-gold {
         background: linear-gradient(135deg, #fafafa 0%, #d4af37 50%, #ffd700 100%);
         -webkit-background-clip: text;
         -webkit-text-fill-color: transparent;
         background-clip: text;
       }
       
       .animate-shimmer-simple {
         background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
         background-size: 200% 100%;
         animation: shimmer-simple 2s ease-in-out infinite;
       }
       
       .glass-effect {
         background: rgba(255, 255, 255, 0.03);
         backdrop-filter: blur(15px);
         border: 1px solid rgba(255, 255, 255, 0.08);
       }
       
       .glass-effect-strong {
         background: rgba(255, 255, 255, 0.05);
         backdrop-filter: blur(20px);
         border: 1px solid rgba(255, 255, 255, 0.1);
       }
     `}</style>

     {/* Simplified Cursors */}
     <div 
       ref={cursorRef}
       className="fixed w-5 h-5 bg-accent-gold rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block will-change-transform"
     />
     <div 
       ref={cursorFollowerRef}
       className="fixed w-8 h-8 border border-accent-gold/30 rounded-full pointer-events-none z-40 hidden md:block will-change-transform"
     />

     {/* Particles Container */}
     <div 
       ref={bgAnimationRef}
       className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
     />

     {/* Gradient Background */}
     <div className="fixed inset-0 bg-gradient-to-br from-gray-900/10 via-black to-gray-900/5">
       <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-gold/3 rounded-full blur-3xl" />
       <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-gold/2 rounded-full blur-2xl" />
     </div>

     {/* Header */}
     <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700/30 sticky top-0 z-30">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex justify-between items-center py-4">
           <div className="flex items-center space-x-4">
             <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-accent-gold-light rounded-xl flex items-center justify-center">
               <span className="text-primary-black font-bold text-lg">Z</span>
             </div>
             <div>
               <h1 className="text-xl font-display font-light text-white">ZANARA <span className="text-accent-gold">Photography Setup</span></h1>
               <p className="text-gray-400 text-sm">Complete your professional photography profile</p>
             </div>
           </div>
           <button
             onClick={onLogout}
             className="px-4 py-2 text-gray-300 hover:text-accent-gold transition-colors duration-200"
           >
             Logout
           </button>
         </div>
       </div>
     </header>

     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Sidebar Navigation */}
         <div className="lg:col-span-1">
           <div className="glass-effect rounded-2xl p-6 sticky top-24">
             <h3 className="text-lg font-display font-light text-white mb-6">Setup <span className="text-accent-gold">Progress</span></h3>
             <div className="space-y-4">
               {steps.map((step) => {
                 const isActive = step.number === currentStep;
                 const isCompleted = completedSteps.has(step.number);
                 const isClickable = step.number <= currentStep || completedSteps.has(step.number);

                 return (
                   <button
                     key={step.number}
                     onClick={() => isClickable && navigateToStep(step.number)}
                     disabled={!isClickable}
                     className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? `bg-gradient-to-r ${step.color} text-white shadow-lg transform scale-105`
                        : isCompleted
                        ? 'glass-effect border border-accent-gold/30 text-accent-gold hover:border-accent-gold/50'
                        : isClickable
                        ? 'bg-gray-800/50 border border-gray-600/50 text-gray-300 hover:bg-gray-800/70 hover:border-gray-500/50'
                        : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                        isActive ? 'bg-white/20' : isCompleted ? 'bg-accent-gold/20' : 'bg-gray-600/50'
                      }`}>
                        {isCompleted ? '✓' : step.icon}
                      </div>
                      <div>
                        <div className="font-medium">{step.title}</div>
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                          Step {step.number}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress Indicator */}
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round((completedSteps.size / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-accent-gold to-accent-gold-light h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="glass-effect rounded-2xl overflow-hidden">
            <div 
              ref={contentRef}
              className="p-8 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            >
              {renderStepContent()}
            </div>

            {/* Navigation Footer */}
            <div className="bg-gray-800/50 border-t border-gray-700/50 p-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 bg-gray-700/80 hover:bg-gray-600/80 disabled:bg-gray-800/50 disabled:text-gray-500 text-white rounded-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <span>Step {currentStep} of {steps.length}</span>
                </div>

                {currentStep === steps.length ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-accent-gold to-accent-gold-light hover:from-accent-gold-light hover:to-accent-gold disabled:opacity-50 text-primary-black rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Profile</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-accent-gold to-accent-gold-light hover:from-accent-gold-light hover:to-accent-gold text-primary-black rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
                  >
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Signature */}
    <div className="fixed bottom-6 left-6 text-xs text-gray-500/30 font-light tracking-wider uppercase hidden lg:block">
      ZANARA · Premium Photography Experience
    </div>
  </div>
);
};

export default PhotographerProfileSetup;