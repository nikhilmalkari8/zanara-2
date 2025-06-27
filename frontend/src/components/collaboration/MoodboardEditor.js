import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, Palette, Type, Move, RotateCw, Trash2, Save, 
  Download, Share2, Grid, Maximize, Eye, EyeOff, 
  Plus, Minus, Copy, Layers, Image as ImageIcon
} from 'lucide-react';

const MoodboardEditor = ({ project, user, onSave, onClose }) => {
  const [moodboard, setMoodboard] = useState(project?.moodboard || {
    layout: 'freeform',
    backgroundColor: '#ffffff',
    images: [],
    textElements: [],
    colorPalette: []
  });
  
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState('select'); // select, image, text, color
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          url: e.target.result,
          caption: '',
          position: { x: 100, y: 100, width: 200, height: 200 },
          rotation: 0,
          zIndex: moodboard.images.length + 1,
          uploadedBy: user.id,
          uploadedAt: new Date(),
          tags: [],
          source: 'upload'
        };
        
        setMoodboard(prev => ({
          ...prev,
          images: [...prev.images, newImage]
        }));
      };
      reader.readAsDataURL(file);
    });
  }, [moodboard.images.length, user.id]);

  // Handle element selection
  const handleElementClick = useCallback((element, type) => {
    setSelectedElement({ ...element, type });
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e, element) => {
    setIsDragging(true);
    setSelectedElement(element);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - element.position.x * zoom;
    const offsetY = e.clientY - rect.top - element.position.y * zoom;
    setDragOffset({ x: offsetX, y: offsetY });
  }, [zoom]);

  // Handle drag move
  const handleDragMove = useCallback((e) => {
    if (!isDragging || !selectedElement) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - dragOffset.x) / zoom;
    const y = (e.clientY - rect.top - dragOffset.y) / zoom;
    
    if (selectedElement.type === 'image') {
      setMoodboard(prev => ({
        ...prev,
        images: prev.images.map(img => 
          img.id === selectedElement.id 
            ? { ...img, position: { ...img.position, x, y } }
            : img
        )
      }));
    } else if (selectedElement.type === 'text') {
      setMoodboard(prev => ({
        ...prev,
        textElements: prev.textElements.map(text => 
          text.id === selectedElement.id 
            ? { ...text, position: { x, y } }
            : text
        )
      }));
    }
  }, [isDragging, selectedElement, dragOffset, zoom]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Add text element
  const addTextElement = useCallback(() => {
    const newText = {
      id: Date.now() + Math.random(),
      content: 'Double click to edit',
      position: { x: 150, y: 150 },
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      rotation: 0,
      zIndex: moodboard.textElements.length + 1
    };
    
    setMoodboard(prev => ({
      ...prev,
      textElements: [...prev.textElements, newText]
    }));
    setSelectedElement({ ...newText, type: 'text' });
  }, [moodboard.textElements.length]);

  // Add color to palette
  const addColorToPalette = useCallback((color) => {
    const newColor = {
      id: Date.now() + Math.random(),
      color,
      name: `Color ${moodboard.colorPalette.length + 1}`,
      pantone: '',
      usage: 'primary'
    };
    
    setMoodboard(prev => ({
      ...prev,
      colorPalette: [...prev.colorPalette, newColor]
    }));
  }, [moodboard.colorPalette.length]);

  // Delete selected element
  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement) return;
    
    if (selectedElement.type === 'image') {
      setMoodboard(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== selectedElement.id)
      }));
    } else if (selectedElement.type === 'text') {
      setMoodboard(prev => ({
        ...prev,
        textElements: prev.textElements.filter(text => text.id !== selectedElement.id)
      }));
    }
    
    setSelectedElement(null);
  }, [selectedElement]);

  // Update element properties
  const updateElementProperty = useCallback((property, value) => {
    if (!selectedElement) return;
    
    if (selectedElement.type === 'image') {
      setMoodboard(prev => ({
        ...prev,
        images: prev.images.map(img => 
          img.id === selectedElement.id 
            ? { ...img, [property]: value }
            : img
        )
      }));
    } else if (selectedElement.type === 'text') {
      setMoodboard(prev => ({
        ...prev,
        textElements: prev.textElements.map(text => 
          text.id === selectedElement.id 
            ? { ...text, [property]: value }
            : text
        )
      }));
    }
    
    setSelectedElement(prev => ({ ...prev, [property]: value }));
  }, [selectedElement]);

  // Save moodboard
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/collaboration/${project._id}/moodboard`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(moodboard)
      });

      if (response.ok) {
        onSave && onSave(moodboard);
      }
    } catch (error) {
      console.error('Error saving moodboard:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex">
      {/* Toolbar */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Moodboard Editor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tools */}
        <div className="space-y-6">
          {/* Tool Selection */}
          <div>
            <h3 className="text-white font-medium mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'select', icon: Move, label: 'Select' },
                { key: 'image', icon: ImageIcon, label: 'Image' },
                { key: 'text', icon: Type, label: 'Text' },
                { key: 'color', icon: Palette, label: 'Color' }
              ].map(toolOption => {
                const IconComponent = toolOption.icon;
                return (
                  <button
                    key={toolOption.key}
                    onClick={() => setTool(toolOption.key)}
                    className={`p-3 rounded-lg border transition-all ${
                      tool === toolOption.key
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs">{toolOption.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h3 className="text-white font-medium mb-3">Add Images</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-purple-500 hover:text-purple-300 transition-colors"
            >
              <Upload className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm">Upload Images</div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Text Controls */}
          <div>
            <h3 className="text-white font-medium mb-3">Text</h3>
            <button
              onClick={addTextElement}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Type className="w-5 h-5 inline mr-2" />
              Add Text
            </button>
          </div>

          {/* Color Palette */}
          <div>
            <h3 className="text-white font-medium mb-3">Color Palette</h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {moodboard.colorPalette.map((colorItem, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg border-2 border-gray-600 cursor-pointer hover:border-purple-500 transition-colors"
                  style={{ backgroundColor: colorItem.color }}
                  title={colorItem.name}
                  onClick={() => updateElementProperty('color', colorItem.color)}
                />
              ))}
            </div>
            <input
              type="color"
              onChange={(e) => addColorToPalette(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-600 bg-gray-800"
            />
          </div>

          {/* Element Properties */}
          {selectedElement && (
            <div>
              <h3 className="text-white font-medium mb-3">Properties</h3>
              <div className="space-y-3">
                {selectedElement.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Text</label>
                      <input
                        type="text"
                        value={selectedElement.content}
                        onChange={(e) => updateElementProperty('content', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Font Size</label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={selectedElement.fontSize}
                        onChange={(e) => updateElementProperty('fontSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-white text-sm">{selectedElement.fontSize}px</div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedElement.color}
                        onChange={(e) => updateElementProperty('color', e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-600"
                      />
                    </div>
                  </>
                )}
                
                {selectedElement.type === 'image' && (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Caption</label>
                      <input
                        type="text"
                        value={selectedElement.caption}
                        onChange={(e) => updateElementProperty('caption', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                        placeholder="Add image caption..."
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Width</label>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        value={selectedElement.position.width}
                        onChange={(e) => updateElementProperty('position', {
                          ...selectedElement.position,
                          width: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                      <div className="text-white text-sm">{selectedElement.position.width}px</div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Rotation</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedElement.rotation || 0}
                    onChange={(e) => updateElementProperty('rotation', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-white text-sm">{selectedElement.rotation || 0}°</div>
                </div>

                <button
                  onClick={deleteSelectedElement}
                  className="w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete Element
                </button>
              </div>
            </div>
          )}

          {/* Canvas Controls */}
          <div>
            <h3 className="text-white font-medium mb-3">Canvas</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Background</label>
                <input
                  type="color"
                  value={moodboard.backgroundColor}
                  onChange={(e) => setMoodboard(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-gray-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Show Grid</span>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-lg transition-colors ${
                    showGrid ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Zoom</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                    className="p-1 bg-gray-700 text-white rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white text-sm flex-1 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                    className="p-1 bg-gray-700 text-white rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleSave}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-5 h-5 inline mr-2" />
              Save Moodboard
            </button>
            <button
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5 inline mr-2" />
              Export
            </button>
            <button
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5 inline mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative cursor-crosshair"
          style={{ 
            backgroundColor: moodboard.backgroundColor,
            backgroundImage: showGrid ? 
              'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)' : 'none',
            backgroundSize: showGrid ? '20px 20px' : 'auto'
          }}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {/* Images */}
          {moodboard.images.map((image) => (
            <div
              key={image.id}
              className={`absolute cursor-move border-2 ${
                selectedElement?.id === image.id ? 'border-purple-500' : 'border-transparent'
              } hover:border-purple-300 transition-colors`}
              style={{
                left: image.position.x * zoom,
                top: image.position.y * zoom,
                width: image.position.width * zoom,
                height: image.position.height * zoom,
                transform: `rotate(${image.rotation}deg)`,
                zIndex: image.zIndex
              }}
              onMouseDown={(e) => handleDragStart(e, { ...image, type: 'image' })}
              onClick={() => handleElementClick(image, 'image')}
            >
              <img
                src={image.url}
                alt={image.caption}
                className="w-full h-full object-cover rounded-lg"
                draggable={false}
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg">
                  {image.caption}
                </div>
              )}
            </div>
          ))}

          {/* Text Elements */}
          {moodboard.textElements.map((text) => (
            <div
              key={text.id}
              className={`absolute cursor-move border-2 ${
                selectedElement?.id === text.id ? 'border-purple-500' : 'border-transparent'
              } hover:border-purple-300 transition-colors`}
              style={{
                left: text.position.x * zoom,
                top: text.position.y * zoom,
                fontSize: text.fontSize * zoom,
                fontFamily: text.fontFamily,
                color: text.color,
                transform: `rotate(${text.rotation}deg)`,
                zIndex: text.zIndex
              }}
              onMouseDown={(e) => handleDragStart(e, { ...text, type: 'text' })}
              onClick={() => handleElementClick(text, 'text')}
            >
              {text.content}
            </div>
          ))}

          {/* Selection indicator */}
          {selectedElement && (
            <div
              className="absolute border-2 border-purple-500 pointer-events-none"
              style={{
                left: (selectedElement.position?.x || 0) * zoom - 2,
                top: (selectedElement.position?.y || 0) * zoom - 2,
                width: (selectedElement.position?.width || 100) * zoom + 4,
                height: (selectedElement.position?.height || 30) * zoom + 4,
                zIndex: 9999
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodboardEditor; 