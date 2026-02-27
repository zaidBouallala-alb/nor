/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'Cairo', 'Noto Naskh Arabic', 'Segoe UI', 'system-ui', 'sans-serif'],
        quran: ['Noto Naskh Arabic', 'Tajawal', 'serif'],
      },
      colors: {
        background: {
          DEFAULT: '#060B1F',
          2: '#0A112C',
          3: '#10183A',
        },
        surface: {
          DEFAULT: '#111A3D',
          soft: '#16224B',
          glass: 'rgb(20 30 66 / 72%)',
        },
        border: {
          DEFAULT: '#26325E',
          soft: '#1D2850',
        },
        textMuted: {
          DEFAULT: '#8B96BD',
          soft: '#6F7BA7',
        },
        gold: {
          300: '#F5D57A',
          400: '#E9C35B',
          500: '#D7A93E',
          600: '#B8872F',
        },
        primary: {
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        card: '1rem',
        btn:  '0.5rem',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.25)',
        elevated: '0 14px 40px rgba(2, 6, 23, 0.45)',
        card: '0 8px 24px rgba(1, 8, 28, 0.38)',
        raised: '0 12px 30px rgba(2, 10, 35, 0.45)',
        drawer: '0 20px 50px rgba(2, 8, 32, 0.68)',
        'glow-gold': '0 0 14px rgba(215, 169, 62, 0.18), 0 0 4px rgba(215, 169, 62, 0.10)',
      },
      maxWidth: {
        content: '1100px',
      },
      spacing: {
        sidebar: '16rem',
        'sidebar-collapsed': '4.5rem',
        topbar:  '3.5rem',
        page: '1.25rem',
      },
    },
  },
  plugins: [],
}
