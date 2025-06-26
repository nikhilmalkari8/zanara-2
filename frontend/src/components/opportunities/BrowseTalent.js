import React, { useState, useEffect, useCallback } from 'react';

const BrowseTalent = ({ user, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfessionalTypes, setSelectedProfessionalTypes] = useState(['model']); // Default to models
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    experience: 'all',
    availability: 'all',
    workStatus: 'all',
    skills: [],
    services: [],
    // Model-specific filters
    gender: 'all',
    bodyType: 'all',
    hairColor: '',
    eyeColor: '',
    ageMin: '',
    ageMax: '',
    heightMin: '',
    heightMax: '',
    sort: 'newest'
  });
  const [currentPage, setCurrentPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [savedTalent, setSavedTalent] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [resultsBreakdown, setResultsBreakdown] = useState({});

  // Professional types with their specific characteristics
  const professionalTypes = [
    { 
      id: 'model', 
      label: 'Models', 
      icon: '👗',
      hasPhysicalAttributes: true,
      hasAge: true,
      hasHeight: true,
      hasGender: true,
      commonSkills: ['Runway', 'Commercial', 'Editorial', 'Print', 'Swimwear', 'Lingerie', 'Fitness']
    },
    { 
      id: 'photographer', 
      label: 'Photographers', 
      icon: '📸',
      hasPhysicalAttributes: false,
      hasAge: false,
      hasHeight: false,
      hasGender: false,
      commonSkills: ['Fashion Photography', 'Portrait', 'Commercial', 'Editorial', 'Beauty', 'Product']
    },
    { 
      id: 'fashion-designer', 
      label: 'Fashion Designers', 
      icon: '✂️',
      hasPhysicalAttributes: false,
      hasAge: false,
      hasHeight: false,
      hasGender: false,
      commonSkills: ['Pattern Making', 'Draping', 'CAD Design', 'Tailoring', 'Sustainable Design']
    },
    { 
      id: 'stylist', 
      label: 'Stylists', 
      icon: '👔',
      hasPhysicalAttributes: false,
      hasAge: false,
      hasHeight: false,
      hasGender: false,
      commonSkills: ['Personal Styling', 'Editorial Styling', 'Wardrobe Consulting', 'Color Analysis']
    },
    { 
      id: 'makeup-artist', 
      label: 'Makeup Artists', 
      icon: '💄',
      hasPhysicalAttributes: false,
      hasAge: false,
      hasHeight: false,
      hasGender: false,
      commonSkills: ['Bridal Makeup', 'Editorial', 'SFX', 'Beauty', 'Airbrush', 'Color Correction']
    },
    { 
      id: 'fashion-student', 
      label: 'Fashion Students', 
      icon: '🎓',
      hasPhysicalAttributes: false,
      hasAge: false,
      hasHeight: false,
      hasGender: false,
      commonSkills: ['Design Research', 'Sketching', 'Portfolio Development', 'Trend Analysis', 'Academic Projects']
    }
  ];

  // Get available filters based on selected professional types
  const getAvailableFilters = useCallback(() => {
    const selectedTypes = professionalTypes.filter(type => 
      selectedProfessionalTypes.includes(type.id)
    );
    
    return {
      hasPhysicalAttributes: selectedTypes.some(type => type.hasPhysicalAttributes),
      hasAge: selectedTypes.some(type => type.hasAge),
      hasHeight: selectedTypes.some(type => type.hasHeight),
      hasGender: selectedTypes.some(type => type.hasGender),
      availableSkills: [...new Set(selectedTypes.flatMap(type => type.commonSkills))]
    };
  }, [selectedProfessionalTypes]);

  const availableFilters = getAvailableFilters();

  // Filter options
  const genderOptions = [
    { value: 'all', label: 'All Genders' },
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'other', label: 'Other' }
  ];

  const bodyTypeOptions = [
    { value: 'all', label: 'All Body Types' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'slim', label: 'Slim' },
    { value: 'average', label: 'Average' },
    { value: 'muscular', label: 'Muscular' },
    { value: 'curvy', label: 'Curvy' }
  ];

  const experienceOptions = [
    { value: 'all', label: 'All Experience Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'experienced', label: 'Experienced' },
    { value: 'professional', label: 'Professional' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'All Availability' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'project-based', label: 'Project Based' }
  ];

  const workStatusOptions = [
    { value: 'all', label: 'All Work Status' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'full-time', label: 'Full-time Employee' },
    { value: 'part-time', label: 'Part-time Employee' },
    { value: 'contract', label: 'Contract Worker' },
    { value: 'seeking-work', label: 'Seeking Work' },
    { value: 'student', label: 'Student' },
    { value: 'not-specified', label: 'Not Specified' }
  ];

  const servicesOptions = [
    'Fashion Modeling', 'Commercial Modeling', 'Editorial Modeling', 'Runway Modeling',
    'Fitness Modeling', 'Beauty Modeling', 'Plus-Size Modeling', 'Petite Modeling',
    'Mature Modeling', 'Alternative Modeling', 'Swimwear Modeling', 'Lingerie Modeling',
    'Hand Modeling', 'Foot Modeling', 'Hair Modeling', 'Product Modeling',
    'Lifestyle Modeling', 'E-commerce Modeling', 'Catalog Modeling', 'Brand Ambassador',
    'Trade Show Modeling', 'Promotional Modeling', 'Fashion Photography', 'Portrait Photography',
    'Commercial Photography', 'Editorial Photography', 'Beauty Photography', 'Product Photography',
    'Bridal Makeup', 'Editorial Makeup', 'Fashion Makeup', 'Beauty Makeup', 'Commercial Makeup',
    'Special Effects Makeup', 'Custom Design', 'Alterations', 'Pattern Making', 'Styling Services'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest Profiles' },
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'experience', label: 'Most Experienced' },
    { value: 'professional-type', label: 'By Profession' }
  ];

  // Fetch talent based on filters
  const fetchTalent = useCallback(async () => {
    if (selectedProfessionalTypes.length === 0) {
      setModels([]);
      return;
    }

    setLoading(true);
    setApiError(null);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '20');
      queryParams.append('professionalTypes', selectedProfessionalTypes.join(','));
      
      if (filters.search.trim()) queryParams.append('search', filters.search.trim());
      if (filters.location.trim()) queryParams.append('location', filters.location.trim());
      if (filters.experience !== 'all') queryParams.append('experience', filters.experience);
      if (filters.availability !== 'all') queryParams.append('availability', filters.availability);
      if (filters.workStatus !== 'all') queryParams.append('workStatus', filters.workStatus);
      if (filters.skills.length > 0) queryParams.append('skills', filters.skills.join(','));
      if (filters.services.length > 0) queryParams.append('services', filters.services.join(','));
      if (filters.sort) queryParams.append('sort', filters.sort);

      // Only add model-specific filters if models are selected
      if (selectedProfessionalTypes.includes('model')) {
        if (filters.gender !== 'all') queryParams.append('gender', filters.gender);
        if (filters.bodyType !== 'all') queryParams.append('bodyType', filters.bodyType);
        if (filters.hairColor.trim()) queryParams.append('hairColor', filters.hairColor.trim());
        if (filters.eyeColor.trim()) queryParams.append('eyeColor', filters.eyeColor.trim());
        if (filters.ageMin.trim()) queryParams.append('ageMin', filters.ageMin.trim());
        if (filters.ageMax.trim()) queryParams.append('ageMax', filters.ageMax.trim());
        if (filters.heightMin.trim()) queryParams.append('heightMin', filters.heightMin.trim());
        if (filters.heightMax.trim()) queryParams.append('heightMax', filters.heightMax.trim());
      }

      const token = localStorage.getItem('token');
      
      console.log('Fetching with params:', queryParams.toString());
      
      const response = await fetch(`http://localhost:8001/api/professional-profile/browse?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      setModels(data.models || []);
      setTotalPages(data.totalPages || 1);
      setResultsBreakdown(data.breakdown || {});
      
    } catch (error) {
      console.error('Error fetching talent:', error);
      setApiError('Unable to load talent profiles. Please check your connection and try again.');
      setModels([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, selectedProfessionalTypes]);

  useEffect(() => {
    fetchTalent();
    const saved = JSON.parse(localStorage.getItem('savedTalent') || '[]');
    setSavedTalent(saved);
  }, [fetchTalent]);

  const handleProfessionalTypeToggle = useCallback((typeId) => {
    setSelectedProfessionalTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
    setCurrentPageNum(1);
    
    // Reset filters that don't apply to newly selected types
    setTimeout(() => {
      const newAvailableFilters = getAvailableFilters();
      setFilters(prev => ({
        ...prev,
        gender: newAvailableFilters.hasGender ? prev.gender : 'all',
        bodyType: newAvailableFilters.hasPhysicalAttributes ? prev.bodyType : 'all',
        hairColor: newAvailableFilters.hasPhysicalAttributes ? prev.hairColor : '',
        eyeColor: newAvailableFilters.hasPhysicalAttributes ? prev.eyeColor : '',
        ageMin: newAvailableFilters.hasAge ? prev.ageMin : '',
        ageMax: newAvailableFilters.hasAge ? prev.ageMax : '',
        heightMin: newAvailableFilters.hasHeight ? prev.heightMin : '',
        heightMax: newAvailableFilters.hasHeight ? prev.heightMax : ''
      }));
    }, 0);
  }, [getAvailableFilters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPageNum(1);
  }, []);

  const handleSkillToggle = useCallback((skill) => {
    setFilters(prev => {
      const skills = [...prev.skills];
      if (skills.includes(skill)) {
        return { ...prev, skills: skills.filter(s => s !== skill) };
      } else {
        return { ...prev, skills: [...skills, skill] };
      }
    });
    setCurrentPageNum(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      location: '',
      experience: 'all',
      availability: 'all',
      workStatus: 'all',
      skills: [],
      services: [],
      gender: 'all',
      bodyType: 'all',
      hairColor: '',
      eyeColor: '',
      ageMin: '',
      ageMax: '',
      heightMin: '',
      heightMax: '',
      sort: 'newest'
    });
    setCurrentPageNum(1);
  }, []);

  const calculateAge = useCallback((dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, []);

  const getTimeAgo = useCallback((date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const lastActive = new Date(date);
    const diffInSeconds = Math.floor((now - lastActive) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  }, []);

  const handleSaveTalent = useCallback((talentId) => {
    setSavedTalent(prev => {
      const newSaved = prev.includes(talentId)
        ? prev.filter(id => id !== talentId)
        : [...prev, talentId];
      
      localStorage.setItem('savedTalent', JSON.stringify(newSaved));
      return newSaved;
    });
  }, []);

  // Updated function to navigate to profile instead of modal
  const openTalentProfile = useCallback((talent) => {
    const profileUserId = talent.userId?._id || talent.userId;
    
    console.log('Opening profile for:', profileUserId);
    
    // Track profile view (fire and forget)
    const token = localStorage.getItem('token');
    if (token && profileUserId) {
      fetch('/api/analytics/profile-view', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileOwnerId: profileUserId,
          viewType: 'profile',
          source: 'browse-talent'
        })
      }).catch(err => {
        console.log('Profile view tracking failed:', err);
      });
    }
    
    // Navigate to profile page
    if (typeof setCurrentPage === 'function') {
      setCurrentPage('view-profile');
    }
    
    // Set the viewing profile ID for ProfileRouter
    if (typeof setViewingProfileId === 'function') {
      setViewingProfileId(profileUserId);
    }
    
    // Alternative: Call onViewProfile if provided
    if (typeof onViewProfile === 'function') {
      onViewProfile(profileUserId);
    }
  }, [setCurrentPage, setViewingProfileId, onViewProfile]);

  // Optional: Keep modal approach as fallback
  const openTalentProfileModal = useCallback((talent) => {
    setSelectedModel(talent);
  }, []);

  const closeTalentProfile = useCallback(() => {
    setSelectedModel(null);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPageNum(newPage);
    }
  }, [totalPages]);

  // Render talent grid
  const renderGrid = useCallback(() => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '25px',
      marginBottom: '30px'
    }}>
      {models.map((talent) => (
        <div
          key={talent._id}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            transition: 'all 0.4s ease',
            cursor: 'pointer',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => openTalentProfile(talent)}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
          }}
        >
          {/* Professional Type Badge */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            padding: '6px 12px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 1,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {professionalTypes.find(type => type.id === talent.professionalType)?.icon} {talent.displayName || talent.professionalType}
          </div>

          {/* Save Button */}
          <div 
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              zIndex: 1,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleSaveTalent(talent._id);
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ 
              fontSize: '18px',
              color: savedTalent.includes(talent._id) ? '#ff6b6b' : 'white',
              transition: 'all 0.3s ease'
            }}>
              {savedTalent.includes(talent._id) ? '❤️' : '🤍'}
            </span>
          </div>

          {/* Profile Image */}
          <div style={{
            height: '300px',
            backgroundImage: `url(${talent.photos && talent.photos.length > 0 ? talent.photos[0] : 'https://via.placeholder.com/320x300?text=No+Photo'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}>
            {/* Gradient overlay for better text readability */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60px',
              background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.6))'
            }}></div>
          </div>

          <div style={{ padding: '25px' }}>
            {/* Name */}
            <h3 style={{
              color: 'white',
              fontSize: '1.4rem',
              margin: '0 0 8px 0',
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              {talent.userId?.firstName || ''} {talent.userId?.lastName || ''} {talent.fullName || ''}
            </h3>

            {/* Location */}
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1rem',
              margin: '0 0 15px 0',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '400'
            }}>
              <span style={{ marginRight: '8px', fontSize: '16px' }}>📍</span> 
              {talent.location || 'Location not specified'}
            </p>

            {/* Dynamic Info based on professional type */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {talent.professionalType === 'model' && (
                <>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Age:</span> {calculateAge(talent.dateOfBirth)}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Height:</span> {talent.height || 'N/A'}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Hair:</span> {talent.hairColor || 'N/A'}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Eyes:</span> {talent.eyeColor || 'N/A'}
                  </div>
                </>
              )}
              {talent.professionalType !== 'model' && (
                <>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Experience:</span> {talent.experience || 'N/A'}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Available:</span> {talent.availability || 'N/A'}
                  </div>
                </>
              )}
              
              {/* Work Status - Show for all professional types */}
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '0.95rem',
                fontWeight: '500',
                gridColumn: talent.professionalType === 'model' ? 'span 2' : 'span 1'
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Status:</span> {
                  talent.workStatus ? 
                    workStatusOptions.find(option => option.value === talent.workStatus)?.label || talent.workStatus
                    : 'Not specified'
                }
              </div>
            </div>

            {/* Specialized Services */}
            {talent.specializedServices && talent.specializedServices.length > 0 && (
              <div style={{
                marginBottom: '20px'
              }}>
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Services:
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {talent.specializedServices.slice(0, 4).map((service, index) => (
                    <span key={index} style={{
                      padding: '4px 10px',
                      background: 'rgba(78, 205, 196, 0.2)',
                      color: '#4ECDCC',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      border: '1px solid rgba(78, 205, 196, 0.3)'
                    }}>
                      {service}
                    </span>
                  ))}
                  {talent.specializedServices.length > 4 && (
                    <span style={{
                      padding: '4px 10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      +{talent.specializedServices.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Skills/Tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '20px'
            }}>
              {talent.skills && talent.skills.slice(0, 3).map((skill, index) => (
                <span key={index} style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {skill}
                </span>
              ))}
              {talent.skills && talent.skills.length > 3 && (
                <span style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  +{talent.skills.length - 3} more
                </span>
              )}
            </div>

            {/* Last Active */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '15px',
              fontSize: '0.85rem'
            }}>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: '400'
              }}>
                Active {getTimeAgo(talent.lastActive)}
              </div>
              <div style={{ 
                color: 'white', 
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                View Profile 
                <span style={{ fontSize: '14px' }}>→</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ), [models, savedTalent, professionalTypes, calculateAge, getTimeAgo, handleSaveTalent, openTalentProfile]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '30px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <h1 style={{ 
              color: 'white', 
              fontSize: '2.5rem', 
              margin: 0,
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              Browse Talent 👥
            </h1>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              margin: '8px 0 0 0',
              fontSize: '1.1rem',
              fontWeight: '300'
            }}>
              Discover and connect with fashion professionals
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => setCurrentPage && setCurrentPage('company-dashboard')}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Dashboard
            </button>
            <button
              onClick={onLogout}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 107, 107, 0.2)',
                color: '#ff6b6b',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 107, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Professional Type Selection */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '30px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            color: 'white', 
            marginBottom: '15px', 
            fontSize: '1.5rem',
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            🎯 What type of talent are you looking for?
          </h3>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            marginBottom: '25px', 
            fontSize: '1rem',
            fontWeight: '300'
          }}>
            Select one or more professional types to customize your search filters
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {professionalTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => handleProfessionalTypeToggle(type.id)}
                style={{
                  padding: '20px',
                  background: selectedProfessionalTypes.includes(type.id)
                    ? 'rgba(78, 205, 196, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: selectedProfessionalTypes.includes(type.id)
                    ? '2px solid rgba(78, 205, 196, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  if (!selectedProfessionalTypes.includes(type.id)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!selectedProfessionalTypes.includes(type.id)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Selection Indicator */}
                {selectedProfessionalTypes.includes(type.id) && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '24px',
                    height: '24px',
                    background: 'rgba(78, 205, 196, 0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '12px'
                }}>
                  <span style={{ 
                    fontSize: '2rem',
                    filter: selectedProfessionalTypes.includes(type.id) ? 'brightness(1.2)' : 'brightness(1)'
                  }}>
                    {type.icon}
                  </span>
                  <div>
                    <h4 style={{
                      color: 'white',
                      margin: 0,
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>
                      {type.label}
                    </h4>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      margin: '4px 0 0 0',
                      fontSize: '0.85rem',
                      fontWeight: '300'
                    }}>
                      {type.hasPhysicalAttributes ? 'Physical attributes available' : 'Professional skills focus'}
                    </p>
                  </div>
                </div>

                {/* Skills Preview */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '12px'
                }}>
                  {type.commonSkills.slice(0, 3).map((skill, index) => (
                    <span key={index} style={{
                      padding: '4px 8px',
                      background: selectedProfessionalTypes.includes(type.id)
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {skill}
                    </span>
                  ))}
                  {type.commonSkills.length > 3 && (
                    <span style={{
                      padding: '4px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      +{type.commonSkills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selectedProfessionalTypes.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#ff6b6b',
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              ⚠️ Please select at least one professional type to continue
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters - Only show if professional types are selected */}
      {selectedProfessionalTypes.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '30px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Search Bar */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by name, skills, or location..."
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                />
                <button
                  type="button"
                  onClick={fetchTalent}
                  style={{
                    padding: '16px 28px',
                    background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
                  }}
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    padding: '16px 28px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </div>

            {/* Dynamic Filters Panel */}
            {showFilters && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '25px'
                }}>
                  {/* Universal Filters */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      marginBottom: '8px',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Experience Level
                    </label>
                    <select
                      value={filters.experience}
                      onChange={(e) => handleFilterChange('experience', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '15px',
                        outline: 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px top 50%',
                        backgroundSize: '12px auto',
                        paddingRight: '40px'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      {experienceOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      marginBottom: '8px',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Availability
                    </label>
                    <select
                      value={filters.availability}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '15px',
                        outline: 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px top 50%',
                        backgroundSize: '12px auto',
                        paddingRight: '40px'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      {availabilityOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      marginBottom: '8px',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Work Status
                    </label>
                    <select
                      value={filters.workStatus}
                      onChange={(e) => handleFilterChange('workStatus', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '15px',
                        outline: 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px top 50%',
                        backgroundSize: '12px auto',
                        paddingRight: '40px'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      {workStatusOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      marginBottom: '8px',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="City or Country"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '15px',
                        outline: 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      marginBottom: '8px',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Sort By
                    </label>
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '15px',
                        outline: 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px top 50%',
                        backgroundSize: '12px auto',
                        paddingRight: '40px'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Model-specific filters - only show if models are selected */}
                {availableFilters.hasGender && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      marginBottom: '8px',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Gender
                    </label>
                    <select
                      value={filters.gender}
                      onChange={(e) => handleFilterChange('gender', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '15px',
                        outline: 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px top 50%',
                        backgroundSize: '12px auto',
                        paddingRight: '40px'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      {genderOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {availableFilters.hasPhysicalAttributes && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '25px'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        marginBottom: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        Body Type
                      </label>
                      <select
                        value={filters.bodyType}
                        onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '15px',
                          outline: 'none',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          appearance: 'none',
                          backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 16px top 50%',
                          backgroundSize: '12px auto',
                          paddingRight: '40px'
                        }}
                        onFocus={(e) => {
                          e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                      >
                        {bodyTypeOptions.map(option => (
                          <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        marginBottom: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        Hair Color
                      </label>
                      <input
                        type="text"
                        value={filters.hairColor}
                        onChange={(e) => handleFilterChange('hairColor', e.target.value)}
                        placeholder="e.g., Blonde, Brunette"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '15px',
                          outline: 'none',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        marginBottom: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        Eye Color
                      </label>
                      <input
                        type="text"
                        value={filters.eyeColor}
                        onChange={(e) => handleFilterChange('eyeColor', e.target.value)}
                        placeholder="e.g., Blue, Brown"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '15px',
                          outline: 'none',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Age and Height filters - only for models */}
                {availableFilters.hasAge && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px',
                    marginBottom: '25px'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        marginBottom: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        Age Range
                      </label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={filters.ageMin}
                          onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                          placeholder="Min"
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '15px',
                            outline: 'none',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                          }}
                          min="16"
                          max="99"
                          onFocus={(e) => {
                            e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                          }}
                        />
                        <span style={{ color: 'white', fontWeight: '600' }}>-</span>
                        <input
                          type="number"
                          value={filters.ageMax}
                          onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                          placeholder="Max"
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '15px',
                            outline: 'none',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                          }}
                          min="16"
                          max="99"
                          onFocus={(e) => {
                            e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        marginBottom: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        Height Range
                      </label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={filters.heightMin}
                          onChange={(e) => handleFilterChange('heightMin', e.target.value)}
                          placeholder="Min (e.g. 5'6)"
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '15px',
                            outline: 'none',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                          }}
                        />
                        <span style={{ color: 'white', fontWeight: '600' }}>-</span>
                        <input
                          type="text"
                          value={filters.heightMax}
                          onChange={(e) => handleFilterChange('heightMax', e.target.value)}
                          placeholder="Max (e.g. 6'0)"
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '15px',
                            outline: 'none',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.border = '1px solid rgba(78, 205, 196, 0.6)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills Filter */}
                {availableFilters.availableSkills.length > 0 && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      marginBottom: '12px',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Skills ({selectedProfessionalTypes.map(type => 
                        professionalTypes.find(pt => pt.id === type)?.label
                      ).join(', ')})
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '10px', 
                      marginBottom: '20px' 
                    }}>
                      {availableFilters.availableSkills.map(skill => (
                        <div
                          key={skill}
                          onClick={() => handleSkillToggle(skill)}
                          style={{
                            padding: '8px 16px',
                            background: filters.skills.includes(skill) 
                              ? 'rgba(78, 205, 196, 0.4)' 
                              : 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: filters.skills.includes(skill)
                              ? '1px solid rgba(78, 205, 196, 0.6)'
                              : '1px solid rgba(255, 255, 255, 0.2)',
                            fontWeight: '500'
                          }}
                          onMouseOver={(e) => {
                            if (!filters.skills.includes(skill)) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!filters.skills.includes(skill)) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '20px'
                }}>
                  <button
                    onClick={resetFilters}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Reset Filters
                  </button>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500' }}>
                      View as:
                    </div>
                    <button
                      onClick={() => setViewMode('grid')}
                      style={{
                        padding: '8px 16px',
                        background: viewMode === 'grid' 
                          ? 'rgba(78, 205, 196, 0.4)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: viewMode === 'grid'
                          ? '1px solid rgba(78, 205, 196, 0.6)'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                      }}
                      onMouseOver={(e) => {
                        if (viewMode !== 'grid') {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (viewMode !== 'grid') {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      style={{
                        padding: '8px 16px',
                        background: viewMode === 'list' 
                          ? 'rgba(78, 205, 196, 0.4)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: viewMode === 'list'
                          ? '1px solid rgba(78, 205, 196, 0.6)'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                      }}
                      onMouseOver={(e) => {
                        if (viewMode !== 'list') {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (viewMode !== 'list') {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      List
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Specialized Services
                  </label>
                  <div style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    padding: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {servicesOptions.map(service => (
                      <label key={service} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 0',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.9)'
                      }}>
                        <input
                          type="checkbox"
                          checked={filters.services.includes(service)}
                          onChange={(e) => {
                            const newServices = e.target.checked
                              ? [...filters.services, service]
                              : filters.services.filter(s => s !== service);
                            handleFilterChange('services', newServices);
                          }}
                          style={{
                            marginRight: '8px',
                            accentColor: '#4ECDCC'
                          }}
                        />
                        {service}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Error Message */}
      {apiError && (
        <div style={{ maxWidth: '1400px', margin: '0 auto 20px' }}>
          <div style={{
            background: 'rgba(255, 107, 107, 0.2)',
            border: '1px solid rgba(255, 107, 107, 0.5)',
            borderRadius: '15px',
            padding: '20px',
            color: '#ff6b6b',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <strong>⚠️ {apiError}</strong>
            <button 
              onClick={fetchTalent}
              style={{
                marginLeft: '15px',
                padding: '8px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {selectedProfessionalTypes.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Results Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <div>
              <h2 style={{ 
                color: 'white', 
                margin: 0, 
                fontSize: '1.8rem',
                fontWeight: '600',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                {loading ? 'Searching...' : `${models.length} Results`}
              </h2>
              {Object.keys(resultsBreakdown).length > 0 && (
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '1rem', 
                  marginTop: '8px',
                  fontWeight: '300'
                }}>
                  {Object.entries(resultsBreakdown).map(([type, count]) => (
                    <span key={type} style={{ marginRight: '20px' }}>
                      {professionalTypes.find(pt => pt.id === type)?.icon} {count} {professionalTypes.find(pt => pt.id === type)?.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                Saved: {savedTalent.length}
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px'
            }}>
              <div style={{ 
                color: 'white', 
                fontSize: '1.5rem',
                fontWeight: '500'
              }}>
                Searching for talent...
              </div>
            </div>
          ) : models.length === 0 ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '80px 40px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '25px' }}>🔍</div>
              <h3 style={{ 
                color: 'white', 
                fontSize: '1.8rem', 
                marginBottom: '15px',
                fontWeight: '600'
              }}>
                {apiError ? 'Unable to load profiles' : 'No talent matches your criteria'}
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                marginBottom: '25px',
                fontSize: '1.1rem',
                fontWeight: '300'
              }}>
                {apiError 
                  ? 'Please check your connection and try again.' 
                  : 'Try adjusting your filters or selecting different professional types.'
                }
              </p>
              <button
                onClick={apiError ? fetchTalent : resetFilters}
                style={{
                  padding: '15px 30px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {apiError ? 'Retry' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            <React.Fragment>
              {/* Talent Grid */}
              {renderGrid()}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '30px'
                }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '12px 24px',
                      background: currentPage === 1 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(255, 255, 255, 0.15)',
                      color: currentPage === 1 ? 'rgba(255, 255, 255, 0.4)' : 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    Previous
                  </button>

                  <span style={{ 
                    color: 'white', 
                    padding: '0 25px',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '12px 24px',
                      background: currentPage === totalPages 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(255, 255, 255, 0.15)',
                      color: currentPage === totalPages ? 'rgba(255, 255, 255, 0.4)' : 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </React.Fragment>
          )}
        </div>
      )}

      {/* Talent Profile Modal - Keep as fallback/optional */}
      {selectedModel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Close Button */}
            <button 
              onClick={closeTalentProfile}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>

            {/* Profile Content */}
            <div style={{
              padding: '40px',
              overflow: 'auto',
              maxHeight: '90vh'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '30px' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}>
                  {selectedModel.photos && selectedModel.photos.length > 0 ? (
                    <img 
                      src={selectedModel.photos[0]}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '48px'
                    }}>
                      👤
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 style={{ 
                    color: 'white', 
                    margin: '0 0 8px 0',
                    fontSize: '1.8rem',
                    fontWeight: '600'
                  }}>
                    {selectedModel.userId?.firstName || ''} {selectedModel.userId?.lastName || ''}
                  </h2>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '1.2rem',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {professionalTypes.find(type => type.id === selectedModel.professionalType)?.icon}
                    <span>{selectedModel.displayName || selectedModel.professionalType}</span>
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1rem'
                  }}>
                    📍 {selectedModel.location || 'Location not specified'}
                  </div>
                </div>
              </div>

              <div style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.8' }}>
                <h3 style={{ 
                  color: 'white', 
                  marginBottom: '20px',
                  fontSize: '1.4rem',
                  fontWeight: '600'
                }}>
                  Professional Details
                </h3>
                
                {selectedModel.professionalType === 'model' && (
                  <>
                    {selectedModel.dateOfBirth && (
                      <p><strong>Age:</strong> {calculateAge(selectedModel.dateOfBirth)}</p>
                    )}
                    {selectedModel.height && (
                      <p><strong>Height:</strong> {selectedModel.height}</p>
                    )}
                    {selectedModel.hairColor && (
                      <p><strong>Hair Color:</strong> {selectedModel.hairColor}</p>
                    )}
                    {selectedModel.eyeColor && (
                      <p><strong>Eye Color:</strong> {selectedModel.eyeColor}</p>
                    )}
                    {selectedModel.bodyType && (
                      <p><strong>Body Type:</strong> {selectedModel.bodyType}</p>
                    )}
                  </>
                )}
                
                {selectedModel.experience && (
                  <p><strong>Experience:</strong> {selectedModel.experience}</p>
                )}
                
                {selectedModel.availability && (
                  <p><strong>Availability:</strong> {selectedModel.availability}</p>
                )}
                
                {selectedModel.skills && selectedModel.skills.length > 0 && (
                  <div>
                    <strong>Skills:</strong>
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedModel.skills.map((skill, index) => (
                        <span key={index} style={{
                          padding: '6px 12px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '15px',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseTalent;