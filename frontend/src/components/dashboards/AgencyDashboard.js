import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, TrendingUp, Users, Calendar, Star, Heart, MessageCircle, Eye, ArrowRight, Plus, Settings,
  Bell, Search, Filter, MapPin, Clock, DollarSign, Briefcase, Award, Target, Zap, Globe, Instagram,
  Youtube, Music, User, ChevronDown, Activity, Flame, Crown, Diamond, Building2, UserCheck, BarChart3
} from 'lucide-react';

const AgencyDashboard = ({ user = {}, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
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
        
        setProfile({
          userId: user,
          profilePicture: '/api/placeholder/150/150',
          headline: 'Elite Talent Agency & Representation',
          location: 'Los Angeles, CA',
          tier: 'Elite',
          verified: true,
          socialMedia: {
            instagram: '@agency_elite',
            youtube: 'Agency Channel'
          }
        });
        
        // Use real analytics data with agency-specific metrics
        const agencyMetrics = analyticsData.agencyMetrics || {};
        setStats({
          talentRosterSize: agencyMetrics.talentRosterSize || analyticsData.talentRosterSize || 0,
          activePlacements: agencyMetrics.activePlacements || analyticsData.activePlacements || 0,
          clientRelationships: agencyMetrics.clientRelationships || analyticsData.clientRelationships || 0,
          commissionRevenue: agencyMetrics.commissionRevenue || analyticsData.earnings || 0,
          bookingSuccessRate: agencyMetrics.bookingSuccessRate || 85,
          connections: analyticsData.connections || 0,
          completedBookings: analyticsData.bookings || 0,
          avgRating: analyticsData.avgRating || 4.9,
          responseRate: analyticsData.responseRate || 98,
          monthlyGrowth: analyticsData.monthlyGrowth || 0,
          agencyScore: agencyMetrics.agencyScore || 90
        });
        
        setRecentActivity([
          { id: 1, type: 'placement', title: 'Model Placement Confirmed', client: 'Fashion Brand', time: '30 minutes ago', status: 'confirmed', value: '$35,000' },
          { id: 2, type: 'talent', title: 'New Talent Signed', time: '2 hours ago', status: 'signed', value: 'Premium Model' },
          { id: 3, type: 'casting', title: 'Casting Call Responses', client: 'Production House', time: '4 hours ago', status: 'active', value: '47 submissions' },
          { id: 4, type: 'client', title: 'New Client Partnership', time: '1 day ago', status: 'accepted', value: 'Elite Brand' },
          { id: 5, type: 'achievement', title: 'Monthly Placement Goal Reached', time: '2 days ago', status: 'milestone', value: '150% target' }
        ]);
        
        setOpportunities([
          {
            id: 1,
            title: 'High Fashion Editorial',
            client: 'Luxury Magazine',
            type: 'Editorial',
            location: 'Paris, France',
            pay: '$45,000',
            deadline: '4 days',
            match: 98,
            urgent: true,
            tier: 'Elite',
            exclusivity: 'Agency Exclusive'
          },
          {
            id: 2,
            title: 'Commercial Campaign Casting',
            client: 'Global Brand',
            type: 'Commercial',
            location: 'New York, NY',
            pay: '$60,000',
            deadline: '1 week',
            match: 95,
            urgent: false,
            tier: 'Premium',
            exclusivity: 'Invite Only'
          },
          {
            id: 3,
            title: 'Celebrity Event Coverage',
            client: 'Entertainment Group',
            type: 'Event',
            location: 'Los Angeles, CA',
            pay: '$28,000',
            deadline: '10 days',
            match: 92,
            urgent: false,
            tier: 'Professional',
            exclusivity: 'Premium'
          }
        ]);
        
        setConnections([
          { id: 1, name: 'Elite Models Inc.', role: 'Partner Agency', avatar: '/api/placeholder/40/40', verified: true, tier: 'Elite' },
          { id: 2, name: 'Creative Productions', role: 'Production House', avatar: '/api/placeholder/40/40', verified: true, tier: 'Premium' },
          { id: 3, name: 'Fashion Forward', role: 'Fashion Brand', avatar: '/api/placeholder/40/40', verified: false, tier: 'Professional' },
          { id: 4, name: 'Global Casting', role: 'Casting Director', avatar: '/api/placeholder/40/40', verified: true, tier: 'Elite' }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback data on error
        setStats({
          talentRosterSize: 0,
          activePlacements: 0,
          clientRelationships: 0,
          commissionRevenue: 0,
          bookingSuccessRate: 85,
          connections: 0,
          completedBookings: 0,
          avgRating: 4.9,
          responseRate: 98,
          monthlyGrowth: 0,
          agencyScore: 90
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
          <div className="text-white/90 text-lg font-light mb-1">Loading Agency Hub</div>
          <div className="text-white/40 text-sm font-light">Preparing your command center...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div ref={bgAnimationRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 via-black to-gray-800/10" />
      </div>

      {/* Custom Cursor */}
      <div 
        ref={cursorRef}
        className="fixed w-1.5 h-1.5 bg-yellow-500/60 rounded-full pointer-events-none z-50 mix-blend-difference transition-opacity duration-300 hidden md:block"
        style={{ willChange: 'transform' }}
      />

      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-gray-900/40 to-gray-800/20 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                    <Building2 className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />
                  </div>
                  {profile?.verified && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-light text-white mb-2">
                    Welcome back, <span className="text-purple-500 font-medium">{user?.firstName || 'Agency'}</span>
                  </h1>
                  <p className="text-white/60 text-sm md:text-base font-light">
                    {profile?.headline || 'Agency Command Center'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-400 font-medium">
                      <Diamond className="w-3 h-3" />
                      {profile?.tier || 'Elite'}
                    </span>
                    <span className="text-white/40 text-xs">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {profile?.location || 'Global'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('create-opportunity')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Post Casting Call
                </button>
                <button
                  onClick={handleViewOwnProfile}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Settings className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Talent Roster', value: stats.talentRosterSize, icon: Users, color: 'text-purple-500', bg: 'from-purple-500/10 to-pink-500/5' },
              { label: 'Active Placements', value: stats.activePlacements, icon: UserCheck, color: 'text-blue-500', bg: 'from-blue-500/10 to-cyan-500/5' },
              { label: 'Client Relations', value: stats.clientRelationships, icon: Briefcase, color: 'text-green-500', bg: 'from-green-500/10 to-emerald-500/5' },
              { label: 'Success Rate', value: `${stats.bookingSuccessRate}%`, icon: TrendingUp, color: 'text-yellow-500', bg: 'from-yellow-500/10 to-orange-500/5' },
              { label: 'Commission Revenue', value: `$${(stats.commissionRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-500', bg: 'from-emerald-500/10 to-green-500/5' },
              { label: 'Agency Score', value: stats.agencyScore, icon: Award, color: 'text-orange-500', bg: 'from-orange-500/10 to-red-500/5' }
            ].map((stat, index) => (
              <div key={index} className={`bg-gradient-to-br ${stat.bg} backdrop-blur-xl border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div className={`text-lg font-semibold ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
                <div className="text-white/60 text-xs font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-white flex items-center gap-3">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Agency Activity
                </h2>
                <button className="text-white/40 hover:text-white/60 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-all duration-300 hover:border-white/10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.type === 'placement' ? 'bg-purple-500/10 border border-purple-500/20' :
                      activity.type === 'talent' ? 'bg-blue-500/10 border border-blue-500/20' :
                      activity.type === 'casting' ? 'bg-green-500/10 border border-green-500/20' :
                      activity.type === 'client' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                      'bg-orange-500/10 border border-orange-500/20'
                    }`}>
                      {activity.type === 'placement' ? <UserCheck className="w-4 h-4 text-purple-500" /> :
                       activity.type === 'talent' ? <Users className="w-4 h-4 text-blue-500" /> :
                       activity.type === 'casting' ? <Camera className="w-4 h-4 text-green-500" /> :
                       activity.type === 'client' ? <Briefcase className="w-4 h-4 text-yellow-500" /> :
                       <Award className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-medium text-sm">{activity.title}</h3>
                        <span className="text-white/40 text-xs">{activity.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-white/60 text-xs">{activity.client}</p>
                        <span className={`text-xs font-medium ${
                          activity.status === 'confirmed' || activity.status === 'signed' ? 'text-green-400' :
                          activity.status === 'active' ? 'text-blue-400' :
                          activity.status === 'accepted' ? 'text-purple-400' :
                          'text-orange-400'
                        }`}>
                          {activity.value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Castings */}
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light text-white flex items-center gap-3">
                  <Camera className="w-5 h-5 text-purple-500" />
                  Active Castings
                </h2>
                <button 
                  onClick={() => setCurrentPage('opportunities')}
                  className="text-white/40 hover:text-white/60 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {opportunities.slice(0, 3).map((opportunity) => (
                  <div key={opportunity.id} className="p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-all duration-300 hover:border-white/10 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium text-sm leading-tight">{opportunity.title}</h3>
                      {opportunity.urgent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-xs text-red-400 font-medium">
                          <Flame className="w-3 h-3" />
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">{opportunity.type}</span>
                      <span className="text-purple-400 font-medium">{opportunity.pay}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-white/40">{opportunity.location}</span>
                      <span className="text-white/60">{opportunity.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Network */}
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light text-white flex items-center gap-3">
                  <Globe className="w-5 h-5 text-purple-500" />
                  Industry Network
                </h2>
                <button 
                  onClick={() => setCurrentPage('connections')}
                  className="text-white/40 hover:text-white/60 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {connections.map((connection) => (
                  <div key={connection.id} className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-all duration-300 hover:border-white/10 cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium text-sm">{connection.name}</h3>
                        {connection.verified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <Crown className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-white/60 text-xs">{connection.role}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      connection.tier === 'Elite' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      connection.tier === 'Premium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      connection.tier === 'Professional' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                      {connection.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
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
      `}</style>
    </div>
  );
};

export default AgencyDashboard;