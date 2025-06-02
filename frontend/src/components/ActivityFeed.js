import React, { useState, useEffect } from 'react';

const ActivityFeed = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async (pageNum = 1, filterType = 'all', reset = false) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      });
      
      if (filterType !== 'all') {
        queryParams.append('type', filterType);
      }
      
      const response = await fetch(`http://localhost:8001/api/activity/feed?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (reset || pageNum === 1) {
          setActivities(data.data);
        } else {
          setActivities(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities(1, filter, true);
  }, [filter]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchActivities(nextPage, filter, false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchActivities(1, filter, true);
  };

  const handleLike = async (activityId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/activity/${activityId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setActivities(prev => prev.map(activity => 
          activity._id === activityId 
            ? { 
                ...activity, 
                likeCount: data.data.likeCount,
                isLikedByUser: data.data.isLiked
              }
            : activity
        ));
      }
    } catch (error) {
      console.error('Error liking activity:', error);
    }
  };

  const handleComment = async (activityId, commentText) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/activity/${activityId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: commentText })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setActivities(prev => prev.map(activity => 
          activity._id === activityId 
            ? { 
                ...activity, 
                engagement: {
                  ...activity.engagement,
                  comments: data.data.comments
                },
                commentCount: data.data.commentCount
              }
            : activity
        ));
      }
    } catch (error) {
      console.error('Error commenting on activity:', error);
    }
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

  const getActivityIcon = (type) => {
    const iconMap = {
      'profile_update': '👤',
      'new_connection': '🤝',
      'opportunity_posted': '📢',
      'opportunity_applied': '📝',
      'achievement_added': '🏆',
      'company_update': '🏢',
      'opportunity_deadline_reminder': '⏰',
      'portfolio_update': '📸',
      'content_published': '📝',
      'content_liked': '❤️',
      'content_commented': '💬'
    };
    return iconMap[type] || '📌';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      'profile_update': '#4CAF50',
      'new_connection': '#2196F3',
      'opportunity_posted': '#FF9800',
      'opportunity_applied': '#9C27B0',
      'achievement_added': '#FFD700',
      'company_update': '#607D8B',
      'opportunity_deadline_reminder': '#F44336',
      'portfolio_update': '#E91E63',
      'content_published': '#673AB7',
      'content_liked': '#E91E63',
      'content_commented': '#4CAF50'
    };
    return colorMap[type] || '#757575';
  };

  const renderActivityCard = (activity) => {
    const isLiked = activity.engagement?.likes?.some(
      like => like.user._id === user.id
    ) || activity.isLikedByUser;

    return (
      <div
        key={activity._id}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '20px',
          marginBottom: '20px',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Activity Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: `linear-gradient(45deg, ${getActivityColor(activity.type)}, ${getActivityColor(activity.type)}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginRight: '15px'
            }}
          >
            {getActivityIcon(activity.type)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <strong style={{ color: 'white', marginRight: '10px' }}>
                {activity.actor ? 
                  `${activity.actor.firstName} ${activity.actor.lastName}` : 
                  'System'
                }
              </strong>
              <span
                style={{
                  background: getActivityColor(activity.type),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {activity.actor?.userType || 'system'}
              </span>
            </div>
            <p style={{ color: '#ccc', fontSize: '14px', margin: 0 }}>
              {formatTimeAgo(activity.createdAt)}
            </p>
          </div>
        </div>

        {/* Activity Content */}
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '8px' }}>
            {activity.title}
          </h3>
          {activity.description && (
            <p style={{ color: '#ddd', fontSize: '14px', lineHeight: '1.6' }}>
              {activity.description}
            </p>
          )}
          
          {/* Related Object: Opportunity */}
          {activity.relatedObjects?.opportunity && (
            <div
              style={{
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                marginTop: '10px'
              }}
            >
              <strong style={{ color: '#FF9800' }}>
                📝 {activity.relatedObjects.opportunity.title}
              </strong>
              <p style={{ color: '#ddd', fontSize: '12px', margin: '5px 0 0' }}>
                {activity.relatedObjects.opportunity.type} • {activity.relatedObjects.opportunity.location?.city}
              </p>
            </div>
          )}

          {/* Related Object: Company */}
          {activity.relatedObjects?.company && (
            <div
              style={{
                background: 'rgba(96, 125, 139, 0.1)',
                border: '1px solid rgba(96, 125, 139, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                marginTop: '10px'
              }}
            >
              <strong style={{ color: '#607D8B' }}>
                🏢 {activity.relatedObjects.company.companyName}
              </strong>
              <p style={{ color: '#ddd', fontSize: '12px', margin: '5px 0 0' }}>
                {activity.relatedObjects.company.industry}
              </p>
            </div>
          )}

          {/* Related Object: Content */}
          {activity.relatedObjects?.content && (
            <div
              style={{
                background: 'rgba(103, 58, 183, 0.1)',
                border: '1px solid rgba(103, 58, 183, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                marginTop: '10px',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (window.setCurrentPage && window.setContentId) {
                  window.setCurrentPage('content-viewer');
                  window.setContentId(activity.relatedObjects.content._id);
                }
              }}
            >
              <div style={{ display: 'flex', gap: '15px' }}>
                {activity.relatedObjects.content.coverImage && (
                  <img
                    src={`http://localhost:8001/${activity.relatedObjects.content.coverImage.url}`}
                    alt={activity.relatedObjects.content.title}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#673AB7', fontSize: '16px' }}>
                    📝 {activity.relatedObjects.content.title}
                  </strong>
                  <p style={{ color: '#ddd', fontSize: '14px', margin: '5px 0 0 0' }}>
                    {activity.relatedObjects.content.category.replace('-', ' ')} • Click to read
                  </p>
                  {activity.relatedObjects.content.excerpt && (
                    <p style={{ color: '#bbb', fontSize: '12px', margin: '8px 0 0 0' }}>
                      {activity.relatedObjects.content.excerpt.substring(0, 100)}...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Engagement */}
        <ActivityEngagement
          activity={activity}
          isLiked={isLiked}
          onLike={() => handleLike(activity._id)}
          onComment={(commentText) => handleComment(activity._id, commentText)}
          user={user}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'center'
          }}
        >
          <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '10px' }}>
            Activity Feed
          </h1>
          <p style={{ color: '#ddd', fontSize: '1.1rem' }}>
            Stay updated with your network and industry
          </p>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '30px',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          {[
            { key: 'all', label: 'All Activity' },
            { key: 'new_connection', label: 'Connections' },
            { key: 'opportunity_posted', label: 'Opportunities' },
            { key: 'achievement_added', label: 'Achievements' },
            { key: 'company_update', label: 'Company Updates' }
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

        {/* Refresh Button */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: refreshing ? 0.6 : 1
            }}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Activities List */}
        {loading && activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ color: 'white', fontSize: '18px' }}>Loading activities...</div>
          </div>
        ) : activities.length === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📱</div>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>No activities yet</h3>
            <p style={{ color: '#ddd' }}>
              Connect with professionals and start engaging to see activities here!
            </p>
          </div>
        ) : (
          <>
            {activities.map(renderActivityCard)}
            
            {/* Load More Button */}
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Loading...' : 'Load More Activities'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Activity Engagement Component
const ActivityEngagement = ({ activity, isLiked, onLike, onComment, user }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsCommenting(true);
    try {
      await onComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div>
      {/* Engagement Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ color: '#ddd', fontSize: '14px' }}>
            👀 {activity.engagement?.views || 0} views
          </span>
          <span style={{ color: '#ddd', fontSize: '14px' }}>
            ❤️ {activity.likeCount || activity.engagement?.likes?.length || 0} likes
          </span>
          <span style={{ color: '#ddd', fontSize: '14px' }}>
            💬 {activity.commentCount || activity.engagement?.comments?.length || 0} comments
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '15px 0',
          justifyContent: 'space-around'
        }}
      >
        <button
          onClick={onLike}
          style={{
            background: isLiked 
              ? 'linear-gradient(45deg, #F44336, #FF6B6B)' 
              : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.3s ease'
          }}
        >
          {isLiked ? '❤️' : '🤍'} Like
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          💬 Comment
        </button>
        
        <button
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          📤 Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ marginTop: '15px' }}>
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <button
                type="submit"
                disabled={isCommenting || !newComment.trim()}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: isCommenting || !newComment.trim() ? 'not-allowed' : 'pointer',
                  opacity: isCommenting || !newComment.trim() ? 0.6 : 1
                }}
              >
                {isCommenting ? '...' : 'Post'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {activity.engagement?.comments?.map((comment, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '10px',
                borderRadius: '10px',
                marginBottom: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <strong style={{ color: 'white', fontSize: '14px' }}>
                  {comment.user.firstName} {comment.user.lastName}
                </strong>
                <span style={{ color: '#999', fontSize: '12px' }}>
                  {new Date(comment.commentedAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ color: '#ddd', fontSize: '14px', margin: 0 }}>
                {comment.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
