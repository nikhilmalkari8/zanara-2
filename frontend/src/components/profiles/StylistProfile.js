import React, { useState, useEffect } from 'react';

const StylistProfile = ({ profileId, user, targetUser, onBack, onConnect, onMessage }) => {
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
    fetchStylistProfile();
  }, [profileId]);

  const fetchStylistProfile = async () => {
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
      console.error('Error loading stylist profile:', error);
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
        await fetchStylistProfile();
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
        alert(`${files.length} styling photos uploaded successfully!`);
      }
    } catch (error) {
      alert('Failed to upload styling photos');
    } finally {
      setUploading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)', // Stylist purple theme
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
          Loading fashion stylist profile...
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
            👗 Fashion Stylist Profile
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
                   placeholder="Styling Specialization (e.g., Celebrity & Editorial Fashion Stylist)"
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
           {/* Styling Philosophy */}
           <div style={styles.card}>
             <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>✨ Styling Philosophy</h2>
             {isEditing ? (
               <textarea
                 value={editData.bio || ''}
                 onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                 style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
                 placeholder="Describe your styling approach, aesthetic vision, and what makes your work unique..."
               />
             ) : (
               <p style={{ color: '#ddd', lineHeight: '1.6' }}>
                 {currentProfile?.bio || 'Creating transformative styling experiences that empower clients through thoughtful wardrobe curation and trend-forward fashion choices.'}
               </p>
             )}
           </div>

           {/* Styling Portfolio */}
           <div style={styles.card}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
               <h2 style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>📸 Styling Portfolio</h2>
               {isEditing && (
                 <div>
                   <input
                     type="file"
                     id="stylingPortfolio"
                     accept="image/*"
                     multiple
                     onChange={handlePortfolioUpload}
                     style={{ display: 'none' }}
                     disabled={uploading}
                   />
                   <label htmlFor="stylingPortfolio" style={{
                     ...styles.button,
                     background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                     color: 'white',
                     fontSize: '12px',
                     cursor: 'pointer',
                     display: 'inline-block'
                   }}>
                     {uploading ? 'Uploading...' : '+ Add Styling Photos'}
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
                   <div key={index} style={{
                     aspectRatio: '3/4',
                     borderRadius: '8px',
                     overflow: 'hidden',
                     cursor: 'pointer',
                     position: 'relative'
                   }}>
                     <img 
                       src={`http://localhost:8001${typeof photo === 'string' ? photo : photo.url}`}
                       alt={`Styling work ${index + 1}`}
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
               <div style={{ textAlign: 'center', padding: '40px 0', color: '#ddd' }}>
                 <div style={{ fontSize: '48px', marginBottom: '15px' }}>👗</div>
                 <p>No styling portfolio yet</p>
                 <p style={{ fontSize: '14px', marginTop: '10px' }}>
                   Showcase your best styling work, client transformations, and fashion editorial shoots
                 </p>
               </div>
             )}
           </div>
         </div>

         {/* Right Column */}
         <div>
           {/* Styling Services */}
           <div style={styles.card}>
             <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🎯 Services</h2>
             {isEditing ? (
               <textarea
                 value={(editData.specializations || []).join(', ')}
                 onChange={(e) => setEditData({ 
                   ...editData, 
                   specializations: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                 })}
                 style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                 placeholder="Personal Styling, Editorial, Celebrity, Wardrobe Consulting, Event Styling, Brand Campaigns (comma separated)"
               />
             ) : (
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                 {(currentProfile?.specializations || ['Personal Styling', 'Editorial', 'Wardrobe Consulting']).map((spec, index) => (
                   <span key={index} style={{
                     background: 'rgba(165, 94, 234, 0.2)',
                     color: '#a55eea',
                     padding: '8px 12px',
                     borderRadius: '15px',
                     fontSize: '12px',
                     border: '1px solid rgba(165, 94, 234, 0.3)'
                   }}>
                     {spec}
                   </span>
                 ))}
               </div>
             )}
           </div>

           {/* Client Types */}
           <div style={styles.card}>
             <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>👥 Client Types</h2>
             {isEditing ? (
               <textarea
                 value={(editData.preferredTypes || []).join(', ')}
                 onChange={(e) => setEditData({ 
                   ...editData, 
                   preferredTypes: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                 })}
                 style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                 placeholder="Celebrities, Executives, Brides, Models, Fashion Brands, Influencers (comma separated)"
               />
             ) : (
               <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 {(currentProfile?.preferredTypes || ['Corporate Executives', 'Special Events', 'Personal Wardrobe']).map((type, index) => (
                   <div key={index} style={{ 
                     background: 'rgba(255, 255, 255, 0.05)', 
                     padding: '8px 12px', 
                     borderRadius: '8px',
                     fontSize: '14px'
                   }}>
                     • {type}
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Style Expertise */}
           <div style={styles.card}>
             <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>💎 Style Expertise</h2>
             {isEditing ? (
               <textarea
                 value={(editData.skills || []).join(', ')}
                 onChange={(e) => setEditData({ 
                   ...editData, 
                   skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                 })}
                 style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                 placeholder="Color Analysis, Body Type Styling, Trend Forecasting, Wardrobe Planning, Shopping, Closet Organization (comma separated)"
               />
             ) : (
               <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 {(currentProfile?.skills || ['Color Analysis', 'Wardrobe Planning', 'Trend Forecasting', 'Personal Shopping']).map((skill, index) => (
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

           {/* Experience & Credentials */}
           <div style={styles.card}>
             <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '15px' }}>🏆 Experience</h2>
             {isEditing ? (
               <textarea
                 value={editData.experience || ''}
                 onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                 style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                 placeholder="Fashion styling experience, notable clients, publications, certifications..."
               />
             ) : (
               <div style={{ color: '#ddd', lineHeight: '1.6' }}>
                 <p>{currentProfile?.experience || 'Professional fashion stylist with extensive experience in personal styling, editorial work, and wardrobe consulting.'}</p>
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
                   placeholder="Consultation Rate (USD/hour)"
                 />
                 <input
                   type="number"
                   value={editData.rate?.daily || ''}
                   onChange={(e) => setEditData({ 
                     ...editData, 
                     rate: { ...editData.rate, daily: e.target.value }
                   })}
                   style={styles.input}
                   placeholder="Styling Session Rate (USD/day)"
                 />
                 <select
                   value={editData.availability || ''}
                   onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
                   style={styles.input}
                 >
                   <option value="">Select Availability</option>
                   <option value="full-time">Available Full Time</option>
                   <option value="freelance">Freelance Projects</option>
                   <option value="consultation">Consultation Only</option>
                   <option value="weekends-only">Weekends Only</option>
                   <option value="limited">Limited Availability</option>
                 </select>
               </div>
             ) : (
               <div style={{ color: '#ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <div><strong style={{ color: 'white' }}>Consultation:</strong> ${currentProfile?.rate?.hourly || 'Contact for rates'}/hour</div>
                 <div><strong style={{ color: 'white' }}>Styling Session:</strong> ${currentProfile?.rate?.daily || 'Contact for rates'}/day</div>
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
                          style={{ color: '#a55eea', textDecoration: 'none' }}>
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

export default StylistProfile;