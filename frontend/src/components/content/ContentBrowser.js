import React, { useState, useEffect } from 'react';

const ContentBrowser = ({ user, onViewContent }) => {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    sort: 'newest',
    search: ''
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchContent(1, filters, true);
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/content/meta/categories');
      const data = await response.json();
      if (data.success) {
        setCategories([{ value: 'all', label: 'All Categories', icon: '📚' }, ...data.data]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchContent = async (pageNum = 1, currentFilters = filters, reset = false) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12'
      });
      
      if (currentFilters.category !== 'all') {
        queryParams.append('category', currentFilters.category);
      }
      
      if (currentFilters.sort) {
        queryParams.append('sort', currentFilters.sort);
      }
      
      if (currentFilters.search) {
        queryParams.append('search', currentFilters.search);
      }
      
      const response = await fetch(`http://localhost:8001/api/content?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        if (reset || pageNum === 1) {
          setContent(data.data);
        } else {
          setContent(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.hasMore);
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
      fetchContent(nextPage, filters, false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchContent(1, filters, true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const contentDate = new Date(date);
    const diffInHours = Math.floor((now - contentDate) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return formatDate(date);
    }
  };

  const getCategoryIcon = (category) => {
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.icon : '📝';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: 'white', fontSize: '2.5rem', margin: 0, marginBottom: '10px' }}>
            📚 Discover Content
          </h1>
          <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>
            Explore insights, tips, and stories from the modeling community
          </p>
        </div>

        {/* Filters and Search */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '20px',
          marginBottom: '30px'
        }}>
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search content by title, content, or tags..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
              <button
                type="submit"
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
                🔍 Search
              </button>
            </div>
          </form>

          {/* Category Filter */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '15px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => handleFilterChange('category', category.value)}
                style={{
                  padding: '8px 16px',
                  background: filters.category === category.value 
                    ? 'linear-gradient(45deg, #4CAF50, #66BB6A)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: filters.category === category.value ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: filters.category === category.value ? 'bold' : 'normal',
                  transition: 'all 0.3s ease'
                }}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'newest', label: '🆕 Newest First' },
              { key: 'oldest', label: '📅 Oldest First' },
              { key: 'popular', label: '🔥 Most Popular' },
              { key: 'trending', label: '📈 Trending' }
            ].map(sortOption => (
              <button
                key={sortOption.key}
                onClick={() => handleFilterChange('sort', sortOption.key)}
                style={{
                  padding: '8px 16px',
                  background: filters.sort === sortOption.key 
                    ? 'linear-gradient(45deg, #2196F3, #42A5F5)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: filters.sort === sortOption.key ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: filters.sort === sortOption.key ? 'bold' : 'normal',
                  transition: 'all 0.3s ease'
                }}
              >
                {sortOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        {isLoading && content.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ color: 'white', fontSize: '18px' }}>Loading content...</div>
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
            <h3 style={{ color: 'white', marginBottom: '10px' }}>No content found</h3>
            <p style={{ color: '#ddd' }}>
              Try adjusting your filters or search terms to find more content.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '25px',
              marginBottom: '40px'
            }}>
              {content.map((item) => (
                <ContentCard
                  key={item._id}
                  content={item}
                  onView={() => onViewContent(item._id)}
                  formatTimeAgo={formatTimeAgo}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div style={{ textAlign: 'center' }}>
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

// Content Card Component
const ContentCard = ({ content, onView, formatTimeAgo, getCategoryIcon }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onClick={onView}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Cover Image */}
      {content.coverImage && (
        <div style={{
          width: '100%',
          height: '200px',
          overflow: 'hidden'
        }}>
          <img
            src={`http://localhost:8001/${content.coverImage.url}`}
            alt={content.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      <div style={{ padding: '20px' }}>
        {/* Category and Date */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <span style={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {getCategoryIcon(content.category)} {content.category.replace('-', ' ')}
          </span>
          <span style={{ color: '#ddd', fontSize: '12px' }}>
            {formatTimeAgo(content.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          color: 'white',
          fontSize: '1.2rem',
          margin: '0 0 10px 0',
          lineHeight: '1.3',
          height: '2.6rem',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {content.title}
        </h3>

        {/* Excerpt */}
        {content.excerpt && (
          <p style={{
            color: '#ddd',
            fontSize: '14px',
            lineHeight: '1.5',
            margin: '0 0 15px 0',
            height: '3rem',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {content.excerpt}
          </p>
        )}

        {/* Author */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {content.author.firstName.charAt(0)}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
              {content.author.firstName} {content.author.lastName}
            </div>
            <div style={{ color: '#ddd', fontSize: '12px' }}>
              {content.author.userType === 'model' ? 'Model' : 'Company'}
            </div>
          </div>
        </div>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '15px'
          }}>
            {content.tags.slice(0, 3).map((tag, index) => (
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
            {content.tags.length > 3 && (
              <span style={{
                color: '#ddd',
                fontSize: '11px',
                padding: '2px 4px'
              }}>
                +{content.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ddd',
          fontSize: '12px',
          paddingTop: '15px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span>📖 {content.readTime} min</span>
            <span>👁️ {content.engagement?.views || 0}</span>
            <span>❤️ {content.engagement?.likes?.length || 0}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            style={{
              background: 'linear-gradient(45deg, #2196F3, #42A5F5)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Read More →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentBrowser;