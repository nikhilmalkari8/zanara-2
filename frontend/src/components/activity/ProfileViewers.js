import React, { useState, useEffect } from 'react';
import { 
  Eye, TrendingUp, TrendingDown, Users, MapPin, 
  Briefcase, Calendar, Clock, Filter, BarChart3,
  Globe, Shield, UserCheck, AlertCircle, Star,
  ArrowUp, ArrowDown, Minus, Target, Zap,
  Camera, Heart, MessageCircle, UserPlus
} from 'lucide-react';

const ProfileViewers = ({ user }) => {
  const [viewers, setViewers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d'); // 7d, 30d, 90d
  const [viewerType, setViewerType] = useState('all'); // all, identified, anonymous
  const [activeTab, setActiveTab] = useState('viewers');

  useEffect(() => {
    fetchProfileViewers();
    fetchViewerAnalytics();
  }, [timeFilter, viewerType]);

  const fetchProfileViewers = async () => {
    try {
      const response = await fetch(
        `http://localhost:8001/api/profile/viewers?period=${timeFilter}&type=${viewerType}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setViewers(data.viewers || []);
      }
    } catch (error) {
      console.error('Error fetching profile viewers:', error);
    }
  };

  const fetchViewerAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8001/api/profile/viewer-analytics?period=${timeFilter}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching viewer analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const viewDate = new Date(date);
    const diffInHours = Math.floor((now - viewDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return viewDate.toLocaleDateString();
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getProfessionalIcon = (professionalType) => {
    const icons = {
      'model': '👤',
      'photographer': '📸',
      'fashion-designer': '✂️',
      'stylist': '💄',
      'makeup-artist': '🎨',
      'brand': '🏢',
      'agency': '🏛️',
      'fashion-student': '🎓'
    };
    return icons[professionalType] || '👤';
  };

  const renderAnalyticsOverview = () => {
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-100 text-sm">Total Views</div>
                <div className="text-2xl font-bold">{analytics.totalViews}</div>
                <div className="flex items-center mt-1">
                  {getTrendIcon(analytics.trends.totalViews)}
                  <span className="text-xs ml-1">
                    {Math.abs(analytics.trends.totalViews)}% vs last period
                  </span>
                </div>
              </div>
              <Eye className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-100 text-sm">Unique Viewers</div>
                <div className="text-2xl font-bold">{analytics.uniqueViewers}</div>
                <div className="flex items-center mt-1">
                  {getTrendIcon(analytics.trends.uniqueViewers)}
                  <span className="text-xs ml-1">
                    {Math.abs(analytics.trends.uniqueViewers)}% vs last period
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-100 text-sm">Avg Daily Views</div>
                <div className="text-2xl font-bold">{analytics.avgDailyViews}</div>
                <div className="flex items-center mt-1">
                  {getTrendIcon(analytics.trends.avgDailyViews)}
                  <span className="text-xs ml-1">
                    {Math.abs(analytics.trends.avgDailyViews)}% vs last period
                  </span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-orange-100 text-sm">Return Viewers</div>
                <div className="text-2xl font-bold">{analytics.returnViewers}</div>
                <div className="flex items-center mt-1">
                  <Star className="w-3 h-3" />
                  <span className="text-xs ml-1">
                    {((analytics.returnViewers / analytics.uniqueViewers) * 100).toFixed(0)}% return rate
                  </span>
                </div>
              </div>
              <Target className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Viewer Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Professional Types */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Viewer Types</h3>
            <div className="space-y-3">
              {analytics.viewerTypes.map((type, index) => {
                const percentage = (type.count / analytics.uniqueViewers) * 100;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getProfessionalIcon(type.type)}</span>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {type.type.replace('-', ' ')}
                        </div>
                        <div className="text-sm text-gray-500">{type.count} viewers</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {percentage.toFixed(0)}%
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
            <div className="space-y-3">
              {analytics.topLocations.map((location, index) => {
                const percentage = (location.count / analytics.uniqueViewers) * 100;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{location.city}</div>
                        <div className="text-sm text-gray-500">{location.count} viewers</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {percentage.toFixed(0)}%
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Viewing Patterns */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Viewing Patterns</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Peak Viewing Hours</h4>
              <div className="space-y-2">
                {analytics.peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{hour.hour}:00</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(hour.views / analytics.peakHours[0].views) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium">{hour.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Patterns */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Weekly Patterns</h4>
              <div className="space-y-2">
                {analytics.weeklyPattern.map((day, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{day.day}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(day.views / analytics.weeklyPattern[0].views) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium">{day.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Insights */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement After Views</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <UserPlus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-600">
                {analytics.engagementAfterView.connectionRequests}
              </div>
              <div className="text-sm text-gray-600">Connection Requests</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-600">
                {analytics.engagementAfterView.messages}
              </div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-600">
                {analytics.engagementAfterView.activityLikes}
              </div>
              <div className="text-sm text-gray-600">Activity Likes</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Eye className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-orange-600">
                {analytics.engagementAfterView.profileViews}
              </div>
              <div className="text-sm text-gray-600">Return Views</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderViewersList = () => {
    if (viewers.length === 0) {
      return (
        <div className="text-center py-12">
          <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No profile views yet</h3>
          <p className="text-gray-500">
            {timeFilter === '7d' ? 'No one has viewed your profile in the last 7 days' :
             timeFilter === '30d' ? 'No one has viewed your profile in the last 30 days' :
             'No one has viewed your profile in the last 90 days'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {viewers.map((viewer, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                {viewer.isAnonymous ? (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-gray-400" />
                  </div>
                ) : (
                  <img
                    src={viewer.profilePicture || '/default-avatar.png'}
                    alt={viewer.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                
                {/* Online indicator */}
                {!viewer.isAnonymous && viewer.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {viewer.isAnonymous ? 'Anonymous Viewer' : `${viewer.firstName} ${viewer.lastName}`}
                  </h3>
                  
                  {!viewer.isAnonymous && viewer.isVerified && (
                    <UserCheck className="w-4 h-4 text-blue-500" />
                  )}
                  
                  {viewer.isAnonymous && (
                    <div className="px-2 py-1 bg-gray-100 rounded-full">
                      <span className="text-xs text-gray-600">Anonymous</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <span className="text-lg">{getProfessionalIcon(viewer.professionalType)}</span>
                    <span className="capitalize">
                      {viewer.isAnonymous 
                        ? `${viewer.professionalType?.replace('-', ' ') || 'Professional'} (Hidden)`
                        : viewer.professionalType?.replace('-', ' ')
                      }
                    </span>
                  </div>
                  
                  {!viewer.isAnonymous && viewer.location && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{viewer.location.city}</span>
                    </div>
                  )}
                </div>
                
                {!viewer.isAnonymous && viewer.headline && (
                  <p className="text-sm text-gray-600 mt-1 truncate">{viewer.headline}</p>
                )}
              </div>

              {/* View Info */}
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeAgo(viewer.viewedAt)}</span>
                </div>
                
                {viewer.viewCount > 1 && (
                  <div className="text-xs text-gray-400 mt-1">
                    Viewed {viewer.viewCount} times
                  </div>
                )}
                
                {viewer.connectionStrength && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            viewer.connectionStrength >= 70 ? 'bg-green-500' :
                            viewer.connectionStrength >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${viewer.connectionStrength}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{viewer.connectionStrength}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!viewer.isAnonymous && (
              <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-100">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Connect
                </button>
                <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Message
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const timeFilterOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const viewerTypeOptions = [
    { value: 'all', label: 'All Viewers' },
    { value: 'identified', label: 'Identified' },
    { value: 'anonymous', label: 'Anonymous' }
  ];

  const tabs = [
    { id: 'viewers', label: 'Recent Viewers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile Viewers</h2>
            <p className="text-sm text-gray-500">See who's been checking out your profile</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeFilterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <select
            value={viewerType}
            onChange={(e) => setViewerType(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {viewerTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'viewers' && renderViewersList()}
          {activeTab === 'analytics' && renderAnalyticsOverview()}
        </>
      )}

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Privacy Notice</p>
            <p>
              We respect user privacy. Some viewers may appear as anonymous based on their privacy settings. 
              Only basic professional information is shown for anonymous viewers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewers; 