import React, { useState, useEffect, useRef, useCallback } from 'react';

const Login = ({ setCurrentPage, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const cursorRef = useRef(null);
  const containerRef = useRef(null);
  const particleCountRef = useRef(0);

  useEffect(() => {
    setMounted(true);
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

  // Optimized particle system
  useEffect(() => {
    if (!containerRef.current) return;
    
    const maxParticles = 5;
    
    const createParticle = () => {
      if (particleCountRef.current >= maxParticles) return;
      
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-accent-gold/30 rounded-full pointer-events-none animate-float-up will-change-transform';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = '100%';
      particle.style.animationDelay = Math.random() * 3 + 's';
      
      containerRef.current.appendChild(particle);
      particleCountRef.current++;
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
          particleCountRef.current--;
        }
      }, 12000);
    };

    const interval = setInterval(createParticle, 4000);
    
    // Create initial particles
    for (let i = 0; i < 2; i++) {
      setTimeout(createParticle, i * 1000);
    }

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Login successful! Redirecting...');
        onLogin(data.user, data.token);
      } else {
        setMessage(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Tailwind-compatible animations */}
      <style>{`
        @keyframes float-up {
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
        
        .animate-float-up {
          animation: float-up 12s linear infinite;
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
        className="fixed w-4 h-4 bg-accent-gold rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block will-change-transform"
      />

      {/* Main Container */}
      <div 
        ref={containerRef}
        className="min-h-screen bg-primary-black flex items-center justify-center p-4 md:p-8 relative overflow-hidden cursor-none"
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'all 1s ease-out'
        }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 via-primary-black to-gray-800/5" />
          <div className="absolute top-20 left-20 w-32 h-32 bg-accent-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gray-700/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent-gold/3 rounded-full blur-2xl" />
        </div>

        {/* Login Card */}
        <div 
          className="w-full max-w-md relative z-10 transition-all duration-1000 ease-out"
          style={{
            transform: mounted ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.95)',
            opacity: mounted ? 1 : 0
          }}
        >
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-accent-gold/20 hover:shadow-accent-gold/10">
            
            {/* Header */}
            <div className="mb-8 relative">
              <button 
                onClick={() => setCurrentPage && setCurrentPage('home')}
                className="absolute -top-2 -left-2 w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-gold/30 rounded-full text-white transition-all duration-300 ease-out focus:outline-none flex items-center justify-center backdrop-blur-sm hover:scale-110 hover:-rotate-12"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center pt-4">
                <h1 className="font-display text-3xl md:text-4xl font-light text-white mb-3 tracking-wide bg-gradient-to-r from-white via-yellow-100 to-accent-gold bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <p className="text-base font-light text-gray-400 tracking-wide">
                  Sign in to your fashion universe
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 ease-out focus:outline-none focus:border-accent-gold/50 focus:bg-white/10 focus:shadow-lg focus:shadow-accent-gold/5"
                    placeholder="Email address"
                    data-cy="email-input"
                    required
                  />
                  <div className={`absolute inset-0 rounded-2xl border-2 pointer-events-none transition-all duration-300 ${focusedField === 'email' ? 'border-accent-gold/30 shadow-lg shadow-accent-gold/10' : 'border-transparent'}`} />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 ease-out focus:outline-none focus:border-accent-gold/50 focus:bg-white/10 focus:shadow-lg focus:shadow-accent-gold/5 pr-12"
                    placeholder="Password"
                    data-cy="password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-accent-gold transition-colors duration-300 focus:outline-none"
                    data-cy="show-password-button"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <div className={`absolute inset-0 rounded-2xl border-2 pointer-events-none transition-all duration-300 ${focusedField === 'password' ? 'border-accent-gold/30 shadow-lg shadow-accent-gold/10' : 'border-transparent'}`} />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-accent-gold bg-white/5 border-white/20 rounded focus:ring-accent-gold/50 focus:ring-2 transition-all duration-300"
                    data-cy="remember-me-checkbox"
                  />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors duration-300">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-accent-gold hover:text-yellow-300 transition-colors duration-300 focus:outline-none"
                  data-cy="forgot-password-link"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              {message && (
                <div className={`p-4 rounded-2xl text-sm text-center transition-all duration-300 ${message.includes('successful') ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`} data-cy="login-error">
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-accent-gold via-yellow-400 to-accent-gold text-primary-black font-semibold rounded-2xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent-gold/20 focus:outline-none focus:ring-4 focus:ring-accent-gold/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                data-cy="login-button"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-primary-black/30 border-t-primary-black rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in to Zanara'
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-8 space-y-4 text-center">
              {/* Register Link */}
              <p className="text-gray-400">
                New to the fashion collective?{' '}
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('register')}
                  className="font-semibold text-accent-gold hover:text-accent-gold-light transition-colors duration-200 underline decoration-2 underline-offset-4 hover:underline-offset-2"
                >
                  Join the ecosystem
                </button>
              </p>

              {/* Forgot Password */}
              <button 
                onClick={() => setMessage('Forgot password feature coming soon!')}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200 underline decoration-transparent hover:decoration-gray-400 underline-offset-4"
              >
                Forgot your password?
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <h4 className="text-white font-semibold mb-4 text-center tracking-wide">
                Welcome Back To:
              </h4>
              <ul className="space-y-3 text-sm text-gray-300">
                {[
                  'Your professional fashion portfolio',
                  'Industry collaboration opportunities', 
                  'Verified professional network',
                  'Real-time fashion industry insights'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-accent-gold flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;