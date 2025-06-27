import React, { useState, useEffect } from 'react';
import { Palette, Copy, Download, Share2, Plus, X, Eye, Shuffle, Save, Upload } from 'lucide-react';

const ColorStudio = ({ setCurrentPage }) => {
  const [selectedColor, setSelectedColor] = useState('#FF5733');
  const [generatedPalette, setGeneratedPalette] = useState([]);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPalette, setCurrentPalette] = useState({
    name: '',
    description: '',
    colors: [],
    season: 'spring',
    mood: 'vibrant'
  });

  // Generate color palette using Color API
  const generatePalette = async (baseColor) => {
    setLoading(true);
    try {
      const response = await fetch('/api/design-tools/colors/generate-palette', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ baseColor })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPalette(data.data.colors || []);
      } else {
        // Fallback to mock palette
        setGeneratedPalette(generateMockPalette(baseColor));
      }
    } catch (error) {
      console.error('Palette generation error:', error);
      setGeneratedPalette(generateMockPalette(baseColor));
    }
    setLoading(false);
  };

  // Mock palette generation
  const generateMockPalette = (baseColor) => {
    const variations = [
      { hex: baseColor, name: 'Base Color' },
      { hex: adjustBrightness(baseColor, 20), name: 'Light Variant' },
      { hex: adjustBrightness(baseColor, -20), name: 'Dark Variant' },
      { hex: generateComplementary(baseColor), name: 'Complementary' },
      { hex: generateAnalogous(baseColor, 30), name: 'Analogous 1' },
      { hex: generateAnalogous(baseColor, -30), name: 'Analogous 2' }
    ];
    return variations;
  };

  // Color manipulation functions
  const adjustBrightness = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const generateComplementary = (hex) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const R = 255 - (num >> 16);
    const G = 255 - (num >> 8 & 0x00FF);
    const B = 255 - (num & 0x0000FF);
    return '#' + (R * 0x10000 + G * 0x100 + B).toString(16).padStart(6, '0');
  };

  const generateAnalogous = (hex, degrees) => {
    // Simplified analogous color generation
    const num = parseInt(hex.replace('#', ''), 16);
    const R = Math.min(255, Math.max(0, (num >> 16) + degrees));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + degrees/2));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) - degrees/3));
    return '#' + (R * 0x10000 + G * 0x100 + B).toString(16).padStart(6, '0');
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    // Show toast notification
    alert(`Copied ${color} to clipboard!`);
  };

  const addToPalette = (color) => {
    if (!currentPalette.colors.find(c => c.hex === color.hex)) {
      setCurrentPalette({
        ...currentPalette,
        colors: [...currentPalette.colors, color]
      });
    }
  };

  const removeFromPalette = (colorHex) => {
    setCurrentPalette({
      ...currentPalette,
      colors: currentPalette.colors.filter(c => c.hex !== colorHex)
    });
  };

  const savePalette = async () => {
    if (currentPalette.colors.length === 0) {
      alert('Please add some colors to your palette first!');
      return;
    }

    try {
      const response = await fetch('/api/design-tools/color-palettes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(currentPalette)
      });

      if (response.ok) {
        alert('Palette saved successfully!');
        loadSavedPalettes();
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const loadSavedPalettes = async () => {
    try {
      const response = await fetch('/api/design-tools/color-palettes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedPalettes(data.data || []);
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  useEffect(() => {
    loadSavedPalettes();
    generatePalette(selectedColor);
  }, []);

  const trendingColors = [
    { hex: '#FF6B6B', name: 'Coral Red' },
    { hex: '#4ECDC4', name: 'Turquoise' },
    { hex: '#45B7D1', name: 'Sky Blue' },
    { hex: '#96CEB4', name: 'Mint Green' },
    { hex: '#FFEAA7', name: 'Warm Yellow' },
    { hex: '#DDA0DD', name: 'Plum' },
    { hex: '#98D8C8', name: 'Seafoam' },
    { hex: '#F7DC6F', name: 'Soft Gold' }
  ];

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
              <h1 className="text-2xl font-light text-white">Color Palette Studio</h1>
            </div>
            
            <button
              onClick={savePalette}
              disabled={currentPalette.colors.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              Save Palette
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Color Generator */}
          <div className="lg:col-span-2 space-y-8">
            {/* Color Input */}
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-4">Generate Palette</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Base Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-16 h-12 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500/50 focus:outline-none"
                      placeholder="#FF5733"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => generatePalette(selectedColor)}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 mt-6"
                >
                  {loading ? 'Generating...' : 'Generate'}
                </button>
              </div>

              {/* Trending Colors */}
              <div>
                <h3 className="text-lg font-light text-white mb-3">Trending Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingColors.map(color => (
                    <button
                      key={color.hex}
                      onClick={() => {
                        setSelectedColor(color.hex);
                        generatePalette(color.hex);
                      }}
                      className="group relative"
                      title={color.name}
                    >
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-white/20 hover:border-white/40 transition-colors"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {color.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Palette */}
            {generatedPalette.length > 0 && (
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-light text-white mb-4">Generated Palette</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generatedPalette.map((color, index) => (
                    <div key={index} className="group">
                      <div
                        className="w-full h-24 rounded-xl border border-white/20 mb-2 cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => addToPalette(color)}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{color.name}</p>
                          <p className="text-white/60 text-xs">{color.hex}</p>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => copyToClipboard(color.hex)}
                            className="p-1 text-white/60 hover:text-white transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => addToPalette(color)}
                            className="p-1 text-white/60 hover:text-white transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Palette */}
          <div className="space-y-8">
            {/* Palette Builder */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-light text-white mb-4">Your Palette</h3>
              
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={currentPalette.name}
                  onChange={(e) => setCurrentPalette({...currentPalette, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500/50 focus:outline-none"
                  placeholder="Palette name..."
                />
                
                <select
                  value={currentPalette.season}
                  onChange={(e) => setCurrentPalette({...currentPalette, season: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-pink-500/50 focus:outline-none"
                >
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="fall">Fall</option>
                  <option value="winter">Winter</option>
                </select>
                
                <select
                  value={currentPalette.mood}
                  onChange={(e) => setCurrentPalette({...currentPalette, mood: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-pink-500/50 focus:outline-none"
                >
                  <option value="vibrant">Vibrant</option>
                  <option value="muted">Muted</option>
                  <option value="pastel">Pastel</option>
                  <option value="bold">Bold</option>
                  <option value="earthy">Earthy</option>
                </select>
              </div>

              {currentPalette.colors.length === 0 ? (
                <div className="text-center py-8">
                  <Palette className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">No colors added yet</p>
                  <p className="text-white/40 text-sm">Generate and add colors to build your palette</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentPalette.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-white/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">{color.name}</p>
                        <p className="text-white/60 text-xs">{color.hex}</p>
                      </div>
                      <button
                        onClick={() => removeFromPalette(color.hex)}
                        className="p-1 text-white/60 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Palettes */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-light text-white mb-4">Saved Palettes</h3>
              
              {savedPalettes.length === 0 ? (
                <p className="text-white/60 text-center py-4">No saved palettes yet</p>
              ) : (
                <div className="space-y-3">
                  {savedPalettes.slice(0, 5).map((palette, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-xl">
                      <p className="text-white text-sm font-medium mb-2">{palette.name}</p>
                      <div className="flex gap-1">
                        {palette.colors.slice(0, 5).map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-6 h-6 rounded border border-white/20"
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorStudio; 