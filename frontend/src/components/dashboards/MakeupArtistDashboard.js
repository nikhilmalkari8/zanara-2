import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, TrendingUp, Users, Calendar, Star, Heart, MessageCircle, Eye, ArrowRight, Plus, Settings,
  Bell, Search, Filter, MapPin, Clock, DollarSign, Briefcase, Award, Target, Zap, Globe, Instagram,
  Youtube, Music, User, ChevronDown, Activity, Flame, Crown, Diamond
} from 'lucide-react';

const MakeupArtistDashboard = ({ user = {}, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const cursorRef = useRef(null);
  const bgAnimationRef = useRef(null);
  const particleCountRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      if (cursorRef.current && window.innerWidth >= 768) {
        cursorRef.current.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0)`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Minimal particles like homepage
  useEffect(() => {
    if (!bgAnimationRef.current) return;
    
    const maxParticles = 3;
    let animationFrame;

    const createParticle = () => {
      if (particleCountRef.current >= maxParticles) return;
      
      const particle = document.createElement('div');
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.1 + 0.05;
      const duration = Math.random() * 40 + 30;
      
      particle.className = 'absolute rounded-full pointer-events-none will-change-transform';
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: #d4af37;
        left: ${Math.random() * 100}%;
        top: 100%;
        opacity: ${opacity};
        animation: float-up-simple ${duration}s linear infinite;
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

    const interval = setInterval(createParticle, 8000);
    
    for (let i = 0; i < 1; i++) {
      setTimeout(createParticle, i * 3000);
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Fetch real analytics data
        const token = localStorage.getItem('token');
        
        // Fetch analytics data
        const analyticsResponse = await fetch('/api/analytics/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        let analyticsData = {};
        if (analyticsResponse.ok) {
          const result = await analyticsResponse.json();
          analyticsData = result.data || {};
        } else {
          console.warn('Could not fetch analytics data, using defaults');
        }
        
        // Fetch user profile data
        const profileResponse = await fetch('/api/profile/my-complete', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        let profileData = {};
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
        }
        
        setProfile({
          userId: user,
          profilePicture: profileData.profilePicture || '/api/placeholder/150/150',
          headline: profileData.headline || 'Makeup Artist & Beauty Creative',
          location: profileData.location || 'New York, NY',
          tier: 'Professional',
          verified: profileData.verified || true,
          socialMedia: profileData.socialMedia || {
            instagram: '@makeup_pro',
            youtube: 'Beauty Channel'
          }
        });
        
        // Use real analytics data with fallbacks
        setStats({
          profileViews: analyticsData.profileViews || 0,
          applications: analyticsData.applications || 0,
          bookings: analyticsData.bookings || 0,
          portfolioPhotos: analyticsData.portfolioPhotos || 0,
          connections: analyticsData.connections || 0,
          earnings: analyticsData.earnings || 0,
          completionRate: analyticsData.completionRate || 95,
          avgRating: analyticsData.avgRating || 4.8,
          responseRate: analyticsData.responseRate || 98,
          monthlyGrowth: analyticsData.monthlyGrowth || 0,
          brandScore: analyticsData.brandScore || 92
        });
        
        // Update portfolio count in analytics (fire and forget)
        if (profileData.photos && profileData.photos.length > 0) {
          fetch('/api/analytics/portfolio-update', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              photoCount: profileData.photos.length,
              videoCount: 0
            })
          }).catch(err => console.log('Analytics update failed:', err));
        }
        
        setRecentActivity([
          { id: 1, type: 'booking', title: 'Bridal Makeup Session', client: 'Wedding Planner', time: '1 hour ago', status: 'confirmed', value: '$2,500' },
          { id: 2, type: 'view', title: 'Beauty Portfolio Featured', time: '3 hours ago', status: 'featured', value: '+650 views' },
          { id: 3, type: 'application', title: 'Fashion Show Makeup', client: 'Fashion Week', time: '1 day ago', status: 'pending', value: '$8,000' },
          { id: 4, type: 'connection', title: 'New Model Contact', time: '2 days ago', status: 'accepted', value: 'Professional' },
          { id: 5, type: 'achievement', title: 'Beauty Award Recognition', time: '4 days ago', status: 'milestone', value: 'Industry Award' }
        ]);
        
        setOpportunities([
          {
            id: 1,
            title: 'Celebrity Makeup Session',
            client: 'Entertainment Agency',
            type: 'Celebrity',
            location: 'Los Angeles, CA',
            pay: '$15,000',
            deadline: '5 days',
            match: 97,
            urgent: true,
            tier: 'Professional',
            exclusivity: 'Premium'
          },
          {
            id: 2,
            title: 'Beauty Campaign Shoot',
            client: 'Cosmetics Brand',
            type: 'Commercial',
            location: 'New York, NY',
            pay: '$12,000',
            deadline: '1 week',
            match: 93,
            urgent: false,
            tier: 'Professional',
            exclusivity: 'Invite Only'
          },
          {
            id: 3,
            title: 'Fashion Week Runway',
            client: 'Designer House',
            type: 'Runway',
            location: 'Paris, France',
            pay: '$20,000',
            deadline: '2 weeks',
            match: 95,
            urgent: false,
            tier: 'Professional',
            exclusivity: 'Exclusive'
          }
        ]);
        
        setConnections([
          { id: 1, name: 'Aria Thompson', role: 'Fashion Model', avatar: '/api/placeholder/40/40', verified: true, tier: 'Professional' },
          { id: 2, name: 'Carlos Martinez', role: 'Photographer', avatar: '/api/placeholder/40/40', verified: true, tier: 'Premium' },
          { id: 3, name: 'Emma Wilson', role: 'Beauty Brand Rep', avatar: '/api/placeholder/40/40', verified: false, tier: 'Standard' },
          { id: 4, name: 'Ryan Park', role: 'Creative Director', avatar: '/api/placeholder/40/40', verified: true, tier: 'Professional' }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback data on error
        setStats({
          profileViews: 0,
          applications: 0,
          bookings: 0,
          portfolioPhotos: 0,
          connections: 0,
          earnings: 0,
          completionRate: 95,
          avgRating: 4.8,
          responseRate: 98,
          monthlyGrowth: 0,
          brandScore: 92
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const handleViewOwnProfile = () => {
    if (user && (user._id || user.id)) {
      if (setViewingProfileId) setViewingProfileId(user._id || user.id);
      if (setCurrentPage) setCurrentPage('my-profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 via-black to-gray-800/5" />
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-yellow-500 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white/90 text-lg font-light mb-1">Loading Dashboard</div>
          <div className="text-white/40 text-sm font-light">Preparing your workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <style jsx>{`
        @keyframes float-up-simple {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .glass-effect-strong {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Minimal particles */}
      <div ref={bgAnimationRef} className="fixed inset-0 pointer-events-none z-10 overflow-hidden" />

      {/* Simple background like homepage */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 via-black to-gray-800/5" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/2 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-yellow-500/1 rounded-full blur-2xl" />
      </div>

      {/* Clean header */}
      <header className={`relative z-20 p-12 transition-all duration-1500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="glass-effect-strong rounded-2xl p-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 shadow-2xl">
                    <img 
                      src={profile?.profilePicture || '/api/placeholder/80/80'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-black"></div>
                  {profile?.verified && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-black" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="font-light text-3xl text-white/90 mb-2">
                    Welcome back, <span className="text-yellow-500 font-normal">{user?.firstName || 'Professional'}</span>
                  </h1>
                  <p className="text-white/50 font-light">Your creative workspace awaits</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('opportunities')}
                  className="px-8 py-4 glass-effect hover:bg-white/10 text-white rounded-xl font-light tracking-wide transition-all duration-500 ease-out border border-white/10 hover:border-yellow-500/30"
                >
                  View Opportunities
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacious main content */}
      <main className="relative z-20 px-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Clean stats - ALL key metrics */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 transition-all duration-1500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { label: 'Profile Views', value: stats.profileViews?.toLocaleString(), icon: Eye },
              { label: 'Monthly Revenue', value: `${stats.earnings?.toLocaleString()}`, icon: DollarSign, highlight: true },
              { label: 'Active Bookings', value: stats.bookings, icon: Calendar },
              { label: 'Profile Score', value: stats.brandScore, icon: Award }
            ].map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div
                  key={index}
                  className="glass-effect rounded-2xl p-8 min-h-32 flex flex-col justify-between transition-all duration-500 ease-out hover:bg-white/5 cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-lg ${metric.highlight ? 'bg-yellow-500/20' : 'bg-white/10'} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                    <IconComponent className={`w-5 h-5 ${metric.highlight ? 'text-yellow-500' : 'text-white/70'}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-light mb-1 ${metric.highlight ? 'text-yellow-500' : 'text-white'}`}>
                      {metric.value}
                    </div>
                    <div className="text-white/50 text-sm font-light">{metric.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secondary metrics */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 transition-all duration-1500 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { label: 'Applications', value: stats.applications, icon: Briefcase },
              { label: 'Portfolio Photos', value: stats.portfolioPhotos, icon: Camera },
              { label: 'Response Rate', value: `${stats.responseRate}%`, icon: MessageCircle },
              { label: 'Monthly Growth', value: `+${stats.monthlyGrowth}%`, icon: TrendingUp }
            ].map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div
                  key={index}
                  className="glass-effect rounded-xl p-6 transition-all duration-500 ease-out hover:bg-white/5 cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <IconComponent className="w-4 h-4 text-white/70" />
                    </div>
                    <div>
                      <div className="text-lg font-light text-white">{metric.value}</div>
                      <div className="text-white/50 text-xs font-light">{metric.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two column layout with better spacing */}
          <div className="grid grid-cols-3 gap-12">
            
            {/* Main content - 2 columns */}
            <div className="col-span-2 space-y-12">
              
              {/* Opportunities */}
              <div className={`glass-effect rounded-2xl p-10 transition-all duration-1500 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-light text-white/90 flex items-center">
                    <Briefcase className="w-6 h-6 mr-4 text-white/60" />
                    Available Opportunities
                  </h2>
                  <button 
                    onClick={() => setCurrentPage && setCurrentPage('opportunities')}
                    className="text-yellow-500 hover:text-yellow-400 transition-colors duration-300 flex items-center text-sm font-light group"
                  >
                    View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="space-y-8">
                  {opportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="glass-effect rounded-xl p-8 cursor-pointer group transition-all duration-500 ease-out hover:bg-white/5 border border-white/5 hover:border-yellow-500/20"
                      onClick={() => setCurrentPage && setCurrentPage(`opportunity-${opp.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center space-x-4">
                            <h3 className="text-white font-light text-xl group-hover:text-yellow-500 transition-colors duration-300">
                              {opp.title}
                            </h3>
                            {opp.urgent && (
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                                <Flame className="w-3 h-3 inline mr-1" />
                                Urgent
                              </span>
                            )}
                            {opp.exclusivity && (
                              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full border border-yellow-500/30">
                                {opp.exclusivity}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-white/60 font-light">{opp.client}</p>
                          
                          <div className="flex items-center space-x-8 text-sm text-white/50">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {opp.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {opp.deadline}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                              <span className="text-green-400 font-medium">{opp.pay}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-yellow-500 text-sm font-light">
                            {opp.match}% match
                          </div>
                          <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className={`glass-effect rounded-2xl p-10 transition-all duration-1500 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 className="text-2xl font-light text-white/90 mb-10 flex items-center">
                  <Activity className="w-6 h-6 mr-4 text-white/60" />
                  Recent Activity
                </h2>

                <div className="space-y-6">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          {activity.type === 'booking' && <Calendar className="w-5 h-5 text-green-400" />}
                          {activity.type === 'view' && <Eye className="w-5 h-5 text-blue-400" />}
                          {activity.type === 'application' && <Briefcase className="w-5 h-5 text-purple-400" />}
                          {activity.type === 'connection' && <Users className="w-5 h-5 text-indigo-400" />}
                          {activity.type === 'achievement' && <Award className="w-5 h-5 text-yellow-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-light mb-1">{activity.title}</p>
                          <div className="flex items-center text-white/50 text-sm font-light">
                            {activity.client && (
                              <>
                                <span>{activity.client}</span>
                                <span className="mx-2">•</span>
                              </>
                            )}
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-yellow-500 font-light text-sm">
                          {activity.value}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-light border ${
                          activity.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                          activity.status === 'featured' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          activity.status === 'milestone' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                          'bg-white/10 text-white/60 border-white/20'
                        }`}>
                          {activity.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-12">
              
              {/* Profile summary */}
              <div className={`glass-effect rounded-2xl p-8 transition-all duration-1500 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 mx-auto mb-4">
                    <img 
                      src={profile?.profilePicture || '/api/placeholder/64/64'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-white font-light text-lg mb-1">
                    {user?.fullName || 'Makeup Artist'}
                  </h3>
                  <p className="text-white/60 text-sm font-light mb-1">{profile?.headline}</p>
                  <p className="text-white/40 text-xs font-light">{profile?.location}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm font-light">Completion Rate</span>
                    <span className="text-white font-light">{stats.completionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm font-light">Average Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-white font-light">{stats.avgRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm font-light">Connections</span>
                    <span className="text-white font-light">{stats.connections?.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleViewOwnProfile}
                  className="w-full py-3 glass-effect hover:bg-white/10 text-white rounded-xl font-light transition-all duration-300 border border-white/10 hover:border-yellow-500/30"
                >
                  Edit Profile
                </button>
              </div>

              {/* Quick actions */}
              <div className={`glass-effect rounded-2xl p-8 transition-all duration-1500 delay-800 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h3 className="text-lg font-light text-white/90 mb-6">Quick Actions</h3>

                <div className="space-y-4">
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('opportunities')}
                    className="w-full p-4 glass-effect hover:bg-white/10 text-white rounded-xl font-light transition-all duration-300 flex items-center border border-white/5 hover:border-yellow-500/20"
                  >
                    <Search className="w-4 h-4 mr-3 text-white/60" />
                    Find Opportunities
                  </button>

                  <button
                    onClick={() => setCurrentPage && setCurrentPage('my-content')}
                    className="w-full p-4 glass-effect hover:bg-white/10 text-white rounded-xl font-light transition-all duration-300 flex items-center border border-white/5 hover:border-yellow-500/20"
                  >
                    <Camera className="w-4 h-4 mr-3 text-white/60" />
                    Portfolio
                  </button>

                  <button
                    onClick={() => setCurrentPage && setCurrentPage('connections')}
                    className="w-full p-4 glass-effect hover:bg-white/10 text-white rounded-xl font-light transition-all duration-300 flex items-center border border-white/5 hover:border-yellow-500/20"
                  >
                    <Users className="w-4 h-4 mr-3 text-white/60" />
                    Network
                  </button>
                </div>
              </div>

              {/* Network preview */}
              <div className={`glass-effect rounded-2xl p-8 transition-all duration-1500 delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-light text-white/90">Network</h3>
                  <span className="text-white/60 text-sm">{stats.connections?.toLocaleString()}</span>
                </div>

                <div className="space-y-4 mb-6">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center space-x-3">
                      <img 
                        src={connection.avatar}
                        alt={connection.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-white text-sm font-light truncate">{connection.name}</p>
                          {connection.verified && (
                            <Crown className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-white/50 text-xs font-light truncate">{connection.role}</p>
                      </div>
                      {connection.tier && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
                          {connection.tier}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage && setCurrentPage('connections')}
                  className="w-full py-2 text-white/60 hover:text-yellow-500 transition-colors duration-300 text-sm font-light"
                >
                  View All Connections
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Signature like homepage */}
      <div className="fixed bottom-6 left-6 text-xs text-white/20 font-light tracking-widest uppercase hidden lg:block">
        Professional Dashboard
      </div>
    </div>
  );
};

export default MakeupArtistDashboard;