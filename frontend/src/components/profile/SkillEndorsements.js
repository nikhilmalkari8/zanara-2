import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../services/api/config';
import { Award, Plus, Users, TrendingUp, Star, MessageCircle } from 'lucide-react';

const SkillEndorsements = ({ userId, isOwnProfile = false, user }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [endorsing, setEndorsing] = useState(null);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'technical' });
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [endorsementNote, setEndorsementNote] = useState('');

  const skillCategories = [
    { value: 'technical', label: 'Technical', icon: '⚙️' },
    { value: 'creative', label: 'Creative', icon: '🎨' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'soft-skills', label: 'Soft Skills', icon: '🤝' }
  ];

  // Fetch skills
  useEffect(() => {
    fetchSkills();
  }, [userId]);

  const fetchSkills = async () => {
    try {
      const response = await fetch(`http://localhost:8001/api/profile/${userId}/skills`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndorseSkill = async (skillName) => {
    if (isOwnProfile) return;

    try {
      setEndorsing(skillName);
      
      const response = await fetch('http://localhost:8001/api/profile/endorse-skill', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId,
          skillName,
          note: endorsementNote
        })
      });

      if (response.ok) {
        // Refresh skills to show new endorsement
        await fetchSkills();
        setSelectedSkill(null);
        setEndorsementNote('');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to endorse skill');
      }
    } catch (error) {
      console.error('Error endorsing skill:', error);
      alert('Error endorsing skill');
    } finally {
      setEndorsing(null);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;

    try {
      const response = await fetch('http://localhost:8001/api/profile/skills', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSkill)
      });

      if (response.ok) {
        await fetchSkills();
        setNewSkill({ name: '', category: 'technical' });
        setShowAddSkill(false);
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const getSkillsByCategory = () => {
    const grouped = {};
    skillCategories.forEach(category => {
      grouped[category.value] = skills.filter(skill => skill.category === category.value);
    });
    return grouped;
  };

  const hasUserEndorsed = (skill) => {
    return skill.endorsements?.some(endorsement => 
      endorsement.endorsedBy._id === user?._id
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const skillsByCategory = getSkillsByCategory();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Award className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Skills & Endorsements</h3>
        </div>
        
        {isOwnProfile && (
          <button
            onClick={() => setShowAddSkill(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        )}
      </div>

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Skill</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Fashion Design, Photography"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {skillCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddSkill(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                disabled={!newSkill.name.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skills by Category */}
      {skillCategories.map(category => {
        const categorySkills = skillsByCategory[category.value];
        if (categorySkills.length === 0) return null;

        return (
          <div key={category.value} className="mb-8 last:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">{category.icon}</span>
              <h4 className="text-lg font-semibold text-gray-900">{category.label}</h4>
              <span className="text-sm text-gray-500">({categorySkills.length})</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorySkills.map((skill, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{skill.name}</h5>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{skill.endorsementCount} endorsement{skill.endorsementCount !== 1 ? 's' : ''}</span>
                        </div>
                        {skill.endorsementCount > 0 && (
                          <div className="flex items-center space-x-1 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>Growing</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!isOwnProfile && !hasUserEndorsed(skill) && (
                      <button
                        onClick={() => setSelectedSkill(skill)}
                        disabled={endorsing === skill.name}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        <Star className="w-4 h-4" />
                        <span className="text-sm">Endorse</span>
                      </button>
                    )}
                    
                    {hasUserEndorsed(skill) && (
                      <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm">Endorsed</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Recent Endorsements */}
                  {skill.recentEndorsements && skill.recentEndorsements.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-gray-600">Recent endorsements:</span>
                      </div>
                      <div className="flex -space-x-2">
                        {skill.recentEndorsements.slice(0, 5).map((endorsement, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                            title={`${endorsement.endorsedBy.firstName} ${endorsement.endorsedBy.lastName}`}
                          >
                            <img
                              src={endorsement.endorsedBy.profilePicture || '/api/placeholder/32/32'}
                              alt={endorsement.endorsedBy.firstName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {skill.endorsementCount > 5 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              +{skill.endorsementCount - 5}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {skills.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {isOwnProfile ? 'No skills added yet' : 'No skills listed'}
          </h4>
          <p className="text-gray-500 mb-4">
            {isOwnProfile 
              ? 'Add your skills to get endorsements from your network'
              : 'This user hasn\'t added any skills yet'
            }
          </p>
          {isOwnProfile && (
            <button
              onClick={() => setShowAddSkill(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Skill
            </button>
          )}
        </div>
      )}

      {/* Endorsement Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Endorse {skills.find(s => s.name === selectedSkill.name)?.name}
            </h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a note (optional)
              </label>
              <textarea
                value={endorsementNote}
                onChange={(e) => setEndorsementNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="Share why you're endorsing this skill..."
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedSkill(null);
                  setEndorsementNote('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEndorseSkill(selectedSkill.name)}
                disabled={endorsing === selectedSkill.name}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {endorsing === selectedSkill.name && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <Star className="w-4 h-4" />
                <span>Endorse</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillEndorsements; 