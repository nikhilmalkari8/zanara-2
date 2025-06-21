import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PROFESSIONAL_TYPES = {
  'fashion-designer': {
    label: 'Fashion Designer',
    description: 'Architect of style. Create collections, craft tech packs, and define aesthetic narratives that shape the future of fashion.',
    gradient: 'from-red-400 to-orange-500',
    icon: '◊',
    features: ['Collection Design', 'Tech Pack Creation', 'Trend Forecasting', 'Brand Collaboration']
  },
  'stylist': {
    label: 'Fashion Stylist', 
    description: 'Visual storyteller. Curate transformative experiences through wardrobe alchemy and editorial vision.',
    gradient: 'from-purple-400 to-purple-600',
    icon: '✦',
    features: ['Editorial Styling', 'Wardrobe Curation', 'Brand Campaigns', 'Celebrity Styling']
  },
  'photographer': {
    label: 'Fashion Photographer',
    description: 'Moment architect. Capture the essence of fashion through lens mastery and artistic composition.',
    gradient: 'from-green-400 to-emerald-500',
    icon: '◈',
    features: ['Editorial Photography', 'Campaign Shoots', 'Portfolio Creation', 'Visual Storytelling']
  },
  'makeup-artist': {
    label: 'Makeup Artist',
    description: 'Beauty alchemist. Transform faces into canvases of artistic expression and emotional storytelling.',
    gradient: 'from-pink-400 to-rose-500',
    icon: '◉',
    features: ['Beauty Makeup', 'Editorial Looks', 'Special Effects', 'Brand Partnerships']
  },
  'model': {
    label: 'Model',
    description: 'Living canvas. Embody brand narratives and bring creative visions to life through authentic performance.',
    gradient: 'from-blue-400 to-indigo-500',
    icon: '✧',
    features: ['Fashion Modeling', 'Commercial Work', 'Editorial Shoots', 'Runway Shows']
  },
  'brand': {
    label: 'Fashion House',
    description: 'Vision architects. Build legacy brands that define cultural moments and shape industry standards.',
    gradient: 'from-teal-400 to-cyan-500',
    icon: '◆',
    features: ['Brand Building', 'Campaign Development', 'Talent Acquisition', 'Market Expansion']
  },
  'agency': {
    label: 'Creative Agency',
    description: 'Talent curators. Connect exceptional creatives with industry leaders to forge powerful collaborations.',
    gradient: 'from-yellow-400 to-amber-500',
    icon: '◎',
    features: ['Talent Management', 'Project Coordination', 'Industry Connections', 'Career Development']
  }
};

const UnifiedRegister = ({ setCurrentPage }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mounted, setMounted] = useState(false);

  const cursorRef = useRef(null);
  const containerRef = useRef(null);
  const particleCountRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Optimized cursor tracking
  const updateCursor = useCallback((e) => {
    if (cursorRef.current && window.innerWidth >= 768) {
      cursorRef.current.style.transform = `translate3d(${e.clientX - 8}px, ${e.clientY - 8}px, 0)`;
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const handleMouseMove = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateCursor(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [updateCursor]);

  // Optimized particles
  useEffect(() => {
    // Only create particles on step 1 and when container exists
    if (step !== 1) return;

    const maxParticles = 4;

    const createParticle = () => {
      // Check if container exists and particle count is within limit
      if (!containerRef.current || particleCountRef.current >= maxParticles) return;

      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-accent-gold/30 rounded-full pointer-events-none will-change-transform';

      const left = Math.random() * 100;
      const duration = 8000 + Math.random() * 4000;

      particle.style.cssText = `
        left: ${left}%;
        bottom: -10px;
        opacity: 0;
        transition: transform ${duration}ms linear, opacity ${duration}ms ease-in-out;
      `;

      // Double-check container still exists before appending
      if (containerRef.current) {
        containerRef.current.appendChild(particle);
        particleCountRef.current++;

        setTimeout(() => {
          if (particle.style) {
            particle.style.transform = `translate3d(${(Math.random() - 0.5) * 100}px, -100vh, 0) rotate(${Math.random() * 360}deg)`;
            particle.style.opacity = '0.4';

            setTimeout(() => {
              if (particle.style) {
                particle.style.opacity = '0';
              }
            }, duration * 0.8);
          }
        }, 100);

        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            particleCountRef.current = Math.max(0, particleCountRef.current - 1);
          }
        }, duration + 500);
      }
    };

    // Wait a bit to ensure container is ready
    const initialTimeout = setTimeout(() => {
      const particleInterval = setInterval(createParticle, 3000);
      
      // Store interval in a ref so we can clear it
      const cleanup = () => clearInterval(particleInterval);
      
      return cleanup;
    }, 200);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, [step]);

  const handleTypeSelection = useCallback((type) => {
    setSelectedType(type);
    const container = containerRef.current;
    if (container) {
      container.style.transform = 'scale(0.95)';
      container.style.opacity = '0.8';
      container.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';

      setTimeout(() => {
        setStep(2);
        container.style.transform = 'scale(1)';
        container.style.opacity = '1';
      }, 400);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          professionalType: selectedType,
          userType: ['brand', 'agency'].includes(selectedType) ? 'hiring' : 'talent'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Welcome to the collective. Redirecting...');
        setTimeout(() => {
          setCurrentPage('login');
        }, 2000);
      } else {
        setMessage(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTypeData = useMemo(() => 
    selectedType ? PROFESSIONAL_TYPES[selectedType] : null
  , [selectedType]);

  return (
    <>
      {/* Custom animations */}
      <style>{`
        .cursor-none {
          cursor: none;
        }
        
        .mix-blend-difference {
          mix-blend-mode: difference;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="relative min-h-screen bg-primary-black text-soft-white overflow-hidden cursor-none" ref={containerRef}>
        {/* Custom Cursor */}
        <div 
          ref={cursorRef}
          className="fixed w-4 h-4 bg-accent-gold rounded-full pointer-events-none z-50 mix-blend-difference will-change-transform hidden md:block"
        />

        {/* Progress Indicator */}
        <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-accent-gold to-accent-gold-light z-50 transition-all duration-700 ease-out"
             style={{ width: step === 1 ? '50%' : '100%' }} />

        {/* Header */}
        <header className={`relative z-10 p-8 flex items-center justify-between transition-all duration-800 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
        }`}>
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="text-2xl text-soft-white/70 hover:text-soft-white transition-all duration-300 hover:scale-110 hover:-rotate-12"
            >
              ←
            </button>
          )}
          <div className="font-display text-2xl md:text-3xl font-light text-center flex-1 bg-gradient-to-r from-soft-white to-accent-gold bg-clip-text text-transparent">
            {step === 1 ? 'Join the Collective' : 'Create Your Account'}
          </div>
          <div className="w-8" />
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-8 pb-16">
          {step === 1 && (
            <>
              <div className={`text-center mb-16 transition-all duration-1000 ease-out delay-300 ${
                mounted ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-5'
              }`}>
                <p className="text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
                  Choose your professional identity to begin your journey.
                </p>
              </div>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-1200 ease-out delay-600 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                {Object.entries(PROFESSIONAL_TYPES).map(([key, type]) => (
                  <div
                    key={key}
                    className={`relative bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-6 cursor-pointer min-h-80 flex flex-col justify-between transition-all duration-500 ease-out group overflow-hidden will-change-transform ${
                      hoveredCard === key ? 'border-accent-gold/30 scale-105 -translate-y-2' : ''
                    }`}
                    onMouseEnter={() => setHoveredCard(key)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleTypeSelection(key)}
                  >
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} rounded-2xl transition-opacity duration-500 ${
                      hoveredCard === key ? 'opacity-10' : 'opacity-5'
                    }`} />
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    
                    <div className="relative z-10">
                      <div className={`text-4xl mb-4 text-accent-gold transition-transform duration-500 ${
                        hoveredCard === key ? 'scale-110 rotate-12' : ''
                      }`}>
                        {type.icon}
                      </div>
                      <h3 className="font-display text-xl font-semibold mb-3 text-soft-white group-hover:text-accent-gold transition-colors duration-300">
                        {type.label}
                      </h3>
                      <p className="text-sm text-soft-white/70 font-light leading-relaxed mb-4 group-hover:text-soft-white/90 transition-colors duration-300">
                        {type.description}
                      </p>
                    </div>
                    
                    <div className="relative z-10 grid grid-cols-2 gap-2 mt-auto">
                      {type.features.map((feature, i) => (
                        <div 
                          key={i} 
                          className={`text-xs text-soft-white/60 py-1 border-b border-white/10 transition-all duration-300 ${
                            hoveredCard === key ? 'text-soft-white/80 delay-[${i * 50}ms]' : ''
                          }`}
                        >
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && selectedTypeData && (
            <div className={`max-w-lg mx-auto mt-8 transition-all duration-1200 ease-out ${
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <div className="bg-white/8 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 shadow-2xl">
                {/* Selected Type Header */}
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4 text-accent-gold">
                    {selectedTypeData.icon}
                  </div>
                  <h2 className="font-display text-2xl font-semibold mb-2 text-soft-white">
                    {selectedTypeData.label}
                  </h2>
                  <p className="text-sm text-soft-white/70 font-light">
                    {selectedTypeData.description}
                  </p>
                </div>

                {/* Registration Form */}
                <div className="space-y-6">
                  {/* First and Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-soft-white placeholder-white/40 focus:outline-none focus:border-accent-gold/60 focus:bg-white/10 transition-all duration-300"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-soft-white placeholder-white/40 focus:outline-none focus:border-accent-gold/60 focus:bg-white/10 transition-all duration-300"
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-soft-white placeholder-white/40 focus:outline-none focus:border-accent-gold/60 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                  
                  {/* Phone Number */}
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-soft-white placeholder-white/40 focus:outline-none focus:border-accent-gold/60 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                  
                  {/* Password and Confirm Password */}
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-soft-white placeholder-white/40 focus:outline-none focus:border-accent-gold/60 focus:bg-white/10 transition-all duration-300"
                      required
                      minLength={6}
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-soft-white placeholder-white/40 focus:outline-none focus:border-accent-gold/60 focus:bg-white/10 transition-all duration-300"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  {/* Message */}
                  {message && (
                    <div className={`p-4 rounded-xl text-center text-sm transition-all duration-300 animate-fade-in-up ${
                      message.includes('Welcome') 
                        ? 'bg-green-900/30 border border-green-700/50 text-green-300' 
                        : 'bg-red-900/30 border border-red-700/50 text-red-300'
                    }`}>
                      {message}
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    onClick={handleSubmit}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ease-out transform will-change-transform ${
                      isLoading
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed scale-95'
                        : 'bg-gradient-to-r from-accent-gold to-accent-gold-light text-primary-black hover:scale-105 hover:shadow-lg hover:shadow-accent-gold/25 active:scale-100'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Registering...</span>
                        </>
                      ) : (
                        <span>Join the Collective</span>
                      )}
                    </div>
                  </button>
                </div>

                {/* Login Link */}
                <div className="mt-6 text-center text-sm text-soft-white/70">
                  Already have an account?{' '}
                  <button
                    onClick={() => setCurrentPage('login')}
                    className="text-accent-gold hover:text-accent-gold-light font-medium underline decoration-2 underline-offset-2 transition-colors duration-200"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default UnifiedRegister;