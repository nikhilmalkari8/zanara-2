import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import RegisterModel from './components/RegisterModel';
import RegisterCompany from './components/RegisterCompany';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import CompanyProfileSetup from './components/CompanyProfileSetup';
import Dashboard from './components/Dashboard';
import CompanyDashboard from './components/CompanyDashboard';
import Opportunities from './components/Opportunities';
import CreateOpportunity from './components/CreateOpportunity';
import OpportunityDetail from './components/OpportunityDetail';
import BrowseTalent from './components/BrowseTalent'; // Import the new component
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

            // Check profile completion based on user type
            if (userData.userType === 'model') {
              // Check if model profile exists
              const profileResponse = await fetch('http://localhost:8001/api/profile/me', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (profileResponse.ok) {
                // Model profile exists, go to model dashboard
                setCurrentPage('dashboard');
              } else if (profileResponse.status === 404) {
                // No model profile, go to model profile setup
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
    
    // Check profile completion based on user type
    try {
      if (userData.userType === 'model') {
        const response = await fetch('http://localhost:8001/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Model profile exists, go to model dashboard
          setCurrentPage('dashboard');
        } else {
          // No model profile, go to model profile setup
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
      if (userData.userType === 'model') {
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
    if (user?.userType === 'model') {
      setCurrentPage('dashboard');
    } else if (user?.userType === 'hiring') {
      setCurrentPage('company-dashboard');
    }
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

  return (
    <div className="App">
      {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
      
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
        <Dashboard user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
      )}
      
      {currentPage === 'company-dashboard' && (
        <CompanyDashboard user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
      )}

      {currentPage === 'opportunities' && (
        <Opportunities user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
      )}

      {currentPage === 'create-opportunity' && (
        <CreateOpportunity user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
      )}
      
      {/* Add the new BrowseTalent component */}
      {currentPage === 'browse-talent' && (
        <BrowseTalent user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;