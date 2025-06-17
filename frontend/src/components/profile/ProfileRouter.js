import React, { useState, useEffect } from 'react';
import ModelProfile from '../profiles/ModelProfile';
import PhotographerProfile from '../profiles/PhotographerProfile';
import FashionDesignerProfile from '../profiles/FashionDesignerProfile';
import StylistProfile from '../profiles/StylistProfile';
import MakeupArtistProfile from '../profiles/MakeupArtistProfile';
import BrandProfile from '../profiles/BrandProfile';
import AgencyProfile from '../profiles/AgencyProfile';

const ProfileRouter = ({ profileId, user, onBack, onConnect, onMessage }) => {
  const [targetUser, setTargetUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTargetUserAndProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // If profileId matches current user, use current user data
        if (profileId === user?.id || profileId === user?._id) {
          setTargetUser(user);
          // Fetch current user's professional profile
          const profileResponse = await fetch(`http://localhost:8001/api/professional-profile/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setProfileData(profileData);
          }
          setLoading(false);
          return;
        }

        // Otherwise fetch the target user first
        const userResponse = await fetch(`http://localhost:8001/api/users/${profileId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!userResponse.ok) {
          setError('User not found');
          setLoading(false);
          return;
        }
        
        const userData = await userResponse.json();
        setTargetUser(userData);

        // Then fetch their professional profile using the correct endpoint
        const profileResponse = await fetch(`http://localhost:8001/api/professional-profile/${profileId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfileData(profileData);
        } else {
          console.warn('Professional profile not found, using basic user data');
          // Set basic profile data from user info
          setProfileData({
            userId: userData._id,
            fullName: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            professionalType: userData.professionalType,
            isComplete: userData.profileComplete || false,
            bio: userData.bio || '',
            location: userData.location || ''
          });
        }
        
      } catch (error) {
        console.error('Error fetching user and profile:', error);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchTargetUserAndProfile();
    } else {
      setError('No profile ID provided');
      setLoading(false);
    }
  }, [profileId, user]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading profile...</div>
      </div>
    );
  }

  if (error || !targetUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', marginBottom: '20px', fontSize: '18px' }}>
            {error || 'Profile not found'}
          </p>
          <button onClick={onBack} style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // Route to appropriate profile component based on professional type
  const commonProps = {
    profileId,
    user,
    targetUser,
    profileData, // Pass the fetched profile data
    onBack,
    onConnect,
    onMessage
  };

  // Map professional types to their respective profile components
  switch (targetUser.professionalType) {
    case 'model':
      return <ModelProfile {...commonProps} />;
    case 'photographer':
      return <PhotographerProfile {...commonProps} />;
    case 'fashion-designer':
      return <FashionDesignerProfile {...commonProps} />;
    case 'stylist':
      return <StylistProfile {...commonProps} />;
    case 'makeup-artist':
      return <MakeupArtistProfile {...commonProps} />;
    case 'brand':
      return <BrandProfile {...commonProps} />;
    case 'agency':
      return <AgencyProfile {...commonProps} />;
    default:
      // Fallback to ModelProfile for unknown types
      console.warn(`Unknown professional type: ${targetUser.professionalType}, falling back to ModelProfile`);
      return <ModelProfile {...commonProps} />;
  }
};

export default ProfileRouter;