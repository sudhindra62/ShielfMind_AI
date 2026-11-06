/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#080d18',
          surface: '#0d1526',
          panel: '#101b31',
          border: '#1a2a42',
          glow: '#00d4ff',
          green: '#00e676',
          orange: '#ff9800',
          red: '#ff5252',
          purple: '#bb86fc',
          gold: '#ffd740',
          teal: '#1de9b6'
        }
      },
      backgroundImage: {
        'grid-dark': 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
        'hero-gradient': 'linear-gradient(135deg, #080d18 0%, #111a32 45%, #07151d 100%)',
        'glass-line': 'linear-gradient(120deg, rgba(255,255,255,.16), rgba(255,255,255,.02), rgba(0,212,255,.16))',
        'luxury-radar': 'conic-gradient(from 180deg at 50% 50%, rgba(0,212,255,.2), rgba(187,134,252,.2), rgba(0,230,118,.14), rgba(0,212,255,.2))'
      },
      backgroundSize: {
        grid: '44px 44px'
      },
      boxShadow: {
        card: '0 18px 60px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)',
        'card-hover': '0 28px 90px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1)',
        'glow-cyan': '0 0 28px rgba(0,212,255,.28), 0 0 70px rgba(0,212,255,.08)',
        'glow-green': '0 0 28px rgba(0,230,118,.25), 0 0 70px rgba(0,230,118,.08)',
        'glow-red': '0 0 28px rgba(255,82,82,.25), 0 0 70px rgba(255,82,82,.08)',
        'glow-gold': '0 0 28px rgba(255,215,64,.24), 0 0 70px rgba(255,215,64,.08)',
        'glow-purple': '0 0 28px rgba(187,134,252,.24), 0 0 70px rgba(187,134,252,.08)'
      },
      animation: {
        'fade-in': 'fadeIn .35s ease-out',
        'slide-up': 'slideUp .45s ease-out',
        'glow-pulse': 'glowPulse 2.4s ease-in-out infinite',
        'scan-line': 'scanLine 2.6s linear infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'border-flow': 'borderFlow 4s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(18px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: .58, transform: 'scale(1.05)' }
        },
        scanLine: {
          '0%': { transform: 'translateY(-20%)' },
          '100%': { transform: 'translateY(120%)' }
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
}
