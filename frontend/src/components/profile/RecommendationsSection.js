import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../services/api/config';
import { FileText, Plus, Star, Calendar, User, CheckCircle, XCircle, Eye } from 'lucide-react';

const RecommendationsSection = ({ userId, isOwnProfile = false, user }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [newRecommendation, setNewRecommendation] = useState({
    relationship: '',
    content: '',
    skills: [],
    projects: []
  });

  const relationshipTypes = [
    { value: 'colleague', label: 'Colleague' },
    { value: 'manager', label: 'Manager' },
    { value: 'direct_report', label: 'Direct Report' },
    { value: 'client', label: 'Client' },
    { value: 'collaborator', label: 'Collaborator' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'mentee', label: 'Mentee' },
    { value: 'service_provider', label: 'Service Provider' },
    { value: 'business_partner', label: 'Business Partner' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchRecommendations();
  }, [userId, activeTab]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(
        `http://localhost:8001/api/profile/${userId}/recommendations?type=${activeTab}`,
        { headers: getAuthHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteRecommendation = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/profile/recommendation', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          recipientId: userId,
          ...newRecommendation
        })
      });

      if (response.ok) {
        setShowWriteModal(false);
        setNewRecommendation({
          relationship: '',
          content: '',
          skills: [],
          projects: []
        });
        // Show success message
        alert('Recommendation submitted successfully! It will appear once approved.');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit recommendation');
      }
    } catch (error) {
      console.error('Error writing recommendation:', error);
      alert('Error submitting recommendation');
    }
  };

  const handleApproveRecommendation = async (recommendationId, action) => {
    try {
      const response = await fetch(
        `http://localhost:8001/api/profile/recommendation/${recommendationId}/approve`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action })
        }
      );

      if (response.ok) {
        await fetchRecommendations();
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${action} recommendation`);
      }
    } catch (error) {
      console.error(`Error ${action}ing recommendation:`, error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Recommendations</h3>
        </div>

        {!isOwnProfile && (
          <button
            onClick={() => setShowWriteModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Write Recommendation</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'received'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Received ({recommendations.filter(r => r.recipient?._id === userId).length})
        </button>
        <button
          onClick={() => setActiveTab('given')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'given'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Given ({recommendations.filter(r => r.author?._id === userId).length})
        </button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No recommendations {activeTab}
            </h4>
            <p className="text-gray-500 mb-4">
              {activeTab === 'received'
                ? isOwnProfile
                  ? 'Ask your connections to write you a recommendation'
                  : 'This user hasn\'t received any recommendations yet'
                : isOwnProfile
                ? 'Write recommendations for your connections'
                : 'This user hasn\'t written any recommendations yet'
              }
            </p>
            {!isOwnProfile && activeTab === 'received' && (
              <button
                onClick={() => setShowWriteModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write First Recommendation
              </button>
            )}
          </div>
        ) : (
          recommendations.map((recommendation) => (
            <div
              key={recommendation._id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Recommendation Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      activeTab === 'received'
                        ? recommendation.author?.profilePicture || '/api/placeholder/48/48'
                        : recommendation.recipient?.profilePicture || '/api/placeholder/48/48'
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {activeTab === 'received'
                        ? `${recommendation.author?.firstName} ${recommendation.author?.lastName}`
                        : `${recommendation.recipient?.firstName} ${recommendation.recipient?.lastName}`
                      }
                    </h4>
                    <p className="text-sm text-gray-600">
                      {recommendation.author?.headline || recommendation.recipient?.headline}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {relationshipTypes.find(r => r.value === recommendation.relationship)?.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(recommendation.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  {recommendation.status === 'approved' && (
                    <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>Approved</span>
                    </span>
                  )}
                  {recommendation.status === 'pending' && (
                    <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  )}
                  {recommendation.status === 'rejected' && (
                    <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      <XCircle className="w-3 h-3" />
                      <span>Rejected</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Recommendation Content */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">
                  {recommendation.content}
                </p>
              </div>

              {/* Skills Highlighted */}
              {recommendation.skills && recommendation.skills.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Skills highlighted:</h5>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Mentioned */}
              {recommendation.projects && recommendation.projects.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Projects mentioned:</h5>
                  <div className="space-y-2">
                    {recommendation.projects.map((project, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <h6 className="font-medium text-gray-900">{project.name}</h6>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        )}
                        {project.role && (
                          <span className="text-xs text-gray-500">Role: {project.role}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions for pending recommendations */}
              {recommendation.status === 'pending' && 
               activeTab === 'received' && 
               isOwnProfile && (
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleApproveRecommendation(recommendation._id, 'approve')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleApproveRecommendation(recommendation._id, 'reject')}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              {/* Metrics */}
              {recommendation.metrics && (
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{recommendation.metrics.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{recommendation.metrics.helpful} found helpful</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Write Recommendation Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">
                Write a Recommendation
              </h4>

              <div className="space-y-6">
                {/* Relationship */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your relationship *
                  </label>
                  <select
                    value={newRecommendation.relationship}
                    onChange={(e) => setNewRecommendation(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select relationship</option>
                    {relationshipTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendation *
                  </label>
                  <textarea
                    value={newRecommendation.content}
                    onChange={(e) => setNewRecommendation(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="6"
                    placeholder="Write your recommendation here... Share specific examples of their work, skills, and achievements."
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {newRecommendation.content.length}/3000
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills to highlight (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Fashion Design, Project Management (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      setNewRecommendation(prev => ({ ...prev, skills }));
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowWriteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWriteRecommendation}
                  disabled={!newRecommendation.relationship || !newRecommendation.content.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Recommendation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection; 