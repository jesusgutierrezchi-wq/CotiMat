/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17171A',
        muted: '#6B6B70',
        surface: '#FFFFFF',
        canvas: '#F6F6F4',
        border: '#E4E4E1',
        accent: '#B5540C',
        'accent-soft': '#FBEEE2',
        approved: '#15803D',
        rejected: '#B91C1C',
        pending: '#6B6B70',
        progress: '#1D4ED8',
        sidebar: '#111113',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(23,23,26,0.05)',
        md: '0 8px 24px -4px rgba(23,23,26,0.12)',
        lg: '0 16px 40px -8px rgba(23,23,26,0.16)',
      },
    },
  },
  plugins: [],
};
