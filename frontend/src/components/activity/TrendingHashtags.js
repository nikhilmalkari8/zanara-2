import React, { useState, useEffect } from 'react';
import { TrendingUp, Hash, Flame, ArrowUp, Calendar, Users } from 'lucide-react';

const TrendingHashtags = ({ user, onHashtagClick }) => {
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchTrendingHashtags();
  }, [period]);

  const fetchTrendingHashtags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8001/api/activity/trending/hashtags?period=${period}&limit=15`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrendingHashtags(data.trendingHashtags || []);
      }
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendingIcon = (trending) => {
    if (trending === 'hot') {
      return <Flame className="w-4 h-4 text-red-500" />;
    }
    return <ArrowUp className="w-4 h-4 text-green-500" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'fashion': 'bg-pink-100 text-pink-800 border-pink-200',
      'modeling': 'bg-purple-100 text-purple-800 border-purple-200',
      'photography': 'bg-blue-100 text-blue-800 border-blue-200',
      'design': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'styling': 'bg-green-100 text-green-800 border-green-200',
      'beauty': 'bg-rose-100 text-rose-800 border-rose-200',
      'events': 'bg-orange-100 text-orange-800 border-orange-200',
      'trends': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'general': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || colors['general'];
  };

  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const periodOptions = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (trendingHashtags.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Trending Hashtags
          </h2>
        </div>
        <div className="text-center py-8">
          <Hash className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No trending hashtags found</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to start a trend!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Trending Hashtags
        </h2>
        
        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {periodOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {trendingHashtags.map((hashtag, index) => (
          <div
            key={hashtag.hashtag}
            onClick={() => onHashtagClick?.(hashtag.hashtag)}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Rank */}
              <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                {index + 1}
              </div>

              {/* Hashtag Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900 truncate">
                    #{hashtag.hashtag}
                  </span>
                  {getTrendingIcon(hashtag.trending)}
                  {hashtag.isOfficial && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Category */}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(hashtag.category)}`}>
                    {hashtag.category}
                  </span>
                  
                  {/* Usage Count */}
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="w-3 h-3 mr-1" />
                    {formatCount(hashtag.count)} posts
                  </div>
                </div>

                {/* Description */}
                {hashtag.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {hashtag.description}
                  </p>
                )}
              </div>
            </div>

            {/* Trending Indicator */}
            <div className="flex-shrink-0 ml-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                hashtag.trending === 'hot' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {hashtag.trending === 'hot' ? 'Hot' : 'Rising'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => window.location.href = '/explore/hashtags'}
          className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Explore All Hashtags
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            Updated hourly
          </div>
          <div>
            Showing top {trendingHashtags.length} trends
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingHashtags; 