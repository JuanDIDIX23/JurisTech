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
        // Azul de marca (interacción, CTAs, acentos)
        brand: {
          50: '#f0f6ff',
          100: '#ddeeff',
          200: '#c4e0ff',
          300: '#aed1ff',
          400: '#7ab5ff',
          500: '#4a94ff',
          600: '#2570e8',
          700: '#1a55c4',
          800: '#133fa0',
          900: '#0e2d7a',
          950: '#081d55',
        },
        // Beige cálido (superficies claras / fondo de página)
        sand: {
          50: '#faf9f7',
          100: '#f5f2ee',
          200: '#ebe4e1',
          300: '#ddd4ce',
          400: '#c9b9b0',
          500: '#b09890',
          600: '#8c736a',
          700: '#6e5750',
          800: '#503f3a',
          900: '#352a26',
          950: '#1f1714',
        },
        // Gris neutro (tipografía, superficies oscuras)
        stone: {
          50: '#f5f5f5',
          100: '#ebebeb',
          200: '#d4d4d4',
          300: '#b0b0b0',
          400: '#909090',
          500: '#747474',
          600: '#5a5a5a',
          700: '#424242',
          800: '#2e2e2e',
          900: '#1c1c1c',
          950: '#0f0f0f',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(37,112,232,0.18), 0 18px 60px -18px rgba(37,112,232,0.45)',
        card: '0 1px 2px rgba(28,28,28,0.06), 0 12px 32px -16px rgba(28,28,28,0.20)',
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
