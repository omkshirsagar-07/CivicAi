/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f3f6fb',
          100: '#e4ebf5',
          200: '#c5d4e9',
          300: '#96b1d6',
          400: '#6287bd',
          500: '#3d67a4',
          600: '#2c5086',
          700: '#24406d',
          800: '#1e3457',
          900: '#112544',
          950: '#0a1830',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 36, 68, 0.05), 0 6px 20px -8px rgba(16, 36, 68, 0.10)',
        pop: '0 12px 40px -10px rgba(16, 36, 68, 0.22)',
        emergency: '0 10px 36px -8px rgba(220, 38, 38, 0.35)',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
}
