// src/components/setup/FashionDesignerProfileSetup.js
import React, { useState } from 'react';
import { 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckboxGroup,
  Button,
  Card,
  LoadingSpinner,
  Notification
} from '../shared';
import { profileService } from '../../services/api';

const FashionDesignerProfileSetup = ({ user, onLogout, onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: '',
    location: '',
    
    // Professional Information
    headline: 'Fashion Designer',
    bio: '',
    yearsExperience: '',
    education: '',
    designPhilosophy: '',
    
    // Design Specializations
    designCategories: [], // Womenswear, Menswear, etc.
    productTypes: [], // Dresses, Suits, Accessories, etc.
    designStyles: [], // Minimalist, Avant-garde, etc.
    targetMarket: [], // Luxury, Contemporary, etc.
    
    // Technical Skills
    technicalSkills: [], // Pattern making, Draping, etc.
    softwareSkills: [], // Adobe Creative Suite, CLO 3D, etc.
    constructionSkills: [], // Sewing, Fitting, etc.
    materialKnowledge: [], // Fabrics, Trims, etc.
    
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

  // Form validation
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Professional Background', icon: '🎓' },
    { number: 3, title: 'Design Specializations', icon: '✂️' },
    { number: 4, title: 'Technical Skills', icon: '🛠️' },
    { number: 5, title: 'Business & Production', icon: '🏭' },
    { number: 6, title: 'Portfolio & Collections', icon: '📚' },
    { number: 7, title: 'Services & Rates', icon: '💰' },
    { number: 8, title: 'Review & Submit', icon: '✅' }
  ];

  const designCategories = [
    'Womenswear', 'Menswear', 'Childrenswear', 'Plus-Size Fashion',
    'Petite Fashion', 'Maternity Fashion', 'Unisex Fashion', 'Accessories',
    'Footwear', 'Bags & Handbags', 'Jewelry', 'Lingerie & Intimates',
    'Swimwear', 'Activewear & Sportswear', 'Outerwear', 'Formal/Evening Wear'
  ];

  const productTypes = [
    'Dresses', 'Tops & Blouses', 'Pants & Trousers', 'Skirts', 'Suits',
    'Jackets & Blazers', 'Coats', 'Knitwear', 'T-Shirts & Casual Tops',
    'Jeans & Denim', 'Shorts', 'Jumpsuits & Rompers', 'Sleepwear',
    'Undergarments', 'Scarves & Wraps', 'Hats & Headwear'
  ];

  const designStyles = [
    'Minimalist', 'Avant-Garde', 'Classic/Timeless', 'Bohemian',
    'Urban/Street Style', 'Vintage-Inspired', 'Romantic/Feminine',
    'Edgy/Alternative', 'Preppy', 'Glamorous', 'Casual/Relaxed',
    'Formal/Professional', 'Sustainable/Eco-Friendly', 'High Fashion',
    'Contemporary', 'Retro/Nostalgic'
  ];

  const targetMarket = [
    'Luxury ($500+)', 'Contemporary ($100-500)', 'Bridge ($50-150)',
    'Fast Fashion ($10-50)', 'Budget-Friendly (<$25)', 'Custom/Couture',
    'Sustainable Fashion', 'Slow Fashion', 'Made-to-Order',
    'Limited Edition', 'Mass Market', 'Niche Market'
  ];

  const technicalSkills = [
    'Pattern Making', 'Pattern Grading', 'Draping', 'Flat Pattern Design',
    'Garment Construction', 'Fitting & Alterations', 'Technical Drawing',
    'Specification Writing', 'Size Chart Development', 'Cost Analysis',
    'Fabric Sourcing', 'Trim Selection', 'Color Theory', 'Print Design',
    'Embellishment Techniques', 'Quality Control'
  ];

  const softwareSkills = [
    'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign',
    'CLO 3D', 'Browzwear VStitcher', 'Optitex', 'Gerber AccuMark',
    'Lectra Modaris', 'TUKAcad', 'Marvelous Designer', 'Sketch',
    'Figma', 'AutoCAD', 'Rhino 3D', 'Blender', 'Procreate'
  ];

  const constructionSkills = [
    'Machine Sewing', 'Hand Sewing', 'Serging/Overlocking', 'Blind Hemming',
    'Buttonhole Making', 'Zipper Installation', 'Seam Finishing',
    'Pressing & Steaming', 'Tailoring Techniques', 'Couture Techniques',
    'Embroidery', 'Beading', 'Appliqué', 'Quilting', 'Leather Working'
  ];

  const materialKnowledge = [
    'Natural Fibers (Cotton, Wool, Silk, Linen)', 'Synthetic Fibers',
    'Blended Fabrics', 'Knit Fabrics', 'Woven Fabrics', 'Denim',
    'Leather & Suede', 'Fur & Faux Fur', 'Technical Fabrics',
    'Sustainable Materials', 'Organic Materials', 'Recycled Materials',
    'Trims & Notions', 'Hardware', 'Interfacing', 'Linings'
  ];

  const servicesOffered = [
    'Custom Design', 'Pattern Making', 'Technical Drawings',
    'Garment Construction', 'Fitting Services', 'Design Consultation',
    'Trend Forecasting', 'Collection Development', 'Brand Development',
    'Fashion Illustration', 'CAD Services', 'Production Planning',
    'Quality Control', 'Sourcing Assistance', 'Design Education'
  ];

  const projectTypes = [
    'Custom Garments', 'Collection Development', 'Pattern Creation',
    'Technical Consultation', 'Design Collaboration', 'Brand Projects',
    'Fashion Week Preparation', 'Startup Assistance', 'Redesign Projects',
    'Sustainable Design', 'Costume Design', 'Uniform Design'
  ];

  const clientTypes = [
    'Fashion Brands', 'Individual Clients', 'Celebrities', 'Influencers',
    'Retail Companies', 'Startups', 'Costume Departments', 'Theater Companies',
    'Dance Companies', 'Wedding Clients', 'Corporate Clients', 'Non-Profits'
  ];

  const businessModelOptions = [
    { value: 'independent-designer', label: 'Independent Designer' },
    { value: 'fashion-brand-owner', label: 'Fashion Brand Owner' },
    { value: 'freelance-designer', label: 'Freelance Designer' },
    { value: 'design-consultant', label: 'Design Consultant' },
    { value: 'custom-couture', label: 'Custom/Couture Designer' },
    { value: 'pattern-maker', label: 'Pattern Making Service' },
    { value: 'design-studio', label: 'Design Studio' }
  ];

  const productionCapacityOptions = [
    { value: 'single-pieces', label: 'Single Pieces/Prototypes' },
    { value: 'small-batch', label: 'Small Batch (1-50 pieces)' },
    { value: 'medium-batch', label: 'Medium Batch (51-500 pieces)' },
    { value: 'large-scale', label: 'Large Scale (500+ pieces)' },
    { value: 'no-production', label: 'Design Only (No Production)' }
  ];

  const availabilityOptions = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'project-based', label: 'Project Based' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'freelance', label: 'Freelance' }
  ];

  const experienceLevelOptions = [
    { value: '0-2', label: '0-2 years (Emerging Designer)' },
    { value: '3-5', label: '3-5 years (Developing Designer)' },
    { value: '6-10', label: '6-10 years (Experienced Designer)' },
    { value: '11-15', label: '11-15 years (Senior Designer)' },
    { value: '15+', label: '15+ years (Master Designer)' }
  ];

  // Form handling functions
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
      
      // Clear errors when field is edited
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: null
        }));
      }
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Clear errors when field is edited
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: null
        }));
      }
    }
  };

  const handleArrayToggle = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Navigation functions
  const nextStep = () => {
    // Validate current step
    const currentStepErrors = validateStep(currentStep);
    
    if (Object.keys(currentStepErrors).length > 0) {
      setErrors(currentStepErrors);
      setMessage('Please fix the errors before proceeding.');
      setMessageType('error');
      return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Validation function for each step
  const validateStep = (step) => {
    const stepErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        if (!profileData.fullName || profileData.fullName.trim() === '') {
          stepErrors.fullName = 'Full name is required';
        }
        if (!profileData.email || !/^\S+@\S+\.\S+$/.test(profileData.email)) {
          stepErrors.email = 'Valid email is required';
        }
        if (!profileData.phone) {
          stepErrors.phone = 'Phone number is required';
        }
        if (!profileData.location) {
          stepErrors.location = 'Location is required';
        }
        break;
      
      case 2: // Professional Background
        if (!profileData.headline) {
          stepErrors.headline = 'Professional headline is required';
        }
        if (!profileData.bio) {
          stepErrors.bio = 'Bio is required';
        }
        if (!profileData.yearsExperience) {
          stepErrors.yearsExperience = 'Experience level is required';
        }
        break;
      
      case 3: // Design Specializations
        if (profileData.designCategories.length === 0) {
          stepErrors.designCategories = 'Select at least one design category';
        }
        break;
      
      case 4: // Technical Skills
        if (profileData.technicalSkills.length === 0) {
          stepErrors.technicalSkills = 'Select at least one technical skill';
        }
        break;
      
      case 5: // Business & Production
        if (!profileData.businessModel) {
          stepErrors.businessModel = 'Business model is required';
        }
        break;
      
      case 7: // Services & Rates
        if (!profileData.availability) {
          stepErrors.availability = 'Availability is required';
        }
        break;
      
      default:
        // No validation for other steps
        break;
    }
    
    return stepErrors;
  };

  // Submit profile
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage('');
    setMessageType('');
    
    // Validate final step
    const finalErrors = validateStep(currentStep);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setMessage('Please fix the errors before submitting.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Use the profileService to submit the data
      const response = await profileService.completeProfile(profileData);

      if (response) {
        setMessage('Designer profile created successfully! Redirecting to dashboard...');
        setMessageType('success');
        setTimeout(() => {
          onProfileComplete();
        }, 2000);
      }
    } catch (error) {
      setMessage(error.message || 'Failed to create profile. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      padding: '20px'
    },
    setupCard: {
      maxWidth: '900px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      overflow: 'hidden'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '30px',
      textAlign: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      margin: '20px 0',
      flexWrap: 'wrap'
    },
    step: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      borderRadius: '10px',
      minWidth: '70px',
      transition: 'all 0.3s ease'
    },
    stepActive: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.5)'
    },
    stepCompleted: {
      background: 'rgba(76, 175, 80, 0.3)',
      border: '2px solid #4CAF50'
    },
    stepUpcoming: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    content: {
      padding: '40px',
      color: 'white'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    navigation: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '30px 40px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Personal Information
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>👤 Personal Information</h2>
            <div style={styles.formGrid}>
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

      case 2: // Professional Background
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🎓 Professional Background</h2>
            <div style={styles.formGrid}>
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
                options={experienceLevelOptions}
                placeholder="Select experience level"
                error={errors.yearsExperience}
                required
              />
            </div>
            
            <FormTextarea
              label="Design Philosophy & Approach"
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Describe your design philosophy, creative process, and what drives your work. What makes your design approach unique?"
              error={errors.bio}
              required
            />

            <FormTextarea
              label="Design Philosophy Statement"
              value={profileData.designPhilosophy}
              onChange={(e) => handleInputChange('designPhilosophy', e.target.value)}
              placeholder="Your core design beliefs and values that guide your creative decisions"
              minHeight="80px"
            />

            <div style={styles.formGrid}>
              <FormTextarea
                label="Education & Training"
                value={profileData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="Fashion design school, degrees, workshops, apprenticeships"
                minHeight="80px"
              />
            </div>
          </div>
        );

      case 3: // Design Specializations
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✂️ Design Specializations</h2>
            
            <FormCheckboxGroup
              label="Design Categories (Select all that apply)"
              options={designCategories}
              selectedValues={profileData.designCategories}
              onChange={(values) => handleInputChange('designCategories', values)}
              error={errors.designCategories}
              columns={3}
            />

            <FormCheckboxGroup
              label="Product Types"
              options={productTypes}
              selectedValues={profileData.productTypes}
              onChange={(values) => handleInputChange('productTypes', values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Design Styles"
              options={designStyles}
              selectedValues={profileData.designStyles}
              onChange={(values) => handleInputChange('designStyles', values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Target Market"
              options={targetMarket}
              selectedValues={profileData.targetMarket}
              onChange={(values) => handleInputChange('targetMarket', values)}
              columns={3}
            />
          </div>
        );

      case 4: // Technical Skills
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🛠️ Technical Skills</h2>
            
            <FormCheckboxGroup
              label="Technical Design Skills"
              options={technicalSkills}
              selectedValues={profileData.technicalSkills}
              onChange={(values) => handleInputChange('technicalSkills', values)}
              error={errors.technicalSkills}
              columns={3}
            />

            <FormCheckboxGroup
              label="Software & Technology Skills"
              options={softwareSkills}
              selectedValues={profileData.softwareSkills}
              onChange={(values) => handleInputChange('softwareSkills', values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Construction & Sewing Skills"
              options={constructionSkills}
              selectedValues={profileData.constructionSkills}
              onChange={(values) => handleInputChange('constructionSkills', values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Material & Fabric Knowledge"
              options={materialKnowledge}
              selectedValues={profileData.materialKnowledge}
              onChange={(values) => handleInputChange('materialKnowledge', values)}
              columns={3}
            />
          </div>
        );

      case 5: // Business & Production
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>🏭 Business & Production</h2>
            
            <div style={styles.formGrid}>
              <FormSelect
                label="Business Model"
                value={profileData.businessModel}
                onChange={(e) => handleInputChange('businessModel', e.target.value)}
                options={businessModelOptions}
                placeholder="Select business model"
                error={errors.businessModel}
                required
              />
              <FormSelect
                label="Production Capacity"
                value={profileData.productionCapacity}
                onChange={(e) => handleInputChange('productionCapacity', e.target.value)}
                options={productionCapacityOptions}
                placeholder="Select production capacity"
              />
            </div>

            <div style={styles.formGrid}>
              <FormTextarea
                label="Manufacturing Knowledge"
                value={profileData.manufacturingKnowledge}
                onChange={(e) => handleInputChange('manufacturingKnowledge', e.target.value)}
                placeholder="Experience with manufacturers, suppliers, production processes, quality control"
                minHeight="80px"
              />
              <FormTextarea
                label="Sustainability Practices"
                value={profileData.sustainabilityPractices}
                onChange={(e) => handleInputChange('sustainabilityPractices', e.target.value)}
                placeholder="Eco-friendly practices, sustainable materials, ethical production methods"
                minHeight="80px"
              />
            </div>

            <FormTextarea
              label="Quality Standards & Processes"
              value={profileData.qualityStandards}
              onChange={(e) => handleInputChange('qualityStandards', e.target.value)}
              placeholder="Quality control processes, standards, testing procedures, attention to detail"
              minHeight="80px"
            />
          </div>
        );

      case 6: // Portfolio & Collections
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>📚 Portfolio & Collections</h2>
            
            <div style={styles.formGrid}>
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
                placeholder="@yourdesignername or full URL"
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

            <div style={styles.formGrid}>
              <FormTextarea
                label="Collections & Past Work"
                value={profileData.collections}
                onChange={(e) => handleInputChange('collections', e.target.value)}
                placeholder="Describe your notable collections, signature pieces, and design milestones"
                minHeight="100px"
              />
              <FormTextarea
                label="Design Awards & Recognition"
                value={profileData.designAwards}
                onChange={(e) => handleInputChange('designAwards', e.target.value)}
                placeholder="Awards, competitions won, industry recognition"
                minHeight="100px"
              />
              <FormTextarea
                label="Exhibitions & Shows"
                value={profileData.exhibitions}
                onChange={(e) => handleInputChange('exhibitions', e.target.value)}
                placeholder="Fashion weeks, exhibitions, trunk shows, pop-ups"
                minHeight="80px"
              />
              <FormTextarea
                label="Collaborations"
                value={profileData.collaborations}
                onChange={(e) => handleInputChange('collaborations', e.target.value)}
                placeholder="Brand collaborations, partnerships, notable projects"
                minHeight="80px"
              />
            </div>
          </div>
        );

      case 7: // Services & Rates
        return (
          <div>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>💰 Services & Rates</h2>
            
            <FormCheckboxGroup
              label="Services Offered"
              options={servicesOffered}
              selectedValues={profileData.servicesOffered}
              onChange={(values) => handleInputChange('servicesOffered', values)}
              columns={3}
            />

            <div style={styles.formGrid}>
              <FormInput
                label="Consultation Rate (USD/hour)"
                type="number"
                value={profileData.rates.consultationHourly}
                onChange={(e) => handleInputChange('rates.consultationHourly', e.target.value)}
                placeholder="125"
              />
              <FormInput
                label="Custom Design Starting Rate (USD)"
                type="number"
                value={profileData.rates.customDesignStarting}
                onChange={(e) => handleInputChange('rates.customDesignStarting', e.target.value)}
                placeholder="800"
              />
              <FormInput
                label="Pattern Making Rate (USD)"
                type="number"
                value={profileData.rates.patternMaking}
                onChange={(e) => handleInputChange('rates.patternMaking', e.target.value)}
                placeholder="200"
              />
              <FormInput
                label="Technical Drawings Rate (USD)"
                type="number"
                value={profileData.rates.technicalDrawings}
                onChange={(e) => handleInputChange('rates.technicalDrawings', e.target.value)}
                placeholder="75"
              />
            </div>

            <FormCheckboxGroup
              label="Project Types"
              options={projectTypes}
              selectedValues={profileData.projectTypes}
              onChange={(values) => handleInputChange('projectTypes', values)}
              columns={3}
            />

            <FormCheckboxGroup
              label="Client Types"
              options={clientTypes}
              selectedValues={profileData.clientTypes}
              onChange={(values) => handleInputChange('clientTypes', values)}
              columns={3}
            />

            <div style={styles.formGrid}>
              <FormSelect
                label="Availability"
                value={profileData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                options={availabilityOptions}
                placeholder="Select availability"
                error={errors.availability}
                required
              />
            </div>

            <FormTextarea
              label="Collaboration Style"
              value={profileData.collaborationStyle}
             onChange={(e) => handleInputChange('collaborationStyle', e.target.value)}
             placeholder="Describe your working style, communication preferences, and project approach"
             minHeight="80px"
           />
         </div>
       );

     case 8: // Review & Submit
       return (
         <div>
           <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>✅ Review & Submit</h2>
           <Card>
             <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>Fashion Designer Profile Summary</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
               <div>
                 <strong>Name:</strong> {profileData.fullName}<br/>
                 <strong>Location:</strong> {profileData.location}<br/>
                 <strong>Experience:</strong> {profileData.yearsExperience}<br/>
                 <strong>Business Model:</strong> {
                   businessModelOptions.find(option => option.value === profileData.businessModel)?.label || 
                   profileData.businessModel
                 }
               </div>
               <div>
                 <strong>Categories:</strong> {profileData.designCategories.slice(0, 3).join(', ')}{profileData.designCategories.length > 3 ? '...' : ''}<br/>
                 <strong>Technical Skills:</strong> {profileData.technicalSkills.length} skills<br/>
                 <strong>Consultation Rate:</strong> ${profileData.rates.consultationHourly || 'TBD'}/hr<br/>
                 <strong>Services:</strong> {profileData.servicesOffered.length} offerings
               </div>
             </div>
           </Card>
           
           <Card style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
             <h4 style={{ color: '#FFC107', marginBottom: '10px' }}>✂️ Next Steps</h4>
             <p style={{ margin: 0, color: '#ddd' }}>
               After submitting your profile, you'll be redirected to your dashboard where you can:
               <br/>• Upload your design portfolio and collections
               <br/>• Browse and apply for design projects and collaborations
               <br/>• Connect with brands, manufacturers, and other designers
               <br/>• Showcase your technical drawings and creative process
             </p>
           </Card>

           {message && (
             <Notification
               type={messageType}
               message={message}
               onClose={() => { setMessage(''); setMessageType(''); }}
             />
           )}
         </div>
       );

     default:
       return null;
   }
 };

 return (
   <div style={styles.container}>
     <div style={styles.setupCard}>
       {/* Header */}
       <div style={styles.header}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
           <h1 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>
             ✂️ Fashion Designer Setup
           </h1>
           <Button 
             type="secondary"
             onClick={onLogout}
           >
             Logout
           </Button>
         </div>
         <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>
           Create your professional fashion designer profile to connect with brands and showcase your creativity
         </p>
       </div>

       {/* Step Indicator */}
       <div style={styles.stepIndicator}>
         {steps.map(step => (
           <div
             key={step.number}
             style={{
               ...styles.step,
               ...(step.number === currentStep ? styles.stepActive : 
                  step.number < currentStep ? styles.stepCompleted : styles.stepUpcoming)
             }}
           >
             <div style={{ fontSize: '20px', marginBottom: '3px' }}>
               {step.number < currentStep ? '✅' : step.icon}
             </div>
             <div style={{ fontSize: '10px', textAlign: 'center', color: 'white' }}>
               {step.title}
             </div>
           </div>
         ))}
       </div>

       {/* Content */}
       <div style={styles.content}>
         {message && currentStep < 8 && (
           <Notification
             type={messageType}
             message={message}
             onClose={() => { setMessage(''); setMessageType(''); }}
           />
         )}
         
         {renderStepContent()}
       </div>

       {/* Navigation */}
       <div style={styles.navigation}>
         <Button
           type="secondary"
           onClick={prevStep}
           disabled={currentStep === 1}
           style={{
             opacity: currentStep === 1 ? 0.5 : 1,
             cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
           }}
         >
           ← Previous
         </Button>

         <div style={{ color: 'white', fontSize: '14px' }}>
           Step {currentStep} of {steps.length}
         </div>

         {currentStep < steps.length ? (
           <Button
             type="primary"
             onClick={nextStep}
           >
             Next →
           </Button>
         ) : (
           <Button
             type="primary"
             onClick={handleSubmit}
             disabled={isSubmitting}
             style={{
               opacity: isSubmitting ? 0.7 : 1,
               cursor: isSubmitting ? 'not-allowed' : 'pointer'
             }}
           >
             {isSubmitting ? (
               <>
                 <LoadingSpinner size={16} style={{ display: 'inline-block', marginRight: '10px' }} />
                 Creating Profile...
               </>
             ) : 'Complete Profile ✨'}
           </Button>
         )}
       </div>
     </div>
   </div>
 );
};

export default FashionDesignerProfileSetup;