import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Plus, Search, Filter, Users, Calendar, FileText, 
  Image, Palette, CheckSquare, Clock, Star, MoreVertical, Upload,
  Send, Paperclip, Smile, Eye, Download, Edit3, Trash2, UserPlus,
  Layout, Grid, Layers, Target, Zap, Award, TrendingUp
} from 'lucide-react';

const CollaborationHub = ({ user, onLogout, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'project',
    fashionMetadata: {
      season: '',
      year: new Date().getFullYear(),
      categories: [],
      theme: ''
    },
    visibility: 'team'
  });

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [filters]);

  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        type: filters.type,
        status: filters.status,
        search: filters.search
      });

      const response = await fetch(`http://localhost:8001/api/collaboration/my-projects?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.collaborations);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/collaboration/stats/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const createProject = async (projectData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/collaboration/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(prev => [data.collaboration, ...prev]);
        setShowCreateModal(false);
        // Reset form data
        setFormData({
          title: '',
          description: '',
          type: 'project',
          fashionMetadata: {
            season: '',
            year: new Date().getFullYear(),
            categories: [],
            theme: ''
          },
          visibility: 'team'
        });
        return data.collaboration;
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const getProjectTypeIcon = (type) => {
    switch (type) {
      case 'moodboard': return <Palette className="w-5 h-5" />;
      case 'collection': return <Layout className="w-5 h-5" />;
      case 'campaign': return <Target className="w-5 h-5" />;
      case 'photoshoot': return <Image className="w-5 h-5" />;
      case 'fashion-show': return <Star className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'completed': return 'bg-blue-500/20 text-blue-500';
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderProjectCard = (project) => {
    const isOwner = project.owner._id === user.id;
    const collaboratorCount = project.collaborators?.length || 0;

    return (
      <div
        key={project._id}
        className="glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
        onClick={() => setSelectedProject(project)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              {getProjectTypeIcon(project.type)}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                {project.title}
              </h3>
              <p className="text-white/60 text-sm">
                {project.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status.replace('-', ' ')}
          </div>
        </div>

        <p className="text-white/70 text-sm mb-4 line-clamp-2">
          {project.description || 'No description provided'}
        </p>

        {/* Fashion Metadata */}
        {project.fashionMetadata && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.fashionMetadata.season && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs">
                {project.fashionMetadata.season} {project.fashionMetadata.year}
              </span>
            )}
            {project.fashionMetadata.categories?.map((category, index) => (
              <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs">
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex items-center space-x-2 text-white/70">
            <Users className="w-4 h-4" />
            <span>{collaboratorCount + 1} members</span>
          </div>
          <div className="flex items-center space-x-2 text-white/70">
            <CheckSquare className="w-4 h-4" />
            <span>{project.completionPercentage || 0}% done</span>
          </div>
          <div className="flex items-center space-x-2 text-white/70">
            <Clock className="w-4 h-4" />
            <span>{formatDate(project.updatedAt)}</span>
          </div>
        </div>

        {/* Collaborators Avatars */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            <img
              src={project.owner.profilePicture || '/default-avatar.png'}
              alt={project.owner.firstName}
              className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover"
              title={`${project.owner.firstName} ${project.owner.lastName} (Owner)`}
            />
            {project.collaborators?.slice(0, 3).map((collab, index) => (
              <img
                key={index}
                src={collab.user.profilePicture || '/default-avatar.png'}
                alt={collab.user.firstName}
                className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover"
                title={`${collab.user.firstName} ${collab.user.lastName}`}
              />
            ))}
            {collaboratorCount > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-600 flex items-center justify-center text-xs text-white">
                +{collaboratorCount - 3}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-white/50">
            {isOwner && <Award className="w-4 h-4" title="Project Owner" />}
            <Eye className="w-4 h-4" />
            <span className="text-xs">{project.analytics?.views || 0}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateProjectModal = () => {
    const projectTypes = [
      { value: 'project', label: 'General Project', icon: FileText },
      { value: 'moodboard', label: 'Moodboard', icon: Palette },
      { value: 'collection', label: 'Collection', icon: Layout },
      { value: 'campaign', label: 'Campaign', icon: Target },
      { value: 'photoshoot', label: 'Photoshoot', icon: Image },
      { value: 'fashion-show', label: 'Fashion Show', icon: Star }
    ];

    const seasons = ['spring', 'summer', 'fall', 'winter', 'resort', 'pre-fall'];
    const categories = [
      'womenswear', 'menswear', 'childrenswear', 'accessories',
      'footwear', 'lingerie', 'activewear', 'sustainable',
      'luxury', 'streetwear', 'bridal', 'costume'
    ];

    const handleSubmit = (e) => {
      e.preventDefault();
      createProject(formData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass-effect rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create New Project</h2>
            <button
              onClick={() => {
                setShowCreateModal(false);
                // Reset form data when modal is closed
                setFormData({
                  title: '',
                  description: '',
                  type: 'project',
                  fashionMetadata: {
                    season: '',
                    year: new Date().getFullYear(),
                    categories: [],
                    theme: ''
                  },
                  visibility: 'team'
                });
              }}
              className="text-white/60 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block text-white font-medium mb-2">Project Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                placeholder="Enter project title..."
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500 h-24"
                placeholder="Describe your project..."
              />
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-white font-medium mb-3">Project Type</label>
              <div className="grid grid-cols-2 gap-3">
                {projectTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.type === type.value
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">{type.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fashion Metadata */}
            <div className="space-y-4">
              <h3 className="text-white font-medium">Fashion Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Season</label>
                  <select
                    value={formData.fashionMetadata.season}
                    onChange={(e) => setFormData({
                      ...formData,
                      fashionMetadata: { ...formData.fashionMetadata, season: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select season</option>
                    {seasons.map(season => (
                      <option key={season} value={season} className="bg-gray-800">
                        {season.charAt(0).toUpperCase() + season.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Year</label>
                  <input
                    type="number"
                    value={formData.fashionMetadata.year}
                    onChange={(e) => setFormData({
                      ...formData,
                      fashionMetadata: { ...formData.fashionMetadata, year: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Categories</label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.fashionMetadata.categories.includes(category)}
                        onChange={(e) => {
                          const categories = e.target.checked
                            ? [...formData.fashionMetadata.categories, category]
                            : formData.fashionMetadata.categories.filter(c => c !== category);
                          setFormData({
                            ...formData,
                            fashionMetadata: { ...formData.fashionMetadata, categories }
                          });
                        }}
                        className="text-purple-500"
                      />
                      <span className="text-white/70">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Theme</label>
                <input
                  type="text"
                  value={formData.fashionMetadata.theme}
                  onChange={(e) => setFormData({
                    ...formData,
                    fashionMetadata: { ...formData.fashionMetadata, theme: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Minimalist chic, Urban streetwear..."
                />
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-white font-medium mb-2">Visibility</label>
              <div className="flex space-x-4">
                {[
                  { value: 'private', label: 'Private', desc: 'Only you can see this project' },
                  { value: 'team', label: 'Team', desc: 'Only collaborators can see this' },
                  { value: 'public', label: 'Public', desc: 'Anyone can view this project' }
                ].map(option => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={formData.visibility === option.value}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="mt-1 text-purple-500"
                    />
                    <div>
                      <div className="text-white font-medium">{option.label}</div>
                      <div className="text-white/60 text-xs">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="glass-effect rounded-2xl p-8 text-center">
            <div className="text-white text-xl">Loading collaboration hub...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Collaboration Hub 🚀
              </h1>
              <p className="text-white/70">
                Create, collaborate, and bring your fashion projects to life
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>New Project</span>
              </button>
              
              <button
                onClick={onLogout}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Projects', value: stats.totalProjects || 0, icon: FileText, color: 'from-blue-500 to-cyan-500' },
              { label: 'Active Projects', value: stats.activeProjects || 0, icon: Zap, color: 'from-green-500 to-emerald-500' },
              { label: 'Completed', value: stats.completedProjects || 0, icon: CheckSquare, color: 'from-purple-500 to-pink-500' },
              { label: 'Owned Projects', value: stats.ownedProjects || 0, icon: Award, color: 'from-yellow-500 to-orange-500' }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="glass-effect rounded-xl p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-light text-white mb-1">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div className="glass-effect rounded-xl p-2">
          <div className="flex space-x-2">
            {[
              { key: 'projects', label: 'Projects', icon: Grid },
              { key: 'messages', label: 'Messages', icon: MessageSquare },
              { key: 'files', label: 'Files', icon: Upload },
              { key: 'approvals', label: 'Approvals', icon: CheckSquare }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      {activeTab === 'projects' && (
        <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
          <div className="glass-effect rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all" className="bg-gray-800">All Types</option>
                <option value="project" className="bg-gray-800">Projects</option>
                <option value="moodboard" className="bg-gray-800">Moodboards</option>
                <option value="collection" className="bg-gray-800">Collections</option>
                <option value="campaign" className="bg-gray-800">Campaigns</option>
                <option value="photoshoot" className="bg-gray-800">Photoshoots</option>
                <option value="fashion-show" className="bg-gray-800">Fashion Shows</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all" className="bg-gray-800">All Status</option>
                <option value="active" className="bg-gray-800">Active</option>
                <option value="completed" className="bg-gray-800">Completed</option>
                <option value="on-hold" className="bg-gray-800">On Hold</option>
                <option value="cancelled" className="bg-gray-800">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full glass-effect rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl text-white mb-2">No projects yet</h3>
                <p className="text-white/60 mb-6">
                  Start collaborating by creating your first fashion project
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              projects.map(renderProjectCard)
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="glass-effect rounded-xl p-8 text-center">
            <MessageSquare className="w-16 h-16 text-white/60 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">Integrated Messaging</h3>
            <p className="text-white/60 mb-6">
              Project-based messaging and team communication coming soon
            </p>
            <button
              onClick={() => setCurrentPage('messages')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Go to Messages
            </button>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="glass-effect rounded-xl p-8 text-center">
            <Upload className="w-16 h-16 text-white/60 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">File Management</h3>
            <p className="text-white/60 mb-6">
              Centralized file sharing and version control for your projects
            </p>
            <div className="text-white/50">Coming Soon</div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="glass-effect rounded-xl p-8 text-center">
            <CheckSquare className="w-16 h-16 text-white/60 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">Approval Workflow</h3>
            <p className="text-white/60 mb-6">
              Streamlined approval process for designs, concepts, and deliverables
            </p>
            <div className="text-white/50">Coming Soon</div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && renderCreateProjectModal()}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          user={user}
          onClose={() => setSelectedProject(null)}
          onUpdate={(updatedProject) => {
            setProjects(prev => prev.map(p => 
              p._id === updatedProject._id ? updatedProject : p
            ));
            setSelectedProject(updatedProject);
          }}
        />
      )}
    </div>
  );
};

// Project Detail Modal Component
const ProjectDetailModal = ({ project, user, onClose, onUpdate }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{project.title}</h2>
              <p className="text-white/60">
                {project.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 border-b border-white/10">
          <div className="flex space-x-4">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'tasks', label: 'Tasks' },
              { key: 'moodboard', label: 'Moodboard' },
              { key: 'files', label: 'Files' },
              { key: 'team', label: 'Team' }
            ].map(section => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.key
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-2">Description</h3>
                <p className="text-white/70">{project.description || 'No description provided'}</p>
              </div>

              {project.fashionMetadata && (
                <div>
                  <h3 className="text-white font-medium mb-3">Fashion Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {project.fashionMetadata.season && (
                      <div>
                        <span className="text-white/60">Season:</span>
                        <span className="text-white ml-2">
                          {project.fashionMetadata.season} {project.fashionMetadata.year}
                        </span>
                      </div>
                    )}
                    {project.fashionMetadata.theme && (
                      <div>
                        <span className="text-white/60">Theme:</span>
                        <span className="text-white ml-2">{project.fashionMetadata.theme}</span>
                      </div>
                    )}
                  </div>
                  
                  {project.fashionMetadata.categories?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-white/60 text-sm">Categories:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.fashionMetadata.categories.map((category, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="glass-effect rounded-lg p-4">
                  <div className="text-2xl font-light text-white">{project.completionPercentage || 0}%</div>
                  <div className="text-white/60 text-sm">Completed</div>
                </div>
                <div className="glass-effect rounded-lg p-4">
                  <div className="text-2xl font-light text-white">{project.collaborators?.length + 1 || 1}</div>
                  <div className="text-white/60 text-sm">Team Members</div>
                </div>
                <div className="glass-effect rounded-lg p-4">
                  <div className="text-2xl font-light text-white">{project.analytics?.views || 0}</div>
                  <div className="text-white/60 text-sm">Views</div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'tasks' && (
            <div className="text-center text-white/60">
              <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Task management coming soon</p>
            </div>
          )}

          {activeSection === 'moodboard' && (
            <div className="text-center text-white/60">
              <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Interactive moodboard editor coming soon</p>
            </div>
          )}

          {activeSection === 'files' && (
            <div className="text-center text-white/60">
              <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>File management coming soon</p>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 glass-effect rounded-lg">
                <img
                  src={project.owner.profilePicture || '/default-avatar.png'}
                  alt={project.owner.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {project.owner.firstName} {project.owner.lastName}
                  </div>
                  <div className="text-white/60 text-sm">Project Owner</div>
                </div>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>

              {project.collaborators?.map((collab, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 glass-effect rounded-lg">
                  <img
                    src={collab.user.profilePicture || '/default-avatar.png'}
                    alt={collab.user.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {collab.user.firstName} {collab.user.lastName}
                    </div>
                    <div className="text-white/60 text-sm capitalize">{collab.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationHub; 