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
    skills: [],
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
    }
  ];

  // Get available filters based on selected professional types
  const getAvailableFilters = () => {
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
  };

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
      queryParams.append('page', currentPage);
      queryParams.append('limit', '20');
      queryParams.append('professionalTypes', selectedProfessionalTypes.join(','));
      
      if (filters.search.trim()) queryParams.append('search', filters.search.trim());
      if (filters.location.trim()) queryParams.append('location', filters.location.trim());
      if (filters.experience !== 'all') queryParams.append('experience', filters.experience);
      if (filters.availability !== 'all') queryParams.append('availability', filters.availability);
      if (filters.skills.length > 0) queryParams.append('skills', filters.skills.join(','));
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
          'Authorization': `Bearer ${token}`
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

  const handleProfessionalTypeToggle = (typeId) => {
    setSelectedProfessionalTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
    setCurrentPageNum(1);
    
    // Reset filters that don't apply to newly selected types
    const newAvailableFilters = getAvailableFilters();
    if (!newAvailableFilters.hasGender) {
      setFilters(prev => ({ ...prev, gender: 'all' }));
    }
    if (!newAvailableFilters.hasPhysicalAttributes) {
      setFilters(prev => ({ 
        ...prev, 
        bodyType: 'all', 
        hairColor: '', 
        eyeColor: '',
        ageMin: '',
        ageMax: '',
        heightMin: '',
        heightMax: ''
      }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPageNum(1);
  };

  const handleSkillToggle = (skill) => {
    setFilters(prev => {
      const skills = [...prev.skills];
      if (skills.includes(skill)) {
        return { ...prev, skills: skills.filter(s => s !== skill) };
      } else {
        return { ...prev, skills: [...skills, skill] };
      }
    });
    setCurrentPageNum(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      location: '',
      experience: 'all',
      availability: 'all',
      skills: [],
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
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const lastActive = new Date(date);
    const diffInSeconds = Math.floor((now - lastActive) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const handleSaveTalent = (talentId) => {
    setSavedTalent(prev => {
      const newSaved = prev.includes(talentId)
        ? prev.filter(id => id !== talentId)
        : [...prev, talentId];
      
      localStorage.setItem('savedTalent', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  // Updated function to navigate to profile instead of modal
  const openTalentProfile = (talent) => {
    const profileUserId = talent.userId?._id || talent.userId;
    
    console.log('Opening profile for:', profileUserId);
    
    // Navigate to profile page
    setCurrentPage('view-profile');
    
    // Set the viewing profile ID for ProfileRouter
    if (typeof setViewingProfileId === 'function') {
      setViewingProfileId(profileUserId);
    }
    
    // Alternative: Call onViewProfile if provided
    if (typeof onViewProfile === 'function') {
      onViewProfile(profileUserId);
    }
  };

  // Optional: Keep modal approach as fallback
  const openTalentProfileModal = (talent) => {
    setSelectedModel(talent);
  };

  const closeTalentProfile = () => {
    setSelectedModel(null);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '14px',
    outline: 'none'
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px top 50%',
    backgroundSize: '12px auto',
    paddingRight: '30px'
  };

  // Render talent grid
  const renderGrid = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    }}>
      {models.map((talent) => (
        <div
          key={talent._id}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => openTalentProfile(talent)}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Professional Type Badge */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            padding: '4px 8px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 1
          }}>
            {professionalTypes.find(type => type.id === talent.professionalType)?.icon} {talent.displayName || talent.professionalType}
          </div>

          {/* Save Button */}
          <div 
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleSaveTalent(talent._id);
            }}
          >
            <span style={{ 
              fontSize: '18px',
              color: savedTalent.includes(talent._id) ? '#ff6b6b' : 'white'
            }}>
              {savedTalent.includes(talent._id) ? '❤️' : '🤍'}
            </span>
          </div>

          {/* Profile Image */}
          <div style={{
            height: '280px',
            backgroundImage: `url(${talent.photos && talent.photos.length > 0 ? talent.photos[0] : 'https://via.placeholder.com/280x280?text=No+Photo'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>

          <div style={{ padding: '20px' }}>
            {/* Name */}
            <h3 style={{
              color: 'white',
              fontSize: '1.2rem',
              margin: '0 0 5px 0',
              fontWeight: 'bold'
            }}>
              {talent.userId?.firstName} {talent.userId?.lastName} {talent.fullName || ''}
            </h3>

            {/* Location */}
            <p style={{
              color: '#ccc',
              fontSize: '0.9rem',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '5px' }}>📍</span> 
              {talent.location || 'Location not specified'}
            </p>

            {/* Dynamic Info based on professional type */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '15px'
            }}>
              {talent.professionalType === 'model' && (
                <>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    <span style={{ color: '#999' }}>Age:</span> {calculateAge(talent.dateOfBirth)}
                  </div>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    <span style={{ color: '#999' }}>Height:</span> {talent.height || 'N/A'}
                  </div>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    <span style={{ color: '#999' }}>Hair:</span> {talent.hairColor || 'N/A'}
                  </div>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    <span style={{ color: '#999' }}>Eyes:</span> {talent.eyeColor || 'N/A'}
                  </div>
                </>
              )}
              {talent.professionalType !== 'model' && (
                <>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    <span style={{ color: '#999' }}>Experience:</span> {talent.experience || 'N/A'}
                  </div>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    <span style={{ color: '#999' }}>Available:</span> {talent.availability || 'N/A'}
                  </div>
                </>
              )}
            </div>

            {/* Skills/Tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px',
              marginBottom: '15px'
            }}>
              {talent.skills && talent.skills.slice(0, 3).map((skill, index) => (
                <span key={index} style={{
                  padding: '4px 8px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '0.7rem'
                }}>
                  {skill}
                </span>
              ))}
              {talent.skills && talent.skills.length > 3 && (
                <span style={{
                  padding: '4px 8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ccc',
                  borderRadius: '12px',
                  fontSize: '0.7rem'
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
              paddingTop: '12px',
              fontSize: '0.8rem'
            }}>
              <div style={{ color: '#999' }}>
                Active {getTimeAgo(talent.lastActive)}
              </div>
              <div style={{ color: 'white', fontWeight: 'bold' }}>
                View Profile →
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
          padding: '20px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>
              Browse Talent 👥
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Discover and connect with fashion professionals
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCurrentPage('company-dashboard')}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
            <button
              onClick={onLogout}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 0, 0, 0.2)',
                color: '#ff6b6b',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
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
          padding: '25px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1.3rem' }}>
            🎯 What type of talent are you looking for?
          </h3>
          <p style={{ color: '#ccc', marginBottom: '20px', fontSize: '0.9rem' }}>
            Select one or more professional types to customize your search filters
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {professionalTypes.map(type => (
              <div
                key={type.id}
                onClick={() => handleProfessionalTypeToggle(type.id)}
                style={{
                  padding: '15px',
                  background: selectedProfessionalTypes.includes(type.id) 
                    ? 'rgba(78, 205, 196, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: selectedProfessionalTypes.includes(type.id)
                    ? '2px solid rgba(78, 205, 196, 0.7)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => {
                  if (!selectedProfessionalTypes.includes(type.id)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!selectedProfessionalTypes.includes(type.id)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{type.icon}</div>
                <div style={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  marginBottom: '5px'
                }}>
                  {type.label}
                </div>
                {resultsBreakdown[type.id] && (
                  <div style={{ 
                    color: '#4ecdc4', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {resultsBreakdown[type.id]} found
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {selectedProfessionalTypes.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#ff6b6b',
              marginTop: '15px',
              padding: '10px',
              background: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 107, 107, 0.3)'
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
            padding: '20px',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by name, skills, or location..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={fetchTalent}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </div>

            {/* Dynamic Filters Panel */}
            {showFilters && (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  {/* Universal Filters */}
                  <div>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                      Experience Level
                    </label>
                    <select
                      value={filters.experience}
                      onChange={(e) => handleFilterChange('experience', e.target.value)}
                      style={selectStyle}
                    >
                      {experienceOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                      Availability
                    </label>
                    <select
                      value={filters.availability}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                      style={selectStyle}
                    >
                      {availabilityOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="City or Country"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                      Sort By
                    </label>
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      style={selectStyle}
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model-specific filters - only show if models are selected */}
                  {availableFilters.hasGender && (
                    <div>
                      <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                        Gender
                      </label>
                      <select
                        value={filters.gender}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                        style={selectStyle}
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
                    <div>
                      <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                        Body Type
                      </label>
                      <select
                        value={filters.bodyType}
                        onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                        style={selectStyle}
                      >
                        {bodyTypeOptions.map(option => (
                          <option key={option.value} value={option.value} style={{ background: '#333', color: 'white' }}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {availableFilters.hasPhysicalAttributes && (
                    <div>
                      <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                        Hair Color
                      </label>
                      <input
                        type="text"
                        value={filters.hairColor}
                        onChange={(e) => handleFilterChange('hairColor', e.target.value)}
                        placeholder="e.g., Blonde, Brunette"
                        style={inputStyle}
                      />
                    </div>
                  )}

                  {availableFilters.hasPhysicalAttributes && (
                    <div>
                      <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                        Eye Color
                      </label>
                      <input
                        type="text"
                        value={filters.eyeColor}
                        onChange={(e) => handleFilterChange('eyeColor', e.target.value)}
                        placeholder="e.g., Blue, Brown"
                        style={inputStyle}
                      />
                    </div>
                  )}
                </div>

                {/* Age and Height filters - only for models */}
                {availableFilters.hasAge && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                        Age Range
                      </label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={filters.ageMin}
                          onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                          placeholder="Min"
                          style={{ ...inputStyle, flex: 1 }}
                          min="16"
                          max="99"
                        />
                        <span style={{ color: 'white' }}>-</span>
                        <input
                          type="number"
                          value={filters.ageMax}
                          onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                          placeholder="Max"
                          style={{ ...inputStyle, flex: 1 }}
                          min="16"
                          max="99"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                        Height Range
                      </label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={filters.heightMin}
                          onChange={(e) => handleFilterChange('heightMin', e.target.value)}
                          placeholder="Min (e.g. 5'6\)"
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <span style={{ color: 'white' }}>-</span>
                        <input
                          type="text"
                          value={filters.heightMax}
                          onChange={(e) => handleFilterChange('heightMax', e.target.value)}
                          placeholder="Max (e.g. 6'0\)"
                          style={{ ...inputStyle, flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills Filter */}
                {availableFilters.availableSkills.length > 0 && (
                  <div>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>
                      Skills ({selectedProfessionalTypes.map(type => 
                        professionalTypes.find(pt => pt.id === type)?.label
                      ).join(', ')})
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                      {availableFilters.availableSkills.map(skill => (
                        <div
                          key={skill}
                          onClick={() => handleSkillToggle(skill)}
                          style={{
                            padding: '6px 12px',
                            background: filters.skills.includes(skill) 
                              ? 'rgba(78, 205, 196, 0.6)' 
                              : 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
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
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '15px'
                }}>
                  <button
                    onClick={resetFilters}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ccc',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Reset Filters
                  </button>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ color: '#ccc', fontSize: '14px' }}>
                      View as:
                    </div>
                    <button
                      onClick={() => setViewMode('grid')}
                      style={{
                        padding: '8px 12px',
                        background: viewMode === 'grid' 
                          ? 'rgba(78, 205, 196, 0.3)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: viewMode === 'grid'
                          ? '1px solid rgba(78, 205, 196, 0.5)'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      style={{
                        padding: '8px 12px',
                        background: viewMode === 'list' 
                          ? 'rgba(78, 205, 196, 0.3)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: viewMode === 'list'
                          ? '1px solid rgba(78, 205, 196, 0.5)'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      List
                    </button>
                  </div>
                </div>
              </>
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
            borderRadius: '10px',
            padding: '15px',
            color: '#ff6b6b',
            textAlign: 'center'
          }}>
            <strong>⚠️ {apiError}</strong>
            <button 
              onClick={fetchTalent}
              style={{
                marginLeft: '15px',
                padding: '5px 15px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '5px',
                cursor: 'pointer'
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
            marginBottom: '20px'
          }}>
            <div>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
                {loading ? 'Searching...' : `${models.length} Results`}
              </h2>
              {Object.keys(resultsBreakdown).length > 0 && (
                <div style={{ color: '#ccc', fontSize: '0.9rem', marginTop: '5px' }}>
                  {Object.entries(resultsBreakdown).map(([type, count]) => (
                    <span key={type} style={{ marginRight: '15px' }}>
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
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
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
              <div style={{ color: 'white', fontSize: '1.5rem' }}>Searching for talent...</div>
            </div>
          ) : models.length === 0 ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '60px 20px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>
                {apiError ? 'Unable to load profiles' : 'No talent matches your criteria'}
              </h3>
              <p style={{ color: '#ccc', marginBottom: '20px' }}>
                {apiError 
                  ? 'Please check your connection and try again.' 
                  : 'Try adjusting your filters or selecting different professional types.'
                }
              </p>
              <button
                onClick={apiError ? fetchTalent : resetFilters}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                {apiError ? 'Retry' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            <>
              {/* Talent Grid */}
              {renderGrid()}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '30px'
                }}>
                  <button
                    onClick={() => setCurrentPageNum(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '10px 20px',
                      background: currentPage === 1 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(255, 255, 255, 0.2)',
                      color: currentPage === 1 ? '#666' : 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Previous
                  </button>

                  <span style={{ color: 'white', padding: '0 20px' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPageNum(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '10px 20px',
                      background: currentPage === totalPages 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(255, 255, 255, 0.2)',
                      color: currentPage === totalPages ? '#666' : 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
            borderRadius: '15px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={closeTalentProfile}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            {/* Profile Content */}
            <div style={{
              padding: '30px',
              overflow: 'auto',
              maxHeight: '90vh'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.2)'
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
                  <h2 style={{ color: 'white', margin: '0 0 5px 0' }}>
                    {selectedModel.userId?.firstName} {selectedModel.userId?.lastName}
                  </h2>
                  <div style={{ 
                    color: '#ddd', 
                    fontSize: '1.1rem',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {professionalTypes.find(type => type.id === selectedModel.professionalType)?.icon}
                    <span>{selectedModel.displayName || selectedModel.professionalType}</span>
                  </div>
                  <div style={{ color: '#ccc' }}>
                    📍 {selectedModel.location || 'Location not specified'}
                  </div>
                </div>
              </div>

              <div style={{ color: '#ccc', lineHeight: '1.6' }}>
                <h3 style={{ color: 'white', marginBottom: '15px' }}>Professional Details</h3>
                
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
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {selectedModel.skills.map((skill, index) => (
                        <span key={index} style={{
                          padding: '4px 8px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          fontSize: '0.8rem'
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