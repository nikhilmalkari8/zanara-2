import React, { useState, useEffect } from 'react';

const ModelProfilePage = ({ modelId, user, onBack, onConnect, onMessage }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

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
    fetchModelProfile();
  }, [modelId]);

  const fetchModelProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/profile/model/${modelId}`, {
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - revert changes
      setEditData(profile);
    }
    setIsEditing(!isEditing);
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
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      alert('Error updating profile');
    }
  };

  // Profile Picture Upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/profile/picture', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const updatedProfile = { ...profile, profilePicture: data.profilePicture };
        setProfile(updatedProfile);
        setEditData(updatedProfile);
      }
    } catch (error) {
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  // Cover Photo Upload
  const handleCoverPhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('coverPhoto', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/profile/cover-photo', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const updatedProfile = { ...profile, coverPhoto: data.coverPhoto };
        setProfile(updatedProfile);
        setEditData(updatedProfile);
      }
    } catch (error) {
      alert('Failed to upload cover photo');
    } finally {
      setUploading(false);
    }
  };

  // Portfolio Photos Upload
  const handlePortfolioPhotosUpload = async (event) => {
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
        const updatedPhotos = [...(ensureArray(profile.photos)), ...data.photos];
        const updatedProfile = { ...profile, photos: updatedPhotos };
        setProfile(updatedProfile);
        setEditData(updatedProfile);
      }
    } catch (error) {
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  // Remove Portfolio Photo
  const removePortfolioPhoto = async (photoIndex) => {
    const profilePhotos = ensureArray(profile.photos);
    const photoToRemove = profilePhotos[photoIndex];
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/profile/photos/${photoToRemove.id || photoIndex}`, {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={onBack} className="text-blue-600 hover:underline">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayPhotos = showAllPhotos ? ensureArray(profile.photos) : ensureArray(profile.photos).slice(0, 8);
  const isOwnProfile = user && user._id === profile.userId;
  const currentProfile = isEditing ? editData : profile;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button and Edit Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Profile' : 'Model Profile'}
          </h1>
          <div className="flex space-x-2">
            {isOwnProfile && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Cover Photo Section */}
        <div className="relative mb-6">
          <div className="h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg overflow-hidden relative">
            {currentProfile.coverPhoto ? (
              <img 
                src={currentProfile.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white text-lg">No cover photo</p>
              </div>
            )}
            
            {/* Edit Cover Photo Button */}
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <input
                  type="file"
                  id="coverPhoto"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="coverPhoto"
                  className="px-4 py-2 bg-white text-gray-800 rounded-lg cursor-pointer hover:bg-gray-100"
                >
                  {uploading ? 'Uploading...' : 'Change Cover Photo'}
                </label>
              </div>
            )}
          </div>
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-6">
            <div className="w-32 h-32 border-4 border-white rounded-full overflow-hidden bg-gray-200 relative">
              {currentProfile.profilePicture ? (
                <img 
                  src={currentProfile.profilePicture} 
                  alt={currentProfile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <span className="text-3xl">👤</span>
                </div>
              )}
              
              {/* Edit Profile Picture Button */}
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="profilePicture"
                    className="text-white text-xs cursor-pointer hover:underline"
                  >
                    {uploading ? '...' : '📷'}
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6" style={{ marginTop: '4rem' }}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editData.fullName || ''}
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    className="text-3xl font-bold text-gray-800 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent w-full"
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    value={editData.headline || ''}
                    onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                    className="text-xl text-gray-600 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent w-full"
                    placeholder="Professional Headline"
                  />
                  <input
                    type="text"
                    value={editData.location || ''}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="text-gray-500 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                    placeholder="📍 Location"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {currentProfile.fullName}
                  </h1>
                  <p className="text-xl text-gray-600 mb-3">
                    {currentProfile.headline || 'Professional Model'}
                  </p>
                  <div className="flex items-center text-gray-500 mb-4">
                    <span className="mr-4">📍 {currentProfile.location}</span>
                    <span className="mr-4">👥 {currentProfile.connectionsCount || 0} connections</span>
                    {currentProfile.verified && <span className="text-blue-500">✓ Verified</span>}
                  </div>
                </>
              )}
            </div>
            
            {!isOwnProfile && (
              <div className="flex space-x-3">
                <button 
                  onClick={onConnect}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Connect
                </button>
                <button 
                  onClick={onMessage}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">About</h2>
                {isEditing && isOwnProfile && (
                  <span className="text-sm text-gray-500">Edit mode</span>
                )}
              </div>
              {isEditing ? (
                <textarea
                  value={editData.bio || editData.experience || ''}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="6"
                  placeholder="Tell the world about yourself..."
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {currentProfile.bio || currentProfile.experience || 'No bio available'}
                </p>
              )}
            </div>

            {/* Experience Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Experience</h2>
                {isEditing && (
                  <button
                    onClick={addExperience}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    + Add Experience
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {ensureExperienceArray(currentProfile.experience).map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4 relative">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={exp.role || ''}
                              onChange={(e) => updateExperience(index, 'role', e.target.value)}
                              className="w-full font-semibold border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                              placeholder="Job Title"
                            />
                            <input
                              type="text"
                              value={exp.company || ''}
                              onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              className="w-full text-gray-600 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                              placeholder="Company Name"
                            />
                            <input
                              type="text"
                              value={exp.duration || ''}
                              onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                              className="w-full text-sm text-gray-500 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                              placeholder="Duration (e.g., Jan 2020 - Present)"
                            />
                            <textarea
                              value={exp.description || ''}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              className="w-full text-gray-600 border border-gray-300 rounded focus:border-blue-500 outline-none p-2 resize-none"
                              rows="2"
                              placeholder="Description..."
                            />
                          </div>
                          <button
                            onClick={() => removeExperience(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-800">{exp.role || 'Experience'}</h3>
                        {exp.company && <p className="text-gray-600">{exp.company}</p>}
                        {exp.duration && <p className="text-sm text-gray-500">{exp.duration}</p>}
                        {exp.description && (
                          <p className="text-gray-600 mt-2">{exp.description}</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Photos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Portfolio</h2>
                <div className="flex space-x-2">
                  {isEditing && (
                    <div>
                      <input
                        type="file"
                        id="portfolioPhotos"
                        accept="image/*"
                        multiple
                        onChange={handlePortfolioPhotosUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="portfolioPhotos"
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded cursor-pointer hover:bg-green-700"
                      >
                        {uploading ? 'Uploading...' : '+ Add Photos'}
                      </label>
                    </div>
                  )}
                  {ensureArray(profile.photos).length > 8 && (
                    <button 
                      onClick={() => setShowAllPhotos(!showAllPhotos)}
                      className="text-blue-600 hover:underline"
                    >
                      {showAllPhotos ? 'Show Less' : `View All ${ensureArray(profile.photos).length} Photos`}
                    </button>
                  )}
                </div>
              </div>
              
              {displayPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {displayPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                      onClick={() => !isEditing && setActivePhotoIndex(index)}
                    >
                      <img 
                        src={typeof photo === 'string' ? photo : photo.url} 
                        alt={typeof photo === 'object' ? photo.caption : `Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removePortfolioPhoto(index);
                            }}
                            className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📸</div>
                  <p>No portfolio photos yet</p>
                  {isEditing && (
                    <div className="mt-4">
                      <input
                        type="file"
                        id="firstPortfolioPhotos"
                        accept="image/*"
                        multiple
                        onChange={handlePortfolioPhotosUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="firstPortfolioPhotos"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 inline-block"
                      >
                        {uploading ? 'Uploading...' : 'Upload Your First Photos'}
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact</h2>
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <div>
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                        placeholder="✉️ Email"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                        placeholder="📞 Phone"
                      />
                    </div>
                    <div>
                      <input
                        type="url"
                        value={editData.website || ''}
                        onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                        placeholder="🌐 Website"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {currentProfile.email && (
                      <div className="flex items-center">
                        <span className="w-6 text-gray-500">✉️</span>
                        <span className="text-gray-700">{currentProfile.email}</span>
                      </div>
                    )}
                    {currentProfile.phone && (
                      <div className="flex items-center">
                        <span className="w-6 text-gray-500">📞</span>
                        <span className="text-gray-700">{currentProfile.phone}</span>
                      </div>
                    )}
                    {currentProfile.website && (
                      <div className="flex items-center">
                        <span className="w-6 text-gray-500">🌐</span>
                        <a href={currentProfile.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          {currentProfile.website}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Skills */}
            {(ensureArray(currentProfile.skills).length > 0 || isEditing) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
                {isEditing ? (
                  <textarea
                    value={ensureArray(editData.skills).join(', ')}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="3"
                    placeholder="Enter skills separated by commas (e.g., Fashion Modeling, Commercial Photography, Runway)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {ensureArray(currentProfile.skills).map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {activePhotoIndex !== null && ensureArray(profile.photos).length > 0 && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
             onClick={() => setActivePhotoIndex(null)}>
          <div className="max-w-4xl max-h-4xl p-4">
            <img 
              src={typeof ensureArray(profile.photos)[activePhotoIndex] === 'string' 
                ? ensureArray(profile.photos)[activePhotoIndex] 
                : ensureArray(profile.photos)[activePhotoIndex]?.url}
              alt={typeof ensureArray(profile.photos)[activePhotoIndex] === 'object' 
                ? ensureArray(profile.photos)[activePhotoIndex]?.caption 
                : `Portfolio ${activePhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelProfilePage;