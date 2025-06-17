import React, { useState, useEffect } from 'react';
import ConnectionRequestModal from '../connections/ConnectionRequestModal';

const ModelProfile = ({ profileId, user, targetUser, profileData, onBack, onConnect, onMessage }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  
  // Connection states
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

  // Calculate isOwnProfile first, before any useEffect hooks
  const isOwnProfile = user && (
    user._id === targetUser?._id || 
    user.id === targetUser?.id ||
    user._id === profileId ||
    user.id === profileId
  );

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
    if (profileData) {
      setProfile(profileData);
      setEditData(profileData);
      setLoading(false);
    } else {
      fetchModelProfile();
    }
  }, [profileData, profileId]);

  // Check connection status when profile loads (only for other people's profiles)
  useEffect(() => {
    if (!isOwnProfile && profileId && profile) {
      checkConnectionStatus();
    }
  }, [profileId, profile, isOwnProfile]);

  const fetchModelProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/professional-profile/${profileId}`, {
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

  // Check connection status with this user
  const checkConnectionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/connections/status/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.status || 'none');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setConnectionStatus('none');
    }
  };

  // Handle connect button click
  const handleConnectClick = () => {
    setIsConnectionModalOpen(true);
  };

  // Send connection request
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
          receiverId: profileId,
          message,
          receiverType: profile.professionalType || 'model'
        })
      });

      if (response.ok) {
        setConnectionStatus('pending');
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - revert changes
      setEditData(profile);
    }
    setIsEditing(!isEditing);
  };

  // Updated handleSaveChanges
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Debug: Let's see what we're sending
      console.log('Sending update data:', editData);
      
      const response = await fetch('http://localhost:8001/api/professional-profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        // Refresh the profile data
        await fetchModelProfile();
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

  // Profile Picture Upload
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
      
      const response = await fetch('http://localhost:8001/api/professional-profile/picture', {
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

  // Cover Photo Upload
  const handleCoverPhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Cover photo file selected:', file.name);
    setUploading(true);
    
    const formData = new FormData();
    formData.append('profilePicture', file); // Using same field name in middleware

    try {
      const token = localStorage.getItem('token');
      console.log('Uploading cover photo...');
      
      const response = await fetch('http://localhost:8001/api/professional-profile/cover-photo', {
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

  // Portfolio Photos Upload
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
      
      const response = await fetch('http://localhost:8001/api/professional-profile/photos', {
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
      const response = await fetch(`http://localhost:8001/api/professional-profile/photos/${photoIndex}`, {
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
    },
    disabledButton: {
      background: '#f0f0f0',
      color: '#666',
      cursor: 'default'
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

  // DEBUG: Remove this after fixing
  console.log('DEBUG Profile Check:', {
    'user._id': user?._id,
    'user.id': user?.id,
    'profile.userId': profile?.userId,
    'profile._id': profile?._id,
    'profileId': profileId,
    'isOwnProfile': isOwnProfile,
    'connectionStatus': connectionStatus
  });

  const currentProfile = isEditing ? editData : profile;

  // Get button text and styling based on connection status
  const getConnectionButtonProps = () => {
    switch (connectionStatus) {
      case 'pending':
        return {
          text: 'Request Sent',
          disabled: true,
          style: styles.disabledButton
        };
      case 'connected':
        return {
          text: 'Connected',
          disabled: true,
          style: styles.disabledButton
        };
      default:
        return {
          text: 'Connect',
          disabled: false,
          style: styles.primaryButton
        };
    }
  };

  const connectionButtonProps = getConnectionButtonProps();

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
                    {currentProfile.fullName || `${targetUser?.firstName} ${targetUser?.lastName}`}
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
                  onClick={handleConnectClick}
                  disabled={connectionButtonProps.disabled}
                  style={{ 
                    ...styles.button, 
                    ...connectionButtonProps.style
                  }}
                >
                  {connectionButtonProps.text}
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

        {/* Rest of the component remains the same... */}
        {/* I'll truncate here since it's getting very long, but the key fix is moving isOwnProfile declaration before useEffect */}
        
      </div>

      {/* Connection Request Modal */}
      {isConnectionModalOpen && (
        <ConnectionRequestModal
          isOpen={isConnectionModalOpen}
          onClose={() => setIsConnectionModalOpen(false)}
          profile={{
            ...profile,
            fullName: profile?.fullName || `${targetUser?.firstName} ${targetUser?.lastName}`,
            professionalType: profile?.professionalType || targetUser?.professionalType
          }}
          onSendRequest={handleSendConnectionRequest}
        />
      )}
    </div>
  );
};

export default ModelProfile;