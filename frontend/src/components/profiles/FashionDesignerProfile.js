// src/components/profiles/FashionDesignerProfile.js
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

const FashionDesignerProfile = ({ profileId, user, targetUser, onBack, onConnect, onMessage }) => {
  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [notification, setNotification] = useState({ message: '', type: '', show: false });

  // Check if viewing own profile
  const isOwnProfile = user && (
    user._id === targetUser?._id || 
    user.id === targetUser?.id ||
    user._id === profileId ||
    user.id === profileId
  );

  // Fetch profile data
  useEffect(() => {
    fetchDesignerProfile();
    if (!isOwnProfile && profileId) {
      checkConnectionStatus();
    }
  }, [profileId, isOwnProfile]);

  const fetchDesignerProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfileById(profileId);
      setProfile(data);
      setEditData(data);
      setError(null);
    } catch (error) {
      console.error('Error loading designer profile:', error);
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
      await fetchDesignerProfile();
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
      showNotification(`${files.length} designs uploaded successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to upload designs', 'error');
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
        'fashion-designer');
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

  // Material management functions
  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...(editData.materials || [])];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
    setEditData({ ...editData, materials: updatedMaterials });
  };

  const handleRemoveMaterial = (index) => {
    const updatedMaterials = [...(editData.materials || [])];
    updatedMaterials.splice(index, 1);
    setEditData({ ...editData, materials: updatedMaterials });
  };

  const handleAddMaterial = () => {
    const newMaterial = { name: '', type: '', supplier: '' };
    setEditData({ 
      ...editData, 
      materials: [...(editData.materials || []), newMaterial] 
    });
  };

  // UI styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', // Designer red/orange theme
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
      background: 'rgba(255, 107, 107, 0.2)',
      color: '#ff6b6b',
      padding: '8px 12px',
      borderRadius: '15px',
      fontSize: '12px',
      border: '1px solid rgba(255, 107, 107, 0.3)',
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
    materialCard: {
      background: 'rgba(255,255,255,0.1)',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.2)',
      marginBottom: '10px'
    },
    techPackCard: {
      background: 'rgba(255,255,255,0.1)',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.2)'
    },
    uploadBox: {
      border: '2px dashed rgba(255,255,255,0.2)', 
      padding: '20px', 
      borderRadius: '8px',
      textAlign: 'center',
      cursor: 'pointer'
    },
    uploadLabel: {
      display: 'block',
      textAlign: 'center',
      padding: '20px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '8px',
      cursor: 'pointer'
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
            Loading fashion designer profile...
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
              ✂️ Fashion Designer Profile
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
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.2)',
                fontSize: '24px'
              }}>
                Fashion Designer
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
              '✂️'
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
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    style={{ ...styles.formInput, fontSize: '24px', fontWeight: 'bold' }}
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    value={editData.headline || ''}
                    onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                    style={{ ...styles.formInput, fontSize: '18px' }}
                    placeholder="Design Specialization (e.g., Sustainable Fashion Designer)"
                  />
                  <input
                    type="text"
                    value={editData.location || ''}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    style={styles.formInput}
                    placeholder="📍 Location"
                  />
                </div>
              ) : (
                <>
                  <h1 style={{ color: 'white', fontSize: '2rem', margin: '0 0 10px 0' }}>
                    {currentProfile?.fullName || targetUser?.firstName + ' ' + targetUser?.lastName}
                  </h1>
                  <p style={{ color: '#ddd', fontSize: '1.2rem', margin: '0 0 15px 0' }}>
                    ✂️ {currentProfile?.headline || 'Fashion Designer'}
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
            {/* Design Philosophy */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎨 Design Philosophy</h2>
              {isEditing ? (
                <textarea
                  value={editData.bio || ''}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  style={styles.textarea}
                  placeholder="Describe your design philosophy, inspiration, and what makes your aesthetic unique..."
                />
              ) : (
                <p style={{ color: '#ddd', lineHeight: '1.6' }}>
                  {currentProfile?.bio || 'A passionate fashion designer creating innovative and sustainable designs that blend contemporary aesthetics with timeless elegance.'}
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
              {currentProfile?.photos && currentProfile.photos.length > 0 ? (
                <div style={styles.portfolioGrid}>
                  {currentProfile.photos.map((photo, index) => (
                    <div key={index} style={styles.portfolioItem}>
                      <img 
                        src={`http://localhost:8001${photo}`} 
                        alt={`Design ${index + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📸"
                  title="No Portfolio Photos"
                  description={isEditing ? "Upload photos to showcase your designs" : "This designer hasn't uploaded any portfolio photos yet"}
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

            {/* Tech Packs */}
            <Card>
              <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '15px' }}>📝 Tech Packs</h3>
              {isEditing ? (
                <div style={styles.uploadBox}>
                  <input
                    type="file"
                    accept=".pdf,.zip,.rar"
                    id="techPackUpload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="techPackUpload" style={styles.uploadLabel}>
                    <span style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}>📎</span>
                    <p style={{ color: '#ddd', marginBottom: '5px' }}>Upload Tech Pack</p>
                    <p style={{ color: '#999', fontSize: '12px' }}>PDF, ZIP, or RAR files only</p>
                  </label>
                </div>
              ) : (
                <>
                  {currentProfile?.techPacks && currentProfile.techPacks.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                      {currentProfile.techPacks.map((pack, index) => (
                        <div key={index} style={styles.techPackCard}>
                          <div style={{ fontSize: '24px', marginBottom: '5px' }}>📄</div>
                          <p style={{ color: '#ddd', fontSize: '14px', marginBottom: '5px' }}>{pack.name}</p>
                          <a
                            href={pack.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#f093fb', fontSize: '12px' }}
                          >
                            View Tech Pack
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="📄"
                      title="No Tech Packs"
                      description={isEditing ? "Upload tech packs to showcase your design specifications" : "No tech packs have been added yet"}
                    />
                  )}
                </>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div>
            {/* Design Specializations */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🏷️ Specializations</h2>
              {isEditing ? (
                <textarea
                  value={(editData.specializations || []).join(', ')}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    specializations: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  style={styles.textarea}
                  placeholder="Womenswear, Menswear, Sustainable Fashion, Couture, Streetwear, Formal Wear (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.specializations?.length > 0 
                    ? currentProfile.specializations 
                    : ['Womenswear', 'Sustainable Fashion', 'Contemporary']).map((spec, index) => (
                    <span key={index} style={styles.badge}>
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Technical Skills */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>⚙️ Technical Skills</h2>
              {isEditing ? (
                <textarea
                  value={(editData.skills || []).join(', ')}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  style={styles.textarea}
                  placeholder="Pattern Making, Draping, CAD Design, Adobe Illustrator, Garment Construction, Tech Packs (comma separated)"
                />
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(currentProfile?.skills?.length > 0
                    ? currentProfile.skills
                    : ['Pattern Making', 'Adobe Illustrator', 'Garment Construction', 'Tech Pack Creation']).map((skill, index) => (
                    <div key={index} style={styles.skillItem}>
                      • {skill}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Material Library */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🧵 Material Library</h2>
              {isEditing ? (
                <div>
                  {(editData.materials || []).map((material, index) => (
                    <div key={index} style={styles.materialCard}>
                      <input
                        type="text"
                        value={material.name}
                        onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                        style={styles.formInput}
                        placeholder="Material name"
                      />
                      <input
                        type="text"
                        value={material.type}
                        onChange={(e) => handleMaterialChange(index, 'type', e.target.value)}
                        style={styles.formInput}
                        placeholder="Type"
                      />
                      <input
                        type="text"
                        value={material.supplier}
                        onChange={(e) => handleMaterialChange(index, 'supplier', e.target.value)}
                        style={styles.formInput}
                        placeholder="Supplier"
                      />
                      <Button 
                        type="danger" 
                        onClick={() => handleRemoveMaterial(index)}
                        size="small"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="secondary" 
                    onClick={handleAddMaterial}
                    style={{ width: '100%' }}
                  >
                    + Add Material
                  </Button>
                </div>
              ) : (
                <>
                  {currentProfile?.materials && currentProfile.materials.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                      {currentProfile.materials.map((material, index) => (
                        <div key={index} style={styles.materialCard}>
                          <h4 style={{ color: 'white', marginBottom: '5px' }}>{material.name}</h4>
                          <p style={{ color: '#ddd', fontSize: '14px' }}>Type: {material.type}</p>
                          <p style={{ color: '#ddd', fontSize: '14px' }}>Supplier: {material.supplier}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="🧵"
                      title="No Materials"
                      description={isEditing ? "Add materials to your library" : "No materials have been added yet"}
                    />
                  )}
                </>
              )}
            </Card>

            {/* Services & Availability */}
            <Card>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🤝 Services</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    value={(editData.preferredTypes || []).join(', ')}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      preferredTypes: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    style={styles.textarea}
                    placeholder="Custom Design, Consultation, Pattern Development, Collection Design, Freelance Projects (comma separated)"
                  />
                  <select
                    value={editData.availability || ''}
                    onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="">Select Availability</option>
                    <option value="full-time">Available for Full-Time Positions</option>
                    <option value="part-time">Part-Time</option>
                    <option value="project-based">Project Based</option>
                    <option value="freelance">Freelance Projects</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong style={{ color: 'white' }}>Services:</strong></div>
                  {(currentProfile?.preferredTypes?.length > 0
                    ? currentProfile.preferredTypes
                    : ['Custom Design', 'Consultation', 'Collection Development']).map((service, index) => (
                    <div key={index} style={{ paddingLeft: '15px', fontSize: '14px' }}>• {service}</div>
                  ))}
                  <div style={{ marginTop: '10px' }}>
                    <strong style={{ color: 'white' }}>Availability:</strong> {currentProfile?.availability || 'Contact to discuss'}
                  </div>
                </div>
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
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      style={styles.formInput}
                      placeholder="✉️ Email"
                    />
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      style={styles.formInput}
                      placeholder="📞 Phone"
                    />
                    <input
                      type="url"
                      value={editData.website || ''}
                      onChange={(e) => setEditData({ ...editData, website: e.target.value })}
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
                           style={{ color: '#ff6b6b', textDecoration: 'none' }}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FashionDesignerProfile;