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
 min,
 max
}) {
 return (
   <div className="group">
     <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-teal transition-colors duration-200">
       {label} {required && <span className="text-accent-teal">*</span>}
     </label>
     <div className="relative flex">
       <input
         type={type}
         value={value || ''}
         onChange={onChange}
         placeholder={placeholder}
         min={min}
         max={max}
         className={`${unitOptions.length ? 'rounded-l-xl rounded-r-none' : 'rounded-xl'} flex-1 px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 text-white placeholder-gray-400 
           focus:outline-none focus:border-accent-teal/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-teal/20
           transition-all duration-300 hover:border-gray-500/70 ${error ? 'border-rose-500 focus:border-rose-400' : ''} ${className}`}
       />
       {unitOptions.length > 0 && (
         <select
           value={unit}
           onChange={onUnitChange}
           className="px-3 py-3.5 bg-gray-700/50 border border-l-0 border-gray-600/30 rounded-r-xl text-white focus:outline-none focus:border-accent-teal/60 focus:bg-gray-800/50 transition-all duration-300"
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
     <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-teal transition-colors duration-200">
       {label} {required && <span className="text-accent-teal">*</span>}
     </label>
     <div className="relative">
       <select
         value={value || ''}
         onChange={onChange}
         className={`w-full px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 rounded-xl text-white 
           focus:outline-none focus:border-accent-teal/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-teal/20
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
     <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-accent-teal transition-colors duration-200">
       {label} {required && <span className="text-accent-teal">*</span>}
     </label>
     <textarea
       value={value || ''}
       onChange={onChange}
       placeholder={placeholder}
       rows={rows}
       className={`w-full px-4 py-3.5 bg-gray-800/30 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 
         focus:outline-none focus:border-accent-teal/60 focus:bg-gray-800/50 focus:ring-2 focus:ring-accent-teal/20
         transition-all duration-300 hover:border-gray-500/70 resize-none ${error ? 'border-rose-500' : ''}`}
     />
     {error && <p className="text-rose-400 text-sm mt-1 animate-pulse">{error}</p>}
   </div>
 );
});

const FormCheckboxGroup = React.memo(function FormCheckboxGroup({
 label,
 options,
 selectedValues = [],
 onChange,
 error,
 columns = 3,
}) {
 const handleToggle = (optionValue) => {
   const isSelected = selectedValues.includes(optionValue);
   let newValues;
   if (isSelected) {
     newValues = selectedValues.filter(v => v !== optionValue);
   } else {
     newValues = [...selectedValues, optionValue];
   }
   onChange(newValues);
 };

 return (
   <div className="space-y-4">
     <label className="block text-sm font-medium text-gray-300">{label}</label>
     <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-3`}>
       {options.map((option, index) => {
         const optionValue = typeof option === 'string' ? option : option.value;
         const optionLabel = typeof option === 'string' ? option : option.label;
         const isSelected = selectedValues.includes(optionValue);
         
         return (
           <div 
             key={`${optionValue}-${index}`} 
             className="flex items-center space-x-3 cursor-pointer group"
             onClick={() => handleToggle(optionValue)}
           >
             <div className="relative">
               <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                 isSelected 
                   ? 'bg-teal-400 border-teal-400' 
                   : 'border-gray-500 group-hover:border-gray-400'
               }`}>
                 {isSelected && (
                   <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                   </svg>
                 )}
               </div>
             </div>
             <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200 cursor-pointer select-none">
               {optionLabel}
             </span>
           </div>
         );
       })}
     </div>
     {error && <p className="text-rose-400 text-sm mt-2 animate-pulse">{error}</p>}
   </div>
 );
});

const BrandProfileSetup = ({
 user = { firstName: 'Fashion', lastName: 'Brand', email: 'contact@fashionbrand.com' },
 onLogout,
 onProfileComplete,
}) => {
 const [currentStep, setCurrentStep] = useState(1);
 const [isTransitioning, setIsTransitioning] = useState(false);
 const [profileData, setProfileData] = useState({
   // Basic Information
   companyName: '',
   legalName: '',
   industry: 'fashion',
   companyType: 'brand',
   description: '',
   tagline: '',
   brandStory: '',
   
   // Contact Information
   email: user.email,
   phone: '',
   website: '',
   customerService: '',
   
   // Address Information
   address: {
     street: '',
     city: '',
     state: '',
     country: '',
     zipCode: ''
   },
   
   // Company Details
   foundedYear: '',
   companySize: '',
   parentCompany: '',
   subsidiaryBrands: '',
   
   // Brand Identity & Values
   brandValues: [],
   targetAudience: [],
   priceRange: '',
   brandAesthetic: [],
   brandPersonality: [],
   sustainability: '',
   
   // Product & Services
   productCategories: [],
   services: [],
   clientTypes: [],
   seasonalCollections: '',
   customization: false,
   
   // Business Operations
   businessModel: [],
   distributionChannels: [],
   manufacturingLocations: '',
   qualityStandards: '',
   returnPolicy: '',
   
   // Marketing & Digital Presence
   socialMedia: {
     instagram: '',
     tiktok: '',
     facebook: '',
     twitter: '',
     youtube: '',
     pinterest: '',
     linkedin: '',
     website: ''
   },
   marketingStrategy: '',
   influencerPartnerships: '',
   
   // Collaborations & Partnerships
   collaborationTypes: [],
   partnershipHistory: '',
   brandAmbassadors: '',
   
   // Company Culture & Team
   values: [],
   culture: '',
   benefits: [],
   diversityStatement: '',
   teamSize: ''
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
       width: ${size}px; height: ${size}px; background: #14b8a6;
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
   { number: 1, title: 'Brand Basics', icon: '✦', color: 'from-teal-400 to-teal-600' },
   { number: 2, title: 'Contact & Location', icon: '◈', color: 'from-cyan-400 to-cyan-600' },
   { number: 3, title: 'Brand Identity', icon: '◊', color: 'from-emerald-400 to-emerald-600' },
   { number: 4, title: 'Products & Services', icon: '◯', color: 'from-green-400 to-green-600' },
   { number: 5, title: 'Business Operations', icon: '✧', color: 'from-blue-400 to-blue-600' },
   { number: 6, title: 'Digital Presence', icon: '⬡', color: 'from-indigo-400 to-indigo-600' },
   { number: 7, title: 'Partnerships', icon: '⬢', color: 'from-purple-400 to-purple-600' },
   { number: 8, title: 'Review & Submit', icon: '⬟', color: 'from-pink-400 to-pink-600' },
 ], []);

 const options = useMemo(() => ({
   brandAesthetics: [
     'Minimalist', 'Luxury', 'Streetwear', 'Bohemian', 'Classic',
     'Avant-Garde', 'Sustainable', 'Athletic', 'Romantic', 'Edgy',
     'Vintage', 'Modern', 'Artisanal', 'Tech-Inspired', 'Natural',
     'Bold & Colorful', 'Monochromatic', 'Feminine', 'Masculine', 'Unisex'
   ],
   targetAudiences: [
     'Gen Z (18-24)', 'Millennials (25-40)', 'Gen X (41-56)', 'Baby Boomers (57+)',
     'Fashion Enthusiasts', 'Luxury Consumers', 'Budget Conscious', 'Eco-Conscious',
     'Professional Women', 'Professional Men', 'Students', 'Athletes',
     'Urban Professionals', 'Creative Professionals', 'Entrepreneurs', 'Influencers',
     'Working Mothers', 'Young Parents', 'Fashion Forward', 'Classic Style Lovers'
   ],
   brandPersonality: [
     'Sophisticated', 'Playful', 'Innovative', 'Trustworthy', 'Rebellious',
     'Elegant', 'Approachable', 'Exclusive', 'Authentic', 'Dynamic',
     'Nurturing', 'Bold', 'Refined', 'Energetic', 'Calm', 'Inspiring'
   ],
   productCategories: [
     'Women\'s Clothing', 'Men\'s Clothing', 'Children\'s Clothing', 'Footwear',
     'Accessories', 'Jewelry', 'Handbags', 'Sunglasses', 'Watches', 'Belts',
     'Scarves', 'Hats', 'Swimwear', 'Activewear', 'Lingerie', 'Outerwear',
     'Formal Wear', 'Casual Wear', 'Denim', 'Knitwear', 'Leather Goods'
   ],
   services: [
     'Custom Design', 'Personal Styling', 'Alterations', 'Wardrobe Consultation',
     'Size Inclusive Options', 'Made-to-Measure', 'Subscription Service',
     'Virtual Styling', 'Brand Consulting', 'Wholesale', 'Private Label',
     'Pop-up Events', 'Fashion Shows', 'Lookbook Creation'
   ],
   businessModel: [
     'Direct-to-Consumer', 'Retail Partnership', 'Wholesale', 'E-commerce Only',
     'Brick & Mortar', 'Subscription Model', 'Marketplace Seller',
     'Dropshipping', 'Made-to-Order', 'Seasonal Collections', 'Fast Fashion',
     'Slow Fashion', 'Limited Editions', 'Franchise Model'
   ],
   distributionChannels: [
     'Online Store', 'Physical Retail Stores', 'Department Stores', 'Boutiques',
     'Pop-up Shops', 'Fashion Shows', 'Social Media', 'Influencer Partnerships',
     'Wholesale Partners', 'International Distributors', 'Third-party Marketplaces',
     'Subscription Boxes', 'Trade Shows', 'Direct Sales'
   ],
   collaborationTypes: [
     'Model Collaborations', 'Photographer Partnerships', 'Influencer Campaigns',
     'Designer Collaborations', 'Celebrity Endorsements', 'Brand Partnerships',
     'Charity Collaborations', 'Artist Collaborations', 'Tech Partnerships',
     'Sustainability Initiatives', 'Cultural Collaborations', 'Limited Edition Drops'
   ],
   clientTypes: [
     'Individual Consumers', 'Fashion Retailers', 'Department Stores', 'Boutiques',
     'Online Marketplaces', 'Subscription Services', 'Fashion Stylists',
     'Celebrity Stylists', 'Fashion Bloggers', 'Influencers', 'Fashion Magazines',
     'Photo Studios', 'Event Planners', 'Corporate Clients'
   ],
   priceRangeOptions: [
     { value: 'budget', label: 'Budget Friendly ($-$$)' },
     { value: 'mid-range', label: 'Mid-Range ($$-$$$)' },
     { value: 'premium', label: 'Premium ($$$-$$$$)' },
     { value: 'luxury', label: 'Luxury ($$$$+)' }
   ],
   companySizeOptions: [
     { value: '1-10', label: '1-10 employees (Startup)' },
     { value: '11-50', label: '11-50 employees (Small)' },
     { value: '51-200', label: '51-200 employees (Medium)' },
     { value: '201-1000', label: '201-1,000 employees (Large)' },
     { value: '1000+', label: '1,000+ employees (Enterprise)' }
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
       if (!profileData.companyName?.trim()) errs.companyName = 'Brand name is required';
       if (!profileData.description?.trim()) errs.description = 'Brand description is required';
       if (!profileData.foundedYear) errs.foundedYear = 'Founded year is required';
       break;
     case 2:
       if (!profileData.email || !/^\S+@\S+\.\S+$/.test(profileData.email)) errs.email = 'Valid email is required';
       if (!profileData.phone) errs.phone = 'Phone number is required';
       if (!profileData.address.street) errs['address.street'] = 'Street address is required';
       if (!profileData.address.city) errs['address.city'] = 'City is required';
       if (!profileData.address.country) errs['address.country'] = 'Country is required';
       break;
     case 3:
       if (profileData.brandAesthetic.length === 0) errs.brandAesthetic = 'Select at least one brand aesthetic';
       if (profileData.targetAudience.length === 0) errs.targetAudience = 'Select at least one target audience';
       if (!profileData.priceRange) errs.priceRange = 'Price range is required';
       break;
     case 4:
       if (profileData.productCategories.length === 0) errs.productCategories = 'Select at least one product category';
       if (profileData.services.length === 0) errs.services = 'Select at least one service';
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
             <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-teal">✦</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Brand <span className="text-gradient-teal">Basics</span></h2>
             <p className="text-gray-400 font-light">Establish your brand's core identity and foundation</p>
           </div>
           
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormInput
                 label="Brand/Company Name"
                 value={profileData.companyName}
                 onChange={(e) => handleInputChange('companyName', e.target.value)}
                 placeholder="Your Fashion Brand"
                 error={errors.companyName}
                 required
               />
               <FormInput
                 label="Legal Company Name"
                 value={profileData.legalName}
                 onChange={(e) => handleInputChange('legalName', e.target.value)}
                 placeholder="Legal business name"
               />
               <FormInput
                 label="Brand Tagline"
                 value={profileData.tagline}
                 onChange={(e) => handleInputChange('tagline', e.target.value)}
                 placeholder="Your brand's memorable tagline"
               />
               <FormInput
                 label="Founded Year"
                 type="number"
                 value={profileData.foundedYear}
                 onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                 placeholder="2020"
                 min="1800"
                 max={new Date().getFullYear()}
                 error={errors.foundedYear}
                 required
               />
             </div>

             <FormTextarea
               label="Brand Description"
               value={profileData.description}
               onChange={(e) => handleInputChange('description', e.target.value)}
               placeholder="Describe your brand, mission, and what makes you unique in the fashion industry..."
               error={errors.description}
               required
               rows={5}
             />

             <FormTextarea
               label="Brand Story"
               value={profileData.brandStory}
               onChange={(e) => handleInputChange('brandStory', e.target.value)}
               placeholder="Tell the story behind your brand - how it started, your inspiration, and journey..."
               rows={4}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormSelect
                 label="Company Size"
                 value={profileData.companySize}
                 onChange={(e) => handleInputChange('companySize', e.target.value)}
                 options={options.companySizeOptions}
                 placeholder="Select company size"
               />
               <FormInput
                 label="Parent Company (if applicable)"
                 value={profileData.parentCompany}
                 onChange={(e) => handleInputChange('parentCompany', e.target.value)}
                 placeholder="Parent company or holding group"
               />
             </div>

             <FormTextarea
               label="Subsidiary Brands (if any)"
               value={profileData.subsidiaryBrands}
               onChange={(e) => handleInputChange('subsidiaryBrands', e.target.value)}
               placeholder="List any subsidiary brands or sister companies..."
               rows={2}
             />
           </div>
         </div>
       );

     case 2:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-teal">◈</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Contact & <span className="text-gradient-teal">Location</span></h2>
             <p className="text-gray-400 font-light">Provide your contact information and business address</p>
           </div>
           
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormInput
                 label="Primary Email"
                 type="email"
                 value={profileData.email}
                 onChange={(e) => handleInputChange('email', e.target.value)}
                 placeholder="contact@yourbrand.com"
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
                 label="Website"
                 type="url"
                 value={profileData.website}
                 onChange={(e) => handleInputChange('website', e.target.value)}
                 placeholder="https://www.yourbrand.com"
               />
               <FormInput
                 label="Customer Service"
                 value={profileData.customerService}
                 onChange={(e) => handleInputChange('customerService', e.target.value)}
                 placeholder="Customer service contact"
               />
             </div>

             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                 <span className="text-accent-teal mr-2">🏢</span> Business Address
               </h3>
               
               <div className="space-y-4">
                 <FormInput
                   label="Street Address"
                   value={profileData.address.street}
                   onChange={(e) => handleInputChange('address.street', e.target.value)}
                   placeholder="123 Fashion Street, Suite 100"
                   error={errors['address.street']}
                   required
                 />
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormInput
                     label="City"
                     value={profileData.address.city}
                     onChange={(e) => handleInputChange('address.city', e.target.value)}
                     placeholder="New York"
                     error={errors['address.city']}
                     required
                   />
                   <FormInput
                     label="State/Province"
                     value={profileData.address.state}
                     onChange={(e) => handleInputChange('address.state', e.target.value)}
                     placeholder="NY"
                   />
                   <FormInput
                     label="ZIP/Postal Code"
                     value={profileData.address.zipCode}
                     onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                     placeholder="10001"
                   />
                   <FormInput
                     label="Country"
                     value={profileData.address.country}
                     onChange={(e) => handleInputChange('address.country', e.target.value)}
                     placeholder="United States"
                     error={errors['address.country']}
                     required
                   />
                 </div>
               </div>
             </div>
           </div>
         </div>
       );

     case 3:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-teal">◊</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Brand <span className="text-gradient-teal">Identity</span></h2>
             <p className="text-gray-400 font-light">Define your brand's personality and target market</p>
           </div>
           
           <div className="space-y-8">
             <FormCheckboxGroup
               label="Brand Aesthetic"
               options={options.brandAesthetics}
               selectedValues={profileData.brandAesthetic}
               onChange={(values) => handleInputChange('brandAesthetic', values)}
               error={errors.brandAesthetic}
               columns={4}
             />

             <FormCheckboxGroup
               label="Brand Personality"
               options={options.brandPersonality}
               selectedValues={profileData.brandPersonality}
               onChange={(values) => handleInputChange('brandPersonality', values)}
               columns={4}
             />

             <FormCheckboxGroup
               label="Target Audience"
               options={options.targetAudiences}
               selectedValues={profileData.targetAudience}
               onChange={(values) => handleInputChange('targetAudience', values)}
               error={errors.targetAudience}
               columns={3}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormSelect
                 label="Price Range"
                 value={profileData.priceRange}
                 onChange={(e) => handleInputChange('priceRange', e.target.value)}
                 options={options.priceRangeOptions}
                 placeholder="Select price range"
                 error={errors.priceRange}
                 required
               />
               <FormInput
                 label="Brand Values"
                 value={profileData.brandValues.join(', ')}
                 onChange={(e) => {
                   const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                   handleInputChange('brandValues', values);
                 }}
                 placeholder="Sustainability, Quality, Innovation, Inclusivity (comma separated)"
               />
             </div>

             <FormTextarea
               label="Sustainability Practices"
               value={profileData.sustainability}
               onChange={(e) => handleInputChange('sustainability', e.target.value)}
               placeholder="Describe your brand's commitment to sustainability, ethical practices, and environmental responsibility..."
               rows={4}
             />
           </div>
         </div>
       );

     case 4:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-teal">◯</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Products & <span className="text-gradient-teal">Services</span></h2>
             <p className="text-gray-400 font-light">Showcase your product offerings and services</p>
           </div>
           
           <div className="space-y-8">
             <FormCheckboxGroup
               label="Product Categories"
               options={options.productCategories}
               selectedValues={profileData.productCategories}
               onChange={(values) => handleInputChange('productCategories', values)}
               error={errors.productCategories}
               columns={3}
             />

             <FormCheckboxGroup
               label="Services Offered"
               options={options.services}
               selectedValues={profileData.services}
               onChange={(values) => handleInputChange('services', values)}
               error={errors.services}
               columns={3}
             />

             <FormCheckboxGroup
               label="Client Types"
               options={options.clientTypes}
               selectedValues={profileData.clientTypes}
               onChange={(values) => handleInputChange('clientTypes', values)}
               columns={3}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Seasonal Collections"
                 value={profileData.seasonalCollections}
                 onChange={(e) => handleInputChange('seasonalCollections', e.target.value)}
                 placeholder="Describe your seasonal collections, release schedule, and collection themes..."
                 rows={4}
               />
               <FormTextarea
                 label="Quality Standards"
                 value={profileData.qualityStandards}
                 onChange={(e) => handleInputChange('qualityStandards', e.target.value)}
                 placeholder="Describe your quality control processes, material standards, and manufacturing practices..."
                 rows={4}
               />
             </div>

             <div className="glass-effect rounded-xl p-6">
               <label className="flex items-center space-x-3 cursor-pointer group">
                 <div className="relative">
                   <input
                     type="checkbox"
                     checked={profileData.customization}
                     onChange={(e) => handleInputChange('customization', e.target.checked)}
                     className="sr-only"
                   />
                   <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                     profileData.customization ? 'bg-teal-400 border-teal-400' : 'border-gray-500 group-hover:border-gray-400'
                   }`}>
                     {profileData.customization && (
                       <svg className="w-3 h-3 text-black m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                     )}
                   </div>
                 </div>
                 <span className="text-white">We offer customization and made-to-order services</span>
               </label>
             </div>

             <FormTextarea
               label="Return Policy"
               value={profileData.returnPolicy}
               onChange={(e) => handleInputChange('returnPolicy', e.target.value)}
               placeholder="Describe your return and exchange policy..."
               rows={3}
             />
           </div>
         </div>
       );

     case 5:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-teal">✧</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Business <span className="text-gradient-teal">Operations</span></h2>
             <p className="text-gray-400 font-light">Define your business model and operational structure</p>
           </div>
           
           <div className="space-y-8">
             <FormCheckboxGroup
               label="Business Model"
               options={options.businessModel}
               selectedValues={profileData.businessModel}
               onChange={(values) => handleInputChange('businessModel', values)}
               columns={3}
             />

             <FormCheckboxGroup
               label="Distribution Channels"
               options={options.distributionChannels}
               selectedValues={profileData.distributionChannels}
               onChange={(values) => handleInputChange('distributionChannels', values)}
               columns={3}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Manufacturing Locations"
                 value={profileData.manufacturingLocations}
                 onChange={(e) => handleInputChange('manufacturingLocations', e.target.value)}
                 placeholder="List your manufacturing partners, locations, and production facilities..."
                 rows={4}
               />
               <FormInput
                 label="Team Size"
                 value={profileData.teamSize}
                 onChange={(e) => handleInputChange('teamSize', e.target.value)}
                 placeholder="Number of employees or team members"
               />
             </div>
           </div>
         </div>
       );

     case 6:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-teal">⬡</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Digital <span className="text-gradient-teal">Presence</span></h2>
             <p className="text-gray-400 font-light">Establish your brand's online presence and marketing strategy</p>
           </div>
           
           <div className="space-y-6">
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                 <span className="text-accent-teal mr-2">📱</span> Social Media Presence
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormInput
                   label="Instagram"
                   value={profileData.socialMedia.instagram}
                   onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                   placeholder="@yourbrand"
                 />
                 <FormInput
                   label="TikTok"
                   value={profileData.socialMedia.tiktok}
                   onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                   placeholder="@yourbrand"
                 />
                 <FormInput
                   label="Pinterest"
                   value={profileData.socialMedia.pinterest}
                   onChange={(e) => handleInputChange('socialMedia.pinterest', e.target.value)}
                   placeholder="Pinterest profile URL"
                 />
                 <FormInput
                   label="Facebook"
                   value={profileData.socialMedia.facebook}
                   onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                   placeholder="Facebook page URL"
                 />
                 <FormInput
                   label="YouTube"
                   type="url"
                   value={profileData.socialMedia.youtube}
                   onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                   placeholder="YouTube channel URL"
                 />
                 <FormInput
                   label="LinkedIn"
                   type="url"
                   value={profileData.socialMedia.linkedin}
                   onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                   placeholder="LinkedIn company page URL"
                 />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Marketing Strategy"
                 value={profileData.marketingStrategy}
                 onChange={(e) => handleInputChange('marketingStrategy', e.target.value)}
                 placeholder="Describe your marketing approach, brand positioning, and promotional strategies..."
                 rows={4}
               />
               <FormTextarea
                 label="Influencer Partnerships"
                 value={profileData.influencerPartnerships}
                 onChange={(e) => handleInputChange('influencerPartnerships', e.target.value)}
                 placeholder="Describe your influencer collaboration strategy and notable partnerships..."
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
             <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-teal">⬢</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Partnerships & <span className="text-gradient-teal">Collaborations</span></h2>
             <p className="text-gray-400 font-light">Define your collaboration interests and partnership history</p>
           </div>
           
           <div className="space-y-8">
             <FormCheckboxGroup
               label="Collaboration Types"
               options={options.collaborationTypes}
               selectedValues={profileData.collaborationTypes}
               onChange={(values) => handleInputChange('collaborationTypes', values)}
               columns={3}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormTextarea
                 label="Partnership History"
                 value={profileData.partnershipHistory}
                 onChange={(e) => handleInputChange('partnershipHistory', e.target.value)}
                 placeholder="Describe notable partnerships, collaborations, and brand alliances..."
                 rows={4}
               />
               <FormTextarea
                 label="Brand Ambassadors"
                 value={profileData.brandAmbassadors}
                 onChange={(e) => handleInputChange('brandAmbassadors', e.target.value)}
                 placeholder="List current brand ambassadors, spokespersons, or notable supporters..."
                 rows={4}
               />
             </div>

             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                 <span className="text-accent-teal mr-2">🎯</span> Company Culture & Values
               </h3>
               
               <div className="space-y-4">
                 <FormTextarea
                   label="Company Culture"
                   value={profileData.culture}
                   onChange={(e) => handleInputChange('culture', e.target.value)}
                   placeholder="Describe your company culture, work environment, and team values..."
                   rows={4}
                 />

                 <FormInput
                   label="Core Values"
                   value={profileData.values.join(', ')}
                   onChange={(e) => {
                     const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                     handleInputChange('values', values);
                   }}
                   placeholder="Creativity, Innovation, Sustainability, Integrity (comma separated)"
                 />

                 <FormInput
                   label="Employee Benefits"
                   value={profileData.benefits.join(', ')}
                   onChange={(e) => {
                     const benefits = e.target.value.split(',').map(b => b.trim()).filter(b => b);
                     handleInputChange('benefits', benefits);
                   }}
                   placeholder="Health Insurance, Creative Freedom, Flexible Schedule, Discounts (comma separated)"
                 />

                 <FormTextarea
                   label="Diversity & Inclusion Statement"
                   value={profileData.diversityStatement}
                   onChange={(e) => handleInputChange('diversityStatement', e.target.value)}
                   placeholder="Your commitment to diversity, equity, and inclusion in fashion..."
                   rows={3}
                 />
               </div>
             </div>
           </div>
         </div>
       );

     case 8:
       return (
         <div {...commonProps}>
           <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
               <span className="text-gradient-teal">⬟</span>
             </div>
             <h2 className="text-3xl font-display font-light text-white mb-3">Review & <span className="text-gradient-teal">Submit</span></h2>
             <p className="text-gray-400 font-light">Finalize your comprehensive brand profile</p>
           </div>
           
           <div className="space-y-8">
             {/* Brand Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-teal/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">✦</span>
                 Brand Information
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Brand Name:</span> <span className="text-white">{profileData.companyName}</span></div>
                 <div><span className="text-gray-400">Founded:</span> <span className="text-white">{profileData.foundedYear}</span></div>
                 <div><span className="text-gray-400">Location:</span> <span className="text-white">{profileData.address.city}, {profileData.address.country}</span></div>
                 <div><span className="text-gray-400">Price Range:</span> <span className="text-white">{
                   options.priceRangeOptions.find(option => option.value === profileData.priceRange)?.label || 
                   profileData.priceRange
                 }</span></div>
               </div>
               {profileData.tagline && (
                 <div className="mt-3"><span className="text-gray-400">Tagline:</span> <span className="text-white italic">"{profileData.tagline}"</span></div>
               )}
             </div>

             {/* Brand Identity Summary */}
             <div className="glass-effect rounded-xl p-6 transition-all duration-300 hover:border-accent-teal/30 group">
               <h3 className="text-xl font-display font-light text-white mb-4 flex items-center">
                 <span className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-sm mr-3 group-hover:scale-110 transition-transform duration-300">◊</span>
                 Brand Identity
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div><span className="text-gray-400">Aesthetic:</span> <span className="text-white">{profileData.brandAesthetic.slice(0, 3).join(', ')}{profileData.brandAesthetic.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Target Audience:</span> <span className="text-white">{profileData.targetAudience.slice(0, 3).join(', ')}{profileData.targetAudience.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Products:</span> <span className="text-white">{profileData.productCategories.slice(0, 3).join(', ')}{profileData.productCategories.length > 3 ? '...' : ''}</span></div>
                 <div><span className="text-gray-400">Collaborations:</span> <span className="text-white">{profileData.collaborationTypes.slice(0, 3).join(', ')}{profileData.collaborationTypes.length > 3 ? '...' : ''}</span></div>
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
                   <h4 className="text-accent-teal font-medium">Ready to Launch</h4>
                   <p className="text-gray-300 text-sm">Your comprehensive brand profile is complete. Click submit to launch your professional presence.</p>
                 </div>
               </div>
             </div>

             <div className="glass-effect rounded-xl p-6 border border-teal-500/30">
               <h4 className="text-teal-400 font-medium mb-3 flex items-center">
                 <span className="text-accent-teal mr-2">🏢</span> Next Steps
               </h4>
               <p className="text-gray-300 text-sm mb-3">
                 After creating your brand profile, you'll gain access to:
               </p>
               <ul className="text-gray-300 text-sm space-y-1">
                 <li className="flex items-center"><span className="text-accent-teal/70 mr-2">•</span> Showcase product collections and lookbooks</li>
                 <li className="flex items-center"><span className="text-accent-teal/70 mr-2">•</span> Connect with models, photographers, and influencers</li>
                 <li className="flex items-center"><span className="text-accent-teal/70 mr-2">•</span> Post collaboration opportunities and casting calls</li>
                 <li className="flex items-center"><span className="text-accent-teal/70 mr-2">•</span> Manage brand partnerships and campaigns</li>
                 <li className="flex items-center"><span className="text-accent-teal/70 mr-2">•</span> Access fashion industry network and insights</li>
                 <li className="flex items-center"><span className="text-accent-teal/70 mr-2">•</span> Track brand performance and engagement</li>
               </ul>
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
       
       .text-gradient-teal {
         background: linear-gradient(135deg, #fafafa 0%, #14b8a6 50%, #0d9488 100%);
         -webkit-background-clip: text;
         -webkit-text-fill-color: transparent;
         background-clip: text;
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

       .accent-teal {
         color: #14b8a6;
       }

       .primary-black {
         color: #000000;
       }
     `}</style>

     {/* Cursors */}
     <div 
       ref={cursorRef}
       className="fixed w-5 h-5 bg-teal-400 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block will-change-transform"
     />
     <div 
       ref={cursorFollowerRef}
       className="fixed w-8 h-8 border border-teal-400/30 rounded-full pointer-events-none z-40 hidden md:block will-change-transform"
     />

     {/* Particles Container */}
     <div 
       ref={bgAnimationRef}
       className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
     />

     {/* Background */}
     <div className="fixed inset-0 bg-gradient-to-br from-gray-900/10 via-black to-gray-900/5">
       <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-400/3 rounded-full blur-3xl" />
       <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-400/2 rounded-full blur-2xl" />
     </div>

     {/* Header */}
     <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700/30 sticky top-0 z-30">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex justify-between items-center py-4">
           <div className="flex items-center space-x-4">
             <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
               <span className="text-white font-bold text-lg">🏢</span>
             </div>
             <div>
               <h1 className="text-xl font-display font-light text-white">FASHION <span className="text-accent-teal">Brand Setup</span></h1>
               <p className="text-gray-400 text-sm">Create your comprehensive fashion brand profile</p>
             </div>
           </div>
           <button
             onClick={onLogout}
             className="px-4 py-2 text-gray-300 hover:text-teal-400 transition-colors duration-200"
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
             <h3 className="text-lg font-display font-light text-white mb-6">Setup <span className="text-accent-teal">Progress</span></h3>
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
                         ? 'glass-effect border border-teal-400/30 text-teal-400 hover:border-teal-400/50'
                         : isClickable
                         ? 'bg-gray-800/50 border border-gray-600/50 text-gray-300 hover:bg-gray-800/70 hover:border-gray-500/50'
                         : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
                     }`}
                   >
                     <div className="flex items-center space-x-3">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                         isActive ? 'bg-white/20' : isCompleted ? 'bg-teal-400/20' : 'bg-gray-600/50'
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
                   className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full transition-all duration-500"
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
                     className="px-8 py-3 bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
                   >
                     {isSubmitting ? (
                       <>
                         <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         <span>Creating Brand...</span>
                       </>
                     ) : (
                       <>
                         <span>Complete Brand Profile</span>
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                       </>
                     )}
                   </button>
                 ) : (
                   <button
                     onClick={nextStep}
                     className="px-6 py-3 bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
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
       FASHION · Premium Brand Experience
     </div>
   </div>
 );
};

export default BrandProfileSetup;