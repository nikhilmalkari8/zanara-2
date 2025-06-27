import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAuthHeaders } from '../../services/api/config';

const SmartActivityFeed = ({ user, onUserClick }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [algorithmVersion, setAlgorithmVersion] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Interaction tracking
  const [viewedActivities, setViewedActivities] = useState(new Set());
  const [interactionQueue, setInteractionQueue] = useState([]);
  const viewTimeouts = useRef(new Map());
  const scrollTimeouts = useRef(new Map());
  
  // Refs for intersection observer
  const observerRef = useRef();
  const loadMoreRef = useRef();

  // Fetch smart feed
  const fetchSmartFeed = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      const currentOffset = reset ? 0 : offset;
      const response = await fetch(
        `http://localhost:8001/api/smart-feed?limit=10&offset=${currentOffset}&includeAnalytics=true`,
        {
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch smart feed');
      }

      const data = await response.json();
      
      if (reset) {
        setActivities(data.data);
        setOffset(10);
      } else {
        setActivities(prev => [...prev, ...data.data]);
        setOffset(prev => prev + data.data.length);
      }
      
      setMetadata(data.metadata);
      setHasMore(data.data.length === 10);
      
    } catch (err) {
      console.error('Smart feed error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  // Get algorithm version
  const fetchAlgorithmVersion = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8001/api/smart-feed/algorithm-version', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlgorithmVersion(data.data.algorithmVersion);
      }
    } catch (err) {
      console.error('Error fetching algorithm version:', err);
    }
  }, []);

  // Record interaction
  const recordInteraction = useCallback(async (activityId, interactionType, data = {}) => {
    try {
      await fetch('http://localhost:8001/api/smart-feed/interaction', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          activityId,
          interactionType,
          ...data
        })
      });
    } catch (err) {
      console.error('Error recording interaction:', err);
    }
  }, []);

  // Track activity view
  const trackActivityView = useCallback((activityId, element) => {
    if (viewedActivities.has(activityId)) return;
    
    // Set timeout to record view after 2 seconds
    const timeout = setTimeout(() => {
      setViewedActivities(prev => new Set(prev).add(activityId));
      recordInteraction(activityId, 'view', {
        timeSpent: 2,
        scrollDepth: window.scrollY
      });
    }, 2000);
    
    viewTimeouts.current.set(activityId, timeout);
  }, [viewedActivities, recordInteraction]);

  // Setup intersection observer for view tracking
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const activityId = entry.target.dataset.activityId;
          
          if (entry.isIntersecting) {
            trackActivityView(activityId, entry.target);
          } else {
            // Clear timeout if element leaves viewport
            const timeout = viewTimeouts.current.get(activityId);
            if (timeout) {
              clearTimeout(timeout);
              viewTimeouts.current.delete(activityId);
            }
          }
        });
      },
      { threshold: 0.5, rootMargin: '0px 0px -100px 0px' }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Clear all timeouts
      viewTimeouts.current.forEach(timeout => clearTimeout(timeout));
      scrollTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [trackActivityView]);

  // Setup load more observer
  useEffect(() => {
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchSmartFeed();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      loadMoreObserver.observe(loadMoreRef.current);
    }

    return () => loadMoreObserver.disconnect();
  }, [fetchSmartFeed, hasMore, loading]);

  // Initial load
  useEffect(() => {
    fetchSmartFeed(true);
    fetchAlgorithmVersion();
  }, []);

  // Handle activity interactions
  const handleLike = async (activityId) => {
    await recordInteraction(activityId, 'like');
    // Update local state
    setActivities(prev => prev.map(activity => 
      activity._id === activityId 
        ? { ...activity, isLiked: !activity.isLiked }
        : activity
    ));
  };

  const handleComment = async (activityId) => {
    await recordInteraction(activityId, 'comment');
  };

  const handleShare = async (activityId) => {
    await recordInteraction(activityId, 'share');
  };

  const handleUserClick = (userId) => {
    recordInteraction(null, 'click', { clickTarget: 'user', targetId: userId });
    if (onUserClick) onUserClick(userId);
  };

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 text-2xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Feed Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchSmartFeed(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Smart Feed Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              🧠 Smart Feed
              {algorithmVersion && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {algorithmVersion}
                </span>
              )}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Personalized content powered by AI
            </p>
          </div>
          
          {metadata && (
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
            >
              📊 Analytics
            </button>
          )}
        </div>
        
        {/* Analytics Panel */}
        {showAnalytics && metadata && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {metadata.candidateCount}
                </div>
                <div className="text-xs text-gray-600">Candidates</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {metadata.processingTime}ms
                </div>
                <div className="text-xs text-gray-600">Processing</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {metadata.totalAvailable}
                </div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div
            key={activity._id}
            data-activity-id={activity._id}
            ref={(el) => {
              if (el && observerRef.current) {
                observerRef.current.observe(el);
              }
            }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Activity Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleUserClick(activity.author._id)}
                    className="flex-shrink-0"
                  >
                    <img
                      src={activity.author.profilePicture || '/api/placeholder/40/40'}
                      alt={activity.author.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  </button>
                  
                  <div>
                    <button
                      onClick={() => handleUserClick(activity.author._id)}
                      className="font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                    >
                      {activity.author.name}
                    </button>
                    <div className="text-sm text-gray-500">
                      {activity.author.professionalType} • {formatTime(activity.createdAt)}
                    </div>
                  </div>
                </div>
                
                {/* Relevance Score */}
                {activity.relevanceScore && (
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">Relevance</div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.relevanceScore >= 80 ? 'bg-green-100 text-green-700' :
                      activity.relevanceScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.relevanceScore}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Content */}
            <div className="px-6 pb-4">
              <div className="text-gray-900 mb-4">
                {activity.content}
              </div>
              
              {/* Media */}
              {activity.media && activity.media.length > 0 && (
                <div className="mb-4">
                  <img
                    src={activity.media[0].url}
                    alt="Activity media"
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                </div>
              )}
              
              {/* Hashtags */}
              {activity.hashtags && activity.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {activity.hashtags.map((hashtag, idx) => (
                    <span
                      key={idx}
                      className="text-purple-600 hover:text-purple-700 cursor-pointer text-sm"
                    >
                      #{hashtag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Actions */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(activity._id)}
                    className={`flex items-center space-x-2 text-sm transition-colors ${
                      activity.isLiked 
                        ? 'text-red-600 hover:text-red-700' 
                        : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <span>{activity.isLiked ? '❤️' : '🤍'}</span>
                    <span>Like</span>
                    {activity.reactions?.length > 0 && (
                      <span className="text-gray-500">({activity.reactions.length})</span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleComment(activity._id)}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <span>💬</span>
                    <span>Comment</span>
                    {activity.comments?.length > 0 && (
                      <span className="text-gray-500">({activity.comments.length})</span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleShare(activity._id)}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <span>🔄</span>
                    <span>Share</span>
                  </button>
                </div>
                
                {/* Algorithm insights */}
                {activity.scoringFactors && (
                  <div className="text-xs text-gray-400">
                    {activity.engagementVelocity && (
                      <span>🔥 {activity.engagementVelocity.toFixed(1)}/hr</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Load more trigger */}
      {hasMore && !loading && (
        <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading more...</div>
        </div>
      )}

      {/* End of feed */}
      {!hasMore && activities.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">You've reached the end of your feed</div>
          <button
            onClick={() => {
              setOffset(0);
              fetchSmartFeed(true);
            }}
            className="mt-2 px-4 py-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Refresh Feed
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartActivityFeed; 