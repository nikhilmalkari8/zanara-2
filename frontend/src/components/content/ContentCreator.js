import React, { useState, useEffect } from 'react';

const ContentCreator = ({ user, contentId = null, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'other',
    tags: '',
    status: 'draft',
    visibility: 'public'
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [contentImages, setContentImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('write');

  useEffect(() => {
    fetchCategories();
    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/content/meta/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/content/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const content = data.data;
        setFormData({
          title: content.title,
          content: content.content,
          excerpt: content.excerpt || '',
          category: content.category,
          tags: content.tags.join(', '),
          status: content.status,
          visibility: content.visibility
        });

        if (content.coverImage) {
          setCoverImagePreview(`http://localhost:8001/${content.coverImage.url}`);
        }
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setMessage('Error loading content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors(prev => ({
          ...prev,
          coverImage: 'Cover image must be less than 10MB'
        }));
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverImagePreview(e.target.result);
      reader.readAsDataURL(file);
      
      setErrors(prev => ({
        ...prev,
        coverImage: ''
      }));
    }
  };

  const handleContentImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setMessage('Some images were too large (max 10MB each)');
        return false;
      }
      return true;
    });

    setContentImages(prev => [...prev, ...validFiles]);
  };

  const removeContentImage = (index) => {
    setContentImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > 50000) {
      newErrors.content = 'Content must be less than 50,000 characters';
    }

    if (formData.excerpt && formData.excerpt.length > 500) {
      newErrors.excerpt = 'Excerpt must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (publishStatus = null) => {
    if (!validateForm()) return;

    setIsSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('excerpt', formData.excerpt.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('status', publishStatus || formData.status);
      formDataToSend.append('visibility', formData.visibility);

      // Add cover image
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      // Add content images
      contentImages.forEach((image, index) => {
        formDataToSend.append('contentImages', image);
      });

      const url = contentId 
        ? `http://localhost:8001/api/content/${contentId}`
        : 'http://localhost:8001/api/content';
      
      const method = contentId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setMessage(contentId ? 'Content updated successfully!' : 'Content created successfully!');
        if (onSave) {
          onSave(data.data);
        }
      } else {
        setMessage(data.message || 'Error saving content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setMessage('Error saving content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getWordCount = () => {
    return formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadTime = () => {
    const wordCount = getWordCount();
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading content...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>
              {contentId ? '✏️ Edit Content' : '📝 Create Content'}
            </h1>
            <p style={{ color: '#ddd', margin: '5px 0 0 0' }}>
              Share your thoughts, experiences, and insights with the community
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setActiveTab('write')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'write' 
                ? 'linear-gradient(45deg, #4CAF50, #66BB6A)'
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: activeTab === 'write' ? 'bold' : 'normal'
            }}
          >
            ✏️ Write
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'settings' 
                ? 'linear-gradient(45deg, #4CAF50, #66BB6A)'
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: activeTab === 'settings' ? 'bold' : 'normal'
            }}
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'preview' 
                ? 'linear-gradient(45deg, #4CAF50, #66BB6A)'
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: activeTab === 'preview' ? 'bold' : 'normal'
            }}
          >
            👁️ Preview
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            background: message.includes('Error') 
              ? 'rgba(244, 67, 54, 0.1)' 
              : 'rgba(76, 175, 80, 0.1)',
            border: `1px solid ${message.includes('Error') ? '#F44336' : '#4CAF50'}`,
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            color: message.includes('Error') ? '#FF6B6B' : '#81C784',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '30px'
        }}>
          {activeTab === 'write' && (
            <div>
              {/* Title */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter your content title..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: errors.title ? '2px solid #F44336' : '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                />
                {errors.title && (
                  <p style={{ color: '#FF6B6B', fontSize: '14px', margin: '5px 0 0 0' }}>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Cover Image */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  Cover Image
                </label>
                <div style={{
                  border: '2px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    style={{ display: 'none' }}
                    id="coverImage"
                  />
                  <label htmlFor="coverImage" style={{ cursor: 'pointer', color: 'white' }}>
                    {coverImagePreview ? (
                      <div>
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            borderRadius: '8px',
                            marginBottom: '10px'
                          }}
                        />
                        <p style={{ margin: 0, fontSize: '14px', color: '#ddd' }}>
                          Click to change cover image
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                        <p style={{ margin: 0, fontSize: '16px' }}>
                          Click to upload cover image
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#ddd' }}>
                          JPEG, PNG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.coverImage && (
                  <p style={{ color: '#FF6B6B', fontSize: '14px', margin: '5px 0 0 0' }}>
                    {errors.coverImage}
                  </p>
                )}
              </div>

              {/* Content */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                    Content *
                  </label>
                  <div style={{ color: '#ddd', fontSize: '14px' }}>
                    {getWordCount()} words • {getReadTime()} min read
                  </div>
                </div>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your content here... You can use basic formatting and add images below."
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: errors.content ? '2px solid #F44336' : '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    resize: 'vertical'
                  }}
                />
                {errors.content && (
                  <p style={{ color: '#FF6B6B', fontSize: '14px', margin: '5px 0 0 0' }}>
                    {errors.content}
                  </p>
                )}
              </div>

              {/* Content Images */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  Content Images
                </label>
                <div style={{
                  border: '2px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleContentImagesChange}
                    style={{ display: 'none' }}
                    id="contentImages"
                  />
                  <label htmlFor="contentImages" style={{ cursor: 'pointer', color: 'white' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🖼️</div>
                    <p style={{ margin: 0, fontSize: '16px' }}>
                      Click to add images to your content
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#ddd' }}>
                      You can upload multiple images
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {contentImages.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '15px',
                    marginTop: '15px'
                  }}>
                    {contentImages.map((image, index) => (
                      <div key={index} style={{
                        position: 'relative',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '10px'
                      }}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Content image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                        <button
                          onClick={() => removeContentImage(index)}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: '#F44336',
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
                        <p style={{
                          color: '#ddd',
                          fontSize: '12px',
                          margin: '5px 0 0 0',
                          textAlign: 'center',
                          wordBreak: 'break-all'
                        }}>
                          {image.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  Excerpt (Optional)
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Write a brief summary or teaser for your content..."
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: errors.excerpt ? '2px solid #F44336' : '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
                {errors.excerpt && (
                  <p style={{ color: '#FF6B6B', fontSize: '14px', margin: '5px 0 0 0' }}>
                    {errors.excerpt}
                  </p>
                )}
                <p style={{ color: '#ddd', fontSize: '12px', margin: '5px 0 0 0' }}>
                  {formData.excerpt.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              {/* Category */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px'
                  }}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value} style={{ background: '#333', color: 'white' }}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="modeling, fashion, tips, career (separate with commas)"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
                <p style={{ color: '#ddd', fontSize: '12px', margin: '5px 0 0 0' }}>
                  Separate tags with commas. Tags help people discover your content.
                </p>
              </div>

              {/* Visibility */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px'
                  }}
                >
                  <option value="public" style={{ background: '#333', color: 'white' }}>
                    🌍 Public - Anyone can see this content
                  </option>
                  <option value="connections" style={{ background: '#333', color: 'white' }}>
                    🤝 Connections Only - Only your connections can see this
                  </option>
                  <option value="private" style={{ background: '#333', color: 'white' }}>
                    🔒 Private - Only you can see this content
                  </option>
                </select>
              </div>

              {/* Status */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px'
                  }}
                >
                  <option value="draft" style={{ background: '#333', color: 'white' }}>
                    📝 Draft - Save without publishing
                  </option>
                  <option value="published" style={{ background: '#333', color: 'white' }}>
                    🚀 Published - Make it live
                  </option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <ContentPreview formData={formData} coverImagePreview={coverImagePreview} />
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              {isSaving ? '💾 Saving...' : '📝 Save as Draft'}
            </button>

            <button
              onClick={() => handleSave('published')}
              disabled={isSaving}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              {isSaving ? '🚀 Publishing...' : '🚀 Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Preview Component
const ContentPreview = ({ formData, coverImagePreview }) => {
  const getWordCount = () => {
    return formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadTime = () => {
    const wordCount = getWordCount();
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <h3 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
        👁️ Preview
      </h3>
      
      {/* Cover Image */}
      {coverImagePreview && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src={coverImagePreview}
            alt="Cover"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '8px'
            }}
          />
        </div>
      )}
      
      {/* Title */}
      <h1 style={{
        color: 'white',
        fontSize: '2rem',
        marginBottom: '10px',
        lineHeight: '1.2'
      }}>
        {formData.title || 'Untitled Content'}
      </h1>
      
      {/* Meta Info */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
        color: '#ddd',
        fontSize: '14px',
        flexWrap: 'wrap'
      }}>
        <span>📖 {getReadTime()} min read</span>
        <span>📝 {getWordCount()} words</span>
        <span>🏷️ {formData.category.replace('-', ' ')}</span>
        <span>👁️ {formData.visibility}</span>
      </div>
      
      {/* Excerpt */}
      {formData.excerpt && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderLeft: '4px solid #4CAF50',
          padding: '15px',
          marginBottom: '20px',
          fontStyle: 'italic',
          color: '#ddd'
        }}>
          {formData.excerpt}
        </div>
      )}
      
      {/* Content */}
      <div style={{
        color: 'white',
        fontSize: '16px',
        lineHeight: '1.8',
        whiteSpace: 'pre-wrap'
      }}>
        {formData.content || 'No content written yet...'}
      </div>
      
      {/* Tags */}
      {formData.tags && (
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ color: 'white', marginBottom: '10px' }}>Tags:</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {formData.tags.split(',').map((tag, index) => (
              <span
                key={index}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '14px'
                }}
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCreator;