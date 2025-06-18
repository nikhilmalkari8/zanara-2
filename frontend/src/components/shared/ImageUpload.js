// src/components/shared/ImageUpload.js
import React, { useState } from 'react';
import { Button } from './UIComponents';

// Single image upload with preview
export const ImageUploader = ({ 
  onImageSelect, 
  previewUrl = null,
  buttonText = 'Upload Image',
  accept = 'image/*'
}) => {
  const [preview, setPreview] = useState(previewUrl);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Call the callback with the file
    onImageSelect(file);
  };
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
    },
    preview: {
      width: '100%',
      maxWidth: '300px',
      height: 'auto',
      borderRadius: '8px',
      objectFit: 'cover',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    input: {
      display: 'none',
    },
    noPreview: {
      width: '150px',
      height: '150px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: '#ddd',
      fontSize: '48px',
    },
  };
  
  return (
    <div style={styles.container}>
      {preview ? (
        <img src={preview} alt="Preview" style={styles.preview} />
      ) : (
        <div style={styles.noPreview}>🖼️</div>
      )}
      
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={styles.input}
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button type="secondary" style={{ cursor: 'pointer' }}>
          {buttonText}
        </Button>
      </label>
    </div>
  );
};

// Multiple image uploader with previews and grid display
export const MultiImageUploader = ({
  onImagesSelect,
  existingImages = [],
  maxImages = 10,
  buttonText = 'Add Images',
  accept = 'image/*'
}) => {
  const [previews, setPreviews] = useState(existingImages);
  
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Check max images limit
    if (previews.length + files.length > maxImages) {
      alert(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }
    
    // Create preview URLs for all files
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        // If all files have been processed, update state
        if (newPreviews.length === files.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Call the callback with the files
    onImagesSelect(files);
  };
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '15px',
    },
    preview: {
      width: '100%',
      aspectRatio: '1',
      borderRadius: '8px',
      objectFit: 'cover',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    input: {
      display: 'none',
    },
    uploadBox: {
      width: '100%',
      aspectRatio: '1',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px dashed rgba(255, 255, 255, 0.3)',
      color: '#ddd',
      cursor: 'pointer',
      padding: '20px',
      textAlign: 'center',
    },
    uploadIcon: {
      fontSize: '32px',
      marginBottom: '10px',
    },
    counter: {
      marginTop: '10px',
      color: '#ddd',
      fontSize: '14px',
    },
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {previews.map((preview, index) => (
          <img 
            key={index} 
            src={preview} 
            alt={`Preview ${index}`} 
            style={styles.preview}
          />
        ))}
        
        {previews.length < maxImages && (
          <label htmlFor="multi-image-upload" style={styles.uploadBox}>
            <div style={styles.uploadIcon}>📷</div>
            <div>{buttonText}</div>
          </label>
        )}
      </div>
      
      <input
        type="file"
        accept={accept}
        onChange={handleFilesChange}
        style={styles.input}
        id="multi-image-upload"
        multiple
      />
      
      <div style={styles.counter}>
        {previews.length} of {maxImages} images
      </div>
    </div>
  );
};

export default {
  ImageUploader,
  MultiImageUploader
};