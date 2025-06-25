import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Eye, Heart, MessageCircle, Share2, Edit3, Upload, X, ChevronLeft, ChevronRight,
  MapPin, Calendar, Star, Award, Crown, Diamond, Zap, Globe, Instagram, Youtube, Music,
  Phone, Mail, ExternalLink, Plus, Minus, Check, Clock, DollarSign, Users, TrendingUp
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ModelProfile = ({ profileId, user, targetUser, profileData, onBack, onConnect, onMessage }) => {
  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [portfolioFilter, setPortfolioFilter] = useState('all'); // 'all', 'photos', 'videos'
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cropModal, setCropModal] = useState({ open: false, image: null, type: null });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  // Add state for upload progress
  const [uploadProgress, setUploadProgress] = useState(0);

  // Refs for animations
  const cursorRef = useRef(null);
  const bgAnimationRef = useRef(null);
  const heroRef = useRef(null);
  const particleCountRef = useRef(0);

  // Check if viewing own profile
  const isOwnProfile = user && (
    user._id === targetUser?._id || 
    user.id === targetUser?.id ||
    user._id === profileId ||
    user.id === profileId
  );

  // Helper functions to handle different portfolio media types
  const getPortfolioPhotos = () => {
    return ensureArray(profile?.photos || profile?.portfolioPhotos);
  };

  const getPortfolioVideos = () => {
    return ensureArray(profile?.videos || profile?.portfolioVideos);
  };

  const getFilteredPortfolio = () => {
    const photos = getPortfolioPhotos().map(item => ({ type: 'photo', url: item, id: `photo-${Date.now()}-${Math.random()}` }));
    const videos = getPortfolioVideos().map(item => ({ type: 'video', url: item, id: `video-${Date.now()}-${Math.random()}` }));
    
    let combined = [];
    if (portfolioFilter === 'all') {
      combined = [...photos, ...videos];
    } else if (portfolioFilter === 'photos') {
      combined = photos;
    } else if (portfolioFilter === 'videos') {
      combined = videos;
    }
    
    return showAllPhotos ? combined : combined.slice(0, 12);
  };

  // Helper functions to handle schema mismatches
  const ensureArray = (value) => {
    if (Array.isArray(value)) return value;
    return [];
  };

  const ensureExperienceArray = (experience) => {
    if (Array.isArray(experience)) return experience;
    if (typeof experience === 'string' && experience.trim()) {
      return [{
        role: 'Experience',
        company: '',
        duration: '',
        description: experience,
        current: false
      }];
    }
    return [];
  };

  // Animation effects
  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      setMousePosition({ x, y });
      
      if (cursorRef.current && window.innerWidth >= 768) {
        cursorRef.current.style.transform = `translate3d(${x - 10}px, ${y - 10}px, 0)`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Premium particle system
  useEffect(() => {
    if (!bgAnimationRef.current) return;
    
    const maxParticles = 12;
    let animationFrame;

    const createParticle = () => {
      if (particleCountRef.current >= maxParticles) return;
      
      const particle = document.createElement('div');
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.2 + 0.05;
      const duration = Math.random() * 25 + 15;
      const hue = Math.random() > 0.7 ? '#d4af37' : '#ffffff';
      
      particle.className = 'absolute rounded-full pointer-events-none will-change-transform';
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${hue};
        left: ${Math.random() * 100}%;
        top: 100%;
        opacity: ${opacity};
        animation: float-up-luxury ${duration}s linear infinite;
        box-shadow: 0 0 10px ${hue}40;
      `;

      bgAnimationRef.current.appendChild(particle);
      particleCountRef.current++;

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
          particleCountRef.current = Math.max(0, particleCountRef.current - 1);
        }
      }, duration * 1000);
    };

    const interval = setInterval(createParticle, 2500);
    
    for (let i = 0; i < 3; i++) {
      setTimeout(createParticle, i * 1000);
    }

    return () => clearInterval(interval);
  }, []);

  // Fetch real profile data
  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setEditData(profileData);
      setLoading(false);
    } else if (profileId || targetUser) {
      fetchModelProfile();
    }
  }, [profileData, profileId, targetUser]);

  // Check connection status when profile loads
  useEffect(() => {
    if (!isOwnProfile && profileId && profile) {
      checkConnectionStatus();
    }
  }, [profileId, profile, isOwnProfile]);

  const fetchModelProfile = async () => {
    try {
      setLoading(true);
      
      // Try to get the profile via API call
      const response = await fetch(`/api/professional-profile/${profileId || targetUser._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditData(data);
      } else {
        throw new Error('Profile not found');
      }
      
      setError(null);
    } catch (error) {
      console.error('Error loading model profile:', error);
      setError('Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Check connection status with real API call
  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`/api/connections/status/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.status || 'none');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  // Handle save changes with real API call
  const handleSaveChanges = async () => {
    try {
      setUploading(true);
      setLoading(true);
      const response = await fetch(`/api/professional-profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      });
      if (response.ok) {
        await fetchModelProfile();
        setIsEditing(false);
        showNotification('Profile updated successfully!', 'success');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to update profile', 'error');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  // Handle portfolio upload with real API call
  const handlePortfolioUpload = async (files, mediaType = 'photo') => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append(mediaType === 'photo' ? 'portfolioPhotos' : 'portfolioVideos', file);
      });

      // Use XMLHttpRequest for progress
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `/api/professional-profile/${mediaType === 'photo' ? 'photos' : 'videos'}`);
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            const updatedMedia = mediaType === 'photo' 
              ? [...getPortfolioPhotos(), ...data.photos]
              : [...getPortfolioVideos(), ...data.videos];
            const fieldName = mediaType === 'photo' ? 'photos' : 'videos';
            setProfile({ ...profile, [fieldName]: updatedMedia });
            setEditData({ ...editData, [fieldName]: updatedMedia });
            showNotification(`${files.length} ${mediaType}(s) uploaded successfully!`, 'success');
            resolve();
          } else {
            showNotification(`Failed to upload ${mediaType}s`, 'error');
            reject();
          }
        };
        xhr.onerror = () => {
          showNotification(`Failed to upload ${mediaType}s`, 'error');
          reject();
        };
        xhr.send(formData);
      });
    } catch (error) {
      showNotification(`Failed to upload ${mediaType}s`, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle connect with real API call
  const handleConnect = async () => {
    if (connectionStatus !== 'none') return;
    
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receiverId: profileId,
          message: `I'd like to connect with you on Zanara.`,
          receiverType: profile?.professionalType || 'model'
        })
      });

      if (response.ok) {
        setConnectionStatus('pending');
        showNotification('Connection request sent!', 'success');
      } else {
        throw new Error('Failed to send connection request');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to send connection request', 'error');
    }
  };

  // Helper function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Experience management functions
  const addExperience = () => {
    const newExperience = {
      role: '',
      company: '',
      duration: '',
      description: '',
      current: false
    };
    const currentExperience = ensureExperienceArray(editData.experience);
    const updatedExperience = [...currentExperience, newExperience];
    setEditData({ ...editData, experience: updatedExperience });
    showNotification('New experience section added', 'success');
  };

  const updateExperience = (index, field, value) => {
    const currentExperience = ensureExperienceArray(editData.experience);
    const updatedExperience = currentExperience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    setEditData({ ...editData, experience: updatedExperience });
  };

  const removeExperience = (index) => {
    const currentExperience = ensureExperienceArray(editData.experience);
    const updatedExperience = currentExperience.filter((_, i) => i !== index);
    setEditData({ ...editData, experience: updatedExperience });
    showNotification('Experience removed', 'success');
  };

  // Handle array input changes
  const handleArrayInputChange = (field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setEditData({ ...editData, [field]: arrayValue });
  };

  // Handle nested input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setEditData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Get connection button text and status
  const getConnectionButton = () => {
    switch (connectionStatus) {
      case 'pending':
        return (
          <button className="luxury-button luxury-button-secondary" disabled>
            <Clock className="w-4 h-4 mr-2" />
            Request Sent
          </button>
        );
      case 'connected':
        return (
          <button className="luxury-button luxury-button-connected" disabled>
            <Check className="w-4 h-4 mr-2" />
            Connected
          </button>
        );
      default:
        return (
          <button className="luxury-button luxury-button-primary" onClick={handleConnect}>
            <Users className="w-4 h-4 mr-2" />
            Connect
          </button>
        );
    }
  };

  // Get the current profile data (edited or original)
  const currentProfile = isEditing ? editData : profile;
  const displayPortfolio = getFilteredPortfolio();

  // Add after handlePortfolioUpload
  const handleProfilePictureUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await fetch('/api/professional-profile/picture', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.profilePicture) {
        setProfile(prev => ({ ...prev, profilePicture: data.profilePicture }));
        setEditData(prev => ({ ...prev, profilePicture: data.profilePicture }));
        showNotification('Profile picture updated!', 'success');
      } else {
        showNotification(data.message || 'Failed to update profile picture', 'error');
      }
    } catch (error) {
      showNotification('Failed to update profile picture', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCoverPhotoUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('coverPhoto', file);
      const response = await fetch('/api/professional-profile/cover-photo', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.coverPhoto) {
        setProfile(prev => ({ ...prev, coverPhoto: data.coverPhoto }));
        setEditData(prev => ({ ...prev, coverPhoto: data.coverPhoto }));
        showNotification('Cover photo updated!', 'success');
      } else {
        showNotification(data.message || 'Failed to update cover photo', 'error');
      }
    } catch (error) {
      showNotification('Failed to update cover photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Add after handlePortfolioUpload, handleProfilePictureUpload, handleCoverPhotoUpload
  const handleRemovePortfolioItem = async (item) => {
    if (!window.confirm('Are you sure you want to remove this media from your portfolio?')) return;
    try {
      setUploading(true);
      const endpoint = item.type === 'photo' ? '/api/professional-profile/remove-photo' : '/api/professional-profile/remove-video';
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ url: item.url })
      });
      if (response.ok) {
        if (item.type === 'photo') {
          const updatedPhotos = getPortfolioPhotos().filter((url) => url !== item.url);
          setProfile((prev) => ({ ...prev, photos: updatedPhotos }));
          setEditData((prev) => ({ ...prev, photos: updatedPhotos }));
        } else {
          const updatedVideos = getPortfolioVideos().filter((url) => url !== item.url);
          setProfile((prev) => ({ ...prev, videos: updatedVideos }));
          setEditData((prev) => ({ ...prev, videos: updatedVideos }));
        }
        showNotification('Media removed from portfolio', 'success');
      } else {
        showNotification('Failed to remove media', 'error');
      }
    } catch (error) {
      showNotification('Failed to remove media', 'error');
    } finally {
      setUploading(false);
    }
  };

  // In the ModelProfile component, add dropzone logic:
  // For portfolio upload area:
  const onDropPortfolio = (acceptedFiles) => {
    if (portfolioFilter === 'videos') {
      handlePortfolioUpload(acceptedFiles, 'video');
    } else {
      handlePortfolioUpload(acceptedFiles, 'photo');
    }
  };
  const {
    getRootProps: getPortfolioDropzoneProps,
    getInputProps: getPortfolioInputProps,
    isDragActive: isPortfolioDragActive
  } = useDropzone({
    onDrop: onDropPortfolio,
    accept: portfolioFilter === 'videos' ? {'video/*': []} : {'image/*': []},
    multiple: true,
    disabled: !isEditing
  });
  // For profile picture:
  const onDropProfilePic = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) openCropModal(acceptedFiles[0], 'profile');
  };
  const {
    getRootProps: getProfilePicDropzoneProps,
    getInputProps: getProfilePicInputProps,
    isDragActive: isProfilePicDragActive
  } = useDropzone({
    onDrop: onDropProfilePic,
    accept: {'image/*': []},
    multiple: false,
    disabled: !isEditing
  });
  // For cover photo:
  const onDropCoverPhoto = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) openCropModal(acceptedFiles[0], 'cover');
  };
  const {
    getRootProps: getCoverDropzoneProps,
    getInputProps: getCoverInputProps,
    isDragActive: isCoverDragActive
  } = useDropzone({
    onDrop: onDropCoverPhoto,
    accept: {'image/*': []},
    multiple: false,
    disabled: !isEditing
  });

  // Helper to open crop modal
  const openCropModal = (file, type) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropModal({ open: true, image: reader.result, type });
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  // Helper to get cropped image as blob
  const getCroppedImg = async (imageSrc, cropPixels) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (error) => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });
  }

  // On crop complete
  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // On confirm crop
  const handleCropConfirm = async () => {
    if (!cropModal.image || !croppedAreaPixels) return;
    const blob = await getCroppedImg(cropModal.image, croppedAreaPixels);
    const file = new File([blob], `${cropModal.type}-cropped.jpg`, { type: 'image/jpeg' });
    if (cropModal.type === 'profile') {
      handleProfilePictureUpload(file);
    } else if (cropModal.type === 'cover') {
      handleCoverPhotoUpload(file);
    }
    setCropModal({ open: false, image: null, type: null });
  };

  // Helper to calculate profile completion
  const getProfileCompletion = (profile) => {
    const requiredFields = [
      { key: 'profilePicture', label: 'Profile Photo' },
      { key: 'coverPhoto', label: 'Cover Photo' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'headline', label: 'Headline' },
      { key: 'bio', label: 'About/Bio' },
      { key: 'height', label: 'Height' },
      { key: 'bust', label: 'Bust/Chest' },
      { key: 'waist', label: 'Waist' },
      { key: 'hips', label: 'Hips' },
      { key: 'experience', label: 'Experience' },
      { key: 'photos', label: 'Portfolio Photo' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
    ];
    let filled = 0;
    let missing = [];
    requiredFields.forEach(field => {
      if (Array.isArray(profile?.[field.key])) {
        if (profile[field.key].length > 0) filled++;
        else missing.push(field.label);
      } else if (typeof profile?.[field.key] === 'string') {
        if (profile[field.key]?.trim()) filled++;
        else missing.push(field.label);
      } else if (profile?.[field.key]) {
        filled++;
      } else {
        missing.push(field.label);
      }
    });
    const percent = Math.round((filled / requiredFields.length) * 100);
    return { percent, missing };
  };

  // Add handler for reorder
  const handlePortfolioReorder = async (result) => {
    if (!result.destination) return;
    const items = Array.from(displayPortfolio);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    // Update UI immediately
    if (portfolioFilter === 'photos') {
      const newPhotos = items.filter(i => i.type === 'photo').map(i => i.url);
      setProfile(prev => ({ ...prev, photos: newPhotos }));
      setEditData(prev => ({ ...prev, photos: newPhotos }));
    } else if (portfolioFilter === 'videos') {
      const newVideos = items.filter(i => i.type === 'video').map(i => i.url);
      setProfile(prev => ({ ...prev, videos: newVideos }));
      setEditData(prev => ({ ...prev, videos: newVideos }));
    } else {
      const newPhotos = items.filter(i => i.type === 'photo').map(i => i.url);
      const newVideos = items.filter(i => i.type === 'video').map(i => i.url);
      setProfile(prev => ({ ...prev, photos: newPhotos, videos: newVideos }));
      setEditData(prev => ({ ...prev, photos: newPhotos, videos: newVideos }));
    }

    // Persist to backend
    try {
      setUploading(true);
      const response = await fetch('/api/professional-profile/reorder-portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          photos: items.filter(i => i.type === 'photo').map(i => i.url),
          videos: items.filter(i => i.type === 'video').map(i => i.url)
        })
      });
      if (response.ok) {
        showNotification('Portfolio order updated!', 'success');
      } else {
        showNotification('Failed to save new order', 'error');
      }
    } catch (e) {
      showNotification('Failed to save new order', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="luxury-container">
        <div className="luxury-loading">
          <div className="luxury-spinner"></div>
          <div className="luxury-loading-text">
            <div>Loading Profile</div>
            <div className="luxury-loading-subtitle">Preparing premium experience...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="luxury-container">
        <div className="luxury-error">
          <div className="luxury-error-icon">⚠</div>
          <div className="luxury-error-title">Profile Unavailable</div>
          <div className="luxury-error-description">{error}</div>
          <button className="luxury-button luxury-button-primary" onClick={onBack}>
            Return to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Premium Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float-up-luxury {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-10vh) rotate(45deg) scale(1);
          }
          90% {
            opacity: 1;
            transform: translateY(-90vh) rotate(315deg) scale(1);
          }
          100% {
            transform: translateY(-100vh) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes luxury-fade-in {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes luxury-slide-in {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes luxury-scale-in {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .luxury-container {
          min-height: 100vh;
          background: #000000;
          color: #ffffff;
          position: relative;
          overflow-x: hidden;
        }
        
        .luxury-background {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%);
        }
        
        .luxury-background::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 25% 25%, rgba(212, 175, 55, 0.05) 0%, transparent 50%),
                      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.02) 0%, transparent 50%);
        }
        
        .luxury-background::after {
          content: '';
          position: absolute;
          top: 20%;
          left: 10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
        }
        
        .luxury-cursor {
          position: fixed;
          width: 20px;
          height: 20px;
          background: rgba(212, 175, 55, 0.8);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          mix-blend-mode: difference;
          transition: all 0.1s ease;
          transform: translate(-50%, -50%);
        }
        
        .luxury-particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        
        .luxury-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
        }
        
        .luxury-glass-strong {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
        }
        
        .luxury-content {
          position: relative;
          z-index: 10;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .luxury-header {
          animation: luxury-fade-in 1s ease-out;
          margin-bottom: 2rem;
        }
        
        .luxury-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          margin-bottom: 1rem;
        }
        
        .luxury-back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 300;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .luxury-back-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #d4af37;
          transform: translateX(-2px);
        }
        
        .luxury-title {
          font-size: 1.5rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .luxury-actions {
          display: flex;
          gap: 1rem;
        }
        
        .luxury-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 400;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          text-decoration: none;
        }
        
        .luxury-button-primary {
          background: linear-gradient(135deg, #d4af37 0%, #f7d794 100%);
          color: #000000;
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
        }
        
        .luxury-button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.4);
        }
        
        .luxury-button-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .luxury-button-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #d4af37;
        }
        
        .luxury-button-connected {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        
        .luxury-hero {
          position: relative;
          margin-bottom: 3rem;
          animation: luxury-scale-in 1s ease-out 0.2s both;
        }
        
        .luxury-cover {
          height: 400px;
          border-radius: 24px 24px 0 0;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);
        }
        
        .luxury-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.5s ease;
        }
        
        .luxury-cover:hover img {
          transform: scale(1.05);
        }
        
        .luxury-cover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
        }
        
        .luxury-profile-picture {
          position: absolute;
          bottom: -60px;
          left: 2rem;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
        }
        
        .luxury-profile-picture img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .luxury-verified-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #d4af37 0%, #f7d794 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
          animation: luxury-glow 2s ease-in-out infinite;
        }
        
        .luxury-profile-header {
          padding: 4rem 2rem 2rem;
          border-radius: 0 0 24px 24px;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-top: none;
        }
        
        .luxury-profile-info {
          margin-left: 140px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .luxury-profile-details h1 {
          font-size: 2.5rem;
          font-weight: 300;
          color: #ffffff;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .luxury-profile-details .headline {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 300;
          margin-bottom: 1rem;
        }
        
        .luxury-profile-meta {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }
        
        .luxury-profile-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .luxury-profile-actions {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }
        
        .luxury-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
          animation: luxury-fade-in 1s ease-out 0.4s both;
        }
        
        .luxury-stat-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .luxury-stat-card:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }
        
        .luxury-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(212, 175, 55, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: #d4af37;
        }
        
        .luxury-stat-value {
          font-size: 1.5rem;
          font-weight: 300;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }
        
        .luxury-stat-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 300;
        }
        
        .luxury-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .luxury-main-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .luxury-sidebar {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .luxury-card {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          transition: all 0.3s ease;
          animation: luxury-fade-in 1s ease-out var(--delay, 0.6s) both;
        }
        
        .luxury-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }
        
        .luxury-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        
        .luxury-card-title {
          font-size: 1.25rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .luxury-card-action {
          color: #d4af37;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .luxury-card-action:hover {
          color: #f7d794;
        }
        
        .luxury-portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .luxury-portfolio-item {
          aspect-ratio: 3/4;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }
        
        .luxury-portfolio-item:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }
        
        .luxury-portfolio-item img,
        .luxury-portfolio-item video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.3s ease;
        }
        
        .luxury-portfolio-item:hover img,
        .luxury-portfolio-item:hover video {
          transform: scale(1.1);
        }
        
        .luxury-portfolio-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
          opacity: 0;
          transition: all 0.3s ease;
          display: flex;
          align-items: end;
          padding: 1rem;
        }
        
        .luxury-portfolio-item:hover .luxury-portfolio-overlay {
          opacity: 1;
        }

        .luxury-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          color: #d4af37;
          font-size: 0.8rem;
          font-weight: 300;
          margin: 0.25rem;
        }
        
        .luxury-skill-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .luxury-skill-item:hover {
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
        }
        
        .luxury-experience-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }
        
        .luxury-experience-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }
        
        .luxury-experience-title {
          font-size: 1.1rem;
          font-weight: 400;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }
        
        .luxury-experience-company {
          color: #d4af37;
          font-weight: 300;
          margin-bottom: 0.25rem;
        }
        
        .luxury-experience-duration {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }
        
        .luxury-experience-description {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          font-size: 0.9rem;
        }
        
        .luxury-current-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 12px;
          color: #22c55e;
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .luxury-contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .luxury-contact-item:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateX(4px);
        }
        
        .luxury-contact-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(212, 175, 55, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d4af37;
        }
        
        .luxury-social-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.3s ease;
          margin-bottom: 0.5rem;
        }
        
        .luxury-social-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #d4af37;
          transform: translateX(4px);
        }
        
        .luxury-form-input {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-size: 1rem;
          outline: none;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }
        
        .luxury-form-input:focus {
          border-color: #d4af37;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }
        
        .luxury-form-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .luxury-textarea {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-size: 1rem;
          outline: none;
          min-height: 120px;
          resize: vertical;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }
        
        .luxury-textarea:focus {
          border-color: #d4af37;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }
        
        .luxury-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: luxury-fade-in 0.3s ease-out;
        }
        
        .luxury-modal-content {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .luxury-notification {
          position: fixed;
          top: 2rem;
          right: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          color: #ffffff;
          font-weight: 400;
          z-index: 1001;
          animation: luxury-slide-in 0.3s ease-out;
          border: 1px solid;
        }
        
        .luxury-notification.success {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }
        
        .luxury-notification.error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }
        
        .luxury-notification.info {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }
        
        .luxury-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }
        
        .luxury-spinner {
          width: 60px;
          height: 60px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top: 2px solid #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 2rem;
        }
        
        .luxury-loading-text {
          text-align: center;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.25rem;
          font-weight: 300;
        }
        
        .luxury-loading-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        
        .luxury-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }
        
        .luxury-error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.7;
        }
        
        .luxury-error-title {
          font-size: 1.5rem;
          font-weight: 300;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }
        
        .luxury-error-description {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          max-width: 400px;
        }
        
        .luxury-empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .luxury-empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.7;
        }
        
        .luxury-empty-title {
          font-size: 1.25rem;
          font-weight: 300;
          margin-bottom: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .luxury-empty-description {
          font-size: 0.9rem;
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
          .luxury-grid {
            grid-template-columns: 1fr;
          }
          
          .luxury-profile-info {
            flex-direction: column;
            gap: 2rem;
            margin-left: 0;
            margin-top: 2rem;
          }
          
          .luxury-profile-picture {
            position: relative;
            bottom: auto;
            left: auto;
            margin: 0 auto 2rem;
          }
          
          .luxury-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .luxury-portfolio-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        `
      }} />

      {/* Luxury Cursor */}
      <div 
        ref={cursorRef}
        className="luxury-cursor"
        style={{ display: window.innerWidth >= 768 ? 'block' : 'none' }}
      />

      {/* Luxury Particles */}
      <div ref={bgAnimationRef} className="luxury-particles" />

      {/* Luxury Background */}
      <div className="luxury-background" />

      {/* Notification */}
      {notification.show && (
        <div className={`luxury-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Main Container */}
      <div className="luxury-container">
        <div className="luxury-content">
          
          {/* Navigation Header */}
          <div className="luxury-header">
            <div className="luxury-glass luxury-navigation">
              <button className="luxury-back-button" onClick={onBack}>
                <ChevronLeft className="w-5 h-5" />
                Back to Browse
              </button>
              
              <div className="luxury-title">
                <Crown className="w-6 h-6 text-yellow-500" />
                Professional Model Profile
              </div>
              
              <div className="luxury-actions">
                {isOwnProfile && (
                  <>
                    {isEditing ? (
                      <>
                        <button 
                          className="luxury-button luxury-button-primary"
                          onClick={handleSaveChanges}
                          disabled={uploading}
                        >
                          {uploading ? <div className="luxury-spinner" style={{ width: '16px', height: '16px', margin: 0 }}/> : <Check className="w-4 h-4" />}
                          {uploading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                          className="luxury-button luxury-button-secondary"
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        className="luxury-button luxury-button-secondary"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="luxury-hero">
            <div className="luxury-glass-strong">
              <div className="luxury-cover">
                {currentProfile?.coverPhoto ? (
                  <img 
                    src={currentProfile.coverPhoto.startsWith('http') ? currentProfile.coverPhoto : `http://localhost:8001${currentProfile.coverPhoto}`} 
                    alt="Cover" 
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '2rem',
                    fontWeight: '300'
                  }}>
                    Professional Portfolio
                  </div>
                )}
                <div className="luxury-cover-overlay" />
                
                {isEditing && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <input
                      type="file"
                      id="coverPhoto"
                      accept="image/*"
                      onChange={(e) => handleCoverPhotoUpload(e.target.files[0])}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    <label htmlFor="coverPhoto" className="luxury-button luxury-button-primary">
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Change Cover Photo'}
                    </label>
                  </div>
                )}
              </div>
              
              <div className="luxury-profile-picture">
                {currentProfile?.profilePicture ? (
                  <img 
                    src={currentProfile.profilePicture.startsWith('http') ? currentProfile.profilePicture : `http://localhost:8001${currentProfile.profilePicture}`} 
                    alt={currentProfile.fullName} 
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: 'rgba(255, 255, 255, 0.3)'
                  }}>
                    <Camera />
                  </div>
                )}
                
                {currentProfile?.verified && (
                  <div className="luxury-verified-badge">
                    <Crown className="w-4 h-4 text-black" />
                  </div>
                )}
                
                {isEditing && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%'
                  }}>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={(e) => handleProfilePictureUpload(e.target.files[0])}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    <label htmlFor="profilePicture" style={{ cursor: 'pointer', color: '#d4af37' }}>
                      <Camera className="w-6 h-6" />
                    </label>
                  </div>
                )}
              </div>

              <div className="luxury-profile-header">
                <div className="luxury-profile-info">
                  <div className="luxury-profile-details">
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                        <input
                          type="text"
                          value={editData.fullName || ''}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="luxury-form-input"
                          placeholder="Full Name"
                          style={{ fontSize: '2rem', fontWeight: '300' }}
                        />
                        <input
                          type="text"
                          value={editData.headline || ''}
                          onChange={(e) => handleInputChange('headline', e.target.value)}
                          className="luxury-form-input"
                          placeholder="Professional Headline"
                          style={{ fontSize: '1.25rem' }}
                        />
                        <input
                          type="text"
                          value={editData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="luxury-form-input"
                          placeholder="Location"
                        />
                      </div>
                    ) : (
                      <>
                        <h1>{currentProfile?.fullName || `${targetUser?.firstName} ${targetUser?.lastName}` || 'Professional Model'}</h1>
                        <div className="headline">{currentProfile?.headline || 'Professional Model & Creative Visionary'}</div>
                        <div className="luxury-profile-meta">
                          <span>
                            <MapPin className="w-4 h-4" />
                            {currentProfile?.location || 'Location not set'}
                          </span>
                          <span>
                            <Users className="w-4 h-4" />
                            {currentProfile?.connectionsCount?.toLocaleString() || '0'} connections
                          </span>
                          <span>
                            <Eye className="w-4 h-4" />
                            {currentProfile?.profileViews?.toLocaleString() || '0'} views
                          </span>
                          {currentProfile?.verified && (
                            <span style={{ color: '#d4af37' }}>
                              <Crown className="w-4 h-4" />
                              Verified Professional
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {!isOwnProfile && (
                    <div className="luxury-profile-actions">
                      {getConnectionButton()}
                      <button className="luxury-button luxury-button-secondary" onClick={onMessage}>
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                      <button className="luxury-button luxury-button-secondary">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="luxury-stats">
            <div className="luxury-stat-card">
              <div className="luxury-stat-icon">
                <Eye className="w-5 h-5" />
              </div>
              <div className="luxury-stat-value">{currentProfile?.profileViews?.toLocaleString() || '0'}</div>
              <div className="luxury-stat-label">Profile Views</div>
            </div>
            
            <div className="luxury-stat-card">
              <div className="luxury-stat-icon">
                <Star className="w-5 h-5" />
              </div>
              <div className="luxury-stat-value">{currentProfile?.avgRating || '5.0'}</div>
              <div className="luxury-stat-label">Average Rating</div>
            </div>
            
            <div className="luxury-stat-card">
              <div className="luxury-stat-icon">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="luxury-stat-value">{currentProfile?.completionRate || '100'}%</div>
              <div className="luxury-stat-label">Completion Rate</div>
            </div>
            
            <div className="luxury-stat-card">
              <div className="luxury-stat-icon">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="luxury-stat-value">{currentProfile?.responseRate || '100'}%</div>
              <div className="luxury-stat-label">Response Rate</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="luxury-grid">
            
            {/* Main Content */}
            <div className="luxury-main-content">
              
              {/* About Section */}
              <div className="luxury-card" style={{ '--delay': '0.6s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    <Zap className="w-5 h-5" />
                    About
                  </h2>
                </div>
                {isEditing ? (
                  <textarea
                    value={editData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="luxury-textarea"
                    placeholder="Describe your modeling experience, style, and what makes you unique..."
                    rows={6}
                  />
                ) : (
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    lineHeight: '1.8',
                    fontSize: '1rem'
                  }}>
                    {currentProfile?.bio || 'Professional model with experience in fashion, commercial, and editorial work. Passionate about bringing creative visions to life through authentic and dynamic performances.'}
                  </p>
                )}
              </div>

              {/* Portfolio Photos & Videos */}
              <div className="luxury-card" style={{ '--delay': '0.8s' }}>
                <div className="luxury-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 className="luxury-card-title">
                    <Camera className="w-5 h-5" />
                    Portfolio
                  </h2>
                  
                  {/* Filter Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '4px' }}>
                      <button
                        onClick={() => setPortfolioFilter('all')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: portfolioFilter === 'all' ? '#d4af37' : 'transparent',
                          color: portfolioFilter === 'all' ? '#000' : 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.8rem',
                          fontWeight: '400',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        All ({getPortfolioPhotos().length + getPortfolioVideos().length})
                      </button>
                      <button
                        onClick={() => setPortfolioFilter('photos')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: portfolioFilter === 'photos' ? '#d4af37' : 'transparent',
                          color: portfolioFilter === 'photos' ? '#000' : 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.8rem',
                          fontWeight: '400',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Photos ({getPortfolioPhotos().length})
                      </button>
                      <button
                        onClick={() => setPortfolioFilter('videos')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: portfolioFilter === 'videos' ? '#d4af37' : 'transparent',
                          color: portfolioFilter === 'videos' ? '#000' : 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.8rem',
                          fontWeight: '400',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Videos ({getPortfolioVideos().length})
                      </button>
                    </div>
                    
                    {isEditing && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          id="portfolio-photos-upload"
                          style={{ display: 'none' }}
                          onChange={(e) => handlePortfolioUpload(Array.from(e.target.files), 'photo')}
                        />
                        <label htmlFor="portfolio-photos-upload" className="luxury-card-action" style={{ cursor: 'pointer' }}>
                          <Plus className="w-4 h-4 mr-1" />
                          {uploading ? 'Uploading...' : 'Add Photos'}
                        </label>
                        
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          id="portfolio-videos-upload"
                          style={{ display: 'none' }}
                          onChange={(e) => handlePortfolioUpload(Array.from(e.target.files), 'video')}
                        />
                        <label htmlFor="portfolio-videos-upload" className="luxury-card-action" style={{ cursor: 'pointer' }}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Videos
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {displayPortfolio && displayPortfolio.length > 0 ? (
                  isEditing ? (
                    <DragDropContext onDragEnd={handlePortfolioReorder}>
                      <Droppable droppableId="portfolio-grid" direction="horizontal">
                        {(provided) => (
                          <div className="luxury-portfolio-grid" ref={provided.innerRef} {...provided.droppableProps}>
                            {displayPortfolio.map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="luxury-portfolio-item"
                                    style={{
                                      ...provided.draggableProps.style,
                                      boxShadow: snapshot.isDragging ? '0 8px 30px #d4af37' : undefined,
                                      border: snapshot.isDragging ? '2px solid #d4af37' : undefined
                                    }}
                                    onClick={() => {
                                      if (item.type === 'photo') setActivePhotoIndex(index);
                                      else setActiveVideoIndex(index);
                                    }}
                                  >
                                    {item.type === 'photo' ? (
                                      <img 
                                        src={item.url.startsWith('http') ? item.url : `http://localhost:8001${item.url}`}
                                        alt={`Portfolio ${index + 1}`} 
                                      />
                                    ) : (
                                      <div style={{ position: 'relative' }}>
                                        <video 
                                          src={item.url.startsWith('http') ? item.url : `http://localhost:8001${item.url}`}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                          muted
                                        />
                                        <div style={{
                                          position: 'absolute',
                                          inset: 0,
                                          background: 'rgba(0, 0, 0, 0.3)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}>
                                          <div style={{
                                            width: '60px',
                                            height: '60px',
                                            background: 'rgba(212, 175, 55, 0.9)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#000'
                                          }}>
                                            ▶
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="luxury-portfolio-overlay">
                                      <div style={{ color: 'white', fontSize: '0.8rem' }}>
                                        {item.type === 'photo' ? 'View Photo' : 'Play Video'}
                                      </div>
                                    </div>
                                    
                                    {/* Media Type Badge */}
                                    <div style={{
                                      position: 'absolute',
                                      top: '8px',
                                      left: '8px',
                                      background: item.type === 'photo' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                                      color: 'white',
                                      padding: '4px 8px',
                                      borderRadius: '12px',
                                      fontSize: '0.7rem',
                                      fontWeight: '500'
                                    }}>
                                      {item.type === 'photo' ? 'PHOTO' : 'VIDEO'}
                                    </div>
                                    
                                    {isEditing && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemovePortfolioItem(item);
                                        }}
                                        style={{
                                          position: 'absolute',
                                          top: '8px',
                                          right: '8px',
                                          background: 'rgba(239, 68, 68, 0.8)',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '50%',
                                          width: '28px',
                                          height: '28px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    <div className="luxury-portfolio-grid">
                      {displayPortfolio.map((item, index) => (
                        <div
                          key={item.id}
                          className="luxury-portfolio-item"
                          onClick={() => {
                            if (item.type === 'photo') setActivePhotoIndex(index);
                            else setActiveVideoIndex(index);
                          }}
                        >
                          {item.type === 'photo' ? (
                            <img 
                              src={item.url.startsWith('http') ? item.url : `http://localhost:8001${item.url}`}
                              alt={`Portfolio ${index + 1}`} 
                            />
                          ) : (
                            <div style={{ position: 'relative' }}>
                              <video 
                                src={item.url.startsWith('http') ? item.url : `http://localhost:8001${item.url}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                muted
                              />
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0, 0, 0, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <div style={{
                                  width: '60px',
                                  height: '60px',
                                  background: 'rgba(212, 175, 55, 0.9)',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#000'
                                }}>
                                  ▶
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="luxury-portfolio-overlay">
                            <div style={{ color: 'white', fontSize: '0.8rem' }}>
                              {item.type === 'photo' ? 'View Photo' : 'Play Video'}
                            </div>
                          </div>
                          {/* Media Type Badge */}
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: item.type === 'photo' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: '500'
                          }}>
                            {item.type === 'photo' ? 'PHOTO' : 'VIDEO'}
                          </div>
                          {isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePortfolioItem(item);
                              }}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(239, 68, 68, 0.8)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="luxury-empty-state">
                    <div className="luxury-empty-icon">📸</div>
                    <div className="luxury-empty-title">No Portfolio Media</div>
                    <div className="luxury-empty-description">
                      {isEditing ? "Upload photos and videos to showcase your modeling work" : "This model hasn't uploaded any portfolio media yet"}
                    </div>
                    {isEditing && (
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                        <label htmlFor="portfolio-photos-upload">
                          <button className="luxury-button luxury-button-primary">
                            <Upload className="w-4 h-4" />
                            Add Photos
                          </button>
                        </label>
                        <label htmlFor="portfolio-videos-upload">
                          <button className="luxury-button luxury-button-primary">
                            <Upload className="w-4 h-4" />
                            Add Videos
                          </button>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Experience with Show More/Less */}
              <div className="luxury-card" style={{ '--delay': '1.0s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    <Award className="w-5 h-5" />
                    Professional Experience
                  </h2>
                  {isEditing && (
                    <button className="luxury-card-action" onClick={addExperience}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Experience
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <div>
                    {ensureExperienceArray(editData.experience).map((exp, index) => (
                      <div key={index} className="luxury-experience-card">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateExperience(index, 'role', e.target.value)}
                          className="luxury-form-input"
                          placeholder="Role/Project Title"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="luxury-form-input"
                          placeholder="Client/Agency/Brand"
                        />
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                          className="luxury-form-input"
                          placeholder="Duration (e.g., 2023-2024)"
                        />
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          className="luxury-textarea"
                          placeholder="Description of the work..."
                          rows={3}
                        />
                        <label style={{ 
                          color: 'white', 
                          fontSize: '0.9rem', 
                          marginBottom: '1rem', 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <input
                            type="checkbox"
                            checked={exp.current || false}
                            onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                            style={{ marginRight: '0.5rem' }}
                          />
                          Current project
                        </label>
                        <button 
                          className="luxury-button luxury-button-secondary"
                          onClick={() => removeExperience(index)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                        >
                          <Minus className="w-4 h-4" />
                          Remove Experience
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {ensureExperienceArray(currentProfile?.experience).length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {ensureExperienceArray(currentProfile?.experience)
                          .slice(0, showAllExperience ? undefined : 3)
                          .map((exp, index) => (
                          <div key={index} className="luxury-experience-card">
                            <div className="luxury-experience-title">{exp.role}</div>
                            {exp.company && <div className="luxury-experience-company">{exp.company}</div>}
                            {exp.duration && <div className="luxury-experience-duration">{exp.duration}</div>}
                            {exp.description && <div className="luxury-experience-description">{exp.description}</div>}
                            {exp.current && (
                              <div className="luxury-current-badge">
                                <Zap className="w-3 h-3" />
                                Current
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Show More/Less for Experience */}
                        {ensureExperienceArray(currentProfile?.experience).length > 3 && (
                          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button 
                              className="luxury-button luxury-button-secondary"
                              onClick={() => setShowAllExperience(!showAllExperience)}
                            >
                              {showAllExperience 
                                ? 'Show Less Experience' 
                                : `Show All Experience (${ensureExperienceArray(currentProfile?.experience).length})`
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="luxury-empty-state">
                        <div className="luxury-empty-icon">💼</div>
                        <div className="luxury-empty-title">No Experience Listed</div>
                        <div className="luxury-empty-description">
                          {isEditing ? "Add your modeling experience and projects" : "No modeling experience has been added yet"}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="luxury-sidebar">
              
              {/* Modeling Types from Real Data */}
              <div className="luxury-card" style={{ '--delay': '0.7s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    <Star className="w-5 h-5" />
                    Specializations
                  </h2>
                </div>
                {isEditing ? (
                  <textarea
                    value={(editData.modelingTypes || []).join(', ')}
                    onChange={(e) => handleArrayInputChange('modelingTypes', e.target.value)}
                    className="luxury-textarea"
                    placeholder="Fashion, Commercial, Editorial, Runway, Fitness, Beauty (comma separated)"
                    rows={4}
                  />
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(currentProfile?.modelingTypes && currentProfile.modelingTypes.length > 0
                      ? currentProfile.modelingTypes 
                      : currentProfile?.modelType ? [currentProfile.modelType] : ['Fashion Modeling']).map((type, index) => (
                      <div key={index} className="luxury-badge">
                        <Diamond className="w-3 h-3" />
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real Measurements Data */}
              <div className="luxury-card" style={{ '--delay': '0.9s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    📏 Measurements
                  </h2>
                </div>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={editData.height || ''}
                      onChange={(e) => handleInputChange('height', e.target.value.replace(/[^0-9.]/g, ''))}
                      className="luxury-form-input"
                      placeholder="Height"
                      style={{ width: '60%', display: 'inline-block', marginRight: '8px' }}
                    />
                    <select
                      value={editData.heightUnit || 'cm'}
                      onChange={e => handleInputChange('heightUnit', e.target.value)}
                      className="luxury-form-input"
                      style={{ width: '35%', display: 'inline-block' }}
                    >
                      <option value="cm">cm</option>
                      <option value="in">inches</option>
                    </select>
                    <input
                      type="text"
                      value={editData.weight || ''}
                      onChange={(e) => handleInputChange('weight', e.target.value.replace(/[^0-9.]/g, ''))}
                      className="luxury-form-input"
                      placeholder="Weight"
                      style={{ width: '60%', display: 'inline-block', marginRight: '8px' }}
                    />
                    <select
                      value={editData.weightUnit || 'kg'}
                      onChange={e => handleInputChange('weightUnit', e.target.value)}
                      className="luxury-form-input"
                      style={{ width: '35%', display: 'inline-block' }}
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                    <input
                      type="text"
                      value={editData.bust || ''}
                      onChange={(e) => handleInputChange('bust', e.target.value.replace(/[^0-9.]/g, ''))}
                      className="luxury-form-input"
                      placeholder="Bust/Chest"
                      style={{ width: '60%', display: 'inline-block', marginRight: '8px' }}
                    />
                    <select
                      value={editData.bustUnit || 'cm'}
                      onChange={e => handleInputChange('bustUnit', e.target.value)}
                      className="luxury-form-input"
                      style={{ width: '35%', display: 'inline-block' }}
                    >
                      <option value="cm">cm</option>
                      <option value="in">inches</option>
                    </select>
                    <input
                      type="text"
                      value={editData.waist || ''}
                      onChange={(e) => handleInputChange('waist', e.target.value.replace(/[^0-9.]/g, ''))}
                      className="luxury-form-input"
                      placeholder="Waist"
                      style={{ width: '60%', display: 'inline-block', marginRight: '8px' }}
                    />
                    <select
                      value={editData.waistUnit || 'cm'}
                      onChange={e => handleInputChange('waistUnit', e.target.value)}
                      className="luxury-form-input"
                      style={{ width: '35%', display: 'inline-block' }}
                    >
                      <option value="cm">cm</option>
                      <option value="in">inches</option>
                    </select>
                    <input
                      type="text"
                      value={editData.hips || ''}
                      onChange={(e) => handleInputChange('hips', e.target.value.replace(/[^0-9.]/g, ''))}
                      className="luxury-form-input"
                      placeholder="Hips"
                      style={{ width: '60%', display: 'inline-block', marginRight: '8px' }}
                    />
                    <select
                      value={editData.hipsUnit || 'cm'}
                      onChange={e => handleInputChange('hipsUnit', e.target.value)}
                      className="luxury-form-input"
                      style={{ width: '35%', display: 'inline-block' }}
                    >
                      <option value="cm">cm</option>
                      <option value="in">inches</option>
                    </select>
                    <input
                      type="text"
                      value={editData.shoeSize || ''}
                      onChange={(e) => handleInputChange('shoeSize', e.target.value.replace(/[^0-9.]/g, ''))}
                      className="luxury-form-input"
                      placeholder="Shoe Size"
                      style={{ width: '60%', display: 'inline-block', marginRight: '8px' }}
                    />
                    <select
                      value={editData.shoeSizeUnit || 'EU'}
                      onChange={e => handleInputChange('shoeSizeUnit', e.target.value)}
                      className="luxury-form-input"
                      style={{ width: '35%', display: 'inline-block' }}
                    >
                      <option value="EU">EU</option>
                      <option value="US">US</option>
                      <option value="UK">UK</option>
                    </select>
                    <input
                      type="text"
                      value={editData.dressSize || ''}
                      onChange={(e) => handleInputChange('dressSize', e.target.value.replace(/[^0-9.]/g, ''))}
                      className="luxury-form-input"
                      placeholder="Dress Size"
                      style={{ width: '60%', display: 'inline-block', marginRight: '8px' }}
                    />
                    <select
                      value={editData.dressSizeUnit || 'EU'}
                      onChange={e => handleInputChange('dressSizeUnit', e.target.value)}
                      className="luxury-form-input"
                      style={{ width: '35%', display: 'inline-block' }}
                    >
                      <option value="EU">EU</option>
                      <option value="US">US</option>
                      <option value="UK">UK</option>
                    </select>
                  </div>
                ) : (
                  <>
                    {(currentProfile?.height || currentProfile?.weight || currentProfile?.bust || currentProfile?.waist || currentProfile?.hips) ? (
                      <div style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {currentProfile?.height && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Height:</span>
                            <span>{currentProfile.height}{currentProfile.heightUnit && ` ${currentProfile.heightUnit}`}</span>
                          </div>
                        )}
                        {currentProfile?.weight && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Weight:</span>
                            <span>{currentProfile.weight}{currentProfile.weightUnit && ` ${currentProfile.weightUnit}`}</span>
                          </div>
                        )}
                        {currentProfile?.bust && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Bust/Chest:</span>
                            <span>{currentProfile.bust}{currentProfile.bustUnit && ` ${currentProfile.bustUnit}`}</span>
                          </div>
                        )}
                        {currentProfile?.waist && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Waist:</span>
                            <span>{currentProfile.waist}{currentProfile.waistUnit && ` ${currentProfile.waistUnit}`}</span>
                          </div>
                        )}
                        {currentProfile?.hips && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Hips:</span>
                            <span>{currentProfile.hips}{currentProfile.hipsUnit && ` ${currentProfile.hipsUnit}`}</span>
                          </div>
                        )}
                        {currentProfile?.shoeSize && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Shoe Size:</span>
                            <span>{currentProfile.shoeSize}{currentProfile.shoeSizeUnit && ` ${currentProfile.shoeSizeUnit}`}</span>
                          </div>
                        )}
                        {currentProfile?.dressSize && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Dress Size:</span>
                            <span>{currentProfile.dressSize}{currentProfile.dressSizeUnit && ` ${currentProfile.dressSizeUnit}`}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="luxury-empty-state">
                        <div className="luxury-empty-icon">📏</div>
                        <div className="luxury-empty-title">No Measurements</div>
                        <div className="luxury-empty-description">Physical measurements haven't been provided</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Real Physical Features Data */}
              <div className="luxury-card" style={{ '--delay': '1.1s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    👁️ Physical Features
                  </h2>
                </div>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ color: '#ccc', marginBottom: '2px' }}>Eye Color</label>
                    <input
                      type="text"
                      value={editData.eyeColor || ''}
                      onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Eye Color"
                    />
                    <label style={{ color: '#ccc', marginBottom: '2px' }}>Hair Color</label>
                    <input
                      type="text"
                      value={editData.hairColor || ''}
                      onChange={(e) => handleInputChange('hairColor', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Hair Color"
                    />
                    <label style={{ color: '#ccc', marginBottom: '2px' }}>Skin Tone</label>
                    <input
                      type="text"
                      value={editData.skinTone || ''}
                      onChange={(e) => handleInputChange('skinTone', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Skin Tone"
                    />
                    <label style={{ color: '#ccc', marginBottom: '2px' }}>Nationality/Ethnicity</label>
                    <input
                      type="text"
                      value={editData.nationality || ''}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Nationality/Ethnicity"
                    />
                    <label style={{ color: '#ccc', marginBottom: '2px' }}>Body Type</label>
                    <input
                      type="text"
                      value={editData.bodyType || ''}
                      onChange={(e) => handleInputChange('bodyType', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Body Type"
                    />
                  </div>
                ) : (
                  <>
                    {(currentProfile?.eyeColor || currentProfile?.hairColor || currentProfile?.skinTone || currentProfile?.nationality || currentProfile?.bodyType) ? (
                      <div style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {currentProfile?.eyeColor && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Eyes:</span>
                            <span>{currentProfile.eyeColor}</span>
                          </div>
                        )}
                        {currentProfile?.hairColor && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Hair:</span>
                            <span>{currentProfile.hairColor}</span>
                          </div>
                        )}
                        {currentProfile?.skinTone && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Skin Tone:</span>
                            <span>{currentProfile.skinTone}</span>
                          </div>
                        )}
                        {currentProfile?.nationality && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Nationality:</span>
                            <span>{currentProfile.nationality}</span>
                          </div>
                        )}
                        {currentProfile?.bodyType && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Body Type:</span>
                            <span>{currentProfile.bodyType}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="luxury-empty-state">
                        <div className="luxury-empty-icon">👁️</div>
                        <div className="luxury-empty-title">No Features Listed</div>
                        <div className="luxury-empty-description">Physical features haven't been provided</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Real Skills Data */}
              <div className="luxury-card" style={{ '--delay': '1.3s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    🎯 Skills & Abilities
                  </h2>
                </div>
                {isEditing ? (
                  <textarea
                    value={(editData.specialSkills || editData.skills || []).join(', ')}
                    onChange={(e) => handleArrayInputChange('specialSkills', e.target.value)}
                    className="luxury-textarea"
                    placeholder="Dancing, Acting, Sports, Languages, Musical Instruments (comma separated)"
                    rows={4}
                  />
                ) : (
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {((currentProfile?.specialSkills && currentProfile.specialSkills.length > 0)
                      ? currentProfile.specialSkills
                      : (currentProfile?.skills && currentProfile.skills.length > 0)
                      ? currentProfile.skills
                      : ['Professional Posing', 'Runway Walking']).map((skill, index) => (
                      <div key={index} className="luxury-skill-item">
                        • {skill}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real Rates Data */}
              <div className="luxury-card" style={{ '--delay': '1.5s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    <DollarSign className="w-5 h-5" />
                    Rates & Availability
                  </h2>
                </div>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={editData.rates?.hourly || ''}
                      onChange={(e) => handleInputChange('rates.hourly', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Hourly Rate (e.g., $150/hour)"
                    />
                    <input
                      type="text"
                      value={editData.rates?.halfDay || editData.rates?.daily || ''}
                      onChange={(e) => handleInputChange('rates.daily', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Daily Rate (e.g., $800/day)"
                    />
                    <input
                      type="text"
                      value={editData.rates?.fullDay || ''}
                      onChange={(e) => handleInputChange('rates.fullDay', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Full Day Rate (e.g., $1500/day)"
                    />
                    <select
                      value={editData.availability || ''}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                      className="luxury-form-input"
                    >
                      <option value="">Select Availability</option>
                      <option value="full-time">Available Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="freelance">Freelance Projects</option>
                      <option value="international">International Projects</option>
                    </select>
                  </div>
                ) : (
                  <>
                    {(currentProfile?.rates && (currentProfile.rates.hourly || currentProfile.rates.daily || currentProfile.rates.halfDay || currentProfile.rates.fullDay)) || 
                     currentProfile?.availability ? (
                      <div style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {currentProfile?.rates?.hourly && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Hourly:</span>
                            <span style={{ color: '#d4af37' }}>{currentProfile.rates.currency || '$'} {currentProfile.rates.hourly}</span>
                          </div>
                        )}
                        {(currentProfile?.rates?.daily || currentProfile?.rates?.halfDay) && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Daily:</span>
                            <span style={{ color: '#d4af37' }}>{currentProfile.rates.currency || '$'} {currentProfile.rates.daily || currentProfile.rates.halfDay}</span>
                          </div>
                        )}
                        {currentProfile?.rates?.fullDay && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Full Day:</span>
                            <span style={{ color: '#d4af37' }}>{currentProfile.rates.currency || '$'} {currentProfile.rates.fullDay}</span>
                          </div>
                        )}
                        {currentProfile?.availability && (
                          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                            <div style={{ color: '#22c55e', fontSize: '0.9rem' }}>
                              <Clock className="w-4 h-4 mr-2" style={{ display: 'inline' }} />
                              {currentProfile.availability}
                            </div>
                          </div>
                        )}
                        {(currentProfile?.travelWillingness === 'international' || currentProfile?.willingToTravel) && (
                          <div style={{ color: '#22c55e', fontSize: '0.9rem' }}>
                            <Globe className="w-4 h-4 mr-2" style={{ display: 'inline' }} />
                            Available for international travel
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="luxury-empty-state">
                        <div className="luxury-empty-icon">💰</div>
                        <div className="luxury-empty-title">Contact for Rates</div>
                        <div className="luxury-empty-description">Rates and availability on request</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Agency & Representation with Real Data */}
              <div className="luxury-card" style={{ '--delay': '1.7s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    🏢 Agency & Representation
                  </h2>
                </div>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={editData.agencies || editData.agency?.name || ''}
                      onChange={(e) => handleInputChange('agencies', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Current/Previous Agencies"
                    />
                    <input
                      type="text"
                      value={editData.unionMembership || ''}
                      onChange={(e) => handleInputChange('unionMembership', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Union Memberships (SAG-AFTRA, etc.)"
                    />
                    <label style={{ color: 'white', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={editData.seekingRepresentation || false}
                        onChange={(e) => handleInputChange('seekingRepresentation', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Currently seeking representation
                    </label>
                  </div>
                ) : (
                  <>
                    {(currentProfile?.agencies || currentProfile?.agency?.name || currentProfile?.unionMembership || currentProfile?.seekingRepresentation) ? (
                      <div style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(currentProfile?.agencies || currentProfile?.agency?.name) && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Agencies:</span>
                            <span>{currentProfile.agencies || currentProfile.agency.name}</span>
                          </div>
                        )}
                        {currentProfile?.unionMembership && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Union:</span>
                            <span>{currentProfile.unionMembership}</span>
                          </div>
                        )}
                        {currentProfile?.seekingRepresentation && (
                          <div style={{ color: '#22c55e', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            ✓ Seeking new representation
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="luxury-empty-state">
                        <div className="luxury-empty-icon">🏢</div>
                        <div className="luxury-empty-title">No Agency Information</div>
                        <div className="luxury-empty-description">Agency details haven't been provided</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Contact Information with Real Data */}
              <div className="luxury-card" style={{ '--delay': '1.9s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    📞 Contact Information
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="luxury-form-input"
                        placeholder="Email Address"
                      />
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="luxury-form-input"
                        placeholder="Phone Number"
                      />
                      <input
                        type="url"
                        value={editData.portfolioWebsite || ''}
                        onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                        className="luxury-form-input"
                        placeholder="Portfolio Website"
                      />
                    </>
                  ) : (
                    <>
                      {currentProfile?.email && (
                        <div className="luxury-contact-item">
                          <div className="luxury-contact-icon">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{currentProfile.email}</div>
                        </div>
                      )}
                      {currentProfile?.phone && (
                        <div className="luxury-contact-item">
                          <div className="luxury-contact-icon">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{currentProfile.phone}</div>
                        </div>
                      )}
                      {currentProfile?.portfolioWebsite && (
                        <a
                          href={currentProfile.portfolioWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="luxury-contact-item"
                          style={{ textDecoration: 'none' }}
                        >
                          <div className="luxury-contact-icon">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                          <div style={{ color: '#d4af37' }}>Portfolio Website</div>
                        </a>
                      )}
                      {!currentProfile?.email && !currentProfile?.phone && !currentProfile?.portfolioWebsite && (
                        <div className="luxury-empty-state">
                          <div className="luxury-empty-icon">📞</div>
                          <div className="luxury-empty-title">No Contact Info</div>
                          <div className="luxury-empty-description">Contact information private</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Social Media with Real Data */}
              <div className="luxury-card" style={{ '--delay': '2.1s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    📱 Social Media
                  </h2>
                </div>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={editData.socialMedia?.instagram || ''}
                      onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                      className="luxury-form-input"
                      placeholder="Instagram (@username or URL)"
                    />
                    <input
                      type="text"
                      value={editData.socialMedia?.youtube || ''}
                      onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                      className="luxury-form-input"
                      placeholder="YouTube (Channel URL)"
                    />
                    <input
                      type="text"
                      value={editData.socialMedia?.tiktok || ''}
                      onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                      className="luxury-form-input"
                      placeholder="TikTok (@username or URL)"
                    />
                    <input
                      type="text"
                      value={editData.socialMedia?.linkedin || ''}
                      onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                      className="luxury-form-input"
                      placeholder="LinkedIn (Profile URL)"
                    />
                  </div>
                ) : (
                  <>
                    {(currentProfile?.socialMedia && Object.values(currentProfile.socialMedia).some(val => val)) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {currentProfile?.socialMedia?.instagram && (
                          <a
                            href={
                              currentProfile.socialMedia.instagram.startsWith('http')
                                ? currentProfile.socialMedia.instagram
                                : `https://instagram.com/${currentProfile.socialMedia.instagram.replace('@', '')}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="luxury-social-link"
                          >
                            <Instagram className="w-4 h-4" style={{ color: '#E4405F' }} />
                            <span>Instagram</span>
                          </a>
                        )}
                        {currentProfile?.socialMedia?.youtube && (
                          <a
                            href={currentProfile.socialMedia.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="luxury-social-link"
                          >
                            <Youtube className="w-4 h-4" style={{ color: '#FF0000' }} />
                            <span>YouTube</span>
                          </a>
                        )}
                        {currentProfile?.socialMedia?.tiktok && (
                          <a
                            href={
                              currentProfile.socialMedia.tiktok.startsWith('http')
                                ? currentProfile.socialMedia.tiktok
                                : `https://tiktok.com/@${currentProfile.socialMedia.tiktok.replace('@', '')}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="luxury-social-link"
                          >
                            <Music className="w-4 h-4" />
                            <span>TikTok</span>
                          </a>
                        )}
                        {currentProfile?.socialMedia?.linkedin && (
                          <a
                            href={currentProfile.socialMedia.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="luxury-social-link"
                          >
                            <Globe className="w-4 h-4" style={{ color: '#0A66C2' }} />
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="luxury-empty-state">
                        <div className="luxury-empty-icon">📱</div>
                        <div className="luxury-empty-title">No Social Media</div>
                        <div className="luxury-empty-description">Social media profiles not added</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Looking For */}
              <div className="luxury-card" style={{ '--delay': '1.55s' }}>
                <div className="luxury-card-header">
                  <h2 className="luxury-card-title">
                    <Check className="w-5 h-5" />
                    Looking For
                  </h2>
                </div>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['Full Time', 'Part Time', 'Freelance', 'Collaboration', 'Commercial', 'Runway', 'Editorial'].map(option => (
                      <label key={option} style={{ color: 'white', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={Array.isArray(editData.lookingFor) && editData.lookingFor.includes(option)}
                          onChange={e => {
                            const checked = e.target.checked;
                            setEditData(prev => {
                              const arr = Array.isArray(prev.lookingFor) ? [...prev.lookingFor] : [];
                              if (checked && !arr.includes(option)) arr.push(option);
                              if (!checked && arr.includes(option)) arr.splice(arr.indexOf(option), 1);
                              return { ...prev, lookingFor: arr };
                            });
                          }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(currentProfile?.lookingFor && currentProfile.lookingFor.length > 0
                      ? currentProfile.lookingFor
                      : ['Full Time']).map((option, idx) => (
                      <div key={idx} className="luxury-badge">
                        <Check className="w-3 h-3" />
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal for full-size viewing */}
      {activePhotoIndex !== null && (
        <div 
          className="luxury-modal"
          onClick={() => setActivePhotoIndex(null)}
        >
          <div 
            className="luxury-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img 
              src={displayPortfolio[activePhotoIndex]?.url?.startsWith('http') 
                ? displayPortfolio[activePhotoIndex].url 
                : `http://localhost:8001${displayPortfolio[activePhotoIndex]?.url}`}
              alt={`Portfolio ${activePhotoIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
            />
            <button
              onClick={() => setActivePhotoIndex(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Video Modal for full-size viewing */}
      {activeVideoIndex !== null && (
        <div 
          className="luxury-modal"
          onClick={() => setActiveVideoIndex(null)}
        >
          <div 
            className="luxury-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <video 
              src={displayPortfolio[activeVideoIndex]?.url?.startsWith('http') 
                ? displayPortfolio[activeVideoIndex].url 
                : `http://localhost:8001${displayPortfolio[activeVideoIndex]?.url}`}
              controls
              autoPlay
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
            />
            <button
              onClick={() => setActiveVideoIndex(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {cropModal.open && (
        <div className="luxury-modal" style={{ zIndex: 2000 }}>
          <div className="luxury-modal-content" style={{ maxWidth: 500, width: '90vw', padding: 0, background: '#111' }}>
            <div style={{ position: 'relative', width: '100%', height: 350, background: '#222', borderRadius: 12, overflow: 'hidden' }}>
              <Cropper
                image={cropModal.image}
                crop={crop}
                zoom={zoom}
                aspect={cropModal.type === 'cover' ? 3.5 : 1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                style={{ width: '60%' }}
              />
              <button className="luxury-button luxury-button-secondary" onClick={() => setCropModal({ open: false, image: null, type: null })}>
                Cancel
              </button>
              <button className="luxury-button luxury-button-primary" onClick={handleCropConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Indicator */}
      <div className="luxury-card" style={{ margin: '2rem auto 1rem', maxWidth: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: '#d4af37', fontSize: '1.1rem' }}>Profile Completion</span>
          <span style={{ color: getProfileCompletion(currentProfile || {}).percent === 100 ? '#22c55e' : '#fff', fontWeight: 600 }}>{getProfileCompletion(currentProfile || {}).percent}%</span>
        </div>
        <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${getProfileCompletion(currentProfile || {}).percent}%`, height: '100%', background: getProfileCompletion(currentProfile || {}).percent === 100 ? 'linear-gradient(90deg,#22c55e,#d4af37)' : 'linear-gradient(90deg,#d4af37,#f7d794)', borderRadius: 8, transition: 'width 0.4s' }} />
        </div>
        {getProfileCompletion(currentProfile || {}).percent < 100 && (
          <div style={{ color: '#fff', fontSize: '0.95rem', marginTop: 4 }}>
            <span style={{ color: '#f87171', fontWeight: 500 }}>Missing:</span> {getProfileCompletion(currentProfile || {}).missing.join(', ')}
          </div>
        )}
      </div>

      {uploading && uploadProgress > 0 && uploadProgress < 100 && (
        <div style={{ width: '100%', maxWidth: 400, margin: '1rem auto' }}>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg,#d4af37,#f7d794)', borderRadius: 8, transition: 'width 0.3s' }} />
          </div>
          <div style={{ color: '#d4af37', fontSize: '0.95rem', marginTop: 4, textAlign: 'center' }}>{uploadProgress}%</div>
        </div>
      )}
    </>
  );
};

export default ModelProfile;



