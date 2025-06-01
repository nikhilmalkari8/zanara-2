import React, { useState, useEffect, useCallback } from 'react';

const BrowseTalent = ({ user, onLogout, setCurrentPage }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    gender: 'all',
    location: '',
    bodyType: 'all',
    hairColor: '',
    eyeColor: '',
    experience: 'all',
    availability: 'all',
    skills: [],
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [savedTalent, setSavedTalent] = useState([]);

  // Constants for filter options
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
    { value: 'weekends-only', label: 'Weekends Only' }
  ];

  const skillOptions = [
    'Runway', 'Commercial', 'Editorial', 'Print', 'Swimwear', 'Lingerie',
    'Fitness', 'Plus Size', 'Petite', 'Acting', 'Dancing', 'Promotional',
    'Glamour', 'Hand Model', 'Body Parts', 'Fit Modeling', 'Art Modeling'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest Profiles' },
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'experience', label: 'Most Experienced' },
    { value: 'connections', label: 'Most Connected' }
  ];

  // Fetch models based on filters
  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      // Convert filters to query params
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage);
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.gender !== 'all') queryParams.append('gender', filters.gender);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.bodyType !== 'all') queryParams.append('bodyType', filters.bodyType);
      if (filters.hairColor) queryParams.append('hairColor', filters.hairColor);
      if (filters.eyeColor) queryParams.append('eyeColor', filters.eyeColor);
      if (filters.experience !== 'all') queryParams.append('experience', filters.experience);
      if (filters.availability !== 'all') queryParams.append('availability', filters.availability);
      if (filters.skills.length > 0) queryParams.append('skills', filters.skills.join(','));
      if (filters.ageMin) queryParams.append('ageMin', filters.ageMin);
      if (filters.ageMax) queryParams.append('ageMax', filters.ageMax);
      if (filters.heightMin) queryParams.append('heightMin', filters.heightMin);
      if (filters.heightMax) queryParams.append('heightMax', filters.heightMax);
      if (filters.sort) queryParams.append('sort', filters.sort);

      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8001/api/profile/browse?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
      setModels(data.models);
      setTotalPages(data.totalPages);
      
    } catch (error) {
      console.error('Error fetching models:', error);
      
      // For development/testing - mock data if API fails
      const mockData = {
        models: generateMockModels(20),
        totalPages: 5,
        currentPage: currentPage,
        total: 100
      };
      
      setModels(mockData.models);
      setTotalPages(mockData.totalPages);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  // Generate mock model data for development/testing
  const generateMockModels = (count) => {
    const mockModels = [];
    const cities = ['New York', 'Los Angeles', 'Miami', 'Paris', 'London', 'Milan', 'Tokyo', 'Sydney', 'Berlin', 'Toronto'];
    const firstNames = ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Liam', 'Noah', 'William', 'James', 'Oliver', 'Benjamin', 'Elijah', 'Lucas', 'Mason', 'Logan'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    const hairColors = ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Grey', 'White', 'Platinum', 'Blue', 'Pink'];
    const eyeColors = ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Amber'];
    const bodyTypes = ['Athletic', 'Slim', 'Average', 'Muscular', 'Curvy'];
    const heights = ['5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"', '5\'5"', '5\'6"', '5\'7"'];
    
    for (let i = 0; i < count; i++) {
      const gender = Math.random() > 0.5 ? 'female' : 'male';
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      mockModels.push({
        _id: `model-${i}`,
        userId: {
          _id: `user-${i}`,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
        },
        dateOfBirth: new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
        gender,
        height: heights[Math.floor(Math.random() * heights.length)],
        bodyType: bodyTypes[Math.floor(Math.random() * bodyTypes.length)].toLowerCase(),
        hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
        eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
        location: cities[Math.floor(Math.random() * cities.length)],
        experience: experienceOptions[Math.floor(Math.random() * (experienceOptions.length - 1)) + 1].value,
        skills: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => skillOptions[Math.floor(Math.random() * skillOptions.length)]),
        availability: availabilityOptions[Math.floor(Math.random() * (availabilityOptions.length - 1)) + 1].value,
        profileViews: Math.floor(Math.random() * 1000),
        completionPercentage: Math.floor(Math.random() * 40) + 60,
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString(), // Random time in the last week
        photos: [
          `https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${i % 100}.jpg`
        ]
      });
    }
    
    return mockModels;
  };

  useEffect(() => {
    fetchModels();
    // Load saved talent from localStorage
    const saved = JSON.parse(localStorage.getItem('savedTalent') || '[]');
    setSavedTalent(saved);
  }, [fetchModels]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchModels();
  };

  const handleSaveTalent = (modelId) => {
    setSavedTalent(prev => {
      const newSaved = prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId];
      
      // Save to localStorage
      localStorage.setItem('savedTalent', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const calculateAge = (dateOfBirth) => {
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
    const now = new Date();
    const lastActive = new Date(date);
    const diffInSeconds = Math.floor((now - lastActive) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      gender: 'all',
      location: '',
      bodyType: 'all',
      hairColor: '',
      eyeColor: '',
      experience: 'all',
      availability: 'all',
      skills: [],
      ageMin: '',
      ageMax: '',
      heightMin: '',
      heightMax: '',
      sort: 'newest'
    });
    setCurrentPageNum(1);
  };

  const openModelProfile = (model) => {
    setSelectedModel(model);
  };

  const closeModelProfile = () => {
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

  // Renders the talent list in grid view
  const renderGrid = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    }}>
      {models.map((model) => (
        <div
          key={model._id}
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
          onClick={() => openModelProfile(model)}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
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
              handleSaveTalent(model._id);
            }}
          >
            <span style={{ 
              fontSize: '18px',
              color: savedTalent.includes(model._id) ? '#ff6b6b' : 'white'
            }}>
              {savedTalent.includes(model._id) ? '❤️' : '🤍'}
            </span>
          </div>

          {/* Profile Image */}
          <div style={{
            height: '280px',
            backgroundImage: `url(${model.photos && model.photos.length > 0 ? model.photos[0] : 'https://via.placeholder.com/280x280?text=No+Photo'})`,
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
              {model.userId.firstName} {model.userId.lastName}
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
              {model.location || 'Location not specified'}
            </p>

            {/* Basic Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '15px'
            }}>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                <span style={{ color: '#999' }}>Age:</span> {calculateAge(model.dateOfBirth)}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                <span style={{ color: '#999' }}>Height:</span> {model.height}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                <span style={{ color: '#999' }}>Hair:</span> {model.hairColor}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                <span style={{ color: '#999' }}>Eyes:</span> {model.eyeColor}
              </div>
            </div>

            {/* Skills/Tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px',
              marginBottom: '15px'
            }}>
              {model.skills && model.skills.slice(0, 3).map((skill, index) => (
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
              {model.skills && model.skills.length > 3 && (
                <span style={{
                  padding: '4px 8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ccc',
                  borderRadius: '12px',
                  fontSize: '0.7rem'
                }}>
                  +{model.skills.length - 3} more
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
                Active {getTimeAgo(model.lastActive)}
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

  // Renders the talent list in list view
  const renderList = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      marginBottom: '30px'
    }}>
      {models.map((model) => (
        <div
          key={model._id}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '15px',
            display: 'flex',
            gap: '20px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onClick={() => openModelProfile(model)}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Profile Image */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '8px',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <img 
              src={model.photos && model.photos.length > 0 ? model.photos[0] : 'https://via.placeholder.com/100x100?text=No+Photo'} 
              alt={`${model.userId.firstName} ${model.userId.lastName}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Name and Location */}
              <div>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.1rem',
                  margin: '0 0 3px 0',
                  fontWeight: 'bold'
                }}>
                  {model.userId.firstName} {model.userId.lastName}
                </h3>
                <p style={{
                  color: '#ccc',
                  fontSize: '0.9rem',
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '5px' }}>📍</span> 
                  {model.location || 'Location not specified'}
                </p>
              </div>

              {/* Save Button */}
              <div 
                style={{
                  padding: '5px',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveTalent(model._id);
                }}
              >
                <span style={{ 
                  fontSize: '18px',
                  color: savedTalent.includes(model._id) ? '#ff6b6b' : 'white'
                }}>
                  {savedTalent.includes(model._id) ? '❤️' : '🤍'}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '10px',
              flexWrap: 'wrap'
            }}>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                <span style={{ color: '#999' }}>Age:</span> {calculateAge(model.dateOfBirth)}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                <span style={{ color: '#999' }}>Height:</span> {model.height}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                <span style={{ color: '#999' }}>Experience:</span> {model.experience}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                <span style={{ color: '#999' }}>Availability:</span> {model.availability.replace('-', ' ')}
              </div>
            </div>

            {/* Skills/Tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px',
              marginBottom: '5px'
            }}>
              {model.skills && model.skills.map((skill, index) => (
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
            </div>

            {/* Activity */}
            <div style={{ color: '#999', fontSize: '0.8rem', marginTop: '10px' }}>
              Active {getTimeAgo(model.lastActive)} • {model.profileViews} profile views
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Renders detailed profile view when a model is selected
  const renderModelProfile = () => {
    if (!selectedModel) return null;
    
    return (
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
          maxWidth: '1000px',
          maxHeight: '90vh',
          borderRadius: '15px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Close Button */}
          <button 
            onClick={closeModelProfile}
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

          {/* Profile Content Scrollable Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            maxHeight: '90vh'
          }}>
            {/* Header Section */}
            <div style={{
              position: 'relative',
              padding: '30px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '20px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)'
            }}>
              {/* Profile Image */}
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '15px',
                overflow: 'hidden',
                border: '3px solid white'
              }}>
                <img 
                  src={selectedModel.photos && selectedModel.photos.length > 0 ? selectedModel.photos[0] : 'https://via.placeholder.com/150x150?text=No+Photo'} 
                  alt={`${selectedModel.userId.firstName} ${selectedModel.userId.lastName}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Basic Info */}
              <div>
                <h2 style={{
                  color: 'white',
                  fontSize: '2rem',
                  margin: '0 0 5px 0',
                  fontWeight: 'bold'
                }}>
                  {selectedModel.userId.firstName} {selectedModel.userId.lastName}
                </h2>
                <p style={{
                  color: '#ddd',
                  fontSize: '1.1rem',
                  margin: '0 0 5px 0',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '5px' }}>📍</span> 
                  {selectedModel.location || 'Location not specified'}
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button style={{
                    padding: '8px 20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span>💬</span> Message
                  </button>
                  <button style={{
                    padding: '8px 20px',
                    background: savedTalent.includes(selectedModel._id) ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                    color: savedTalent.includes(selectedModel._id) ? '#ff6b6b' : 'white',
                    border: `1px solid ${savedTalent.includes(selectedModel._id) ? 'rgba(255, 107, 107, 0.7)' : 'rgba(255, 255, 255, 0.4)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveTalent(selectedModel._id);
                  }}
                  >
                    <span>{savedTalent.includes(selectedModel._id) ? '❤️' : '🤍'}</span>
                    {savedTalent.includes(selectedModel._id) ? 'Saved' : 'Save'}
                  </button>
                  <button style={{
                    padding: '8px 20px',
                    background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span>📝</span> Invite to Opportunity
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div style={{
              padding: '30px',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '30px'
            }}>
              {/* Left Column */}
              <div>
                {/* About Section */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '25px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>About</h3>
                  <p style={{ color: '#ccc', lineHeight: '1.6', margin: 0 }}>
                    {selectedModel.userId.firstName} is a {selectedModel.experience} model based in {selectedModel.location || 'their location'}. 
                    With a passion for fashion and visual storytelling, they bring creativity and professionalism to every project.
                  </p>
                </div>

                {/* Experience */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '25px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>Experience</h3>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '1rem' }}>Fashion Week {2020 + Math.floor(Math.random() * 5)}</h4>
                    <p style={{ color: '#999', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Runway Model</p>
                    <p style={{ color: '#ccc', fontSize: '0.9rem', margin: 0 }}>
                      Walked for multiple designers during Fashion Week.
                    </p>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '1rem' }}>Commercial Campaign</h4>
                    <p style={{ color: '#999', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Commercial Model</p>
                    <p style={{ color: '#ccc', fontSize: '0.9rem', margin: 0 }}>
                      Featured in print and digital advertisements for seasonal collection.
                    </p>
                  </div>
                  <div>
                    <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '1rem' }}>Editorial Shoot</h4>
                    <p style={{ color: '#999', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Editorial Model</p>
                    <p style={{ color: '#ccc', fontSize: '0.9rem', margin: 0 }}>
                      Featured in fashion spread for major publication.
                    </p>
                  </div>
                </div>

                {/* Portfolio Gallery */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '25px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>Portfolio</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '10px'
                  }}>
                    {Array.from({ length: 6 }, (_, i) => (
                      <div key={i} style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        aspectRatio: '3/4',
                        cursor: 'pointer'
                      }}>
                        <img 
                          src={`https://randomuser.me/api/portraits/${selectedModel.gender === 'female' ? 'women' : 'men'}/${(parseInt(selectedModel._id.slice(-2), 36) + i) % 100}.jpg`} 
                          alt="Portfolio" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Stats Card */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '25px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>Stats</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', color: '#4CAF50', fontWeight: 'bold' }}>{selectedModel.profileViews}</div>
                      <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Profile Views</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', color: '#2196F3', fontWeight: 'bold' }}>{Math.floor(Math.random() * 50)}</div>
                      <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Applications</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', color: '#FF9800', fontWeight: 'bold' }}>{Math.floor(Math.random() * 100)}</div>
                      <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Connections</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', color: '#E91E63', fontWeight: 'bold' }}>
                        {Math.floor(Math.random() * 5) + 1}.{Math.floor(Math.random() * 9)}
                      </div>
                      <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Rating</div>
                    </div>
                  </div>
                </div>

                {/* Details Card */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '25px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>Details</h3>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>Age:</span>{' '}
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>{calculateAge(selectedModel.dateOfBirth)}</span>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>Height:</span>{' '}
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>{selectedModel.height}</span>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>Body Type:</span>{' '}
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>{selectedModel.bodyType}</span>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>Hair Color:</span>{' '}
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>{selectedModel.hairColor}</span>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>Eye Color:</span>{' '}
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>{selectedModel.eyeColor}</span>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>Experience:</span>{' '}
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>
                      {selectedModel.experience.charAt(0).toUpperCase() + selectedModel.experience.slice(1)}
                    </span>
                  </div>
                  
                  <div>
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>Availability:</span>{' '}
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>
                      {selectedModel.availability.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>

                {/* Skills Card */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '25px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>Skills</h3>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {selectedModel.skills && selectedModel.skills.map((skill, index) => (
                      <span key={index} style={{
                        padding: '5px 12px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        borderRadius: '15px',
                        fontSize: '0.9rem'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Card */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '25px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>Contact</h3>
                  <button style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}>
                    <span>💼</span> Invite to Opportunity
                  </button>
                  <button style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span>💬</span> Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              Browse Talent 👤
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Discover and connect with professional models for your next project
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

      {/* Search and Filters */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search models by name, skills, or location..."
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
                type="submit"
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
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
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

                <div>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>
                    Experience
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
              </div>

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
                      placeholder="Min (e.g. 5'6\"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <span style={{ color: 'white' }}>-</span>
                    <input
                      type="text"
                      value={filters.heightMax}
                      onChange={(e) => handleFilterChange('heightMax', e.target.value)}
                      placeholder="Max (e.g. 6'0\"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '10px' }}>
                  Skills
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                  {skillOptions.map(skill => (
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

      {/* Results Section */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Results Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
            {loading ? 'Finding talent...' : `${models.length} Results`}
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
              Saved: {savedTalent.length}
            </div>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              style={{
                padding: '8px 30px 8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px top 50%',
                backgroundSize: '12px auto'
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
              No models match your search criteria
            </h3>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>
              Try adjusting your filters or search terms to find more talent.
            </p>
            <button
              onClick={resetFilters}
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
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Model List */}
            {viewMode === 'grid' ? renderGrid() : renderList()}

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

      {/* Model Profile Modal */}
      {selectedModel && renderModelProfile()}
    </div>
  );
};

export default BrowseTalent;