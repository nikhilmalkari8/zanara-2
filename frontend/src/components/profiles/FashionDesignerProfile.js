import React, { useState, useEffect } from 'react';

const FashionDesignerProfile = ({ profileId, user, targetUser, onBack, onConnect, onMessage }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState([]);

  const isOwnProfile = user && (
    user._id === targetUser._id || 
    user.id === targetUser.id ||
    user._id === profileId ||
    user.id === profileId
  );

  useEffect(() => {
    fetchDesignerProfile();
  }, [profileId, fetchDesignerProfile]);

  const fetchDesignerProfile = async () => {
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
      console.error('Error loading designer profile:', error);
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
        await fetchDesignerProfile();
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
        setProfile({ ...profile, photos: updatedPhotos });
        setEditData({ ...editData, photos: updatedPhotos });
        alert(`${files.length} designs uploaded successfully!`);
      }
    } catch (error) {
      alert('Failed to upload designs');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (type, files) => {
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/profile/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'techPacks') {
          setEditData({ ...editData, techPacks: [...(editData.techPacks || []), ...data.files] });
        }
        alert('Files uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

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

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', // Designer red/orange theme
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
    techPackCard: {
      background: 'rgba(255,255,255,0.1)',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.2)'
    },
    materialCard: {
      background: 'rgba(255,255,255,0.1)',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.2)'
    },
    addButton: {
      background: 'rgba(255,255,255,0.1)',
      border: '1px dashed rgba(255,255,255,0.3)',
      color: '#ddd',
      padding: '15px',
      borderRadius: '8px',
      cursor: 'pointer',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    removeButton: {
      background: 'rgba(255,0,0,0.2)',
      border: 'none',
      color: '#ff6b6b',
      padding: '5px 10px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', color: 'white', fontSize: '18px', marginTop: '50px' }}>
          Loading fashion designer profile...
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
            ✂️ Fashion Designer Profile
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isOwnProfile && (
              <>
                {isEditing ? (
                  <>
                    <button onClick={handleSaveChanges} style={{
                      ...styles.button,
                      background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                      color: 'white'
                    }}>
                      Save Changes
                    </button>
                    <button onClick={() => setIsEditing(false)} style={{
                      ...styles.button,
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} style={{
                    ...styles.button,
                    background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                    color: 'white'
                  }}>
                    ✏️ Edit Profile
                  </button>
                )}
              </>
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
                    placeholder="Design Specialization (e.g., Sustainable Fashion Designer)"
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
                <button onClick={onConnect} style={{
                  ...styles.button,
                  background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                  color: 'white'
                }}>
                  Connect
                </button>
                <button onClick={onMessage} style={{
                  ...styles.button,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
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
            {/* Design Philosophy */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎨 Design Philosophy</h2>
              {isEditing ? (
                <textarea
                  value={editData.bio || ''}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
                  placeholder="Describe your design philosophy, inspiration, and what makes your aesthetic unique..."
                />
              ) : (
                <p style={{ color: '#ddd', lineHeight: '1.6' }}>
                  {currentProfile?.bio || 'A passionate fashion designer creating innovative and sustainable designs that blend contemporary aesthetics with timeless elegance.'}
                </p>
              )}
            </div>

            {/* Design Portfolio */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>📚 Design Portfolio</h2>
              
              {/* Tech Pack Upload Zone */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '10px' }}>Tech Packs</h3>
                {isEditing ? (
                  <div style={{ border: '2px dashed rgba(255,255,255,0.2)', padding: '20px', borderRadius: '8px' }}>
                    <input
                      type="file"
                      accept=".pdf,.zip,.rar"
                      onChange={(e) => handleFileUpload('techPacks', e.target.files)}
                      style={{ display: 'none' }}
                      id="techPackUpload"
                    />
                    <label
                      htmlFor="techPackUpload"
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '20px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}>📎</span>
                      <p style={{ color: '#ddd', marginBottom: '5px' }}>Upload Tech Pack</p>
                      <p style={{ color: '#999', fontSize: '12px' }}>PDF, ZIP, or RAR files only</p>
                    </label>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {currentProfile?.techPacks?.map((pack, index) => (
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
                )}
              </div>

              {/* Fabric/Material Library */}
              <div>
                <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '10px' }}>Material Library</h3>
                {isEditing ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                    {currentProfile?.materials?.map((material, index) => (
                      <div key={index} style={styles.materialCard}>
                        <input
                          type="text"
                          value={material.name}
                          onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                          style={styles.input}
                          placeholder="Material name"
                        />
                        <input
                          type="text"
                          value={material.type}
                          onChange={(e) => handleMaterialChange(index, 'type', e.target.value)}
                          style={styles.input}
                          placeholder="Type"
                        />
                        <input
                          type="text"
                          value={material.supplier}
                          onChange={(e) => handleMaterialChange(index, 'supplier', e.target.value)}
                          style={styles.input}
                          placeholder="Supplier"
                        />
                        <button
                          onClick={() => handleRemoveMaterial(index)}
                          style={styles.removeButton}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddMaterial}
                      style={styles.addButton}
                    >
                      + Add Material
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {currentProfile?.materials?.map((material, index) => (
                      <div key={index} style={styles.materialCard}>
                        <h4 style={{ color: 'white', marginBottom: '5px' }}>{material.name}</h4>
                        <p style={{ color: '#ddd', fontSize: '14px' }}>Type: {material.type}</p>
                        <p style={{ color: '#ddd', fontSize: '14px' }}>Supplier: {material.supplier}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Design Specializations */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🏷️ Specializations</h2>
              {isEditing ? (
                <textarea
                  value={(editData.specializations || []).join(', ')}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    specializations: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Womenswear, Menswear, Sustainable Fashion, Couture, Streetwear, Formal Wear (comma separated)"
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentProfile?.specializations || ['Womenswear', 'Sustainable Fashion', 'Contemporary']).map((spec, index) => (
                    <span key={index} style={{
                      background: 'rgba(255, 107, 107, 0.2)',
                      color: '#ff6b6b',
                      padding: '8px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      border: '1px solid rgba(255, 107, 107, 0.3)'
                    }}>
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Technical Skills */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>⚙️ Technical Skills</h2>
              {isEditing ? (
                <textarea
                  value={(editData.skills || []).join(', ')}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Pattern Making, Draping, CAD Design, Adobe Illustrator, Garment Construction, Tech Packs (comma separated)"
                />
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(currentProfile?.skills || ['Pattern Making', 'Adobe Illustrator', 'Garment Construction', 'Tech Pack Creation']).map((skill, index) => (
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

            {/* Education & Experience */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎓 Background</h2>
              {isEditing ? (
                <textarea
                  value={editData.experience || ''}
                  onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                  style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Fashion school, internships, work experience, awards, exhibitions..."
                />
              ) : (
                <div style={{ color: '#ddd', lineHeight: '1.6' }}>
                  <p>{currentProfile?.experience || 'Fashion Design graduate with experience in sustainable fashion and contemporary womenswear.'}</p>
                </div>
              )}
            </div>

            {/* Services & Collaboration */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🤝 Services</h2>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    value={(editData.preferredTypes || []).join(', ')}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      preferredTypes: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                    placeholder="Custom Design, Consultation, Pattern Development, Collection Design, Freelance Projects (comma separated)"
                  />
                  <select
                    value={editData.availability || ''}
                    onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Select Availability</option>
                    <option value="full-time">Available for Full-Time Positions</option>
                    <option value="freelance">Freelance Projects</option>
                    <option value="consultation">Consultation Only</option>
                    <option value="limited">Limited Availability</option>
                  </select>
                </div>
              ) : (
                <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong style={{ color: 'white' }}>Services:</strong></div>
                  {(currentProfile?.preferredTypes || ['Custom Design', 'Consultation', 'Collection Development']).map((service, index) => (
                    <div key={index} style={{ paddingLeft: '15px', fontSize: '14px' }}>• {service}</div>
                  ))}
                  <div style={{ marginTop: '10px' }}>
                    <strong style={{ color: 'white' }}>Availability:</strong> {currentProfile?.availability || 'Contact to discuss'}
                  </div>
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
                           style={{ color: '#ff6b6b', textDecoration: 'none' }}>
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

export default FashionDesignerProfile;