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

const ModelProfileSetup = ({
  user = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
  onLogout,
  onProfileComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    location: '',
    languages: '',
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    bust: '',
    bustUnit: 'cm',
    waist: '',
    waistUnit: 'cm',
    hips: '',
    hipsUnit: 'cm',
    dressSize: '',
    dressSizeUnit: 'US',
    shoeSize: '',
    shoeSizeUnit: 'US',
    bodyType: '',
    hairColor: '',
    eyeColor: '',
    skinTone: '',
    headline: 'Professional Model',
    bio: '',
    experienceLevel: '',
    modelingTypes: [],
    yearsExperience: '',
    agencies: '',
    unionMembership: '',
    portfolioWebsite: '',
    socialMedia: { 
      instagram: '', 
      tiktok: '', 
      linkedin: '', 
      twitter: '' 
    },
    availability: '',
    travelWillingness: '',
    preferredLocations: [],
    workTypes: [],
    nudityComfort: '',
    rates: { 
      hourly: '', 
      halfDay: '', 
      fullDay: '', 
      currency: 'USD' 
    },
    specialSkills: [],
    wardrobe: '',
    props: '',
    modelType: '',
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
    { number: 1, title: 'Personal', icon: '✦', color: 'from-blue-400 to-blue-600' },
    { number: 2, title: 'Physical', icon: '◈', color: 'from-purple-400 to-purple-600' },
    { number: 3, title: 'Professional', icon: '◊', color: 'from-emerald-400 to-emerald-600' },
    { number: 4, title: 'Portfolio', icon: '◯', color: 'from-pink-400 to-pink-600' },
    { number: 5, title: 'Preferences', icon: '✧', color: 'from-amber-400 to-amber-600' },
    { number: 6, title: 'Rates & Skills', icon: '⬡', color: 'from-rose-400 to-rose-600' },
    { number: 7, title: 'Review', icon: '⬢', color: 'from-indigo-400 to-indigo-600' },
  ], []);

  const options = useMemo(() => ({
    modelingTypes: [
      'Fashion Modeling', 'Commercial Modeling', 'Runway/Catwalk', 'Editorial',
      'Beauty Modeling', 'Fitness Modeling', 'Plus-Size Modeling', 'Petite Modeling',
      'Hand/Foot Modeling', 'Hair Modeling', 'Lingerie Modeling', 'Swimwear Modeling',
      'Art/Figure Modeling', 'Promotional Modeling', 'Trade Show Modeling'
    ],
    bodyTypes: [
      'Straight/Athletic', 'Pear', 'Apple', 'Hourglass', 'Inverted Triangle',
      'Rectangle', 'Plus-Size', 'Petite', 'Tall', 'Curvy'
    ],
    workTypes: [
      'Editorial Shoots', 'Commercial Campaigns', 'Fashion Shows/Runway',
      'Catalog Work', 'E-commerce', 'Lifestyle Shoots', 'Product Modeling',
      'Brand Ambassador', 'Event Modeling', 'Video/Commercial Acting'
    ],
    specialSkills: [
      'Acting', 'Dancing', 'Singing', 'Sports/Athletics', 'Martial Arts',
      'Yoga/Pilates', 'Musical Instruments', 'Languages', 'Acrobatics',
      'Horseback Riding', 'Swimming/Diving', 'Rock Climbing', 'Skateboarding'
    ],
    genders: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'non-binary', label: 'Non-binary' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ],
    experienceLevels: [
      { value: 'beginner', label: 'Beginner (0-2 years)' },
      { value: 'intermediate', label: 'Intermediate (3-5 years)' },
      { value: 'experienced', label: 'Experienced (6-10 years)' },
      { value: 'professional', label: 'Professional (10+ years)' }
    ],
    yearsOptions: [
      { value: '0-2', label: '0-2 years' },
      { value: '3-5', label: '3-5 years' },
      { value: '6-10', label: '6-10 years' },
      { value: '11-15', label: '11-15 years' },
      { value: '15+', label: '15+ years' }
    ],
    modelTypes: [
      { value: 'fashion', label: 'Fashion Model' },
      { value: 'commercial', label: 'Commercial Model' },
      { value: 'runway', label: 'Runway Model' },
      { value: 'editorial', label: 'Editorial Model' },
      { value: 'fitness', label: 'Fitness Model' },
      { value: 'plus-size', label: 'Plus-Size Model' },
      { value: 'petite', label: 'Petite Model' },
      { value: 'mature', label: 'Mature Model' }
    ],
    availability: [
      { value: 'full-time', label: 'Full Time' },
      { value: 'part-time', label: 'Part Time' },
      { value: 'freelance', label: 'Freelance/Project Based' },
      { value: 'weekends-only', label: 'Weekends Only' },
      { value: 'seasonal', label: 'Seasonal' }
    ],
    travel: [
      { value: 'local-only', label: 'Local Only' },
      { value: 'regional', label: 'Regional (within 200 miles)' },
      { value: 'national', label: 'National' },
      { value: 'international', label: 'International' },
      { value: 'anywhere', label: 'Travel Anywhere' }
    ],
    nudityComfort: [
      { value: 'none', label: 'No Nudity' },
      { value: 'implied', label: 'Implied/Covered' },
      { value: 'artistic', label: 'Artistic/Tasteful' },
      { value: 'partial', label: 'Partial Nudity' },
      { value: 'full', label: 'Full Nudity' }
    ],
    heightUnits: [
      { value: 'cm', label: 'cm' },
      { value: 'ft', label: 'ft/in' },
      { value: 'm', label: 'm' }
    ],
    weightUnits: [
      { value: 'kg', label: 'kg' },
      { value: 'lbs', label: 'lbs' }
    ],
    measurementUnits: [
      { value: 'cm', label: 'cm' },
      { value: 'in', label: 'inches' }
    ],
    dressSizeUnits: [
      { value: 'US', label: 'US' },
      { value: 'EU', label: 'EU' },
      { value: 'UK', label: 'UK' }
    ],
    shoeSizeUnits: [
      { value: 'US', label: 'US' },
      { value: 'EU', label: 'EU' },
      { value: 'UK', label: 'UK' }
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

  const handleUnitChange = useCallback((field, unit) => {
    setProfileData(prev => ({ ...prev, [field]: unit }));
  }, []);

  const validateStep = useCallback((step) => {
    const errs = {};
    switch (step) {
      case 1:
        if (!profileData.fullName?.trim()) errs.fullName = 'Full name is required';
        if (!profileData.email || !/^\S+@\S+\.\S+$/.test(profileData.email)) errs.email = 'Valid email is required';
        if (!profileData.phone) errs.phone = 'Phone number is required';
        if (!profileData.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
        if (!profileData.gender) errs.gender = 'Gender is required';
        if (!profileData.location) errs.location = 'Location is required';
        break;
      case 2:
        if (!profileData.height) errs.height = 'Height is required';
        if (!profileData.bust) errs.bust = 'Bust/Chest measurement is required';
        if (!profileData.waist) errs.waist = 'Waist measurement is required';
        if (!profileData.hips) errs.hips = 'Hip measurement is required';
        if (!profileData.bodyType) errs.bodyType = 'Body type is required';
        if (!profileData.hairColor) errs.hairColor = 'Hair color is required';
        if (!profileData.eyeColor) errs.eyeColor = 'Eye color is required';
        break;
      case 3:
        if (!profileData.headline) errs.headline = 'Professional headline is required';
        if (!profileData.bio) errs.bio = 'Bio is required';
        if (!profileData.experienceLevel) errs.experienceLevel = 'Experience level is required';
        if (!profileData.yearsExperience) errs.yearsExperience = 'Years of experience is required';
        if (!profileData.modelType) errs.modelType = 'Model type is required';
        if (profileData.modelingTypes.length === 0) errs.modelingTypes = 'Select at least one modeling type';
        break;
      case 5:
        if (!profileData.availability) errs.availability = 'Availability is required';
        if (!profileData.travelWillingness) errs.travelWillingness = 'Travel willingness is required';
        if (!profileData.nudityComfort) errs.nudityComfort = 'Nudity comfort level is required';
        if (profileData.workTypes.length === 0) errs.workTypes = 'Select at least one work type';
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
                <span className="text-gradient-gold">✦</span>
              </div>
              <h2 className="text-3xl font-display font-light text-white mb-3">Personal <span className="text-gradient-gold">Information</span></h2>
              <p className="text-gray-400 font-light">Begin your journey with the essential details</p>
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
                options={options.genders}
                placeholder="Select gender"
                error={errors.gender}
                required
              />
              <FormInput
                label="Nationality"
                value={profileData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                placeholder="e.g., American, British"
              />
            </div>
            
            <div className="mt-6 space-y-6">
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
                value={profileData.languages}
                onChange={(e) => handleInputChange('languages', e.target.value)}
                placeholder="English, Spanish, French (comma separated)"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div {...commonProps}>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
                <span className="text-gradient-gold">◈</span>
              </div>
              <h2 className="text-3xl font-display font-light text-white mb-3">Physical <span className="text-gradient-gold">Attributes</span></h2>
              <p className="text-gray-400 font-light">Define your distinctive physical profile</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Height"
                value={profileData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="173"
                error={errors.height}
                required
                unit={profileData.heightUnit}
                onUnitChange={(e) => handleUnitChange('heightUnit', e.target.value)}
                unitOptions={options.heightUnits}
              />
              <FormInput
                label="Weight"
                value={profileData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="59"
                unit={profileData.weightUnit}
                onUnitChange={(e) => handleUnitChange('weightUnit', e.target.value)}
                unitOptions={options.weightUnits}
              />
              <FormInput
                label="Bust/Chest"
                value={profileData.bust}
                onChange={(e) => handleInputChange('bust', e.target.value)}
                placeholder="86"
                error={errors.bust}
                required
                unit={profileData.bustUnit}
                onUnitChange={(e) => handleUnitChange('bustUnit', e.target.value)}
                unitOptions={options.measurementUnits}
              />
              <FormInput
                label="Waist"
                value={profileData.waist}
                onChange={(e) => handleInputChange('waist', e.target.value)}
                placeholder="66"
                error={errors.waist}
                required
                unit={profileData.waistUnit}
                onUnitChange={(e) => handleUnitChange('waistUnit', e.target.value)}
                unitOptions={options.measurementUnits}
              />
              <FormInput
                label="Hips"
                value={profileData.hips}
                onChange={(e) => handleInputChange('hips', e.target.value)}
                placeholder="91"
                error={errors.hips}
                required
                unit={profileData.hipsUnit}
                onUnitChange={(e) => handleUnitChange('hipsUnit', e.target.value)}
                unitOptions={options.measurementUnits}
              />
              <FormInput
                label="Dress Size"
                value={profileData.dressSize}
                onChange={(e) => handleInputChange('dressSize', e.target.value)}
                placeholder="6"
                unit={profileData.dressSizeUnit}
                onUnitChange={(e) => handleUnitChange('dressSizeUnit', e.target.value)}
                unitOptions={options.dressSizeUnits}
              />
              <FormInput
                label="Shoe Size"
                value={profileData.shoeSize}
                onChange={(e) => handleInputChange('shoeSize', e.target.value)}
                placeholder="8"
                unit={profileData.shoeSizeUnit}
                onUnitChange={(e) => handleUnitChange('shoeSizeUnit', e.target.value)}
                unitOptions={options.shoeSizeUnits}
              />
              <FormSelect
                label="Body Type"
                value={profileData.bodyType}
                onChange={(e) => handleInputChange('bodyType', e.target.value)}
                options={options.bodyTypes.map(type => ({ value: type, label: type }))}
               placeholder="Select body type"
               error={errors.bodyType}
               required
             />
             <FormInput
               label="Hair Color"
               value={profileData.hairColor}
               onChange={(e) => handleInputChange('hairColor', e.target.value)}
               placeholder="Blonde, Brunette, Black"
               error={errors.hairColor}
               required
             />
             <FormInput
               label="Eye Color"
               value={profileData.eyeColor}
               onChange={(e) => handleInputChange('eyeColor', e.target.value)}
               placeholder="Blue, Brown, Green"
               error={errors.eyeColor}
               required
             />
             <FormInput
               label="Skin Tone"
               value={profileData.skinTone}
               onChange={(e) => handleInputChange('skinTone', e.target.value)}
               placeholder="Fair, Medium, Olive"
             />
           </div>
         </div>
       );

     case 3:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-gold">◊</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Professional <span className="text-gradient-gold">Information</span></h2>
             <p className="text-gray-400 font-light">Craft your professional narrative and expertise</p>
           </div>
           
           <div className="space-y-6">
             <FormInput
               label="Professional Headline"
               value={profileData.headline}
               onChange={(e) => handleInputChange('headline', e.target.value)}
               placeholder="e.g., Fashion Model & Brand Ambassador"
               error={errors.headline}
               required
             />
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <FormSelect
                 label="Experience Level"
                 value={profileData.experienceLevel}
                 onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                 options={options.experienceLevels}
                 placeholder="Select level"
                 error={errors.experienceLevel}
                 required
               />
               <FormSelect
                 label="Years of Experience"
                 value={profileData.yearsExperience}
                 onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                 options={options.yearsOptions}
                 placeholder="Select years"
                 error={errors.yearsExperience}
                 required
               />
               <FormSelect
                 label="Model Type"
                 value={profileData.modelType}
                 onChange={(e) => handleInputChange('modelType', e.target.value)}
                 options={options.modelTypes}
                 placeholder="Select type"
                 error={errors.modelType}
                 required
               />
             </div>
             
             <FormTextarea
               label="Bio/About You"
               value={profileData.bio}
               onChange={(e) => handleInputChange('bio', e.target.value)}
               placeholder="Share your story, experience, and what makes you unique as a model..."
               error={errors.bio}
               required
               rows={5}
             />

             <FormCheckboxGroup
               label="Modeling Specialties"
               options={options.modelingTypes}
               selectedValues={profileData.modelingTypes}
               onChange={(values) => handleInputChange('modelingTypes', values)}
               error={errors.modelingTypes}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Agencies (Current/Previous)"
                 value={profileData.agencies}
                 onChange={(e) => handleInputChange('agencies', e.target.value)}
                 placeholder="List modeling agencies you've worked with..."
                 rows={3}
               />
               <FormInput
                 label="Union Memberships"
                 value={profileData.unionMembership}
                 onChange={(e) => handleInputChange('unionMembership', e.target.value)}
                 placeholder="SAG-AFTRA, AEA, etc."
               />
             </div>
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
             <h2 className="text-3xl font-display font-light text-white mb-3">Portfolio & <span className="text-gradient-gold">Social Media</span></h2>
             <p className="text-gray-400 font-light">Elevate your digital presence across platforms</p>
           </div>
           
           <div className="space-y-6">
             <FormInput
               label="Portfolio Website"
               type="url"
               value={profileData.portfolioWebsite}
               onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
               placeholder="https://yourportfolio.com"
             />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormInput
                 label="Instagram"
                 value={profileData.socialMedia.instagram}
                 onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                 placeholder="@yourusername"
               />
               <FormInput
                 label="TikTok"
                 value={profileData.socialMedia.tiktok}
                 onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                 placeholder="@yourusername"
               />
               <FormInput
                 label="LinkedIn"
                 value={profileData.socialMedia.linkedin}
                 onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                 placeholder="linkedin.com/in/yourprofile"
               />
               <FormInput
                 label="Twitter/X"
                 value={profileData.socialMedia.twitter}
                 onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                 placeholder="@yourusername"
               />
             </div>
             
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                 <span className="text-accent-gold mr-2">✧</span> Portfolio Tips
               </h3>
               <ul className="text-gray-300 text-sm space-y-2">
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Include your best 10-15 professional photos</li>
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Show variety in poses, lighting, and styling</li>
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Keep your social media professional and updated</li>
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Use consistent branding across all platforms</li>
               </ul>
             </div>
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
             <h2 className="text-3xl font-display font-light text-white mb-3">Work <span className="text-gradient-gold">Preferences</span></h2>
             <p className="text-gray-400 font-light">Define your ideal work environment and boundaries</p>
           </div>
           
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormSelect
                 label="Availability"
                 value={profileData.availability}
                 onChange={(e) => handleInputChange('availability', e.target.value)}
                 options={options.availability}
                 placeholder="Select availability"
                 error={errors.availability}
                 required
               />
               <FormSelect
                 label="Travel Willingness"
                 value={profileData.travelWillingness}
                 onChange={(e) => handleInputChange('travelWillingness', e.target.value)}
                 options={options.travel}
                 placeholder="Select travel preference"
                 error={errors.travelWillingness}
                 required
               />
             </div>

             <FormInput
               label="Preferred Locations"
               value={profileData.preferredLocations.join(', ')}
               onChange={(e) => handleInputChange('preferredLocations', e.target.value.split(',').map(l => l.trim()).filter(l => l))}
               placeholder="New York, Los Angeles, Miami (comma separated)"
             />

             <FormCheckboxGroup
               label="Work Types"
               options={options.workTypes}
               selectedValues={profileData.workTypes}
               onChange={(values) => handleInputChange('workTypes', values)}
               error={errors.workTypes}
               columns={2}
             />

             <FormSelect
               label="Nudity Comfort Level"
               value={profileData.nudityComfort}
               onChange={(e) => handleInputChange('nudityComfort', e.target.value)}
               options={options.nudityComfort}
               placeholder="Select comfort level"
               error={errors.nudityComfort}
               required
             />

             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                 <span className="text-accent-gold mr-2">⚠</span> Important Note
               </h3>
               <p className="text-gray-300 text-sm">
                 All work preferences can be updated at any time. You have full control over 
                 what types of jobs you accept and your comfort levels for different types of modeling work.
               </p>
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
             <h2 className="text-3xl font-display font-light text-white mb-3">Rates & <span className="text-gradient-gold">Special Skills</span></h2>
             <p className="text-gray-400 font-light">Showcase your value and unique talents</p>
           </div>
           
           <div className="space-y-6">
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                 <span className="text-accent-gold mr-2">💰</span> Rate Information
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <FormInput
                   label="Hourly Rate"
                   type="number"
                   value={profileData.rates.hourly}
                   onChange={(e) => handleInputChange('rates.hourly', e.target.value)}
                   placeholder="150"
                 />
                 <FormInput
                   label="Half Day Rate"
                   type="number"
                   value={profileData.rates.halfDay}
                   onChange={(e) => handleInputChange('rates.halfDay', e.target.value)}
                   placeholder="800"
                 />
                 <FormInput
                   label="Full Day Rate"
                   type="number"
                   value={profileData.rates.fullDay}
                   onChange={(e) => handleInputChange('rates.fullDay', e.target.value)}
                   placeholder="1500"
                 />
                 <FormSelect
                   label="Currency"
                   value={profileData.rates.currency}
                   onChange={(e) => handleInputChange('rates.currency', e.target.value)}
                   options={options.currencies}
                   placeholder="Currency"
                 />
               </div>
               <p className="text-gray-400 text-sm mt-3">
                 These are starting rates. Final rates are always negotiable based on the specific project.
               </p>
             </div>

             <FormCheckboxGroup
               label="Special Skills & Talents"
               options={options.specialSkills}
               selectedValues={profileData.specialSkills}
               onChange={(values) => handleInputChange('specialSkills', values)}
               columns={3}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Wardrobe Description"
                 value={profileData.wardrobe}
                 onChange={(e) => handleInputChange('wardrobe', e.target.value)}
                 placeholder="Describe your available wardrobe (business attire, casual wear, formal dresses, etc.)"
                 rows={4}
               />
               <FormTextarea
                 label="Props & Equipment"
                 value={profileData.props}
                 onChange={(e) => handleInputChange('props', e.target.value)}
                 placeholder="Any props, equipment, or special items you can provide for shoots"
                 rows={4}
               />
             </div>
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
             <h2 className="text-3xl font-display font-light text-white mb-3">Review & <span className="text-gradient-gold">Submit</span></h2>
             <p className="text-gray-400 font-light">Finalize your professional portfolio</p>
           </div>
           
           <div className="space-y-8">
             {/* Personal Information Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">✦</span>
                 Personal Information
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Name:</span> <span className="text-white">{profileData.fullName}</span></div>
                 <div><span className="text-gray-400">Email:</span> <span className="text-white">{profileData.email}</span></div>
                 <div><span className="text-gray-400">Phone:</span> <span className="text-white">{profileData.phone}</span></div>
                 <div><span className="text-gray-400">Location:</span> <span className="text-white">{profileData.location}</span></div>
                 <div><span className="text-gray-400">Gender:</span> <span className="text-white">{profileData.gender}</span></div>
                 <div><span className="text-gray-400">Nationality:</span> <span className="text-white">{profileData.nationality}</span></div>
               </div>
             </div>

             {/* Physical Attributes Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◈</span>
                 Physical Attributes
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                 <div><span className="text-gray-400">Height:</span> <span className="text-white">{profileData.height} {profileData.heightUnit}</span></div>
                 <div><span className="text-gray-400">Weight:</span> <span className="text-white">{profileData.weight} {profileData.weightUnit}</span></div>
                 <div><span className="text-gray-400">Bust/Chest:</span> <span className="text-white">{profileData.bust} {profileData.bustUnit}</span></div>
                 <div><span className="text-gray-400">Waist:</span> <span className="text-white">{profileData.waist} {profileData.waistUnit}</span></div>
                 <div><span className="text-gray-400">Hips:</span> <span className="text-white">{profileData.hips} {profileData.hipsUnit}</span></div>
                 <div><span className="text-gray-400">Body Type:</span> <span className="text-white">{profileData.bodyType}</span></div>
                 <div><span className="text-gray-400">Hair:</span> <span className="text-white">{profileData.hairColor}</span></div>
                 <div><span className="text-gray-400">Eyes:</span> <span className="text-white">{profileData.eyeColor}</span></div>
               </div>
             </div>

             {/* Professional Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◊</span>
                 Professional Information
               </h3>
               <div className="space-y-3 text-sm">
                 <div><span className="text-gray-400">Headline:</span> <span className="text-white">{profileData.headline}</span></div>
                 <div><span className="text-gray-400">Experience:</span> <span className="text-white">{profileData.experienceLevel} ({profileData.yearsExperience})</span></div>
                 <div><span className="text-gray-400">Model Type:</span> <span className="text-white">{profileData.modelType}</span></div>
                 <div><span className="text-gray-400">Specialties:</span> <span className="text-white">{profileData.modelingTypes.join(', ')}</span></div>
                 {profileData.bio && (
                   <div><span className="text-gray-400">Bio:</span> <span className="text-white">{profileData.bio.substring(0, 200)}...</span></div>
                 )}
               </div>
             </div>

             {/* Rates Summary */}
             {(profileData.rates.hourly || profileData.rates.halfDay || profileData.rates.fullDay) && (
               <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
                 <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                   <span className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">⬡</span>
                   Rate Information
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                   {profileData.rates.hourly && (
                     <div><span className="text-gray-400">Hourly:</span> <span className="text-white">{profileData.rates.currency} {profileData.rates.hourly}</span></div>
                   )}
                   {profileData.rates.halfDay && (
                     <div><span className="text-gray-400">Half Day:</span> <span className="text-white">{profileData.rates.currency} {profileData.rates.halfDay}</span></div>
                   )}
                   {profileData.rates.fullDay && (
                     <div><span className="text-gray-400">Full Day:</span> <span className="text-white">{profileData.rates.currency} {profileData.rates.fullDay}</span></div>
                   )}
                 </div>
               </div>
             )}

             <div className="glass-effect-strong rounded-xl p-6 border border-emerald-500/30">
               <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 </div>
                 <div>
                   <h4 className="text-accent-gold font-medium">Ready to Launch</h4>
                   <p className="text-gray-300 text-sm">Your portfolio is complete. Click submit to launch your professional profile.</p>
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
               <h1 className="text-xl font-display font-light text-white">ZANARA <span className="text-accent-gold">Profile Setup</span></h1>
               <p className="text-gray-400 text-sm">Complete your professional modeling profile</p>
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
       ZANARA · Premium Model Experience
     </div>
   </div>
 );
};

export default ModelProfileSetup;