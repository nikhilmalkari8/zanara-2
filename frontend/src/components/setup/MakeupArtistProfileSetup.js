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
     <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-pink transition-colors duration-200">
       {label} {required && <span className="text-accent-pink">*</span>}
     </label>
     <div className="relative flex">
       <input
         type={type}
         value={value}
         onChange={onChange}
         placeholder={placeholder}
         className={`${unitOptions.length ? 'rounded-l-xl rounded-r-none' : 'rounded-xl'} flex-1 px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 text-white placeholder-gray-400 
           focus:outline-none focus:border-accent-pink/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-pink/20
           transition-all duration-300 hover:border-gray-500/70 ${error ? 'border-rose-500 focus:border-rose-400' : ''} ${className}`}
       />
       {unitOptions.length > 0 && (
         <select
           value={unit}
           onChange={onUnitChange}
           className="px-3 py-3.5 bg-gray-700/50 border border-l-0 border-gray-600/30 rounded-r-xl text-white focus:outline-none focus:border-accent-pink/60 focus:bg-gray-800/50 transition-all duration-300"
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
     <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-pink transition-colors duration-200">
       {label} {required && <span className="text-accent-pink">*</span>}
     </label>
     <div className="relative">
       <select
         value={value}
         onChange={onChange}
         className={`w-full px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 rounded-xl text-white 
           focus:outline-none focus:border-accent-pink/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-pink/20
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
     <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-pink transition-colors duration-200">
       {label} {required && <span className="text-accent-pink">*</span>}
     </label>
     <textarea
       value={value}
       onChange={onChange}
       placeholder={placeholder}
       rows={rows}
       className={`w-full px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 
         focus:outline-none focus:border-accent-pink/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-pink/20
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
                 isSelected ? 'bg-accent-pink border-accent-pink' : 'border-gray-500 group-hover:border-gray-400'
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

const MakeupArtistProfileSetup = ({
 user = { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com' },
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
   headline: 'Professional Makeup Artist',
   bio: '',
   yearsExperience: '',
   educationBackground: '',
   certifications: '',
   
   // Makeup Specializations
   makeupTypes: [],
   techniques: [],
   clientTypes: [],
   
   // Skills & Expertise
   specialSkills: [],
   skinTypeExpertise: [],
   ageGroupExpertise: [],
   colorTheoryExpert: false,
   
   // Products & Kit Information
   preferredBrands: [],
   productTypes: [],
   kitInformation: '',
   hygieneStandards: '',
   
   // Business Information
   studioAccess: '',
   studioLocation: '',
   mobileServices: false,
   travelRadius: '',
   
   // Pricing Structure
   rates: {
     bridal: '',
     photoshoot: '',
     specialEvent: '',
     lesson: '',
     consultation: '',
     currency: 'USD'
   },
   servicesOffered: '',
   
   // Portfolio & Social Media
   portfolioWebsite: '',
   instagramBusiness: '',
   youtubeChannel: '',
   tiktokProfile: '',
   socialMedia: {
     instagram: '',
     facebook: '',
     youtube: '',
     tiktok: ''
   },
   
   // Work Preferences
   availability: '',
   preferredProjectTypes: [],
   workingStyle: '',
   clientCommunication: '',
   
   // Experience & Recognition
   notableWork: '',
   awards: '',
   publications: '',
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
       width: ${size}px; height: ${size}px; background: #ff69b4;
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
   { number: 1, title: 'Personal', icon: '✦', color: 'from-pink-400 to-pink-600' },
   { number: 2, title: 'Professional', icon: '◈', color: 'from-purple-400 to-purple-600' },
   { number: 3, title: 'Specializations', icon: '◊', color: 'from-rose-400 to-rose-600' },
   { number: 4, title: 'Skills', icon: '◯', color: 'from-fuchsia-400 to-fuchsia-600' },
   { number: 5, title: 'Products', icon: '✧', color: 'from-violet-400 to-violet-600' },
   { number: 6, title: 'Business', icon: '⬡', color: 'from-indigo-400 to-indigo-600' },
   { number: 7, title: 'Portfolio', icon: '⬢', color: 'from-blue-400 to-blue-600' },
   { number: 8, title: 'Review', icon: '⬟', color: 'from-cyan-400 to-cyan-600' },
 ], []);

 const options = useMemo(() => ({
   makeupTypes: [
     'Bridal Makeup', 'Editorial Makeup', 'Fashion Makeup', 'Commercial Makeup',
     'Special Effects (SFX)', 'Theatrical Makeup', 'Film/TV Makeup', 'Beauty Makeup',
     'Avant-garde Makeup', 'Airbrushing', 'Body Painting', 'Prosthetics',
     'Fantasy Makeup', 'Character Makeup', 'Period Makeup', 'Runway Makeup'
   ],
   makeupTechniques: [
     'Contouring & Highlighting', 'Color Correction', 'Airbrushing', 'False Lashes',
     'Eyebrow Shaping', 'Lip Art', 'Cut Crease', 'Smokey Eyes', 'Natural/No-Makeup Look',
     'Glitter Application', 'Face Painting', 'HD Makeup', 'Waterproof Techniques',
     'Color Mixing', 'Gradient Blending', 'Precision Application'
   ],
   clientTypes: [
     'Brides & Wedding Parties', 'Models & Influencers', 'Actors & Performers', 'Musicians & Artists',
     'Corporate Executives', 'Private Individuals', 'Children & Teens', 'Mature Clients',
     'Special Events', 'Photo Shoots', 'Fashion Shows', 'Film Productions',
     'Theater Companies', 'Dance Companies', 'Beauty Brands', 'Editorial Publications'
   ],
   specialSkills: [
     'Sensitive Skin Expertise', 'Mature Skin Specialist', 'Men\'s Grooming',
     'Ethnic Skin Tones', 'Acne Coverage', 'Scar Coverage', 'Tattoo Coverage',
     'Waterproof Makeup', 'Long-lasting Techniques', 'Quick Touch-ups',
     'Corrective Makeup', 'Camera-Ready Makeup', 'Stage Makeup', 'Bridal Makeup Specialist'
   ],
   skinTypeExpertise: [
     'Oily Skin', 'Dry Skin', 'Combination Skin', 'Sensitive Skin', 'Mature Skin',
     'Acne-prone Skin', 'Rosacea', 'Dark Skin Tones', 'Light Skin Tones', 'Medium Skin Tones',
     'Olive Undertones', 'Cool Undertones', 'Warm Undertones', 'Neutral Undertones'
   ],
   ageGroupExpertise: [
     'Children (5-12)', 'Teens (13-19)', 'Young Adults (20-30)', 'Adults (31-50)',
     'Mature Adults (51-65)', 'Seniors (65+)'
   ],
   preferredBrands: [
     'MAC Cosmetics', 'NARS', 'Urban Decay', 'Too Faced', 'Charlotte Tilotte', 'Fenty Beauty',
     'Anastasia Beverly Hills', 'Tarte', 'Bobbi Brown', 'Laura Mercier', 'Make Up For Ever',
     'YSL', 'Dior', 'Chanel', 'Tom Ford', 'Pat McGrath Labs', 'Huda Beauty', 'Rare Beauty',
     'Glossier', 'Milk Makeup', 'Kryolan', 'Ben Nye', 'Mehron', 'Cinema Secrets'
   ],
   productTypes: [
     'Foundation', 'Concealer', 'Powder', 'Blush', 'Bronzer', 'Highlighter',
     'Eyeshadow', 'Eyeliner', 'Mascara', 'Lipstick', 'Lip Gloss', 'Brushes',
     'Sponges', 'Setting Spray', 'Primer', 'Contour Products', 'Color Correctors',
     'False Lashes', 'Eyebrow Products', 'Lip Liner', 'Glitter', 'Face Gems'
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
     { value: 'mobile-only', label: 'Mobile services only' },
     { value: 'client-location', label: 'I work at client locations' }
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
     'Bridal Makeup', 'Fashion Editorials', 'Commercial Campaigns', 'Beauty Shoots',
     'Special Events', 'Film/TV Projects', 'Theater Productions', 'Makeup Lessons',
     'Brand Collaborations', 'Editorial Work', 'Celebrity Makeup', 'Runway Shows'
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
       if (profileData.makeupTypes.length === 0) errs.makeupTypes = 'Select at least one makeup type';
       if (profileData.techniques.length === 0) errs.techniques = 'Select at least one technique';
       if (profileData.clientTypes.length === 0) errs.clientTypes = 'Select at least one client type';
       break;
     case 4:
       if (profileData.specialSkills.length === 0) errs.specialSkills = 'Select at least one special skill';
       if (profileData.skinTypeExpertise.length === 0) errs.skinTypeExpertise = 'Select at least one skin type expertise';
       break;
     case 5:
       if (profileData.preferredBrands.length === 0) errs.preferredBrands = 'Select at least one preferred brand';
       if (profileData.productTypes.length === 0) errs.productTypes = 'Select at least one product type';
       break;
     case 6:
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
             <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-pink">✦</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Personal <span className="text-gradient-pink">Information</span></h2>
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
               placeholder="https://yourmakeup.com"
             />
           </div>
         </div>
       );

     case 2:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-pink">◈</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Professional <span className="text-gradient-pink">Background</span></h2>
             <p className="text-gray-400 font-light">Tell us about your makeup artistry journey and expertise</p>
           </div>
           
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormInput
                 label="Professional Headline"
                 value={profileData.headline}
                 onChange={(e) => handleInputChange('headline', e.target.value)}
                 placeholder="e.g., Bridal & Beauty Makeup Artist"
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
               label="About You & Your Artistry"
               value={profileData.bio}
               onChange={(e) => handleInputChange('bio', e.target.value)}
               placeholder="Describe your makeup style, approach, and what sets you apart. Include your artistic vision and philosophy."
               error={errors.bio}
               required
               rows={5}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Education & Training"
                 value={profileData.educationBackground}
                 onChange={(e) => handleInputChange('educationBackground', e.target.value)}
                 placeholder="Makeup schools, beauty courses, workshops, masterclasses, etc."
                 rows={3}
               />
               <FormTextarea
                 label="Certifications & Awards"
                 value={profileData.certifications}
                 onChange={(e) => handleInputChange('certifications', e.target.value)}
                 placeholder="Professional certifications, beauty associations, competition wins, etc."
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
             <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-pink">◊</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Makeup <span className="text-gradient-pink">Specializations</span></h2>
             <p className="text-gray-400 font-light">Define your makeup focus and expertise areas</p>
           </div>
           
           <div className="space-y-8">
             <FormCheckboxGroup
               label="Makeup Types"
               options={options.makeupTypes}
               selectedValues={profileData.makeupTypes}
               onChange={(values) => handleInputChange('makeupTypes', values)}
               error={errors.makeupTypes}
               columns={3}
             />

             <FormCheckboxGroup
               label="Makeup Techniques"
               options={options.makeupTechniques}
               selectedValues={profileData.techniques}
               onChange={(values) => handleInputChange('techniques', values)}
               error={errors.techniques}
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
             <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-pink">◯</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Skills & <span className="text-gradient-pink">Expertise</span></h2>
             <p className="text-gray-400 font-light">Showcase your specialized skills and client expertise</p>
           </div>
           
           <div className="space-y-8">
             <FormCheckboxGroup
               label="Special Skills"
               options={options.specialSkills}
               selectedValues={profileData.specialSkills}
               onChange={(values) => handleInputChange('specialSkills', values)}
               error={errors.specialSkills}
               columns={3}
             />

             <FormCheckboxGroup
               label="Skin Type Expertise"
               options={options.skinTypeExpertise}
               selectedValues={profileData.skinTypeExpertise}
               onChange={(values) => handleInputChange('skinTypeExpertise', values)}
               error={errors.skinTypeExpertise}
               columns={3}
             />

             <FormCheckboxGroup
               label="Age Group Expertise"
               options={options.ageGroupExpertise}
               selectedValues={profileData.ageGroupExpertise}
               onChange={(values) => handleInputChange('ageGroupExpertise', values)}
               columns={3}
             />

             <div className="glass-effect rounded-xl p-6">
               <label className="flex items-center space-x-3 cursor-pointer group">
                 <div className="relative">
                   <input
                     type="checkbox"
                     checked={profileData.colorTheoryExpert}
                     onChange={(e) => handleInputChange('colorTheoryExpert', e.target.checked)}
                     className="sr-only"
                   />
                   <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                     profileData.colorTheoryExpert ? 'bg-accent-pink border-accent-pink' : 'border-gray-500 group-hover:border-gray-400'
                   }`}>
                     {profileData.colorTheoryExpert && (
                       <svg className="w-3 h-3 text-primary-black m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                     )}
                   </div>
                 </div>
                 <span className="text-white">I am a Color Theory Expert</span>
               </label>
             </div>
           </div>
         </div>
       );

     case 5:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-pink">✧</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Products & <span className="text-gradient-pink">Kit Information</span></h2>
             <p className="text-gray-400 font-light">Showcase your product knowledge and professional kit</p>
           </div>
           
           <div className="space-y-8">
             <FormCheckboxGroup
               label="Preferred Brands"
               options={options.preferredBrands}
               selectedValues={profileData.preferredBrands}
               onChange={(values) => handleInputChange('preferredBrands', values)}
               error={errors.preferredBrands}
               columns={4}
             />

             <FormCheckboxGroup
               label="Product Types in Your Kit"
               options={options.productTypes}
               selectedValues={profileData.productTypes}
               onChange={(values) => handleInputChange('productTypes', values)}
               error={errors.productTypes}
               columns={3}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Kit Information"
                 value={profileData.kitInformation}
                 onChange={(e) => handleInputChange('kitInformation', e.target.value)}
                 placeholder="Describe your professional makeup kit, special tools, and equipment..."
                 rows={4}
               />
               <FormTextarea
                 label="Hygiene Standards"
                 value={profileData.hygieneStandards}
                 onChange={(e) => handleInputChange('hygieneStandards', e.target.value)}
                 placeholder="Describe your sanitation practices, safety protocols, and hygiene standards..."
                 rows={4}
               />
             </div>

             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                 <span className="text-accent-pink mr-2">💄</span> Professional Kit Tips
               </h3>
               <ul className="text-gray-300 text-sm space-y-2">
                 <li className="flex items-center"><span className="text-accent-pink/70 mr-2">•</span> Include high-quality brushes and tools</li>
                 <li className="flex items-center"><span className="text-accent-pink/70 mr-2">•</span> Maintain a diverse color palette for all skin tones</li>
                 <li className="flex items-center"><span className="text-accent-pink/70 mr-2">•</span> Keep hygiene and sanitation as top priority</li>
                 <li className="flex items-center"><span className="text-accent-pink/70 mr-2">•</span> Stay updated with latest products and trends</li>
               </ul>
             </div>
           </div>
         </div>
       );

     case 6:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-pink">⬡</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Business <span className="text-gradient-pink">Setup</span></h2>
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
                     profileData.mobileServices ? 'bg-accent-pink border-accent-pink' : 'border-gray-500 group-hover:border-gray-400'
                   }`}>
                     {profileData.mobileServices && (
                       <svg className="w-3 h-3 text-primary-black m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                     )}
                   </div>
                 </div>
                 <span className="text-white">I offer mobile makeup services (travel to clients)</span>
               </label>
             </div>

             <FormCheckboxGroup
               label="Preferred Project Types"
               options={options.preferredProjects}
               selectedValues={profileData.preferredProjectTypes}
               onChange={(values) => handleInputChange('preferredProjectTypes', values)}
               columns={3}
             />

             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                 <span className="text-accent-pink mr-2">💰</span> Starting Rates
               </h3>
               <p className="text-gray-400 text-sm mb-4">
                 Set your starting rates. You can always adjust these later and create custom packages.
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <FormInput
                   label="Bridal Makeup"
                   type="number"
                   value={profileData.rates.bridal}
                   onChange={(e) => handleInputChange('rates.bridal', e.target.value)}
                   placeholder="150"
                 />
                 <FormInput
                   label="Photoshoot Makeup"
                   type="number"
                   value={profileData.rates.photoshoot}
                   onChange={(e) => handleInputChange('rates.photoshoot', e.target.value)}
                   placeholder="100"
                 />
                 <FormInput
                   label="Special Event"
                   type="number"
                   value={profileData.rates.specialEvent}
                   onChange={(e) => handleInputChange('rates.specialEvent', e.target.value)}
                   placeholder="75"
                 />
                 <FormInput
                   label="Makeup Lesson"
                   type="number"
                   value={profileData.rates.lesson}
                   onChange={(e) => handleInputChange('rates.lesson', e.target.value)}
                   placeholder="60"
                 />
                 <FormInput
                   label="Consultation"
                   type="number"
                   value={profileData.rates.consultation}
                   onChange={(e) => handleInputChange('rates.consultation', e.target.value)}
                   placeholder="40"
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
               label="Services Offered"
               value={profileData.servicesOffered}
               onChange={(e) => handleInputChange('servicesOffered', e.target.value)}
               placeholder="Describe your makeup services and packages:

Bridal Makeup Package - $150
- Trial session included
- Wedding day makeup
- Touch-up kit
- False lashes included

Beauty Photoshoot - $100
- Full makeup application
- On-set touch-ups
- Consultation included

Makeup Lessons - $60/hour
- Personalized instruction
- Product recommendations
- Take-home notes"
               rows={8}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Working Style"
                 value={profileData.workingStyle}
                 onChange={(e) => handleInputChange('workingStyle', e.target.value)}
                 placeholder="Describe your working style and approach to makeup artistry..."
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

     case 7:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-pink">⬢</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Portfolio & <span className="text-gradient-pink">Social Media</span></h2>
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
                 placeholder="@yourmakeup"
               />
               <FormInput
                 label="YouTube Channel"
                 type="url"
                 value={profileData.youtubeChannel}
                 onChange={(e) => handleInputChange('youtubeChannel', e.target.value)}
                 placeholder="https://youtube.com/@yourchannel"
               />
               <FormInput
                 label="TikTok Profile"
                 value={profileData.tiktokProfile}
                 onChange={(e) => handleInputChange('tiktokProfile', e.target.value)}
                 placeholder="@yourtiktok"
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
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Notable Work & Collaborations"
                 value={profileData.notableWork}
                 onChange={(e) => handleInputChange('notableWork', e.target.value)}
                 placeholder="Describe your most notable projects, collaborations, or achievements..."
                 rows={4}
               />
               <FormTextarea
                 label="Notable Clients"
                 value={profileData.notableClients}
                 onChange={(e) => handleInputChange('notableClients', e.target.value)}
                 placeholder="Well-known clients, celebrities, brands you've worked with..."
                 rows={4}
               />
               <FormTextarea
                 label="Awards & Recognition"
                 value={profileData.awards}
                 onChange={(e) => handleInputChange('awards', e.target.value)}
                 placeholder="Makeup competitions, awards, industry recognition..."
                 rows={4}
               />
               <FormTextarea
                 label="Publication Features"
                 value={profileData.publications}
                 onChange={(e) => handleInputChange('publications', e.target.value)}
                 placeholder="Magazines, blogs, websites where your work has been featured..."
                 rows={4}
               />
             </div>

             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                 <span className="text-accent-pink mr-2">✧</span> Portfolio Tips
               </h3>
               <ul className="text-gray-300 text-sm space-y-2">
                 <li className="flex items-center"><span className="text-accent-pink/70 mr-2">•</span> Include before and after shots to showcase transformation</li>
                 <li className="flex items-center"><span className="text-accent-pink/70 mr-2">•</span> Show variety in styles, skin tones, and occasions</li>
                 <li className="flex items-center"><span className="text-accent-pink/70 mr-2">•</span> Keep your portfolio updated with recent work</li>
                 <li className="flex items-center"><span className="text-accent-pink/70 mr-2">•</span> Organize by categories (Bridal, Editorial, Beauty, etc.)</li>
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
               <span className="text-gradient-pink">⬟</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Review & <span className="text-gradient-pink">Submit</span></h2>
             <p className="text-gray-400 font-light">Finalize your professional makeup artist profile</p>
           </div>
           
           <div className="space-y-8">
             {/* Personal Information Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-pink/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">✦</span>
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
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-pink/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◈</span>
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
                 <div><span className="text-gray-400">Color Theory Expert:</span> <span className="text-white">{profileData.colorTheoryExpert ? 'Yes' : 'No'}</span></div>
                 {profileData.bio && (
                   <div><span className="text-gray-400">Bio:</span> <span className="text-white">{profileData.bio.substring(0, 200)}...</span></div>
                 )}
               </div>
             </div>

             {/* Specializations Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-pink/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◊</span>
                 Makeup Specializations
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Makeup Types:</span> <span className="text-white">{profileData.makeupTypes.slice(0, 3).join(', ')}{profileData.makeupTypes.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Techniques:</span> <span className="text-white">{profileData.techniques.length} techniques</span></div>
                 <div><span className="text-gray-400">Client Types:</span> <span className="text-white">{profileData.clientTypes.slice(0, 3).join(', ')}{profileData.clientTypes.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Travel:</span> <span className="text-white">{
                   options.travelRadius.find(option => option.value === profileData.travelRadius)?.label || 
                   profileData.travelRadius
                 }</span></div>
               </div>
             </div>

             {/* Skills & Products Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-pink/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◯</span>
                 Skills & Products
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Special Skills:</span> <span className="text-white">{profileData.specialSkills.length} skills</span></div>
                 <div><span className="text-gray-400">Skin Expertise:</span> <span className="text-white">{profileData.skinTypeExpertise.length} skin types</span></div>
                 <div><span className="text-gray-400">Preferred Brands:</span> <span className="text-white">{profileData.preferredBrands.length} brands</span></div>
                 <div><span className="text-gray-400">Product Types:</span> <span className="text-white">{profileData.productTypes.length} products</span></div>
               </div>
             </div>

             {/* Portfolio & Rates Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-pink/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">⬢</span>
                 Portfolio & Rates
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Portfolio:</span> <span className="text-white">{profileData.portfolioWebsite || 'Not provided'}</span></div>
                 <div><span className="text-gray-400">Business Instagram:</span> <span className="text-white">{profileData.instagramBusiness || 'Not provided'}</span></div>
                 {profileData.rates.bridal && (
                   <div><span className="text-gray-400">Bridal Rate:</span> <span className="text-white">{profileData.rates.currency} {profileData.rates.bridal}</span></div>
                 )}
                 {profileData.rates.photoshoot && (
                   <div><span className="text-gray-400">Photoshoot Rate:</span> <span className="text-white">{profileData.rates.currency} {profileData.rates.photoshoot}</span></div>
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
                   <h4 className="text-accent-pink font-medium">Ready to Launch</h4>
                   <p className="text-gray-300 text-sm">Your makeup artist profile is complete. Click submit to launch your professional profile.</p>
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
       
       @keyframes pulse-pink {
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
       
       .text-gradient-pink {
         background: linear-gradient(135deg, #fafafa 0%, #ff69b4 50%, #ff1493 100%);
         -webkit-background-clip: text;
         -webkit-text-fill-color: transparent;
         background-clip: text;
       }
       
       .animate-shimmer-simple {
         background: linear-gradient(90deg, transparent, rgba(255, 105, 180, 0.1), transparent);
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

       .accent-pink {
         color: #ff69b4;
       }

       .primary-black {
         color: #000000;
       }
     `}</style>

     {/* Simplified Cursors */}
     <div 
       ref={cursorRef}
       className="fixed w-5 h-5 bg-pink-400 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block will-change-transform"
     />
     <div 
       ref={cursorFollowerRef}
       className="fixed w-8 h-8 border border-pink-400/30 rounded-full pointer-events-none z-40 hidden md:block will-change-transform"
     />

     {/* Particles Container */}
     <div 
       ref={bgAnimationRef}
       className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
     />

     {/* Gradient Background */}
     <div className="fixed inset-0 bg-gradient-to-br from-gray-900/10 via-black to-gray-900/5">
       <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-400/3 rounded-full blur-3xl" />
       <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-400/2 rounded-full blur-2xl" />
     </div>

     {/* Header */}
     <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700/30 sticky top-0 z-30">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex justify-between items-center py-4">
           <div className="flex items-center space-x-4">
             <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
               <span className="text-white font-bold text-lg">💄</span>
             </div>
             <div>
               <h1 className="text-xl font-display font-light text-white">BEAUTY <span className="text-accent-pink">Makeup Artist Setup</span></h1>
               <p className="text-gray-400 text-sm">Complete your professional makeup artist profile</p>
             </div>
           </div>
           <button
             onClick={onLogout}
             className="px-4 py-2 text-gray-300 hover:text-pink-400 transition-colors duration-200"
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
             <h3 className="text-lg font-display font-light text-white mb-6">Setup <span className="text-accent-pink">Progress</span></h3>
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
                         ? 'glass-effect border border-pink-400/30 text-pink-400 hover:border-pink-400/50'
                         : isClickable
                         ? 'bg-gray-800/50 border border-gray-600/50 text-gray-300 hover:bg-gray-800/70 hover:border-gray-500/50'
                         : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
                     }`}
                   >
                     <div className="flex items-center space-x-3">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                         isActive ? 'bg-white/20' : isCompleted ? 'bg-pink-400/20' : 'bg-gray-600/50'
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
                   className="bg-gradient-to-r from-pink-400 to-pink-600 h-2 rounded-full transition-all duration-500"
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
                     className="px-8 py-3 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 disabled:opacity-50 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
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
                     className="px-6 py-3 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
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
       BEAUTY · Premium Makeup Artist Experience
     </div>
   </div>
 );
};

export default MakeupArtistProfileSetup;