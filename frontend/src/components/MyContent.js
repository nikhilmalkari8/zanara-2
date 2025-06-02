import React, { useState, useEffect } from 'react';

const MyContent = ({ user, onCreateNew, onViewContent, onEditContent }) => {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    totalViews: 0,
    totalLikes: 0
  });

  useEffect(() => {
    fetchContent(1, filter, true);
  }, [filter]);

  const fetchContent = async (pageNum = 1, statusFilter = 'all', reset = false) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }
      
      const response = await fetch(`http://localhost:8001/api/content/my?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (reset || pageNum === 1) {
          setContent(data.data);
        } else {
          setContent(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.hasMore);
        
        // Calculate stats
        const newStats = data.data.reduce((acc, item) => {
          acc.total++;
          if (item.status === 'published') acc.published++;
          if (item.status === 'draft') acc.drafts++;
          acc.totalViews += item.engagement?.views || 0;
          acc.totalLikes += item.engagement?.likes?.length || 0;
          return acc;
        }, { total: 0, published: 0, drafts: 0, totalViews: 0, totalLikes: 0 });
        
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchContent(nextPage, filter, false);
    }
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setContent(prev => prev.filter(item => item._id !== contentId));
        // Refresh stats
        fetchContent(1, filter, true);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const getStatusColor = (status) => {
    const colorMap = {
      'published': '#4CAF50',
      'draft': '#FF9800',
      'archived': '#757575'
    };
    return colorMap[status] || '#757575';
  };

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
              📚 My Content
            </h1>
            <p style={{ color: '#ddd', margin: '5px 0 0 0' }}>
              Manage your published articles and drafts
            </p>
          </div>
          <button
            onClick={onCreateNew}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ✏️ Create New Content
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
              {stats.total}
            </div>
            <div style={{ color: '#ddd', fontSize: '14px' }}>Total Content</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', color: '#2196F3', fontWeight: 'bold' }}>
              {stats.published}
            </div>
            <div style={{ color: '#ddd', fontSize: '14px' }}>Published</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', color: '#FF9800', fontWeight: 'bold' }}>
              {stats.drafts}
            </div>
            <div style={{ color: '#ddd', fontSize: '14px' }}>Drafts</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', color: '#E91E63', fontWeight: 'bold' }}>
              {stats.totalViews}
            </div>
            <div style={{ color: '#ddd', fontSize: '14px' }}>Total Views</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'all', label: 'All Content' },
            { key: 'published', label: 'Published' },
            { key: 'draft', label: 'Drafts' },
            { key: 'archived', label: 'Archived' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '12px 20px',
                background: filter === tab.key 
                  ? 'linear-gradient(45deg, #4CAF50, #66BB6A)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: filter === tab.key ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: filter === tab.key ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content List */}
        {isLoading && content.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ color: 'white', fontSize: '18px' }}>Loading your content...</div>
          </div>
        ) : content.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>No content yet</h3>
            <p style={{ color: '#ddd', marginBottom: '20px' }}>
              Start sharing your thoughts and experiences with the community!
            </p>
            <button
              onClick={onCreateNew}
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
              Create Your First Content
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {content.map((item) => (
                <div
                  key={item._id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '25px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Cover Image */}
                    {item.coverImage && (
                      <div style={{ flexShrink: 0 }}>
                        <img
                          src={`http://localhost:8001/${item.coverImage.url}`}
                          alt={item.title}
                          style={{
                            width: '120px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                    )}

                    {/* Content Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h3 style={{
                          color: 'white',
                          fontSize: '1.3rem',
                          margin: 0,
                          marginBottom: '8px',
                          lineHeight: '1.3'
                        }}>
                          {item.title}
                        </h3>
                        
                        <span style={{
                          background: getStatusColor(item.status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}>
                          {item.status}
                        </span>
                      </div>

                      {/* Excerpt */}
                      {item.excerpt && (
                        <p style={{
                          color: '#ddd',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          margin: '0 0 15px 0'
                        }}>
                          {item.excerpt.length > 150 ? item.excerpt.substring(0, 150) + '...' : item.excerpt}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div style={{
                        display: 'flex',
                        gap: '20px',
                        marginBottom: '15px',
                        color: '#ddd',
                        fontSize: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <span>{getCategoryIcon(item.category)} {item.category.replace('-', ' ')}</span>
                        <span>📅 {formatDate(item.updatedAt)}</span>
                        <span>📖 {item.readTime} min read</span>
                        <span>👁️ {item.engagement?.views || 0} views</span>
                        <span>❤️ {item.engagement?.likes?.length || 0} likes</span>
                        <span>💬 {item.engagement?.comments?.length || 0} comments</span>
                      </div>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '15px' }}>
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#ddd',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '11px'
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span style={{
                              color: '#ddd',
                              fontSize: '11px',
                              padding: '2px 4px'
                            }}>
                              +{item.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => onViewContent(item._id)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(45deg, #2196F3, #42A5F5)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          👁️ View
                        </button>

                        <button
                          onClick={() => onEditContent(item._id)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => handleDelete(item._id)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(45deg, #F44336, #FF6B6B)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          🗑️ Delete
                        </button>

                        {item.status === 'published' && (
                          <button
                            style={{
                              padding: '8px 16px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            📤 Share
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  {isLoading ? 'Loading...' : 'Load More Content'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyContent;