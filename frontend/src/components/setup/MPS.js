import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

const ModelProfileSetup = ({
  user = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
  onLogout,
  onProfileComplete,
}) => {
  // --- State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
      twitter: '',
    },
    // Work Preferences
    availability: '',
    travelWillingness: '',
    preferredLocations: [],
    workTypes: [],
    nudityComfort: '',
    // Rate Information
    rates: { hourly: '', halfDay: '', fullDay: '', currency: 'USD' },
    // Special Skills
    specialSkills: [],
    wardrobe: '',
    props: '',
    modelType: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const contentRef = useRef(null);

  // --- Cursor and Background Effects (Optional, can be removed if not needed) ---
  const cursorRef = useRef(null);
  const cursorFollowerRef = useRef(null);
  const bgAnimationRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x - 10}px, ${y - 10}px, 0)`;
      }
      if (cursorFollowerRef.current) {
        cursorFollowerRef.current.style.transform = `translate3d(${x - 20}px, ${y - 20}px, 0)`;
      }
    };
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        width: ${size}px;
        height: ${size}px;
        background: #d4af37;
        left: ${Math.random() * 100}%;
        top: 100%;
        opacity: ${opacity};
        animation: float-up-simple ${duration}s linear infinite;
      `;
      bgAnimationRef.current.appendChild(particle);
      particleCount++;
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
          particleCount--;
        }
      }, duration * 1000);
    };
    const interval = setInterval(createParticle, 3000);
    for (let i = 0; i < 3; i++) {
      setTimeout(createParticle, i * 1000);
    }
    return () => clearInterval(interval);
  }, []);

  // --- Step Definitions ---
  const steps = useMemo(
    () => [
      { number: 1, title: 'Personal', icon: '✦', color: 'from-blue-400 to-blue-600' },
      { number: 2, title: 'Physical', icon: '◈', color: 'from-purple-400 to-purple-600' },
      { number: 3, title: 'Professional', icon: '◊', color: 'from-emerald-400 to-emerald-600' },
      { number: 4, title: 'Portfolio', icon: '◯', color: 'from-pink-400 to-pink-600' },
      { number: 5, title: 'Preferences', icon: '✧', color: 'from-amber-400 to-amber-600' },
      { number: 6, title: 'Rates & Skills', icon: '⬡', color: 'from-rose-400 to-rose-600' },
      { number: 7, title: 'Review', icon: '⬢', color: 'from-indigo-400 to-indigo-600' },
    ],
    []
  );

  // --- Options ---
  const options = useMemo(
    () => ({
      modelingTypes: [
        'Fashion Modeling',
        'Commercial Modeling',
        'Runway/Catwalk',
        'Editorial',
        'Beauty Modeling',
        'Fitness Modeling',
        'Plus-Size Modeling',
        'Petite Modeling',
        'Hand/Foot Modeling',
        'Hair Modeling',
        'Lingerie Modeling',
        'Swimwear Modeling',
        'Art/Figure Modeling',
        'Promotional Modeling',
        'Trade Show Modeling',
      ],
      bodyTypes: [
        'Straight/Athletic',
        'Pear',
        'Apple',
        'Hourglass',
        'Inverted Triangle',
        'Rectangle',
        'Plus-Size',
        'Petite',
        'Tall',
        'Curvy',
      ],
      workTypes: [
        'Editorial Shoots',
        'Commercial Campaigns',
        'Fashion Shows/Runway',
        'Catalog Work',
        'E-commerce',
        'Lifestyle Shoots',
        'Product Modeling',
        'Brand Ambassador',
        'Event Modeling',
        'Video/Commercial Acting',
      ],
      specialSkills: [
        'Acting',
        'Dancing',
        'Singing',
        'Sports/Athletics',
        'Martial Arts',
        'Yoga/Pilates',
        'Musical Instruments',
        'Languages',
        'Acrobatics',
        'Horseback Riding',
        'Swimming/Diving',
        'Rock Climbing',
        'Skateboarding',
      ],
      genders: [
        { value: 'female', label: 'Female' },
        { value: 'male', label: 'Male' },
        { value: 'non-binary', label: 'Non-binary' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say' },
      ],
      experienceLevels: [
        { value: 'beginner', label: 'Beginner (0-2 years)' },
        { value: 'intermediate', label: 'Intermediate (3-5 years)' },
        { value: 'experienced', label: 'Experienced (6-10 years)' },
        { value: 'professional', label: 'Professional (10+ years)' },
      ],
      yearsOptions: [
        { value: '0-2', label: '0-2 years' },
        { value: '3-5', label: '3-5 years' },
        { value: '6-10', label: '6-10 years' },
        { value: '11-15', label: '11-15 years' },
        { value: '15+', label: '15+ years' },
      ],
      modelTypes: [
        { value: 'fashion', label: 'Fashion Model' },
        { value: 'commercial', label: 'Commercial Model' },
        { value: 'runway', label: 'Runway Model' },
        { value: 'editorial', label: 'Editorial Model' },
        { value: 'fitness', label: 'Fitness Model' },
        { value: 'plus-size', label: 'Plus-Size Model' },
        { value: 'petite', label: 'Petite Model' },
        { value: 'mature', label: 'Mature Model' },
      ],
      availability: [
        { value: 'full-time', label: 'Full Time' },
        { value: 'part-time', label: 'Part Time' },
        { value: 'freelance', label: 'Freelance/Project Based' },
        { value: 'weekends-only', label: 'Weekends Only' },
        { value: 'seasonal', label: 'Seasonal' },
      ],
      travel: [
        { value: 'local-only', label: 'Local Only' },
        { value: 'regional', label: 'Regional (within 200 miles)' },
        { value: 'national', label: 'National' },
        { value: 'international', label: 'International' },
        { value: 'anywhere', label: 'Travel Anywhere' },
      ],
      nudityComfort: [
        { value: 'none', label: 'No Nudity' },
        { value: 'implied', label: 'Implied/Covered' },
        { value: 'artistic', label: 'Artistic/Tasteful' },
        { value: 'partial', label: 'Partial Nudity' },
        { value: 'full', label: 'Full Nudity' },
      ],
    }),
    []
  );

  // --- Input Change Handler ---
  const handleInputChange = (field, value) => {
    setProfileData((prev) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return { ...prev, [parent]: { ...prev[parent], [child]: value } };
      }
      return { ...prev, [field]: value };
    });
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  };

  // --- Validation ---
  const validateStep = useCallback(
    (step) => {
      const stepErrors = {};
      switch (step) {
        case 1:
          if (!profileData.fullName?.trim()) stepErrors.fullName = 'Full name is required';
          if (!profileData.email || !/^\S+@\S+\.\S+$/.test(profileData.email))
            stepErrors.email = 'Valid email is required';
          if (!profileData.phone) stepErrors.phone = 'Phone number is required';
          if (!profileData.dateOfBirth) stepErrors.dateOfBirth = 'Date of birth is required';
          if (!profileData.gender) stepErrors.gender = 'Gender is required';
          if (!profileData.location) stepErrors.location = 'Location is required';
          break;
        case 2:
          if (!profileData.height) stepErrors.height = 'Height is required';
          if (!profileData.bust) stepErrors.bust = 'Bust/Chest measurement is required';
          if (!profileData.waist) stepErrors.waist = 'Waist measurement is required';
          if (!profileData.hips) stepErrors.hips = 'Hip measurement is required';
          if (!profileData.bodyType) stepErrors.bodyType = 'Body type is required';
          if (!profileData.hairColor) stepErrors.hairColor = 'Hair color is required';
          if (!profileData.eyeColor) stepErrors.eyeColor = 'Eye color is required';
          break;
        case 3:
          if (!profileData.headline) stepErrors.headline = 'Professional headline is required';
          if (!profileData.bio) stepErrors.bio = 'Bio is required';
          if (!profileData.experienceLevel) stepErrors.experienceLevel = 'Experience level is required';
          if (!profileData.yearsExperience) stepErrors.yearsExperience = 'Years of experience is required';
          if (!profileData.modelType) stepErrors.modelType = 'Model type is required';
          if (!profileData.modelingTypes.length) stepErrors.modelingTypes = 'Select at least one modeling type';
          break;
        case 5:
          if (!profileData.availability) stepErrors.availability = 'Availability is required';
          if (!profileData.travelWillingness) stepErrors.travelWillingness = 'Travel willingness is required';
          if (!profileData.nudityComfort) stepErrors.nudityComfort = 'Nudity comfort level is required';
          if (!profileData.workTypes.length) stepErrors.workTypes = 'Select at least one work type';
          break;
        // Add more validation as needed for other steps
        default:
          break;
      }
      return stepErrors;
    },
    [profileData]
  );

  // --- Navigation ---
  const navigateToStep = useCallback(
    async (targetStep) => {
      if (targetStep === currentStep) return;
      // Validate current step if moving forward
      if (targetStep > currentStep) {
        const currentStepErrors = validateStep(currentStep);
        if (Object.keys(currentStepErrors).length > 0) {
          setErrors(currentStepErrors);
          return;
        }
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      }
      setIsTransitioning(true);
      setErrors({});
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCurrentStep(targetStep);
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [currentStep, validateStep]
  );

  const nextStep = () => navigateToStep(currentStep + 1);
  const prevStep = () => navigateToStep(currentStep - 1);

  // --- Submit Handler ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onProfileComplete?.();
    } catch (error) {
      console.error('Profile submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Form Input Component ---
  const FormInput = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    required,
    className = '',
  }) => (
    <div className={`mb-4 ${className}`}>
      <label className="block mb-1 font-medium">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        className={`w-full border p-2 rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );

  // --- Step Content ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <FormInput
              label="Full Name"
              value={profileData.fullName}
              onChange={(v) => handleInputChange('fullName', v)}
              error={errors.fullName}
              required
            />
            <FormInput
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(v) => handleInputChange('email', v)}
              error={errors.email}
              required
            />
            <FormInput
              label="Phone"
              value={profileData.phone}
              onChange={(v) => handleInputChange('phone', v)}
              error={errors.phone}
              required
            />
            <FormInput
              label="Date of Birth"
              type="date"
              value={profileData.dateOfBirth}
              onChange={(v) => handleInputChange('dateOfBirth', v)}
              error={errors.dateOfBirth}
              required
            />
            <div className="mb-4">
              <label className="block mb-1 font-medium">Gender<span className="text-red-500">*</span></label>
              <select
                className={`w-full border p-2 rounded ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                value={profileData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                required
              >
                <option value="">Select</option>
                {options.genders.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
              {errors.gender && <div className="text-red-500 text-sm mt-1">{errors.gender}</div>}
            </div>
            <FormInput
              label="Location"
              value={profileData.location}
              onChange={(v) => handleInputChange('location', v)}
              error={errors.location}
              required
            />
          </>
        );
      case 2:
        return (
          <>
            <FormInput
              label="Height (cm)"
              value={profileData.height}
              onChange={(v) => handleInputChange('height', v)}
              error={errors.height}
              required
            />
            <FormInput
              label="Bust/Chest (cm)"
              value={profileData.bust}
              onChange={(v) => handleInputChange('bust', v)}
              error={errors.bust}
              required
            />
            <FormInput
              label="Waist (cm)"
              value={profileData.waist}
              onChange={(v) => handleInputChange('waist', v)}
              error={errors.waist}
              required
            />
            <FormInput
              label="Hips (cm)"
              value={profileData.hips}
              onChange={(v) => handleInputChange('hips', v)}
              error={errors.hips}
              required
            />
            <div className="mb-4">
              <label className="block mb-1 font-medium">Body Type<span className="text-red-500">*</span></label>
              <select
                className={`w-full border p-2 rounded ${errors.bodyType ? 'border-red-500' : 'border-gray-300'}`}
                value={profileData.bodyType}
                onChange={(e) => handleInputChange('bodyType', e.target.value)}
                required
              >
                <option value="">Select</option>
                {options.bodyTypes.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.bodyType && <div className="text-red-500 text-sm mt-1">{errors.bodyType}</div>}
            </div>
            <FormInput
              label="Hair Color"
              value={profileData.hairColor}
              onChange={(v) => handleInputChange('hairColor', v)}
              error={errors.hairColor}
              required
            />
            <FormInput
              label="Eye Color"
              value={profileData.eyeColor}
              onChange={(v) => handleInputChange('eyeColor', v)}
              error={errors.eyeColor}
              required
            />
          </>
        );
      case 3:
        return (
          <>
            <FormInput
              label="Professional Headline"
              value={profileData.headline}
              onChange={(v) => handleInputChange('headline', v)}
              error={errors.headline}
              required
            />
            <div className="mb-4">
              <label className="block mb-1 font-medium">Bio<span className="text-red-500">*</span></label>
              <textarea
                className={`w-full border p-2 rounded ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                required
                rows={4}
              />
              {errors.bio && <div className="text-red-500 text-sm mt-1">{errors.bio}</div>}
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Experience Level<span className="text-red-500">*</span></label>
              <select
                className={`w-full border p-2 rounded ${errors.experienceLevel ? 'border-red-500' : 'border-gray-300'}`}
                value={profileData.experienceLevel}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                required
              >
                <option value="">Select</option>
                {options.experienceLevels.map((ex) => (
                  <option key={ex.value} value={ex.value}>{ex.label}</option>
                ))}
              </select>
              {errors.experienceLevel && <div className="text-red-500 text-sm mt-1">{errors.experienceLevel}</div>}
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Years of Experience<span className="text-red-500">*</span></label>
              <select
                className={`w-full border p-2 rounded ${errors.yearsExperience ? 'border-red-500' : 'border-gray-300'}`}
                value={profileData.yearsExperience}
                onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                required
              >
                <option value="">Select</option>
                {options.yearsOptions.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
              {errors.yearsExperience && <div className="text-red-500 text-sm mt-1">{errors.yearsExperience}</div>}
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Model Type<span className="text-red-500">*</span></label>
              <select
                className={`w-full border p-2 rounded ${errors.modelType ? 'border-red-500' : 'border-gray-300'}`}
                value={profileData.modelType}
                onChange={(e) => handleInputChange('modelType', e.target.value)}
                required
              >
                <option value="">Select</option>
                {options.modelTypes.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {errors.modelType && <div className="text-red-500 text-sm mt-1">{errors.modelType}</div>}
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Modeling Types<span className="text-red-500">*</span></label>
              <select
                className={`w-full border p-2 rounded ${errors.modelingTypes ? 'border-red-500' : 'border-gray-300'}`}
                value={profileData.modelingTypes[0] || ''}
                onChange={(e) => handleInputChange('modelingTypes', [e.target.value])}
                required
              >
                <option value="">Select</option>
                {options.modelingTypes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.modelingTypes && <div className="text-red-500 text-sm mt-1">{errors.modelingTypes}</div>}
            </div>
          </>
        );
      // Add more steps as needed...
      case 7:
        return (
          <div>
            <h2 className="text-xl font-bold mb-2">Review & Submit</h2>
            <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(profileData, null, 2)}</pre>
          </div>
        );
      default:
        return <div>Step not implemented.</div>;
    }
  };

  // --- Main Render ---
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md relative">
      {/* Cursor and background animation (optional) */}
      <div ref={bgAnimationRef} className="absolute inset-0 z-0 pointer-events-none" />
      <div ref={cursorRef} className="fixed z-50 pointer-events-none" />
      <div ref={cursorFollowerRef} className="fixed z-40 pointer-events-none" />

      {/* Stepper */}
      <div className="flex items-center mb-6">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>
            <button
              type="button"
              className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold 
                ${currentStep === step.number
                  ? 'bg-gradient-to-r text-white ' + step.color
                  : completedSteps.has(step.number)
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-600'
                }
              `}
              onClick={() => navigateToStep(step.number)}
              disabled={currentStep === step.number}
            >
              <span className="mr-1">{step.icon}</span>
              {step.title}
            </button>
            {idx < steps.length - 1 && (
              <span className="mx-1 text-gray-400">→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div ref={contentRef} className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={prevStep}
            disabled={isTransitioning}
          >
            Back
          </button>
        )}
        <div className="flex-1" />
        {currentStep < steps.length ? (
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={nextStep}
            disabled={isTransitioning}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ModelProfileSetup;
