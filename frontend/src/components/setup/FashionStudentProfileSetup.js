import React, { useState, useEffect } from 'react';

const FashionStudentProfileSetup = ({ user, onProfileComplete, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    headline: 'Fashion Student',
    bio: '',
    location: '',
    phone: '',
    email: user?.email || '',
    website: '',
    profilePicture: null,
    coverPhoto: null,

    // Academic Information
    currentInstitution: '',
    institutionLocation: '',
    degreeProgram: '',
    customDegreeProgram: '',
    degreeLevel: '',
    currentYear: '',
    expectedGraduation: '',
    currentGPA: '',
    academicAchievements: [],
    relevantCoursework: [],
    thesis: {
      title: '',
      description: '',
      advisor: '',
      status: 'Planning'
    },

    // Specialization & Interests
    primarySpecialization: '',
    secondarySpecializations: [],
    fashionInterests: [],
    designPhilosophy: '',
    inspirations: [],
    favoriteDesigners: [],
    fashionMovements: [],

    // Skills
    designSkills: [],
    technicalSkills: [],
    softwareSkills: [],
    craftSkills: [],
    businessSkills: [],
    languageSkills: [],

    // Portfolio
    portfolioWebsite: '',
    portfolioDescription: '',
    photos: [],
    videos: [],
    projects: [],
    competitions: [],
    exhibitions: [],

    // Experience
    experience: [],

    // Internship Preferences
    internshipPreferences: {
      seeking: true,
      availability: 'Summer',
      duration: '3-6 months',
      type: 'Either',
      preferredRoles: [],
      preferredCompanyTypes: [],
      preferredLocations: [],
      remoteWork: true,
      relocationWillingness: false,
      requirements: '',
      startDate: '',
      additionalInfo: ''
    },

    // Career Goals
    careerGoals: {
      shortTerm: '',
      longTerm: '',
      dreamJob: '',
      targetCompanies: [],
      targetRoles: [],
      industryInterests: [],
      geographicPreferences: [],
      salaryExpectations: {
        entry: '',
        experienced: '',
        currency: 'USD'
      }
    },

    // Social Media
    socialMedia: {
      instagram: '',
      linkedin: '',
      behance: '',
      dribbble: '',
      pinterest: '',
      tiktok: '',
      youtube: '',
      twitter: ''
    },

    // Preferences
    availability: 'Internship only',
    workPreferences: {
      environment: 'Flexible',
      teamSize: 'No preference',
      companyStage: [],
      industryPreference: []
    },

    // Privacy Settings
    privacySettings: {
      profileVisibility: 'Public',
      contactInfo: 'Connections Only',
      academicInfo: 'Public',
      portfolioAccess: 'Public'
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Degree Programs
  const degreePrograms = [
    'Fashion Design',
    'Fashion Merchandising',
    'Fashion Marketing',
    'Fashion Business',
    'Textile Design',
    'Fashion Styling',
    'Fashion Photography',
    'Fashion Journalism',
    'Costume Design',
    'Fashion Technology',
    'Sustainable Fashion',
    'Fashion Illustration',
    'Pattern Making',
    'Fashion Communication',
    'Other'
  ];

  // Specializations
  const specializations = [
    'Womenswear Design',
    'Menswear Design',
    'Childrenswear Design',
    'Sustainable Fashion',
    'Luxury Fashion',
    'Streetwear',
    'Avant-garde',
    'Bridal Design',
    'Activewear',
    'Lingerie Design',
    'Accessories Design',
    'Footwear Design',
    'Textile Innovation',
    'Fashion Tech',
    'Fashion Business',
    'Fashion Marketing',
    'Fashion Styling',
    'Fashion Photography',
    'Fashion Journalism',
    'Other'
  ];

  // Skills arrays
  const designSkillsOptions = [
    'Sketching', 'Fashion Illustration', 'Pattern Making', 'Draping', 'Garment Construction',
    'Tailoring', 'Embroidery', 'Textile Design', 'Color Theory', 'Fashion History',
    'Trend Forecasting', 'Design Research', 'Concept Development', 'Technical Drawing'
  ];

  const technicalSkillsOptions = [
    'Sewing', 'Serging', 'Pattern Grading', 'Fitting', 'Quality Control',
    'Fabric Selection', 'Garment Finishing', 'Production Planning', 'Tech Pack Creation',
    'Spec Writing', 'Sample Making', 'Alterations', '3D Modeling', 'Digital Pattern Making'
  ];

  const softwareSkillsOptions = [
    'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign', 'CLO 3D', 'Optitex',
    'Gerber AccuMark', 'Lectra', 'Browzwear', 'Marvelous Designer', 'SketchBook Pro',
    'Procreate', 'AutoCAD', 'Rhino 3D', 'Blender'
  ];

  const businessSkillsOptions = [
    'Brand Development', 'Marketing Strategy', 'Social Media Marketing', 'E-commerce',
    'Retail Management', 'Supply Chain', 'Sustainability', 'Project Management',
    'Budget Management', 'Client Relations', 'Presentation Skills', 'Negotiation'
  ];

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: Array.isArray(value) ? value : [value]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: Array.isArray(value) ? value : [value]
      }));
    }
  };

  const addToArray = (field, item, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: [...(prev[nested][field] || []), item]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), item]
      }));
    }
  };

  const removeFromArray = (field, index, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: prev[nested][field].filter((_, i) => i !== index)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
        break;
      case 2: // Academic Information
        if (!formData.currentInstitution.trim()) newErrors.currentInstitution = 'Current institution is required';
        if (!formData.institutionLocation.trim()) newErrors.institutionLocation = 'Institution location is required';
        if (!formData.degreeProgram) newErrors.degreeProgram = 'Degree program is required';
        if (!formData.degreeLevel) newErrors.degreeLevel = 'Degree level is required';
        if (!formData.currentYear) newErrors.currentYear = 'Current year is required';
        if (!formData.expectedGraduation) newErrors.expectedGraduation = 'Expected graduation is required';
        break;
      case 3: // Specialization
        if (!formData.primarySpecialization) newErrors.primarySpecialization = 'Primary specialization is required';
        if (!formData.designPhilosophy.trim()) newErrors.designPhilosophy = 'Design philosophy is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 8));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/professional-profile/fashion-student', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fashion Student profile created:', data);
        onProfileComplete();
      } else {
        const errorData = await response.json();
        console.error('Profile creation failed:', errorData);
        setErrors({ submit: errorData.message || 'Failed to create profile' });
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Profile Setup Progress</span>
        <span className="text-sm text-gray-500">{currentStep}/8</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 8) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : step < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step < currentStep ? '✓' : step}
          </div>
        ))}
      </div>
    </div>
  );

  // Step 1: Basic Information
  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="City, State/Country"
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Headline
          </label>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => handleInputChange('headline', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Fashion Design Student at Parsons"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website/Portfolio URL
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://yourportfolio.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.bio ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Tell us about yourself, your passion for fashion, and what makes you unique..."
        />
        {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
        <p className="text-gray-500 text-sm mt-1">{formData.bio.length}/2000 characters</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Fashion Student Profile Setup
            </h1>
            <p className="text-xl text-gray-600">
              Create your comprehensive student profile to connect with industry professionals
            </p>
          </div>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {currentStep === 1 && renderBasicInformation()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                } transition-colors`}
              >
                Previous
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={onLogout}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
                
                {currentStep < 8 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Creating Profile...' : 'Complete Profile'}
                  </button>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FashionStudentProfileSetup; 