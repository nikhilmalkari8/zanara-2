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

const StylistProfileSetup = ({
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
    { number: 1, title: 'Personal', icon: '✦', color: 'from-purple-400 to-purple-600' },
    { number: 2, title: 'Professional', icon: '◈', color: 'from-blue-400 to-blue-600' },
    { number: 3, title: 'Specializations', icon: '◊', color: 'from-emerald-400 to-emerald-600' },
    { number: 4, title: 'Services', icon: '◯', color: 'from-pink-400 to-pink-600' },
    { number: 5, title: 'Business', icon: '✧', color: 'from-amber-400 to-amber-600' },
    { number: 6, title: 'Portfolio', icon: '⬡', color: 'from-rose-400 to-rose-600' },
    { number: 7, title: 'Review', icon: '⬢', color: 'from-indigo-400 to-indigo-600' },
  ], []);

  const options = useMemo(() => ({
    stylingTypes: [
      'Editorial Styling', 'Personal Styling', 'Commercial Styling',
      'Celebrity Styling', 'Wardrobe Consulting', 'E-commerce Styling',
      'Event Styling', 'Red Carpet Styling', 'Music Video Styling',
      'Fashion Show Styling', 'Photoshoot Styling', 'Brand Styling',
      'Corporate Styling', 'Bridal Styling', 'Maternity Styling'
    ],
    clientTypes: [
      'Individual Clients', 'Fashion Brands', 'Photographers', 'Models',
      'Celebrities', 'Influencers', 'Corporate Executives', 'Brides',
      'Fashion Magazines', 'Advertising Agencies', 'E-commerce Brands',
      'Music Artists', 'TV/Film Productions', 'Event Planners'
    ],
    fashionCategories: [
      'Womenswear', 'Menswear', 'Plus-Size Fashion', 'Petite Fashion',
      'Maternity Fashion', 'Teen/Young Adult', 'Professional/Corporate',
      'Casual/Everyday', 'Formal/Evening', 'Street Style', 'Vintage/Retro',
      'Sustainable Fashion', 'Luxury Fashion', 'Budget-Friendly'
    ],
    styleAesthetics: [
      'Minimalist', 'Bohemian', 'Classic/Timeless', 'Edgy/Alternative',
      'Romantic/Feminine', 'Sporty/Athletic', 'Preppy', 'Glamorous',
      'Vintage-Inspired', 'Street Style', 'Avant-Garde', 'Scandinavian',
      'Mediterranean', 'Urban Chic', 'Country/Rustic'
    ],
    servicesOffered: [
      'Personal Shopping', 'Wardrobe Audit', 'Closet Organization',
      'Color Analysis', 'Body Type Consultation', 'Occasion Styling',
      'Capsule Wardrobe Creation', 'Shopping List Creation',
      'Style Education/Training', 'Fashion Photography Direction',
      'Trend Forecasting', 'Brand Consulting', 'Styling Workshops'
    ],
    designerKnowledge: [
      'High-End Designers', 'Contemporary Brands', 'Fast Fashion',
      'Sustainable Brands', 'Emerging Designers', 'Vintage Collectors',
      'International Brands', 'Local/Independent Brands', 'Accessories Specialists',
      'Footwear Brands', 'Beauty Brands', 'Lifestyle Brands'
    ],
    workEnvironments: [
      'Client Homes', 'Retail Stores', 'Photography Studios', 'Fashion Shows',
      'Corporate Offices', 'Special Events', 'Virtual Consultations',
      'Fashion Weeks', 'Trade Shows', 'Red Carpet Events'
    ],
    yearsExperience: [
      { value: '0-1', label: '0-1 years (New Stylist)' },
      { value: '2-3', label: '2-3 years (Developing)' },
      { value: '4-6', label: '4-6 years (Experienced)' },
      { value: '7-10', label: '7-10 years (Senior Stylist)' },
      { value: '10+', label: '10+ years (Master Stylist)' }
    ],
    availability: [
      { value: 'full-time', label: 'Full Time' },
      { value: 'part-time', label: 'Part Time' },
      { value: 'freelance', label: 'Freelance/Project Based' },
      { value: 'weekends-only', label: 'Weekends Only' },
      { value: 'seasonal', label: 'Seasonal' }
    ],
    travelWillingness: [
      { value: 'local-only', label: 'Local Only (0-50 miles)' },
      { value: 'regional', label: 'Regional (50-200 miles)' },
      { value: 'national', label: 'National' },
      { value: 'international', label: 'International' },
      { value: 'anywhere', label: 'Travel Anywhere' }
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
        if (profileData.stylingTypes.length === 0) errs.stylingTypes = 'Select at least one styling type';
        if (profileData.clientTypes.length === 0) errs.clientTypes = 'Select at least one client type';
        break;
      case 4:
        if (profileData.servicesOffered.length === 0) errs.servicesOffered = 'Select at least one service offered';
        break;
      case 6:
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
      await new Promise(r => setTimeout(r, 2000));
      onProfileComplete?.();
    } catch (e) {
      console.error('Profile submission failed:', e);
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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
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
              <p className="text-gray-400 font-light">Tell us about your styling journey and expertise</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  options={options.yearsExperience}
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
                rows={5}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormTextarea
                  label="Education & Training"
                  value={profileData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Fashion school, styling courses, workshops"
                  rows={3}
                />
                <FormTextarea
                  label="Certifications"
                  value={profileData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="Color analysis certification, etc."
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
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
                <span className="text-gradient-gold">◊</span>
              </div>
              <h2 className="text-3xl font-display font-light text-white mb-3">Styling <span className="text-gradient-gold">Specializations</span></h2>
              <p className="text-gray-400 font-light">Define your styling focus and client preferences</p>
            </div>
            
            <div className="space-y-8">
              <FormCheckboxGroup
                label="Styling Types"
                options={options.stylingTypes}
                selectedValues={profileData.stylingTypes}
                onChange={(values) => handleInputChange('stylingTypes', values)}
                error={errors.stylingTypes}
                columns={3}
              />

              <FormCheckboxGroup
                label="Client Types"
                options={options.clientTypes}
                selectedValues={profileData.clientTypes}
                onChange={(values) => handleInputChange('clientTypes', values)}
                error={errors.clientTypes}
                columns={3}
              />

              <FormCheckboxGroup
                label="Fashion Categories"
                options={options.fashionCategories}
                selectedValues={profileData.fashionCategories}
                onChange={(values) => handleInputChange('fashionCategories', values)}
                columns={3}
              />

              <FormCheckboxGroup
                label="Style Aesthetics"
                options={options.styleAesthetics}
                selectedValues={profileData.styleAesthetics}
                onChange={(values) => handleInputChange('styleAesthetics', values)}
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
              <h2 className="text-3xl font-display font-light text-white mb-3">Services & <span className="text-gradient-gold">Expertise</span></h2>
              <p className="text-gray-400 font-light">Showcase your skills and service offerings</p>
            </div>
            
            <div className="space-y-8">
              <FormCheckboxGroup
                label="Services Offered"
                options={options.servicesOffered}
                selectedValues={profileData.servicesOffered}
                onChange={(values) => handleInputChange('servicesOffered', values)}
                error={errors.servicesOffered}
                columns={3}
              />

              <FormCheckboxGroup
                label="Designer & Brand Knowledge"
                options={options.designerKnowledge}
                selectedValues={profileData.designerKnowledge}
                onChange={(values) => handleInputChange('designerKnowledge', values)}
                columns={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormTextarea
                  label="Brand Relationships"
                  value={profileData.brandRelationships}
                  onChange={(e) => handleInputChange('brandRelationships', e.target.value)}
                  placeholder="PR contacts, showroom access, etc."
                  rows={4}
                />
                <FormTextarea
                  label="Trend Forecasting Experience"
                  value={profileData.trendForecasting}
                  onChange={(e) => handleInputChange('trendForecasting', e.target.value)}
                  placeholder="Experience predicting fashion trends"
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Specialized Services</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={profileData.colorAnalysis}
                          onChange={(e) => handleInputChange('colorAnalysis', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                          profileData.colorAnalysis ? 'bg-accent-gold border-accent-gold' : 'border-gray-500 group-hover:border-gray-400'
                        }`}>
                          {profileData.colorAnalysis && (
                            <svg className="w-3 h-3 text-primary-black m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-white">I offer professional color analysis services</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={profileData.bodyTypeExpertise}
                          onChange={(e) => handleInputChange('bodyTypeExpertise', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                          profileData.bodyTypeExpertise ? 'bg-accent-gold border-accent-gold' : 'border-gray-500 group-hover:border-gray-400'
                        }`}>
                          {profileData.bodyTypeExpertise && (
                            <svg className="w-3 h-3 text-primary-black m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-white">I specialize in body type consultation</span>
                    </label>
                  </div>
                </div>
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
              <h2 className="text-3xl font-display font-light text-white mb-3">Business & <span className="text-gradient-gold">Rates</span></h2>
              <p className="text-gray-400 font-light">Define your business model and pricing structure</p>
            </div>
            
            <div className="space-y-6">
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <span className="text-accent-gold mr-2">💰</span> Rate Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormInput
                    label="Initial Consultation Rate"
                    type="number"
                    value={profileData.rates.consultation}
                    onChange={(e) => handleInputChange('rates.consultation', e.target.value)}
                    placeholder="150"
                  />
                  <FormInput
                    label="Personal Styling Session"
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
                    label="Shopping Service (Hourly)"
                    type="number"
                    value={profileData.rates.shoppingHourly}
                    onChange={(e) => handleInputChange('rates.shoppingHourly', e.target.value)}
                    placeholder="100"
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
                label="Package Deals"
                value={profileData.rates.packageDeals}
                onChange={(e) => handleInputChange('rates.packageDeals', e.target.value)}
                placeholder="e.g., 'Wardrobe Overhaul: $2500 includes consultation, shopping, 3 sessions'"
                rows={4}
              />
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormTextarea
                  label="Consultation Process"
                  value={profileData.consultationProcess}
                  onChange={(e) => handleInputChange('consultationProcess', e.target.value)}
                  placeholder="Describe what clients can expect during consultations"
                  rows={4}
                />
                <FormSelect
                  label="Availability"
                  value={profileData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  options={options.availability}
                  placeholder="Select availability"
                />
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect
                  label="Travel Willingness"
                  value={profileData.travelWillingness}
                  onChange={(e) => handleInputChange('travelWillingness', e.target.value)}
                  options={options.travelWillingness}
                  placeholder="Select travel preference"
                />
                <FormTextarea
                  label="Collaboration Style"
                  value={profileData.collaborationStyle}
                  onChange={(e) => handleInputChange('collaborationStyle', e.target.value)}
                  placeholder="Describe your working style and approach to collaborating with clients and teams"
                  rows={4}
                />
              </div>
 
              <FormCheckboxGroup
                label="Work Environments"
                options={options.workEnvironments}
                selectedValues={profileData.workEnvironments}
                onChange={(values) => handleInputChange('workEnvironments', values)}
                columns={3}
              />
 
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Additional Services</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={profileData.shoppingServices}
                        onChange={(e) => handleInputChange('shoppingServices', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        profileData.shoppingServices ? 'bg-accent-gold border-accent-gold' : 'border-gray-500 group-hover:border-gray-400'
                      }`}>
                        {profileData.shoppingServices && (
                          <svg className="w-3 h-3 text-primary-black m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-white">I offer personal shopping services</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={profileData.wardrobeAudit}
                        onChange={(e) => handleInputChange('wardrobeAudit', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        profileData.wardrobeAudit ? 'bg-accent-gold border-accent-gold' : 'border-gray-500 group-hover:border-gray-400'
                      }`}>
                        {profileData.wardrobeAudit && (
                          <svg className="w-3 h-3 text-primary-black m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-white">I provide wardrobe audit services</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={profileData.closetOrganization}
                        onChange={(e) => handleInputChange('closetOrganization', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        profileData.closetOrganization ? 'bg-accent-gold border-accent-gold' : 'border-gray-500 group-hover:border-gray-400'
                      }`}>
                        {profileData.closetOrganization && (
                          <svg className="w-3 h-3 text-primary-black m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-white">I offer closet organization services</span>
                  </label>
                </div>
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
              <h2 className="text-3xl font-display font-light text-white mb-3">Portfolio & <span className="text-gradient-gold">Social Media</span></h2>
              <p className="text-gray-400 font-light">Showcase your work and professional presence</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormTextarea
                  label="Editorial Work"
                  value={profileData.editorialWork}
                  onChange={(e) => handleInputChange('editorialWork', e.target.value)}
                  placeholder="Describe your editorial styling work, publications, campaigns"
                  rows={4}
                />
                <FormTextarea
                  label="Brand Collaborations"
                  value={profileData.brandCollaborations}
                  onChange={(e) => handleInputChange('brandCollaborations', e.target.value)}
                  placeholder="Notable brand partnerships and collaborations"
                  rows={4}
                />
                <FormTextarea
                  label="Celebrity Clients"
                  value={profileData.celebrityClients}
                  onChange={(e) => handleInputChange('celebrityClients', e.target.value)}
                  placeholder="High-profile clients you've worked with (if comfortable sharing)"
                  rows={4}
                />
                <FormTextarea
                  label="Publications"
                  value={profileData.publications}
                  onChange={(e) => handleInputChange('publications', e.target.value)}
                  placeholder="Magazines, blogs, websites where your work has been featured"
                  rows={4}
                />
              </div>
 
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                  <span className="text-accent-gold mr-2">✧</span> Portfolio Tips
                </h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Include before/after styling transformations</li>
                  <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Show variety in styles and client types</li>
                  <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Document your creative process and inspiration</li>
                  <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Keep your portfolio updated with recent work</li>
                </ul>
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
              <p className="text-gray-400 font-light">Finalize your professional stylist profile</p>
            </div>
            
            <div className="space-y-8">
              {/* Personal Information Summary */}
              <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
                <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">✦</span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Name:</span> <span className="text-white">{profileData.fullName}</span></div>
                  <div><span className="text-gray-400">Email:</span> <span className="text-white">{profileData.email}</span></div>
                  <div><span className="text-gray-400">Phone:</span> <span className="text-white">{profileData.phone}</span></div>
                  <div><span className="text-gray-400">Location:</span> <span className="text-white">{profileData.location}</span></div>
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
                  <div><span className="text-gray-400">Color Analysis:</span> <span className="text-white">{profileData.colorAnalysis ? 'Yes' : 'No'}</span></div>
                  <div><span className="text-gray-400">Body Type Expertise:</span> <span className="text-white">{profileData.bodyTypeExpertise ? 'Yes' : 'No'}</span></div>
                  {profileData.bio && (
                    <div><span className="text-gray-400">Bio:</span> <span className="text-white">{profileData.bio.substring(0, 200)}...</span></div>
                  )}
                </div>
              </div>
 
              {/* Specializations Summary */}
              <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
                <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◊</span>
                  Styling Specializations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Styling Types:</span> <span className="text-white">{profileData.stylingTypes.slice(0, 3).join(', ')}{profileData.stylingTypes.length > 3 ? '...' : ''}</span></div>
                  <div><span className="text-gray-400">Client Types:</span> <span className="text-white">{profileData.clientTypes.slice(0, 3).join(', ')}{profileData.clientTypes.length > 3 ? '...' : ''}</span></div>
                  <div><span className="text-gray-400">Fashion Categories:</span> <span className="text-white">{profileData.fashionCategories.slice(0, 3).join(', ')}{profileData.fashionCategories.length > 3 ? '...' : ''}</span></div>
                  <div><span className="text-gray-400">Style Aesthetics:</span> <span className="text-white">{profileData.styleAesthetics.slice(0, 3).join(', ')}{profileData.styleAesthetics.length > 3 ? '...' : ''}</span></div>
                </div>
              </div>
 
              {/* Services Summary */}
              <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
                <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◯</span>
                  Services & Rates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Services:</span> <span className="text-white">{profileData.servicesOffered.length} offerings</span></div>
                  {profileData.rates.consultation && (
                    <div><span className="text-gray-400">Consultation Rate:</span> <span className="text-white">{profileData.rates.currency} {profileData.rates.consultation}</span></div>
                  )}
                  {profileData.rates.personalStyling && (
                    <div><span className="text-gray-400">Personal Styling:</span> <span className="text-white">{profileData.rates.currency} {profileData.rates.personalStyling}</span></div>
                  )}
                  <div><span className="text-gray-400">Shopping Services:</span> <span className="text-white">{profileData.shoppingServices ? 'Yes' : 'No'}</span></div>
                </div>
              </div>
 
              {/* Portfolio Summary */}
              <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
                <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">⬡</span>
                  Portfolio & Presence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Portfolio:</span> <span className="text-white">{profileData.portfolioWebsite || 'Not provided'}</span></div>
                  <div><span className="text-gray-400">Instagram:</span> <span className="text-white">{profileData.socialMedia.instagram || 'Not provided'}</span></div>
                  <div><span className="text-gray-400">Availability:</span> <span className="text-white">{
                    options.availability.find(option => option.value === profileData.availability)?.label || 
                    profileData.availability || 'Not specified'
                  }</span></div>
                  <div><span className="text-gray-400">Travel:</span> <span className="text-white">{
                    options.travelWillingness.find(option => option.value === profileData.travelWillingness)?.label || 
                    profileData.travelWillingness || 'Not specified'
                  }</span></div>
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
                    <p className="text-gray-300 text-sm">Your stylist profile is complete. Click submit to launch your professional profile.</p>
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
                <h1 className="text-xl font-display font-light text-white">ZANARA <span className="text-accent-gold">Stylist Setup</span></h1>
                <p className="text-gray-400 text-sm">Complete your professional fashion stylist profile</p>
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
       ZANARA · Premium Stylist Experience
     </div>
   </div>
 );
};

export default StylistProfileSetup;