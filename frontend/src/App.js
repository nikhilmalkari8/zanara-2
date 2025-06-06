// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import Home from './components/Home';
// UPDATED: Keep old registration components for backward compatibility AND add new one
import RegisterModel from './components/RegisterModel';
import RegisterCompany from './components/RegisterCompany';
import UnifiedRegister from './components/UnifiedRegister'; // NEW: Add unified registration
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import CompanyProfileSetup from './components/CompanyProfileSetup';
import Dashboard from './components/Dashboard';
import CompanyDashboard from './components/CompanyDashboard';
import Opportunities from './components/Opportunities';
import CreateOpportunity from './components/CreateOpportunity';
import OpportunityDetail from './components/OpportunityDetail';
import BrowseTalent from './components/BrowseTalent';
import Connections from './components/Connections';
import NetworkVisualization from './components/NetworkVisualization';
import ActivityFeed from './components/ActivityFeed';
import Notifications from './components/Notifications';
import NavigationHeader from './components/NavigationHeader';
// CONTENT COMPONENTS
import ContentCreator from './components/ContentCreator';
import ContentViewer from './components/ContentViewer';
import MyContent from './components/MyContent';
import ContentBrowser from './components/ContentBrowser';
// PROFILE COMPONENT
import ProfileRouter from './components/ProfileRouter';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentId, setContentId] = useState(null); // For content editing/viewing
  const [viewingProfileId, setViewingProfileId] = useState(null); // For profile viewing

  // Check if user is already logged in when app starts
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // First, get user data to determine user type
          const userResponse = await fetch('http://localhost:8001/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);

            // UPDATED: Check profile completion based on userType (talent/hiring) instead of old model/hiring
            if (userData.userType === 'talent' || userData.userType === 'model') {
              // Check if talent/model profile exists
              const profileResponse = await fetch('http://localhost:8001/api/profile/me', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (profileResponse.ok) {
                // Profile exists, go to dashboard
                setCurrentPage('dashboard');
              } else if (profileResponse.status === 404) {
                // No profile, go to profile setup
                setCurrentPage('profile-setup');
              } else {
                // Invalid token
                localStorage.removeItem('token');
                setCurrentPage('home');
              }
            } else if (userData.userType === 'hiring') {
              // Check if company profile exists
              const companyResponse = await fetch('http://localhost:8001/api/company/me/profile', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (companyResponse.ok) {
                // Company profile exists, go to company dashboard
                setCurrentPage('company-dashboard');
              } else if (companyResponse.status === 404) {
                // No company profile, go to company profile setup
                setCurrentPage('company-profile-setup');
              } else {
                // Invalid token
                localStorage.removeItem('token');
                setCurrentPage('home');
              }
            } else {
              // Unknown user type, logout
              localStorage.removeItem('token');
              setCurrentPage('home');
            }
          } else {
            // Invalid token
            localStorage.removeItem('token');
            setCurrentPage('home');
          }
        } catch (error) {
          localStorage.removeItem('token');
          setCurrentPage('home');
        }
      }
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  const handleSuccessfulLogin = async (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    
    // UPDATED: Check profile completion based on userType (talent/hiring) instead of old model/hiring
    try {
      if (userData.userType === 'talent' || userData.userType === 'model') {
        const response = await fetch('http://localhost:8001/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Profile exists, go to dashboard
          setCurrentPage('dashboard');
        } else {
          // No profile, go to profile setup
          setCurrentPage('profile-setup');
        }
      } else if (userData.userType === 'hiring') {
        const response = await fetch('http://localhost:8001/api/company/me/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Company profile exists, go to company dashboard
          setCurrentPage('company-dashboard');
        } else {
          // No company profile, go to company profile setup
          setCurrentPage('company-profile-setup');
        }
      }
    } catch (error) {
      // If error checking profile, default to appropriate profile setup
      if (userData.userType === 'talent' || userData.userType === 'model') {
        setCurrentPage('profile-setup');
      } else if (userData.userType === 'hiring') {
        setCurrentPage('company-profile-setup');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setCurrentPage('home');
  };

  const handleProfileComplete = () => {
    if (user?.userType === 'talent' || user?.userType === 'model') {
      setCurrentPage('dashboard');
    } else if (user?.userType === 'hiring') {
      setCurrentPage('company-dashboard');
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
    const previousPage = (user?.userType === 'talent' || user?.userType === 'model') ? 'dashboard' : 'company-dashboard';
    setCurrentPage(previousPage);
  };

  // PROFILE HANDLERS
  // UPDATED: Add check to ensure user and ID exist
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
    const previousPage = (user?.userType === 'talent' || user?.userType === 'model') ? 'dashboard' : 'company-dashboard';
    setCurrentPage(previousPage);
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

  // UPDATED: Show navigation header for logged-in users (except on auth pages) - include new 'register' page
  const showNavigation = user && !['home', 'login', 'register', 'register-model', 'register-company', 'profile-setup', 'company-profile-setup'].includes(currentPage);

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

      {/* Add padding-top when navigation is shown */}
      <div style={{ paddingTop: showNavigation ? '80px' : '0' }}>
        {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
        
        {/* NEW: Add unified registration route */}
        {currentPage === 'register' && (
          <UnifiedRegister setCurrentPage={setCurrentPage} />
        )}
        
        {/* KEEP: Original registration routes for backward compatibility */}
        {currentPage === 'register-model' && (
          <RegisterModel setCurrentPage={setCurrentPage} />
        )}
        
        {currentPage === 'register-company' && (
          <RegisterCompany setCurrentPage={setCurrentPage} />
        )}
        
        {currentPage === 'login' && (
          <Login setCurrentPage={setCurrentPage} onLogin={handleSuccessfulLogin} />
        )}
        
        {currentPage === 'profile-setup' && (
          <ProfileSetup 
            user={user} 
            onLogout={handleLogout} 
            onProfileComplete={handleProfileComplete}
          />
        )}
        
        {currentPage === 'company-profile-setup' && (
          <CompanyProfileSetup 
            user={user} 
            onLogout={handleLogout} 
            onProfileComplete={handleProfileComplete}
          />
        )}
        
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
          <BrowseTalent user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'connections' && (
          <Connections user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'network-visualization' && (
          <NetworkVisualization user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'my-profile' && (
        <ProfileRouter
            profileId={viewingProfileId}
            user={user}
            onBack={handleBackFromProfile}
            onConnect={() => {}} // Not needed for own profile
            onMessage={() => {}} // Not needed for own profile
        />
        )}

        {currentPage === 'view-profile' && (
        <ProfileRouter
            profileId={viewingProfileId}
            user={user}
            onBack={handleBackFromProfile}
            onConnect={handleBackFromProfile} // Refresh after connecting
            onMessage={() => setCurrentPage('messages')} // Navigate to messages
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
      </div>
    </div>
  );
}

export default App;
