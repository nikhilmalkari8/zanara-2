import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Star, Download, Share2, 
  Layers, Package, Leaf, DollarSign, Truck, 
  ArrowLeft, Grid, List, Eye, Heart, 
  MapPin, Clock, TrendingUp, Award,
  Palette, Ruler, Thermometer, Droplets
} from 'lucide-react';

const FabricLibrary = ({ user, onBack }) => {
  const [fabrics, setFabrics] = useState([]);
  const [filteredFabrics, setFilteredFabrics] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    composition: 'all',
    weight: 'all',
    sustainability: 'all',
    priceRange: 'all',
    supplier: 'all'
  });

  useEffect(() => {
    fetchFabrics();
    fetchFavorites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [fabrics, filters]);

  const fetchFabrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/design-tools/fabrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFabrics(data.fabrics || mockFabrics);
      } else {
        setFabrics(mockFabrics);
      }
    } catch (error) {
      console.error('Error fetching fabrics:', error);
      setFabrics(mockFabrics);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/design-tools/fabrics/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...fabrics];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(fabric =>
        fabric.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        fabric.composition.toLowerCase().includes(filters.search.toLowerCase()) ||
        fabric.supplier.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(fabric => fabric.category === filters.category);
    }

    // Composition filter
    if (filters.composition !== 'all') {
      filtered = filtered.filter(fabric => 
        fabric.composition.toLowerCase().includes(filters.composition.toLowerCase())
      );
    }

    // Weight filter
    if (filters.weight !== 'all') {
      filtered = filtered.filter(fabric => fabric.weightCategory === filters.weight);
    }

    // Sustainability filter
    if (filters.sustainability !== 'all') {
      if (filters.sustainability === 'sustainable') {
        filtered = filtered.filter(fabric => fabric.sustainability.isOrganic || fabric.sustainability.isRecycled);
      }
    }

    setFilteredFabrics(filtered);
  };

  const toggleFavorite = async (fabricId) => {
    try {
      const token = localStorage.getItem('token');
      const method = favorites.includes(fabricId) ? 'DELETE' : 'POST';
      
      const response = await fetch(`http://localhost:8001/api/design-tools/fabrics/${fabricId}/favorite`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        if (favorites.includes(fabricId)) {
          setFavorites(prev => prev.filter(id => id !== fabricId));
        } else {
          setFavorites(prev => [...prev, fabricId]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Mock data for demonstration
  const mockFabrics = [
    {
      id: 1,
      name: 'Organic Cotton Twill',
      category: 'Cotton',
      composition: '100% Organic Cotton',
      weight: 220,
      weightCategory: 'medium',
      width: 150,
      color: '#F5F5DC',
      pantone: '11-0601 TPX',
      texture: 'Twill Weave',
      supplier: {
        name: 'EcoTextiles Co.',
        location: 'Portugal',
        rating: 4.8,
        leadTime: '14-21 days'
      },
      pricing: {
        minimumOrder: 50,
        pricePerMeter: 12.50,
        currency: 'USD',
        bulkDiscount: '10% for 500m+'
      },
      sustainability: {
        isOrganic: true,
        isRecycled: false,
        certifications: ['GOTS', 'OEKO-TEX'],
        carbonFootprint: 'Low',
        waterUsage: 'Reduced'
      },
      properties: {
        breathability: 'High',
        stretch: 'None',
        drape: 'Structured',
        opacity: 'Opaque',
        careInstructions: 'Machine wash cold, tumble dry low'
      },
      applications: ['Workwear', 'Casual wear', 'Outerwear'],
      swatchImage: '/fabric-swatches/cotton-twill.jpg',
      inStock: true,
      trending: true
    },
    {
      id: 2,
      name: 'Recycled Polyester Crepe',
      category: 'Synthetic',
      composition: '100% Recycled Polyester',
      weight: 150,
      weightCategory: 'light',
      width: 140,
      color: '#000000',
      pantone: '19-4007 TPX',
      texture: 'Crepe',
      supplier: {
        name: 'Sustainable Fabrics Ltd.',
        location: 'Italy',
        rating: 4.6,
        leadTime: '10-14 days'
      },
      pricing: {
        minimumOrder: 25,
        pricePerMeter: 18.75,
        currency: 'USD',
        bulkDiscount: '15% for 200m+'
      },
      sustainability: {
        isOrganic: false,
        isRecycled: true,
        certifications: ['GRS', 'OEKO-TEX'],
        carbonFootprint: 'Medium',
        waterUsage: 'Low'
      },
      properties: {
        breathability: 'Medium',
        stretch: 'Slight',
        drape: 'Fluid',
        opacity: 'Semi-opaque',
        careInstructions: 'Machine wash cold, hang dry'
      },
      applications: ['Dresses', 'Blouses', 'Linings'],
      swatchImage: '/fabric-swatches/polyester-crepe.jpg',
      inStock: true,
      trending: false
    },
    {
      id: 3,
      name: 'Linen Blend Canvas',
      category: 'Linen',
      composition: '55% Linen, 45% Cotton',
      weight: 280,
      weightCategory: 'heavy',
      width: 145,
      color: '#F0E68C',
      pantone: '13-0859 TPX',
      texture: 'Canvas Weave',
      supplier: {
        name: 'European Linens',
        location: 'Belgium',
        rating: 4.9,
        leadTime: '21-28 days'
      },
      pricing: {
        minimumOrder: 30,
        pricePerMeter: 22.00,
        currency: 'USD',
        bulkDiscount: '12% for 300m+'
      },
      sustainability: {
        isOrganic: false,
        isRecycled: false,
        certifications: ['OEKO-TEX'],
        carbonFootprint: 'Low',
        waterUsage: 'Medium'
      },
      properties: {
        breathability: 'Excellent',
        stretch: 'None',
        drape: 'Structured',
        opacity: 'Opaque',
        careInstructions: 'Dry clean or gentle hand wash'
      },
      applications: ['Jackets', 'Pants', 'Home decor'],
      swatchImage: '/fabric-swatches/linen-canvas.jpg',
      inStock: true,
      trending: true
    }
  ];

  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'Cotton', label: 'Cotton' },
    { key: 'Linen', label: 'Linen' },
    { key: 'Silk', label: 'Silk' },
    { key: 'Wool', label: 'Wool' },
    { key: 'Synthetic', label: 'Synthetic' },
    { key: 'Denim', label: 'Denim' },
    { key: 'Knit', label: 'Knit' }
  ];

  const renderFabricCard = (fabric) => (
    <div
      key={fabric.id}
      className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
      onClick={() => setSelectedFabric(fabric)}
    >
      {/* Fabric Swatch */}
      <div className="relative mb-4">
        <div
          className="w-full h-32 rounded-lg border-2 border-white/20 group-hover:border-purple-500 transition-colors"
          style={{ backgroundColor: fabric.color }}
        >
          {fabric.swatchImage && (
            <img
              src={fabric.swatchImage}
              alt={fabric.name}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
        
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex space-x-1">
          {fabric.sustainability.isOrganic && (
            <span className="px-2 py-1 bg-green-500/80 text-white text-xs rounded-lg">
              Organic
            </span>
          )}
          {fabric.sustainability.isRecycled && (
            <span className="px-2 py-1 bg-blue-500/80 text-white text-xs rounded-lg">
              Recycled
            </span>
          )}
          {fabric.trending && (
            <span className="px-2 py-1 bg-orange-500/80 text-white text-xs rounded-lg">
              Trending
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(fabric.id);
          }}
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
        >
          <Heart 
            className={`w-4 h-4 ${
              favorites.includes(fabric.id) ? 'text-red-500 fill-current' : 'text-white'
            }`} 
          />
        </button>
      </div>

      {/* Fabric Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
            {fabric.name}
          </h3>
          <p className="text-white/70 text-sm">{fabric.composition}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">{fabric.weight}gsm</span>
          <span className="text-white/60">{fabric.width}cm wide</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-white/60" />
            <span className="text-white/70 text-sm">{fabric.supplier.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white/70 text-sm">{fabric.supplier.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-white font-medium">
            ${fabric.pricing.pricePerMeter}/m
          </span>
          <span className={`px-2 py-1 rounded-lg text-xs ${
            fabric.inStock ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {fabric.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderFabricDetail = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{selectedFabric.name}</h2>
              <p className="text-white/70">{selectedFabric.composition}</p>
            </div>
            <button
              onClick={() => setSelectedFabric(null)}
              className="text-white/60 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Visual */}
            <div className="space-y-6">
              {/* Large Swatch */}
              <div
                className="w-full h-64 rounded-xl border-2 border-white/20"
                style={{ backgroundColor: selectedFabric.color }}
              >
                {selectedFabric.swatchImage && (
                  <img
                    src={selectedFabric.swatchImage}
                    alt={selectedFabric.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}
              </div>

              {/* Color Info */}
              <div className="glass-effect rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">Color Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Hex Code:</span>
                    <span className="text-white ml-2">{selectedFabric.color}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Pantone:</span>
                    <span className="text-white ml-2">{selectedFabric.pantone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Technical Specifications */}
              <div className="glass-effect rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <Ruler className="w-5 h-5 mr-2" />
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/60">Weight:</span>
                    <span className="text-white ml-2">{selectedFabric.weight}gsm</span>
                  </div>
                  <div>
                    <span className="text-white/60">Width:</span>
                    <span className="text-white ml-2">{selectedFabric.width}cm</span>
                  </div>
                  <div>
                    <span className="text-white/60">Texture:</span>
                    <span className="text-white ml-2">{selectedFabric.texture}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Drape:</span>
                    <span className="text-white ml-2">{selectedFabric.properties.drape}</span>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="glass-effect rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Supplier Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Name:</span>
                    <span className="text-white">{selectedFabric.supplier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Location:</span>
                    <span className="text-white">{selectedFabric.supplier.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white">{selectedFabric.supplier.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Lead Time:</span>
                    <span className="text-white">{selectedFabric.supplier.leadTime}</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="glass-effect rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Price per meter:</span>
                    <span className="text-white font-medium">
                      ${selectedFabric.pricing.pricePerMeter}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Minimum order:</span>
                    <span className="text-white">{selectedFabric.pricing.minimumOrder}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Bulk discount:</span>
                    <span className="text-white">{selectedFabric.pricing.bulkDiscount}</span>
                  </div>
                </div>
              </div>

              {/* Sustainability */}
              <div className="glass-effect rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <Leaf className="w-5 h-5 mr-2" />
                  Sustainability
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {selectedFabric.sustainability.certifications.map((cert, index) => (
                      <span key={index} className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs">
                        {cert}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Carbon footprint:</span>
                    <span className="text-white">{selectedFabric.sustainability.carbonFootprint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Water usage:</span>
                    <span className="text-white">{selectedFabric.sustainability.waterUsage}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => toggleFavorite(selectedFabric.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-colors ${
                favorites.includes(selectedFabric.id)
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>{favorites.includes(selectedFabric.id) ? 'Remove from' : 'Add to'} Favorites</span>
            </button>
            
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
              <Download className="w-5 h-5" />
              <span>Download Specs</span>
            </button>
            
            <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="glass-effect rounded-2xl p-8 text-center">
            <div className="text-white text-xl">Loading fabric library...</div>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Fabric Library 🧵
                </h1>
                <p className="text-white/70">
                  Discover sustainable fabrics and materials for your designs
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                <span>{viewMode === 'grid' ? 'List' : 'Grid'}</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Fabrics', value: fabrics.length, icon: Layers },
              { label: 'Sustainable Options', value: fabrics.filter(f => f.sustainability.isOrganic || f.sustainability.isRecycled).length, icon: Leaf },
              { label: 'Suppliers', value: new Set(fabrics.map(f => f.supplier.name)).size, icon: Truck },
              { label: 'Favorites', value: favorites.length, icon: Heart }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="glass-effect rounded-xl p-4 text-center">
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

      {/* Filters */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div className="glass-effect rounded-xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search fabrics..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              {categories.map(cat => (
                <option key={cat.key} value={cat.key} className="bg-gray-800">
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Weight Filter */}
            <select
              value={filters.weight}
              onChange={(e) => setFilters({ ...filters, weight: e.target.value })}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all" className="bg-gray-800">All Weights</option>
              <option value="light" className="bg-gray-800">Light (50-150gsm)</option>
              <option value="medium" className="bg-gray-800">Medium (150-250gsm)</option>
              <option value="heavy" className="bg-gray-800">Heavy (250gsm+)</option>
            </select>

            {/* Sustainability Filter */}
            <select
              value={filters.sustainability}
              onChange={(e) => setFilters({ ...filters, sustainability: e.target.value })}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all" className="bg-gray-800">All Fabrics</option>
              <option value="sustainable" className="bg-gray-800">Sustainable Only</option>
            </select>

            {/* Price Filter */}
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all" className="bg-gray-800">All Prices</option>
              <option value="budget" className="bg-gray-800">Under $15/m</option>
              <option value="mid" className="bg-gray-800">$15-25/m</option>
              <option value="premium" className="bg-gray-800">$25+/m</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fabric Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredFabrics.length === 0 ? (
            <div className="col-span-full glass-effect rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl text-white mb-2">No fabrics found</h3>
              <p className="text-white/60">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            filteredFabrics.map(renderFabricCard)
          )}
        </div>
      </div>

      {/* Fabric Detail Modal */}
      {selectedFabric && renderFabricDetail()}
    </div>
  );
};

export default FabricLibrary; 