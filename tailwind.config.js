/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
    sans: [
      '"Inter Variable"',
      'Inter',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      '"Segoe UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ],
  },
  colors: {
        // CivicAI brand palette — White + Black + Navy + Blue + Sky Blue + Silver
        navy: {
          50: '#eef4fb',
          100: '#d9e6f6',
          200: '#b3cdec',
          300: '#7fa9de',
          400: '#4a7ecc',
          500: '#2a5cb3',
          600: '#1e4691',
          700: '#173775',
          800: '#122a5a',
          900: '#0c1f45',
          950: '#081533',
        },
        civic: {
          sky: '#0ea5e9',
          blue: '#2563eb',
          navy: '#0c1f45',
          silver: '#e2e8f0',
          gray: '#64748b',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 40 90 / 0.04), 0 1px 3px 0 rgb(15 40 90 / 0.06)',
        'card-hover': '0 4px 10px -2px rgb(15 40 90 / 0.08), 0 8px 24px -6px rgb(15 40 90 / 0.10)',
        soft: '0 8px 30px -12px rgb(15 40 90 / 0.14)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.45s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
