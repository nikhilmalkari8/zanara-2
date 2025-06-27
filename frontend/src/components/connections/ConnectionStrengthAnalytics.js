import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Users, MessageCircle, 
  Heart, Eye, HandHeart, Award, Calendar, MapPin,
  Briefcase, Star, BarChart3, PieChart, Activity,
  ArrowUp, ArrowDown, Zap, Target, Globe,
  UserPlus, Share2, ThumbsUp, Clock
} from 'lucide-react';

const ConnectionStrengthAnalytics = ({ user, connectionId, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchConnectionAnalytics();
  }, [connectionId]);

  const fetchConnectionAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch connection details and analytics
      const [connectionResponse, analyticsResponse] = await Promise.all([
        fetch(`http://localhost:8001/api/connections/${connectionId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`http://localhost:8001/api/connections/analytics/${user._id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (connectionResponse.ok && analyticsResponse.ok) {
        const connectionData = await connectionResponse.json();
        const analyticsData = await analyticsResponse.json();
        
        setConnectionDetails(connectionData);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching connection analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStrengthLabel = (score) => {
    if (score >= 70) return 'Strong';
    if (score >= 40) return 'Medium';
    return 'Weak';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderStrengthMeter = (score, size = 'large') => {
    const radius = size === 'large' ? 45 : 30;
    const strokeWidth = size === 'large' ? 8 : 5;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold ${size === 'large' ? 'text-2xl' : 'text-lg'}`}>
              {score}
            </div>
            {size === 'large' && (
              <div className="text-xs text-gray-500">
                {getStrengthLabel(score)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFactorBreakdown = () => {
    if (!connectionDetails?.connectionStrength?.factors) return null;

    const factors = connectionDetails.connectionStrength.factors;
    
    const factorData = [
      {
        name: 'Professional Similarity',
        icon: Briefcase,
        score: (factors.sameProfessionalType ? 15 : 0) + 
               (factors.sameIndustry ? 10 : 0) + 
               (factors.sameLocation ? 8 : 0) + 
               Math.min(factors.skillsOverlap * 2, 15),
        maxScore: 48,
        details: [
          { label: 'Same Professional Type', value: factors.sameProfessionalType },
          { label: 'Same Industry', value: factors.sameIndustry },
          { label: 'Same Location', value: factors.sameLocation },
          { label: 'Skills Overlap', value: factors.skillsOverlap }
        ]
      },
      {
        name: 'Network Connections',
        icon: Users,
        score: factors.mutualConnectionsScore,
        maxScore: 20,
        details: [
          { label: 'Mutual Connections', value: factors.mutualConnections }
        ]
      },
      {
        name: 'Recent Activity',
        icon: Activity,
        score: Math.min(factors.recentActivity * 2, 25),
        maxScore: 25,
        details: [
          { label: 'Recent Interactions', value: factors.recentActivity }
        ]
      },
      {
        name: 'Communication',
        icon: MessageCircle,
        score: Math.min(factors.messagesExchanged * 0.5, 15) + 
               Math.max(0, 10 - factors.initiationBalance / 5),
        maxScore: 25,
        details: [
          { label: 'Messages Exchanged', value: factors.messagesExchanged },
          { label: 'Initiative Balance', value: `${100 - factors.initiationBalance}%` }
        ]
      },
      {
        name: 'Content Engagement',
        icon: Heart,
        score: Math.min(factors.activityInteractions * 1.5, 15),
        maxScore: 15,
        details: [
          { label: 'Activity Interactions', value: factors.activityInteractions }
        ]
      },
      {
        name: 'Relationship Duration',
        icon: Calendar,
        score: Math.min(factors.connectionDuration * 0.1, 10),
        maxScore: 10,
        details: [
          { label: 'Days Connected', value: factors.connectionDuration }
        ]
      }
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strength Factors</h3>
        {factorData.map((factor, index) => {
          const Icon = factor.icon;
          const percentage = (factor.score / factor.maxScore) * 100;
          
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{factor.name}</h4>
                    <div className="text-sm text-gray-500">
                      {factor.score.toFixed(1)} / {factor.maxScore} points
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {factor.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex justify-between">
                    <span className="text-gray-600">{detail.label}:</span>
                    <span className="font-medium">
                      {typeof detail.value === 'boolean' 
                        ? (detail.value ? '✓' : '✗')
                        : detail.value
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderInteractionHistory = () => {
    if (!connectionDetails?.interactions) return null;

    const recentInteractions = connectionDetails.interactions
      .slice(-20)
      .reverse();

    const interactionIcons = {
      message: MessageCircle,
      profile_view: Eye,
      activity_like: Heart,
      activity_comment: MessageCircle,
      activity_share: Share2,
      endorsement: Award,
      collaboration: Users
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Interactions</h3>
        
        {recentInteractions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent interactions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInteractions.map((interaction, index) => {
              const Icon = interactionIcons[interaction.type] || Activity;
              const isCurrentUser = interaction.initiator === user._id;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isCurrentUser ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isCurrentUser ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      isCurrentUser ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {isCurrentUser ? 'You' : connectionDetails.otherUser?.firstName}
                      {' '}
                      {interaction.type.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(interaction.timestamp).toLocaleDateString()} at{' '}
                      {new Date(interaction.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {interaction.metadata && (
                    <div className="text-xs text-gray-400">
                      {JSON.stringify(interaction.metadata)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderOverallAnalytics = () => {
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Connections */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-100 text-sm">Total Connections</div>
                <div className="text-3xl font-bold">{analytics.totalConnections}</div>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          {/* Average Strength */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-100 text-sm">Average Strength</div>
                <div className="text-3xl font-bold">{analytics.avgStrength}</div>
              </div>
              <Target className="w-8 h-8 text-green-200" />
            </div>
          </div>

          {/* Strongest Connection */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-100 text-sm">Strongest Connection</div>
                <div className="text-3xl font-bold">
                  {analytics.strongestConnections?.[0]?.connectionStrength?.score || 0}
                </div>
              </div>
              <Star className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Strength Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Strength Distribution</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.strengthDistribution.strong}
              </div>
              <div className="text-sm text-gray-500">Strong (70+)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.strengthDistribution.medium}
              </div>
              <div className="text-sm text-gray-500">Medium (40-69)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analytics.strengthDistribution.weak}
              </div>
              <div className="text-sm text-gray-500">Weak (0-39)</div>
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="space-y-3">
            {Object.entries(analytics.strengthDistribution).map(([key, value]) => {
              const percentage = (value / analytics.totalConnections) * 100;
              const colors = {
                strong: 'bg-green-500',
                medium: 'bg-yellow-500',
                weak: 'bg-red-500'
              };
              
              return (
                <div key={key} className="flex items-center space-x-3">
                  <div className="w-16 text-sm text-gray-600 capitalize">{key}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${colors[key]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-600 text-right">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Trends</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ArrowUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-600">
                {analytics.trendAnalysis.increasing}
              </div>
              <div className="text-sm text-gray-600">Increasing</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Minus className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-600">
                {analytics.trendAnalysis.stable}
              </div>
              <div className="text-sm text-gray-600">Stable</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <ArrowDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-red-600">
                {analytics.trendAnalysis.decreasing}
              </div>
              <div className="text-sm text-gray-600">Decreasing</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing connection strength...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'factors', label: 'Factors', icon: Target },
    { id: 'interactions', label: 'Interactions', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: PieChart }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Connection Analytics</h2>
            {connectionDetails && (
              <div className="flex items-center space-x-3">
                {renderStrengthMeter(connectionDetails.connectionStrength.score, 'small')}
                <div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(connectionDetails.connectionStrength.score)}`}>
                    {getStrengthLabel(connectionDetails.connectionStrength.score)}
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    {getTrendIcon(connectionDetails.connectionStrength.trend)}
                    <span className="text-xs text-gray-500 capitalize">
                      {connectionDetails.connectionStrength.trend}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
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
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'overview' && connectionDetails && (
            <div className="text-center">
              <div className="mb-6">
                {renderStrengthMeter(connectionDetails.connectionStrength.score)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {connectionDetails.interactions?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Interactions</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor((Date.now() - new Date(connectionDetails.createdAt)) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-600">Days Connected</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Last calculated: {new Date(connectionDetails.connectionStrength.lastCalculated).toLocaleDateString()}
              </div>
            </div>
          )}
          
          {activeTab === 'factors' && renderFactorBreakdown()}
          {activeTab === 'interactions' && renderInteractionHistory()}
          {activeTab === 'analytics' && renderOverallAnalytics()}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStrengthAnalytics; 