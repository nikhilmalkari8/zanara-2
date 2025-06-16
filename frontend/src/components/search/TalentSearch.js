import React, { useState, useEffect } from 'react';
import ConnectionRequestModal from '../connections/ConnectionRequestModal';

const TalentSearch = ({ user, onLogout, setCurrentPage, onViewProfile }) => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    professionalTypes: [],
    location: '',
    experienceLevel: '',
    skills: []
  });

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    showFilters: false,
    selectedTypes: new Set(),
    selectedSkills: new Set()
  });

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});

  const professionalTypes = [
    { id: 'model', label: 'Model', icon: '👗' },
    { id: 'fashion-designer', label: 'Fashion Designer', icon: '✂️' },
    { id: 'photographer', label: 'Photographer', icon: '📸' },
    { id: 'stylist', label: 'Stylist', icon: '👔' },
    { id: 'makeup-artist', label: 'Makeup Artist', icon: '💄' },
    { id: 'brand', label: 'Brand', icon: '🏢' },
    { id: 'agency', label: 'Agency', icon: '🎭' }
  ];

  const experienceLevels = [
    'Entry Level',
    'Intermediate',
    'Experienced',
    'Expert'
  ];

  const commonSkills = [
    'Fashion Photography',
    'Portrait Photography',
    'Commercial Photography',
    'Fashion Design',
    'Pattern Making',
    'Runway Modeling',
    'Commercial Modeling',
    'Editorial Modeling',
    'Fashion Styling',
    'Personal Styling',
    'Makeup Artistry',
    'Hair Styling'
  ];

  // Load all profiles on component mount
  useEffect(() => {
    loadAllProfiles();
  }, []);

  // Check connection status when results change
  useEffect(() => {
    if (results.length > 0) {
      checkAllConnectionStatuses();
    }
  }, [results]);

  const loadAllProfiles = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Get all professional types
      const allResults = [];
      
      for (const profType of professionalTypes) {
        try {
          const response = await fetch(`http://localhost:8001/api/professional-profile/browse/${profType.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              // Add professional type to each profile
              const profilesWithType = data.map(profile => ({
                ...profile,
                professionalType: profType.id
              }));
              allResults.push(...profilesWithType);
            }
          }
        } catch (error) {
          console.error(`Error loading ${profType.id} profiles:`, error);
        }
      }

      console.log('Loaded profiles:', allResults);
      setResults(allResults);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchParams.query.trim() && filters.selectedTypes.size === 0) {
      // If no search criteria, load all profiles
      loadAllProfiles();
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Filter results based on search criteria
      let filteredResults = results;

      // Filter by name/query
      if (searchParams.query.trim()) {
        const query = searchParams.query.toLowerCase();
        filteredResults = filteredResults.filter(profile => 
          profile.fullName?.toLowerCase().includes(query) ||
          profile.headline?.toLowerCase().includes(query) ||
          profile.location?.toLowerCase().includes(query) ||
          profile.skills?.some(skill => skill.toLowerCase().includes(query))
        );
      }

      // Filter by professional types
      if (filters.selectedTypes.size > 0) {
        filteredResults = filteredResults.filter(profile => 
          filters.selectedTypes.has(profile.professionalType)
        );
      }

      // Filter by experience level
      if (searchParams.experienceLevel) {
        filteredResults = filteredResults.filter(profile => 
          profile.experienceLevel === searchParams.experienceLevel
        );
      }

      // Filter by skills
      if (filters.selectedSkills.size > 0) {
        filteredResults = filteredResults.filter(profile => 
          profile.skills?.some(skill => filters.selectedSkills.has(skill))
        );
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnectionStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/connections/status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.status || 'none';
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
    return 'none';
  };

  const checkAllConnectionStatuses = async () => {
    const statuses = {};
    for (const profile of results) {
      if (profile._id) {
        const status = await checkConnectionStatus(profile._id);
        statuses[profile._id] = status;
      }
    }
    setConnectionStatus(statuses);
  };

  const handleFilterToggle = (type, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (type === 'professionalTypes') {
        const newTypes = new Set(prev.selectedTypes);
        if (newTypes.has(value)) {
          newTypes.delete(value);
        } else {
          newTypes.add(value);
        }
        newFilters.selectedTypes = newTypes;
        
        // Update searchParams
        setSearchParams(prevParams => ({
          ...prevParams,
          professionalTypes: Array.from(newTypes)
        }));
      } else if (type === 'skills') {
        const newSkills = new Set(prev.selectedSkills);
        if (newSkills.has(value)) {
          newSkills.delete(value);
        } else {
          newSkills.add(value);
        }
        newFilters.selectedSkills = newSkills;
        
        // Update searchParams
        setSearchParams(prevParams => ({
          ...prevParams,
          skills: Array.from(newSkills)
        }));
      }
      return newFilters;
    });
  };

  const handleConnect = (profile) => {
    setSelectedProfile(profile);
    setIsConnectionModalOpen(true);
  };

  const handleSendConnectionRequest = async (message) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedProfile._id,
          message,
          receiverType: selectedProfile.professionalType
        })
      });

      if (response.ok) {
        setConnectionStatus(prev => ({
          ...prev,
          [selectedProfile._id]: 'pending'
        }));
        setIsConnectionModalOpen(false);
        alert('Connection request sent successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Error sending connection request');
    }
  };

  const handleViewProfile = (profile) => {
    if (onViewProfile) {
      onViewProfile(profile._id);
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    searchBar: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px'
    },
    input: {
      flex: 1,
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none'
    },
    filterButton: {
      padding: '12px 20px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      cursor: 'pointer'
    },
    searchButton: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      background: '#4CAF50',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    filtersPanel: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      padding: '20px',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: '20px'
    },
    filterSection: {
      marginBottom: '20px'
    },
    filterTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: 'white'
    },
    filterOptions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px'
    },
    filterOption: {
      padding: '8px 16px',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      transition: 'all 0.3s ease'
    },
    selectedOption: {
      background: '#4CAF50',
      borderColor: '#4CAF50'
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px'
    },
    resultCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '20px',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '15px'
    },
    profileImage: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid rgba(255, 255, 255, 0.3)'
    },
    profileInfo: {
      flex: 1
    },
    name: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: 0,
      color: 'white'
    },
    title: {
      color: '#ddd',
      margin: '5px 0',
      fontSize: '14px'
    },
    location: {
      color: '#ccc',
      fontSize: '12px'
    },
    skills: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '5px',
      marginTop: '10px',
      marginBottom: '15px'
    },
    skill: {
      background: 'rgba(76, 175, 80, 0.2)',
      color: '#81C784',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      border: '1px solid rgba(76, 175, 80, 0.3)'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px'
    },
    connectButton: {
      flex: 1,
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      background: '#4CAF50',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    disabledButton: {
      background: '#666',
      cursor: 'default'
    },
    viewButton: {
      flex: 1,
      padding: '8px 16px',
      borderRadius: '6px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '40px',
      color: 'white'
    },
    noResults: {
      textAlign: 'center',
      padding: '40px',
      color: 'white',
      fontSize: '18px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    pageTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 10px 0'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#ddd',
      margin: 0
    }
  };

  const renderResultCard = (profile) => {
    const status = connectionStatus[profile._id] || 'none';
    const isOwnProfile = user && (user._id === profile._id || user.id === profile._id);
    
    let buttonText = 'Connect';
    let buttonDisabled = false;
    let buttonStyle = { ...styles.connectButton };

    if (isOwnProfile) {
      buttonText = 'Your Profile';
      buttonDisabled = true;
      buttonStyle = { ...styles.connectButton, ...styles.disabledButton };
    } else if (status === 'pending') {
      buttonText = 'Request Sent';
      buttonDisabled = true;
      buttonStyle = { ...styles.connectButton, ...styles.disabledButton };
    } else if (status === 'connected') {
      buttonText = 'Connected';
      buttonDisabled = true;
      buttonStyle = { ...styles.connectButton, ...styles.disabledButton };
    }

    return (
      <div 
        key={profile._id} 
        style={styles.resultCard}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={styles.profileHeader}>
          <img
            src={profile.profilePicture ? 
              `http://localhost:8001${profile.profilePicture}` : 
              '/default-avatar.png'
            }
            alt={profile.fullName}
            style={styles.profileImage}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNkZGQiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeD0iMTgiIHk9IjE4Ij4KPHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIgZmlsbD0iIzk5OSIvPgo8L3N2Zz4KPC9zdmc+';
            }}
          />
          <div style={styles.profileInfo}>
            <h3 style={styles.name}>{profile.fullName || 'Name not available'}</h3>
            <div style={styles.title}>
              {profile.headline || `${profile.professionalType?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}`}
            </div>
            <div style={styles.location}>
              📍 {profile.location || 'Location not specified'}
            </div>
          </div>
        </div>
        
        <div style={styles.skills}>
          {profile.skills?.slice(0, 3).map((skill, index) => (
            <span key={index} style={styles.skill}>{skill}</span>
          ))}
          {profile.skills?.length > 3 && (
            <span style={styles.skill}>+{profile.skills.length - 3} more</span>
          )}
          {(!profile.skills || profile.skills.length === 0) && (
            <span style={{ ...styles.skill, background: 'rgba(255,255,255,0.1)' }}>
              No skills listed
            </span>
          )}
        </div>

        <div style={styles.buttonGroup}>
          <button
            style={buttonStyle}
            onClick={(e) => {
              e.stopPropagation();
              if (!buttonDisabled && !isOwnProfile) {
                handleConnect(profile);
              }
            }}
            disabled={buttonDisabled}
          >
            {buttonText}
          </button>
          <button
            style={styles.viewButton}
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile(profile);
            }}
          >
            View Profile
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>🔍 Talent Search</h1>
        <p style={styles.subtitle}>Discover amazing fashion professionals</p>
      </div>

      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by name, skills, location..."
          style={styles.input}
          value={searchParams.query}
          onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
        />
        <button
          style={styles.filterButton}
          onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
        >
          Filters {filters.showFilters ? '▲' : '▼'}
        </button>
        <button
          style={styles.searchButton}
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {filters.showFilters && (
        <div style={styles.filtersPanel}>
          <div style={styles.filterSection}>
            <div style={styles.filterTitle}>Professional Type</div>
            <div style={styles.filterOptions}>
              {professionalTypes.map(type => (
                <div
                  key={type.id}
                  style={{
                    ...styles.filterOption,
                    ...(filters.selectedTypes.has(type.id) ? styles.selectedOption : {})
                  }}
                  onClick={() => handleFilterToggle('professionalTypes', type.id)}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.filterSection}>
            <div style={styles.filterTitle}>Experience Level</div>
            <select
              style={styles.input}
              value={searchParams.experienceLevel}
              onChange={(e) => setSearchParams(prev => ({ ...prev, experienceLevel: e.target.value }))}
            >
              <option value="">Any Level</option>
              {experienceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterSection}>
            <div style={styles.filterTitle}>Skills</div>
            <div style={styles.filterOptions}>
              {commonSkills.map(skill => (
                <div
                  key={skill}
                  style={{
                    ...styles.filterOption,
                    ...(filters.selectedSkills.has(skill) ? styles.selectedOption : {})
                  }}
                  onClick={() => handleFilterToggle('skills', skill)}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={styles.loadingContainer}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔍</div>
          <div>Searching for talent...</div>
        </div>
      ) : results.length === 0 ? (
        <div style={styles.noResults}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>👤</div>
          <div>No profiles found</div>
          <div style={{ fontSize: '14px', color: '#ccc', marginTop: '10px' }}>
            Try adjusting your search criteria
          </div>
        </div>
      ) : (
        <>
          <div style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
            Found {results.length} {results.length === 1 ? 'profile' : 'profiles'}
          </div>
          <div style={styles.resultsGrid}>
            {results.map(renderResultCard)}
          </div>
        </>
      )}

      {selectedProfile && (
        <ConnectionRequestModal
          isOpen={isConnectionModalOpen}
          onClose={() => setIsConnectionModalOpen(false)}
          profile={selectedProfile}
          onSendRequest={handleSendConnectionRequest}
        />
      )}
    </div>
  );
};

export default TalentSearch;