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
      const response = await fetch(
        `http://localhost:8001/api/profile/model/${profileId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditData(data);
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
      const response = await fetch(
        'http://localhost:8001/api/profile/update',
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
      const response = await fetch(
        'http://localhost:8001/api/profile/photos',
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
      }
    } catch (error) {
      alert('Failed to upload makeup portfolio');
    } finally {
      setUploading(false);
    }
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
                        background:
                          'linear-gradient(45deg, #4CAF50, #66BB6A)',
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
                      background:
                        'linear-gradient(45deg, #4CAF50, #66BB6A)',
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
                    onChange={(e) =>
                      setEditData({ ...editData, fullName: e.target.value })
                    }
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
                    onChange={(e) =>
                      setEditData({ ...editData, headline: e.target.value })
                    }
                    style={{ ...styles.input, fontSize: '18px' }}
                    placeholder="Makeup Specialization (e.g., Beauty & Editorial Makeup Artist)"
                  />
                  <input
                    type="text"
                    value={editData.location || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, location: e.target.value })
                    }
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
                      `${targetUser?.firstName} ${targetUser?.lastName}`}
                  </h1>
                  <p
                    style={{
                      color: '#ddd',
                      fontSize: '1.2rem',
                      margin: '0 0 15px 0'
                    }}
                  >
                    💄{' '}
                    {currentProfile?.headline ||
                      'Professional Makeup Artist'}
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
                    {currentProfile?.verified && (
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
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}
              >
                <h2
                  style={{
                    color: 'white',
                    fontSize: '1.3rem',
                    margin: 0
                  }}
                >
                  💄 Makeup Portfolio
                </h2>
                {isEditing && (
                  <div>
                    <input
                      type="file"
                      id="makeupPortfolio"
                      accept="image/*"
                      multiple
                      onChange={handlePortfolioUpload}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    <label
                      htmlFor="makeupPortfolio"
                      style={{
                        ...styles.button,
                        background:
                          'linear-gradient(45deg, #4CAF50, #66BB6A)',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'inline-block'
                      }}
                    >
                      {uploading ? 'Uploading...' : '+ Add Makeup Looks'}
                    </label>
                  </div>
                )}
              </div>

              {profile?.photos && profile.photos.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '15px'
                  }}
                >
                  {profile.photos.map((photo, index) => (
                    <div
                      key={index}
                      style={{
                        aspectRatio: '3/4',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={`http://localhost:8001${
                          typeof photo === 'string' ? photo : photo.url
                        }`}
                        alt={`Makeup look ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 0',
                    color: '#ddd'
                  }}
                >
                  <div
                    style={{
                      fontSize: '48px',
                      marginBottom: '15px'
                    }}
                  >
                    💄
                  </div>
                  <p>No makeup portfolio yet</p>
                  <p
                    style={{
                      fontSize: '14px',
                      marginTop: '10px'
                    }}
                  >
                    Showcase your best makeup looks, transformations, and
                    artistry work
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Makeup Specializations */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                🎨 Specializations
              </h2>
              {isEditing ? (
                <textarea
                  value={(editData.specializations || []).join(', ')}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      specializations: e
                        .target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s)
                    })
                  }
                  style={{
                    ...styles.input,
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="Beauty, Editorial, Bridal, Special Effects, Film/TV, Fashion, Theatrical (comma separated)"
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  {(
                    currentProfile?.specializations || [
                      'Beauty Makeup',
                      'Editorial',
                      'Bridal'
                    ]
                  ).map((spec, index) => (
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
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Skills & Techniques */}
            <div style={styles.card}>
              <h2
                style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  marginBottom: '15px'
                }}
              >
                🛠️ Skills & Techniques
              </h2>
              {isEditing ? (
                <textarea
                  value={(editData.skills || []).join(', ')}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      skills: e
                        .target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s)
                    })
                  }
                  style={{
                    ...styles.input,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Contouring, Color Theory, Airbrush, Prosthetics, Hair Styling, Lash Application (comma separated)"
                />
              ) : (
                <div
                  style={{
                    color: '#ddd',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {(
                    currentProfile?.skills || [
                      'Contouring & Highlighting',
                      'Color Matching',
                      'Airbrush Makeup',
                      'Lash Application'
                    ]
                  ).map((skill, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      • {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Brands & Products */}
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
                  value={(editData.preferredLocations || []).join(', ')}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      preferredLocations: e
                        .target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s)
                    })
                  }
                  style={{
                    ...styles.input,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="MAC, Urban Decay, Charlotte Tilbury, Fenty Beauty, NARS, Dior (comma separated)"
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  {(
                    currentProfile?.preferredLocations || [
                      'MAC Cosmetics',
                      'Urban Decay',
                      'Charlotte Tilbury'
                    ]
                  ).map((brand, index) => (
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
                <textarea
                  value={editData.experience || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, experience: e.target.value })
                  }
                  style={{
                    ...styles.input,
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="Makeup school, certifications, notable clients, publications, years of experience..."
                />
              ) : (
                <div style={{ color: '#ddd', lineHeight: '1.6' }}>
                  <p>
                    {currentProfile?.experience ||
                      'Certified makeup artist with extensive training in beauty, editorial, and special effects makeup techniques.'}
                  </p>
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
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <input
                    type="number"
                    value={editData.rate?.hourly || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        rate: {
                          ...editData.rate,
                          hourly: e.target.value
                        }
                      })
                    }
                    style={styles.input}
                    placeholder="Hourly Rate (USD)"
                  />
                  <input
                    type="number"
                    value={editData.rate?.daily || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        rate: {
                          ...editData.rate,
                          daily: e.target.value
                        }
                      })
                    }
                    style={styles.input}
                    placeholder="Event/Shoot Rate (USD)"
                  />
                  <textarea
                    value={(editData.preferredTypes || []).join(', ')}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        preferredTypes: e
                          .target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter((s) => s)
                      })
                    }
                    style={{
                      ...styles.input,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="Bridal Makeup, Photo Shoots, Events, Lessons, Touch-ups (comma separated)"
                  />
                  <select
                    value={editData.availability || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, availability: e.target.value })
                    }
                    style={styles.input}
                  >
                    <option value="">Select Availability</option>
                    <option value="full-time">Available Full Time</option>
                    <option value="freelance">Freelance Projects</option>
                    <option value="weekends-only">Weekends Only</option>
                    <option value="events-only">Events Only</option>
                    <option value="limited">Limited Availability</option>
                  </select>
                </div>
              ) : (
                <div
                  style={{
                    color: '#ddd',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div>
                    <strong style={{ color: 'white' }}>Hourly Rate:</strong> $
                    {currentProfile?.rate?.hourly || 'Contact for rates'}
                  </div>
                  <div>
                    <strong style={{ color: 'white' }}>Event Rate:</strong> $
                    {currentProfile?.rate?.daily || 'Contact for rates'}
                  </div>
                  <div>
                    <strong style={{ color: 'white' }}>Services:</strong>
                  </div>
                  {(currentProfile?.preferredTypes || [
                    'Bridal Makeup',
                    'Photo Shoots',
                    'Special Events'
                  ]).map((service, index) => (
                    <div
                      key={index}
                      style={{
                        paddingLeft: '15px',
                        fontSize: '14px'
                      }}
                    >
                      • {service}
                    </div>
                  ))}
                  <div style={{ marginTop: '10px' }}>
                    <strong style={{ color: 'white' }}>Availability:</strong>{' '}
                    {currentProfile?.availability || 'Contact to discuss'}
                  </div>
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
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}
              >
                {isEditing ? (
                  <>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      style={styles.input}
                      placeholder="✉️ Email"
                    />
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      style={styles.input}
                      placeholder="📞 Phone"
                    />
                    <input
                      type="url"
                      value={editData.website || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, website: e.target.value })
                      }
                      style={styles.input}
                      placeholder="🌐 Portfolio Website"
                    />
                  </>
                ) : (
                  <>
                    {currentProfile?.email && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <span style={{ color: '#ccc' }}>✉️</span>
                        <span style={{ color: 'white' }}>
                          {currentProfile.email}
                        </span>
                      </div>
                    )}
                    {currentProfile?.phone && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <span style={{ color: '#ccc' }}>📞</span>
                        <span style={{ color: 'white' }}>
                          {currentProfile.phone}
                        </span>
                      </div>
                    )}
                    {currentProfile?.website && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <span style={{ color: '#ccc' }}>🌐</span>
                        <a
                          href={currentProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#f093fb',
                            textDecoration: 'none'
                          }}
                        >
                          Portfolio Website
                        </a>
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
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <input
                    type="text"
                    value={editData.socialMedia?.instagram || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        socialMedia: {
                          ...editData.socialMedia,
                          instagram: e.target.value
                        }
                      })
                    }
                    style={styles.input}
                    placeholder="📷 Instagram (@username or URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.tiktok || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        socialMedia: {
                          ...editData.socialMedia,
                          tiktok: e.target.value
                        }
                      })
                    }
                    style={styles.input}
                    placeholder="🎵 TikTok (@username or URL)"
                  />
                  <input
                    type="text"
                    value={editData.socialMedia?.youtube || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        socialMedia: {
                          ...editData.socialMedia,
                          youtube: e.target.value
                        }
                      })
                    }
                    style={styles.input}
                    placeholder="🎥 YouTube (Channel URL)"
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {currentProfile?.socialMedia?.instagram && (
                    <a
                      href={
                        currentProfile.socialMedia.instagram.startsWith('http')
                          ? currentProfile.socialMedia.instagram
                          : `https://instagram.com/${currentProfile.socialMedia.instagram.replace(
                              '@',
                              ''
                            )}`
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
                          : `https://tiktok.com/@${currentProfile.socialMedia.tiktok.replace(
                              '@',
                              ''
                            )}`
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
                  {(!currentProfile?.socialMedia ||
                    (!currentProfile.socialMedia.instagram &&
                      !currentProfile.socialMedia.tiktok &&
                      !currentProfile.socialMedia.youtube)) && (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                      No social media links
                    </span>
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
