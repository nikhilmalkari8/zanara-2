import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, TrendingUp, Users, Calendar, Star, Heart, MessageCircle, Eye, ArrowRight, Plus, Settings,
  Bell, Search, Filter, MapPin, Clock, DollarSign, Briefcase, Award, Target, Zap, Globe, Instagram,
  Youtube, Music, User, ChevronDown, Activity, Flame, Crown, Diamond, Building, Megaphone, BarChart3
} from 'lucide-react';

const BrandDashboard = ({ user = {}, onLogout, setCurrentPage, onViewProfile, setViewingProfileId }) => {
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
          headline: 'Premium Brand & Marketing Powerhouse',
          location: 'New York, NY',
          tier: 'Enterprise',
          verified: true,
          socialMedia: {
            instagram: '@brand_official',
            youtube: 'Brand Channel'
          }
        });
        
        // Use real analytics data with brand-specific metrics
        const brandMetrics = analyticsData.brandMetrics || {};
        setStats({
          activeCampaigns: brandMetrics.activeCampaigns || analyticsData.activeCampaigns || 0,
          talentCollaborations: brandMetrics.talentCollaborations || analyticsData.talentCollaborations || 0,
          brandReach: brandMetrics.brandReach || 0,
          campaignROI: brandMetrics.campaignROI || 0,
          marketingBudget: brandMetrics.marketingBudget || 0,
          connections: analyticsData.connections || 0,
          completedProjects: analyticsData.bookings || 0,
          avgRating: analyticsData.avgRating || 4.9,
          responseRate: analyticsData.responseRate || 96,
          monthlyGrowth: analyticsData.monthlyGrowth || 0,
          brandScore: brandMetrics.brandScore || 85
        });
        
        setRecentActivity([
          { id: 1, type: 'campaign', title: 'Summer Collection Launch', client: 'Internal Team', time: '1 hour ago', status: 'active', value: '$45,000' },
          { id: 2, type: 'collaboration', title: 'Influencer Partnership Signed', time: '3 hours ago', status: 'confirmed', value: '+2.1M reach' },
          { id: 3, type: 'application', title: 'Model Applications Reviewed', client: 'Casting Team', time: '6 hours ago', status: 'completed', value: '23 reviewed' },
          { id: 4, type: 'connection', title: 'New Agency Partnership', time: '1 day ago', status: 'accepted', value: 'Premium' },
          { id: 5, type: 'achievement', title: 'Campaign Performance Milestone', time: '2 days ago', status: 'milestone', value: '5M+ impressions' }
        ]);
        
        setOpportunities([
          {
            id: 1,
            title: 'Holiday Campaign Models',
            client: 'Internal Casting',
            type: 'Commercial',
            location: 'Los Angeles, CA',
            pay: '$25,000',
            deadline: '5 days',
            match: 96,
            urgent: true,
            tier: 'Premium',
            exclusivity: 'Brand Exclusive'
          },
          {
            id: 2,
            title: 'Product Launch Photography',
            client: 'Marketing Team',
            type: 'Product',
            location: 'New York, NY',
            pay: '$18,000',
            deadline: '1 week',
            match: 92,
            urgent: false,
            tier: 'Professional',
            exclusivity: 'Premium'
          },
          {
            id: 3,
            title: 'Brand Ambassador Program',
            client: 'Partnership Team',
            type: 'Ambassador',
            location: 'Remote',
            pay: '$50,000',
            deadline: '2 weeks',
            match: 94,
            urgent: false,
            tier: 'Elite',
            exclusivity: 'Exclusive'
          }
        ]);
        
        setConnections([
          { id: 1, name: 'Creative Studios', role: 'Production Partner', avatar: '/api/placeholder/40/40', verified: true, tier: 'Premium' },
          { id: 2, name: 'Elite Models', role: 'Talent Agency', avatar: '/api/placeholder/40/40', verified: true, tier: 'Professional' },
          { id: 3, name: 'Fashion Forward', role: 'Styling Partner', avatar: '/api/placeholder/40/40', verified: false, tier: 'Standard' },
          { id: 4, name: 'Media Group', role: 'Marketing Partner', avatar: '/api/placeholder/40/40', verified: true, tier: 'Enterprise' }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback data on error
        setStats({
          activeCampaigns: 0,
          talentCollaborations: 0,
          brandReach: 0,
          campaignROI: 0,
          marketingBudget: 0,
          connections: 0,
          completedProjects: 0,
          avgRating: 4.9,
          responseRate: 96,
          monthlyGrowth: 0,
          brandScore: 85
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
          <div className="text-white/90 text-lg font-light mb-1">Loading Brand Hub</div>
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
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center">
                    <Building className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />
                  </div>
                  {profile?.verified && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-light text-white mb-2">
                    Welcome back, <span className="text-yellow-500 font-medium">{user?.firstName || 'Brand'}</span>
                  </h1>
                  <p className="text-white/60 text-sm md:text-base font-light">
                    {profile?.headline || 'Brand Command Center'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs text-yellow-400 font-medium">
                      <Diamond className="w-3 h-3" />
                      {profile?.tier || 'Enterprise'}
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
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Megaphone className="w-4 h-4" />
                  Launch Campaign
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
              { label: 'Active Campaigns', value: stats.activeCampaigns, icon: Megaphone, color: 'text-yellow-500', bg: 'from-yellow-500/10 to-orange-500/5' },
              { label: 'Talent Collabs', value: stats.talentCollaborations, icon: Users, color: 'text-blue-500', bg: 'from-blue-500/10 to-cyan-500/5' },
              { label: 'Brand Reach', value: `${(stats.brandReach / 1000000).toFixed(1)}M`, icon: Globe, color: 'text-green-500', bg: 'from-green-500/10 to-emerald-500/5' },
              { label: 'Campaign ROI', value: `${stats.campaignROI}x`, icon: TrendingUp, color: 'text-purple-500', bg: 'from-purple-500/10 to-pink-500/5' },
              { label: 'Marketing Budget', value: `$${(stats.marketingBudget / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-500', bg: 'from-emerald-500/10 to-green-500/5' },
              { label: 'Brand Score', value: stats.brandScore, icon: Award, color: 'text-orange-500', bg: 'from-orange-500/10 to-red-500/5' }
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
                  <Activity className="w-5 h-5 text-yellow-500" />
                  Brand Activity
                </h2>
                <button className="text-white/40 hover:text-white/60 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-all duration-300 hover:border-white/10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.type === 'campaign' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                      activity.type === 'collaboration' ? 'bg-blue-500/10 border border-blue-500/20' :
                      activity.type === 'application' ? 'bg-green-500/10 border border-green-500/20' :
                      activity.type === 'connection' ? 'bg-purple-500/10 border border-purple-500/20' :
                      'bg-orange-500/10 border border-orange-500/20'
                    }`}>
                      {activity.type === 'campaign' ? <Megaphone className="w-4 h-4 text-yellow-500" /> :
                       activity.type === 'collaboration' ? <Users className="w-4 h-4 text-blue-500" /> :
                       activity.type === 'application' ? <Eye className="w-4 h-4 text-green-500" /> :
                       activity.type === 'connection' ? <User className="w-4 h-4 text-purple-500" /> :
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
                          activity.status === 'confirmed' || activity.status === 'active' ? 'text-green-400' :
                          activity.status === 'pending' ? 'text-yellow-400' :
                          activity.status === 'completed' ? 'text-blue-400' :
                          'text-purple-400'
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
            {/* Active Campaigns */}
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light text-white flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-yellow-500" />
                  Active Campaigns
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
                      <span className="text-yellow-400 font-medium">{opportunity.pay}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-white/40">{opportunity.location}</span>
                      <span className="text-white/60">{opportunity.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Network */}
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light text-white flex items-center gap-3">
                  <Users className="w-5 h-5 text-yellow-500" />
                  Partner Network
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
                      <User className="w-4 h-4 text-white/60" />
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
                      connection.tier === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
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

export default BrandDashboard;