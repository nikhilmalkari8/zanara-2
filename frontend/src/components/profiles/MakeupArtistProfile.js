import React, { useState, useEffect } from 'react';

const MakeupArtistProfile = ({
  profileId,
  user,
  targetUser,
  onBack,
  onConnect,
  onMessage
}) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [newTutorial, setNewTutorial] = useState({ title: '', description: '', videoUrl: '' });

  const isOwnProfile = user && (
    user._id === targetUser._id ||
    user.id === targetUser.id ||
    user._id === profileId ||
    user.id === profileId
  );

  useEffect(() => {
    fetchMakeupArtistProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const fetchMakeupArtistProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use the new professional profile endpoint
      const response = await fetch(
        `http://localhost:8001/api/professional-profile/${profileId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditData(data);
      } else {
        console.error('Failed to fetch makeup artist profile:', response.status);
      }
    } catch (error) {
      console.error('Error loading makeup artist profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use the new professional profile update endpoint
      const response = await fetch(
        'http://localhost:8001/api/professional-profile/update',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(editData)
        }
      );

      if (response.ok) {
        await fetchMakeupArtistProfile();
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
    files.forEach((file) => formData.append('portfolioPhotos', file));

    try {
      const token = localStorage.getItem('token');
      // Use the new professional profile photos endpoint
      const response = await fetch(
        'http://localhost:8001/api/professional-profile/photos',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedPhotos = [...(profile.photos || []), ...data.photos];
        setProfile({ ...profile, photos: updatedPhotos });
        setEditData({ ...editData, photos: updatedPhotos });
        alert(`${files.length} makeup looks uploaded successfully!`);
      } else {
        alert('Failed to upload makeup portfolio');
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload makeup portfolio');
    } finally {
      setUploading(false);
    }
  };

  const handleArrayInputChange = (field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setEditData({ ...editData, [field]: arrayValue });
  };

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

  const handleAddTutorial = () => {
    // Implementation of handleAddTutorial function
  };

  const handleShareTutorial = (tutorial) => {
    // Implementation of handleShareTutorial function
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
    tutorialCard: {
      background: 'rgba(255,255,255,0.1)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.2)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: '18px',
            marginTop: '50px'
          }}
        >
          Loading makeup artist profile...
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
          <button
            onClick={onBack}
            style={{
              ...styles.button,
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            ← Back
          </button>
          <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>
            💄 Makeup Artist Profile
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
                      onClick={() => {
                        setEditData(profile);
                        setIsEditing(false);
                      }}
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

        {/* Profile Header */}
        <div style={styles.card}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}
                >
                  <input
                    type="text"
                    value={editData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    style={{
                      ...styles.input,
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    value={editData.headline || ''}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    style={{ ...styles.input, fontSize: '18px' }}
                    placeholder="Professional Headline (e.g., Beauty & Editorial Makeup Artist)"
                  />
                  <input
                    type="text"
                    value={editData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    style={styles.input}
                    placeholder="📍 Location"
                  />
                </div>
              ) : (
                <>
                  <h1
                    style={{
                      color: 'white',
                      fontSize: '2rem',
                      margin: '0 0 10px 0'
                    }}
                  >
                    {currentProfile?.fullName ||
                      `${targetUser?.firstName} ${targetUser?.lastName}` ||
                      'Makeup Artist'}
                  </h1>
                  <p
                    style={{
                      color: '#ddd',
                      fontSize: '1.2rem',
                      margin: '0 0 15px 0'
                    }}
                  >
                    💄 {currentProfile?.headline || 'Professional Makeup Artist'}
                  </p>
                  <div
                    style={{
                      color: '#ccc',
                      fontSize: '14px',
                      display: 'flex',
                      gap: '20px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span>
                      📍 {currentProfile?.location || 'Location not set'}
                    </span>
                    <span>
                      🔗 {currentProfile?.connectionsCount || 0} connections
                    </span>
                    {currentProfile?.isVerified && (
                      <span style={{ color: '#4CAF50' }}>✓ Verified</span>
                    )}
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px'
          }}
        >
          {/* Left Column */}
          <div>
            {/* About Section */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                ✨ About
              </h2>
              {isEditing ? (
                <textarea
                  value={editData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  style={{
                    ...styles.input,
                    minHeight: '120px',
                    resize: 'vertical'
                  }}
                  placeholder="Describe your makeup artistry style, experience, and passion for beauty..."
                />
              ) : (
                <p style={{ color: '#ddd', lineHeight: '1.6' }}>
                  {currentProfile?.bio ||
                    'Professional makeup artist specializing in beauty, fashion, and special effects makeup with a passion for enhancing natural beauty and creating stunning transformations.'}
                </p>
              )}
            </div>

            {/* Makeup Portfolio */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>💄 Makeup Portfolio</h2>
              
              {/* Tutorial Integration */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '10px' }}>Tutorials & Tips</h3>
                {isEditing ? (
                  <div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Add New Tutorial</label>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <input
                          type="text"
                          value={newTutorial.title}
                          onChange={(e) => setNewTutorial({ ...newTutorial, title: e.target.value })}
                          style={styles.input}
                          placeholder="Tutorial Title"
                        />
                        <textarea
                          value={newTutorial.description}
                          onChange={(e) => setNewTutorial({ ...newTutorial, description: e.target.value })}
                          style={{ ...styles.input, minHeight: '80px' }}
                          placeholder="Brief description of the tutorial"
                        />
                        <input
                          type="text"
                          value={newTutorial.videoUrl}
                          onChange={(e) => setNewTutorial({ ...newTutorial, videoUrl: e.target.value })}
                          style={styles.input}
                          placeholder="Video URL (YouTube/Vimeo)"
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={handleAddTutorial}
                            style={styles.button}
                          >
                            Add Tutorial
                          </button>
                          <button
                            onClick={() => setNewTutorial({ title: '', description: '', videoUrl: '' })}
                            style={{ ...styles.button, background: 'rgba(255,255,255,0.1)' }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {currentProfile?.tutorials?.map((tutorial, index) => (
                      <div key={index} style={styles.tutorialCard}>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', marginBottom: '15px' }}>
                          <iframe
                            src={tutorial.videoUrl}
                            title={`Tutorial: ${tutorial.title}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ width: '100%', aspectRatio: '16/9', borderRadius: '8px' }}
                          />
                        </div>
                        <h4 style={{ color: 'white', marginBottom: '10px' }}>{tutorial.title}</h4>
                        <p style={{ color: '#ddd', fontSize: '14px', marginBottom: '15px' }}>{tutorial.description}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => window.open(tutorial.videoUrl, '_blank')}
                            style={styles.button}
                          >
                            Watch Tutorial
                          </button>
                          <button
                            onClick={() => handleShareTutorial(tutorial)}
                            style={{ ...styles.button, background: 'rgba(255,255,255,0.1)' }}
                          >
                            Share
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notable Work & Publications */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                🏆 Notable Work & Publications
              </h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <textarea
                    value={editData.notableWork || ''}
                    onChange={(e) => handleInputChange('notableWork', e.target.value)}
                    style={{
                      ...styles.input,
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Describe your most notable projects, collaborations, or achievements..."
                  />
                  <textarea
                    value={editData.publicationFeatures || ''}
                    onChange={(e) => handleInputChange('publicationFeatures', e.target.value)}
                    style={{
                      ...styles.input,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="List any magazines, blogs, or publications that have featured your work..."
                  />
                  <textarea
                    value={editData.competitions || ''}
                    onChange={(e) => handleInputChange('competitions', e.target.value)}
                    style={{
                      ...styles.input,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="List any makeup competitions, contests, or awards you've won..."
                  />
                </div>
              ) : (
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
                  {!currentProfile?.notableWork && !currentProfile?.publicationFeatures && !currentProfile?.competitions && (
                    <p style={{ fontStyle: 'italic', color: '#999' }}>
                      No notable work or publications listed yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Makeup Types */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                🎨 Makeup Types
              </h2>
              {isEditing ? (
                <textarea
                  value={(editData.makeupTypes || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('makeupTypes', e.target.value)}
                  style={{
                    ...styles.input,
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="Bridal Makeup, Editorial Makeup, Beauty Makeup, Special Effects (SFX), Fashion Makeup (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.makeupTypes || ['Beauty Makeup', 'Editorial', 'Bridal']).map((type, index) => (
                    <span
                      key={index}
                      style={{
                        background: 'rgba(240, 147, 251, 0.2)',
                        color: '#f093fb',
                        padding: '8px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        border: '1px solid rgba(240, 147, 251, 0.3)'
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Techniques */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                🛠️ Techniques
              </h2>
              {isEditing ? (
                <textarea
                  value={(editData.techniques || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('techniques', e.target.value)}
                  style={{
                    ...styles.input,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Contouring & Highlighting, Color Correction, Airbrushing, False Lashes, Cut Crease (comma separated)"
                />
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(currentProfile?.techniques || ['Contouring & Highlighting', 'Color Matching', 'Airbrush Makeup', 'Lash Application']).map((technique, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      • {technique}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Types */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                👥 Client Types
              </h2>
              {isEditing ? (
                <textarea
                  value={(editData.clientTypes || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('clientTypes', e.target.value)}
                  style={{
                    ...styles.input,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Brides, Models, Actors/Actresses, Musicians/Performers, Corporate Clients (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.clientTypes || ['Brides', 'Models', 'Special Events']).map((clientType, index) => (
                    <span
                      key={index}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#ddd',
                        padding: '6px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {clientType}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Brands */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                💎 Preferred Brands
              </h2>
              {isEditing ? (
                <textarea
                  value={(editData.preferredBrands || []).join(', ')}
                  onChange={(e) => handleArrayInputChange('preferredBrands', e.target.value)}
                  style={{
                    ...styles.input,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="MAC, Urban Decay, Charlotte Tilbury, Fenty Beauty, NARS, Dior (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.preferredBrands || ['MAC Cosmetics', 'Urban Decay', 'Charlotte Tilbury']).map((brand, index) => (
                    <span
                      key={index}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#ddd',
                        padding: '6px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Experience & Training */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                🎓 Experience & Training
              </h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select
                    value={editData.yearsExperience || ''}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    style={styles.input}
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
                    style={{
                      ...styles.input,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="Education, makeup schools, certifications..."
                  />
                  <textarea
                    value={editData.certifications || ''}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    style={{
                      ...styles.input,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
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
                </div>
              )}
            </div>

            {/* Services & Rates */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                💰 Services & Rates
              </h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.rates?.bridal || ''}
                    onChange={(e) => handleInputChange('rates.bridal', e.target.value)}
                    style={styles.input}
                    placeholder="Bridal Rate (e.g., $250)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.photoshoot || ''}
                    onChange={(e) => handleInputChange('rates.photoshoot', e.target.value)}
                    style={styles.input}
                    placeholder="Photoshoot Rate (e.g., $150)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.special_event || ''}
                    onChange={(e) => handleInputChange('rates.special_event', e.target.value)}
                    style={styles.input}
                    placeholder="Special Event Rate (e.g., $200)"
                  />
                  <input
                    type="text"
                    value={editData.rates?.lesson || ''}
                    onChange={(e) => handleInputChange('rates.lesson', e.target.value)}
                    style={styles.input}
                    placeholder="Lesson Rate (e.g., $100)"
                  />
                  <select
                    value={editData.availability || ''}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    style={styles.input}
                  >
                    <option value="">Select Availability</option>
                    <option value="full-time">Available Full Time</option>
                    <option value="freelance">Freelance Projects</option>
                    <option value="by-appointment">By Appointment</option>
                  </select>
                </div>
              ) : (
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
                  {(!currentProfile?.rates || Object.keys(currentProfile.rates).length === 0) && (
                    <div style={{ fontStyle: 'italic', color: '#999' }}>
                      Contact for rates and availability
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Business Information */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                🏢 Business Information
              </h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ color: 'white', fontSize: '14px', marginBottom: '5px' }}>
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
                    style={{
                      ...styles.input,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="Describe your studio or workspace access..."
                  />
                  <textarea
                    value={(editData.equipmentOwned || []).join(', ')}
                    onChange={(e) => handleArrayInputChange('equipmentOwned', e.target.value)}
                    style={{
                      ...styles.input,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="Professional Brush Set, Airbrush System, Ring Light, Makeup Chair (comma separated)"
                  />
                  <textarea
                    value={(editData.workEnvironments || []).join(', ')}
                    onChange={(e) => handleArrayInputChange('workEnvironments', e.target.value)}
                    style={{
                      ...styles.input,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="Studio, On-location, Client's Home, Wedding Venues, Photo Studios (comma separated)"
                  />
                </div>
              ) : (
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
              )}
            </div>

            {/* Contact Info */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                📞 Contact
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {isEditing ? (
                  <>
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={styles.input}
                      placeholder="📞 Phone Number"
                    />
                    <input
                      type="url"
                      value={editData.portfolioWebsite || ''}
                      onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                      style={styles.input}
                      placeholder="🌐 Portfolio Website"
                    />
                  </>
                ) : (
                  <>
                    {currentProfile?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#ccc' }}>📞</span>
                        <span style={{ color: 'white' }}>{currentProfile.phone}</span>
                      </div>
                    )}
                    {currentProfile?.portfolioWebsite && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    {!currentProfile?.phone && !currentProfile?.portfolioWebsite && (
                      <div style={{ fontStyle: 'italic', color: '#999' }}>
                        No contact information provided
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Social Media */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                📱 Social Media
              </h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editData.socialMedia?.instagram || ''}
                    onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                    style={styles.input}
                    placeholder="📷 Instagram (@username or URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.tiktok || ''}
                    onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                    style={styles.input}
                    placeholder="🎵 TikTok (@username or URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.youtube || ''}
                    onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                    style={styles.input}
                    placeholder="🎥 YouTube (Channel URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.facebook || ''}
                    onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                    style={styles.input}
                    placeholder="📘 Facebook (Page URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.blog || ''}
                    onChange={(e) => handleInputChange('socialMedia.blog', e.target.value)}
                    style={styles.input}
                    placeholder="📝 Blog/Website URL"
                  />
                </div>
              ) : (
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
                  {(!currentProfile?.socialMedia ||
                    (!currentProfile.socialMedia.instagram &&
                      !currentProfile.socialMedia.tiktok &&
                      !currentProfile.socialMedia.youtube &&
                      !currentProfile.socialMedia.facebook &&
                      !currentProfile.socialMedia.blog)) && (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                      No social media links
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Kit Information */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                🧰 Kit Information
              </h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    value={editData.kitInformation || ''}
                    onChange={(e) => handleInputChange('kitInformation', e.target.value)}
                    style={{
                      ...styles.input,
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Describe your makeup kit, special tools, and professional equipment..."
                  />
                  <textarea
                    value={editData.hygieneStandards || ''}
                    onChange={(e) => handleInputChange('hygieneStandards', e.target.value)}
                    style={{
                      ...styles.input,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="Describe your sanitation practices and safety protocols..."
                  />
                </div>
              ) : (
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
                  {!currentProfile?.kitInformation && !currentProfile?.hygieneStandards && (
                    <p style={{ fontStyle: 'italic', color: '#999' }}>
                      No kit information provided
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeupArtistProfile;