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

const MakeupArtistProfile = ({
  profileId,
  user,
  targetUser,
  onBack,
  onConnect,
  onMessage
}) => {
  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [newTutorial, setNewTutorial] = useState({ title: '', description: '', videoUrl: '' });

  // Check if viewing own profile
  const isOwnProfile = user && (
    user._id === targetUser?._id ||
    user.id === targetUser?.id ||
    user._id === profileId ||
    user.id === profileId
  );

  // Fetch profile data
  useEffect(() => {
    fetchMakeupArtistProfile();
    if (!isOwnProfile && profileId) {
      checkConnectionStatus();
    }
  }, [profileId, isOwnProfile]);

  const fetchMakeupArtistProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfileById(profileId);
      setProfile(data);
      setEditData(data);
      setError(null);
    } catch (error) {
      console.error('Error loading makeup artist profile:', error);
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
      await fetchMakeupArtistProfile();
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
        'makeup-artist');
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

  // Tutorial management functions
  const handleAddTutorial = async () => {
    if (!newTutorial.title || !newTutorial.videoUrl) {
      showNotification('Please fill in tutorial title and video URL', 'error');
      return;
    }

    try {
      const updatedTutorials = [...(editData.tutorials || []), newTutorial];
      setEditData({ ...editData, tutorials: updatedTutorials });
      setNewTutorial({ title: '', description: '', videoUrl: '' });
      showNotification('Tutorial added successfully!', 'success');
    } catch (error) {
      showNotification('Failed to add tutorial', 'error');
    }
  };

  const handleRemoveTutorial = (index) => {
    const updatedTutorials = [...(editData.tutorials || [])];
    updatedTutorials.splice(index, 1);
    setEditData({ ...editData, tutorials: updatedTutorials });
    showNotification('Tutorial removed', 'success');
  };

  const handleShareTutorial = (tutorial) => {
    if (navigator.share) {
      navigator.share({
        title: tutorial.title,
        text: tutorial.description,
        url: tutorial.videoUrl,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(tutorial.videoUrl);
      showNotification('Tutorial link copied to clipboard!', 'success');
    }
  };

  // UI styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Makeup artist pink theme
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
      background: 'rgba(240, 147, 251, 0.2)',
      color: '#f093fb',
      padding: '8px 12px',
      borderRadius: '15px',
      fontSize: '12px',
      border: '1px solid rgba(240, 147, 251, 0.3)',
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
    tutorialCard: {
      background: 'rgba(255,255,255,0.1)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.2)',
      marginBottom: '15px'
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
      background: 'rgba(255, 255, 255, 0.1)'
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
            Loading makeup artist profile...
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
              💄 Makeup Artist Profile
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
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.2)',
                fontSize: '24px'
              }}>
                Makeup Artist
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
              '💄'
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
                    placeholder="Professional Headline (e.g., Beauty & Editorial Makeup Artist)"
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
                    {currentProfile?.fullName || 
                     `${targetUser?.firstName} ${targetUser?.lastName}` || 
                     'Makeup Artist'}
                  </h1>
                  <p style={{ color: '#ddd', fontSize: '1.2rem', margin: '0 0 15px 0' }}>
                    💄 {currentProfile?.headline || 'Professional Makeup Artist'}
                  </p>
                  <div style={{ color: '#ccc', fontSize: '14px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <span>📍 {currentProfile?.location || 'Location not set'}</span>
                    <span>🔗 {currentProfile?.connectionsCount || 0} connections</span>
                    {currentProfile?.isVerified && <span style={{ color: '#4CAF50' }}>✓ Verified</span>}
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
                  placeholder="Describe your makeup artistry style, experience, and passion for beauty..."
                />
              ) : (
                <p style={{ color: '#ddd', lineHeight: '1.6' }}>
                  {currentProfile?.bio ||
                    'Professional makeup artist specializing in beauty, fashion, and special effects makeup with a passion for enhancing natural beauty and creating stunning transformations.'}
                </p>
              )}
            </Card>

            {/* Makeup Portfolio */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>💄 Makeup Portfolio</h2>
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
              {currentProfile?.photos && currentProfile.photos.length > 0 ? (
                <div style={styles.portfolioGrid}>
                  {currentProfile.photos.map((photo, index) => (
                    <div key={index} style={styles.portfolioItem}>
                      <img 
                        src={`http://localhost:8001${photo}`} 
                        alt={`Makeup Look ${index + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="💄"
                  title="No Portfolio Photos"
                  description={isEditing ? "Upload photos to showcase your makeup looks" : "This makeup artist hasn't uploaded any portfolio photos yet"}
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

            {/* Tutorials & Tips */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎥 Tutorials & Tips</h2>
              
              {isEditing ? (
                <div>
                  {/* Add New Tutorial Form */}
                  <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <h4 style={{ color: 'white', marginBottom: '10px' }}>Add New Tutorial</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <input
                        type="text"
                        value={newTutorial.title}
                        onChange={(e) => setNewTutorial({ ...newTutorial, title: e.target.value })}
                        style={styles.formInput}
                        placeholder="Tutorial Title"
                      />
                      <textarea
                        value={newTutorial.description}
                        onChange={(e) => setNewTutorial({ ...newTutorial, description: e.target.value })}
                        style={{ ...styles.formInput, minHeight: '80px' }}
                        placeholder="Brief description of the tutorial"
                      />
                      <input
                        type="text"
                        value={newTutorial.videoUrl}
                        onChange={(e) => setNewTutorial({ ...newTutorial, videoUrl: e.target.value })}
                        style={styles.formInput}
                        placeholder="Video URL (YouTube/Vimeo)"
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Button type="primary" onClick={handleAddTutorial}>
                          Add Tutorial
                        </Button>
                        <Button 
                          type="secondary" 
                          onClick={() => setNewTutorial({ title: '', description: '', videoUrl: '' })}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Tutorials */}
                  {(editData.tutorials || []).map((tutorial, index) => (
                    <div key={index} style={styles.tutorialCard}>
                      <h4 style={{ color: 'white', marginBottom: '10px' }}>{tutorial.title}</h4>
                      <p style={{ color: '#ddd', fontSize: '14px', marginBottom: '10px' }}>{tutorial.description}</p>
                      <p style={{ color: '#ccc', fontSize: '12px', marginBottom: '10px' }}>{tutorial.videoUrl}</p>
                      <Button 
                        type="danger" 
                        onClick={() => handleRemoveTutorial(index)}
                        size="small"
                      >
                        Remove Tutorial
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {currentProfile?.tutorials && currentProfile.tutorials.length > 0 ? (
                    <div style={{ display: 'grid', gap: '20px' }}>
                      {currentProfile.tutorials.map((tutorial, index) => (
                        <div key={index} style={styles.tutorialCard}>
                          <div style={{ position: 'relative', paddingBottom: '56.25%', marginBottom: '15px' }}>
                            <iframe
                              src={tutorial.videoUrl}
                              title={`Tutorial: ${tutorial.title}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ 
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '8px' 
                              }}
                            />
                          </div>
                          <h4 style={{ color: 'white', marginBottom: '10px' }}>{tutorial.title}</h4>
                          <p style={{ color: '#ddd', fontSize: '14px', marginBottom: '15px' }}>{tutorial.description}</p>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <Button
                              type="primary"
                              onClick={() => window.open(tutorial.videoUrl, '_blank')}
                            >
                              Watch Tutorial
                            </Button>
                            <Button
                              type="secondary"
                              onClick={() => handleShareTutorial(tutorial)}
                            >
                              Share
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="🎥"
                      title="No Tutorials"
                      description={isEditing ? "Add tutorials to showcase your techniques" : "No tutorials have been added yet"}
                    />
                  )}
                </>
              )}
            </Card>

            {/* Notable Work & Publications */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🏆 Notable Work & Publications</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <textarea
                    value={editData.notableWork || ''}
                    onChange={(e) => handleInputChange('notableWork', e.target.value)}
                    style={styles.textarea}
                    placeholder="Describe your most notable projects, collaborations, or achievements..."
                  />
                  <textarea
                    value={editData.publicationFeatures || ''}
                    onChange={(e) => handleInputChange('publicationFeatures', e.target.value)}
                    style={styles.textarea}
                    placeholder="List any magazines, blogs, or publications that have featured your work..."
                  />
                  <textarea
                    value={editData.competitions || ''}
                    onChange={(e) => handleInputChange('competitions', e.target.value)}
                    style={styles.textarea}
                    placeholder="List any makeup competitions, contests, or awards you've won..."
                  />
                </div>
              ) : (
                <>
                  {(currentProfile?.notableWork || currentProfile?.publicationFeatures || currentProfile?.competitions) ? (
                    <div style={{ color: '#ddd', lineHeight: '1.6' }}>
                      {currentProfile?.notableWork && (
                        <div style={{ marginBottom: '15px' }}>
                          <h4 style={{ color: 'white', marginBottom: '8px' }}>Notable Work:</h4>
                          <p>{currentProfile.notableWork}</p>
                        </div>
                      )}
                      {currentProfile?.publicationFeatures && (
                        <div style={{ marginBottom: '15px' }}>
                          <h4 style={{ color: 'white', marginBottom: '8px' }}>Publications:</h4>
                          <p>{currentProfile.publicationFeatures}</p>
                        </div>
                      )}
                      {currentProfile?.competitions && (
                        <div style={{ marginBottom: '15px' }}>
                          <h4 style={{ color: 'white', marginBottom: '8px' }}>Awards & Competitions:</h4>
                          <p>{currentProfile.competitions}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon="🏆"
                      title="No Notable Work Listed"
                      description={isEditing ? "Add your achievements and publications" : "No notable work or publications listed yet"}
                    />
                  )}
                </>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div>
            {/* Makeup Types */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎨 Makeup Types</h2>
              {isEditing ? (
                <textarea
                  value={(editData.makeupTypes || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('makeupTypes', e.target.value)}
                  style={styles.textarea}
                  placeholder="Bridal Makeup, Editorial Makeup, Beauty Makeup, Special Effects (SFX), Fashion Makeup (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.makeupTypes?.length > 0 
                    ? currentProfile.makeupTypes 
                    : ['Beauty Makeup', 'Editorial', 'Bridal']).map((type, index) => (
                    <span key={index} style={styles.badge}>
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Techniques */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🛠️ Techniques</h2>
              {isEditing ? (
                <textarea
                  value={(editData.techniques || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('techniques', e.target.value)}
                  style={styles.textarea}
                  placeholder="Contouring & Highlighting, Color Correction, Airbrushing, False Lashes, Cut Crease (comma separated)"
                />
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(currentProfile?.techniques?.length > 0
                    ? currentProfile.techniques
                    : ['Contouring & Highlighting', 'Color Matching', 'Airbrush Makeup', 'Lash Application']).map((technique, index) => (
                    <div key={index} style={styles.skillItem}>
                      • {technique}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Client Types */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>👥 Client Types</h2>
              {isEditing ? (
                <textarea
                  value={(editData.clientTypes || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('clientTypes', e.target.value)}
                  style={styles.textarea}
                  placeholder="Brides, Models, Actors/Actresses, Musicians/Performers, Corporate Clients (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.clientTypes?.length > 0 
                    ? currentProfile.clientTypes 
                    : ['Brides', 'Models', 'Special Events']).map((clientType, index) => (
                    <span key={index} style={styles.badge}>
                      {clientType}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Preferred Brands */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>💎 Preferred Brands</h2>
              {isEditing ? (
                <textarea
                  value={(editData.preferredBrands || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('preferredBrands', e.target.value)}
                  style={styles.textarea}
                  placeholder="MAC, Urban Decay, Charlotte Tilbury, Fenty Beauty, NARS, Dior (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.preferredBrands?.length > 0 
                    ? currentProfile.preferredBrands 
                    : ['MAC Cosmetics', 'Urban Decay', 'Charlotte Tilbury']).map((brand, index) => (
                    <span key={index} style={styles.badge}>
                      {brand}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Experience & Training */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎓 Experience & Training</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select
                    value={editData.yearsExperience || ''}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="">Select Experience Level</option>
                    <option value="0-1">0-1 years</option>
                    <option value="2-3">2-3 years</option>
                    <option value="4-6">4-6 years</option>
                    <option value="7-10">7-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                  <textarea
                    value={editData.education || ''}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    style={styles.textarea}
                    placeholder="Education, makeup schools, certifications..."
                  />
                  <textarea
                    value={editData.certifications || ''}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    style={styles.textarea}
                    placeholder="Professional certifications, awards, notable achievements..."
                  />
                </div>
              ) : (
                <div style={{ color: '#ddd', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: 'white' }}>Experience:</strong>{' '}
                    {currentProfile?.yearsExperience || 'Not specified'}
                  </div>
                  {currentProfile?.education && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ color: 'white' }}>Education:</strong>{' '}
                      {currentProfile.education}
                    </div>
                  )}
                  {currentProfile?.certifications && (
                    <div>
                      <strong style={{ color: 'white' }}>Certifications:</strong>{' '}
                      {currentProfile.certifications}
                    </div>
                  )}
                  {!currentProfile?.yearsExperience && !currentProfile?.education && !currentProfile?.certifications && (
                    <EmptyState
                      icon="🎓"
                      title="No Experience Listed"
                      description="Experience and training information hasn't been added yet"
                    />
                  )}
                </div>
              )}
            </Card>

            {/* Services & Rates */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>💰 Services & Rates</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.rates?.bridal || ''}
                    onChange={(e) => handleInputChange('rates.bridal', e.target.value)}
                    style={styles.formInput}
                    placeholder="Bridal Rate (e.g., $250)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.photoshoot || ''}
                    onChange={(e) => handleInputChange('rates.photoshoot', e.target.value)}
                    style={styles.formInput}
                    placeholder="Photoshoot Rate (e.g., $150)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.special_event || ''}
                    onChange={(e) => handleInputChange('rates.special_event', e.target.value)}
                    style={styles.formInput}
                    placeholder="Special Event Rate (e.g., $200)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.lesson || ''}
                    onChange={(e) => handleInputChange('rates.lesson', e.target.value)}
                    style={styles.formInput}
                    placeholder="Lesson Rate (e.g., $100)"
                  />
                  <select
                    value={editData.availability || ''}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="">Select Availability</option>
                    <option value="full-time">Available Full Time</option>
                    <option value="freelance">Freelance Projects</option>
                    <option value="by-appointment">By Appointment</option>
                  </select>
                </div>
              ) : (
                <>
                  {(currentProfile?.rates && Object.keys(currentProfile.rates).length > 0) || currentProfile?.availability ? (
                    <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentProfile?.rates?.bridal && (
                        <div>
                          <strong style={{ color: 'white' }}>Bridal:</strong> {currentProfile.rates.bridal}
                        </div>
                      )}
                      {currentProfile?.rates?.photoshoot && (
                        <div>
                          <strong style={{ color: 'white' }}>Photoshoot:</strong> {currentProfile.rates.photoshoot}
                        </div>
                      )}
                      {currentProfile?.rates?.special_event && (
                        <div>
                          <strong style={{ color: 'white' }}>Special Events:</strong> {currentProfile.rates.special_event}
                        </div>
                      )}
                      {currentProfile?.rates?.lesson && (
                        <div>
                          <strong style={{ color: 'white' }}>Lessons:</strong> {currentProfile.rates.lesson}
                        </div>
                      )}
                      {currentProfile?.availability && (
                        <div style={{ marginTop: '10px' }}>
                          <strong style={{ color: 'white' }}>Availability:</strong> {currentProfile.availability}
                        </div>
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

            {/* Business Information */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🏢 Business Information</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ color: 'white', fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={editData.mobileServices || false}
                      onChange={(e) => handleInputChange('mobileServices', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    I offer mobile services (travel to clients)
                  </label>
                  <textarea
                    value={editData.studioAccess || ''}
                    onChange={(e) => handleInputChange('studioAccess', e.target.value)}
                    style={styles.textarea}
                    placeholder="Describe your studio or workspace access..."
                  />
                  <textarea
                    value={(editData.equipmentOwned || []).join(', ')}
                    onChange={(e) => handleArrayInputChange('equipmentOwned', e.target.value)}
                    style={styles.textarea}
                    placeholder="Professional Brush Set, Airbrush System, Ring Light, Makeup Chair (comma separated)"
                  />
                  <textarea
                    value={(editData.workEnvironments || []).join(', ')}
                    onChange={(e) => handleArrayInputChange('workEnvironments', e.target.value)}
                    style={styles.textarea}
                    placeholder="Studio, On-location, Client's Home, Wedding Venues, Photo Studios (comma separated)"
                  />
                </div>
              ) : (
                <>
                  {(currentProfile?.mobileServices !== undefined || currentProfile?.studioAccess || 
                    (currentProfile?.equipmentOwned && currentProfile.equipmentOwned.length > 0) || 
                    (currentProfile?.workEnvironments && currentProfile.workEnvironments.length > 0)) ? (
                    <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <strong style={{ color: 'white' }}>Mobile Services:</strong>{' '}
                        {currentProfile?.mobileServices ? 'Yes' : 'No'}
                      </div>
                      {currentProfile?.studioAccess && (
                        <div>
                          <strong style={{ color: 'white' }}>Studio Access:</strong>{' '}
                          {currentProfile.studioAccess}
                        </div>
                      )}
                      {currentProfile?.equipmentOwned && currentProfile.equipmentOwned.length > 0 && (
                        <div>
                          <strong style={{ color: 'white' }}>Equipment:</strong>
                          <div style={{ marginTop: '5px' }}>
                            {currentProfile.equipmentOwned.map((equipment, index) => (
                              <div key={index} style={{ paddingLeft: '15px', fontSize: '14px' }}>
                                • {equipment}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {currentProfile?.workEnvironments && currentProfile.workEnvironments.length > 0 && (
                        <div>
                          <strong style={{ color: 'white' }}>Work Environments:</strong>
                          <div style={{ marginTop: '5px' }}>
                            {currentProfile.workEnvironments.map((env, index) => (
                              <div key={index} style={{ paddingLeft: '15px', fontSize: '14px' }}>
                                • {env}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon="🏢"
                      title="No Business Information"
                      description="Business details haven't been provided yet"
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
                          style={{ color: '#f093fb', textDecoration: 'none' }}
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
                    value={editData.socialMedia?.facebook || ''}
                    onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                    style={styles.formInput}
                    placeholder="📘 Facebook (Page URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.blog || ''}
                    onChange={(e) => handleInputChange('socialMedia.blog', e.target.value)}
                    style={styles.formInput}
                    placeholder="📝 Blog/Website URL"
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
                      {currentProfile?.socialMedia?.facebook && (
                        <a
                          href={currentProfile.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#1877F2',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>📘</span>
                          <span>Facebook</span>
                        </a>
                      )}
                      {currentProfile?.socialMedia?.blog && (
                        <a
                          href={currentProfile.socialMedia.blog}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#f093fb',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>📝</span>
                          <span>Blog/Website</span>
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

            {/* Kit Information */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🧰 Kit Information</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    value={editData.kitInformation || ''}
                    onChange={(e) => handleInputChange('kitInformation', e.target.value)}
                    style={styles.textarea}
                    placeholder="Describe your makeup kit, special tools, and professional equipment..."
                  />
                  <textarea
                    value={editData.hygieneStandards || ''}
                    onChange={(e) => handleInputChange('hygieneStandards', e.target.value)}
                    style={styles.textarea}
                    placeholder="Describe your sanitation practices and safety protocols..."
                  />
                </div>
              ) : (
                <>
                  {(currentProfile?.kitInformation || currentProfile?.hygieneStandards) ? (
                    <div style={{ color: '#ddd', lineHeight: '1.6' }}>
                      {currentProfile?.kitInformation && (
                        <div style={{ marginBottom: '15px' }}>
                          <h4 style={{ color: 'white', marginBottom: '8px' }}>Kit Details:</h4>
                          <p>{currentProfile.kitInformation}</p>
                        </div>
                      )}
                      {currentProfile?.hygieneStandards && (
                        <div>
                          <h4 style={{ color: 'white', marginBottom: '8px' }}>Hygiene Standards:</h4>
                          <p>{currentProfile.hygieneStandards}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon="🧰"
                      title="No Kit Information"
                      description="Kit details and hygiene standards haven't been provided yet"
                    />
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeupArtistProfile;