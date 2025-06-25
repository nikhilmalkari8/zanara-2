import React, { useState, useEffect, useRef } from 'react';
import { Camera, Eye, Heart, MessageCircle, Share2, Edit3, Upload, X, ChevronLeft, Check, Clock, DollarSign, Users, TrendingUp, Star, Award, Diamond, Zap, Globe, Instagram, Youtube, Music, Phone, Mail, ExternalLink, Plus, Minus, MapPin } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ConnectionRequestModal from '../connections/ConnectionRequestModal';

const PhotographerProfile = ({ profileId, user, targetUser, profileData, onBack, onConnect, onMessage }) => {
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
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cropModal, setCropModal] = useState({ open: false, image: null, type: null });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const cursorRef = useRef(null);
  const bgAnimationRef = useRef(null);

  // Connection states
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

  // Helper functions
  const ensureArray = (value) => Array.isArray(value) ? value : [];
  const isOwnProfile = user && (user._id === targetUser?._id || user.id === targetUser?.id || user._id === profileId || user.id === profileId);

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

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setEditData(profileData);
      setLoading(false);
    } else if (profileId || targetUser) {
      fetchPhotographerProfile();
    }
  }, [profileData, profileId, targetUser]);

  useEffect(() => {
    if (!isOwnProfile && profileId && profile) {
      checkConnectionStatus();
    }
  }, [profileId, profile, isOwnProfile]);

  const fetchPhotographerProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/professional-profile/${profileId || targetUser._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
      setError('Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`/api/connections/status/${profileId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.status || 'none');
      }
    } catch (error) {
      setConnectionStatus('none');
    }
  };

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
        await fetchPhotographerProfile();
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

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Handle connect button click
  const handleConnectClick = () => {
    setIsConnectionModalOpen(true);
  };

  // Send connection request
  const handleSendConnectionRequest = async (message) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: profileId,
          message,
          receiverType: profile.professionalType || 'photographer'
        })
      });

      if (response.ok) {
        setConnectionStatus('pending');
        setIsConnectionModalOpen(false);
        alert('Connection request sent successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Error sending connection request');
    }
  };

  const handlePortfolioUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('portfolioPhotos', file));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/professional-profile/photos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const updatedPhotos = [...(profile.photos || []), ...data.photos];
        const updatedProfile = { ...profile, photos: updatedPhotos };
        setProfile(updatedProfile);
        setEditData(updatedProfile);
        alert(`${files.length} photos uploaded successfully!`);
      }
    } catch (error) {
      console.error('Portfolio upload error:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

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

  // 1. Portfolio drag-and-drop upload
  const onDropPortfolio = (acceptedFiles) => {
    handlePortfolioUpload(acceptedFiles, 'photo');
  };
  const {
    getRootProps: getPortfolioDropzoneProps,
    getInputProps: getPortfolioInputProps,
    isDragActive: isPortfolioDragActive
  } = useDropzone({
    onDrop: onDropPortfolio,
    accept: {'image/*': []},
    multiple: true,
    disabled: !isEditing
  });

  // 2. Profile picture cropping/upload
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

  // 3. Cover photo cropping/upload
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
  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };
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

  // 4. Portfolio reorder
  const handlePortfolioReorder = async (result) => {
    if (!result.destination) return;
    const items = Array.from(ensureArray(profile?.photos));
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setProfile(prev => ({ ...prev, photos: items }));
    setEditData(prev => ({ ...prev, photos: items }));
    // Persist to backend (optional)
    try {
      setUploading(true);
      const response = await fetch('/api/professional-profile/reorder-portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ photos: items })
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

  // 5. Profile completion meter
  const getProfileCompletion = (profile) => {
    const requiredFields = [
      { key: 'profilePicture', label: 'Profile Photo' },
      { key: 'coverPhoto', label: 'Cover Photo' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'headline', label: 'Headline' },
      { key: 'bio', label: 'About/Bio' },
      { key: 'specializations', label: 'Specializations' },
      { key: 'skills', label: 'Skills' },
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

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)', // Photographer green theme
      padding: '20px'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '20px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '25px',
      marginBottom: '20px'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    primaryButton: {
      background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
      color: 'white'
    },
    secondaryButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    disabledButton: {
      background: '#f0f0f0',
      color: '#666',
      cursor: 'default'
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

  const currentProfile = isEditing ? editData : profile;
  const displayPortfolio = ensureArray(currentProfile?.photos);

  return (
    <>
      {/* Luxury Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-up-luxury {
            0% { transform: translateY(0) rotate(0deg) scale(0.8); opacity: 0; }
            10% { opacity: 1; transform: translateY(-10vh) rotate(45deg) scale(1); }
            90% { opacity: 1; transform: translateY(-90vh) rotate(315deg) scale(1); }
            100% { transform: translateY(-100vh) rotate(360deg) scale(0.8); opacity: 0; }
          }
          @keyframes luxury-fade-in {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes luxury-slide-in {
            0% { opacity: 0; transform: translateX(-30px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes luxury-scale-in {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .luxury-container { min-height: 100vh; background: #000000; color: #ffffff; position: relative; overflow-x: hidden; }
          .luxury-background { position: fixed; inset: 0; background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%); }
          .luxury-background::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 25% 25%, rgba(38, 222, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.02) 0%, transparent 50%); }
          .luxury-background::after { content: ''; position: absolute; top: 20%; left: 10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(38, 222, 129, 0.03) 0%, transparent 70%); border-radius: 50%; filter: blur(40px); }
          .luxury-cursor { position: fixed; width: 20px; height: 20px; background: rgba(38, 222, 129, 0.8); border-radius: 50%; pointer-events: none; z-index: 9999; mix-blend-mode: difference; transition: all 0.1s ease; transform: translate(-50%, -50%); }
          .luxury-particles { position: fixed; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; }
          .luxury-glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; }
          .luxury-glass-strong { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; }
          .luxury-content { position: relative; z-index: 10; padding: 2rem; max-width: 1400px; margin: 0 auto; }
          .luxury-header { animation: luxury-fade-in 1s ease-out; margin-bottom: 2rem; }
          .luxury-navigation { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 2rem; margin-bottom: 1rem; }
          .luxury-back-button { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: rgba(255, 255, 255, 0.8); font-weight: 300; transition: all 0.3s ease; cursor: pointer; }
          .luxury-back-button:hover { background: rgba(255, 255, 255, 0.1); color: #26de81; transform: translateX(-2px); }
          .luxury-title { font-size: 1.5rem; font-weight: 300; color: rgba(255, 255, 255, 0.9); display: flex; align-items: center; gap: 0.5rem; }
          .luxury-actions { display: flex; gap: 1rem; }
          .luxury-button { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 400; font-size: 0.9rem; transition: all 0.3s ease; cursor: pointer; border: none; text-decoration: none; }
          .luxury-button-primary { background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%); color: #000000; box-shadow: 0 4px 20px rgba(38, 222, 129, 0.3); }
          .luxury-button-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(38, 222, 129, 0.4); }
          .luxury-button-secondary { background: rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); }
          .luxury-button-secondary:hover { background: rgba(255, 255, 255, 0.1); color: #26de81; }
          .luxury-button-connected { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
          .luxury-hero { position: relative; margin-bottom: 3rem; animation: luxury-scale-in 1s ease-out 0.2s both; }
          .luxury-cover { height: 400px; border-radius: 24px 24px 0 0; overflow: hidden; position: relative; background: linear-gradient(135deg, rgba(38, 222, 129, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%); }
          .luxury-cover img { width: 100%; height: 100%; object-fit: cover; transition: all 0.5s ease; }
          .luxury-cover:hover img { transform: scale(1.05); }
          .luxury-cover-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%); }
          .luxury-profile-picture { position: absolute; bottom: -60px; left: 2rem; width: 120px; height: 120px; border-radius: 50%; border: 4px solid rgba(255, 255, 255, 0.1); overflow: hidden; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px); }
          .luxury-profile-picture img { width: 100%; height: 100%; object-fit: cover; }
          .luxury-verified-badge { position: absolute; top: -8px; right: -8px; width: 32px; height: 32px; background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(38, 222, 129, 0.4); animation: luxury-glow 2s ease-in-out infinite; }
          .luxury-profile-header { padding: 4rem 2rem 2rem; border-radius: 0 0 24px 24px; background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-top: none; }
          .luxury-profile-info { margin-left: 140px; display: flex; justify-content: space-between; align-items: flex-start; }
          .luxury-profile-details h1 { font-size: 2.5rem; font-weight: 300; color: #ffffff; margin-bottom: 0.5rem; background: linear-gradient(135deg, #ffffff 0%, #26de81 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .luxury-profile-details .headline { font-size: 1.25rem; color: rgba(255, 255, 255, 0.7); font-weight: 300; margin-bottom: 1rem; }
          .luxury-profile-meta { display: flex; gap: 2rem; flex-wrap: wrap; color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; }
          .luxury-profile-meta span { display: flex; align-items: center; gap: 0.5rem; }
          .luxury-profile-actions { display: flex; gap: 1rem; flex-shrink: 0; }
          .luxury-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; animation: luxury-fade-in 1s ease-out 0.4s both; }
          .luxury-stat-card { padding: 1.5rem; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; transition: all 0.3s ease; }
          .luxury-stat-card:hover { background: rgba(255, 255, 255, 0.06); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3); }
          .luxury-stat-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(38, 222, 129, 0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: #26de81; }
          .luxury-stat-value { font-size: 1.5rem; font-weight: 300; color: #fff; margin-bottom: 0.25rem; }
          .luxury-stat-label { font-size: 0.8rem; color: rgba(255, 255, 255, 0.6); font-weight: 300; }
          .luxury-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 3rem; }
          .luxury-main-content { display: flex; flex-direction: column; gap: 2rem; }
          .luxury-sidebar { display: flex; flex-direction: column; gap: 2rem; }
          .luxury-card { padding: 2rem; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; transition: all 0.3s ease; animation: luxury-fade-in 1s ease-out var(--delay, 0.6s) both; }
          .luxury-card:hover { background: rgba(255, 255, 255, 0.05); transform: translateY(-2px); }
          .luxury-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
          .luxury-card-title { font-size: 1.25rem; font-weight: 300; color: rgba(255, 255, 255, 0.9); display: flex; align-items: center; gap: 0.75rem; }
          .luxury-card-action { color: #26de81; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.5rem; }
          .luxury-card-action:hover { color: #20bf6b; }
          .luxury-portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
          .luxury-portfolio-item { aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; background: rgba(255, 255, 255, 0.05); transition: all 0.3s ease; }
          .luxury-portfolio-item:hover { transform: scale(1.05); box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4); }
          .luxury-portfolio-item img { width: 100%; height: 100%; object-fit: cover; transition: all 0.3s ease; }
          .luxury-portfolio-item:hover img { transform: scale(1.1); }
          .luxury-portfolio-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%); opacity: 0; transition: all 0.3s ease; display: flex; align-items: end; padding: 1rem; }
          .luxury-portfolio-item:hover .luxury-portfolio-overlay { opacity: 1; }
          @media (max-width: 768px) { .luxury-grid { grid-template-columns: 1fr; } }
        `
      }} />

      {/* Luxury Cursor */}
      <div ref={cursorRef} className="luxury-cursor" style={{ display: window.innerWidth >= 768 ? 'block' : 'none' }} />
      {/* Luxury Background */}
      <div className="luxury-background" />
      {/* Notification */}
      {notification.show && (
        <div className={`luxury-notification ${notification.type}`}>{notification.message}</div>
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
                <Camera className="w-6 h-6 text-green-400" />
                Professional Photographer Profile
              </div>
              <div className="luxury-actions">
                {isOwnProfile && (
                  <>
                    {isEditing ? (
                      <>
                        <button className="luxury-button luxury-button-primary" onClick={handleSaveChanges} disabled={uploading}>
                          {uploading ? <div className="luxury-spinner" style={{ width: '16px', height: '16px', margin: 0 }}/> : <Check className="w-4 h-4" />}
                          {uploading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="luxury-button luxury-button-secondary" onClick={() => setIsEditing(false)}>
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button className="luxury-button luxury-button-secondary" onClick={() => setIsEditing(true)}>
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Cover Photo & Profile Picture */}
          <div className="luxury-hero">
            <div className="luxury-glass-strong">
              <div className="luxury-cover">
                {currentProfile?.coverPhoto ? (
                  <img src={currentProfile.coverPhoto.startsWith('http') ? currentProfile.coverPhoto : `http://localhost:8001${currentProfile.coverPhoto}`} alt="Cover" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(38,222,129,0.2) 0%, rgba(0,0,0,0.8) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '2rem', fontWeight: '300' }}>
                    Signature Portfolio
                  </div>
                )}
                <div className="luxury-cover-overlay" />
                {isEditing && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div {...getCoverDropzoneProps()} style={{ cursor: 'pointer', color: '#26de81', textAlign: 'center' }}>
                      <input {...getCoverInputProps()} />
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Change Cover Photo'}
                    </div>
                  </div>
                )}
              </div>
              <div className="luxury-profile-picture">
                {currentProfile?.profilePicture ? (
                  <img src={currentProfile.profilePicture.startsWith('http') ? currentProfile.profilePicture : `http://localhost:8001${currentProfile.profilePicture}`} alt={currentProfile.fullName} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                    <Camera />
                  </div>
                )}
                {isEditing && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <div {...getProfilePicDropzoneProps()} style={{ cursor: 'pointer', color: '#26de81' }}>
                      <input {...getProfilePicInputProps()} />
                      <Camera className="w-6 h-6" />
                    </div>
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
                          onChange={e => setEditData({ ...editData, fullName: e.target.value })}
                          className="luxury-form-input"
                          placeholder="Full Name"
                          style={{ fontSize: '2rem', fontWeight: '300' }}
                        />
                        <input
                          type="text"
                          value={editData.headline || ''}
                          onChange={e => setEditData({ ...editData, headline: e.target.value })}
                          className="luxury-form-input"
                          placeholder="Professional Headline"
                          style={{ fontSize: '1.25rem' }}
                        />
                        <input
                          type="text"
                          value={editData.location || ''}
                          onChange={e => setEditData({ ...editData, location: e.target.value })}
                          className="luxury-form-input"
                          placeholder="Location"
                        />
                      </div>
                    ) : (
                      <>
                        <h1>{currentProfile?.fullName || `${targetUser?.firstName} ${targetUser?.lastName}` || 'Professional Photographer'}</h1>
                        <div className="headline">{currentProfile?.headline || 'Professional Photographer & Visual Storyteller'}</div>
                        <div className="luxury-profile-meta">
                          <span><MapPin className="w-4 h-4" />{currentProfile?.location || 'Location not set'}</span>
                          <span><Users className="w-4 h-4" />{currentProfile?.connectionsCount?.toLocaleString() || '0'} connections</span>
                          <span><Eye className="w-4 h-4" />{currentProfile?.profileViews?.toLocaleString() || '0'} views</span>
                          {currentProfile?.verified && (<span style={{ color: '#26de81' }}><Check className="w-4 h-4" />Verified Professional</span>)}
                        </div>
                      </>
                    )}
                  </div>
                  {!isOwnProfile && (
                    <div className="luxury-profile-actions">
                      <button className="luxury-button luxury-button-primary" onClick={handleConnectClick} disabled={connectionStatus !== 'none'}>
                        <Users className="w-4 h-4 mr-2" />
                        {connectionStatus === 'pending' ? 'Request Sent' : connectionStatus === 'connected' ? 'Connected' : 'Connect'}
                      </button>
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
          {/* Profile Completion Meter */}
          <div className="luxury-card" style={{ margin: '2rem auto 1rem', maxWidth: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 8 }}>
              <span style={{ fontWeight: 500, color: '#26de81', fontSize: '1.1rem' }}>Profile Completion</span>
              <span style={{ color: getProfileCompletion(currentProfile || {}).percent === 100 ? '#22c55e' : '#fff', fontWeight: 600 }}>{getProfileCompletion(currentProfile || {}).percent}%</span>
            </div>
            <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: `${getProfileCompletion(currentProfile || {}).percent}%`, height: '100%', background: getProfileCompletion(currentProfile || {}).percent === 100 ? 'linear-gradient(90deg,#22c55e,#26de81)' : 'linear-gradient(90deg,#26de81,#20bf6b)', borderRadius: 8, transition: 'width 0.4s' }} />
            </div>
            {getProfileCompletion(currentProfile || {}).percent < 100 && (
              <div style={{ color: '#fff', fontSize: '0.95rem', marginTop: 4 }}>
                <span style={{ color: '#f87171', fontWeight: 500 }}>Missing:</span> {getProfileCompletion(currentProfile || {}).missing.join(', ')}
              </div>
            )}
          </div>
          {/* Portfolio Section */}
          <div className="luxury-card" style={{ '--delay': '0.6s' }}>
            <div className="luxury-card-header">
              <h2 className="luxury-card-title"><Camera className="w-5 h-5" />Portfolio</h2>
            </div>
            {profile?.photos && profile.photos.length > 0 ? (
              <div className="luxury-portfolio-grid">
                {profile.photos.map((photo, idx) => (
                  <div key={photo} className="luxury-portfolio-item">
                    <img src={photo.startsWith('http') ? photo : `http://localhost:8001${photo}`} alt={`Portfolio ${idx + 1}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="luxury-empty-state">
                <div className="luxury-empty-icon">📸</div>
                <div className="luxury-empty-title">No Portfolio Media</div>
                <div className="luxury-empty-description">This photographer hasn't uploaded any portfolio media yet</div>
              </div>
            )}
          </div>
          {/* Professional Experience */}
          <div className="luxury-card" style={{ '--delay': '0.8s' }}>
            <div className="luxury-card-header">
              <h2 className="luxury-card-title"><Award className="w-5 h-5" />Professional Experience</h2>
            </div>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select
                  value={editData.yearsExperience || ''}
                  onChange={e => setEditData({ ...editData, yearsExperience: e.target.value })}
                  className="luxury-form-input"
                >
                  <option value="">Select Years of Experience</option>
                  <option value="0-2">0-2</option>
                  <option value="2-3">2-3</option>
                  <option value="3-5">3-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-15">11-15</option>
                  <option value="15+">15+</option>
                </select>
                <textarea
                  value={editData.educationBackground || ''}
                  onChange={e => setEditData({ ...editData, educationBackground: e.target.value })}
                  className="luxury-textarea"
                  placeholder="Education Background"
                  rows={2}
                />
                <textarea
                  value={editData.certifications || ''}
                  onChange={e => setEditData({ ...editData, certifications: e.target.value })}
                  className="luxury-textarea"
                  placeholder="Certifications"
                  rows={2}
                />
                <textarea
                  value={editData.awards || ''}
                  onChange={e => setEditData({ ...editData, awards: e.target.value })}
                  className="luxury-textarea"
                  placeholder="Awards"
                  rows={2}
                />
                <textarea
                  value={editData.exhibitions || ''}
                  onChange={e => setEditData({ ...editData, exhibitions: e.target.value })}
                  className="luxury-textarea"
                  placeholder="Exhibitions"
                  rows={2}
                />
                <textarea
                  value={editData.notableClients || ''}
                  onChange={e => setEditData({ ...editData, notableClients: e.target.value })}
                  className="luxury-textarea"
                  placeholder="Notable Clients"
                  rows={2}
                />
                <textarea
                  value={editData.publications || ''}
                  onChange={e => setEditData({ ...editData, publications: e.target.value })}
                  className="luxury-textarea"
                  placeholder="Publications"
                  rows={2}
                />
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><b>Years Experience:</b> {profile?.yearsExperience || '—'}</div>
                <div><b>Education:</b> {profile?.educationBackground || '—'}</div>
                <div><b>Certifications:</b> {profile?.certifications || '—'}</div>
                <div><b>Awards:</b> {profile?.awards || '—'}</div>
                <div><b>Exhibitions:</b> {profile?.exhibitions || '—'}</div>
                <div><b>Notable Clients:</b> {profile?.notableClients || '—'}</div>
                <div><b>Publications:</b> {profile?.publications || '—'}</div>
              </div>
            )}
          </div>
          {/* Specializations */}
          <div className="luxury-card" style={{ '--delay': '0.9s' }}>
            <div className="luxury-card-header">
              <h2 className="luxury-card-title">🎯 Specializations</h2>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><b>Photography Types:</b> {(profile?.photographyTypes || []).join(', ') || '—'}</div>
              <div><b>Styles:</b> {(profile?.styles || []).join(', ') || '—'}</div>
              <div><b>Client Types:</b> {(profile?.clientTypes || []).join(', ') || '—'}</div>
            </div>
          </div>
          {/* Equipment & Technical Skills */}
          <div className="luxury-card" style={{ '--delay': '1.0s' }}>
            <div className="luxury-card-header">
              <h2 className="luxury-card-title">🛠️ Equipment & Technical Skills</h2>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><b>Camera Equipment:</b> {(profile?.cameraEquipment || []).join(', ') || '—'}</div>
              <div><b>Lens Collection:</b> {(profile?.lensCollection || []).join(', ') || '—'}</div>
              <div><b>Lighting Equipment:</b> {(profile?.lightingEquipment || []).join(', ') || '—'}</div>
              <div><b>Editing Software:</b> {(profile?.editingSoftware || []).join(', ') || '—'}</div>
              <div><b>Technical Skills:</b> {(profile?.technicalSkills || []).join(', ') || '—'}</div>
            </div>
          </div>
          {/* Studio & Services */}
          <div className="luxury-card" style={{ '--delay': '1.1s' }}>
            <div className="luxury-card-header">
              <h2 className="luxury-card-title">🏢 Studio & Services</h2>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><b>Studio Access:</b> {profile?.studioAccess || '—'}</div>
              <div><b>Studio Location:</b> {profile?.studioLocation || '—'}</div>
              <div><b>Mobile Services:</b> {profile?.mobileServices ? 'Yes' : 'No'}</div>
              <div><b>Travel Radius:</b> {profile?.travelRadius || '—'}</div>
              <div><b>Packages Offered:</b> {(profile?.packagesOffered || []).join(', ') || '—'}</div>
            </div>
          </div>
          {/* Rates & Availability */}
          <div className="luxury-card" style={{ '--delay': '1.2s' }}>
            <div className="luxury-card-header">
              <h2 className="luxury-card-title"><DollarSign className="w-5 h-5" />Rates & Availability</h2>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><b>Portrait Session:</b> {profile?.rates?.portraitSession || '—'}</div>
              <div><b>Fashion Shoot:</b> {profile?.rates?.fashionShoot || '—'}</div>
              <div><b>Commercial Day:</b> {profile?.rates?.commercialDay || '—'}</div>
              <div><b>Editorial Day:</b> {profile?.rates?.editorialDay || '—'}</div>
              <div><b>Event Hourly:</b> {profile?.rates?.eventHourly || '—'}</div>
              <div><b>Currency:</b> {profile?.rates?.currency || 'USD'}</div>
              <div><b>Availability:</b> {profile?.availability || '—'}</div>
              <div><b>Preferred Project Types:</b> {(profile?.preferredProjectTypes || []).join(', ') || '—'}</div>
              <div><b>Collaboration Style:</b> {profile?.collaborationStyle || '—'}</div>
            </div>
          </div>
          {/* Contact & Social */}
          <div className="luxury-card" style={{ '--delay': '1.3s' }}>
            <div className="luxury-card-header">
              <h2 className="luxury-card-title">📞 Contact & Social</h2>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><b>Email:</b> {profile?.email || '—'}</div>
              <div><b>Phone:</b> {profile?.phone || '—'}</div>
              <div><b>Website:</b> {profile?.website || '—'}</div>
              <div><b>Portfolio Website:</b> {profile?.portfolioWebsite || '—'}</div>
              <div><b>Instagram Business:</b> {profile?.instagramBusiness || '—'}</div>
              <div><b>Behance:</b> {profile?.behancePortfolio || '—'}</div>
              <div><b>LinkedIn:</b> {profile?.linkedinProfile || '—'}</div>
              <div><b>Instagram:</b> {profile?.socialMedia?.instagram || '—'}</div>
              <div><b>Facebook:</b> {profile?.socialMedia?.facebook || '—'}</div>
              <div><b>Twitter:</b> {profile?.socialMedia?.twitter || '—'}</div>
              <div><b>TikTok:</b> {profile?.socialMedia?.tiktok || '—'}</div>
            </div>
          </div>
          {/* Profile Completion Meter */}
          <div className="luxury-card" style={{ margin: '2rem auto 1rem', maxWidth: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 8 }}>
              <span style={{ fontWeight: 500, color: '#26de81', fontSize: '1.1rem' }}>Profile Completion</span>
              <span style={{ color: (profile?.completionPercentage === 100) ? '#22c55e' : '#fff', fontWeight: 600 }}>{profile?.completionPercentage || 0}%</span>
            </div>
            <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: `${profile?.completionPercentage || 0}%`, height: '100%', background: (profile?.completionPercentage === 100) ? 'linear-gradient(90deg,#22c55e,#26de81)' : 'linear-gradient(90deg,#26de81,#20bf6b)', borderRadius: 8, transition: 'width 0.4s' }} />
            </div>
            {profile?.completionPercentage < 100 && (
              <div style={{ color: '#fff', fontSize: '0.95rem', marginTop: 4 }}>
                <span style={{ color: '#f87171', fontWeight: 500 }}>Complete your profile for better visibility!</span>
              </div>
            )}
          </div>
          {/* Profile Stats */}
          <div className="luxury-card" style={{ '--delay': '1.4s' }}>
            <div className="luxury-card-header">
              <h2 className="luxury-card-title">📊 Profile Stats</h2>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><b>Profile Views:</b> {profile?.profileViews || 0}</div>
              <div><b>Rating:</b> {profile?.rating || '—'}</div>
              <div><b>Review Count:</b> {profile?.reviewCount || 0}</div>
              <div><b>Verified:</b> {profile?.isVerified ? 'Yes' : 'No'}</div>
            </div>
          </div>
          {/* Cropping Modal */}
          {cropModal.open && (
            <div className="luxury-modal" style={{ zIndex: 2000 }}>
              <div className="luxury-modal-content" style={{ maxWidth: 500, width: '90vw', padding: 0, background: '#111' }}>
                <div style={{ position: 'relative', width: '100%', height: 350, background: '#222', borderRadius: 12, overflow: 'hidden' }}>
                  <Cropper image={cropModal.image} crop={crop} zoom={zoom} aspect={cropModal.type === 'cover' ? 3.5 : 1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                  <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: '60%' }} />
                  <button className="luxury-button luxury-button-secondary" onClick={() => setCropModal({ open: false, image: null, type: null })}>Cancel</button>
                  <button className="luxury-button luxury-button-primary" onClick={handleCropConfirm}>Confirm</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connection Request Modal */}
      {isConnectionModalOpen && (
        <ConnectionRequestModal
          isOpen={isConnectionModalOpen}
          onClose={() => setIsConnectionModalOpen(false)}
          profile={{
            ...profile,
            fullName: profile?.fullName || `${targetUser?.firstName} ${targetUser?.lastName}`,
            professionalType: profile?.professionalType || targetUser?.professionalType
          }}
          onSendRequest={handleSendConnectionRequest}
        />
      )}
    </>
  );
};

export default PhotographerProfile;