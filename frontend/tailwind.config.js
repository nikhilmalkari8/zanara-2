/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'primary-black': '#0a0a0a',
          'soft-white': '#fafafa',
          'pure-white': '#ffffff',
          'accent-gold': '#d4af37',
          'accent-gold-light': '#e6c659',
          'accent-gold-dark': '#b8941f',
        },
        fontFamily: {
          'primary': ['Inter', 'sans-serif'],
          'display': ['Playfair Display', 'serif'],
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
        },
        backdropBlur: {
          '3xl': '64px',
        },
        animation: {
          'float-up': 'float-up 12s linear infinite',
          'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        },
        keyframes: {
          'float-up': {
            '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '0' },
            '10%': { opacity: '1' },
            '90%': { opacity: '1' },
            '100%': { transform: 'translateY(-100vh) rotate(360deg)', opacity: '0' },
          },
          'fade-in-up': {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
        boxShadow: {
          'premium': '0 32px 64px rgba(0, 0, 0, 0.3)',
          'float': '0 16px 32px rgba(0, 0, 0, 0.15)',
          'gold': '0 8px 25px rgba(212, 175, 55, 0.25)',
          'gold-lg': '0 25px 50px rgba(212, 175, 55, 0.4)',
        }
      },
    },
    plugins: [],
  }