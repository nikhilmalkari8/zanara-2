// frontend/src/App.js
import React, { useState, useEffect } from 'react';

// Auth Components
import Home from './components/auth/Home';
import RegisterModel from './components/auth/RegisterModel';
import RegisterCompany from './components/auth/RegisterCompany';
import UnifiedRegister from './components/auth/UnifiedRegister';
import Login from './components/auth/Login';

// Setup Components
import ModelProfileSetup from './components/setup/ModelProfileSetup';
import PhotographerProfileSetup from './components/setup/PhotographerProfileSetup';
import FashionDesignerProfileSetup from './components/setup/FashionDesignerProfileSetup';
import StylistProfileSetup from './components/setup/StylistProfileSetup';
import MakeupArtistProfileSetup from './components/setup/MakeupArtistProfileSetup';
import BrandProfileSetup from './components/setup/BrandProfileSetup';
import AgencyProfileSetup from './components/setup/AgencyProfileSetup';
import ProfileSetup from './components/setup/ProfileSetup'; // Fallback

// Dashboard Components
import ModelDashboard from './components/dashboards/ModelDashboard';
import PhotographerDashboard from './components/dashboards/PhotographerDashboard';
import FashionDesignerDashboard from './components/dashboards/FashionDesignerDashboard';
import StylistDashboard from './components/dashboards/StylistDashboard';
import MakeupArtistDashboard from './components/dashboards/MakeupArtistDashboard';
import BrandDashboard from './components/dashboards/BrandDashboard';
import AgencyDashboard from './components/dashboards/AgencyDashboard';
import Dashboard from './components/dashboards/Dashboard'; // Fallback
import CompanyDashboard from './components/dashboards/CompanyDashboard'; // Fallback

// Opportunity Components
import Opportunities from './components/opportunities/Opportunities';
import CreateOpportunity from './components/opportunities/CreateOpportunity';
import OpportunityDetail from './components/opportunities/OpportunityDetail';
import BrowseTalent from './components/opportunities/BrowseTalent';
import TalentSearch from './components/search/TalentSearch';

// Networking Components
import Connections from './components/networking/Connections';
import NetworkVisualization from './components/networking/NetworkVisualization';
import MyConnections from './components/connections/MyConnections';

// Shared Components
import ActivityFeed from './components/shared/ActivityFeed';
import Notifications from './components/shared/Notifications';
import NavigationHeader from './components/shared/NavigationHeader';

// Content Components
import ContentCreator from './components/content/ContentCreator';
import ContentViewer from './components/content/ContentViewer';
import MyContent from './components/content/MyContent';
import ContentBrowser from './components/content/ContentBrowser';

// Profile Components
import ProfileRouter from './components/profile/ProfileRouter';

import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentId, setContentId] = useState(null);
  const [viewingProfileId, setViewingProfileId] = useState(null);

  // Professional type to setup page mapping
  const getProfessionalTypeSetupPage = (professionalType) => {
    const setupMapping = {
      'model': 'model-profile-setup',
      'photographer': 'photographer-profile-setup', 
      'fashion-designer': 'designer-profile-setup',
      'stylist': 'stylist-profile-setup',
      'makeup-artist': 'makeup-artist-profile-setup',
      'brand': 'brand-profile-setup',
      'agency': 'agency-profile-setup'
    };
    
    return setupMapping[professionalType] || 'profile-setup';
  };

  // Professional type to dashboard page mapping
  const getProfessionalTypeDashboard = (userData) => {
    if (userData.userType === 'talent') {
      const dashboardMapping = {
        'model': 'model-dashboard',
        'photographer': 'photographer-dashboard',
        'fashion-designer': 'designer-dashboard',
        'stylist': 'stylist-dashboard',
        'makeup-artist': 'makeup-artist-dashboard'
      };
      return dashboardMapping[userData.professionalType] || 'dashboard';
    } else if (userData.userType === 'hiring') {
      const dashboardMapping = {
        'brand': 'brand-dashboard',
        'agency': 'agency-dashboard'
      };
      return dashboardMapping[userData.professionalType] || 'company-dashboard';
    }
    return 'dashboard'; // fallback
  };

  // Professional-type-aware profile completion check
  const checkProfileCompletion = async (userData, token) => {
    try {
      if (userData.userType === 'talent') {
        // Check if talent profile exists using professional profile endpoint
        const profileResponse = await fetch('http://localhost:8001/api/professional-profile/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileResponse.ok) {
          // Profile exists - redirect to appropriate dashboard
          const dashboardPage = getProfessionalTypeDashboard(userData);
          setCurrentPage(dashboardPage);
        } else if (profileResponse.status === 404) {
          // Profile doesn't exist - redirect to appropriate setup
          const profileSetupPage = getProfessionalTypeSetupPage(userData.professionalType);
          setCurrentPage(profileSetupPage);
        } else {
          // On any other error, redirect to setup page
          const profileSetupPage = getProfessionalTypeSetupPage(userData.professionalType);
          setCurrentPage(profileSetupPage);
        }
      } else if (userData.userType === 'hiring') {
        // Check if company profile exists (keep existing logic)
        const companyResponse = await fetch('http://localhost:8001/api/company/me/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (companyResponse.ok) {
          // Profile exists - redirect to appropriate dashboard
          const dashboardPage = getProfessionalTypeDashboard(userData);
          setCurrentPage(dashboardPage);
        } else if (companyResponse.status === 404) {
          // Profile doesn't exist - redirect to appropriate setup
          const profileSetupPage = getProfessionalTypeSetupPage(userData.professionalType);
          setCurrentPage(profileSetupPage);
        } else {
          // On any other error, redirect to setup page
          const profileSetupPage = getProfessionalTypeSetupPage(userData.professionalType);
          setCurrentPage(profileSetupPage);
        }
      } else {
        // For unknown user types, redirect to home
        localStorage.removeItem('token');
        setCurrentPage('home');
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // On error, redirect to appropriate setup page based on professional type
      const profileSetupPage = getProfessionalTypeSetupPage(userData.professionalType);
      setCurrentPage(profileSetupPage);
    }
  };

  // Check if user is already logged in when app starts
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userResponse = await fetch('http://localhost:8001/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('User data loaded:', userData); // Debug log
            setUser(userData);
            await checkProfileCompletion(userData, token);
          } else {
            localStorage.removeItem('token');
            setCurrentPage('home');
          }
        } catch (error) {
          console.error('Error checking login status:', error);
          localStorage.removeItem('token');
          setCurrentPage('home');
        }
      }
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  const handleSuccessfulLogin = async (userData, token) => {
    console.log('Successful login:', userData); // Debug log
    setUser(userData);
    localStorage.setItem('token', token);
    await checkProfileCompletion(userData, token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setCurrentPage('home');
  };

  const handleProfileComplete = () => {
    console.log('Profile completed for user:', user); // Debug log
    if (user) {
      const dashboardPage = getProfessionalTypeDashboard(user);
      setCurrentPage(dashboardPage);
    }
  };

  // CONTENT HANDLERS
  const handleCreateContent = () => {
    setContentId(null);
    setCurrentPage('content-creator');
  };

  const handleEditContent = (id) => {
    setContentId(id);
    setCurrentPage('content-creator');
  };

  const handleViewContent = (id) => {
    setContentId(id);
    setCurrentPage('content-viewer');
  };

  const handleContentSaved = () => {
    setCurrentPage('my-content');
  };

  const handleBackFromContent = () => {
    const dashboardPage = getProfessionalTypeDashboard(user);
    setCurrentPage(dashboardPage);
  };

  // PROFILE HANDLERS
  const handleViewMyProfile = () => {
    if (user && (user._id || user.id)) {
      setViewingProfileId(user._id || user.id);
      setCurrentPage('my-profile');
    }
  };

  const handleViewProfile = (profileId) => {
    setViewingProfileId(profileId);
    setCurrentPage('view-profile');
  };

  const handleBackFromProfile = () => {
    setViewingProfileId(null);
    const dashboardPage = getProfessionalTypeDashboard(user);
    setCurrentPage(dashboardPage);
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  // Handle opportunity detail pages
  if (currentPage.startsWith('opportunity-detail-')) {
    const opportunityId = currentPage.replace('opportunity-detail-', '');
    return (
      <OpportunityDetail 
        opportunityId={opportunityId}
        user={user} 
        onLogout={handleLogout} 
        setCurrentPage={setCurrentPage}
      />
    );
  }

  // Navigation visibility check
  const showNavigation = user && ![
    'home', 'login', 'register', 'register-model', 'register-company', 
    'profile-setup',
    'model-profile-setup', 'photographer-profile-setup', 'designer-profile-setup',
    'stylist-profile-setup', 'makeup-artist-profile-setup', 'brand-profile-setup', 'agency-profile-setup'
  ].includes(currentPage);

  return (
    <div className="App">
      {showNavigation && (
        <NavigationHeader 
          user={user}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogout={handleLogout}
        />
      )}

      <div style={{ paddingTop: showNavigation ? '80px' : '0' }}>
        {/* HOME & AUTH PAGES */}
        {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
        
        {currentPage === 'register' && (
          <UnifiedRegister setCurrentPage={setCurrentPage} />
        )}
        
        {currentPage === 'register-model' && (
          <RegisterModel setCurrentPage={setCurrentPage} />
        )}
        
        {currentPage === 'register-company' && (
          <RegisterCompany setCurrentPage={setCurrentPage} />
        )}
        
        {currentPage === 'login' && (
          <Login setCurrentPage={setCurrentPage} onLogin={handleSuccessfulLogin} />
        )}
        
        {/* PROFESSIONAL-SPECIFIC SETUP COMPONENTS */}
        {currentPage === 'model-profile-setup' && (
          <ModelProfileSetup
            user={user} 
            onLogout={handleLogout} 
            onProfileComplete={handleProfileComplete}
          />
        )}

        {currentPage === 'photographer-profile-setup' && (
          <PhotographerProfileSetup
            user={user} 
            onLogout={handleLogout} 
            onProfileComplete={handleProfileComplete}
          />
        )}

        {currentPage === 'designer-profile-setup' && (
          <FashionDesignerProfileSetup
            user={user} 
            onLogout={handleLogout} 
            onProfileComplete={handleProfileComplete}
          />
        )}

        {currentPage === 'stylist-profile-setup' && (
          <StylistProfileSetup
            user={user} 
            onLogout={handleLogout} 
            onProfileComplete={handleProfileComplete}
          />
        )}

        {currentPage === 'makeup-artist-profile-setup' && (
          <MakeupArtistProfileSetup
            user={user} 
            onLogout={handleLogout} 
            onProfileComplete={handleProfileComplete}
          />
        )}

        {currentPage === 'brand-profile-setup' && (
          <BrandProfileSetup
            user={user} 
            onLogout={handleLogout} 
            onProfileComplete={handleProfileComplete}
          />
        )}

        {currentPage === 'agency-profile-setup' && (
          <AgencyProfileSetup
            user={user} 
            onLogout={handleLogout} 
            onProfileComplete={handleProfileComplete}
          />
        )}

        {/* FALLBACK SETUP COMPONENT */}
        {currentPage === 'profile-setup' && (
          <ProfileSetup 
            user={user} 
            onLogout={handleLogout} 
            onProfileComplete={handleProfileComplete}
          />
        )}
        
        {/* PROFESSIONAL-SPECIFIC DASHBOARD PAGES */}
        {currentPage === 'model-dashboard' && (
          <ModelDashboard 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage}
            onViewProfile={handleViewMyProfile}
            setViewingProfileId={setViewingProfileId}
          />
        )}

        {currentPage === 'photographer-dashboard' && (
          <PhotographerDashboard 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage}
            onViewProfile={handleViewMyProfile}
            setViewingProfileId={setViewingProfileId}
          />
        )}

        {currentPage === 'designer-dashboard' && (
          <FashionDesignerDashboard 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage}
            onViewProfile={handleViewMyProfile}
            setViewingProfileId={setViewingProfileId}
          />
        )}

        {currentPage === 'stylist-dashboard' && (
          <StylistDashboard 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage}
            onViewProfile={handleViewMyProfile}
            setViewingProfileId={setViewingProfileId}
          />
        )}

        {currentPage === 'makeup-artist-dashboard' && (
          <MakeupArtistDashboard 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage}
            onViewProfile={handleViewMyProfile}
            setViewingProfileId={setViewingProfileId}
          />
        )}

        {currentPage === 'brand-dashboard' && (
          <BrandDashboard 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage}
            onViewProfile={handleViewMyProfile}
            setViewingProfileId={setViewingProfileId}
          />
        )}

        {currentPage === 'agency-dashboard' && (
          <AgencyDashboard 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage}
            onViewProfile={handleViewMyProfile}
            setViewingProfileId={setViewingProfileId}
          />
        )}
        
        {/* FALLBACK DASHBOARD PAGES */}
        {currentPage === 'dashboard' && (
          <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage}
            onViewProfile={handleViewMyProfile}
            setViewingProfileId={setViewingProfileId}
          />
        )}
        
        {currentPage === 'company-dashboard' && (
          <CompanyDashboard user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
        )}

        {/* MAIN APP FEATURES */}
        {currentPage === 'activity-feed' && (
          <ActivityFeed user={user} />
        )}

        {currentPage === 'notifications' && (
          <Notifications user={user} />
        )}

        {currentPage === 'opportunities' && (
          <Opportunities user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'create-opportunity' && (
          <CreateOpportunity user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
        )}
        
        {currentPage === 'browse-talent' && (
          <BrowseTalent 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage}
            onViewProfile={handleViewProfile}
            setViewingProfileId={setViewingProfileId}
          />
        )}

        {currentPage === 'connections' && (
          <Connections user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'network-visualization' && (
          <NetworkVisualization user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
        )}

        {/* PROFILE PAGES */}
        {currentPage === 'my-profile' && (
          <ProfileRouter
            profileId={viewingProfileId}
            user={user}
            onBack={handleBackFromProfile}
            onConnect={() => {}}
            onMessage={() => {}}
          />
        )}

        {currentPage === 'view-profile' && (
          <ProfileRouter
            profileId={viewingProfileId}
            user={user}
            onBack={handleBackFromProfile}
            onConnect={handleBackFromProfile}
            onMessage={() => setCurrentPage('messages')}
          />
        )}

        {/* CONTENT PAGES */}
        {currentPage === 'content-creator' && (
          <ContentCreator 
            user={user} 
            contentId={contentId}
            onCancel={handleBackFromContent}
            onSave={handleContentSaved}
          />
        )}

        {currentPage === 'content-viewer' && (
          <ContentViewer 
            contentId={contentId}
            user={user}
            onBack={handleBackFromContent}
            onEdit={handleEditContent}
          />
        )}

        {currentPage === 'my-content' && (
          <MyContent 
            user={user}
            onCreateNew={handleCreateContent}
            onViewContent={handleViewContent}
            onEditContent={handleEditContent}
          />
        )}

        {currentPage === 'content-browser' && (
          <ContentBrowser 
            user={user}
            onViewContent={handleViewContent}
          />
        )}

        {currentPage === 'search' && (
        <TalentSearch 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage}
            onViewProfile={handleViewProfile}
        />
        )}

        {currentPage === 'connections' && (
        <MyConnections 
            user={user} 
            onLogout={handleLogout} 
            setCurrentPage={setCurrentPage} 
        />
        )}
      </div>
    </div>
  );
}

export default App;