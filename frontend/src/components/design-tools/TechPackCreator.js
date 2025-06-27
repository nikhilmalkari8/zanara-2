import React, { useState, useRef, useCallback } from 'react';
import { 
  FileText, Download, Share2, Save, Copy, Printer, 
  Upload, Image, Ruler, Palette, Package, 
  Settings, Eye, Edit3, Plus, Minus, X,
  ArrowLeft, ArrowRight, Layers, Grid,
  CheckSquare, AlertCircle, Info
} from 'lucide-react';

const TechPackCreator = ({ user, onBack, onSave }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [techPack, setTechPack] = useState({
    // Basic Information
    name: 'Untitled Tech Pack',
    description: '',
    season: 'Spring/Summer 2024',
    category: 'Womenswear',
    productType: 'Dress',
    designer: user?.firstName + ' ' + user?.lastName || '',
    date: new Date().toISOString().split('T')[0],
    version: '1.0',
    
    // Design Details
    designDetails: {
      silhouette: '',
      fit: 'Regular Fit',
      style: '',
      inspiration: '',
      targetCustomer: '',
      pricePoint: ''
    },
    
    // Technical Specifications
    measurements: {
      sizeRange: ['XS', 'S', 'M', 'L', 'XL'],
      measurementPoints: [
        { name: 'Bust/Chest', xs: '', s: '', m: '', l: '', xl: '' },
        { name: 'Waist', xs: '', s: '', m: '', l: '', xl: '' },
        { name: 'Hip', xs: '', s: '', m: '', l: '', xl: '' },
        { name: 'Length', xs: '', s: '', m: '', l: '', xl: '' }
      ]
    },
    
    // Materials & Fabrics
    materials: {
      mainFabric: {
        name: '',
        composition: '',
        weight: '',
        width: '',
        supplier: '',
        color: '',
        pantone: '',
        consumption: ''
      },
      lining: {
        name: '',
        composition: '',
        color: '',
        consumption: ''
      },
      interfacing: {
        name: '',
        type: '',
        placement: ''
      },
      trims: []
    },
    
    // Construction Details
    construction: {
      seams: '',
      stitching: '',
      finishing: '',
      specialInstructions: '',
      qualityStandards: ''
    },
    
    // Colors & Colorways
    colors: [
      { name: 'Primary', hex: '#000000', pantone: '', description: '' }
    ],
    
    // Sketches & Images
    images: {
      frontSketch: null,
      backSketch: null,
      sideSketch: null,
      detailSketches: [],
      inspirationImages: [],
      fabricSwatches: []
    },
    
    // Production Notes
    production: {
      minimumOrder: '',
      leadTime: '',
      packagingRequirements: '',
      labelingInstructions: '',
      careInstructions: '',
      specialRequirements: ''
    }
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef(null);

  const templates = [
    {
      id: 'dress',
      name: 'Dress Template',
      category: 'Womenswear',
      description: 'Complete tech pack template for dresses',
      preview: '/templates/dress-preview.jpg'
    },
    {
      id: 'shirt',
      name: 'Shirt Template',
      category: 'Menswear',
      description: 'Professional shirt tech pack template',
      preview: '/templates/shirt-preview.jpg'
    },
    {
      id: 'pants',
      name: 'Pants Template',
      category: 'Bottoms',
      description: 'Comprehensive pants tech pack template',
      preview: '/templates/pants-preview.jpg'
    }
  ];

  const handleInputChange = (section, field, value, index = null) => {
    setTechPack(prev => {
      const newTechPack = { ...prev };
      
      if (section === 'root') {
        newTechPack[field] = value;
      } else if (index !== null) {
        newTechPack[section][index][field] = value;
      } else if (typeof newTechPack[section] === 'object' && newTechPack[section] !== null) {
        newTechPack[section] = { ...newTechPack[section], [field]: value };
      } else {
        newTechPack[section] = value;
      }
      
      return newTechPack;
    });
  };

  const addMeasurementPoint = () => {
    setTechPack(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        measurementPoints: [
          ...prev.measurements.measurementPoints,
          { name: '', xs: '', s: '', m: '', l: '', xl: '' }
        ]
      }
    }));
  };

  const addTrim = () => {
    setTechPack(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        trims: [
          ...prev.materials.trims,
          { name: '', type: '', color: '', supplier: '', quantity: '' }
        ]
      }
    }));
  };

  const addColor = () => {
    setTechPack(prev => ({
      ...prev,
      colors: [
        ...prev.colors,
        { name: '', hex: '#000000', pantone: '', description: '' }
      ]
    }));
  };

  const handleImageUpload = (section, field) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setTechPack(prev => ({
            ...prev,
            images: {
              ...prev.images,
              [field]: event.target.result
            }
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const saveTechPack = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/design-tools/tech-packs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(techPack)
      });

      if (response.ok) {
        const data = await response.json();
        onSave && onSave(data.techPack);
      }
    } catch (error) {
      console.error('Error saving tech pack:', error);
    }
  };

  const exportTechPack = () => {
    // Export as PDF functionality would go here
    console.log('Exporting tech pack as PDF...');
  };

  const shareTechPack = () => {
    // Share functionality would go here
    console.log('Sharing tech pack...');
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Info },
    { key: 'design', label: 'Design Details', icon: Edit3 },
    { key: 'measurements', label: 'Measurements', icon: Ruler },
    { key: 'materials', label: 'Materials', icon: Layers },
    { key: 'construction', label: 'Construction', icon: Settings },
    { key: 'colors', label: 'Colors', icon: Palette },
    { key: 'images', label: 'Images', icon: Image },
    { key: 'production', label: 'Production', icon: Package }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">Tech Pack Name</label>
          <input
            type="text"
            value={techPack.name}
            onChange={(e) => handleInputChange('root', 'name', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
            placeholder="Enter tech pack name..."
          />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Season</label>
          <select
            value={techPack.season}
            onChange={(e) => handleInputChange('root', 'season', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="Spring/Summer 2024" className="bg-gray-800">Spring/Summer 2024</option>
            <option value="Fall/Winter 2024" className="bg-gray-800">Fall/Winter 2024</option>
            <option value="Resort 2024" className="bg-gray-800">Resort 2024</option>
            <option value="Pre-Fall 2024" className="bg-gray-800">Pre-Fall 2024</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Category</label>
          <select
            value={techPack.category}
            onChange={(e) => handleInputChange('root', 'category', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="Womenswear" className="bg-gray-800">Womenswear</option>
            <option value="Menswear" className="bg-gray-800">Menswear</option>
            <option value="Childrenswear" className="bg-gray-800">Childrenswear</option>
            <option value="Accessories" className="bg-gray-800">Accessories</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Product Type</label>
          <input
            type="text"
            value={techPack.productType}
            onChange={(e) => handleInputChange('root', 'productType', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
            placeholder="e.g., Dress, Shirt, Pants..."
          />
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Description</label>
        <textarea
          value={techPack.description}
          onChange={(e) => handleInputChange('root', 'description', e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500 h-32"
          placeholder="Describe the garment design, inspiration, and key features..."
        />
      </div>
    </div>
  );

  const renderMeasurementsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Size Chart</h3>
        <button
          onClick={addMeasurementPoint}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Measurement</span>
        </button>
      </div>

      <div className="glass-effect rounded-xl p-6 overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-3 px-2">Measurement Point</th>
              {techPack.measurements.sizeRange.map(size => (
                <th key={size} className="text-center py-3 px-2">{size}</th>
              ))}
              <th className="text-center py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {techPack.measurements.measurementPoints.map((point, index) => (
              <tr key={index} className="border-b border-white/10">
                <td className="py-3 px-2">
                  <input
                    type="text"
                    value={point.name}
                    onChange={(e) => {
                      const newPoints = [...techPack.measurements.measurementPoints];
                      newPoints[index].name = e.target.value;
                      setTechPack(prev => ({
                        ...prev,
                        measurements: { ...prev.measurements, measurementPoints: newPoints }
                      }));
                    }}
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="Measurement name"
                  />
                </td>
                {techPack.measurements.sizeRange.map(size => (
                  <td key={size} className="py-3 px-2">
                    <input
                      type="text"
                      value={point[size.toLowerCase()]}
                      onChange={(e) => {
                        const newPoints = [...techPack.measurements.measurementPoints];
                        newPoints[index][size.toLowerCase()] = e.target.value;
                        setTechPack(prev => ({
                          ...prev,
                          measurements: { ...prev.measurements, measurementPoints: newPoints }
                        }));
                      }}
                      className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm text-center"
                      placeholder="0"
                    />
                  </td>
                ))}
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => {
                      const newPoints = techPack.measurements.measurementPoints.filter((_, i) => i !== index);
                      setTechPack(prev => ({
                        ...prev,
                        measurements: { ...prev.measurements, measurementPoints: newPoints }
                      }));
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMaterialsTab = () => (
    <div className="space-y-8">
      {/* Main Fabric */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Main Fabric</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={techPack.materials.mainFabric.name}
            onChange={(e) => handleInputChange('materials', 'mainFabric', { ...techPack.materials.mainFabric, name: e.target.value })}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
            placeholder="Fabric name"
          />
          <input
            type="text"
            value={techPack.materials.mainFabric.composition}
            onChange={(e) => handleInputChange('materials', 'mainFabric', { ...techPack.materials.mainFabric, composition: e.target.value })}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
            placeholder="Composition (e.g., 100% Cotton)"
          />
          <input
            type="text"
            value={techPack.materials.mainFabric.weight}
            onChange={(e) => handleInputChange('materials', 'mainFabric', { ...techPack.materials.mainFabric, weight: e.target.value })}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
            placeholder="Weight (e.g., 180gsm)"
          />
          <input
            type="text"
            value={techPack.materials.mainFabric.supplier}
            onChange={(e) => handleInputChange('materials', 'mainFabric', { ...techPack.materials.mainFabric, supplier: e.target.value })}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
            placeholder="Supplier"
          />
        </div>
      </div>

      {/* Trims */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Trims & Hardware</h3>
          <button
            onClick={addTrim}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trim</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {techPack.materials.trims.map((trim, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
              <input
                type="text"
                value={trim.name}
                onChange={(e) => {
                  const newTrims = [...techPack.materials.trims];
                  newTrims[index].name = e.target.value;
                  setTechPack(prev => ({
                    ...prev,
                    materials: { ...prev.materials, trims: newTrims }
                  }));
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                placeholder="Trim name"
              />
              <input
                type="text"
                value={trim.type}
                onChange={(e) => {
                  const newTrims = [...techPack.materials.trims];
                  newTrims[index].type = e.target.value;
                  setTechPack(prev => ({
                    ...prev,
                    materials: { ...prev.materials, trims: newTrims }
                  }));
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                placeholder="Type"
              />
              <input
                type="text"
                value={trim.color}
                onChange={(e) => {
                  const newTrims = [...techPack.materials.trims];
                  newTrims[index].color = e.target.value;
                  setTechPack(prev => ({
                    ...prev,
                    materials: { ...prev.materials, trims: newTrims }
                  }));
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                placeholder="Color"
              />
              <button
                onClick={() => {
                  const newTrims = techPack.materials.trims.filter((_, i) => i !== index);
                  setTechPack(prev => ({
                    ...prev,
                    materials: { ...prev.materials, trims: newTrims }
                  }));
                }}
                className="flex items-center justify-center px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Color Palette</h3>
        <button
          onClick={addColor}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Color</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techPack.colors.map((color, index) => (
          <div key={index} className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white/20"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) => {
                      const newColors = [...techPack.colors];
                      newColors[index].name = e.target.value;
                      setTechPack(prev => ({ ...prev, colors: newColors }));
                    }}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                    placeholder="Color name"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const newColors = techPack.colors.filter((_, i) => i !== index);
                  setTechPack(prev => ({ ...prev, colors: newColors }));
                }}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-white/70 text-sm mb-1">Hex Code</label>
                <input
                  type="color"
                  value={color.hex}
                  onChange={(e) => {
                    const newColors = [...techPack.colors];
                    newColors[index].hex = e.target.value;
                    setTechPack(prev => ({ ...prev, colors: newColors }));
                  }}
                  className="w-full h-10 rounded-lg border border-white/20"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-1">Pantone Code</label>
                <input
                  type="text"
                  value={color.pantone}
                  onChange={(e) => {
                    const newColors = [...techPack.colors];
                    newColors[index].pantone = e.target.value;
                    setTechPack(prev => ({ ...prev, colors: newColors }));
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="e.g., 18-1664 TPX"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderImagesTab = () => (
    <div className="space-y-8">
      {/* Technical Sketches */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Technical Sketches</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['frontSketch', 'backSketch', 'sideSketch'].map((sketchType) => (
            <div key={sketchType} className="text-center">
              <div
                className="w-full h-64 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
                onClick={() => handleImageUpload('images', sketchType)}
              >
                {techPack.images[sketchType] ? (
                  <img
                    src={techPack.images[sketchType]}
                    alt={sketchType}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <Image className="w-12 h-12 text-white/60 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">
                      {sketchType.replace('Sketch', '').charAt(0).toUpperCase() + sketchType.replace('Sketch', '').slice(1)} View
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspiration Images */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Inspiration & Reference</h3>
        <div
          className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
          onClick={() => handleImageUpload('images', 'inspirationImages')}
        >
          <div className="text-center">
            <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
            <p className="text-white/60 text-sm">Upload inspiration images</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverviewTab();
      case 'measurements': return renderMeasurementsTab();
      case 'materials': return renderMaterialsTab();
      case 'colors': return renderColorsTab();
      case 'images': return renderImagesTab();
      default: return (
        <div className="text-center text-white/60 py-12">
          <div className="text-4xl mb-4">🚧</div>
          <p>This section is under development</p>
        </div>
      );
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-white">{techPack.name}</h1>
                <p className="text-white/70">Version {techPack.version} • {techPack.date}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                  isPreviewMode ? 'bg-purple-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Eye className="w-5 h-5" />
                <span>Preview</span>
              </button>
              
              <button
                onClick={exportTechPack}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Export PDF</span>
              </button>
              
              <button
                onClick={shareTechPack}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
              
              <button
                onClick={saveTechPack}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
              >
                <Save className="w-5 h-5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(Object.keys(tabs).indexOf(activeTab) + 1) / tabs.length * 100}%` }}
              />
            </div>
            <span className="text-white/70 text-sm">
              {Object.keys(tabs).indexOf(activeTab) + 1} of {tabs.length}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div className="glass-effect rounded-xl p-2">
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-purple-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="hidden lg:block">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="glass-effect rounded-2xl p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default TechPackCreator; 