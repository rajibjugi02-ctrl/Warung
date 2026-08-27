/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warung: {
          50: '#f2f8f3',
          100: '#e1f0e3',
          200: '#c5e2c8',
          300: '#99cca0',
          400: '#68ad72',
          500: '#438f4d',
          600: '#32733a',
          700: '#275b2f',
          800: '#204726',
          900: '#1a3c20',
          950: '#0c1f10',
        },
        cream: {
          50: '#fbfaf6',
          100: '#f5f2e9',
          200: '#eee8d9',
          300: '#ded3bc',
          400: '#c8b696',
          500: '#b19772',
        },
        amber: {
          warm: '#F59E0B',
          deep: '#D97706',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        soft: '0 4px 16px -2px rgba(24, 60, 32, 0.06), 0 2px 4px -1px rgba(24, 60, 32, 0.03)',
        card: '0 2px 10px -2px rgba(24, 60, 32, 0.05), 0 1px 3px -1px rgba(24, 60, 32, 0.03)',
        hover: '0 12px 28px -6px rgba(24, 60, 32, 0.12), 0 4px 10px -2px rgba(24, 60, 32, 0.05)',
        floating: '0 20px 40px -10px rgba(24, 60, 32, 0.15)',
      },
    },
  },
  plugins: [],
};
