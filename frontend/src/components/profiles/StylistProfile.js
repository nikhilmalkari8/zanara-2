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

const StylistProfile = ({ profileId, user, targetUser, onBack, onConnect, onMessage }) => {
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
  const [newProject, setNewProject] = useState({ name: '', client: '', description: '', category: '' });

  // Check if viewing own profile
  const isOwnProfile = user && (
    user._id === targetUser?._id || 
    user.id === targetUser?.id ||
    user._id === profileId ||
    user.id === profileId
  );

  // Helper function to ensure arrays
  const ensureArray = (value) => {
    if (Array.isArray(value)) return value;
    return [];
  };

  // Fetch profile data
  useEffect(() => {
    fetchStylistProfile();
    if (!isOwnProfile && profileId) {
      checkConnectionStatus();
    }
  }, [profileId, isOwnProfile]);

  const fetchStylistProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfileById(profileId);
      setProfile(data);
      setEditData(data);
      setError(null);
    } catch (error) {
      console.error('Error loading stylist profile:', error);
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
      await fetchStylistProfile();
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
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('portfolioPhotos', file));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/professional-profile/photos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        // update state with new photos
      }
    } catch (error) {
      // handle error
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
        'fashion-stylist');
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

  // Project management functions
  const addProject = async () => {
    if (!newProject.name || !newProject.client) {
      showNotification('Please fill in project name and client', 'error');
      return;
    }

    try {
      const updatedProjects = [...(editData.projects || []), newProject];
      setEditData({ ...editData, projects: updatedProjects });
      setNewProject({ name: '', client: '', description: '', category: '' });
      showNotification('Project added successfully!', 'success');
    } catch (error) {
      showNotification('Failed to add project', 'error');
    }
  };

  const removeProject = (index) => {
    const updatedProjects = [...(editData.projects || [])];
    updatedProjects.splice(index, 1);
    setEditData({ ...editData, projects: updatedProjects });
    showNotification('Project removed', 'success');
  };

  // Client management functions
  const addClientType = () => {
    const newClientType = '';
    setEditData({ 
      ...editData, 
      clientTypes: [...(editData.clientTypes || []), newClientType] 
    });
  };

  const updateClientType = (index, value) => {
    const updatedClientTypes = [...(editData.clientTypes || [])];
    updatedClientTypes[index] = value;
    setEditData({ ...editData, clientTypes: updatedClientTypes });
  };

  const removeClientType = (index) => {
    const updatedClientTypes = [...(editData.clientTypes || [])];
    updatedClientTypes.splice(index, 1);
    setEditData({ ...editData, clientTypes: updatedClientTypes });
  };

  // UI styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)', // Stylist purple theme
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
      background: 'rgba(165, 94, 234, 0.2)',
      color: '#a55eea',
      padding: '8px 12px',
      borderRadius: '15px',
      fontSize: '12px',
      border: '1px solid rgba(165, 94, 234, 0.3)',
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
    projectCard: {
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '15px',
      marginTop: '20px'
    },
    portfolioItem: {
      borderRadius: '8px',
      overflow: 'hidden',
      aspectRatio: '3/4',
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
            Loading fashion stylist profile...
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
      case 'accepted':
        return <Button type="secondary" disabled>Connected</Button>;
      default:
        return <Button type="primary" onClick={handleConnect}>Connect</Button>;
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
              👗 Fashion Stylist Profile
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
                background: 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.2)',
                fontSize: '24px'
              }}>
                Fashion Stylist
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
              '👗'
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
                    placeholder="Styling Specialization (e.g., Celebrity & Editorial Fashion Stylist)"
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
                    {currentProfile?.fullName || targetUser?.firstName + ' ' + targetUser?.lastName || 'Fashion Stylist'}
                  </h1>
                  <p style={{ color: '#ddd', fontSize: '1.2rem', margin: '0 0 15px 0' }}>
                    👗 {currentProfile?.headline || 'Fashion Stylist'}
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
            {/* Styling Philosophy */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>✨ Styling Philosophy</h2>
              {isEditing ? (
                <textarea
                  value={editData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  style={styles.textarea}
                  placeholder="Describe your styling approach, aesthetic vision, and what makes your work unique..."
                />
              ) : (
                <p style={{ color: '#ddd', lineHeight: '1.6' }}>
                  {currentProfile?.bio ||
                    'Creating transformative styling experiences that empower clients through thoughtful wardrobe curation and trend-forward fashion choices.'}
                </p>
              )}
            </Card>

            {/* Styling Portfolio */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>📸 Styling Portfolio</h2>
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
                      {uploading ? 'Uploading...' : '+ Add Styling Photos'}
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
                          src={`http://localhost:8001${typeof photo === 'string' ? photo : photo.url}`} 
                          alt={`Styling work ${index + 1}`} 
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
                  title="No Styling Portfolio"
                  description={isEditing ? "Upload photos to showcase your styling work" : "No styling portfolio has been uploaded yet"}
                  actionButton={isEditing && (
                    <label htmlFor="portfolio-upload">
                      <Button type="primary" style={{ cursor: 'pointer' }}>
                        Add Styling Photos
                      </Button>
                    </label>
                  )}
                />
              )}
            </Card>

            {/* Notable Projects */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>🏆 Notable Projects</h2>
                {isEditing && (
                  <Button type="secondary" onClick={addProject}>
                    + Add Project
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <div>
                  {/* Add New Project Form */}
                  <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <h4 style={{ color: 'white', marginBottom: '10px' }}>Add New Project</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <input
                        type="text"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        style={styles.formInput}
                        placeholder="Project Name"
                      />
                      <input
                        type="text"
                        value={newProject.client}
                        onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                        style={styles.formInput}
                        placeholder="Client/Brand"
                      />
                      <input
                        type="text"
                        value={newProject.category}
                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                        style={styles.formInput}
                        placeholder="Category (Editorial, Celebrity, Commercial)"
                      />
                      <textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        style={{ ...styles.formInput, minHeight: '80px' }}
                        placeholder="Project description..."
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Button type="primary" onClick={addProject}>
                          Add Project
                        </Button>
                        <Button 
                          type="secondary" 
                          onClick={() => setNewProject({ name: '', client: '', description: '', category: '' })}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Projects */}
                  {(editData.projects || []).map((project, index) => (
                    <div key={index} style={styles.projectCard}>
                      <h4 style={{ color: 'white', marginBottom: '10px' }}>{project.name}</h4>
                      <p style={{ color: '#ddd', fontSize: '14px', marginBottom: '10px' }}>
                        Client: {project.client} | Category: {project.category}
                      </p>
                      <p style={{ color: '#ddd', fontSize: '14px', marginBottom: '10px' }}>{project.description}</p>
                      <Button 
                        type="danger" 
                        onClick={() => removeProject(index)}
                        size="small"
                      >
                        Remove Project
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {currentProfile?.projects && currentProfile.projects.length > 0 ? (
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {currentProfile.projects.map((project, index) => (
                        <div key={index} style={styles.projectCard}>
                          <h4 style={{ color: 'white', marginBottom: '5px' }}>{project.name}</h4>
                          <p style={{ color: '#ddd', fontSize: '14px', marginBottom: '5px' }}>
                            <strong>Client:</strong> {project.client}
                          </p>
                          {project.category && (
                            <p style={{ color: '#ddd', fontSize: '14px', marginBottom: '5px' }}>
                              <strong>Category:</strong> {project.category}
                            </p>
                          )}
                          {project.description && (
                            <p style={{ color: '#ddd', fontSize: '14px' }}>{project.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="🏆"
                      title="No Projects Listed"
                      description={isEditing ? "Add your notable styling projects and collaborations" : "No notable projects have been added yet"}
                    />
                  )}
                </>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div>
            {/* Styling Services */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎯 Services</h2>
              {isEditing ? (
                <textarea
                  value={(editData.specializations || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('specializations', e.target.value)}
                  style={styles.textarea}
                  placeholder="Personal Styling, Editorial, Celebrity, Wardrobe Consulting, Event Styling, Brand Campaigns (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.specializations?.length > 0 
                    ? currentProfile.specializations 
                    : ['Personal Styling', 'Editorial', 'Wardrobe Consulting']).map((spec, index) => (
                    <span key={index} style={styles.badge}>
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Client Types */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>👥 Client Types</h2>
              {isEditing ? (
                <textarea
                  value={(editData.preferredTypes || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('preferredTypes', e.target.value)}
                  style={styles.textarea}
                  placeholder="Celebrities, Executives, Brides, Models, Fashion Brands, Influencers (comma separated)"
                />
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(currentProfile?.preferredTypes?.length > 0
                    ? currentProfile.preferredTypes
                    : ['Corporate Executives', 'Special Events', 'Personal Wardrobe']).map((type, index) => (
                    <div key={index} style={styles.skillItem}>
                      • {type}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Style Expertise */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>💎 Style Expertise</h2>
              {isEditing ? (
                <textarea
                  value={(editData.skills || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('skills', e.target.value)}
                  style={styles.textarea}
                  placeholder="Color Analysis, Body Type Styling, Trend Forecasting, Wardrobe Planning, Shopping, Closet Organization (comma separated)"
                />
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(currentProfile?.skills?.length > 0
                    ? currentProfile.skills
                    : ['Color Analysis', 'Wardrobe Planning', 'Trend Forecasting', 'Personal Shopping']).map((skill, index) => (
                    <div key={index} style={styles.skillItem}>
                      • {skill}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Brand Collaborations */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🤝 Brand Collaborations</h2>
              {isEditing ? (
                <textarea
                  value={(editData.brandCollaborations || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('brandCollaborations', e.target.value)}
                  style={styles.textarea}
                  placeholder="Luxury brands, fashion houses, or retailers you've worked with (comma separated)"
                />
              ) : (
                <>
                  {currentProfile?.brandCollaborations && currentProfile.brandCollaborations.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {currentProfile.brandCollaborations.map((brand, index) => (
                        <span key={index} style={styles.badge}>
                          {brand}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="🤝"
                      title="No Brand Collaborations"
                      description="Brand partnerships haven't been listed yet"
                    />
                  )}
                </>
              )}
            </Card>

            {/* Experience & Credentials */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🏆 Experience & Credentials</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select
                    value={editData.yearsExperience || ''}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="">Select Experience Level</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="11-15">11-15 years</option>
                    <option value="15+">15+ years</option>
                  </select>
                  <textarea
                    value={editData.experience || ''}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    style={styles.textarea}
                    placeholder="Fashion styling experience, notable clients, publications, certifications..."
                  />
                  <textarea
                    value={editData.education || ''}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    style={styles.textarea}
                    placeholder="Fashion education, styling courses, certifications..."
                  />
                </div>
              ) : (
                <>
                  {currentProfile?.yearsExperience || currentProfile?.experience || currentProfile?.education ? (
                    <div style={{ color: '#ddd', lineHeight: '1.6' }}>
                      {currentProfile?.yearsExperience && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: 'white' }}>Experience:</strong> {currentProfile.yearsExperience} years
                        </div>
                      )}
                      {currentProfile?.experience && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: 'white' }}>Background:</strong> {currentProfile.experience}
                        </div>
                      )}
                      {currentProfile?.education && (
                        <div>
                          <strong style={{ color: 'white' }}>Education:</strong> {currentProfile.education}
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon="🏆"
                      title="No Experience Listed"
                      description="Professional background and credentials haven't been provided yet"
                    />
                  )}
                </>
              )}
            </Card>

            {/* Rates & Availability */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>💰 Rates & Availability</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.rates?.consultation || ''}
                    onChange={(e) => handleInputChange('rates.consultation', e.target.value)}
                    style={styles.formInput}
                    placeholder="Consultation Rate (e.g., $150/hour)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.styling || ''}
                    onChange={(e) => handleInputChange('rates.styling', e.target.value)}
                    style={styles.formInput}
                    placeholder="Styling Session (e.g., $400/day)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.shopping || ''}
                    onChange={(e) => handleInputChange('rates.shopping', e.target.value)}
                    style={styles.formInput}
                    placeholder="Personal Shopping (e.g., $200/session)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.wardrobe || ''}
                    onChange={(e) => handleInputChange('rates.wardrobe', e.target.value)}
                    style={styles.formInput}
                    placeholder="Wardrobe Overhaul (e.g., $800/package)"
                  />
                  <select
                    value={editData.availability || ''}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="">Select Availability</option>
                    <option value="full-time">Available Full Time</option>
                    <option value="freelance">Freelance Projects</option>
                    <option value="consultation">Consultation Only</option>
                    <option value="weekends-only">Weekends Only</option>
                    <option value="limited">Limited Availability</option>
                    <option value="seasonal">Seasonal Work</option>
                  </select>
                  <label style={{ color: 'white', fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={editData.travelsForClients || false}
                      onChange={(e) => handleInputChange('travelsForClients', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    Available for travel assignments
                  </label>
                </div>
              ) : (
                <>
                  {(currentProfile?.rates && Object.keys(currentProfile.rates).length > 0) || 
                   currentProfile?.availability || currentProfile?.travelsForClients ? (
                    <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentProfile?.rates?.consultation && (
                        <div><strong style={{ color: 'white' }}>Consultation:</strong> {currentProfile.rates.consultation}</div>
                      )}
                      {currentProfile?.rates?.styling && (
                        <div><strong style={{ color: 'white' }}>Styling Session:</strong> {currentProfile.rates.styling}</div>
                      )}
                      {currentProfile?.rates?.shopping && (
                        <div><strong style={{ color: 'white' }}>Personal Shopping:</strong> {currentProfile.rates.shopping}</div>
                      )}
                      {currentProfile?.rates?.wardrobe && (
                        <div><strong style={{ color: 'white' }}>Wardrobe Overhaul:</strong> {currentProfile.rates.wardrobe}</div>
                      )}
                      {currentProfile?.availability && (
                        <div style={{ marginTop: '10px' }}>
                          <strong style={{ color: 'white' }}>Availability:</strong> {currentProfile.availability}
                        </div>
                      )}
                      {currentProfile?.travelsForClients && (
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

            {/* Style Preferences */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎨 Style Preferences</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    value={(editData.favoriteDesigners || []).join(', ')}
                    onChange={(e) => handleArrayInputChange('favoriteDesigners', e.target.value)}
                    style={styles.textarea}
                    placeholder="Favorite designers and brands you love to work with (comma separated)"
                  />
                  <textarea
                    value={(editData.styleAesthetics || []).join(', ')}
                    onChange={(e) => handleArrayInputChange('styleAesthetics', e.target.value)}
                    style={styles.textarea}
                    placeholder="Style aesthetics: Minimalist, Bohemian, Classic, Edgy, Romantic, etc. (comma separated)"
                  />
                </div>
              ) : (
                <>
                  {(currentProfile?.favoriteDesigners?.length > 0 || currentProfile?.styleAesthetics?.length > 0) ? (
                    <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentProfile?.favoriteDesigners && currentProfile.favoriteDesigners.length > 0 && (
                        <div>
                          <strong style={{ color: 'white' }}>Favorite Designers:</strong>
                          <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {currentProfile.favoriteDesigners.map((designer, index) => (
                              <span key={index} style={styles.badge}>{designer}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {currentProfile?.styleAesthetics && currentProfile.styleAesthetics.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <strong style={{ color: 'white' }}>Style Aesthetics:</strong>
                          <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {currentProfile.styleAesthetics.map((aesthetic, index) => (
                              <span key={index} style={styles.badge}>{aesthetic}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon="🎨"
                      title="No Style Preferences"
                      description="Style preferences and favorite designers haven't been listed yet"
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
                      placeholder="📞 Phone"
                    />
                    <input
                      type="url"
                      value={editData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
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
                    {currentProfile?.website && (
                      <div style={styles.contactItem}>
                        <span style={{ color: '#ccc' }}>🌐</span>
                        <a href={currentProfile.website} target="_blank" rel="noopener noreferrer" 
                           style={{ color: '#a55eea', textDecoration: 'none' }}>
                          Portfolio Website
                        </a>
                      </div>
                    )}
                    {!currentProfile?.email && !currentProfile?.phone && !currentProfile?.website && (
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
                    value={editData.socialMedia?.pinterest || ''}
                    onChange={(e) => handleInputChange('socialMedia.pinterest', e.target.value)}
                    style={styles.formInput}
                    placeholder="📌 Pinterest (Profile URL)"
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
                      {currentProfile?.socialMedia?.pinterest && (
                        <a
                          href={currentProfile.socialMedia.pinterest}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#BD081C',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>📌</span>
                          <span>Pinterest</span>
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
            src={`http://localhost:8001${typeof ensureArray(profile.photos)[activePhotoIndex] === 'string' 
              ? ensureArray(profile.photos)[activePhotoIndex] 
              : ensureArray(profile.photos)[activePhotoIndex]?.url}`}
            alt={`Styling work ${activePhotoIndex + 1}`}
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

export default StylistProfile;