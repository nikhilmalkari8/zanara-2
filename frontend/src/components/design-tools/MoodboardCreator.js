import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Share2, Heart, X, Grid, List, Filter, Camera, Palette, Tag } from 'lucide-react';

const MoodboardCreator = ({ setCurrentPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moodboard, setMoodboard] = useState({
    title: '',
    description: '',
    tags: [],
    category: 'inspiration'
  });
  const [viewMode, setViewMode] = useState('grid');

  // Search images using Unsplash API
  const searchImages = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/design-tools/images/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);
      } else {
        // Fallback to mock data if API fails
        setSearchResults(getMockImages(query));
      }
    } catch (error) {
      console.error('Image search error:', error);
      setSearchResults(getMockImages(query));
    }
    setLoading(false);
  };

  // Mock images for testing
  const getMockImages = (query) => [
    {
      id: '1',
      urls: { regular: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' },
      alt_description: `Fashion ${query}`,
      user: { name: 'Fashion Photographer' }
    },
    {
      id: '2', 
      urls: { regular: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400' },
      alt_description: `Style ${query}`,
      user: { name: 'Style Photographer' }
    },
    {
      id: '3',
      urls: { regular: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
      alt_description: `Design ${query}`,
      user: { name: 'Design Photographer' }
    }
  ];

  const addToMoodboard = (image) => {
    if (!selectedImages.find(img => img.id === image.id)) {
      setSelectedImages([...selectedImages, image]);
    }
  };

  const removeFromMoodboard = (imageId) => {
    setSelectedImages(selectedImages.filter(img => img.id !== imageId));
  };

  const saveMoodboard = async () => {
    try {
      const response = await fetch('/api/design-tools/moodboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...moodboard,
          images: selectedImages
        })
      });

      if (response.ok) {
        alert('Moodboard saved successfully!');
        setCurrentPage('design-tools');
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('design-tools')}
                className="text-white/60 hover:text-white transition-colors"
              >
                ← Back to Design Tools
              </button>
              <h1 className="text-2xl font-light text-white">Moodboard Creator</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 glass-effect text-white/60 hover:text-white rounded-lg"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
              
              <button
                onClick={saveMoodboard}
                disabled={selectedImages.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                Save Moodboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Moodboard Info */}
        <div className="mb-8 glass-effect rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Moodboard Title
              </label>
              <input
                type="text"
                value={moodboard.title}
                onChange={(e) => setMoodboard({...moodboard, title: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500/50 focus:outline-none"
                placeholder="Enter moodboard title..."
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Category
              </label>
              <select
                value={moodboard.category}
                onChange={(e) => setMoodboard({...moodboard, category: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-pink-500/50 focus:outline-none"
              >
                <option value="inspiration">Inspiration</option>
                <option value="color-palette">Color Palette</option>
                <option value="texture">Texture & Fabric</option>
                <option value="silhouette">Silhouette</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={moodboard.description}
              onChange={(e) => setMoodboard({...moodboard, description: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500/50 focus:outline-none resize-none"
              rows="3"
              placeholder="Describe your moodboard concept..."
            />
          </div>
        </div>

        {/* Image Search */}
        <div className="mb-8 glass-effect rounded-2xl p-6">
          <h2 className="text-xl font-light text-white mb-4">Search Images</h2>
          
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchImages(searchQuery)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500/50 focus:outline-none"
                placeholder="Search for fashion, style, colors, textures..."
              />
            </div>
            
            <button
              onClick={() => searchImages(searchQuery)}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap gap-2">
            {['Fashion', 'Minimalist', 'Vintage', 'Bohemian', 'Street Style', 'Elegant', 'Casual', 'Formal'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  searchImages(tag);
                }}
                className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm hover:bg-white/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8 glass-effect rounded-2xl p-6">
            <h3 className="text-lg font-light text-white mb-4">Search Results</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map(image => (
                <div key={image.id} className="relative group cursor-pointer">
                  <img
                    src={image.urls.regular}
                    alt={image.alt_description}
                    className="w-full h-48 object-cover rounded-xl"
                    onClick={() => addToMoodboard(image)}
                  />
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <button
                      onClick={() => addToMoodboard(image)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs text-white/80 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                      by {image.user.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Images - Moodboard */}
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light text-white">
              Your Moodboard ({selectedImages.length} images)
            </h3>
            
            {selectedImages.length > 0 && (
              <div className="flex items-center space-x-2">
                <button className="p-2 glass-effect text-white/60 hover:text-white rounded-lg">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 glass-effect text-white/60 hover:text-white rounded-lg">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {selectedImages.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-2">No images selected yet</p>
              <p className="text-white/40">Search and add images to create your moodboard</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedImages.map(image => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.urls.regular}
                    alt={image.alt_description}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  
                  <button
                    onClick={() => removeFromMoodboard(image.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodboardCreator; 