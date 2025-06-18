import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  LoadingSpinner, 
  EmptyState, 
  Notification, 
  MultiImageUploader
} from '../shared';
import { profileService, connectionService } from '../../services/api';
import ConnectionRequestModal from '../connections/ConnectionRequestModal';

const ModelProfile = ({ profileId, user, targetUser, profileData, onBack, onConnect, onMessage }) => {
  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

  // Check if viewing own profile
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

  // Fetch profile data
  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setEditData(profileData);
      setLoading(false);
    } else {
      fetchModelProfile();
    }
  }, [profileData, profileId]);

  // Check connection status when profile loads
  useEffect(() => {
    if (!isOwnProfile && profileId && profile) {
      checkConnectionStatus();
    }
  }, [profileId, profile, isOwnProfile]);

  const fetchModelProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfileById(profileId);
      setProfile(data);
      setEditData(data);
      setError(null);
    } catch (error) {
      console.error('Error loading model profile:', error);
      setError('Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Check connection status with this user
  const checkConnectionStatus = async () => {
    try {
      const data = await connectionService.getConnectionStatus(profileId);
      setConnectionStatus(data.status || 'none');
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setUploading(true);
      await profileService.updateProfile(editData);
      await fetchModelProfile();
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to update profile', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle portfolio upload
  const handlePortfolioUpload = async (files) => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      const data = await profileService.uploadPortfolioPhotos(files);
      const updatedPhotos = [...(profile.photos || []), ...data.photos];
      setProfile({ ...profile, photos: updatedPhotos });
      setEditData({ ...editData, photos: updatedPhotos });
      showNotification(`${files.length} photos uploaded successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to upload photos', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle connect
  const handleConnect = async () => {
    if (connectionStatus !== 'none') return;
    
    try {
      await connectionService.sendConnectionRequest(profileId, 
        `I'd like to connect with you on Zanara.`, 
        'model');
      setConnectionStatus('pending');
      showNotification('Connection request sent!', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to send connection request', 'error');
    }
  };

  // Helper function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, show: true });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Handle connect button click
  const handleConnectClick = () => {
    setIsConnectionModalOpen(true);
  };

  // Send connection request
  const handleSendConnectionRequest = async (message) => {
    try {
      await connectionService.sendConnectionRequest(profileId, message, profile.professionalType || 'model');
      setConnectionStatus('pending');
      setIsConnectionModalOpen(false);
      showNotification('Connection request sent successfully!', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to send connection request', 'error');
    }
  };

  // Experience management functions
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
    showNotification('New experience section added', 'success');
  };

  const updateExperience = (index, field, value) => {
    const currentExperience = ensureExperienceArray(editData.experience);
    const updatedExperience = currentExperience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    setEditData({ ...editData, experience: updatedExperience });
  };

  const removeExperience = (index) => {
    const currentExperience = ensureExperienceArray(editData.experience);
    const updatedExperience = currentExperience.filter((_, i) => i !== index);
    setEditData({ ...editData, experience: updatedExperience });
    showNotification('Experience removed', 'success');
  };

  // Remove Portfolio Photo
  const removePortfolioPhoto = async (photoIndex) => {
    try {
      const profilePhotos = ensureArray(profile.photos);
      const updatedPhotos = profilePhotos.filter((_, index) => index !== photoIndex);
      const updatedProfile = { ...profile, photos: updatedPhotos };
      setProfile(updatedProfile);
      setEditData(updatedProfile);
      showNotification('Photo removed successfully', 'success');
    } catch (error) {
      showNotification('Failed to remove photo', 'error');
    }
  };

  // Handle array input changes
  const handleArrayInputChange = (field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setEditData({ ...editData, [field]: arrayValue });
  };

  // Handle nested input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setEditData(prev => ({ ...prev, [field]: value }));
    }
  };

  // UI styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Model purple theme
      padding: '20px'
    },
    formInput: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
      marginBottom: '10px'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical',
      marginBottom: '10px'
    },
    badge: {
      background: 'rgba(102, 126, 234, 0.2)',
      color: '#667eea',
      padding: '8px 12px',
      borderRadius: '15px',
      fontSize: '12px',
      border: '1px solid rgba(102, 126, 234, 0.3)',
      display: 'inline-block',
      margin: '5px'
    },
    skillItem: {
      background: 'rgba(255, 255, 255, 0.05)', 
      padding: '8px 12px', 
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '8px'
    },
    experienceCard: {
      background: 'rgba(255,255,255,0.1)',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.2)',
      marginBottom: '10px'
    },
    coverPhoto: {
      height: '250px',
      width: '100%',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '15px 15px 0 0',
      overflow: 'hidden',
      position: 'relative'
    },
    profilePicture: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: '4px solid white',
      position: 'absolute',
      bottom: '-60px',
      left: '25px',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      color: 'white',
      overflow: 'hidden'
    },
    portfolioGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '15px',
      marginTop: '20px'
    },
    portfolioItem: {
      borderRadius: '8px',
      overflow: 'hidden',
      aspectRatio: '1',
      background: 'rgba(255, 255, 255, 0.1)',
      position: 'relative'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '10px'
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh' 
        }}>
          <LoadingSpinner size={60} />
          <p style={{ color: 'white', marginTop: '20px', fontSize: '18px' }}>
            Loading model profile...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Card>
            <EmptyState
              icon="❌"
              title="Error Loading Profile"
              description={error}
              actionButton={
                <Button type="primary" onClick={onBack}>
                  Go Back
                </Button>
              }
            />
          </Card>
        </div>
      </div>
    );
  }

  // Get the current profile data (edited or original)
  const currentProfile = isEditing ? editData : profile;
  const displayPhotos = showAllPhotos ? ensureArray(profile.photos) : ensureArray(profile.photos).slice(0, 8);

  // Get connection button text and status
  const getConnectionButton = () => {
    switch (connectionStatus) {
      case 'pending':
        return <Button type="secondary" disabled>Request Sent</Button>;
      case 'connected':
        return <Button type="secondary" disabled>Connected</Button>;
      default:
        return <Button type="primary" onClick={handleConnectClick}>Connect</Button>;
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Notification */}
        {notification.show && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(prev => ({ ...prev, show: false }))}
          />
        )}

        {/* Header with navigation */}
        <Card style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button type="secondary" onClick={onBack}>
              ← Back
            </Button>
            <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>
              📸 Model Profile
            </h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              {isOwnProfile && (
                <>
                  {isEditing ? (
                    <>
                      <Button 
                        type="primary" 
                        onClick={handleSaveChanges}
                        disabled={uploading}
                      >
                        {uploading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        type="secondary" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      type="primary" 
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Edit Profile
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Cover Photo and Profile Picture */}
        <div style={{ position: 'relative', marginBottom: '70px' }}>
          <div style={styles.coverPhoto}>
            {currentProfile?.coverPhoto ? (
              <img 
                src={`http://localhost:8001${currentProfile.coverPhoto}`} 
                alt="Cover" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.2)',
                fontSize: '24px'
              }}>
                Professional Model
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
                  onChange={(e) => handlePortfolioUpload([e.target.files[0]])}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <label
                  htmlFor="coverPhoto"
                  style={{
                    background: 'white',
                    color: '#333',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Change Cover Photo'}
                </label>
              </div>
            )}
          </div>
          
          <div style={styles.profilePicture}>
            {currentProfile?.profilePicture ? (
              <img 
                src={`http://localhost:8001${currentProfile.profilePicture}`} 
                alt={currentProfile.fullName} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              '📸'
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
                  onChange={(e) => handlePortfolioUpload([e.target.files[0]])}
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
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input
                    type="text"
                    value={editData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    style={{ ...styles.formInput, fontSize: '24px', fontWeight: 'bold' }}
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    value={editData.headline || ''}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    style={{ ...styles.formInput, fontSize: '18px' }}
                    placeholder="Professional Headline (e.g., Fashion & Commercial Model)"
                  />
                  <input
                    type="text"
                    value={editData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    style={styles.formInput}
                    placeholder="📍 Location"
                  />
                </div>
              ) : (
                <>
                  <h1 style={{ color: 'white', fontSize: '2rem', margin: '0 0 10px 0' }}>
                    {currentProfile?.fullName || `${targetUser?.firstName} ${targetUser?.lastName}` || 'Professional Model'}
                  </h1>
                  <p style={{ color: '#ddd', fontSize: '1.2rem', margin: '0 0 15px 0' }}>
                    📸 {currentProfile?.headline || 'Professional Model'}
                  </p>
                  <div style={{ color: '#ccc', fontSize: '14px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <span>📍 {currentProfile?.location || 'Location not set'}</span>
                    <span>🔗 {currentProfile?.connectionsCount || 0} connections</span>
                    {currentProfile?.verified && <span style={{ color: '#4CAF50' }}>✓ Verified</span>}
                  </div>
                </>
              )}
            </div>
            
            {!isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {getConnectionButton()}
                <Button type="secondary" onClick={onMessage}>
                  Message
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Left Column */}
          <div>
            {/* About Section */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>✨ About</h2>
              {isEditing ? (
                <textarea
                  value={editData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  style={styles.textarea}
                  placeholder="Describe your modeling experience, style, and what makes you unique..."
                />
              ) : (
                <p style={{ color: '#ddd', lineHeight: '1.6' }}>
                  {currentProfile?.bio ||
                    'Professional model with experience in fashion, commercial, and editorial work. Passionate about bringing creative visions to life through authentic and dynamic performances.'}
                </p>
              )}
            </Card>

            {/* Portfolio Photos */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>📸 Portfolio</h2>
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    id="portfolio-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => handlePortfolioUpload(e.target.files)}
                  />
                )}
                {isEditing && (
                  <label htmlFor="portfolio-upload">
                    <Button type="secondary" style={{ cursor: 'pointer' }}>
                      {uploading ? 'Uploading...' : '+ Add Photos'}
                    </Button>
                  </label>
                )}
              </div>

              {/* Portfolio grid */}
              {displayPhotos && displayPhotos.length > 0 ? (
                <>
                  <div style={styles.portfolioGrid}>
                    {displayPhotos.map((photo, index) => (
                      <div key={index} style={styles.portfolioItem}>
                        <img 
                          src={`http://localhost:8001${photo}`} 
                          alt={`Portfolio ${index + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => setActivePhotoIndex(index)}
                        />
                        {isEditing && (
                          <button
                            onClick={() => removePortfolioPhoto(index)}
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              background: 'rgba(255, 0, 0, 0.7)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {ensureArray(profile.photos).length > 8 && !showAllPhotos && (
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <Button 
                        type="secondary" 
                        onClick={() => setShowAllPhotos(true)}
                      >
                        Show All Photos ({ensureArray(profile.photos).length})
                      </Button>
                    </div>
                  )}
                  
                  {showAllPhotos && ensureArray(profile.photos).length > 8 && (
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <Button 
                        type="secondary" 
                        onClick={() => setShowAllPhotos(false)}
                      >
                        Show Less
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon="📸"
                  title="No Portfolio Photos"
                  description={isEditing ? "Upload photos to showcase your modeling work" : "This model hasn't uploaded any portfolio photos yet"}
                  actionButton={isEditing && (
                    <label htmlFor="portfolio-upload">
                      <Button type="primary" style={{ cursor: 'pointer' }}>
                        Add Photos
                      </Button>
                    </label>
                  )}
                />
              )}
            </Card>

            {/* Experience */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>💼 Experience</h2>
                {isEditing && (
                  <Button type="secondary" onClick={addExperience}>
                    + Add Experience
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <div>
                  {ensureExperienceArray(editData.experience).map((exp, index) => (
                    <div key={index} style={styles.experienceCard}>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(index, 'role', e.target.value)}
                        style={styles.formInput}
                        placeholder="Role/Project Title"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        style={styles.formInput}
                        placeholder="Client/Agency/Brand"
                      />
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                        style={styles.formInput}
                        placeholder="Duration (e.g., 2023-2024)"
                      />
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        style={styles.textarea}
                        placeholder="Description of the work..."
                      />
                      <label style={{ color: 'white', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={exp.current || false}
                          onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Current project
                      </label>
                      <Button 
                        type="danger" 
                        onClick={() => removeExperience(index)}
                        size="small"
                      >
                        Remove Experience
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {ensureExperienceArray(currentProfile.experience).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {ensureExperienceArray(currentProfile.experience).map((exp, index) => (
                        <div key={index} style={styles.experienceCard}>
                          <h4 style={{ color: 'white', marginBottom: '5px' }}>{exp.role}</h4>
                          {exp.company && <p style={{ color: '#ddd', fontSize: '14px', marginBottom: '5px' }}>{exp.company}</p>}
                          {exp.duration && <p style={{ color: '#ccc', fontSize: '12px', marginBottom: '10px' }}>{exp.duration}</p>}
                          {exp.description && <p style={{ color: '#ddd', fontSize: '14px' }}>{exp.description}</p>}
                          {exp.current && <span style={{ color: '#4CAF50', fontSize: '12px' }}>• Current</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="💼"
                      title="No Experience Listed"
                      description={isEditing ? "Add your modeling experience and projects" : "No modeling experience has been added yet"}
                    />
                  )}
                </>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div>
            {/* Modeling Types */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎭 Modeling Types</h2>
              {isEditing ? (
                <textarea
                  value={(editData.modelingTypes || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('modelingTypes', e.target.value)}
                  style={styles.textarea}
                  placeholder="Fashion, Commercial, Editorial, Runway, Fitness, Beauty, Parts Modeling (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.modelingTypes?.length > 0 
                    ? currentProfile.modelingTypes 
                    : ['Fashion', 'Commercial', 'Editorial']).map((type, index) => (
                    <span key={index} style={styles.badge}>
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Measurements */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>📏 Measurements</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.measurements?.height || ''}
                    onChange={(e) => handleInputChange('measurements.height', e.target.value)}
                    style={styles.formInput}
                    placeholder="Height (e.g., 5'8\ / 173cm)"
                  />
                  <input
                    type="text"
                    value={editData.measurements?.weight || ''}
                    onChange={(e) => handleInputChange('measurements.weight', e.target.value)}
                    style={styles.formInput}
                    placeholder="Weight (optional)"
                  />
                  <input
                    type="text"
                    value={editData.measurements?.bust || ''}
                    onChange={(e) => handleInputChange('measurements.bust', e.target.value)}
                    style={styles.formInput}
                    placeholder="Bust/Chest (e.g., 34\)"
                  />
                  <input
                    type="text"
                    value={editData.measurements?.waist || ''}
                    onChange={(e) => handleInputChange('measurements.waist', e.target.value)}
                    style={styles.formInput}
                    placeholder="Waist (e.g., 26\)"
                  />
                  <input
                    type="text"
                    value={editData.measurements?.hips || ''}
                    onChange={(e) => handleInputChange('measurements.hips', e.target.value)}
                    style={styles.formInput}
                    placeholder="Hips (e.g., 36\)"
                  />
                  <input
                    type="text"
                    value={editData.measurements?.shoeSize || ''}
                    onChange={(e) => handleInputChange('measurements.shoeSize', e.target.value)}
                    style={styles.formInput}
                    placeholder="Shoe Size (e.g., 8.5)"
                  />
                  <input
                    type="text"
                    value={editData.measurements?.dressSize || ''}
                    onChange={(e) => handleInputChange('measurements.dressSize', e.target.value)}
                    style={styles.formInput}
                    placeholder="Dress Size (e.g., 6)"
                  />
                </div>
              ) : (
                <>
                  {currentProfile?.measurements && Object.values(currentProfile.measurements).some(val => val) ? (
                    <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentProfile?.measurements?.height && (
                        <div><strong style={{ color: 'white' }}>Height:</strong> {currentProfile.measurements.height}</div>
                      )}
                      {currentProfile?.measurements?.weight && (
                        <div><strong style={{ color: 'white' }}>Weight:</strong> {currentProfile.measurements.weight}</div>
                      )}
                      {currentProfile?.measurements?.bust && (
                        <div><strong style={{ color: 'white' }}>Bust/Chest:</strong> {currentProfile.measurements.bust}</div>
                      )}
                      {currentProfile?.measurements?.waist && (
                        <div><strong style={{ color: 'white' }}>Waist:</strong> {currentProfile.measurements.waist}</div>
                      )}
                      {currentProfile?.measurements?.hips && (
                        <div><strong style={{ color: 'white' }}>Hips:</strong> {currentProfile.measurements.hips}</div>
                      )}
                      {currentProfile?.measurements?.shoeSize && (
                        <div><strong style={{ color: 'white' }}>Shoe Size:</strong> {currentProfile.measurements.shoeSize}</div>
                      )}
                      {currentProfile?.measurements?.dressSize && (
                        <div><strong style={{ color: 'white' }}>Dress Size:</strong> {currentProfile.measurements.dressSize}</div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon="📏"
                      title="No Measurements Listed"
                      description="Physical measurements haven't been provided yet"
                    />
                  )}
                </>
              )}
            </Card>

            {/* Physical Features */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>👁️ Physical Features</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.physicalFeatures?.eyeColor || ''}
                    onChange={(e) => handleInputChange('physicalFeatures.eyeColor', e.target.value)}
                    style={styles.formInput}
                    placeholder="Eye Color"
                  />
                  <input
                    type="text"
                    value={editData.physicalFeatures?.hairColor || ''}
                    onChange={(e) => handleInputChange('physicalFeatures.hairColor', e.target.value)}
                    style={styles.formInput}
                    placeholder="Hair Color"
                  />
                  <input
                    type="text"
                    value={editData.physicalFeatures?.hairLength || ''}
                    onChange={(e) => handleInputChange('physicalFeatures.hairLength', e.target.value)}
                    style={styles.formInput}
                    placeholder="Hair Length"
                  />
                  <input
                    type="text"
                    value={editData.physicalFeatures?.skinTone || ''}
                    onChange={(e) => handleInputChange('physicalFeatures.skinTone', e.target.value)}
                    style={styles.formInput}
                    placeholder="Skin Tone"
                  />
                  <input
                    type="text"
                    value={editData.physicalFeatures?.ethnicity || ''}
                    onChange={(e) => handleInputChange('physicalFeatures.ethnicity', e.target.value)}
                    style={styles.formInput}
                    placeholder="Ethnicity"
                  />
                </div>
              ) : (
                <>
                  {currentProfile?.physicalFeatures && Object.values(currentProfile.physicalFeatures).some(val => val) ? (
                    <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentProfile?.physicalFeatures?.eyeColor && (
                        <div><strong style={{ color: 'white' }}>Eyes:</strong> {currentProfile.physicalFeatures.eyeColor}</div>
                      )}
                      {currentProfile?.physicalFeatures?.hairColor && (
                        <div><strong style={{ color: 'white' }}>Hair Color:</strong> {currentProfile.physicalFeatures.hairColor}</div>
                      )}
                      {currentProfile?.physicalFeatures?.hairLength && (
                        <div><strong style={{ color: 'white' }}>Hair Length:</strong> {currentProfile.physicalFeatures.hairLength}</div>
                      )}
                      {currentProfile?.physicalFeatures?.skinTone && (
                        <div><strong style={{ color: 'white' }}>Skin Tone:</strong> {currentProfile.physicalFeatures.skinTone}</div>
                      )}
                      {currentProfile?.physicalFeatures?.ethnicity && (
                        <div><strong style={{ color: 'white' }}>Ethnicity:</strong> {currentProfile.physicalFeatures.ethnicity}</div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon="👁️"
                      title="No Physical Features Listed"
                      description="Physical features haven't been provided yet"
                    />
                  )}
                </>
              )}
            </Card>

            {/* Skills & Abilities */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎯 Skills & Abilities</h2>
              {isEditing ? (
                <textarea
                  value={(editData.skills || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('skills', e.target.value)}
                  style={styles.textarea}
                  placeholder="Dancing, Acting, Sports, Languages, Musical Instruments, Martial Arts (comma separated)"
                />
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(currentProfile?.skills?.length > 0
                    ? currentProfile.skills
                    : ['Professional Posing', 'Runway Walking', 'Commercial Acting']).map((skill, index) => (
                    <div key={index} style={styles.skillItem}>
                      • {skill}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Availability & Rates */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>💰 Availability & Rates</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.rates?.hourly || ''}
                    onChange={(e) => handleInputChange('rates.hourly', e.target.value)}
                    style={styles.formInput}
                    placeholder="Hourly Rate (e.g., $150/hour)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.daily || ''}
                    onChange={(e) => handleInputChange('rates.daily', e.target.value)}
                    style={styles.formInput}
                    placeholder="Daily Rate (e.g., $800/day)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.runway || ''}
                    onChange={(e) => handleInputChange('rates.runway', e.target.value)}
                    style={styles.formInput}
                    placeholder="Runway Rate (e.g., $500/show)"
                  />
                  <select
                    value={editData.availability || ''}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="">Select Availability</option>
                    <option value="full-time">Available Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="freelance">Freelance Projects</option>
                    <option value="seasonal">Seasonal Work</option>
                    <option value="by-appointment">By Appointment</option>
                  </select>
                  <label style={{ color: 'white', fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={editData.willingToTravel || false}
                      onChange={(e) => handleInputChange('willingToTravel', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    Willing to travel for assignments
                  </label>
                </div>
              ) : (
                <>
                  {(currentProfile?.rates && Object.keys(currentProfile.rates).length > 0) || 
                   currentProfile?.availability || currentProfile?.willingToTravel ? (
                    <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentProfile?.rates?.hourly && (
                        <div><strong style={{ color: 'white' }}>Hourly:</strong> {currentProfile.rates.hourly}</div>
                      )}
                      {currentProfile?.rates?.daily && (
                        <div><strong style={{ color: 'white' }}>Daily:</strong> {currentProfile.rates.daily}</div>
                      )}
                      {currentProfile?.rates?.runway && (
                        <div><strong style={{ color: 'white' }}>Runway:</strong> {currentProfile.rates.runway}</div>
                      )}
                      {currentProfile?.availability && (
                        <div style={{ marginTop: '10px' }}>
                          <strong style={{ color: 'white' }}>Availability:</strong> {currentProfile.availability}
                        </div>
                      )}
                      {currentProfile?.willingToTravel && (
                        <div style={{ color: '#4CAF50' }}>✓ Available for travel assignments</div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon="💰"
                      title="No Rates Listed"
                      description="Contact for rates and availability"
                    />
                  )}
                </>
              )}
            </Card>

            {/* Agency & Representation */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🏢 Agency & Representation</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.agency?.name || ''}
                    onChange={(e) => handleInputChange('agency.name', e.target.value)}
                    style={styles.formInput}
                    placeholder="Agency Name"
                  />
                  <input
                    type="text"
                    value={editData.agency?.contact || ''}
                    onChange={(e) => handleInputChange('agency.contact', e.target.value)}
                    style={styles.formInput}
                    placeholder="Agency Contact"
                  />
                  <input
                    type="text"
                    value={editData.agency?.location || ''}
                    onChange={(e) => handleInputChange('agency.location', e.target.value)}
                    style={styles.formInput}
                    placeholder="Agency Location"
                  />
                  <label style={{ color: 'white', fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={editData.seekingRepresentation || false}
                      onChange={(e) => handleInputChange('seekingRepresentation', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    Currently seeking representation
                  </label>
                </div>
              ) : (
                <>
                  {(currentProfile?.agency && Object.values(currentProfile.agency).some(val => val)) || 
                   currentProfile?.seekingRepresentation ? (
                    <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentProfile?.agency?.name && (
                        <div><strong style={{ color: 'white' }}>Agency:</strong> {currentProfile.agency.name}</div>
                      )}
                      {currentProfile?.agency?.contact && (
                        <div><strong style={{ color: 'white' }}>Contact:</strong> {currentProfile.agency.contact}</div>
                      )}
                      {currentProfile?.agency?.location && (
                        <div><strong style={{ color: 'white' }}>Location:</strong> {currentProfile.agency.location}</div>
                      )}
                      {currentProfile?.seekingRepresentation && (
                        <div style={{ color: '#4CAF50', marginTop: '10px' }}>✓ Seeking representation</div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon="🏢"
                      title="No Agency Information"
                      description="Agency details haven't been provided yet"
                    />
                  )}
                </>
              )}
            </Card>

            {/* Contact Info */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>📞 Contact</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {isEditing ? (
                  <>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={styles.formInput}
                      placeholder="✉️ Email"
                    />
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={styles.formInput}
                      placeholder="📞 Phone Number"
                    />
                    <input
                      type="url"
                      value={editData.portfolioWebsite || ''}
                      onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                      style={styles.formInput}
                      placeholder="🌐 Portfolio Website"
                    />
                  </>
                ) : (
                  <>
                    {currentProfile?.email && (
                      <div style={styles.contactItem}>
                        <span style={{ color: '#ccc' }}>✉️</span>
                        <span style={{ color: 'white' }}>{currentProfile.email}</span>
                      </div>
                    )}
                    {currentProfile?.phone && (
                      <div style={styles.contactItem}>
                        <span style={{ color: '#ccc' }}>📞</span>
                        <span style={{ color: 'white' }}>{currentProfile.phone}</span>
                      </div>
                    )}
                    {currentProfile?.portfolioWebsite && (
                      <div style={styles.contactItem}>
                        <span style={{ color: '#ccc' }}>🌐</span>
                        <a
                          href={currentProfile.portfolioWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#667eea', textDecoration: 'none' }}
                        >
                          Portfolio Website
                        </a>
                      </div>
                    )}
                    {!currentProfile?.email && !currentProfile?.phone && !currentProfile?.portfolioWebsite && (
                      <EmptyState
                        icon="📞"
                        title="No Contact Info"
                        description="Contact information hasn't been provided yet"
                      />
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Social Media */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>📱 Social Media</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.socialMedia?.instagram || ''}
                    onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                    style={styles.formInput}
                    placeholder="📷 Instagram (@username or URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.tiktok || ''}
                    onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                    style={styles.formInput}
                    placeholder="🎵 TikTok (@username or URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.youtube || ''}
                    onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                    style={styles.formInput}
                    placeholder="🎥 YouTube (Channel URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.linkedin || ''}
                    onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                    style={styles.formInput}
                    placeholder="💼 LinkedIn (Profile URL)"
                  />
                </div>
              ) : (
                <>
                  {(currentProfile?.socialMedia && Object.values(currentProfile.socialMedia).some(val => val)) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {currentProfile?.socialMedia?.instagram && (
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
                      {currentProfile?.socialMedia?.tiktok && (
                        <a
                          href={
                            currentProfile.socialMedia.tiktok.startsWith('http')
                              ? currentProfile.socialMedia.tiktok
                              : `https://tiktok.com/@${currentProfile.socialMedia.tiktok.replace('@', '')}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#000',
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
                      {currentProfile?.socialMedia?.youtube && (
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
                      {currentProfile?.socialMedia?.linkedin && (
                        <a
                          href={currentProfile.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#0A66C2',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>💼</span>
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon="📱"
                      title="No Social Media Links"
                      description="Social media profiles haven't been added yet"
                    />
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
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

      {/* Photo Modal for full-size viewing */}
      {activePhotoIndex !== null && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setActivePhotoIndex(null)}
        >
          <img 
            src={`http://localhost:8001${ensureArray(profile.photos)[activePhotoIndex]}`}
            alt={`Portfolio ${activePhotoIndex + 1}`}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
          />
          <button
            onClick={() => setActivePhotoIndex(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ModelProfile;