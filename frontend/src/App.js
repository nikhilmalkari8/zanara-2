import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import RegisterModel from './components/RegisterModel';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
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
          // Check if profile exists
          const response = await fetch('http://localhost:8001/api/profile/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            // Profile exists, go to dashboard
            const profileData = await response.json();
            setUser(profileData.userId); // User data is populated in userId field
            setCurrentPage('dashboard');
          } else if (response.status === 404) {
            // No profile, but token is valid - check user data
            const userResponse = await fetch('http://localhost:8001/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData);
              setCurrentPage('profile-setup');
            } else {
              // Invalid token
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
    
    // Check if user has completed profile
    try {
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
    } catch (error) {
      // If error checking profile, default to profile setup
      setCurrentPage('profile-setup');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setCurrentPage('home');
  };

  const handleProfileComplete = () => {
    setCurrentPage('dashboard');
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

  return (
    <div className="App">
      {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
      {currentPage === 'register-model' && <RegisterModel setCurrentPage={setCurrentPage} />}
      {currentPage === 'login' && <Login setCurrentPage={setCurrentPage} onLogin={handleSuccessfulLogin} />}
      {currentPage === 'profile-setup' && (
        <ProfileSetup 
          user={user} 
          onLogout={handleLogout} 
          onProfileComplete={handleProfileComplete}
        />
      )}
      {currentPage === 'dashboard' && <Dashboard user={user} onLogout={handleLogout} />}
    </div>
  );
}

export default App;