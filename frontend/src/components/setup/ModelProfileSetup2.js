import React, { useState, useCallback, useRef, useEffect } from 'react';

const ModelProfileSetup = ({
  user = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  onLogout = () => {},
  onProfileComplete = () => {}
}) => {
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
    modelType: '',
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
    nudityComfort: '',
    workTypes: [],
    preferredLocations: [],

    // Rates & Skills
    rates: {
      hourly: '',
      halfDay: '',
      fullDay: ''
    },
    specialSkills: [],
    wardrobe: '',
    props: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [particleCount, setParticleCount] = useState(0);

  const cursorRef = useRef(null);
  const containerRef = useRef(null);

  // Custom cursor
  useEffect(() => {
    setMounted(true);
    const handleMouseMove = e => {
      if (cursorRef.current && window.innerWidth >= 768) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 10}px, ${e.clientY - 10}px, 0)`;
      }
    };
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating particles
  useEffect(() => {
    if (!containerRef.current) return;
    const createParticle = () => {
      if (particleCount >= 6) return;
      const p = document.createElement('div');
      p.className = 'absolute w-1 h-1 bg-accent-gold/20 rounded-full pointer-events-none will-change-transform';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = '100%';
      p.style.animation = `float-particle ${8 + Math.random() * 4}s linear infinite`;
      p.style.animationDelay = Math.random() * 3 + 's';
      containerRef.current.appendChild(p);
      setParticleCount(n => n + 1);
      setTimeout(() => {
        p.remove();
        setParticleCount(n => Math.max(0, n - 1));
      }, 12000);
    };
    const interval = setInterval(createParticle, 4000);
    return () => clearInterval(interval);
  }, [particleCount]);

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤', color: 'from-blue-400 to-purple-500' },
    { number: 2, title: 'Physical Attributes', icon: '📏', color: 'from-purple-400 to-pink-500' },
    { number: 3, title: 'Professional Info', icon: '💼', color: 'from-pink-400 to-red-500' },
    { number: 4, title: 'Portfolio & Social', icon: '📸', color: 'from-red-400 to-orange-500' },
    { number: 5, title: 'Work Preferences', icon: '⚙️', color: 'from-orange-400 to-yellow-500' },
    { number: 6, title: 'Rates & Skills', icon: '💰', color: 'from-yellow-400 to-green-500' },
    { number: 7, title: 'Review & Submit', icon: '✅', color: 'from-green-400 to-emerald-500' }
  ];

  // Option arrays
  const genderOptions = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];
  const bodyTypes = ['Straight/Athletic','Pear','Apple','Hourglass','Inverted Triangle','Rectangle','Plus-Size','Petite','Tall','Curvy'];
  const modelingTypes = [
    'Fashion Modeling','Commercial Modeling','Runway/Catwalk','Editorial',
    'Beauty Modeling','Fitness Modeling','Plus-Size Modeling','Petite Modeling',
    'Hand/Foot Modeling','Hair Modeling','Lingerie Modeling','Swimwear Modeling',
    'Art/Figure Modeling','Promotional Modeling','Trade Show Modeling'
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
  const workTypes = [
    'Editorial Shoots','Commercial Campaigns','Fashion Shows/Runway',
    'Catalog Work','E-commerce','Lifestyle Shoots','Product Modeling',
    'Brand Ambassador','Event Modeling','Video/Commercial Acting'
  ];
  const specialSkillsList = [
    'Acting','Dancing','Singing','Sports/Athletics','Martial Arts',
    'Yoga/Pilates','Musical Instruments','Languages','Acrobatics',
    'Horseback Riding','Swimming/Diving','Rock Climbing','Skateboarding'
  ];

  // Handlers
  const handleInputChange = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  }, [errors]);

  const handleArrayChange = useCallback((field, values) => {
    setProfileData(prev => ({ ...prev, [field]: values }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  }, [errors]);

  const validateStep = useCallback(step => {
    const errs = {};
    switch (step) {
      case 1:
        if (!profileData.fullName.trim()) errs.fullName = 'Full name is required';
        if (!/^\S+@\S+\.\S+$/.test(profileData.email)) errs.email = 'Valid email is required';
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
        if (!profileData.modelingTypes.length) errs.modelingTypes = 'Select at least one modeling type';
        break;
      case 5:
        if (!profileData.availability) errs.availability = 'Availability is required';
        if (!profileData.travelWillingness) errs.travelWillingness = 'Travel willingness is required';
        if (!profileData.nudityComfort) errs.nudityComfort = 'Nudity comfort level is required';
        if (!profileData.workTypes.length) errs.workTypes = 'Select at least one work type';
        break;
      default:
        break;
    }
    return errs;
  }, [profileData]);

  const nextStep = useCallback(() => {
    const errs = validateStep(currentStep);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setMessage('Please fix the errors before proceeding.');
      setMessageType('error');
      return;
    }
    setCurrentStep(s => Math.min(s + 1, steps.length));
    setMessage('');
    setMessageType('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1));
    setMessage('');
    setMessageType('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const errs = validateStep(currentStep);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setMessage('Please fix the errors before submitting.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }
    try {
      await new Promise(res => setTimeout(res, 2000));
      setMessage('Model profile created successfully! Redirecting to dashboard...');
      setMessageType('success');
      setTimeout(onProfileComplete, 2000);
    } catch {
      setMessage('Failed to create profile. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI Components
  const FormInput = ({ label, type = 'text', value, onChange, placeholder, error, required }) => (
    <div className="group relative">
      <label className="block text-sm font-medium text-gray-300">
        {label}{required && <span className="text-accent-gold">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(label)}
        onBlur={() => setFocusedField(null)}
        placeholder={placeholder}
        className={`w-full px-5 py-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-2 rounded-2xl text-white placeholder-gray-500 transition-all ${
          error ? 'border-red-500' : 'border-gray-700'
        } ${focusedField === label ? 'scale-105 shadow-lg' : ''}`}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );

  const FormSelect = ({ label, value, onChange, options, placeholder, error, required }) => (
    <div className="group relative">
      <label className="block text-sm font-medium text-gray-300">
        {label}{required && <span className="text-accent-gold">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(label)}
        onBlur={() => setFocusedField(null)}
        className={`w-full px-5 py-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-2 rounded-2xl text-white transition-all ${
          error ? 'border-red-500' : 'border-gray-700'
        } ${focusedField === label ? 'scale-105 shadow-lg' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );

  const FormTextarea = ({ label, value, onChange, placeholder, error, required, minHeight = '120px' }) => (
    <div className="group relative">
      <label className="block text-sm font-medium text-gray-300">
        {label}{required && <span className="text-accent-gold">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(label)}
        onBlur={() => setFocusedField(null)}
        placeholder={placeholder}
        style={{ minHeight }}
        className={`w-full px-5 py-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-2 rounded-2xl text-white placeholder-gray-500 transition-all ${
          error ? 'border-red-500' : 'border-gray-700'
        } ${focusedField === label ? 'scale-105 shadow-lg' : ''}`}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );

  const FormCheckboxGroup = ({ label, options, selectedValues, onChange, error, columns = 3 }) => (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
        {options.map(opt => (
          <label key={opt} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedValues.includes(opt)}
              onChange={e => {
                if (e.target.checked) onChange([...selectedValues, opt]);
                else onChange(selectedValues.filter(v => v !== opt));
              }}
              className="h-4 w-4 text-accent-gold"
            />
            <span className="text-gray-300">{opt}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );

  // Render each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <FormInput
              label="Full Name"
              value={profileData.fullName}
              onChange={e => handleInputChange('fullName', e.target.value)}
              placeholder="Your professional name"
              error={errors.fullName}
              required
            />
            <FormInput
              label="Email"
              type="email"
              value={profileData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder="professional@email.com"
              error={errors.email}
              required
            />
            <FormInput
              label="Phone Number"
              type="tel"
              value={profileData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              error={errors.phone}
              required
            />
            <FormInput
              label="Date of Birth"
              type="date"
              value={profileData.dateOfBirth}
              onChange={e => handleInputChange('dateOfBirth', e.target.value)}
              error={errors.dateOfBirth}
              required
            />
            <FormSelect
              label="Gender"
              value={profileData.gender}
              onChange={e => handleInputChange('gender', e.target.value)}
              options={genderOptions}
              placeholder="Select gender"
              error={errors.gender}
              required
            />
            <FormInput
              label="Nationality"
              value={profileData.nationality}
              onChange={e => handleInputChange('nationality', e.target.value)}
              placeholder="American, British, etc."
            />
            <FormInput
              label="Current Location"
              value={profileData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              placeholder="City, State/Country"
              error={errors.location}
              required
            />
            <FormInput
              label="Languages Spoken"
              value={profileData.languages.join(', ')}
              onChange={e => handleInputChange('languages', e.target.value.split(',').map(l => l.trim()))}
              placeholder="English, Spanish, French"
            />
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormInput
              label="Height"
              value={profileData.height}
              onChange={e => handleInputChange('height', e.target.value)}
              placeholder={`5'8" or 173 cm`}
              error={errors.height}
              required
            />
            <FormInput
              label="Weight"
              value={profileData.weight}
              onChange={e => handleInputChange('weight', e.target.value)}
              placeholder="130 lbs or 59 kg"
            />
            <FormInput
              label="Bust/Chest"
              value={profileData.bust}
              onChange={e => handleInputChange('bust', e.target.value)}
              placeholder={`34" or 86 cm`}
              error={errors.bust}
              required
            />
            <FormInput
              label="Waist"
              value={profileData.waist}
              onChange={e => handleInputChange('waist', e.target.value)}
              placeholder={`26" or 66 cm`}
              error={errors.waist}
              required
            />
            <FormInput
              label="Hips"
              value={profileData.hips}
              onChange={e => handleInputChange('hips', e.target.value)}
              placeholder={`36" or 91 cm`}
              error={errors.hips}
              required
            />
            <FormInput
              label="Dress Size"
              value={profileData.dressSize}
              onChange={e => handleInputChange('dressSize', e.target.value)}
              placeholder="US 6, EU 38, UK 10"
            />
            <FormInput
              label="Shoe Size"
              value={profileData.shoeSize}
              onChange={e => handleInputChange('shoeSize', e.target.value)}
              placeholder="US 8, EU 39, UK 6"
            />
            <FormSelect
              label="Body Type"
              value={profileData.bodyType}
              onChange={e => handleInputChange('bodyType', e.target.value)}
              options={bodyTypes.map(t => ({ value: t, label: t }))}
              placeholder="Select body type"
              error={errors.bodyType}
              required
            />
            <FormInput
              label="Hair Color"
              value={profileData.hairColor}
              onChange={e => handleInputChange('hairColor', e.target.value)}
              placeholder="Blonde, Brunette, Black, Red"
              error={errors.hairColor}
              required
            />
            <FormInput
              label="Eye Color"
              value={profileData.eyeColor}
              onChange={e => handleInputChange('eyeColor', e.target.value)}
              placeholder="Blue, Brown, Green, Hazel"
              error={errors.eyeColor}
              required
            />
            <FormInput
              label="Skin Tone"
              value={profileData.skinTone}
              onChange={e => handleInputChange('skinTone', e.target.value)}
              placeholder="Fair, Medium, Olive, Dark"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-10">
            <FormInput
              label="Professional Headline"
              value={profileData.headline}
              onChange={e => handleInputChange('headline', e.target.value)}
              placeholder="e.g., Fashion Model & Brand Ambassador"
              error={errors.headline}
              required
            />
            <FormSelect
              label="Experience Level"
              value={profileData.experienceLevel}
              onChange={e => handleInputChange('experienceLevel', e.target.value)}
              options={experienceLevelOptions}
              placeholder="Select experience level"
              error={errors.experienceLevel}
              required
            />
            <FormSelect
              label="Years of Experience"
              value={profileData.yearsExperience}
              onChange={e => handleInputChange('yearsExperience', e.target.value)}
              options={yearsExperienceOptions}
              placeholder="Select years of experience"
              error={errors.yearsExperience}
              required
            />
            <FormSelect
              label="Model Type"
              value={profileData.modelType}
              onChange={e => handleInputChange('modelType', e.target.value)}
              options={modelTypeOptions}
              placeholder="Select model type"
              error={errors.modelType}
              required
            />
            <FormTextarea
              label="Bio/About You"
              value={profileData.bio}
              onChange={e => handleInputChange('bio', e.target.value)}
              placeholder="Tell clients about your modeling experience, personality, and what makes you unique."
              error={errors.bio}
              required
              minHeight="150px"
            />
            <FormCheckboxGroup
              label="Modeling Types (Select all that apply)"
              options={modelingTypes}
              selectedValues={profileData.modelingTypes}
              onChange={vals => handleArrayChange('modelingTypes', vals)}
              error={errors.modelingTypes}
              columns={3}
            />
            <FormTextarea
              label="Current/Previous Agencies"
              value={profileData.agencies}
              onChange={e => handleInputChange('agencies', e.target.value)}
              placeholder="List any modeling agencies you've worked with"
              minHeight="120px"
            />
            <FormInput
              label="Union Memberships"
              value={profileData.unionMembership}
              onChange={e => handleInputChange('unionMembership', e.target.value)}
              placeholder="SAG-AFTRA, AEA, etc."
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-10">
            <FormInput
              label="Portfolio Website"
              type="url"
              value={profileData.portfolioWebsite}
              onChange={e => handleInputChange('portfolioWebsite', e.target.value)}
              placeholder="https://yourportfolio.com"
            />
            <FormInput
              label="Instagram"
              value={profileData.socialMedia.instagram}
              onChange={e => handleInputChange('socialMedia.instagram', e.target.value)}
              placeholder="@yourusername or full URL"
            />
            <FormInput
              label="TikTok"
              value={profileData.socialMedia.tiktok}
              onChange={e => handleInputChange('socialMedia.tiktok', e.target.value)}
              placeholder="@yourusername or full URL"
            />
            <FormInput
              label="LinkedIn"
              type="url"
              value={profileData.socialMedia.linkedin}
              onChange={e => handleInputChange('socialMedia.linkedin', e.target.value)}
              placeholder="LinkedIn profile URL"
            />
            <FormInput
              label="Twitter/X"
              value={profileData.socialMedia.twitter}
              onChange={e => handleInputChange('socialMedia.twitter', e.target.value)}
              placeholder="@yourusername or full URL"
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-10">
            <FormSelect
              label="Availability"
              value={profileData.availability}
              onChange={e => handleInputChange('availability', e.target.value)}
              options={availabilityOptions}
              placeholder="Select availability"
              error={errors.availability}
              required
            />
            <FormSelect
              label="Travel Willingness"
              value={profileData.travelWillingness}
              onChange={e => handleInputChange('travelWillingness', e.target.value)}
              options={travelOptions}
              placeholder="Select travel preference"
              error={errors.travelWillingness}
              required
            />
            <FormSelect
              label="Nudity Comfort Level"
              value={profileData.nudityComfort}
              onChange={e => handleInputChange('nudityComfort', e.target.value)}
              options={nudityComfortOptions}
              placeholder="Select comfort level"
              error={errors.nudityComfort}
              required
            />
            <FormCheckboxGroup
              label="Preferred Work Types"
              options={workTypes}
              selectedValues={profileData.workTypes}
              onChange={vals => handleArrayChange('workTypes', vals)}
              error={errors.workTypes}
              columns={3}
            />
            <FormInput
              label="Preferred Locations"
              value={profileData.preferredLocations.join(', ')}
              onChange={e => handleInputChange('preferredLocations', e.target.value.split(',').map(l => l.trim()))}
              placeholder="New York, Los Angeles, Miami"
            />
          </div>
        );
      case 6:
        return (
          <div className="space-y-10">
            <FormInput
              label="Hourly Rate (USD)"
              type="number"
              value={profileData.rates.hourly}
              onChange={e => handleInputChange('rates.hourly', e.target.value)}
              placeholder="75"
            />
            <FormInput
              label="Half Day Rate (USD)"
              type="number"
              value={profileData.rates.halfDay}
              onChange={e => handleInputChange('rates.halfDay', e.target.value)}
              placeholder="300"
            />
            <FormInput
              label="Full Day Rate (USD)"
              type="number"
              value={profileData.rates.fullDay}
              onChange={e => handleInputChange('rates.fullDay', e.target.value)}
              placeholder="500"
            />
            <FormCheckboxGroup
              label="Special Skills & Talents"
              options={specialSkillsList}
              selectedValues={profileData.specialSkills}
              onChange={vals => handleArrayChange('specialSkills', vals)}
              columns={3}
            />
            <FormTextarea
              label="Wardrobe Available"
              value={profileData.wardrobe}
              onChange={e => handleInputChange('wardrobe', e.target.value)}
              placeholder="Describe your personal wardrobe"
              minHeight="120px"
            />
            <FormTextarea
              label="Props Available"
              value={profileData.props}
              onChange={e => handleInputChange('props', e.target.value)}
              placeholder="List any props you own"
              minHeight="120px"
            />
          </div>
        );
      case 7:
        return (
          <div className="space-y-10">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-semibold text-accent-gold mb-4">Model Profile Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-400">Name:</span><span className="text-white">{profileData.fullName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Location:</span><span className="text-white">{profileData.location}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Experience:</span><span className="text-white">{experienceLevelOptions.find(o=>o.value===profileData.experienceLevel)?.label}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Height:</span><span className="text-white">{profileData.height}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Model Type:</span><span className="text-white">{modelTypeOptions.find(o=>o.value===profileData.modelType)?.label}</span></div>
                </div>
                <div className="space-y-3">
                  <div><span className="text-gray-400">Modeling Types:</span><div className="flex flex-wrap gap-2 mt-2">{profileData.modelingTypes.map(t=>(
                    <span key={t} className="px-3 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-sm">{t}</span>
                  ))}</div></div>
                  <div><span className="text-gray-400">Work Types:</span><div className="flex flex-wrap gap-2 mt-2">{profileData.workTypes.map(t=>(
                    <span key={t} className="px-3 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-sm">{t}</span>
                  ))}</div></div>
                  <div className="flex justify-between"><span className="text-gray-400">Availability:</span><span className="text-white">{availabilityOptions.find(o=>o.value===profileData.availability)?.label}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Travel:</span><span className="text-white">{travelOptions.find(o=>o.value===profileData.travelWillingness)?.label}</span></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-500 text-white rounded-xl"
              >
                {isSubmitting ? 'Submitting…' : 'Submit Profile'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-primary-black relative overflow-hidden p-8">
      <div
        ref={cursorRef}
        className="fixed w-5 h-5 bg-accent-gold rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
      />
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-5xl font-light text-white mb-2">Model Profile Setup</h1>
        <p className="text-gray-400">Create your professional modeling profile</p>
      </div>
      {/* Progress */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between mb-2 text-gray-400">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round((currentStep/steps.length)*100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-800 h-2 rounded-full">
          <div
            className="h-2 rounded-full bg-accent-gold transition-all"
            style={{ width: `${(currentStep/steps.length)*100}%` }}
          />
        </div>
      </div>
      {/* Content */}
      <div className="max-w-4xl mx-auto">{renderStepContent()}</div>
      {/* Navigation */}
      <div className="max-w-4xl mx-auto flex justify-between mt-8">
        {currentStep > 1 && (
          <button onClick={prevStep} className="px-6 py-3 bg-gray-700 text-white rounded-lg">
            Back
          </button>
        )}
        {currentStep < steps.length && (
          <button onClick={nextStep} className="px-6 py-3 bg-accent-gold text-black rounded-lg">
            Next
          </button>
        )}
      </div>
      {message && (
        <div className={`max-w-4xl mx-auto mt-4 p-4 rounded-lg ${
          messageType === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {message}
        </div>
      )}
      {/* Animations */}
      <style>{`
        @keyframes float-particle {
          0% { transform: translateY(0) rotate(0deg); opacity:0 }
          10% { opacity:1 }
          90% { opacity:1 }
          100% { transform: translateY(-100vh) rotate(360deg); opacity:0 }
        }
        .animate-bounce-gentle { animation: bounce-gentle 3s ease-in-out infinite; }
        @keyframes bounce-gentle {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-10px) }
        }
      `}</style>
    </div>
  );
};

export default ModelProfileSetup;
