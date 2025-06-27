import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MessageCircle, Share2, MoreHorizontal, Send, 
  Image, Video, FileText, Smile, Hash, AtSign, 
  ThumbsUp, Award, Sparkles, TrendingUp, Eye,
  Calendar, Globe, Users, Lock, ChevronDown, ChevronUp,
  Camera, Play, Download, ExternalLink, Bookmark
} from 'lucide-react';

const EnhancedActivityFeed = ({ user, onUserClick }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    hashtag: '',
    user: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    hasNext: false
  });
  
  // Post creation state
  const [postContent, setPostContent] = useState('');
  const [postMedia, setPostMedia] = useState([]);
  const [postHashtags, setPostHashtags] = useState([]);
  const [postMentions, setPostMentions] = useState([]);
  const [postVisibility, setPostVisibility] = useState('public');
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  
  // Trending data
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [analytics, setAnalytics] = useState({});
  
  // Interaction state
  const [commentingOn, setCommentingOn] = useState(null);
  const [shareModal, setShareModal] = useState({ isOpen: false, activityId: null, commentary: '' });
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Enhanced reaction system with multiple types
  const reactionTypes = [
    { type: 'like', emoji: '👍', label: 'Like', color: 'text-blue-600' },
    { type: 'love', emoji: '❤️', label: 'Love', color: 'text-red-600' },
    { type: 'celebrate', emoji: '🎉', label: 'Celebrate', color: 'text-yellow-600' },
    { type: 'support', emoji: '💪', label: 'Support', color: 'text-green-600' },
    { type: 'insightful', emoji: '💡', label: 'Insightful', color: 'text-purple-600' },
    { type: 'funny', emoji: '😄', label: 'Funny', color: 'text-orange-600' }
  ];

  // Fetch activity feed
  const fetchActivities = useCallback(async (page = 1, append = false) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.hashtag && { hashtag: filters.hashtag }),
        ...(filters.user && { user: filters.user })
      });

      const response = await fetch(`http://localhost:8001/api/activity/feed?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(prev => append ? [...prev, ...data.activities] : data.activities);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch trending hashtags
  const fetchTrendingHashtags = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8001/api/activity/hashtags/trending?limit=10');
      if (response.ok) {
        const data = await response.json();
        setTrendingHashtags(data);
      }
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
    }
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8001/api/activity/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchTrendingHashtags();
    fetchAnalytics();
  }, [fetchActivities, fetchTrendingHashtags, fetchAnalytics]);

  // Handle post creation
  const handleCreatePost = async () => {
    if (!postContent.trim() && postMedia.length === 0) return;

    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', postContent);
      formData.append('title', postContent.substring(0, 100) + '...');
      formData.append('visibility', postVisibility);
      formData.append('hashtags', JSON.stringify(postHashtags));
      formData.append('mentions', JSON.stringify(postMentions.map(m => m._id)));

      postMedia.forEach((file, index) => {
        formData.append('media', file);
      });

      const response = await fetch('http://localhost:8001/api/activity/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const newActivity = await response.json();
        setActivities(prev => [newActivity, ...prev]);
        
        // Reset form
        setPostContent('');
        setPostMedia([]);
        setPostHashtags([]);
        setPostMentions([]);
        setShowCreatePost(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setPosting(false);
    }
  };

  // Handle reactions
  const handleReaction = async (activityId, reactionType) => {
    try {
      const response = await fetch(`http://localhost:8001/api/activity/${activityId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reactionType })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the activity in the feed
        setActivities(prev => prev.map(activity => 
          activity._id === activityId 
            ? {
                ...activity,
                reactionCounts: data.reactionCounts,
                userReaction: reactionType
              }
            : activity
        ));
      }
    } catch (error) {
      console.error('Error reacting to activity:', error);
    }
  };

  const handleRemoveReaction = async (activityId) => {
    try {
      const response = await fetch(`http://localhost:8001/api/activity/${activityId}/react`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the activity in the feed
        setActivities(prev => prev.map(activity => 
          activity._id === activityId 
            ? {
                ...activity,
                reactionCounts: data.reactionCounts,
                userReaction: null
              }
            : activity
        ));
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const handleShare = async (activityId, commentary = '') => {
    try {
      const response = await fetch(`http://localhost:8001/api/activity/${activityId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          commentary, 
          visibility: 'connections' 
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add the new share activity to the feed
        setActivities(prev => [data.activity, ...prev]);
        
        // Update share count for original activity
        setActivities(prev => prev.map(activity => 
          activity._id === activityId 
            ? {
                ...activity,
                shareCount: (activity.shareCount || 0) + 1
              }
            : activity
        ));
        
        setShareModal({ isOpen: false, activityId: null, commentary: '' });
      }
    } catch (error) {
      console.error('Error sharing activity:', error);
    }
  };

  // Handle hashtag search
  const searchHashtags = async (query) => {
    if (query.length < 2) {
      setHashtagSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/api/activity/hashtags/suggestions?q=${query}`);
      if (response.ok) {
        const data = await response.json();
        setHashtagSuggestions(data);
      }
    } catch (error) {
      console.error('Error searching hashtags:', error);
    }
  };

  // Handle mention search
  const searchUsers = async (query) => {
    if (query.length < 2) {
      setMentionSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/api/activity/users/suggestions?q=${query}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMentionSuggestions(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Handle text input with hashtag and mention detection
  const handleTextChange = (e) => {
    const text = e.target.value;
    setPostContent(text);

    // Check for hashtag input
    const hashtagMatch = text.match(/#(\w+)$/);
    if (hashtagMatch) {
      setShowHashtagSuggestions(true);
      searchHashtags(hashtagMatch[1]);
    } else {
      setShowHashtagSuggestions(false);
    }

    // Check for mention input
    const mentionMatch = text.match(/@(\w+)$/);
    if (mentionMatch) {
      setShowMentionSuggestions(true);
      searchUsers(mentionMatch[1]);
    } else {
      setShowMentionSuggestions(false);
    }
  };

  // Render activity item
  const renderActivity = (activity) => {
    const isLiked = activity.engagement?.reactions?.some(r => r.user === user._id);
    const totalReactions = activity.engagement?.reactions?.length || 0;
    const totalComments = activity.engagement?.comments?.length || 0;
    const totalShares = activity.engagement?.shares?.length || 0;

    return (
      <div key={activity._id} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={activity.actor?.profilePicture || '/default-avatar.png'}
                alt={activity.actor?.fullName}
                className="w-12 h-12 rounded-full object-cover cursor-pointer"
                onClick={() => onUserClick?.(activity.actor)}
              />
              <div>
                <h3 
                  className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                  onClick={() => onUserClick?.(activity.actor)}
                >
                  {activity.actor?.firstName} {activity.actor?.lastName}
                </h3>
                <p className="text-sm text-gray-500">{activity.actor?.headline}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                  <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    {activity.visibility === 'public' ? <Globe className="w-3 h-3" /> : 
                     activity.visibility === 'connections' ? <Users className="w-3 h-3" /> : 
                     <Lock className="w-3 h-3" />}
                    <span className="capitalize">{activity.visibility}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">{activity.title}</h2>
          {activity.description && (
            <p className="text-gray-700 mb-3">{activity.description}</p>
          )}
          
          {activity.content?.text && (
            <div className="text-gray-800 mb-4 whitespace-pre-wrap">
              {activity.content.text}
            </div>
          )}

          {/* Hashtags */}
          {activity.content?.hashtags && activity.content.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activity.content.hashtags.map((hashtag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100"
                  onClick={() => setFilters(prev => ({ ...prev, hashtag }))}
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {hashtag}
                </span>
              ))}
            </div>
          )}

          {/* Media */}
          {activity.content?.media && activity.content.media.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {activity.content.media.map((media, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100">
                  {media.type === 'image' ? (
                    <img
                      src={`http://localhost:8001${media.url}`}
                      alt={media.alt}
                      className="w-full h-64 object-cover"
                    />
                  ) : media.type === 'video' ? (
                    <div className="relative">
                      <video
                        src={`http://localhost:8001${media.url}`}
                        className="w-full h-64 object-cover"
                        controls
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Play className="w-12 h-12 text-white opacity-80" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 bg-gray-50">
                      <div className="text-center">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{media.alt}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        {(totalReactions > 0 || totalComments > 0 || totalShares > 0) && (
          <div className="px-6 py-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                {totalReactions > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-1">
                      {reactionTypes.slice(0, 3).map((reaction) => (
                        <div
                          key={reaction.type}
                          className="w-6 h-6 bg-white rounded-full border-2 border-white flex items-center justify-center text-sm shadow-sm"
                        >
                          {reaction.emoji}
                        </div>
                      ))}
                    </div>
                    <span>{totalReactions}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {totalComments > 0 && <span>{totalComments} comments</span>}
                {totalShares > 0 && <span>{totalShares} shares</span>}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {reactionTypes.map((reaction) => (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(activity._id, reaction.type)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    activity.userReaction === reaction.type ? reaction.color : 'text-gray-600'
                  }`}
                >
                  <span className="text-lg">{reaction.emoji}</span>
                  <span className="text-sm">{reaction.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Comment</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Bookmark className="w-5 h-5" />
                <span className="text-sm">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced reaction display component
  const ReactionDisplay = ({ activity, onReact, onRemoveReaction }) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showReactionDetails, setShowReactionDetails] = useState(false);
    
    const reactionCounts = activity.reactionCounts || {};
    const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
    const userReaction = activity.userReaction;

    const getTopReactions = () => {
      return reactionTypes
        .filter(type => reactionCounts[type.type] > 0)
        .sort((a, b) => reactionCounts[b.type] - reactionCounts[a.type])
        .slice(0, 3);
    };

    const topReactions = getTopReactions();

    return (
      <div className="relative">
        {/* Reaction Summary */}
        {totalReactions > 0 && (
          <div 
            className="flex items-center space-x-1 mb-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -ml-2"
            onClick={() => setShowReactionDetails(!showReactionDetails)}
          >
            <div className="flex -space-x-1">
              {topReactions.map(reaction => (
                <div
                  key={reaction.type}
                  className="w-6 h-6 bg-white rounded-full border-2 border-white flex items-center justify-center text-sm shadow-sm"
                >
                  {reaction.emoji}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
            </span>
          </div>
        )}

        {/* Reaction Buttons */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => {
                if (userReaction) {
                  onRemoveReaction(activity._id);
                } else {
                  setShowReactionPicker(!showReactionPicker);
                }
              }}
              onMouseEnter={() => !userReaction && setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                userReaction 
                  ? `${reactionTypes.find(r => r.type === userReaction)?.color} bg-gray-50` 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {userReaction ? (
                <>
                  <span className="text-lg">
                    {reactionTypes.find(r => r.type === userReaction)?.emoji}
                  </span>
                  <span className="text-sm font-medium">
                    {reactionTypes.find(r => r.type === userReaction)?.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg">👍</span>
                  <span className="text-sm font-medium">React</span>
                </>
              )}
            </button>

            {/* Reaction Picker */}
            {showReactionPicker && !userReaction && (
              <div 
                className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex space-x-1 z-10"
                onMouseEnter={() => setShowReactionPicker(true)}
                onMouseLeave={() => setShowReactionPicker(false)}
              >
                {reactionTypes.map(reaction => (
                  <button
                    key={reaction.type}
                    onClick={() => {
                      onReact(activity._id, reaction.type);
                      setShowReactionPicker(false);
                    }}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                    title={reaction.label}
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">
                      {reaction.emoji}
                    </span>
                    <span className="text-xs text-gray-600 mt-1">
                      {reaction.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setCommentingOn(commentingOn === activity._id ? null : activity._id)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Comment {activity.commentCount > 0 && `(${activity.commentCount})`}
            </span>
          </button>

          <button
            onClick={() => setShareModal({ isOpen: true, activityId: activity._id, commentary: '' })}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">
              Share {activity.shareCount > 0 && `(${activity.shareCount})`}
            </span>
          </button>
        </div>

        {/* Detailed Reaction View */}
        {showReactionDetails && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20 w-80">
            <h4 className="font-semibold text-gray-900 mb-3">Reactions</h4>
            <div className="space-y-2">
              {reactionTypes
                .filter(type => reactionCounts[type.type] > 0)
                .sort((a, b) => reactionCounts[b.type] - reactionCounts[a.type])
                .map(reaction => (
                  <div key={reaction.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{reaction.emoji}</span>
                      <span className="text-sm font-medium">{reaction.label}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {reactionCounts[reaction.type]}
                    </span>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setShowReactionDetails(false)}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    );
  };

  // Share Modal Component
  const ShareModal = ({ isOpen, activityId, commentary, setCommentary, onShare, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Post</h3>
          
          <textarea
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            placeholder="Add your thoughts (optional)..."
            className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="flex items-center justify-end space-x-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onShare(activityId, commentary)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalPosts || 0}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.engagementRate || 0}%</div>
              <div className="text-sm text-gray-500">Engagement</div>
            </div>
          </div>
        </div>

        {/* Trending Hashtags */}
        {trendingHashtags.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending Hashtags
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.slice(0, 5).map((hashtag, index) => (
                <button
                  key={index}
                  onClick={() => setFilters(prev => ({ ...prev, hashtag: hashtag.tag }))}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100 transition-colors"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {hashtag.displayTag}
                  <span className="ml-2 text-xs text-gray-500">({hashtag.stats?.totalUses || 0})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Activities</option>
            <option value="content_published">Posts</option>
            <option value="profile_photo_changed">Profile Updates</option>
            <option value="skill_added">Skills</option>
            <option value="achievement_added">Achievements</option>
            <option value="work_anniversary">Anniversaries</option>
          </select>
          
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Post
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create a Post</h2>
            <button
              onClick={() => setShowCreatePost(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <textarea
              ref={textareaRef}
              value={postContent}
              onChange={handleTextChange}
              placeholder="What's on your mind? Use # for hashtags and @ for mentions..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />

            {/* Hashtag Suggestions */}
            {showHashtagSuggestions && hashtagSuggestions.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Suggested Hashtags:</div>
                <div className="flex flex-wrap gap-2">
                  {hashtagSuggestions.map((hashtag, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const newContent = postContent.replace(/#\w+$/, `#${hashtag.tag} `);
                        setPostContent(newContent);
                        setShowHashtagSuggestions(false);
                      }}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      #{hashtag.displayTag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mention Suggestions */}
            {showMentionSuggestions && mentionSuggestions.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Suggested People:</div>
                <div className="space-y-2">
                  {mentionSuggestions.map((user, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const newContent = postContent.replace(/@\w+$/, `@${user.firstName}${user.lastName} `);
                        setPostContent(newContent);
                        setPostMentions(prev => [...prev, user]);
                        setShowMentionSuggestions(false);
                      }}
                      className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded"
                    >
                      <img
                        src={user.profilePicture || '/default-avatar.png'}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="text-left">
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.headline}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Media Upload */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Image className="w-5 h-5" />
                  <span>Photo</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Video className="w-5 h-5" />
                  <span>Video</span>
                </button>
                <select
                  value={postVisibility}
                  onChange={(e) => setPostVisibility(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="public">🌍 Public</option>
                  <option value="connections">👥 Connections</option>
                  <option value="private">🔒 Private</option>
                </select>
              </div>
              
              <button
                onClick={handleCreatePost}
                disabled={posting || (!postContent.trim() && postMedia.length === 0)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setPostMedia(Array.from(e.target.files))}
              className="hidden"
            />

            {/* Selected Media Preview */}
            {postMedia.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {postMedia.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setPostMedia(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Sparkles className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-500">Be the first to share something with your network!</p>
          </div>
        ) : (
          <>
            {activities.map(renderActivity)}
            
            {/* Load More */}
            {pagination.hasNext && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchActivities(pagination.currentPage + 1, true)}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        activityId={shareModal.activityId}
        commentary={shareModal.commentary}
        setCommentary={(commentary) => setShareModal(prev => ({ ...prev, commentary }))}
        onShare={handleShare}
        onClose={() => setShareModal({ isOpen: false, activityId: null, commentary: '' })}
      />
    </div>
  );
};

export default EnhancedActivityFeed; 