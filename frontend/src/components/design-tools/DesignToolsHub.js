import React, { useState, useEffect } from 'react';
import { 
  Palette, FileText, Grid, Layers, Scissors, Ruler, 
  Shirt, Package, Download, Share2, Save, Plus, 
  Image, Type, Paintbrush, Zap, Star, Sparkles, 
  Compass, PenTool, Layout, 
  Archive, BookOpen, Folder, Search, Filter
} from 'lucide-react';

const DesignToolsHub = ({ user, onLogout, setCurrentPage }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentProjects, setRecentProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentProjects();
    fetchTemplates();
  }, []);

  const fetchRecentProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/design-tools/recent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching recent projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/design-tools/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const designTools = [
    {
      id: 'moodboard',
      title: 'Moodboard Creator',
      description: 'Create stunning visual moodboards with drag-and-drop functionality',
      icon: Palette,
      category: 'creative',
      color: 'from-purple-500 to-pink-500',
      features: ['Drag & Drop', 'Product Links', 'Color Palette', 'Export Options'],
      action: () => setCurrentPage('moodboard-creator')
    },
    {
      id: 'techpack',
      title: 'Tech Pack Templates',
      description: 'Professional tech pack templates for seamless production handoff',
      icon: FileText,
      category: 'technical',
      color: 'from-blue-500 to-cyan-500',
      features: ['Editable Templates', 'Shareable Links', 'Job Integration', 'Version Control'],
      action: () => setCurrentPage('tech-pack-creator')
    },
    {
      id: 'pattern',
      title: 'Pattern Sheets',
      description: 'Digital pattern creation and grading tools',
      icon: Scissors,
      category: 'technical',
      color: 'from-green-500 to-emerald-500',
      features: ['Pattern Grading', 'Size Charts', 'Measurement Tools', 'Print Ready'],
      action: () => setCurrentPage('pattern-maker')
    },
    {
      id: 'fabric',
      title: 'Fabric Library',
      description: 'Comprehensive fabric and material database with swatches',
      icon: Layers,
      category: 'materials',
      color: 'from-orange-500 to-red-500',
      features: ['Swatch Catalog', 'Supplier Info', 'Price Tracking', 'Sustainability Data'],
      action: () => setCurrentPage('fabric-library')
    },
    {
      id: 'color',
      title: 'Color Palette Studio',
      description: 'Professional color palette creation with Pantone integration',
      icon: Paintbrush,
      category: 'creative',
      color: 'from-pink-500 to-rose-500',
      features: ['Pantone Colors', 'Trend Colors', 'Harmony Rules', 'Export Formats'],
      action: () => setCurrentPage('color-studio')
    },
    {
      id: 'measurement',
      title: 'Size Chart Builder',
      description: 'Create accurate size charts and measurement guides',
      icon: Ruler,
      category: 'technical',
      color: 'from-indigo-500 to-purple-500',
      features: ['Global Standards', 'Custom Sizing', 'Fit Guides', 'Brand Consistency'],
      action: () => setCurrentPage('size-chart-builder')
    },
    {
      id: 'sketch',
      title: 'Fashion Sketcher',
      description: 'Digital fashion illustration and design sketching tool',
      icon: PenTool,
      category: 'creative',
      color: 'from-teal-500 to-cyan-500',
      features: ['Fashion Croquis', 'Brush Library', 'Layer Support', 'Vector Export'],
      action: () => setCurrentPage('fashion-sketcher')
    },
    {
      id: 'collection',
      title: 'Collection Planner',
      description: 'Plan and organize fashion collections with timeline management',
      icon: Layout,
      category: 'planning',
      color: 'from-yellow-500 to-orange-500',
      features: ['Timeline View', 'Budget Tracking', 'Milestone Management', 'Team Collaboration'],
      action: () => setCurrentPage('collection-planner')
    }
  ];

  const categories = [
    { key: 'all', label: 'All Tools', icon: Grid },
    { key: 'creative', label: 'Creative', icon: Sparkles },
    { key: 'technical', label: 'Technical', icon: Compass },
    { key: 'materials', label: 'Materials', icon: Package },
    { key: 'planning', label: 'Planning', icon: BookOpen }
  ];

  const filteredTools = designTools.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderToolCard = (tool) => {
    const IconComponent = tool.icon;
    
    return (
      <div
        key={tool.id}
        className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
        onClick={tool.action}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="w-7 h-7 text-white" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
          {tool.title}
        </h3>
        
        <p className="text-white/70 text-sm mb-4 line-clamp-2">
          {tool.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {tool.features.slice(0, 2).map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-white/10 text-white/80 rounded-lg text-xs">
              {feature}
            </span>
          ))}
          {tool.features.length > 2 && (
            <span className="px-2 py-1 bg-white/10 text-white/60 rounded-lg text-xs">
              +{tool.features.length - 2} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm capitalize">{tool.category}</span>
          <div className="flex items-center space-x-1 text-white/60">
            <Zap className="w-4 h-4" />
            <span className="text-xs">Pro</span>
          </div>
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
            <div className="text-white text-xl">Loading design tools...</div>
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
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Design Tools & Templates 🎨
              </h1>
              <p className="text-white/70 text-lg">
                Professional fashion design tools to streamline your creative workflow
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('collaboration')}
                className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Collaborate</span>
              </button>
              
              <button
                onClick={onLogout}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Tools Available', value: designTools.length, icon: Compass },
              { label: 'Recent Projects', value: recentProjects.length, icon: Folder },
              { label: 'Templates', value: templates.length, icon: Archive },
              { label: 'Pro Features', value: '∞', icon: Star }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="glass-effect rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
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

      {/* Search and Filters */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div className="glass-effect rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search design tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeCategory === category.key
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Folder className="w-5 h-5 mr-2" />
              Recent Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentProjects.slice(0, 4).map((project, index) => (
                <div key={index} className="glass-effect rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{project.name}</div>
                      <div className="text-white/60 text-xs">{project.type}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Design Tools Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.length === 0 ? (
            <div className="col-span-full glass-effect rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl text-white mb-2">No tools found</h3>
              <p className="text-white/60">
                Try adjusting your search or category filters
              </p>
            </div>
          ) : (
            filteredTools.map(renderToolCard)
          )}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div style={{ maxWidth: '1400px', margin: '30px auto 0' }}>
        <div className="glass-effect rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-2">More Tools Coming Soon</h2>
          <p className="text-white/70 mb-6">
            We're constantly adding new professional design tools to enhance your workflow
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'AI Design Assistant',
              'Trend Forecasting',
              'Virtual Fitting Room',
              'Sustainable Materials AI',
              '3D Garment Visualization',
              'Cost Calculator Pro'
            ].map((tool, index) => (
              <span key={index} className="px-4 py-2 bg-white/10 text-white/80 rounded-lg text-sm">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignToolsHub; 