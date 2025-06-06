import React, { useState, useEffect } from 'react';

const ModelProfilePage = ({ modelId, user, onBack, onConnect, onMessage }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Helper functions to handle schema mismatches
  const ensureArray = (value) => {
    if (Array.isArray(value)) return value;
    return [];
  };

  const ensureExperienceArray = (experience) => {
    if (Array.isArray(experience)) return experience;
    if (typeof experience === 'string' && experience.trim()) {
      return [{
        role: 'Experience',
        company: '',
        duration: '',
        description: experience,
        current: false
      }];
    }
    return [];
  };

  useEffect(() => {
    fetchModelProfile();
  }, [modelId]);

  const fetchModelProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/profile/model/${modelId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditData(data);
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - revert changes
      setEditData(profile);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the data for your existing backend structure
      const updateData = {
        // Basic info
        fullName: editData.fullName,
        headline: editData.headline,
        bio: editData.bio,
        location: editData.location,
        phone: editData.phone,
        website: editData.website,
        
        // Profile-specific data from ModelProfile schema
        dateOfBirth: editData.dateOfBirth,
        gender: editData.gender,
        nationality: editData.nationality,
        languages: ensureArray(editData.languages),
        height: editData.height,
        weight: editData.weight,
        bodyType: editData.bodyType,
        hairColor: editData.hairColor,
        eyeColor: editData.eyeColor,
        skinTone: editData.skinTone,
        experience: editData.experience,
        skills: ensureArray(editData.skills),
        specializations: ensureArray(editData.specializations),
        achievements: ensureArray(editData.achievements),
        socialMedia: editData.socialMedia || {},
        preferredLocations: ensureArray(editData.preferredLocations),
        preferredTypes: ensureArray(editData.preferredTypes),
        availability: editData.availability,
        rate: editData.rate || {}
      };

      const response = await fetch('http://localhost:8001/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setProfile(data);
        setEditData(data);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  // Profile Picture Upload - FIXED
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Profile picture file selected:', file.name);
    setUploading(true);
    
    const formData = new FormData();
    formData.append('profilePicture', file); // ✅ Correct field name

    try {
      const token = localStorage.getItem('token');
      console.log('Uploading profile picture...');
      
      const response = await fetch('http://localhost:8001/api/profile/picture', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData
        },
        body: formData
      });

      console.log('Upload response status:', response.status);
      const data = await response.json();
      console.log('Upload response data:', data);

      if (response.ok && data.success) {
        const updatedProfile = { ...profile, profilePicture: data.profilePicture };
        setProfile(updatedProfile);
        setEditData(updatedProfile);
        alert('Profile picture updated successfully!');
      } else {
        alert(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  // Cover Photo Upload - FIXED
  const handleCoverPhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Cover photo file selected:', file.name);
    setUploading(true);
    
    const formData = new FormData();
    formData.append('profilePicture', file); // ✅ Using profilePicture field name (same middleware)

    try {
      const token = localStorage.getItem('token');
      console.log('Uploading cover photo...');
      
      const response = await fetch('http://localhost:8001/api/profile/cover-photo', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData
        },
        body: formData
      });

      console.log('Cover upload response status:', response.status);
      const data = await response.json();
      console.log('Cover upload response data:', data);

      if (response.ok && data.success) {
        const updatedProfile = { ...profile, coverPhoto: data.coverPhoto };
        setProfile(updatedProfile);
        setEditData(updatedProfile);
        alert('Cover photo updated successfully!');
      } else {
        alert(data.message || 'Failed to upload cover photo');
      }
    } catch (error) {
      console.error('Cover photo upload error:', error);
      alert('Failed to upload cover photo');
    } finally {
      setUploading(false);
    }
  };

  // Portfolio Photos Upload - FIXED
  const handlePortfolioPhotosUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    console.log('Portfolio photos selected:', files.length, 'files');
    setUploading(true);
    
    const formData = new FormData();
    files.forEach(file => formData.append('portfolioPhotos', file)); // ✅ Correct field name

    try {
      const token = localStorage.getItem('token');
      console.log('Uploading portfolio photos...');
      
      const response = await fetch('http://localhost:8001/api/profile/photos', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData
        },
        body: formData
      });

      console.log('Portfolio upload response status:', response.status);
      const data = await response.json();
      console.log('Portfolio upload response data:', data);

      if (response.ok && data.success) {
        const updatedPhotos = [...(ensureArray(profile.photos)), ...data.photos];
        const updatedProfile = { ...profile, photos: updatedPhotos };
        setProfile(updatedProfile);
        setEditData(updatedProfile);
        alert(`${files.length} photos uploaded successfully!`);
      } else {
        alert(data.message || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Portfolio photos upload error:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  // Remove Portfolio Photo
  const removePortfolioPhoto = async (photoIndex) => {
    const profilePhotos = ensureArray(profile.photos);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/profile/photos/${photoIndex}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedPhotos = profilePhotos.filter((_, index) => index !== photoIndex);
        const updatedProfile = { ...profile, photos: updatedPhotos };
        setProfile(updatedProfile);
        setEditData(updatedProfile);
      }
    } catch (error) {
      alert('Failed to remove photo');
    }
  };

  // Add Experience
  const addExperience = () => {
    const newExperience = {
      role: '',
      company: '',
      duration: '',
      description: '',
      current: false
    };
    const currentExperience = ensureExperienceArray(editData.experience);
    const updatedExperience = [...currentExperience, newExperience];
    setEditData({ ...editData, experience: updatedExperience });
  };

  // Update Experience
  const updateExperience = (index, field, value) => {
    const currentExperience = ensureExperienceArray(editData.experience);
    const updatedExperience = currentExperience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    setEditData({ ...editData, experience: updatedExperience });
  };

  // Remove Experience
  const removeExperience = (index) => {
    const currentExperience = ensureExperienceArray(editData.experience);
    const updatedExperience = currentExperience.filter((_, i) => i !== index);
    setEditData({ ...editData, experience: updatedExperience });
  };

  // Inline styles for consistent formatting
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '20px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '25px',
      marginBottom: '20px'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    primaryButton: {
      background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
      color: 'white'
    },
    secondaryButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', color: 'white', fontSize: '18px', marginTop: '50px' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p style={{ color: '#ff6b6b', marginBottom: '20px' }}>{error}</p>
          <button onClick={onBack} style={{ ...styles.button, ...styles.secondaryButton }}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayPhotos = showAllPhotos ? ensureArray(profile.photos) : ensureArray(profile.photos).slice(0, 8);
  const isOwnProfile = user && user._id === profile.userId;
  const currentProfile = isEditing ? editData : profile;

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={styles.header}>
          <button 
            onClick={onBack}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            ← Back
          </button>
          <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>
            {isEditing ? 'Edit Profile' : 'Model Profile'}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isOwnProfile && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      style={{ ...styles.button, ...styles.primaryButton }}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleEditToggle}
                      style={{ ...styles.button, ...styles.secondaryButton }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    style={{ ...styles.button, ...styles.primaryButton }}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Cover Photo Section */}
        <div style={{ position: 'relative', marginBottom: '80px' }}>
          <div style={{
            height: '200px',
            background: currentProfile.coverPhoto 
              ? `url(http://localhost:8001${currentProfile.coverPhoto}) center/cover`
              : 'linear-gradient(45deg, #667eea, #764ba2)',
            borderRadius: '15px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {!currentProfile.coverPhoto && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'white',
                fontSize: '18px'
              }}>
                No cover photo
              </div>
            )}
            
            {isEditing && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <input
                  type="file"
                  id="coverPhoto"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <label
                  htmlFor="coverPhoto"
                  style={{
                    ...styles.button,
                    background: 'white',
                    color: '#333',
                    cursor: 'pointer'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Change Cover Photo'}
                </label>
              </div>
            )}
          </div>
          
          {/* Profile Picture */}
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            left: '25px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '4px solid white',
            overflow: 'hidden',
            background: '#f0f0f0'
          }}>
            {currentProfile.profilePicture ? (
              <img 
                src={`http://localhost:8001${currentProfile.profilePicture}`}
                alt={currentProfile.fullName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: '#999'
              }}>
                👤
              </div>
            )}
            
            {isEditing && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <label
                  htmlFor="profilePicture"
                  style={{
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {uploading ? '...' : '📷'}
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Profile Header */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input
                    type="text"
                    value={editData.fullName || ''}
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    style={{ ...styles.input, fontSize: '24px', fontWeight: 'bold' }}
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    value={editData.headline || ''}
                    onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                    style={{ ...styles.input, fontSize: '18px' }}
                    placeholder="Professional Headline"
                  />
                  <input
                    type="text"
                    value={editData.location || ''}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    style={styles.input}
                    placeholder="📍 Location"
                  />
                </div>
              ) : (
                <>
                  <h1 style={{ color: 'white', fontSize: '2rem', margin: '0 0 10px 0' }}>
                    {currentProfile.fullName}
                  </h1>
                  <p style={{ color: '#ddd', fontSize: '1.2rem', margin: '0 0 15px 0' }}>
                    {currentProfile.headline || 'Professional Model'}
                  </p>
                  <div style={{ color: '#ccc', fontSize: '14px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <span>📍 {currentProfile.location}</span>
                    <span>👥 {currentProfile.connectionsCount || 0} connections</span>
                    {currentProfile.verified && <span style={{ color: '#4CAF50' }}>✓ Verified</span>}
                  </div>
                </>
              )}
            </div>
            
            {!isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={onConnect}
                  style={{ ...styles.button, ...styles.primaryButton }}
                >
                  Connect
                </button>
                <button 
                  onClick={onMessage}
                  style={{ ...styles.button, ...styles.secondaryButton }}
                >
                  Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Left Column */}
          <div>
            {/* About Section */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>About</h2>
              {isEditing ? (
                <textarea
                  value={editData.bio || editData.experience || ''}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
                  placeholder="Tell the world about yourself..."
                />
              ) : (
                <p style={{ color: '#ddd', lineHeight: '1.6' }}>
                  {currentProfile.bio || currentProfile.experience || 'No bio available'}
                </p>
              )}
            </div>

            {/* Experience Section */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>Experience</h2>
                {isEditing && (
                  <button
                    onClick={addExperience}
                    style={{ ...styles.button, ...styles.primaryButton, fontSize: '12px' }}
                  >
                    + Add Experience
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {ensureExperienceArray(currentProfile.experience).map((exp, index) => (
                  <div key={index} style={{
                    borderLeft: '3px solid #4CAF50',
                    paddingLeft: '15px',
                    position: 'relative'
                  }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                              type="text"
                              value={exp.role || ''}
                              onChange={(e) => updateExperience(index, 'role', e.target.value)}
                              style={styles.input}
                              placeholder="Job Title"
                            />
                            <input
                              type="text"
                              value={exp.company || ''}
                              onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              style={styles.input}
                              placeholder="Company Name"
                            />
                            <input
                              type="text"
                              value={exp.duration || ''}
                              onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                              style={styles.input}
                              placeholder="Duration (e.g., Jan 2020 - Present)"
                            />
                            <textarea
                              value={exp.description || ''}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
                              placeholder="Description..."
                            />
                          </div>
                          <button
                            onClick={() => removeExperience(index)}
                            style={{
                              marginLeft: '10px',
                              background: 'none',
                              border: 'none',
                              color: '#ff6b6b',
                              cursor: 'pointer',
                              fontSize: '18px'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 style={{ color: 'white', fontSize: '16px', margin: '0 0 5px 0' }}>
                          {exp.role || 'Experience'}
                        </h3>
                        {exp.company && <p style={{ color: '#ddd', margin: '0 0 5px 0' }}>{exp.company}</p>}
                        {exp.duration && <p style={{ color: '#ccc', fontSize: '14px', margin: '0 0 10px 0' }}>{exp.duration}</p>}
                        {exp.description && <p style={{ color: '#ddd', lineHeight: '1.5' }}>{exp.description}</p>}
                      </>
                    )}
                  </div>
                ))} 
              </div>
            </div>

            {/* Portfolio Photos */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>Portfolio</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {isEditing && (
                    <div>
                      <input
                        type="file"
                        id="portfolioPhotos"
                        accept="image/*"
                        multiple
                        onChange={handlePortfolioPhotosUpload}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                      <label
                        htmlFor="portfolioPhotos"
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'inline-block'
                        }}
                      >
                        {uploading ? 'Uploading...' : '+ Add Photos'}
                      </label>
                    </div>
                  )}
                  {ensureArray(profile.photos).length > 8 && (
                    <button 
                      onClick={() => setShowAllPhotos(!showAllPhotos)}
                      style={{ ...styles.button, ...styles.secondaryButton, fontSize: '12px' }}
                    >
                      {showAllPhotos ? 'Show Less' : `View All ${ensureArray(profile.photos).length} Photos`}
                    </button>
                  )}
                </div>
              </div>
              
              {displayPhotos.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '15px'
                }}>
                  {displayPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      style={{
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: !isEditing ? 'pointer' : 'default',
                        position: 'relative'
                      }}
                      onClick={() => !isEditing && setActivePhotoIndex(index)}
                    >
                      <img 
                        src={`http://localhost:8001${typeof photo === 'string' ? photo : photo.url}`}
                        alt={typeof photo === 'object' ? photo.caption : `Portfolio ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'opacity 0.3s ease'
                        }}
                      />
                      {isEditing && (
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removePortfolioPhoto(index);
                            }}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#ff4444',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#ddd' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📸</div>
                  <p>No portfolio photos yet</p>
                  {isEditing && (
                    <div style={{ marginTop: '20px' }}>
                      <input
                        type="file"
                        id="firstPortfolioPhotos"
                        accept="image/*"
                        multiple
                        onChange={handlePortfolioPhotosUpload}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                      <label
                        htmlFor="firstPortfolioPhotos"
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          cursor: 'pointer',
                          display: 'inline-block'
                        }}
                      >
                        {uploading ? 'Uploading...' : 'Upload Your First Photos'}
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Contact Info */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>Contact</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {isEditing ? (
                  <>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      style={styles.input}
                      placeholder="✉️ Email"
                    />
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      style={styles.input}
                      placeholder="📞 Phone"
                    />
                    <input
                      type="url"
                      value={editData.website || ''}
                      onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                      style={styles.input}
                      placeholder="🌐 Website"
                    />
                  </>
                ) : (
                  <>
                    {currentProfile.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#ccc' }}>✉️</span>
                        <span style={{ color: 'white' }}>{currentProfile.email}</span>
                      </div>
                    )}
                    {currentProfile.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#ccc' }}>📞</span>
                        <span style={{ color: 'white' }}>{currentProfile.phone}</span>
                      </div>
                    )}
                    {currentProfile.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#ccc' }}>🌐</span>
                        <a href={currentProfile.website} target="_blank" rel="noopener noreferrer" 
                           style={{ color: '#4CAF50', textDecoration: 'none' }}>
                          {currentProfile.website}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Physical Attributes */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>Physical Attributes</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.height || ''}
                    onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                    style={styles.input}
                    placeholder="Height"
                  />
                  <input
                    type="text"
                    value={editData.weight || ''}
                    onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                    style={styles.input}
                    placeholder="Weight"
                  />
                  <select
                    value={editData.bodyType || ''}
                    onChange={(e) => setEditData({ ...editData, bodyType: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Select Body Type</option>
                    <option value="athletic">Athletic</option>
                    <option value="slim">Slim</option>
                    <option value="average">Average</option>
                    <option value="muscular">Muscular</option>
                    <option value="curvy">Curvy</option>
                  </select>
                  <input
                    type="text"
                    value={editData.hairColor || ''}
                    onChange={(e) => setEditData({ ...editData, hairColor: e.target.value })}
                    style={styles.input}
                    placeholder="Hair Color"
                  />
                  <input
                    type="text"
                    value={editData.eyeColor || ''}
                    onChange={(e) => setEditData({ ...editData, eyeColor: e.target.value })}
                    style={styles.input}
                    placeholder="Eye Color"
                  />
                  <input
                    type="text"
                    value={editData.skinTone || ''}
                    onChange={(e) => setEditData({ ...editData, skinTone: e.target.value })}
                    style={styles.input}
                    placeholder="Skin Tone"
                  />
                </div>
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong style={{ color: 'white' }}>Height:</strong> {currentProfile.height || 'Not specified'}</div>
                  <div><strong style={{ color: 'white' }}>Weight:</strong> {currentProfile.weight || 'Not specified'}</div>
                  <div><strong style={{ color: 'white' }}>Body Type:</strong> {currentProfile.bodyType || 'Not specified'}</div>
                  <div><strong style={{ color: 'white' }}>Hair Color:</strong> {currentProfile.hairColor || 'Not specified'}</div>
                  <div><strong style={{ color: 'white' }}>Eye Color:</strong> {currentProfile.eyeColor || 'Not specified'}</div>
                  <div><strong style={{ color: 'white' }}>Skin Tone:</strong> {currentProfile.skinTone || 'Not specified'}</div>
                </div>
              )}
            </div>

            {/* Skills */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>Skills</h2>
              {isEditing ? (
                <textarea
                  value={ensureArray(editData.skills).join(', ')}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Enter skills separated by commas (e.g., Fashion Modeling, Commercial Photography, Runway)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ensureArray(currentProfile.skills).map((skill, index) => (
                    <span 
                      key={index}
                      style={{
                        background: 'rgba(76, 175, 80, 0.2)',
                        color: '#81C784',
                        padding: '6px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        border: '1px solid rgba(76, 175, 80, 0.3)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {ensureArray(currentProfile.skills).length === 0 && (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>No skills specified</span>
                  )}
                </div>
              )}
            </div>

            {/* Social Media */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>Social Media</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.socialMedia?.instagram || ''}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      socialMedia: { ...editData.socialMedia, instagram: e.target.value }
                    })}
                    style={styles.input}
                    placeholder="📷 Instagram (@username or URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.tiktok || ''}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      socialMedia: { ...editData.socialMedia, tiktok: e.target.value }
                    })}
                    style={styles.input}
                    placeholder="🎵 TikTok (@username or URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.youtube || ''}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      socialMedia: { ...editData.socialMedia, youtube: e.target.value }
                    })}
                    style={styles.input}
                    placeholder="🎥 YouTube (Channel URL)"
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentProfile.socialMedia?.instagram && (
                    <a
                      href={
                        currentProfile.socialMedia.instagram.startsWith('http')
                          ? currentProfile.socialMedia.instagram
                          : `https://instagram.com/${currentProfile.socialMedia.instagram.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#E4405F',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>📷</span>
                      <span>Instagram</span>
                    </a>
                  )}
                  {currentProfile.socialMedia?.tiktok && (
                    <a
                      href={
                        currentProfile.socialMedia.tiktok.startsWith('http')
                          ? currentProfile.socialMedia.tiktok
                          : `https://tiktok.com/@${currentProfile.socialMedia.tiktok.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#333',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>🎵</span>
                      <span>TikTok</span>
                    </a>
                  )}
                  {currentProfile.socialMedia?.youtube && (
                    <a
                      href={currentProfile.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#FF0000',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>🎥</span>
                      <span>YouTube</span>
                    </a>
                  )}
                  {(!currentProfile.socialMedia || 
                    (!currentProfile.socialMedia.instagram && 
                     !currentProfile.socialMedia.tiktok && 
                     !currentProfile.socialMedia.youtube)) && (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>No social media links</span>
                  )}
                </div>
              )}
            </div>

            {/* Availability & Rates */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>Availability & Rates</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select
                    value={editData.availability || ''}
                    onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Select Availability</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="freelance">Freelance</option>
                    <option value="weekends-only">Weekends Only</option>
                  </select>
                  <input
                    type="number"
                    value={editData.rate?.hourly || ''}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      rate: { ...editData.rate, hourly: e.target.value }
                    })}
                    style={styles.input}
                    placeholder="Hourly Rate (USD)"
                  />
                  <input
                    type="number"
                    value={editData.rate?.daily || ''}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      rate: { ...editData.rate, daily: e.target.value }
                    })}
                    style={styles.input}
                    placeholder="Daily Rate (USD)"
                  />
                </div>
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong style={{ color: 'white' }}>Availability:</strong> {currentProfile.availability || 'Not specified'}</div>
                  <div><strong style={{ color: 'white' }}>Hourly Rate:</strong> ${currentProfile.rate?.hourly || 'Not set'}</div>
                  <div><strong style={{ color: 'white' }}>Daily Rate:</strong> ${currentProfile.rate?.daily || 'Not set'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {activePhotoIndex !== null && ensureArray(profile.photos).length > 0 && !isEditing && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setActivePhotoIndex(null)}
        >
          <div style={{ maxWidth: '90vw', maxHeight: '90vh', padding: '20px' }}>
            <img 
              src={`http://localhost:8001${typeof ensureArray(profile.photos)[activePhotoIndex] === 'string' 
                ? ensureArray(profile.photos)[activePhotoIndex] 
                : ensureArray(profile.photos)[activePhotoIndex]?.url}`}
              alt={typeof ensureArray(profile.photos)[activePhotoIndex] === 'object' 
                ? ensureArray(profile.photos)[activePhotoIndex]?.caption 
                : `Portfolio ${activePhotoIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelProfilePage;
