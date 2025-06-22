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
}) {
  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-gold transition-colors duration-200">
        {label} {required && <span className="text-accent-gold">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 
            focus:outline-none focus:border-accent-gold/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-gold/20
            transition-all duration-300 hover:border-gray-500/70 ${error ? 'border-rose-500 focus:border-rose-400' : ''} ${className}`}
        />
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

const FashionDesignerProfileSetup = ({
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
    nationality: '',
    languages: [],
    
    // Professional Information
    headline: 'Fashion Designer',
    bio: '',
    yearsExperience: '',
    education: '',
    designPhilosophy: '',
    
    // Design Specializations
    designCategories: [],
    productTypes: [],
    designStyles: [],
    targetMarket: [],
    
    // Technical Skills
    technicalSkills: [],
    softwareSkills: [],
    constructionSkills: [],
    materialKnowledge: [],
    
    // Business & Production
    businessModel: '',
    productionCapacity: '',
    manufacturingKnowledge: '',
    sustainabilityPractices: '',
    qualityStandards: '',
    
    // Portfolio & Collections
    portfolioWebsite: '',
    collections: '',
    designAwards: '',
    exhibitions: '',
    collaborations: '',
    
    // Social Media & Professional
    socialMedia: {
      instagram: '',
      behance: '',
      linkedin: '',
      website: '',
      blog: ''
    },
    
    // Services & Pricing
    servicesOffered: [],
    customDesign: false,
    consultingServices: false,
    rates: {
      consultationHourly: '',
      customDesignStarting: '',
      patternMaking: '',
      technicalDrawings: '',
      currency: 'USD'
    },
    
    // Work Preferences
    availability: '',
    projectTypes: [],
    collaborationStyle: '',
    clientTypes: []
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
    { number: 4, title: 'Technical Skills', icon: '◯', color: 'from-pink-400 to-pink-600' },
    { number: 5, title: 'Business', icon: '✧', color: 'from-amber-400 to-amber-600' },
    { number: 6, title: 'Portfolio', icon: '⬡', color: 'from-rose-400 to-rose-600' },
    { number: 7, title: 'Services', icon: '⬢', color: 'from-indigo-400 to-indigo-600' },
    { number: 8, title: 'Review', icon: '⬟', color: 'from-cyan-400 to-cyan-600' },
  ], []);

  const options = useMemo(() => ({
    designCategories: [
      'Womenswear', 'Menswear', 'Childrenswear', 'Plus-Size Fashion',
      'Petite Fashion', 'Maternity Fashion', 'Unisex Fashion', 'Accessories',
      'Footwear', 'Bags & Handbags', 'Jewelry', 'Lingerie & Intimates',
      'Swimwear', 'Activewear & Sportswear', 'Outerwear', 'Formal/Evening Wear'
    ],
    productTypes: [
      'Dresses', 'Tops & Blouses', 'Pants & Trousers', 'Skirts', 'Suits',
      'Jackets & Blazers', 'Coats', 'Knitwear', 'T-Shirts & Casual Tops',
      'Jeans & Denim', 'Shorts', 'Jumpsuits & Rompers', 'Sleepwear',
      'Undergarments', 'Scarves & Wraps', 'Hats & Headwear'
    ],
    designStyles: [
      'Minimalist', 'Avant-Garde', 'Classic/Timeless', 'Bohemian',
      'Urban/Street Style', 'Vintage-Inspired', 'Romantic/Feminine',
      'Edgy/Alternative', 'Preppy', 'Glamorous', 'Casual/Relaxed',
      'Formal/Professional', 'Sustainable/Eco-Friendly', 'High Fashion',
      'Contemporary', 'Retro/Nostalgic'
    ],
    targetMarket: [
      'Luxury ($500+)', 'Contemporary ($100-500)', 'Bridge ($50-150)',
      'Fast Fashion ($10-50)', 'Budget-Friendly (<$25)', 'Custom/Couture',
      'Sustainable Fashion', 'Slow Fashion', 'Made-to-Order',
      'Limited Edition', 'Mass Market', 'Niche Market'
    ],
    technicalSkills: [
      'Pattern Making', 'Pattern Grading', 'Draping', 'Flat Pattern Design',
      'Garment Construction', 'Fitting & Alterations', 'Technical Drawing',
      'Specification Writing', 'Size Chart Development', 'Cost Analysis',
      'Fabric Sourcing', 'Trim Selection', 'Color Theory', 'Print Design',
      'Embellishment Techniques', 'Quality Control'
    ],
    softwareSkills: [
      'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign',
      'CLO 3D', 'Browzwear VStitcher', 'Optitex', 'Gerber AccuMark',
      'Lectra Modaris', 'TUKAcad', 'Marvelous Designer', 'Sketch',
      'Figma', 'AutoCAD', 'Rhino 3D', 'Blender', 'Procreate'
    ],
    constructionSkills: [
      'Machine Sewing', 'Hand Sewing', 'Serging/Overlocking', 'Blind Hemming',
      'Buttonhole Making', 'Zipper Installation', 'Seam Finishing',
      'Pressing & Steaming', 'Tailoring Techniques', 'Couture Techniques',
      'Embroidery', 'Beading', 'Appliqué', 'Quilting', 'Leather Working'
    ],
    materialKnowledge: [
      'Natural Fibers (Cotton, Wool, Silk, Linen)', 'Synthetic Fibers',
      'Blended Fabrics', 'Knit Fabrics', 'Woven Fabrics', 'Denim',
      'Leather & Suede', 'Fur & Faux Fur', 'Technical Fabrics',
      'Sustainable Materials', 'Organic Materials', 'Recycled Materials',
      'Trims & Notions', 'Hardware', 'Interfacing', 'Linings'
    ],
    servicesOffered: [
      'Custom Design', 'Pattern Making', 'Technical Drawings',
      'Garment Construction', 'Fitting Services', 'Design Consultation',
      'Trend Forecasting', 'Collection Development', 'Brand Development',
      'Fashion Illustration', 'CAD Services', 'Production Planning',
      'Quality Control', 'Sourcing Assistance', 'Design Education'
    ],
    projectTypes: [
      'Custom Garments', 'Collection Development', 'Pattern Creation',
      'Technical Consultation', 'Design Collaboration', 'Brand Projects',
      'Fashion Week Preparation', 'Startup Assistance', 'Redesign Projects',
      'Sustainable Design', 'Costume Design', 'Uniform Design'
    ],
    clientTypes: [
      'Fashion Brands', 'Individual Clients', 'Celebrities', 'Influencers',
      'Retail Companies', 'Startups', 'Costume Departments', 'Theater Companies',
      'Dance Companies', 'Wedding Clients', 'Corporate Clients', 'Non-Profits'
    ],
    businessModels: [
      { value: 'independent-designer', label: 'Independent Designer' },
      { value: 'fashion-brand-owner', label: 'Fashion Brand Owner' },
      { value: 'freelance-designer', label: 'Freelance Designer' },
      { value: 'design-consultant', label: 'Design Consultant' },
      { value: 'custom-couture', label: 'Custom/Couture Designer' },
      { value: 'pattern-maker', label: 'Pattern Making Service' },
      { value: 'design-studio', label: 'Design Studio' }
    ],
    productionCapacity: [
      { value: 'single-pieces', label: 'Single Pieces/Prototypes' },
      { value: 'small-batch', label: 'Small Batch (1-50 pieces)' },
      { value: 'medium-batch', label: 'Medium Batch (51-500 pieces)' },
      { value: 'large-scale', label: 'Large Scale (500+ pieces)' },
      { value: 'no-production', label: 'Design Only (No Production)' }
    ],
    availability: [
      { value: 'full-time', label: 'Full Time' },
      { value: 'part-time', label: 'Part Time' },
      { value: 'project-based', label: 'Project Based' },
      { value: 'seasonal', label: 'Seasonal' },
      { value: 'freelance', label: 'Freelance' }
    ],
    experienceLevels: [
      { value: '0-2', label: '0-2 years (Emerging Designer)' },
      { value: '3-5', label: '3-5 years (Developing Designer)' },
      { value: '6-10', label: '6-10 years (Experienced Designer)' },
      { value: '11-15', label: '11-15 years (Senior Designer)' },
      { value: '15+', label: '15+ years (Master Designer)' }
    ]
  }), []);

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
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
    
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
        if (!profileData.yearsExperience) errs.yearsExperience = 'Experience level is required';
        break;
      case 3:
        if (profileData.designCategories.length === 0) errs.designCategories = 'Select at least one design category';
        break;
      case 4:
        if (profileData.technicalSkills.length === 0) errs.technicalSkills = 'Select at least one technical skill';
        break;
      case 5:
        if (!profileData.businessModel) errs.businessModel = 'Business model is required';
        break;
      case 7:
        if (!profileData.availability) errs.availability = 'Availability is required';
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
              <p className="text-gray-400 font-light">Tell us about yourself and your creative journey</p>
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
                label="Nationality"
                value={profileData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                placeholder="e.g., American, British"
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

      case 2:
        return (
          <div {...commonProps}>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
                <span className="text-gradient-gold">◈</span>
              </div>
              <h2 className="text-3xl font-display font-light text-white mb-3">Professional <span className="text-gradient-gold">Background</span></h2>
              <p className="text-gray-400 font-light">Share your design journey and creative philosophy</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Professional Headline"
                  value={profileData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  placeholder="e.g., Sustainable Fashion Designer & Pattern Maker"
                  error={errors.headline}
                  required
                />
                <FormSelect
                  label="Years of Experience"
                  value={profileData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                  options={options.experienceLevels}
                  placeholder="Select experience level"
                  error={errors.yearsExperience}
                  required
                />
              </div>

              <FormTextarea
                label="Bio & Design Philosophy"
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Describe your design philosophy, creative process, and what drives your work. What makes your design approach unique?"
                error={errors.bio}
                required
                rows={5}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormTextarea
                  label="Education & Training"
                  value={profileData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Fashion design school, degrees, workshops, apprenticeships"
                  rows={3}
                />
                <FormTextarea
                  label="Design Philosophy Statement"
                  value={profileData.designPhilosophy}
                  onChange={(e) => handleInputChange('designPhilosophy', e.target.value)}
                  placeholder="Your core design beliefs and values that guide your creative decisions"
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
              <h2 className="text-3xl font-display font-light text-white mb-3">Design <span className="text-gradient-gold">Specializations</span></h2>
              <p className="text-gray-400 font-light">Define your creative focus and design expertise</p>
            </div>
            
            <div className="space-y-8">
              <FormCheckboxGroup
                label="Design Categories"
                options={options.designCategories}
                selectedValues={profileData.designCategories}
                onChange={(values) => handleInputChange('designCategories', values)}
                error={errors.designCategories}
                columns={3}
              />

              <FormCheckboxGroup
                label="Product Types"
                options={options.productTypes}
                selectedValues={profileData.productTypes}
                onChange={(values) => handleInputChange('productTypes', values)}
                columns={3}
              />

              <FormCheckboxGroup
                label="Design Styles"
                options={options.designStyles}
                selectedValues={profileData.designStyles}
                onChange={(values) => handleInputChange('designStyles', values)}
                columns={3}
              />

              <FormCheckboxGroup
                label="Target Market"
                options={options.targetMarket}
                selectedValues={profileData.targetMarket}
                onChange={(values) => handleInputChange('targetMarket', values)}
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
             <h2 className="text-3xl font-display font-light text-white mb-3">Technical <span className="text-gradient-gold">Skills</span></h2>
             <p className="text-gray-400 font-light">Showcase your technical expertise and capabilities</p>
           </div>
           
           <div className="space-y-8">
             <FormCheckboxGroup
               label="Technical Design Skills"
               options={options.technicalSkills}
               selectedValues={profileData.technicalSkills}
               onChange={(values) => handleInputChange('technicalSkills', values)}
               error={errors.technicalSkills}
               columns={3}
             />

             <FormCheckboxGroup
               label="Software & Technology Skills"
               options={options.softwareSkills}
               selectedValues={profileData.softwareSkills}
               onChange={(values) => handleInputChange('softwareSkills', values)}
               columns={3}
             />

             <FormCheckboxGroup
               label="Construction & Sewing Skills"
               options={options.constructionSkills}
               selectedValues={profileData.constructionSkills}
               onChange={(values) => handleInputChange('constructionSkills', values)}
               columns={3}
             />

             <FormCheckboxGroup
               label="Material & Fabric Knowledge"
               options={options.materialKnowledge}
               selectedValues={profileData.materialKnowledge}
               onChange={(values) => handleInputChange('materialKnowledge', values)}
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
             <h2 className="text-3xl font-display font-light text-white mb-3">Business & <span className="text-gradient-gold">Production</span></h2>
             <p className="text-gray-400 font-light">Define your business model and production capabilities</p>
           </div>
           
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormSelect
                 label="Business Model"
                 value={profileData.businessModel}
                 onChange={(e) => handleInputChange('businessModel', e.target.value)}
                 options={options.businessModels}
                 placeholder="Select business model"
                 error={errors.businessModel}
                 required
               />
               <FormSelect
                 label="Production Capacity"
                 value={profileData.productionCapacity}
                 onChange={(e) => handleInputChange('productionCapacity', e.target.value)}
                 options={options.productionCapacity}
                 placeholder="Select production capacity"
               />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Manufacturing Knowledge"
                 value={profileData.manufacturingKnowledge}
                 onChange={(e) => handleInputChange('manufacturingKnowledge', e.target.value)}
                 placeholder="Experience with manufacturers, suppliers, production processes, quality control"
                 rows={4}
               />
               <FormTextarea
                 label="Sustainability Practices"
                 value={profileData.sustainabilityPractices}
                 onChange={(e) => handleInputChange('sustainabilityPractices', e.target.value)}
                 placeholder="Eco-friendly practices, sustainable materials, ethical production methods"
                 rows={4}
               />
             </div>

             <FormTextarea
               label="Quality Standards & Processes"
               value={profileData.qualityStandards}
               onChange={(e) => handleInputChange('qualityStandards', e.target.value)}
               placeholder="Quality control processes, standards, testing procedures, attention to detail"
               rows={4}
             />
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
             <h2 className="text-3xl font-display font-light text-white mb-3">Portfolio & <span className="text-gradient-gold">Collections</span></h2>
             <p className="text-gray-400 font-light">Showcase your creative work and achievements</p>
           </div>
           
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <FormInput
                 label="Portfolio Website"
                 type="url"
                 value={profileData.portfolioWebsite}
                 onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                 placeholder="https://yourdesignportfolio.com"
               />
               <FormInput
                 label="Instagram"
                 value={profileData.socialMedia.instagram}
                 onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                 placeholder="@yourdesignername"
               />
               <FormInput
                 label="Behance Portfolio"
                 type="url"
                 value={profileData.socialMedia.behance}
                 onChange={(e) => handleInputChange('socialMedia.behance', e.target.value)}
                 placeholder="https://behance.net/yourwork"
               />
               <FormInput
                 label="LinkedIn Profile"
                 type="url"
                 value={profileData.socialMedia.linkedin}
                 onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                 placeholder="https://linkedin.com/in/yourname"
               />
               <FormInput
                 label="Personal Website"
                 type="url"
                 value={profileData.socialMedia.website}
                 onChange={(e) => handleInputChange('socialMedia.website', e.target.value)}
                 placeholder="https://yourpersonalsite.com"
               />
               <FormInput
                 label="Design Blog"
                 type="url"
                 value={profileData.socialMedia.blog}
                 onChange={(e) => handleInputChange('socialMedia.blog', e.target.value)}
                 placeholder="Your design blog or publication"
               />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Collections & Past Work"
                 value={profileData.collections}
                 onChange={(e) => handleInputChange('collections', e.target.value)}
                 placeholder="Describe your notable collections, signature pieces, and design milestones"
                 rows={4}
               />
               <FormTextarea
                 label="Design Awards & Recognition"
                 value={profileData.designAwards}
                 onChange={(e) => handleInputChange('designAwards', e.target.value)}
                 placeholder="Awards, competitions won, industry recognition"
                 rows={4}
               />
               <FormTextarea
                 label="Exhibitions & Shows"
                 value={profileData.exhibitions}
                 onChange={(e) => handleInputChange('exhibitions', e.target.value)}
                 placeholder="Fashion weeks, exhibitions, trunk shows, pop-ups"
                 rows={4}
               />
               <FormTextarea
                 label="Collaborations"
                 value={profileData.collaborations}
                 onChange={(e) => handleInputChange('collaborations', e.target.value)}
                 placeholder="Brand collaborations, partnerships, notable projects"
                 rows={4}
               />
             </div>

             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                 <span className="text-accent-gold mr-2">✧</span> Portfolio Tips
               </h3>
               <ul className="text-gray-300 text-sm space-y-2">
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Include your best 15-20 design pieces</li>
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Show technical drawings alongside finished pieces</li>
                 <li className="flex items-center"><span className="text-accent-gold/70 mr-2">•</span> Document your design process and inspiration</li>
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
             <h2 className="text-3xl font-display font-light text-white mb-3">Services & <span className="text-gradient-gold">Rates</span></h2>
             <p className="text-gray-400 font-light">Define your services and pricing structure</p>
           </div>
           
           <div className="space-y-6">
             <FormCheckboxGroup
               label="Services Offered"
               options={options.servicesOffered}
               selectedValues={profileData.servicesOffered}
               onChange={(values) => handleInputChange('servicesOffered', values)}
               columns={3}
             />

             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                 <span className="text-accent-gold mr-2">💰</span> Rate Information
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <FormInput
                   label="Consultation Rate (USD/hour)"
                   type="number"
                   value={profileData.rates.consultationHourly}
                   onChange={(e) => handleInputChange('rates.consultationHourly', e.target.value)}
                   placeholder="125"
                 />
                 <FormInput
                   label="Custom Design Starting Rate"
                   type="number"
                   value={profileData.rates.customDesignStarting}
                   onChange={(e) => handleInputChange('rates.customDesignStarting', e.target.value)}
                   placeholder="800"
                 />
                 <FormInput
                   label="Pattern Making Rate"
                   type="number"
                   value={profileData.rates.patternMaking}
                   onChange={(e) => handleInputChange('rates.patternMaking', e.target.value)}
                   placeholder="200"
                 />
                 <FormInput
                   label="Technical Drawings Rate"
                   type="number"
                   value={profileData.rates.technicalDrawings}
                   onChange={(e) => handleInputChange('rates.technicalDrawings', e.target.value)}
                   placeholder="75"
                 />
               </div>
               <p className="text-gray-400 text-sm mt-3">
                 These are starting rates. Final rates are always negotiable based on the specific project.
               </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormCheckboxGroup
                 label="Project Types"
                 options={options.projectTypes}
                 selectedValues={profileData.projectTypes}
                 onChange={(values) => handleInputChange('projectTypes', values)}
                 columns={2}
               />
               <FormCheckboxGroup
                 label="Client Types"
                 options={options.clientTypes}
                 selectedValues={profileData.clientTypes}
                 onChange={(values) => handleInputChange('clientTypes', values)}
                 columns={2}
               />
             </div>

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
               <FormTextarea
                 label="Collaboration Style"
                 value={profileData.collaborationStyle}
                 onChange={(e) => handleInputChange('collaborationStyle', e.target.value)}
                 placeholder="Describe your working style, communication preferences, and project approach"
                 rows={3}
               />
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
             <p className="text-gray-400 font-light">Finalize your professional designer profile</p>
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
                 <div><span className="text-gray-400">Nationality:</span> <span className="text-white">{profileData.nationality}</span></div>
                 <div><span className="text-gray-400">Languages:</span> <span className="text-white">{Array.isArray(profileData.languages) ? profileData.languages.join(', ') : ''}</span></div>
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
                 <div><span className="text-gray-400">Experience:</span> <span className="text-white">{profileData.yearsExperience}</span></div>
                 <div><span className="text-gray-400">Business Model:</span> <span className="text-white">{
                   options.businessModels.find(option => option.value === profileData.businessModel)?.label || 
                   profileData.businessModel
                 }</span></div>
                 {profileData.bio && (
                   <div><span className="text-gray-400">Bio:</span> <span className="text-white">{profileData.bio.substring(0, 200)}...</span></div>
                 )}
               </div>
             </div>

             {/* Design Specializations Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◊</span>
                 Design Specializations
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Categories:</span> <span className="text-white">{profileData.designCategories.slice(0, 3).join(', ')}{profileData.designCategories.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Product Types:</span> <span className="text-white">{profileData.productTypes.slice(0, 3).join(', ')}{profileData.productTypes.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Design Styles:</span> <span className="text-white">{profileData.designStyles.slice(0, 3).join(', ')}{profileData.designStyles.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Target Market:</span> <span className="text-white">{profileData.targetMarket.slice(0, 3).join(', ')}{profileData.targetMarket.length > 3 ? '...' : ''}</span></div>
               </div>
             </div>

             {/* Technical Skills Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◯</span>
                 Technical Skills
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Technical Skills:</span> <span className="text-white">{profileData.technicalSkills.length} skills</span></div>
                 <div><span className="text-gray-400">Software Skills:</span> <span className="text-white">{profileData.softwareSkills.length} programs</span></div>
                 <div><span className="text-gray-400">Construction Skills:</span> <span className="text-white">{profileData.constructionSkills.length} techniques</span></div>
                 <div><span className="text-gray-400">Material Knowledge:</span> <span className="text-white">{profileData.materialKnowledge.length} materials</span></div>
               </div>
             </div>

             {/* Services & Rates Summary */}
             {(profileData.rates.consultationHourly || profileData.rates.customDesignStarting) && (
               <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-gold/30 group">
                 <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                   <span className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">⬢</span>
                   Services & Rates
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   {profileData.rates.consultationHourly && (
                     <div><span className="text-gray-400">Consultation:</span> <span className="text-white">USD ${profileData.rates.consultationHourly}/hour</span></div>
                   )}
                   {profileData.rates.customDesignStarting && (
                     <div><span className="text-gray-400">Custom Design:</span> <span className="text-white">USD ${profileData.rates.customDesignStarting} starting</span></div>
                   )}
                   <div><span className="text-gray-400">Services:</span> <span className="text-white">{profileData.servicesOffered.length} offerings</span></div>
                   <div><span className="text-gray-400">Availability:</span> <span className="text-white">{
                     options.availability.find(option => option.value === profileData.availability)?.label || 
                     profileData.availability
                   }</span></div>
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
                   <p className="text-gray-300 text-sm">Your designer profile is complete. Click submit to launch your professional profile.</p>
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
               <h1 className="text-xl font-display font-light text-white">ZANARA <span className="text-accent-gold">Designer Setup</span></h1>
               <p className="text-gray-400 text-sm">Complete your professional fashion designer profile</p>
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
       ZANARA · Premium Designer Experience
     </div>
   </div>
 );
};

export default FashionDesignerProfileSetup;