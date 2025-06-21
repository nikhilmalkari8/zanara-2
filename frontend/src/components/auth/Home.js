import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const Home = ({ setCurrentPage }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const cursorRef = useRef(null);
  const cursorFollowerRef = useRef(null);
  const bgAnimationRef = useRef(null);
  const heroRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized cursor tracking with throttling
  const updateCursor = useCallback((e) => {
    const { clientX, clientY } = e;
    setMousePosition({ x: clientX, y: clientY });
    
    if (cursorRef.current && window.innerWidth >= 768) {
      cursorRef.current.style.transform = `translate3d(${clientX - 10}px, ${clientY - 10}px, 0)`;
    }
    
    if (cursorFollowerRef.current && window.innerWidth >= 768) {
      cursorFollowerRef.current.style.transform = `translate3d(${clientX - 20}px, ${clientY - 20}px, 0)`;
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

  // Simplified particle system with limits
  useEffect(() => {
    if (!bgAnimationRef.current) return;
    
    const maxParticles = 8; // Reduced from unlimited
    let particleCount = 0;
    
    const createParticle = () => {
      if (particleCount >= maxParticles) return;
      
      const particle = document.createElement('div');
      const size = Math.random() * 2 + 1; // Smaller particles
      const opacity = Math.random() * 0.3 + 0.1;
      const duration = Math.random() * 10 + 8; // Shorter duration
      
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
      particleCount++;
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
          particleCount--;
        }
      }, duration * 1000);
    };

    const interval = setInterval(createParticle, 3000); // Less frequent
    
    // Create fewer initial particles
    for (let i = 0; i < 3; i++) {
      setTimeout(createParticle, i * 1000);
    }

    return () => clearInterval(interval);
  }, []);

  // Optimized magnetic effect with debouncing
  const handleMagneticMove = useCallback((e, element) => {
    if (animationFrameRef.current) return; // Prevent multiple calls
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.08; // Reduced intensity
      const deltaY = (e.clientY - centerY) * 0.08;
      
      element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1.02)`;
      animationFrameRef.current = null;
    });
  }, []);

  const handleMagneticLeave = useCallback((element) => {
    element.style.transform = 'translate3d(0, 0, 0) scale(1)';
  }, []);

  // Memoized styles to prevent re-renders
  const cardStyles = useMemo(() => ({
    creative: {
      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.06) 0%, rgba(238, 90, 36, 0.02) 100%)'
    },
    brand: {
      background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.06) 0%, rgba(68, 160, 141, 0.02) 100%)'
    }
  }), []);

  return (
    <>
      {/* Simplified and optimized animations */}
      <style>{`
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
        
        @keyframes title-reveal {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes subtitle-reveal {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 0.9;
            transform: translateY(0);
          }
        }
        
        @keyframes cards-reveal {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer-simple {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes bounce-simple {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-10px);
          }
        }
        
        .animate-title-reveal {
          animation: title-reveal 1.5s ease-out forwards;
        }
        
        .animate-subtitle-reveal {
          animation: subtitle-reveal 1.5s ease-out 0.3s forwards;
          opacity: 0;
        }
        
        .animate-cards-reveal {
          animation: cards-reveal 1.5s ease-out 0.6s forwards;
          opacity: 0;
        }
        
        .animate-shimmer-simple {
          background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer-simple 2s ease-in-out infinite;
        }
        
        .animate-bounce-simple {
          animation: bounce-simple 2s ease-in-out infinite;
        }
        
        .text-gradient-gold {
          background: linear-gradient(135deg, #fafafa 0%, #d4af37 50%, #ffd700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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
        
        .cursor-none {
          cursor: none;
        }
        
        .mix-blend-difference {
          mix-blend-mode: difference;
        }
        
        /* Performance optimizations */
        .will-change-transform {
          will-change: transform;
        }
        
        .gpu-accelerated {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>

      {/* Simplified Cursors */}
      <div 
        ref={cursorRef}
        className="fixed w-5 h-5 bg-accent-gold rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block will-change-transform"
      />
      <div 
        ref={cursorFollowerRef}
        className="fixed w-8 h-8 border border-accent-gold/30 rounded-full pointer-events-none z-40 hidden md:block will-change-transform"
      />

      {/* Simplified Particles Container */}
      <div 
        ref={bgAnimationRef}
        className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      />

      {/* Simplified Background */}
      <div className="fixed inset-0 bg-primary-black">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 via-primary-black to-gray-800/5" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-gold/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-gold-light/2 rounded-full blur-2xl" />
      </div>

      {/* Simplified Navigation Dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-30 hidden lg:flex">
        <div className="w-2 h-2 bg-accent-gold rounded-full" />
        <div className="w-2 h-2 bg-white/20 rounded-full transition-colors duration-300 hover:bg-accent-gold" />
        <div className="w-2 h-2 bg-white/20 rounded-full transition-colors duration-300 hover:bg-accent-gold" />
      </div>

      {/* Main Container */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4 md:p-8 cursor-none overflow-hidden">
        <div 
          ref={heroRef}
          className="w-full max-w-6xl mx-auto text-center relative"
        >
          {/* Hero Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extralight tracking-tight mb-6 text-gradient-gold animate-title-reveal gpu-accelerated">
            ZANARA
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg lg:text-xl font-light leading-relaxed text-soft-white/90 max-w-3xl mx-auto mb-12 animate-subtitle-reveal">
            The definitive fashion ecosystem where creativity converges with commerce. 
            A curated platform connecting visionaries, artisans, and tastemakers.
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 animate-cards-reveal">
            {/* Creative Professionals Card */}
            <div 
              className="glass-effect rounded-2xl p-6 lg:p-8 min-h-64 flex flex-col justify-between transition-all duration-500 ease-out cursor-pointer group relative overflow-hidden gpu-accelerated"
              onClick={() => setCurrentPage('register')}
              onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}
              style={cardStyles.creative}
            >
              <div className="absolute inset-0 animate-shimmer-simple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-105">
                  ✦
                </div>
                <h3 className="font-display text-xl lg:text-2xl font-semibold mb-3 text-soft-white group-hover:text-accent-gold transition-colors duration-300">
                  Creative Visionaries
                </h3>
                <p className="text-soft-white/70 text-sm lg:text-base leading-relaxed font-light group-hover:text-soft-white/90 transition-colors duration-300">
                  For models, designers, stylists, photographers, and makeup artists. 
                  Curate your portfolio and connect with industry luminaries.
                </p>
              </div>
            </div>

            {/* Brand Professionals Card */}
            <div 
              className="glass-effect rounded-2xl p-6 lg:p-8 min-h-64 flex flex-col justify-between transition-all duration-500 ease-out cursor-pointer group relative overflow-hidden gpu-accelerated"
              onClick={() => setCurrentPage('register')}
              onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}
              style={cardStyles.brand}
            >
              <div className="absolute inset-0 animate-shimmer-simple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-105">
                  ◊
                </div>
                <h3 className="font-display text-xl lg:text-2xl font-semibold mb-3 text-soft-white group-hover:text-accent-gold transition-colors duration-300">
                  Maisons & Agencies
                </h3>
                <p className="text-soft-white/70 text-sm lg:text-base leading-relaxed font-light group-hover:text-soft-white/90 transition-colors duration-300">
                  Fashion houses, luxury brands, and talent agencies. Discover 
                  exceptional talent and build your creative collective.
                </p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div 
            className="glass-effect-strong rounded-xl p-8 max-w-md mx-auto text-center transition-all duration-500 ease-out cursor-pointer group relative overflow-hidden gpu-accelerated"
            onClick={() => setCurrentPage('login')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <div className="relative z-10">
              <div className="text-3xl mb-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                ◈
              </div>
              <h3 className="font-display text-lg lg:text-xl font-medium mb-2 text-soft-white group-hover:text-accent-gold transition-colors duration-300">
                Welcome Back
              </h3>
              <p className="text-soft-white/60 text-sm font-light group-hover:text-soft-white/80 transition-colors duration-300">
                Already part of our fashion collective? 
                Access your curated professional universe.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Signature */}
      <div className="fixed bottom-6 left-6 text-xs text-soft-white/30 font-light tracking-wider uppercase hidden lg:block">
        Luxury Digital Experience
      </div>

      {/* Simplified Scroll Indicator */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 text-soft-white/20 animate-bounce-simple hidden lg:block">
        ↓
      </div>
    </>
  );
};

export default Home;