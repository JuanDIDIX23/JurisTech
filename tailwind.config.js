/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Azul marino oscuro (base / fondos oscuros)
        navy: {
          50: '#eef2f9',
          100: '#d6e0f0',
          200: '#aec1e0',
          300: '#7e9bcc',
          400: '#4f73b3',
          500: '#345590',
          600: '#264071',
          700: '#2a5298',
          800: '#1e40af',
          900: '#1d3a8a',
          950: '#162d75',
        },
        // Gris grafito
        graphite: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1bac9',
          400: '#8794aa',
          500: '#67748d',
          600: '#525c73',
          700: '#434a5d',
          800: '#393f4f',
          900: '#1f232e',
          950: '#14171f',
        },
        // Azul tecnológico (acentos)
        accent: {
          50: '#ecf5ff',
          100: '#d6e9ff',
          200: '#b5d8ff',
          300: '#83bfff',
          400: '#499aff',
          500: '#1f74ff',
          600: '#0a55f5',
          700: '#0741dc',
          800: '#0c37b2',
          900: '#10338c',
          950: '#0c2055',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(31,116,255,0.18), 0 18px 60px -18px rgba(31,116,255,0.45)',
        card: '0 1px 2px rgba(13,23,48,0.06), 0 12px 32px -16px rgba(13,23,48,0.20)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
