import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionRequestModal from '../connections/ConnectionRequestModal';

const TalentSearch = () => {
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
    { id: 'designer', label: 'Fashion Designer', icon: '✂️' },
    { id: 'photographer', label: 'Photographer', icon: '📸' },
    { id: 'stylist', label: 'Stylist', icon: '👔' },
    { id: 'makeup-artist', label: 'Makeup Artist', icon: '💄' },
    { id: 'hairstylist', label: 'Hair Stylist', icon: '💇' }
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

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/talent/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(searchParams)
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data);
      } else {
        console.error('Search failed:', data.message);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
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
      } else if (type === 'skills') {
        const newSkills = new Set(prev.selectedSkills);
        if (newSkills.has(value)) {
          newSkills.delete(value);
        } else {
          newSkills.add(value);
        }
        newFilters.selectedSkills = newSkills;
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
      } else {
        const data = await response.json();
        console.error('Connection request failed:', data.message);
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
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
      border: '1px solid #ddd',
      fontSize: '16px'
    },
    filterButton: {
      padding: '12px 20px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      background: '#fff',
      cursor: 'pointer'
    },
    searchButton: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      background: '#007bff',
      color: 'white',
      cursor: 'pointer'
    },
    filtersPanel: {
      background: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    },
    filterSection: {
      marginBottom: '20px'
    },
    filterTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px'
    },
    filterOptions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px'
    },
    filterOption: {
      padding: '8px 16px',
      borderRadius: '20px',
      border: '1px solid #ddd',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    selectedOption: {
      background: '#007bff',
      color: 'white',
      borderColor: '#007bff'
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px'
    },
    resultCard: {
      background: '#fff',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
      objectFit: 'cover'
    },
    profileInfo: {
      flex: 1
    },
    name: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: 0
    },
    title: {
      color: '#666',
      margin: '5px 0'
    },
    location: {
      color: '#888',
      fontSize: '14px'
    },
    skills: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '5px',
      marginTop: '10px'
    },
    skill: {
      background: '#f0f0f0',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px'
    },
    connectButton: {
      width: '100%',
      padding: '8px',
      marginTop: '15px',
      borderRadius: '4px',
      border: '1px solid #007bff',
      background: 'transparent',
      color: '#007bff',
      cursor: 'pointer'
    }
  };

  const renderResultCard = (profile) => {
    const status = connectionStatus[profile._id];
    let buttonText = 'Connect';
    let buttonStyle = { ...styles.connectButton };

    if (status === 'pending') {
      buttonText = 'Request Sent';
      buttonStyle = {
        ...buttonStyle,
        background: '#f0f0f0',
        color: '#666',
        cursor: 'default'
      };
    } else if (status === 'connected') {
      buttonText = 'Connected';
      buttonStyle = {
        ...buttonStyle,
        background: '#4CAF50',
        color: 'white',
        cursor: 'default'
      };
    }

    return (
      <div key={profile._id} style={styles.resultCard}>
        <div style={styles.profileHeader}>
          <img
            src={profile.profilePicture || '/default-avatar.png'}
            alt={profile.fullName}
            style={styles.profileImage}
          />
          <div style={styles.profileInfo}>
            <h3 style={styles.name}>{profile.fullName}</h3>
            <div style={styles.title}>{profile.headline}</div>
            <div style={styles.location}>{profile.location}</div>
          </div>
        </div>
        <div style={styles.skills}>
          {profile.skills?.slice(0, 3).map(skill => (
            <span key={skill} style={styles.skill}>{skill}</span>
          ))}
          {profile.skills?.length > 3 && (
            <span style={styles.skill}>+{profile.skills.length - 3} more</span>
          )}
        </div>
        <button
          style={buttonStyle}
          onClick={() => handleConnect(profile)}
          disabled={status === 'pending' || status === 'connected'}
        >
          {buttonText}
        </button>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by name, skills, or location..."
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

      <div style={styles.resultsGrid}>
        {results.map(renderResultCard)}
      </div>

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