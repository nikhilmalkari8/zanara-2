import React, { useState, useEffect } from 'react';

const PhotographerProfile = ({ profileId, user, targetUser, onBack, onConnect, onMessage }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);

  const isOwnProfile = user && (
    user._id === targetUser._id || 
    user.id === targetUser.id ||
    user._id === profileId ||
    user.id === profileId
  );

  useEffect(() => {
    fetchPhotographerProfile();
  }, [profileId]);

  const fetchPhotographerProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/profile/model/${profileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditData(data);
      }
    } catch (error) {
      console.error('Error loading photographer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8001/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        await fetchPhotographerProfile();
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handlePortfolioUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('portfolioPhotos', file));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/profile/photos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const updatedPhotos = [...(profile.photos || []), ...data.photos];
        const updatedProfile = { ...profile, photos: updatedPhotos };
        setProfile(updatedProfile);
        setEditData(updatedProfile);
        alert(`${files.length} photos uploaded successfully!`);
      }
    } catch (error) {
      console.error('Portfolio upload error:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)', // Photographer green theme
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
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', color: 'white', fontSize: '18px', marginTop: '50px' }}>
          Loading photographer profile...
        </div>
      </div>
    );
  }

  const currentProfile = isEditing ? editData : profile;

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onBack} style={{
            ...styles.button,
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            ← Back
          </button>
          <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>
            📸 Photographer Profile
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isOwnProfile && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      style={{
                        ...styles.button,
                        background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                        color: 'white'
                      }}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        ...styles.button,
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      ...styles.button,
                      background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                      color: 'white'
                    }}
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
            background: currentProfile?.coverPhoto 
              ? `url(http://localhost:8001${currentProfile.coverPhoto}) center/cover`
              : 'linear-gradient(45deg, #26de81, #20bf6b)',
            borderRadius: '15px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {!currentProfile?.coverPhoto && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'white',
                fontSize: '18px'
              }}>
                📸 Add your signature shot as cover
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
            {currentProfile?.profilePicture ? (
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
                📸
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
                    placeholder="Photography Specialization (e.g., Fashion & Portrait Photographer)"
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
                    {currentProfile?.fullName || targetUser?.firstName + ' ' + targetUser?.lastName}
                  </h1>
                  <p style={{ color: '#ddd', fontSize: '1.2rem', margin: '0 0 15px 0' }}>
                    📸 {currentProfile?.headline || 'Professional Photographer'}
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
                <button 
                  onClick={onConnect}
                  style={{
                    ...styles.button,
                    background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                    color: 'white'
                  }}
                >
                  Connect
                </button>
                <button 
                  onClick={onMessage}
                  style={{
                    ...styles.button,
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
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
                  value={editData.bio || ''}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
                  placeholder="Tell clients about your photography style, experience, and what makes your work unique..."
                />
              ) : (
                <p style={{ color: '#ddd', lineHeight: '1.6' }}>
                  {currentProfile?.bio || 'Professional photographer specializing in fashion and commercial work.'}
                </p>
              )}
            </div>

            {/* Photography Portfolio */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>📸 Photography Portfolio</h2>
                {isEditing && (
                  <div>
                    <input
                      type="file"
                      id="photographyPortfolio"
                      accept="image/*"
                      multiple
                      onChange={handlePortfolioUpload}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    <label
                      htmlFor="photographyPortfolio"
                      style={{
                        ...styles.button,
                        background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'inline-block'
                      }}
                    >
                      {uploading ? 'Uploading...' : '+ Add Photos'}
                    </label>
                  </div>
                )}
              </div>
              
              {profile?.photos && profile.photos.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '15px'
                }}>
                  {profile.photos.map((photo, index) => (
                    <div 
                      key={index} 
                      style={{
                        aspectRatio: '3/2',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <img 
                        src={`http://localhost:8001${typeof photo === 'string' ? photo : photo.url}`}
                        alt={`Photography work ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'opacity 0.3s ease'
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#ddd' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📸</div>
                  <p>No photography portfolio yet</p>
                  <p style={{ fontSize: '14px', marginTop: '10px' }}>
                    Showcase your best fashion, commercial, and artistic photography work
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Photography Specializations */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>📋 Specializations</h2>
              {isEditing ? (
                <textarea
                  value={(editData.specializations || []).join(', ')}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    specializations: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Fashion Photography, Portrait, Commercial, Product, Editorial, Beauty, Lifestyle (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.specializations || ['Fashion Photography', 'Portrait', 'Commercial']).map((spec, index) => (
                    <span 
                      key={index}
                      style={{
                        background: 'rgba(38, 222, 129, 0.2)',
                        color: '#26de81',
                        padding: '8px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        border: '1px solid rgba(38, 222, 129, 0.3)'
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Equipment & Skills */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎛️ Equipment & Skills</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    value={(editData.skills || []).join(', ')}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                    placeholder="Canon 5D Mark IV, Studio Lighting, Photoshop, Lightroom, Color Grading (comma separated)"
                  />
                </div>
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(currentProfile?.skills || ['Canon 5D Mark IV', 'Studio Lighting', 'Adobe Creative Suite']).map((skill, index) => (
                    <div key={index} style={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      padding: '8px 12px', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}>
                      • {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rates & Availability */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>💰 Rates & Availability</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                    placeholder="Day Rate (USD)"
                  />
                  <select
                    value={editData.availability || ''}
                    onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Select Availability</option>
                    <option value="full-time">Available Full Time</option>
                    <option value="freelance">Freelance Projects</option>
                    <option value="weekends-only">Weekends Only</option>
                    <option value="limited">Limited Availability</option>
                  </select>
                </div>
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong style={{ color: 'white' }}>Hourly Rate:</strong> ${currentProfile?.rate?.hourly || 'Contact for rates'}</div>
                  <div><strong style={{ color: 'white' }}>Day Rate:</strong> ${currentProfile?.rate?.daily || 'Contact for rates'}</div>
                  <div><strong style={{ color: 'white' }}>Availability:</strong> {currentProfile?.availability || 'Contact to inquire'}</div>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>📞 Contact</h2>
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
                      placeholder="🌐 Portfolio Website"
                    />
                  </>
                ) : (
                  <>
                    {currentProfile?.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#ccc' }}>✉️</span>
                        <span style={{ color: 'white' }}>{currentProfile.email}</span>
                      </div>
                    )}
                    {currentProfile?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#ccc' }}>📞</span>
                        <span style={{ color: 'white' }}>{currentProfile.phone}</span>
                      </div>
                    )}
                    {currentProfile?.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#ccc' }}>🌐</span>
                        <a href={currentProfile.website} target="_blank" rel="noopener noreferrer" 
                           style={{ color: '#26de81', textDecoration: 'none' }}>
                          Portfolio Website
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotographerProfile;