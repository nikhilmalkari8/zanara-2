import React, { useState, useEffect } from 'react';

const FashionStudentDashboard = ({ user, onLogout, setCurrentPage, onViewProfile }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [opportunities, setOpportunities] = useState([]);
  const [skillGoals, setSkillGoals] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch profile data
      const profileResponse = await fetch('http://localhost:8001/api/professional-profile/fashion-student/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
        
        // Calculate stats
        setStats({
          completionPercentage: profileData.completionPercentage || 0,
          profileViews: profileData.profileViews || 0,
          projectsCompleted: profileData.projects?.length || 0,
          skillsLearned: (profileData.designSkills?.length || 0) + (profileData.technicalSkills?.length || 0),
          networkingConnections: profileData.connections || 0,
          timeUntilGraduation: profileData.timeUntilGraduation || 'Unknown',
          academicAchievements: profileData.academicAchievements?.length || 0,
          competitionsEntered: profileData.competitions?.length || 0
        });
        
        setSkillGoals(profileData.skillDevelopmentGoals || []);
      }

      // Fetch internship opportunities
      const opportunitiesResponse = await fetch('http://localhost:8001/api/opportunities/student-opportunities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (opportunitiesResponse.ok) {
        const opportunitiesData = await opportunitiesResponse.json();
        setOpportunities(opportunitiesData.opportunities || []);
      }

      // Fetch recent activities
      const activitiesResponse = await fetch('http://localhost:8001/api/activity/student-feed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData.activities || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSkillProgress = async (goalId, newProgress) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/professional-profile/fashion-student/skill-progress/${goalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progress: newProgress })
      });

      if (response.ok) {
        // Update local state
        setSkillGoals(prev => prev.map(goal => 
          goal._id === goalId ? { ...goal, progress: newProgress } : goal
        ));
      }
    } catch (error) {
      console.error('Error updating skill progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.fullName || user?.firstName}! 🎓
            </h1>
            <p className="text-purple-100 text-lg">
              {profile?.currentYear} • {profile?.primarySpecialization} • {profile?.currentInstitution}
            </p>
            <p className="text-purple-200 mt-2">
              Graduation in: {stats.timeUntilGraduation}
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-full w-24 h-24 flex items-center justify-center mb-2">
              <span className="text-3xl font-bold">{stats.completionPercentage}%</span>
            </div>
            <p className="text-sm text-purple-200">Profile Complete</p>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Profile Views</p>
              <p className="text-2xl font-bold text-gray-900">{stats.profileViews}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">👁️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Projects Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.projectsCompleted}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">🎨</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Skills Learned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.skillsLearned}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Connections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.networkingConnections}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">🤝</span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Academic Progress</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profile Completion</span>
              <span className="font-semibold">{stats.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                style={{ width: `${stats.completionPercentage}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats.academicAchievements}</p>
                <p className="text-sm text-gray-600">Achievements</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-pink-600">{stats.competitionsEntered}</p>
                <p className="text-sm text-gray-600">Competitions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Skill Development Goals</h3>
          <div className="space-y-4">
            {skillGoals.slice(0, 3).map((goal, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{goal.skill}</span>
                  <span className="text-sm text-gray-500">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{goal.currentLevel}</span>
                  <span>→ {goal.targetLevel}</span>
                </div>
              </div>
            ))}
            
            {skillGoals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No skill goals set yet</p>
                <button 
                  onClick={() => setActiveTab('skills')}
                  className="mt-2 text-purple-600 hover:underline"
                >
                  Set your first goal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-full">
                <span className="text-lg">{activity.icon || '📚'}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
          
          {recentActivities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOpportunities = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Internship Opportunities</h2>
        <button 
          onClick={() => setCurrentPage('opportunities')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          View All Opportunities
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.slice(0, 6).map((opportunity, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg text-gray-900">{opportunity.title}</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {opportunity.type}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{opportunity.company}</p>
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{opportunity.description}</p>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{opportunity.location}</span>
              <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💼</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-600 mb-4">Check back later for new internship opportunities</p>
        </div>
      )}
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Add New Project
        </button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 text-center shadow">
          <p className="text-2xl font-bold text-purple-600">{profile?.photos?.length || 0}</p>
          <p className="text-sm text-gray-600">Photos</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow">
          <p className="text-2xl font-bold text-pink-600">{profile?.projects?.length || 0}</p>
          <p className="text-sm text-gray-600">Projects</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow">
          <p className="text-2xl font-bold text-blue-600">{profile?.competitions?.length || 0}</p>
          <p className="text-sm text-gray-600">Competitions</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow">
          <p className="text-2xl font-bold text-green-600">{profile?.exhibitions?.length || 0}</p>
          <p className="text-sm text-gray-600">Exhibitions</p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Recent Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile?.projects?.slice(0, 6).map((project, index) => (
            <div key={index} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {project.images && project.images[0] && (
                <img 
                  src={project.images[0]} 
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h4 className="font-semibold mb-2">{project.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{project.category}</p>
                <p className="text-sm text-gray-700 line-clamp-2">{project.description}</p>
              </div>
            </div>
          ))}
        </div>

        {(!profile?.projects || profile.projects.length === 0) && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Start building your portfolio by adding your first project</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Add Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Zanara</h1>
              <span className="text-sm text-gray-500">Fashion Student</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onViewProfile(user?.id)}
                className="text-gray-600 hover:text-gray-900"
              >
                View Profile
              </button>
              <button 
                onClick={() => setCurrentPage('design-tools')}
                className="text-gray-600 hover:text-gray-900"
              >
                🎨 Design Tools
              </button>
              <button 
                onClick={() => setCurrentPage('browse-talent')}
                className="text-gray-600 hover:text-gray-900"
              >
                Browse Professionals
              </button>
              <button 
                onClick={() => setCurrentPage('opportunities')}
                className="text-gray-600 hover:text-gray-900"
              >
                Opportunities
              </button>
              <button 
                onClick={onLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'opportunities', label: 'Opportunities', icon: '💼' },
              { id: 'portfolio', label: 'Portfolio', icon: '🎨' },
              { id: 'skills', label: 'Skills', icon: '⚡' },
              { id: 'networking', label: 'Networking', icon: '🤝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'opportunities' && renderOpportunities()}
        {activeTab === 'portfolio' && renderPortfolio()}
        {activeTab === 'skills' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills Development</h2>
            <p className="text-gray-600">Skills management features coming soon!</p>
          </div>
        )}
        {activeTab === 'networking' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Networking</h2>
            <p className="text-gray-600">Networking features coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FashionStudentDashboard; 