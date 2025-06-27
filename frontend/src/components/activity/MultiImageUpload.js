import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, X, RotateCw, Crop, Maximize2, Grid, 
  Image as ImageIcon, Play, Download, Edit3, 
  ArrowLeft, ArrowRight, ZoomIn, ZoomOut, 
  MoreHorizontal, Filter, Palette, Sliders
} from 'lucide-react';

const MultiImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 10, 
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  showPreview = true,
  allowCropping = true,
  allowReordering = true,
  layoutOptions = true
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropData, setCropData] = useState(null);
  const [layout, setLayout] = useState('grid'); // grid, carousel, collage, single
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [imageFilters, setImageFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0
  });
  
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  // Layout options
  const layoutOptions_list = [
    { id: 'grid', name: 'Grid', icon: Grid },
    { id: 'carousel', name: 'Carousel', icon: ArrowRight },
    { id: 'collage', name: 'Collage', icon: Maximize2 },
    { id: 'single', name: 'Single', icon: ImageIcon }
  ];

  // Handle file selection
  const handleFiles = useCallback(async (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported`);
        return false;
      }
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Max size is ${maxFileSize / 1024 / 1024}MB`);
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Process files
    const processedImages = await Promise.all(
      validFiles.map(async (file, index) => {
        const id = Date.now() + index;
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        
        // Get image dimensions
        const dimensions = await getImageDimensions(file);
        
        return {
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl,
          dimensions,
          filters: { ...imageFilters },
          caption: '',
          alt: '',
          tags: []
        };
      })
    );

    onImagesChange([...images, ...processedImages]);
  }, [images, onImagesChange, maxImages, maxFileSize, acceptedTypes, imageFilters]);

  // Get image dimensions
  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Remove image
  const removeImage = (id) => {
    const updatedImages = images.filter(img => img.id !== id);
    onImagesChange(updatedImages);
  };

  // Reorder images
  const moveImage = (dragIndex, dropIndex) => {
    if (!allowReordering) return;
    
    const draggedImage = images[dragIndex];
    const newImages = [...images];
    newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    onImagesChange(newImages);
  };

  // Update image data
  const updateImage = (id, updates) => {
    const updatedImages = images.map(img => 
      img.id === id ? { ...img, ...updates } : img
    );
    onImagesChange(updatedImages);
  };

  // Image editing functions
  const openImageEditor = (image) => {
    setEditingImage(image);
    setImageFilters(image.filters || { brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0, grayscale: 0 });
    setShowImageEditor(true);
  };

  const applyFilters = () => {
    if (editingImage) {
      updateImage(editingImage.id, { filters: imageFilters });
      setShowImageEditor(false);
      setEditingImage(null);
    }
  };

  const resetFilters = () => {
    setImageFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0
    });
  };

  // Generate filter CSS
  const getFilterStyle = (filters) => {
    if (!filters) return {};
    
    const filterString = [
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `blur(${filters.blur}px)`,
      `sepia(${filters.sepia}%)`,
      `grayscale(${filters.grayscale}%)`
    ].join(' ');
    
    return { filter: filterString };
  };

  // Render upload area
  const renderUploadArea = () => (
    <div
      ref={dragRef}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragActive 
          ? 'border-blue-500 bg-blue-50' 
          : images.length === 0 
            ? 'border-gray-300 hover:border-gray-400' 
            : 'border-gray-200'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {images.length === 0 ? 'Upload Images' : 'Add More Images'}
          </h3>
          <p className="text-gray-500 mb-4">
            Drag and drop images here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              browse files
            </button>
          </p>
          <p className="text-sm text-gray-400">
            Supports: {acceptedTypes.map(type => type.split('/')[1]).join(', ')} • 
            Max {maxFileSize / 1024 / 1024}MB per file • 
            Up to {maxImages} images
          </p>
        </div>
      </div>
      
      {images.length < maxImages && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-4 right-4 p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Upload className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );

  // Render image item
  const renderImageItem = (image, index) => (
    <div key={image.id} className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square">
        <img
          src={image.previewUrl}
          alt={image.alt || image.name}
          className="w-full h-full object-cover"
          style={getFilterStyle(image.filters)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => openImageEditor(image)}
              className="p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              title="Edit Image"
            >
              <Edit3 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => removeImage(image.id)}
              className="p-1.5 bg-white rounded-full shadow-lg hover:bg-red-100 transition-colors"
              title="Remove Image"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
          
          {/* Image info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-white text-sm">
              <div className="font-medium truncate">{image.name}</div>
              <div className="text-xs text-gray-300">
                {image.dimensions?.width} × {image.dimensions?.height} • 
                {(image.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Caption input */}
      <div className="p-3 border-t border-gray-100">
        <input
          type="text"
          placeholder="Add caption..."
          value={image.caption || ''}
          onChange={(e) => updateImage(image.id, { caption: e.target.value })}
          className="w-full text-sm border-none outline-none bg-transparent placeholder-gray-400"
        />
      </div>
    </div>
  );

  // Render layout selector
  const renderLayoutSelector = () => (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Layout:</span>
      {layoutOptions_list.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            onClick={() => setLayout(option.id)}
            className={`p-2 rounded-lg transition-colors ${
              layout === option.id 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={option.name}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );

  // Render images based on layout
  const renderImagesByLayout = () => {
    if (images.length === 0) return null;

    switch (layout) {
      case 'grid':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => renderImageItem(image, index))}
          </div>
        );
      
      case 'carousel':
        return (
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {images.map((image, index) => (
                <div key={image.id} className="flex-shrink-0 w-64">
                  {renderImageItem(image, index)}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'collage':
        return (
          <div className="grid grid-cols-12 gap-2 auto-rows-fr">
            {images.map((image, index) => {
              // Dynamic sizing for collage effect
              const spans = index === 0 ? 'col-span-8 row-span-2' : 
                           index === 1 ? 'col-span-4' :
                           index === 2 ? 'col-span-4' :
                           'col-span-3';
              
              return (
                <div key={image.id} className={`${spans} min-h-32`}>
                  {renderImageItem(image, index)}
                </div>
              );
            })}
          </div>
        );
      
      case 'single':
        return (
          <div className="space-y-4">
            {images.map((image, index) => (
              <div key={image.id} className="max-w-2xl mx-auto">
                {renderImageItem(image, index)}
              </div>
            ))}
          </div>
        );
      
      default:
        return renderImagesByLayout();
    }
  };

  // Image Editor Modal
  const renderImageEditor = () => {
    if (!showImageEditor || !editingImage) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-full overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Edit Image</h3>
            <button
              onClick={() => setShowImageEditor(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex">
            {/* Image Preview */}
            <div className="flex-1 p-6 bg-gray-50">
              <div className="relative max-w-lg mx-auto">
                <img
                  src={editingImage.previewUrl}
                  alt={editingImage.name}
                  className="w-full rounded-lg"
                  style={getFilterStyle(imageFilters)}
                />
              </div>
            </div>
            
            {/* Controls */}
            <div className="w-80 p-6 border-l border-gray-200 bg-white">
              <h4 className="font-medium mb-4">Filters</h4>
              
              <div className="space-y-4">
                {Object.entries(imageFilters).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key}: {value}{key === 'brightness' || key === 'contrast' || key === 'saturation' ? '%' : key === 'blur' ? 'px' : '%'}
                    </label>
                    <input
                      type="range"
                      min={key === 'blur' ? 0 : key === 'brightness' || key === 'contrast' || key === 'saturation' ? 0 : 0}
                      max={key === 'blur' ? 10 : key === 'brightness' || key === 'contrast' || key === 'saturation' ? 200 : 100}
                      value={value}
                      onChange={(e) => setImageFilters(prev => ({
                        ...prev,
                        [key]: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {renderUploadArea()}
      
      {/* Layout Options */}
      {layoutOptions && images.length > 0 && renderLayoutSelector()}
      
      {/* Images Display */}
      {showPreview && images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {images.length} {images.length === 1 ? 'Image' : 'Images'} Selected
            </h3>
            {images.length > 1 && (
              <div className="text-sm text-gray-500">
                {allowReordering && 'Drag to reorder • '}
                Click to edit
              </div>
            )}
          </div>
          
          {renderImagesByLayout()}
        </div>
      )}
      
      {/* Image Editor Modal */}
      {renderImageEditor()}
    </div>
  );
};

export default MultiImageUpload; 