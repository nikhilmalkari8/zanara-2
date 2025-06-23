import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, TrendingUp, Users, Calendar, Star, Heart, MessageCircle, Eye, ArrowRight, Plus, Settings,
  Bell, Search, Filter, MapPin, Clock, DollarSign, Briefcase, Award, Target, Zap, Globe, Instagram,
  Youtube, Music, User, ChevronDown, Activity, Flame, Crown, Diamond
} from 'lucide-react';

const ModelDashboard = ({ user = {}, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('profileViews');
  const [timeFilter, setTimeFilter] = useState('week');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const cursorRef = useRef(null);
  const cursorFollowerRef = useRef(null);
  const bgAnimationRef = useRef(null);
  const metricsRef = useRef(null);
  const particleCountRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    
    // Advanced cursor tracking
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      if (cursorRef.current && window.innerWidth >= 768) {
        cursorRef.current.style.transform = `translate3d(${x - 6}px, ${y - 6}px, 0)`;
      }
      if (cursorFollowerRef.current && window.innerWidth >= 768) {
        cursorFollowerRef.current.style.transform = `translate3d(${x - 15}px, ${y - 15}px, 0)`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Premium particle system
  useEffect(() => {
    if (!bgAnimationRef.current) return;
    
    const maxParticles = 15;
    let animationFrame;

    const createParticle = () => {
      if (particleCountRef.current >= maxParticles) return;
      
      const particle = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const opacity = Math.random() * 0.6 + 0.2;
      const duration = Math.random() * 20 + 15;
      const hue = Math.random() * 30 + 35; // Gold spectrum
      
      particle.className = 'absolute rounded-full pointer-events-none will-change-transform';
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, hsla(${hue}, 85%, 65%, ${opacity}) 0%, hsla(${hue}, 85%, 65%, 0) 70%);
        left: ${Math.random() * 100}%;
        top: 100%;
        animation: float-elegant ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        box-shadow: 0 0 ${size * 3}px hsla(${hue}, 85%, 65%, 0.4);
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

    const startParticleSystem = () => {
      createParticle();
      if (particleCountRef.current < maxParticles) {
        animationFrame = requestAnimationFrame(() => {
          setTimeout(startParticleSystem, Math.random() * 2000 + 1000);
        });
      }
    };

    // Initial burst
    for (let i = 0; i < 3; i++) {
      setTimeout(createParticle, i * 500);
    }

    startParticleSystem();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setProfile({
          userId: user,
          profilePicture: '/api/placeholder/150/150',
          headline: 'Elite Fashion Model & Brand Ambassador',
          bio: 'Premium talent specializing in luxury campaigns and editorial excellence',
          height: "5'8\"",
          bodyType: 'Athletic',
          measurements: '34-24-36',
          eyeColor: 'Hazel',
          hairColor: 'Brunette',
          experience: 'Elite model with extensive experience in high-end fashion campaigns...',
          specialties: ['Luxury Editorial', 'High Fashion', 'Runway', 'Brand Campaigns'],
          location: 'New York, NY',
          tier: 'Platinum',
          verified: true,
          socialMedia: {
            instagram: '@elite_model',
            tiktok: '@fashion_icon',
            youtube: 'Elite Fashion Channel'
          }
        });
        
        setStats({
          profileViews: 28470,
          applications: 45,
          bookings: 23,
          portfolioPhotos: 89,
          connections: 1560,
          earnings: 185000,
          completionRate: 98,
          avgRating: 4.95,
          responseRate: 99,
          monthlyGrowth: 34,
          brandScore: 92
        });
        
        setRecentActivity([
          { id: 1, type: 'booking', title: 'Luxury Campaign Confirmed', client: 'Chanel', time: '1 hour ago', status: 'confirmed', value: '$25,000' },
          { id: 2, type: 'view', title: 'Profile Featured in Elite Showcase', time: '3 hours ago', status: 'featured', value: '+2.5K views' },
          { id: 3, type: 'application', title: 'Dior Campaign Application', client: 'Dior', time: '6 hours ago', status: 'pending', value: '$40,000' },
          { id: 4, type: 'connection', title: 'Elite Photographer Connection', time: '12 hours ago', status: 'accepted', value: 'Tier 1' },
          { id: 5, type: 'achievement', title: 'Platinum Status Achieved', time: '1 day ago', status: 'milestone', value: 'Top 1%' }
        ]);
        
        setOpportunities([
          {
            id: 1,
            title: 'Global Luxury Campaign',
            client: 'Louis Vuitton',
            type: 'Commercial',
            location: 'Paris, Milan, NYC',
            pay: '$75,000',
            deadline: '48 hours',
            match: 98,
            urgent: true,
            tier: 'Platinum',
            exclusivity: 'Invite Only'
          },
          {
            id: 2,
            title: 'Vogue Cover Story',
            client: 'Vogue International',
            type: 'Editorial',
            location: 'London, UK',
            pay: '$45,000',
            deadline: '3 days',
            match: 95,
            tier: 'Elite',
            exclusivity: 'Premium'
          },
          {
            id: 3,
            title: 'Fashion Week Exclusive',
            client: 'Versace',
            type: 'Runway',
            location: 'Milan, Italy',
            pay: '$60,000',
            deadline: '1 week',
            match: 93,
            tier: 'Platinum',
            exclusivity: 'VIP'
          }
        ]);
        
        setConnections([
          { id: 1, name: 'Alessandro Ricci', role: 'Creative Director', avatar: '/api/placeholder/40/40', verified: true, tier: 'Elite' },
          { id: 2, name: 'Victoria Chen', role: 'Fashion Editor', avatar: '/api/placeholder/40/40', verified: true, tier: 'Premium' },
          { id: 3, name: 'Marcus Laurent', role: 'Luxury Brand Manager', avatar: '/api/placeholder/40/40', verified: true, tier: 'Elite' },
          { id: 4, name: 'Isabella Monroe', role: 'Celebrity Stylist', avatar: '/api/placeholder/40/40', verified: true, tier: 'Platinum' }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4 text-accent-gold" />;
      case 'view': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'application': return <Briefcase className="w-4 h-4 text-purple-400" />;
      case 'connection': return <Users className="w-4 h-4 text-green-400" />;
      case 'achievement': return <Crown className="w-4 h-4 text-accent-gold" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMatchColor = (match) => {
    if (match >= 95) return 'text-accent-gold';
    if (match >= 90) return 'text-green-400';
    if (match >= 85) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum': return 'from-accent-gold to-yellow-300';
      case 'Elite': return 'from-purple-400 to-indigo-400';
      case 'Premium': return 'from-blue-400 to-cyan-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-black via-accent-gold/5 to-primary-black"></div>
        <div className="relative z-10 text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-4 border-4 border-accent-gold/20 border-b-accent-gold/60 rounded-full animate-spin animate-reverse"></div>
          </div>
          <div className="text-soft-white text-2xl font-light mb-2">Initializing Zanara Dashboard</div>
          <div className="text-accent-gold/80 text-sm">Curating your premium experience...</div>
          <div className="mt-8 flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-accent-gold rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-black text-soft-white relative overflow-hidden cursor-none">
      {/* Enhanced CSS */}
      <style jsx>{`
        @keyframes float-elegant {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
        }
        
        @keyframes metric-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 215, 0, 0.1);
        }
        
        .glass-morphism-strong {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 215, 0, 0.2);
        }
        
        .metric-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .metric-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px rgba(255, 215, 0, 0.15);
        }
        
        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
          transition: left 0.5s;
        }
        
        .metric-card:hover::before {
          left: 100%;
        }
        
        .opportunity-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .opportunity-card:hover {
          background: rgba(255, 215, 0, 0.05);
          border-color: rgba(255, 215, 0, 0.2);
          transform: translateY(-2px);
        }
        
        .scrollbar-gold::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-gold::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        
        .scrollbar-gold::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #FFD700, #FFA500);
          border-radius: 3px;
        }
        
        .scrollbar-gold::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #FFED4E, #FFD700);
        }
        
        .animate-reverse {
          animation-direction: reverse;
        }
        
        .cursor-none {
          cursor: none;
        }
        
        .mix-blend-difference {
          mix-blend-mode: difference;
        }
      `}</style>

      {/* Custom Cursor */}
      <div 
        ref={cursorRef}
        className="fixed w-3 h-3 bg-accent-gold rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block transition-transform duration-75 ease-out"
      />
      <div 
        ref={cursorFollowerRef}
        className="fixed w-8 h-8 border border-accent-gold/40 rounded-full pointer-events-none z-40 hidden md:block transition-transform duration-150 ease-out"
      />

      {/* Floating Particles */}
      <div ref={bgAnimationRef} className="fixed inset-0 pointer-events-none z-10" />

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-black via-accent-gold/3 to-primary-black"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-gold/5 rounded-full blur-2xl"></div>

      {/* Header */}
      <header className={`relative z-20 p-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="glass-morphism-strong rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent-gold/50 shadow-lg">
                    <img 
                      src={profile?.profilePicture || '/api/placeholder/80/80'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-primary-black flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                  {profile?.verified && (
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-accent-gold rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-primary-black" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-light text-soft-white mb-1">
                    Welcome back, <span className="font-medium bg-gradient-to-r from-accent-gold to-yellow-300 bg-clip-text text-transparent">{user?.firstName || 'Elite Model'}</span>
                    <span className="ml-2 text-2xl">✦</span>
                  </h1>
                  <div className="flex items-center space-x-4">
                    <p className="text-accent-gold/80">Your luxury empire awaits</p>
                    {profile?.tier && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTierColor(profile.tier)} text-primary-black`}>
                        {profile.tier} Tier
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-4 glass-morphism rounded-xl hover:bg-white/10 transition-all duration-300 group"
                >
                  <Bell className="w-5 h-5 text-soft-white group-hover:text-accent-gold transition-colors" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentPage && setCurrentPage('opportunities')}
                  className="px-8 py-4 bg-gradient-to-r from-accent-gold to-yellow-300 text-primary-black rounded-xl font-semibold hover:from-yellow-300 hover:to-accent-gold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent-gold/25"
                >
                  <Target className="w-5 h-5 inline mr-2" />
                  Elite Opportunities
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="relative z-20 p-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Enhanced Metrics Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1200 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} ref={metricsRef}>
            {[
              { key: 'profileViews', label: 'Profile Views', value: stats.profileViews?.toLocaleString(), icon: Eye, color: 'from-blue-400 via-cyan-400 to-blue-500', change: '+34%', trend: 'up' },
              { key: 'earnings', label: 'Monthly Revenue', value: `$${stats.earnings?.toLocaleString()}`, icon: DollarSign, color: 'from-accent-gold via-yellow-300 to-accent-gold', change: '+42%', trend: 'up' },
              { key: 'bookings', label: 'Elite Bookings', value: stats.bookings, icon: Calendar, color: 'from-emerald-400 via-green-400 to-emerald-500', change: '+28%', trend: 'up' },
              { key: 'brandScore', label: 'Brand Score', value: stats.brandScore, icon: Crown, color: 'from-purple-400 via-pink-400 to-purple-500', change: '+15%', trend: 'up' }
            ].map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div
                  key={metric.key}
                  onClick={() => setActiveMetric(metric.key)}
                  className={`metric-card glass-morphism rounded-2xl p-6 cursor-pointer group ${
                    activeMetric === metric.key ? 'ring-2 ring-accent-gold/50 bg-accent-gold/5' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                      metric.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      <span>{metric.change}</span>
                    </div>
                  </div>
                  <div className="text-3xl font-light text-soft-white mb-2 group-hover:text-accent-gold transition-colors duration-300">
                    {metric.value}
                  </div>
                  <div className="text-soft-white/70 text-sm font-light">{metric.label}</div>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Opportunities & Activity */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Elite Opportunities */}
              <div className={`glass-morphism rounded-2xl p-8 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-light text-soft-white flex items-center">
                    <Diamond className="w-8 h-8 mr-4 text-accent-gold" />
                    Elite Opportunities
                    <span className="ml-3 px-3 py-1 bg-accent-gold/20 text-accent-gold text-sm rounded-full">
                      {opportunities.length} Available
                    </span>
                  </h2>
                  <button 
                    onClick={() => setCurrentPage && setCurrentPage('opportunities')}
                    className="text-accent-gold hover:text-yellow-300 transition-colors duration-300 flex items-center text-sm font-medium group"
                  >
                    View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="space-y-4">
                  {opportunities.map((opp, index) => (
                    <div
                      key={opp.id}
                      className="opportunity-card rounded-xl p-6 cursor-pointer group"
                      onClick={() => setCurrentPage && setCurrentPage(`opportunity-${opp.id}`)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-soft-white font-semibold text-lg group-hover:text-accent-gold transition-colors">
                              {opp.title}
                            </h3>
                            {opp.urgent && (
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 animate-pulse">
                                <Flame className="w-3 h-3 inline mr-1" />
                                Urgent
                              </span>
                            )}
                            {opp.exclusivity && (
                              <span className="px-3 py-1 bg-accent-gold/20 text-accent-gold text-xs rounded-full border border-accent-gold/30">
                                {opp.exclusivity}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-4">
                            <span className="text-accent-gold font-medium">{opp.client}</span>
                            <span className="w-1 h-1 bg-soft-white/40 rounded-full"></span>
                            <span className={`text-sm font-medium ${getMatchColor(opp.match)}`}>
                              {opp.match}% Match
                            </span>
                            {opp.tier && (
                              <>
                                <span className="w-1 h-1 bg-soft-white/40 rounded-full"></span>
                                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(opp.tier)} text-primary-black font-medium`}>
                                  {opp.tier}
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm text-soft-white/70">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-accent-gold/60" />
                              {opp.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-accent-gold/60" />
                              {opp.deadline}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                              <span className="text-green-400 font-semibold">{opp.pay}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button className="p-3 hover:bg-accent-gold/10 rounded-lg transition-all duration-300 group-hover:scale-110">
                          <ArrowRight className="w-5 h-5 text-accent-gold" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Activity Feed */}
              <div className={`glass-morphism rounded-2xl p-8 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-light text-soft-white flex items-center">
                    <Activity className="w-8 h-8 mr-4 text-accent-gold" />
                    Recent Activity
                  </h2>
                  <select 
                    value={timeFilter} 
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="bg-white/5 border border-accent-gold/20 rounded-lg px-4 py-2 text-soft-white text-sm focus:outline-none focus:border-accent-gold/60 focus:bg-white/10 transition-all duration-300"
                  >
                    <option value="day">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-gold">
                  {recentActivity.map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center space-x-4 p-4 hover:bg-white/5 rounded-xl transition-all duration-300 group cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-shrink-0 relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-gold/20 to-yellow-300/20 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-black rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-soft-white font-medium truncate group-hover:text-accent-gold transition-colors">
                            {activity.title}
                          </p>
                          {activity.value && (
                            <span className="text-accent-gold text-sm font-semibold">
                              {activity.value}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-soft-white/60 text-sm">
                          {activity.client && (
                            <>
                              <span className="text-accent-gold/80">{activity.client}</span>
                              <span className="mx-2">•</span>
                            </>
                          )}
                          <span>{activity.time}</span>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        activity.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        activity.status === 'featured' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        activity.status === 'milestone' ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {activity.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Profile & Network */}
            <div className="space-y-8">
              
              {/* Enhanced Profile Status */}
              <div className={`glass-morphism rounded-2xl p-8 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-light text-soft-white flex items-center">
                    <User className="w-6 h-6 mr-3 text-accent-gold" />
                    Profile Elite
                  </h2>
                  <button
                    onClick={handleViewOwnProfile}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300 group"
                  >
                    <Settings className="w-5 h-5 text-soft-white/60 group-hover:text-accent-gold transition-colors" />
                  </button>
                </div>

                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-accent-gold/50 mx-auto mb-4 shadow-lg">
                      <img 
                        src={profile?.profilePicture || '/api/placeholder/96/96'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full font-semibold">
                      {stats.completionRate}% Complete
                    </div>
                    {profile?.verified && (
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-accent-gold rounded-full flex items-center justify-center shadow-lg">
                        <Crown className="w-4 h-4 text-primary-black" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-soft-white font-semibold text-lg mb-1">
                    {user?.fullName || 'Elite Model'}
                  </h3>
                  <p className="text-accent-gold/80 text-sm mb-2">{profile?.headline}</p>
                  <p className="text-soft-white/60 text-xs">{profile?.location}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-soft-white/70">Portfolio Assets</span>
                    <span className="text-soft-white font-semibold">{stats.portfolioPhotos}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-soft-white/70">Elite Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-accent-gold fill-current mr-1" />
                      <span className="text-accent-gold font-semibold">{stats.avgRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-soft-white/70">Response Excellence</span>
                    <span className="text-green-400 font-semibold">{stats.responseRate}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-soft-white/70">Monthly Growth</span>
                    <span className="text-accent-gold font-semibold">+{stats.monthlyGrowth}%</span>
                  </div>
                </div>

                <button
                  onClick={handleViewOwnProfile}
                  className="w-full py-4 bg-gradient-to-r from-accent-gold to-yellow-300 text-primary-black rounded-xl font-semibold hover:from-yellow-300 hover:to-accent-gold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Optimize Profile
                </button>
              </div>

              {/* Elite Network */}
              <div className={`glass-morphism rounded-2xl p-8 transition-all duration-1000 delay-800 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-light text-soft-white flex items-center">
                    <Globe className="w-6 h-6 mr-3 text-accent-gold" />
                    Elite Network
                  </h2>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('connections')}
                    className="text-accent-gold hover:text-yellow-300 transition-colors duration-300 text-sm font-medium"
                  >
                    Manage
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-light text-soft-white mb-1">{stats.connections?.toLocaleString()}</div>
                    <div className="text-soft-white/60 text-xs">Elite Connections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-accent-gold mb-1">25</div>
                    <div className="text-soft-white/60 text-xs">Premium Requests</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {connections.slice(0, 4).map((connection, index) => (
                    <div 
                      key={connection.id} 
                      className="flex items-center space-x-4 p-3 hover:bg-white/5 rounded-xl transition-all duration-300 cursor-pointer group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative">
                        <img 
                          src={connection.avatar}
                          alt={connection.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-accent-gold/30"
                        />
                        {connection.verified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-gold rounded-full border-2 border-primary-black flex items-center justify-center">
                            <Crown className="w-2 h-2 text-primary-black" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-soft-white font-medium truncate group-hover:text-accent-gold transition-colors">
                            {connection.name}
                          </p>
                          {connection.tier && (
                            <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(connection.tier)} text-primary-black font-medium`}>
                              {connection.tier}
                            </span>
                          )}
                        </div>
                        <p className="text-soft-white/60 text-sm truncate">{connection.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage && setCurrentPage('connections')}
                  className="w-full mt-6 py-3 border border-accent-gold/30 text-accent-gold rounded-xl hover:bg-accent-gold/10 transition-all duration-300 text-sm font-medium"
                >
                  Expand Network
                </button>
              </div>

              {/* Premium Actions */}
              <div className={`glass-morphism rounded-2xl p-8 transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 className="text-2xl font-light text-soft-white mb-8 flex items-center">
                  <Zap className="w-6 h-6 mr-3 text-accent-gold" />
                  Quick Actions
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleViewOwnProfile}
                    className="p-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex flex-col items-center space-y-3 shadow-lg"
                  >
                    <Settings className="w-6 h-6" />
                    <span className="text-sm">Edit Profile</span>
                  </button>

                  <button
                    onClick={() => setCurrentPage && setCurrentPage('opportunities')}
                    className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex flex-col items-center space-y-3 shadow-lg"
                  >
                    <Search className="w-6 h-6" />
                    <span className="text-sm">Find Elite Jobs</span>
                  </button>

                  <button
                    onClick={() => setCurrentPage && setCurrentPage('connections')}
                    className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex flex-col items-center space-y-3 shadow-lg"
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Network</span>
                  </button>

                  <button
                    onClick={() => setCurrentPage && setCurrentPage('my-content')}
                    className="p-6 bg-gradient-to-r from-accent-gold to-yellow-300 hover:from-yellow-300 hover:to-accent-gold text-primary-black rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex flex-col items-center space-y-3 shadow-lg"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm">Portfolio</span>
                  </button>
                </div>
              </div>

              {/* Social Media Presence */}
              {profile?.socialMedia && Object.values(profile.socialMedia).some(Boolean) && (
                <div className={`glass-morphism rounded-2xl p-8 transition-all duration-1000 delay-1200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h2 className="text-2xl font-light text-soft-white mb-8 flex items-center">
                    <Globe className="w-6 h-6 mr-3 text-accent-gold" />
                    Social Presence
                  </h2>

                  <div className="space-y-4">
                    {profile.socialMedia.instagram && (
                      <a
                        href={
                          profile.socialMedia.instagram.startsWith('http')
                            ? profile.socialMedia.instagram
                            : `https://instagram.com/${profile.socialMedia.instagram.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 rounded-xl transition-all duration-300 border border-pink-500/20 hover:border-pink-500/40 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Instagram className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-soft-white font-medium">Instagram</div>
                            <div className="text-soft-white/60 text-sm">{profile.socialMedia.instagram}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}

                    {profile.socialMedia.tiktok && (
                      <a
                        href={
                          profile.socialMedia.tiktok.startsWith('http')
                            ? profile.socialMedia.tiktok
                            : `https://tiktok.com/@${profile.socialMedia.tiktok.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-500/10 to-black/10 hover:from-gray-500/20 hover:to-black/20 rounded-xl transition-all duration-300 border border-gray-500/20 hover:border-gray-500/40 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-black rounded-lg flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-soft-white font-medium">TikTok</div>
                            <div className="text-soft-white/60 text-sm">{profile.socialMedia.tiktok}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}

                    {profile.socialMedia.youtube && (
                      <a
                        href={
                          profile.socialMedia.youtube.startsWith('http')
                            ? profile.socialMedia.youtube
                            : `https://youtube.com/${profile.socialMedia.youtube}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 rounded-xl transition-all duration-300 border border-red-500/20 hover:border-red-500/40 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                            <Youtube className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-soft-white font-medium">YouTube</div>
                            <div className="text-soft-white/60 text-sm">{profile.socialMedia.youtube}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Performance Analytics */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-1400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            {/* Performance Metrics */}
            <div className="glass-morphism rounded-2xl p-8">
              <h3 className="text-xl font-light text-soft-white mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-accent-gold" />
                Performance Analytics
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-soft-white/70 text-sm">Profile Engagement</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-gradient-to-r from-accent-gold to-yellow-300 rounded-full"></div>
                    </div>
                    <span className="text-soft-white text-sm font-semibold">89%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-soft-white/70 text-sm">Booking Success Rate</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                    </div>
                    <span className="text-soft-white text-sm font-semibold">94%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-soft-white/70 text-sm">Client Satisfaction</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                    <span className="text-soft-white text-sm font-semibold">98%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Elite Achievements */}
            <div className="glass-morphism rounded-2xl p-8">
              <h3 className="text-xl font-light text-soft-white mb-6 flex items-center">
                <Award className="w-6 h-6 mr-3 text-accent-gold" />
                Elite Achievements
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-accent-gold/10 rounded-lg border border-accent-gold/20">
                  <div className="w-10 h-10 bg-accent-gold/20 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-accent-gold" />
                  </div>
                  <div>
                    <div className="text-soft-white font-medium">Platinum Elite</div>
                    <div className="text-soft-white/60 text-xs">Top 1% performer globally</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-soft-white font-medium">Brand Favorite</div>
                    <div className="text-soft-white/60 text-xs">Preferred by luxury brands</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-soft-white font-medium">Rising Icon</div>
                    <div className="text-soft-white/60 text-xs">342% engagement growth</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Elite Events */}
            <div className="glass-morphism rounded-2xl p-8">
              <h3 className="text-xl font-light text-soft-white mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-accent-gold" />
                Elite Calendar
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-accent-gold/10 rounded-lg border border-accent-gold/20">
                  <div className="w-3 h-3 bg-accent-gold rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-soft-white font-medium">Chanel Campaign</div>
                    <div className="text-soft-white/60 text-sm">Tomorrow at 9:00 AM</div>
                    <div className="text-accent-gold text-xs font-semibold">Luxury Shoot • Paris</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-soft-white font-medium">Vogue Editorial</div>
                    <div className="text-soft-white/60 text-sm">Friday at 1:00 PM</div>
                    <div className="text-blue-400 text-xs font-semibold">Cover Story • London</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="w-3 h-3 bg-purple-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-soft-white font-medium">Milan Fashion Week</div>
                    <div className="text-soft-white/60 text-sm">Next Week</div>
                    <div className="text-purple-400 text-xs font-semibold">Exclusive Shows • Milan</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentPage && setCurrentPage('calendar')}
                className="w-full mt-6 py-3 border border-accent-gold/30 text-accent-gold rounded-xl hover:bg-accent-gold/10 transition-all duration-300 text-sm font-medium"
              >
                View Elite Calendar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModelDashboard;