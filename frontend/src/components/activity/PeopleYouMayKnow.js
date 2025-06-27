import React, { useState, useEffect } from 'react';
import { Users, MapPin, Briefcase, UserPlus, X, Star, Award } from 'lucide-react';

const PeopleYouMayKnow = ({ user, onConnect, onDismiss }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState({});

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/connections/suggestions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    setConnecting(prev => ({ ...prev, [userId]: true }));
    
    try {
      const response = await fetch('http://localhost:8001/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ receiverId: userId })
      });

      if (response.ok) {
        // Remove from suggestions
        setSuggestions(prev => prev.filter(s => s._id !== userId));
        onConnect?.(userId);
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setConnecting(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDismiss = (userId) => {
    setSuggestions(prev => prev.filter(s => s._id !== userId));
    onDismiss?.(userId);
  };

  const getConnectionStrength = (suggestion) => {
    let strength = 0;
    let reasons = [];

    // Mutual connections
    if (suggestion.mutualConnections > 0) {
      strength += Math.min(suggestion.mutualConnections * 10, 50);
      reasons.push(`${suggestion.mutualConnections} mutual connection${suggestion.mutualConnections > 1 ? 's' : ''}`);
    }

    // Same location
    if (suggestion.location === user.location && suggestion.location) {
      strength += 20;
      reasons.push('Same location');
    }

    // Same professional type
    if (suggestion.professionalType === user.professionalType) {
      strength += 15;
      reasons.push('Same profession');
    }

    // Similar skills
    if (suggestion.commonSkills > 0) {
      strength += suggestion.commonSkills * 5;
      reasons.push(`${suggestion.commonSkills} similar skill${suggestion.commonSkills > 1 ? 's' : ''}`);
    }

    // Industry connections
    if (suggestion.industryRelevance) {
      strength += 10;
      reasons.push('Industry connection');
    }

    return {
      score: Math.min(strength, 100),
      reasons: reasons.slice(0, 2) // Show top 2 reasons
    };
  };

  const getProfessionalIcon = (professionalType) => {
    const iconMap = {
      'fashion-designer': '✂️',
      'stylist': '👗',
      'photographer': '📸',
      'makeup-artist': '💄',
      'model': '🌟',
      'brand': '🏢',
      'agency': '🎭',
      'fashion-student': '🎓'
    };
    return iconMap[professionalType] || '👤';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          People you may know
        </h2>
        <span className="text-sm text-gray-500">{suggestions.length} suggestions</span>
      </div>

      <div className="space-y-4">
        {suggestions.slice(0, 5).map((suggestion) => {
          const strength = getConnectionStrength(suggestion);
          
          return (
            <div key={suggestion._id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="relative">
                <img
                  src={suggestion.profilePicture || '/default-avatar.png'}
                  alt={`${suggestion.firstName} ${suggestion.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-gray-100">
                  <span className="text-xs">{getProfessionalIcon(suggestion.professionalType)}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {suggestion.firstName} {suggestion.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{suggestion.headline}</p>
                    
                    {suggestion.location && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {suggestion.location}
                      </div>
                    )}

                    {/* Connection reasons */}
                    {strength.reasons.length > 0 && (
                      <div className="mt-2">
                        {strength.reasons.map((reason, index) => (
                          <span
                            key={index}
                            className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full mr-2 mb-1"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Verification badges */}
                    <div className="flex items-center mt-2 space-x-2">
                      {suggestion.isVerified && (
                        <div className="flex items-center text-xs text-green-600">
                          <Star className="w-3 h-3 mr-1" />
                          Verified
                        </div>
                      )}
                      {suggestion.verificationTier !== 'none' && suggestion.verificationTier !== 'basic' && (
                        <div className="flex items-center text-xs text-purple-600">
                          <Award className="w-3 h-3 mr-1" />
                          {suggestion.verificationTier}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDismiss(suggestion._id)}
                    className="p-1 text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={() => handleConnect(suggestion._id)}
                    disabled={connecting[suggestion._id]}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{connecting[suggestion._id] ? 'Connecting...' : 'Connect'}</span>
                  </button>
                  
                  <button
                    onClick={() => window.location.href = `/profile/${suggestion._id}`}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Profile
                  </button>
                </div>

                {/* Connection strength indicator */}
                {strength.score > 30 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Connection strength</span>
                      <span>{strength.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${
                          strength.score >= 70 ? 'bg-green-500' :
                          strength.score >= 50 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${strength.score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {suggestions.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            See all {suggestions.length} suggestions
          </button>
        </div>
      )}
    </div>
  );
};

export default PeopleYouMayKnow; 