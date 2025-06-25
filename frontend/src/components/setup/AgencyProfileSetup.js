// import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// // Fixed FormCheckboxGroup component
// const FormCheckboxGroup = React.memo(function FormCheckboxGroup({
//   label,
//   options,
//   selectedValues = [],
//   onChange,
//   error,
//   columns = 3,
// }) {
//   const handleToggle = (optionValue) => {
//     const isSelected = selectedValues.includes(optionValue);
//     let newValues;
//     if (isSelected) {
//       newValues = selectedValues.filter(v => v !== optionValue);
//     } else {
//       newValues = [...selectedValues, optionValue];
//     }
//     onChange(newValues);
//   };

//   return (
//     <div className="space-y-4">
//       <label className="block text-sm font-medium text-gray-300">{label}</label>
//       <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-3`}>
//         {options.map((option, index) => {
//           const optionValue = typeof option === 'string' ? option : option.value;
//           const optionLabel = typeof option === 'string' ? option : option.label;
//           const isSelected = selectedValues.includes(optionValue);
          
//           return (
//             <div 
//               key={`${optionValue}-${index}`} 
//               className="flex items-center space-x-3 cursor-pointer group"
//               onClick={() => handleToggle(optionValue)}
//             >
//               <div className="relative">
//                 <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
//                   isSelected 
//                     ? 'bg-amber-400 border-amber-400' 
//                     : 'border-gray-500 group-hover:border-gray-400'
//                 }`}>
//                   {isSelected && (
//                     <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                     </svg>
//                   )}
//                 </div>
//               </div>
//               <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200 cursor-pointer select-none">
//                 {optionLabel}
//               </span>
//             </div>
//           );
//         })}
//       </div>
//       {error && <p className="text-rose-400 text-sm mt-2 animate-pulse">{error}</p>}
//     </div>
//   );
// });

// // Also fix the other form components with the same pattern
// const FormInput = React.memo(function FormInput({
//  label,
//  type = 'text',
//  value,
//  onChange,
//  placeholder,
//  error,
//  required,
//  className = '',
//  unit,
//  onUnitChange,
//  unitOptions = [],
//  min,
//  max
// }) {
//  return (
//    <div className="group">
//      <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-amber transition-colors duration-200">
//        {label} {required && <span className="text-accent-amber">*</span>}
//      </label>
//      <div className="relative flex">
//        <input
//          type={type}
//          value={value || ''}
//          onChange={onChange}
//          placeholder={placeholder}
//          min={min}
//          max={max}
//          className={`${unitOptions.length ? 'rounded-l-xl rounded-r-none' : 'rounded-xl'} flex-1 px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 text-white placeholder-gray-400 
//            focus:outline-none focus:border-accent-amber/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-amber/20
//            transition-all duration-300 hover:border-gray-500/70 ${error ? 'border-rose-500 focus:border-rose-400' : ''} ${className}`}
//        />
//        {unitOptions.length > 0 && (
//          <select
//            value={unit}
//            onChange={onUnitChange}
//            className="px-3 py-3.5 bg-gray-700/50 border border-l-0 border-gray-600/30 rounded-r-xl text-white focus:outline-none focus:border-accent-amber/60 focus:bg-gray-800/50 transition-all duration-300"
//          >
//            {unitOptions.map((option) => (
//              <option key={option.value} value={option.value} className="bg-gray-800">
//                {option.label}
//              </option>
//            ))}
//          </select>
//        )}
//        {error && (
//          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//            <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//            </svg>
//          </div>
//        )}
//      </div>
//      {error && <p className="text-rose-400 text-sm mt-1 animate-pulse">{error}</p>}
//    </div>
//  });

// const FormSelect = React.memo(function FormSelect({
//  label,
//  value,
//  onChange,
//  options,
//  placeholder,
//  error,
//  required,
// }) {
//   return (
//     <div className="group">
//       <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-amber transition-colors duration-200">
//         {label} {required && <span className="text-accent-amber">*</span>}
//       </label>
//       <div className="relative">
//         <select
//           value={value || ''}
//           onChange={onChange}
//           className={`w-full px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 rounded-xl text-white 
//             focus:outline-none focus:border-accent-amber/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-amber/20
//             transition-all duration-300 hover:border-gray-500/70 appearance-none cursor-pointer ${error ? 'border-rose-500' : ''}`}
//         >
//           <option value="" className="bg-gray-800">{placeholder}</option>
//           {options.map((option) => (
//             <option key={option.value} value={option.value} className="bg-gray-800">
//               {option.label}
//             </option>
//           ))}
//         </select>
//         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//           </svg>
//         </div>
//       </div>
//       {error && <p className="text-rose-400 text-sm mt-1 animate-pulse">{error}</p>}
//     </div>
//   );
// });

// const FormTextarea = React.memo(function FormTextarea({
//  label,
//  value,
//  onChange,
//  placeholder,
//  error,
//  required,
//  rows = 4,
// }) {
//  return (
//    <div className="group">
//      <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-amber transition-colors duration-200">
//        {label} {required && <span className="text-accent-amber">*</span>}
//      </label>
//      <textarea
//        value={value || ''}
//        onChange={onChange}
//        placeholder={placeholder}
//        rows={rows}
//        className={`w-full px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 
//          focus:outline-none focus:border-accent-amber/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-amber/20
//          transition-all duration-300 hover:border-gray-500/70 resize-none ${error ? 'border-rose-500' : ''}`}
//      />
//      {error && <p className="text-rose-400 text-sm mt-1 animate-pulse">{error}</p>}
//    </div>
//  });

// const AgencyProfileSetup = ({
//  user = { firstName: 'Elite', lastName: 'Agency', email: 'contact@eliteagency.com' },
//  onLogout,
//  onProfileComplete,
// }) => {
//  const [currentStep, setCurrentStep] = useState(1);
//  const [isTransitioning, setIsTransitioning] = useState(false);
//  const [profileData, setProfileData] = useState({
//    // Basic Agency Information
//    companyName: '',
//    legalName: '',
//    tradingName: '',
//    agencyType: '',
//    description: '',
//    tagline: '',
//    missionStatement: '',
   
//    // Company Registration & Legal
//    foundedYear: '',
//    registrationNumber: '',
//    taxId: '',
//    licenseNumber: '',
//    companySize: '',
//    legalStructure: '',
//    parentCompany: '',
//    subsidiaries: '',
   
//    // Contact Information
//    email: user.email,
//    phone: '',
//    website: '',
//    emergencyContact: '',
   
//    // Address Information
//    address: {
//      street: '',
//      city: '',
//      state: '',
//      country: '',
//      zipCode: ''
//    },
//    mailingAddress: {
//      street: '',
//      city: '',
//      state: '',
//      country: '',
//      zipCode: '',
//      sameAsPhysical: true
//    },
   
//    // Agency Services & Specializations - Initialize as empty arrays
//    agencyServices: [],
//    talentTypes: [],
//    industryFocus: [],
//    clientTypes: [],
//    geographicReach: [],
   
//    // Financial & Business Information
//    annualRevenue: '',
//    clientPortfolioSize: '',
//    averageProjectValue: '',
//    paymentTerms: '',
//    currency: 'USD',
//    bankingInformation: '',
   
//    // Team & Leadership
//    keyPersonnel: '',
//    numberOfEmployees: '',
//    departmentStructure: [],
//    boardOfDirectors: '',
//    advisoryBoard: '',
   
//    // Operational Information
//    operatingHours: '',
//    timeZones: [],
//    languages: [],
//    officeLocations: '',
   
//    // Technology & Systems
//    technologyStack: [],
//    crm: '',
//    portfolioManagement: '',
   
//    // Certifications & Memberships - Initialize as empty arrays
//    industryCertifications: [],
//    professionalMemberships: [],
//    awards: '',
//    accreditations: '',
   
//    // Social Media & Digital Presence
//    socialMedia: {
//      linkedin: '',
//      instagram: '',
//      facebook: '',
//      twitter: '',
//      youtube: '',
//      tiktok: '',
//      website: '',
//      blog: ''
//    },
   
//    // Company Culture & Values
//    values: [],
//    culture: '',
//    benefits: [],
//    diversityStatement: '',
//    sustainabilityPractices: '',
   
//    // Legal & Compliance
//    dataProtectionPolicy: '',
//    privacyPolicy: '',
//    termsOfService: '',
//    insuranceCoverage: [],
//    complianceStandards: [],
   
//    // Marketing & Partnerships
//    marketingStrategy: '',
//    partnerAgencies: '',
//    vendorRelationships: '',
//    mediaRelations: '',
   
//    // Quality & Standards
//    qualityStandards: '',
//    clientSatisfactionMetrics: '',
//    talentRetentionRate: '',
//    successMetrics: ''
//  });

//  const [errors, setErrors] = useState({});
//  const [isSubmitting, setIsSubmitting] = useState(false);
//  const [completedSteps, setCompletedSteps] = useState(new Set());
//  const contentRef = useRef(null);
//  const cursorRef = useRef(null);
//  const cursorFollowerRef = useRef(null);
//  const bgAnimationRef = useRef(null);

//  // Cursor effect
//  useEffect(() => {
//    const handleMouseMove = (e) => {
//      const { clientX: x, clientY: y } = e;
//      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${x - 10}px, ${y - 10}px, 0)`;
//      if (cursorFollowerRef.current) cursorFollowerRef.current.style.transform = `translate3d(${x - 20}px, ${y - 20}px, 0)`;
//    };
//    document.addEventListener('mousemove', handleMouseMove, { passive: true });
//    return () => document.removeEventListener('mousemove', handleMouseMove);
//  }, []);

//  // Particles effect
//  useEffect(() => {
//    if (!bgAnimationRef.current) return;
//    const maxParticles = 8;
//    let particleCount = 0;
//    const createParticle = () => {
//      if (particleCount >= maxParticles) return;
//      const particle = document.createElement('div');
//      const size = Math.random() * 2 + 1;
//      const opacity = Math.random() * 0.3 + 0.1;
//      const duration = Math.random() * 10 + 8;
//      particle.className = 'absolute rounded-full pointer-events-none will-change-transform';
//      particle.style.cssText = `
//        width: ${size}px; height: ${size}px; background: #fbbf24;
//        left: ${Math.random() * 100}%; top: 100%; opacity: ${opacity};
//        animation: float-up-simple ${duration}s linear infinite;
//      `;
//      bgAnimationRef.current.appendChild(particle);
//      particleCount++;
//      setTimeout(() => {
//        particle.parentNode?.removeChild(particle);
//        particleCount--;
//      }, duration * 1000);
//    };
//    const interval = setInterval(createParticle, 3000);
//    for (let i = 0; i < 3; i++) setTimeout(createParticle, i * 1000);
//    return () => clearInterval(interval);
//  }, []);

//  const steps = useMemo(() => [
//    { number: 1, title: 'Agency Basics', icon: '✦', color: 'from-amber-400 to-amber-600' },
//    { number: 2, title: 'Legal & Registration', icon: '◈', color: 'from-orange-400 to-orange-600' },
//    { number: 3, title: 'Contact & Location', icon: '◊', color: 'from-yellow-400 to-yellow-600' },
//    { number: 4, title: 'Services & Talent', icon: '◯', color: 'from-emerald-400 to-emerald-600' },
//    { number: 5, title: 'Business Operations', icon: '✧', color: 'from-teal-400 to-teal-600' },
//    { number: 6, title: 'Team & Leadership', icon: '⬡', color: 'from-cyan-400 to-cyan-600' },
//    { number: 7, title: 'Digital Presence', icon: '⬢', color: 'from-blue-400 to-blue-600' },
//    { number: 8, title: 'Compliance & Standards', icon: '⬟', color: 'from-indigo-400 to-indigo-600' },
//    { number: 9, title: 'Review & Submit', icon: '⭐', color: 'from-purple-400 to-purple-600' },
//  ], []);

//  const options = useMemo(() => ({
//    agencyTypes: [
//      'Full-Service Modeling Agency', 'Fashion Modeling Agency', 'Commercial Modeling Agency',
//      'Talent Management Agency', 'Casting Agency', 'Boutique Agency', 'Plus-Size Modeling Agency',
//      'Child Modeling Agency', 'Fitness Modeling Agency', 'Hand/Parts Modeling Agency',
//      'International Modeling Agency', 'Digital/Influencer Agency', 'Entertainment Agency',
//      'Sports Talent Agency', 'Literary Agency', 'Specialty Talent Agency'
//    ],
//    legalStructures: [
//      { value: 'llc', label: 'Limited Liability Company (LLC)' },
//      { value: 'corporation', label: 'Corporation' },
//      { value: 'partnership', label: 'Partnership' },
//      { value: 'sole-proprietorship', label: 'Sole Proprietorship' },
//      { value: 'public-company', label: 'Public Company' },
//      { value: 'private-company', label: 'Private Company' },
//      { value: 'holding-company', label: 'Holding Company' }
//    ],
//    companySizes: [
//      { value: '1-5', label: '1-5 employees (Boutique)' },
//      { value: '6-15', label: '6-15 employees (Small)' },
//      { value: '16-50', label: '16-50 employees (Medium)' },
//      { value: '51-200', label: '51-200 employees (Large)' },
//      { value: '201-1000', label: '201-1,000 employees (Enterprise)' },
//      { value: '1000+', label: '1,000+ employees (Global)' }
//    ],
//    agencyServices: [
//      'Model Representation', 'Talent Scouting', 'Career Development', 'Portfolio Development',
//      'Casting Services', 'Event Planning', 'Brand Partnerships', 'Social Media Management',
//      'PR Services', 'Training & Workshops', 'Contract Negotiation', 'International Placements',
//      'Fashion Show Coordination', 'Editorial Bookings', 'Commercial Bookings', 'Celebrity Management',
//      'Influencer Marketing', 'Digital Content Creation', 'Brand Consulting', 'Talent Coaching',
//      'Image Consulting', 'Personal Branding', 'Crisis Management', 'Legal Services'
//    ],
//    talentTypes: [
//      'Fashion Models', 'Commercial Models', 'Runway Models', 'Print Models', 'Plus-Size Models',
//      'Petite Models', 'Fitness Models', 'Hand Models', 'Child Models', 'Senior Models',
//      'Alternative Models', 'Influencers', 'Content Creators', 'Actors', 'Dancers', 'Musicians',
//      'Voice Talent', 'Athletes', 'Celebrities', 'Brand Ambassadors', 'Lifestyle Models',
//      'Beauty Models', 'Editorial Models', 'E-commerce Models', 'Catalog Models'
//    ],
//    industryFocus: [
//      'High Fashion', 'Commercial Fashion', 'Beauty & Cosmetics', 'Fitness & Athletic',
//      'Lifestyle', 'Luxury Brands', 'E-commerce', 'Advertising', 'Editorial', 'Catalog',
//      'Automotive', 'Technology', 'Food & Beverage', 'Travel & Tourism', 'Healthcare',
//      'Finance', 'Real Estate', 'Entertainment', 'Sports', 'Music Industry', 'Film & TV',
//      'Digital Media', 'Social Media', 'Retail', 'Fashion Weeks'
//    ],
//    clientTypes: [
//      'Fashion Brands', 'Beauty Brands', 'Advertising Agencies', 'Photographers', 'Fashion Magazines',
//      'E-commerce Companies', 'Luxury Brands', 'Retail Companies', 'Casting Directors',
//      'Production Companies', 'Event Planners', 'PR Agencies', 'Marketing Agencies',
//      'Film Studios', 'TV Networks', 'Music Labels', 'Sports Brands', 'Tech Companies',
//      'Automotive Brands', 'Travel Companies', 'Healthcare Brands', 'Financial Services'
//    ],
//    geographicReach: [
//      'Local/Regional', 'National', 'North America', 'Europe', 'Asia-Pacific', 'Latin America',
//      'Middle East & Africa', 'Global', 'Fashion Capitals (NYC, Paris, Milan, London)',
//      'Emerging Markets', 'Digital/Remote'
//    ],
//    departmentStructure: [
//      'Talent Management', 'Scouting', 'Bookings', 'Marketing', 'PR & Communications',
//      'Finance & Accounting', 'Legal', 'Human Resources', 'Operations', 'IT & Technology',
//      'International Division', 'New Media/Digital', 'Development', 'Client Relations',
//      'Creative Services', 'Production'
//    ],
//    timeZones: [
//      'EST (Eastern)', 'CST (Central)', 'MST (Mountain)', 'PST (Pacific)', 'GMT (London)',
//      'CET (Central Europe)', 'JST (Japan)', 'AEST (Australia)', 'IST (India)', 'CST (China)',
//      'Multiple Time Zones'
//    ],
//    languages: [
//      'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
//      'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Dutch', 'Swedish',
//      'Norwegian', 'Polish', 'Turkish', 'Hindi', 'Multiple Languages'
//    ],
//    technologyStack: [
//      'CRM Systems', 'Portfolio Management Software', 'Casting Platforms', 'Social Media Tools',
//      'Project Management Software', 'Financial Management Systems', 'Communication Tools',
//      'Digital Asset Management', 'Video Conferencing', 'Mobile Apps', 'Cloud Storage',
//      'Analytics Platforms', 'E-commerce Integration', 'API Integrations'
//    ],
//    industryCertifications: [
//      'Better Business Bureau', 'Association of Model Agents', 'SAG-AFTRA Franchised',
//      'International Modeling & Talent Association', 'Fashion Group International',
//      'Council of Fashion Designers of America', 'ISO 9001 Quality Management',
//      'Data Protection Certifications', 'Professional Talent Agencies Association',
//      'Entertainment Industry Certifications'
//    ],
//    professionalMemberships: [
//      'Association of Model Agents (AMA)', 'International Modeling & Talent Association (IMTA)',
//      'National Association of Television Program Executives (NATPE)', 'Fashion Group International',
//      'Council of Fashion Designers of America (CFDA)', 'Better Business Bureau',
//      'Chamber of Commerce', 'Professional Talent Agencies Association',
//      'International Association of Talent Agents', 'Entertainment Industry Organizations'
//    ],
//    insuranceCoverage: [
//      'General Liability', 'Professional Liability', 'Errors & Omissions', 'Cyber Liability',
//      'Directors & Officers', 'Employment Practices Liability', 'International Coverage',
//      'Talent Protection Insurance', 'Event Insurance', 'Property Insurance'
//    ],
//    complianceStandards: [
//      'GDPR Compliance', 'COPPA Compliance', 'Labor Law Compliance', 'Child Protection Standards',
//      'Anti-Discrimination Policies', 'Health & Safety Standards', 'Financial Regulations',
//      'International Trade Compliance', 'Data Protection Standards', 'Industry Ethics Codes'
//    ],
//    currencies: [
//      { value: 'USD', label: 'USD ($)' },
//      { value: 'EUR', label: 'EUR (€)' },
//      { value: 'GBP', label: 'GBP (£)' },
//      { value: 'CAD', label: 'CAD ($)' },
//      { value: 'JPY', label: 'JPY (¥)' },
//      { value: 'AUD', label: 'AUD ($)' },
//      { value: 'CHF', label: 'CHF' }
//    ]
//  }), []);

//  // Fixed handleInputChange function
//  const handleInputChange = useCallback((field, value) => {
//    setProfileData(prev => {
//      if (field.includes('.')) {
//        const [parent, child] = field.split('.');
//        return {
//          ...prev,
//          [parent]: {
//            ...prev[parent],
//            [child]: value
//          }
//        };
//      }
//      return { ...prev, [field]: value };
//    });
   
//    // Clear errors when field is edited
//    setErrors(prev => {
//      if (prev[field]) {
//        const copy = { ...prev };
//        delete copy[field];
//        return copy;
//      }
//      return prev;
//    });
//  }, []);

//  const validateStep = useCallback((step) => {
//    const errs = {};
//    switch (step) {
//      case 1:
//        if (!profileData.companyName?.trim()) errs.companyName = 'Agency name is required';
//        if (!profileData.agencyType) errs.agencyType = 'Agency type is required';
//        if (!profileData.description?.trim()) errs.description = 'Description is required';
//        if (!profileData.foundedYear) errs.foundedYear = 'Founded year is required';
//        break;
//      case 2:
//        if (!profileData.legalName?.trim()) errs.legalName = 'Legal name is required';
//        if (!profileData.legalStructure) errs.legalStructure = 'Legal structure is required';
//        if (!profileData.registrationNumber?.trim()) errs.registrationNumber = 'Registration number is required';
//        break;
//      case 3:
//        if (!profileData.email || !/^\S+@\S+\.\S+$/.test(profileData.email)) errs.email = 'Valid email is required';
//        if (!profileData.phone) errs.phone = 'Phone number is required';
//        if (!profileData.address.street) errs['address.street'] = 'Street address is required';
//        if (!profileData.address.city) errs['address.city'] = 'City is required';
//        if (!profileData.address.country) errs['address.country'] = 'Country is required';
//        break;
//      case 4:
//        if (profileData.agencyServices.length === 0) errs.agencyServices = 'Select at least one service';
//        if (profileData.talentTypes.length === 0) errs.talentTypes = 'Select at least one talent type';
//        if (profileData.industryFocus.length === 0) errs.industryFocus = 'Select at least one industry focus';
//        break;
//      case 5:
//        if (!profileData.companySize) errs.companySize = 'Company size is required';
//        if (!profileData.currency) errs.currency = 'Currency is required';
//        break;
//    }
//    return errs;
//  }, [profileData]);

//  const navigateToStep = useCallback(async (targetStep) => {
//    if (targetStep === currentStep) return;
//    if (targetStep > currentStep) {
//      const stepErrs = validateStep(currentStep);
//      if (Object.keys(stepErrs).length) {
//        setErrors(stepErrs);
//        return;
//      }
//      setCompletedSteps(prev => new Set([...prev, currentStep]));
//    }
//    setIsTransitioning(true);
//    setErrors({});
//    await new Promise(r => setTimeout(r, 300));
//    setCurrentStep(targetStep);
//    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
//    setTimeout(() => setIsTransitioning(false), 300);
//  }, [currentStep, validateStep]);

//  const nextStep = () => navigateToStep(currentStep + 1);
//  const prevStep = () => navigateToStep(currentStep - 1);

//  const handleSubmit = async () => {
//    setIsSubmitting(true);
//    try {
//      const token = localStorage.getItem('token');
//      const response = await fetch('http://localhost:8001/api/profile/complete', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//          'Authorization': `Bearer ${token}`
//        },
//        body: JSON.stringify(profileData),
//      });

//      const data = await response.json();

//      if (response.ok) {
//        onProfileComplete?.();
//      } else {
//        alert(data.message || 'Failed to save profile. Please try again.');
//      }
//    } catch (e) {
//      console.error('Profile submission failed:', e);
//      alert('Network error. Please try again.');
//    } finally {
//      setIsSubmitting(false);
//    }
//  };

//  const renderStepContent = () => {
//    const commonProps = {
//      className: `transition-all duration-700 ${isTransitioning ? 'opacity-0 translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'}`
//    };

//    switch (currentStep) {
//      case 1:
//        return (
//          <div {...commonProps}>
//            <div className="text-center mb-10">
//              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
//                <span className="text-gradient-amber">✦</span>
//              </div>
//              <h2 className="text-3xl font-display font-light text-white mb-3">Agency <span className="text-gradient-amber">Basics</span></h2>
//              <p className="text-gray-400 font-light">Establish your agency's core identity and mission</p>
//            </div>
           
//            <div className="space-y-6">
//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <FormInput
//                  label="Agency Name"
//                  value={profileData.companyName}
//                  onChange={(e) => handleInputChange('companyName', e.target.value)}
//                  placeholder="Elite Modeling Agency"
//                  error={errors.companyName}
//                  required
//                />
//                <FormInput
//                  label="Trading Name (if different)"
//                  value={profileData.tradingName}
//                  onChange={(e) => handleInputChange('tradingName', e.target.value)}
//                  placeholder="DBA or trading name"
//                />
//                <FormSelect
//                  label="Agency Type"
//                  value={profileData.agencyType}
//                  onChange={(e) => handleInputChange('agencyType', e.target.value)}
//                  options={options.agencyTypes.map(type => ({ value: type, label: type }))}
//                  placeholder="Select agency type"
//                  error={errors.agencyType}
//                  required
//                />
//                <FormInput
//                  label="Founded Year"
//                  type="number"
//                  value={profileData.foundedYear}
//                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
//                  placeholder="2010"
//                  min="1800"
//                  max={new Date().getFullYear()}
//                  error={errors.foundedYear}
//                  required
//                />
//              </div>

//              <FormInput
//                label="Agency Tagline"
//                value={profileData.tagline}
//                onChange={(e) => handleInputChange('tagline', e.target.value)}
//                placeholder="Discovering tomorrow's stars today"
//              />

//              <FormTextarea
//                label="Agency Description"
//                value={profileData.description}
//                onChange={(e) => handleInputChange('description', e.target.value)}
//                placeholder="Describe your agency, mission, and what makes you unique in the industry..."
//                error={errors.description}
//                required
//                rows={5}
//              />

//              <FormTextarea
//                label="Mission Statement"
//                value={profileData.missionStatement}
//                onChange={(e) => handleInputChange('missionStatement', e.target.value)}
//                placeholder="Define your agency's mission and core purpose..."
//                rows={3}
//              />

//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <FormInput
//                  label="Parent Company (if applicable)"
//                  value={profileData.parentCompany}
//                  onChange={(e) => handleInputChange('parentCompany', e.target.value)}
//                  placeholder="Parent company or holding group"
//                />
//                <FormTextarea
//                  label="Subsidiaries (if any)"
//                  value={profileData.subsidiaries}
//                  onChange={(e) => handleInputChange('subsidiaries', e.target.value)}
//                  placeholder="List subsidiary companies or divisions..."
//                  rows={2}
//                />
//              </div>
//            </div>
//          </div>
//        );

//      case 2:
//        return (
//          <div {...commonProps}>
//            <div className="text-center mb-10">
//              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
//                <span className="text-gradient-amber">◈</span>
//              </div>
//              <h2 className="text-3xl font-display font-light text-white mb-3">Legal & <span className="text-gradient-amber">Registration</span></h2>
//              <p className="text-gray-400 font-light">Complete your legal and compliance information</p>
//            </div>
           
//            <div className="space-y-6">
//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <FormInput
//                  label="Legal Company Name"
//                  value={profileData.legalName}
//                  onChange={(e) => handleInputChange('legalName', e.target.value)}
//                  placeholder="Elite Modeling Agency, LLC"
//                  error={errors.legalName}
//                  required
//                />
//                <FormSelect
//                  label="Legal Structure"
//                  value={profileData.legalStructure}
//                  onChange={(e) => handleInputChange('legalStructure', e.target.value)}
//                  options={options.legalStructures}
//                  placeholder="Select legal structure"
//                  error={errors.legalStructure}
//                  required
//                />
//                <FormInput
//                  label="Registration Number"
//                  value={profileData.registrationNumber}
//                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
//                  placeholder="Business registration number"
//                  error={errors.registrationNumber}
//                  required
//                />
//                <FormInput
//                  label="Tax ID / EIN"
//                  value={profileData.taxId}
//                  onChange={(e) => handleInputChange('taxId', e.target.value)}
//                  placeholder="Tax identification number"
//                />
//                <FormInput
//                  label="License Number"
//                  value={profileData.licenseNumber}
//                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
//                  placeholder="Agency license number (if required)"
//                />
//                <FormSelect
//                  label="Company Size"
//                  value={profileData.companySize}
//                  onChange={(e) => handleInputChange('companySize', e.target.value)}
//                  options={options.companySizes}
//                  placeholder="Select company size"
//                />
//              </div>

//              <FormCheckboxGroup
//                label="Industry Certifications"
//                options={options.industryCertifications}
//                selectedValues={profileData.industryCertifications}
//                onChange={(values) => handleInputChange('industryCertifications', values)}
//                columns={3}
//              />

//              <FormCheckboxGroup
//                label="Professional Memberships"
//                options={options.professionalMemberships}
//                selectedValues={profileData.professionalMemberships}
//                onChange={(values) => handleInputChange('professionalMemberships', values)}
//                columns={3}
//              />

//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <FormTextarea
//                  label="Awards & Recognition"
//                  value={profileData.awards}
//                  onChange={(e) => handleInputChange('awards', e.target.value)}
//                  placeholder="List major awards, recognition, and achievements..."
//                  rows={4}
//                />
//                <FormTextarea
//                  label="Accreditations"
//                  value={profileData.accreditations}
//                  onChange={(e) => handleInputChange('accreditations', e.target.value)}
//                  placeholder="Industry accreditations and certifications..."
//                  rows={4}
//                />
//              </div>
//            </div>
//          </div>
//        );

//      case 3:
//        return (
//          <div {...commonProps}>
//            <div className="text-center mb-10">
//              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
//                <span className="text-gradient-amber">◊</span>
//              </div>
//              <h2 className="text-3xl font-display font-light text-white mb-3">Contact & <span className="text-gradient-amber">Location</span></h2>
//              <p className="text-gray-400 font-light">Provide your contact information and office details</p>
//            </div>
           
//            <div className="space-y-6">
//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <FormInput
//                  label="Primary Email"
//                  type="email"
//                  value={profileData.email}
//                  onChange={(e) => handleInputChange('email', e.target.value)}
//                  placeholder="contact@eliteagency.com"
//                  error={errors.email}
//                  required
//                />
//                <FormInput
//                  label="Primary Phone"
//                  type="tel"
//                  value={profileData.phone}
//                  onChange={(e) => handleInputChange('phone', e.target.value)}
//                  placeholder="+1 (555) 123-4567"
//                  error={errors.phone}
//                  required
//                />
//                <FormInput
//                  label="Website"
//                  type="url"
//                  value={profileData.website}
//                  onChange={(e) => handleInputChange('website', e.target.value)}
//                  placeholder="https://www.eliteagency.com"
//                />
//                <FormInput
//                  label="Emergency Contact"
//                  value={profileData.emergencyContact}
//                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
//                  placeholder="24/7 emergency contact number"
//                />
//              </div>

//              <div className="glass-effect rounded-xl p-6">
//                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
//                  <span className="text-accent-amber mr-2">🏢</span> Primary Office Address
//                </h3>
               
//                <div className="space-y-4">
//                  <FormInput
//                    label="Street Address"
//                    value={profileData.address.street}
//                    onChange={(e) => handleInputChange('address.street', e.target.value)}
//                    placeholder="123 Fashion Avenue, Suite 100"
//                    error={errors['address.street']}
//                    required
//                  />
                 
//                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                    <FormInput
//                      label="City"
//                      value={profileData.address.city}
//                      onChange={(e) => handleInputChange('address.city', e.target.value)}
//                      placeholder="New York"
//                      error={errors['address.city']}
//                      required
//                    />
//                    <FormInput
//                      label="State/Province"
//                      value={profileData.address.state}
//                      onChange={(e) => handleInputChange('address.state', e.target.value)}
//                      placeholder="NY"
//                    />
//                    <FormInput
//                      label="ZIP/Postal Code"
//                      value={profileData.address.zipCode}
//                      onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
//                      placeholder="10001"
//                    />
//                    <FormInput
//                      label="Country"
//                      value={profileData.address.country}
//                      onChange={(e) => handleInputChange('address.country', e.target.value)}
//                      placeholder="United States"
//                      error={errors['address.country']}
//                      required
//                    />
//                  </div>
//                </div>
//              </div>

//              <FormTextarea
//                label="Additional Office Locations"
//                value={profileData.officeLocations}
//                onChange={(e) => handleInputChange('officeLocations', e.target.value)}
//                placeholder="List other office locations, satellite offices, or international branches..."
//                rows={3}
//              />
//            </div>
//          </div>
//        );

//      case 4:
//        return (
//          <div {...commonProps}>
//            <div className="text-center mb-10">
//              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
//                <span className="text-gradient-amber">◯</span>
//              </div>
//              <h2 className="text-3xl font-display font-light text-white mb-3">Services & <span className="text-gradient-amber">Talent</span></h2>
//              <p className="text-gray-400 font-light">Define your agency's services and talent specializations</p>
//            </div>
           
//            <div className="space-y-8">
//              <FormCheckboxGroup
//                label="Agency Services"
//                options={options.agencyServices}
//                selectedValues={profileData.agencyServices}
//                onChange={(values) => handleInputChange('agencyServices', values)}
//                error={errors.agencyServices}
//                columns={3}
//              />

//              <FormCheckboxGroup
//                label="Talent Types We Represent"
//                options={options.talentTypes}
//                selectedValues={profileData.talentTypes}
//                onChange={(values) => handleInputChange('talentTypes', values)}
//                error={errors.talentTypes}
//                columns={3}
//              />

//              <FormCheckboxGroup
//                label="Industry Focus"
//                options={options.industryFocus}
//                selectedValues={profileData.industryFocus}
//                onChange={(values) => handleInputChange('industryFocus', values)}
//                error={errors.industryFocus}
//                columns={3}
//              />

//              <FormCheckboxGroup
//                label="Client Types"
//                options={options.clientTypes}
//                selectedValues={profileData.clientTypes}
//                onChange={(values) => handleInputChange('clientTypes', values)}
//                columns={3}
//              />

//              <FormCheckboxGroup
//                label="Geographic Reach"
//                options={options.geographicReach}
//                selectedValues={profileData.geographicReach}
//                onChange={(values) => handleInputChange('geographicReach', values)}
//                columns={3}
//              />
//            </div>
//          </div>
//        );

//      case 5:
//        return (
//          <div {...commonProps}>
//            <div className="text-center mb-10">
//              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
//                <span className="text-gradient-amber">✧</span>
//              </div>
//              <h2 className="text-3xl font-display font-light text-white mb-3">Business <span className="text-gradient-amber">Operations</span></h2>
//              <p className="text-gray-400 font-light">Configure your operational and financial details</p>
//            </div>
           
//            <div className="space-y-6">
//              <div className="glass-effect rounded-xl p-6">
//                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
//                  <span className="text-accent-amber mr-2">💰</span> Financial Information
//                </h3>
//                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                  <FormSelect
//                    label="Annual Revenue Range"
//                    value={profileData.annualRevenue}
//                    onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
//                    options={[
//                      { value: 'under-1m', label: 'Under $1M' },
//                      { value: '1m-5m', label: '$1M - $5M' },
//                      { value: '5m-25m', label: '$5M - $25M' },
//                      { value: '25m-100m', label: '$25M - $100M' },
//                      { value: 'over-100m', label: 'Over $100M' }
//                    ]}
//                    placeholder="Select revenue range"
//                  />
//                  <FormSelect
//                    label="Primary Currency"
//                    value={profileData.currency}
//                    onChange={(e) => handleInputChange('currency', e.target.value)}
//                    options={options.currencies}
//                    placeholder="Select currency"
//                    error={errors.currency}
//                    required
//                  />
//                  <FormInput
//                    label="Client Portfolio Size"
//                    value={profileData.clientPortfolioSize}
//                    onChange={(e) => handleInputChange('clientPortfolioSize', e.target.value)}
//                    placeholder="Number of active clients"
//                  />
//                  <FormInput
//                    label="Average Project Value"
//                    value={profileData.averageProjectValue}
//                    onChange={(e) => handleInputChange('averageProjectValue', e.target.value)}
//                    placeholder="Average booking value"
//                  />
//                </div>
               
//                <div className="mt-4">
//                  <FormTextarea
//                    label="Payment Terms"
//                    value={profileData.paymentTerms}
//                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
//                    placeholder="Standard payment terms, commission rates, billing practices..."
//                    rows={3}
//                  />
//                </div>
//              </div>

//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <FormInput
//                  label="Operating Hours"
//                  value={profileData.operatingHours}
//                  onChange={(e) => handleInputChange('operatingHours', e.target.value)}
//                  placeholder="Monday-Friday 9AM-6PM EST"
//                />
//                <FormInput
//                  label="Number of Employees"
//                  type="number"
//                  value={profileData.numberOfEmployees}
//                  onChange={(e) => handleInputChange('numberOfEmployees', e.target.value)}
//                  placeholder="Total number of employees"
//                />
//              </div>

//              <FormCheckboxGroup
//                label="Time Zones Served"
//                options={options.timeZones}
//                selectedValues={profileData.timeZones}
//                onChange={(values) => handleInputChange('timeZones', values)}
//                columns={3}
//              />

//              <FormCheckboxGroup
//                label="Languages Supported"
//                options={options.languages}
//                selectedValues={profileData.languages}
//                onChange={(values) => handleInputChange('languages', values)}
//                columns={4}
//              />

//              <FormCheckboxGroup
//                label="Technology & Systems"
//                options={options.technologyStack}
//                selectedValues={profileData.technologyStack}
//                onChange={(values) => handleInputChange('technologyStack', values)}
//                columns={3}
//              />

//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <FormInput
//                  label="CRM System"
//                  value={profileData.crm}
//                  onChange={(e) => handleInputChange('crm', e.target.value)}
//                  placeholder="Primary CRM platform used"
//                />
//                <FormInput
//                  label="Portfolio Management System"
//                  value={profileData.portfolioManagement}
//                  onChange={(e) => handleInputChange('portfolioManagement', e.target.value)}
//                  placeholder="Talent portfolio management system"
//                />
//              </div>
//            </div>
//          </div>
//        );

//      case 6:
//        return (
//          <div {...commonProps}>
//            <div className="text-center mb-10">
//              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
//                <span className="text-gradient-amber">⬡</span>
//              </div>
//              <h2 className="text-3xl font-display font-light text-white mb-3">Team & <span className="text-gradient-amber">Leadership</span></h2>
//              <p className="text-gray-400 font-light">Showcase your leadership team and organizational structure</p>
//            </div>
           
//            <div className="space-y-6">
//              <FormTextarea
//                label="Key Personnel & Leadership Team"
//                value={profileData.keyPersonnel}
//                onChange={(e) => handleInputChange('keyPersonnel', e.target.value)}
//                placeholder="List key executives, founders, and department heads with their roles and experience..."
//                rows={5}
//              />

//              <FormCheckboxGroup
//                label="Department Structure"
//                options={options.departmentStructure}
//                selectedValues={profileData.departmentStructure}
//                onChange={(values) => handleInputChange('departmentStructure', values)}
//                columns={3}
//              />

//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <FormTextarea
//                  label="Board of Directors"
//                  value={profileData.boardOfDirectors}
//                  onChange={(e) => handleInputChange('boardOfDirectors', e.target.value)}
//                  placeholder="List board members and their backgrounds..."
//                  rows={4}
//                />
//                <FormTextarea
//                  label="Advisory Board"
//                  value={profileData.advisoryBoard}
//                  onChange={(e) => handleInputChange('advisoryBoard', e.target.value)}
//                  placeholder="Industry advisors and mentors..."
//                  rows={4}
//                />
//              </div>

//              <div className="glass-effect rounded-xl p-6">
//                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
//                  <span className="text-accent-amber mr-2">🎯</span> Company Culture & Values
//                </h3>
               
//                <div className="space-y-4">
//                  <FormTextarea
//                    label="Company Culture"
//                    value={profileData.culture}
//                    onChange={(e) => handleInputChange('culture', e.target.value)}
//                    placeholder="Describe your agency culture, work environment, and company philosophy..."
//                    rows={4}
//                  />

//                  <FormInput
//                    label="Core Values"
//                    value={profileData.values.join(', ')}
//                    onChange={(e) => {
//                      const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
//                      handleInputChange('values', values);
//                    }}
//                    placeholder="Integrity, Excellence, Diversity, Innovation (comma separated)"
//                  />

//                  <FormInput
//                    label="Employee Benefits"
//                    value={profileData.benefits.join(', ')}
//                    onChange={(e) => {
//                      const benefits = e.target.value.split(',').map(b => b.trim()).filter(b => b);
//                      handleInputChange('benefits', benefits);
//                    }}
//                    placeholder="Health Insurance, 401k, Remote Work, Professional Development (comma separated)"
//                  />

//                  <FormTextarea
//                    label="Diversity & Inclusion Statement"
//                    value={profileData.diversityStatement}
//                    onChange={(e) => handleInputChange('diversityStatement', e.target.value)}
//                    placeholder="Your commitment to diversity, equity, and inclusion..."
//                    rows={3}
//                  />

//                  <FormTextarea
//                    label="Sustainability Practices"
//                    value={profileData.sustainabilityPractices}
//                    onChange={(e) => handleInputChange('sustainabilityPractices', e.target.value)}
//                    placeholder="Environmental and social responsibility initiatives..."
//                    rows={3}
//                  />
//                </div>
//              </div>
//            </div>
//          </div>
//        );

//      case 7:
//        return (
//          <div {...commonProps}>
//            <div className="text-center mb-10">
//              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
//                <span className="text-gradient-amber">⬢</span>
//              </div>
//              <h2 className="text-3xl font-display font-light text-white mb-3">Digital <span className="text-gradient-amber">Presence</span></h2>
//              <p className="text-gray-400 font-light">Establish your online presence and marketing strategy</p>
//            </div>
           
//            <div className="space-y-6">
//              <div className="glass-effect rounded-xl p-6">
//                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
//                  <span className="text-accent-amber mr-2">📱</span> Social Media Presence
//                </h3>
//                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                  <FormInput
//                    label="LinkedIn"
//                    type="url"
//                    value={profileData.socialMedia.linkedin}
//                    onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
//                    placeholder="LinkedIn company page URL"
//                  />
//                  <FormInput
//                    label="Instagram"
//                    value={profileData.socialMedia.instagram}
//                    onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
//                    placeholder="@youragency"
//                  />
//                  <FormInput
//                    label="Facebook"
//                    value={profileData.socialMedia.facebook}
//                    onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
//                    placeholder="Facebook page URL"
//                  />
//                  <FormInput
//                    label="Twitter/X"
//                    value={profileData.socialMedia.twitter}
//                    onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
//                    placeholder="@youragency"
//                  />
//                  <FormInput
//                    label="YouTube"
//                    type="url"
//                    value={profileData.socialMedia.youtube}
//                    onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
//                    placeholder="YouTube channel URL"
//                  />
//                  <FormInput
//                    label="TikTok"
//                    value={profileData.socialMedia.tiktok}
//                    onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
//                    placeholder="@youragency"
//                  />
//                </div>
//              </div>

//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <FormTextarea
//                  label="Marketing Strategy"
//                  value={profileData.marketingStrategy}
//                  onChange={(e) => handleInputChange('marketingStrategy', e.target.value)}
//                  placeholder="Describe your marketing approach, brand positioning, and promotional strategies..."
//                  rows={4}
//                />
//                <FormTextarea
//                  label="Media Relations"
//                  value={profileData.mediaRelations}
//                  onChange={(e) => handleInputChange('mediaRelations', e.target.value)}
//                  placeholder="Media contacts, PR strategy, and press relationships..."
//                  rows={4}
//                />
//              </div>
//            </div>
//          </div>
//        );

//      case 8:
//        return (
//          <div {...commonProps}>
//            <div className="text-center mb-10">
//              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
//                <span className="text-gradient-amber">⬟</span>
//              </div>
//              <h2 className="text-3xl font-display font-light text-white mb-3">Compliance & <span className="text-gradient-amber">Standards</span></h2>
//              <p className="text-gray-400 font-light">Ensure legal compliance and quality standards</p>
//            </div>
           
//            <div className="space-y-6">
//              <FormCheckboxGroup
//                label="Insurance Coverage"
//                options={options.insuranceCoverage}
//                selectedValues={profileData.insuranceCoverage}
//                onChange={(values) => handleInputChange('insuranceCoverage', values)}
//                columns={3}
//              />

//              <FormCheckboxGroup
//                label="Compliance Standards"
//                options={options.complianceStandards}
//                selectedValues={profileData.complianceStandards}
//                onChange={(values) => handleInputChange('complianceStandards', values)}
//                columns={3}
//              />

//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <FormTextarea
//                  label="Quality Standards"
//                  value={profileData.qualityStandards}
//                  onChange={(e) => handleInputChange('qualityStandards', e.target.value)}
//                  placeholder="Service quality standards and procedures..."
//                  rows={4}
//                />
//                <FormTextarea
//                  label="Success Metrics"
//                  value={profileData.successMetrics}
//                  onChange={(e) => handleInputChange('successMetrics', e.target.value)}
//                  placeholder="KPIs, success measurements, performance metrics..."
//                  rows={4}
//                />
//              </div>
//            </div>
//          </div>
//        );

//      case 9:
//        return (
//          <div {...commonProps}>
//            <div className="text-center mb-10">
//              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
//                <span className="text-gradient-amber">⭐</span>
//              </div>
//              <h2 className="text-3xl font-display font-light text-white mb-3">Review & <span className="text-gradient-amber">Submit</span></h2>
//              <p className="text-gray-400 font-light">Finalize your comprehensive agency profile</p>
//            </div>
           
//            <div className="space-y-8">
//              {/* Summary sections here - same as before */}
//              <div className="glass-effect-strong rounded-xl p-6 border border-emerald-500/30">
//                <div className="flex items-center space-x-3">
//                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
//                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                    </svg>
//                  </div>
//                  <div>
//                    <h4 className="text-accent-amber font-medium">Ready to Launch</h4>
//                    <p className="text-gray-300 text-sm">Your comprehensive agency profile is complete. Click submit to launch your professional presence.</p>
//                  </div>
//                </div>
//              </div>
//            </div>
//          </div>
//        );

//      default:
//        return null;
//    }
//  };

//  // Main component render
//  return (
//    <div className="min-h-screen bg-primary-black cursor-none">
//      {/* CSS and other elements remain the same */}
//      <style jsx>{`
//        @keyframes float-up-simple {
//          0% {
//            transform: translateY(0) rotate(0deg);
//            opacity: 0;
//          }
//          10% {
//            opacity: 1;
//          }
//          90% {
//            opacity: 1;
//          }
//          100% {
//            transform: translateY(-100vh) rotate(360deg);
//            opacity: 0;
//          }
//        }
       
//        .text-gradient-amber {
//          background: linear-gradient(135deg, #fafafa 0%, #fbbf24 50%, #f59e0b 100%);
//          -webkit-background-clip: text;
//          -webkit-text-fill-color: transparent;
//          background-clip: text;
//        }
       
//        .glass-effect {
//          background: rgba(255, 255, 255, 0.03);
//          backdrop-filter: blur(15px);
//          border: 1px solid rgba(255, 255, 255, 0.08);
//        }
       
//        .glass-effect-strong {
//          background: rgba(255, 255, 255, 0.05);
//          backdrop-filter: blur(20px);
//          border: 1px solid rgba(255, 255, 255, 0.1);
//        }

//        .accent-amber {
//          color: #fbbf24;
//        }

//        .primary-black {
//          color: #000000;
//        }
//      `}</style>

//      {/* Cursors */}
//      <div 
//        ref={cursorRef}
//        className="fixed w-5 h-5 bg-amber-400 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block will-change-transform"
//      />
//      <div 
//        ref={cursorFollowerRef}
//        className="fixed w-8 h-8 border border-amber-400/30 rounded-full pointer-events-none z-40 hidden md:block will-change-transform"
//      />

//      {/* Particles Container */}
//      <div 
//        ref={bgAnimationRef}
//        className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
//      />

//      {/* Background */}
//      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/10 via-black to-gray-900/5">
//        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-400/3 rounded-full blur-3xl" />
//        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-400/2 rounded-full blur-2xl" />
//      </div>

//      {/* Header */}
//      <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700/30 sticky top-0 z-30">
//        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//          <div className="flex justify-between items-center py-4">
//            <div className="flex items-center space-x-4">
//              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
//                <span className="text-white font-bold text-lg">🎭</span>
//              </div>
//              <div>
//                <h1 className="text-xl font-display font-light text-white">ELITE <span className="text-accent-amber">Agency Setup</span></h1>
//                <p className="text-gray-400 text-sm">Create your comprehensive talent agency profile</p>
//              </div>
//            </div>
//            <button
//              onClick={onLogout}
//              className="px-4 py-2 text-gray-300 hover:text-amber-400 transition-colors duration-200"
//            >
//              Logout
//            </button>
//          </div>
//        </div>
//      </header>

//      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
//        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//          {/* Sidebar Navigation */}
//          <div className="lg:col-span-1">
//            <div className="glass-effect rounded-2xl p-6 sticky top-24">
//              <h3 className="text-lg font-display font-light text-white mb-6">Setup <span className="text-accent-amber">Progress</span></h3>
//              <div className="space-y-4">
//                {steps.map((step) => {
//                  const isActive = step.number === currentStep;
//                  const isCompleted = completedSteps.has(step.number);
//                  const isClickable = step.number <= currentStep || completedSteps.has(step.number);

//                  return (
//                    <button
//                      key={step.number}
//                      onClick={() => isClickable && navigateToStep(step.number)}
//                      disabled={!isClickable}
//                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
//                       isActive
//                         ? `bg-gradient-to-r ${step.color} text-white shadow-lg transform scale-105`
//                         : isCompleted
//                         ? 'glass-effect border border-amber-400/30 text-amber-400 hover:border-amber-400/50'
//                         : isClickable
//                         ? 'bg-gray-800/50 border border-gray-600/50 text-gray-300 hover:bg-gray-800/70 hover:border-gray-500/50'
//                         : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
//                     }`}
//                   >
//                     <div className="flex items-center space-x-3">
//                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
//                         isActive ? 'bg-white/20' : isCompleted ? 'bg-amber-400/20' : 'bg-gray-600/50'
//                       }`}>
//                         {isCompleted ? '✓' : step.icon}
//                       </div>
//                       <div>
//                         <div className="font-medium">{step.title}</div>
//                         <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
//                           Step {step.number}
//                         </div>
//                       </div>
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Progress Indicator */}
//             <div className="mt-8">
//               <div className="flex justify-between text-sm text-gray-400 mb-2">
//                 <span>Progress</span>
//                 <span>{Math.round((completedSteps.size / steps.length) * 100)}%</span>
//               </div>
//               <div className="w-full bg-gray-700/50 rounded-full h-2">
//                 <div 
//                   className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-500"
//                   style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="lg:col-span-3">
//           <div className="glass-effect rounded-2xl overflow-hidden">
//             <div 
//               ref={contentRef}
//               className="p-8 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
//             >
//               {renderStepContent()}
//             </div>

//             {/* Navigation Footer */}
//             <div className="bg-gray-800/50 border-t border-gray-700/50 p-6">
//               <div className="flex justify-between items-center">
//                 <button
//                   onClick={prevStep}
//                   disabled={currentStep === 1}
//                   className="px-6 py-3 bg-gray-700/80 hover:bg-gray-600/80 disabled:bg-gray-800/50 disabled:text-gray-500 text-white rounded-xl transition-all duration-200 flex items-center space-x-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                   <span>Previous</span>
//                 </button>

//                 <div className="flex items-center space-x-2 text-gray-400 text-sm">
//                   <span>Step {currentStep} of {steps.length}</span>
//                 </div>

//                 {currentStep === steps.length ? (
//                   <button
//                     onClick={handleSubmit}
//                     disabled={isSubmitting}
//                     className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:opacity-50 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         <span>Creating Agency...</span>
//                       </>
//                     ) : (
//                       <>
//                         <span>Complete Agency Profile</span>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </>
//                     )}
//                   </button>
//                 ) : (
//                   <button
//                     onClick={nextStep}
//                     className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
//                   >
//                     <span>Next</span>
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* Signature */}
//     <div className="fixed bottom-6 left-6 text-xs text-gray-500/30 font-light tracking-wider uppercase hidden lg:block">
//       ELITE · Premium Agency Experience
//     </div>
//   </div>
// );
// };

// export default AgencyProfileSetup;