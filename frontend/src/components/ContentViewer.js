import React, { useState, useEffect } from 'react';

const ContentViewer = ({ contentId, user, onBack, onEdit }) => {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

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
        setContent(data.data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/content/${contentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setContent(prev => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            likes: data.data.isLiked 
              ? [...prev.engagement.likes, { user: { _id: user.id }, likedAt: new Date() }]
              : prev.engagement.likes.filter(like => like.user._id !== user.id)
          }
        }));
      }
    } catch (error) {
      console.error('Error liking content:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/content/${contentId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newComment.trim() })
      });

      const data = await response.json();
      if (data.success) {
        setContent(prev => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            comments: data.data.comments
          }
        }));
        setNewComment('');
      }
    } catch (error) {
      console.error('Error commenting:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMs = now - activityDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return activityDate.toLocaleDateString();
    }
  };

  const isLikedByUser = () => {
    return content?.engagement?.likes?.some(like => like.user._id === user.id) || false;
  };

  const canEdit = () => {
    return user && content && content.author._id === user.id;
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'behind-the-scenes': '🎬',
      'tips-advice': '💡',
      'industry-news': '📰',
      'personal-story': '📖',
      'portfolio-showcase': '🎨',
      'career-advice': '🚀',
      'fashion-trends': '👗',
      'other': '📝'
    };
    return iconMap[category] || '📝';
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

  if (!content) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem', marginBottom: '20px' }}>
          Content not found
        </div>
        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back
          </button>

          {canEdit() && (
            <button
              onClick={() => onEdit(content._id)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {/* Content */}
        <article style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '40px',
          marginBottom: '20px'
        }}>
          {/* Cover Image */}
          {content.coverImage && (
            <div style={{
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <img
                src={`http://localhost:8001/${content.coverImage.url}`}
                alt={content.coverImage.alt || content.title}
                style={{
                  maxWidth: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                }}
              />
              {content.coverImage.caption && (
                <p style={{
                  color: '#ddd',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  marginTop: '10px',
                  textAlign: 'center'
                }}>
                  {content.coverImage.caption}
                </p>
              )}
            </div>
          )}

          {/* Title */}
          <h1 style={{
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            lineHeight: '1.2',
            marginBottom: '20px'
          }}>
            {content.title}
          </h1>

          {/* Meta Information */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {content.author.firstName.charAt(0)}
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 'bold' }}>
                  {content.author.firstName} {content.author.lastName}
                </div>
                <div style={{ color: '#ddd', fontSize: '14px' }}>
                  {content.author.userType === 'model' ? 'Model' : 'Company'}
                </div>
              </div>
            </div>

            <div style={{ color: '#ddd', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div>📅 {formatDate(content.publishedAt || content.createdAt)}</div>
              <div>📖 {content.readTime} min read</div>
            </div>

            <div style={{ color: '#ddd', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div>{getCategoryIcon(content.category)} {content.category.replace('-', ' ')}</div>
              <div>👁️ {content.engagement.views} views</div>
            </div>
          </div>

          {/* Excerpt */}
          {content.excerpt && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderLeft: '4px solid #4CAF50',
              padding: '20px',
              marginBottom: '30px',
              fontStyle: 'italic',
              color: '#ddd',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              {content.excerpt}
            </div>
          )}

          {/* Content */}
          <div style={{
            color: 'white',
            fontSize: '1.1rem',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap',
            marginBottom: '30px'
          }}>
            {content.content}
          </div>

          {/* Content Images */}
          {content.images && content.images.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {content.images.map((image, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <img
                    src={`http://localhost:8001/${image.url}`}
                    alt={image.alt || `Content image ${index + 1}`}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  {image.caption && (
                    <p style={{
                      color: '#ddd',
                      fontSize: '14px',
                      fontStyle: 'italic',
                      marginTop: '8px'
                    }}>
                      {image.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div style={{
              marginBottom: '30px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h4 style={{ color: 'white', marginBottom: '15px' }}>Tags:</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {content.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Engagement Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          {/* Engagement Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '15px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ color: '#ddd', fontSize: '14px' }}>
                👁️ {content.engagement.views} views
              </span>
              <span style={{ color: '#ddd', fontSize: '14px' }}>
                ❤️ {content.engagement.likes.length} likes
              </span>
              <span style={{ color: '#ddd', fontSize: '14px' }}>
                💬 {content.engagement.comments.length} comments
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <button
              onClick={handleLike}
              disabled={isLiking}
              style={{
                background: isLikedByUser() 
                  ? 'linear-gradient(45deg, #F44336, #FF6B6B)' 
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '12px 20px',
                cursor: isLiking ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                fontWeight: 'bold',
                opacity: isLiking ? 0.6 : 1
              }}
            >
              {isLikedByUser() ? '❤️' : '🤍'} Like
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold'
              }}
            >
              💬 Comment
            </button>
            
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold'
              }}
            >
              📤 Share
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div>
              {/* Comment Form */}
              <form onSubmit={handleComment} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '25px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isCommenting || !newComment.trim()}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: isCommenting || !newComment.trim() ? 'not-allowed' : 'pointer',
                      opacity: isCommenting || !newComment.trim() ? 0.6 : 1,
                      fontWeight: 'bold'
                    }}
                  >
                    {isCommenting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {content.engagement.comments.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#ddd',
                    padding: '20px',
                    fontStyle: 'italic'
                  }}>
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  content.engagement.comments.map((comment, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '15px',
                        borderRadius: '12px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, #2196F3, #42A5F5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {comment.user.firstName.charAt(0)}
                          </div>
                          <strong style={{ color: 'white', fontSize: '14px' }}>
                            {comment.user.firstName} {comment.user.lastName}
                          </strong>
                        </div>
                        <span style={{ color: '#999', fontSize: '12px' }}>
                          {formatTimeAgo(comment.commentedAt)}
                        </span>
                      </div>
                      <p style={{
                        color: '#ddd',
                        fontSize: '14px',
                        margin: 0,
                        lineHeight: '1.5',
                        paddingLeft: '40px'
                      }}>
                        {comment.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentViewer;