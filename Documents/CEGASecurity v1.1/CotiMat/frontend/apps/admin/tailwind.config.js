/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#221F1C',
        concrete: '#EAE6DD',
        steel: '#52606D',
        safety: '#E4571B',
        blueprint: '#1F3A5C',
        paper: '#FFFDF9',
        approved: '#2F6B3A',
        rejected: '#B23A2E',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '4px',
        full: '9999px',
      },
      boxShadow: {
        tag: '2px 2px 0 rgba(34,31,28,0.12)',
        'tag-lg': '4px 4px 0 rgba(34,31,28,0.16)',
      },
      keyframes: {
        stamp: {
          '0%': { transform: 'scale(0.9) rotate(0deg)', opacity: '0.6' },
          '60%': { transform: 'scale(1.03) rotate(var(--stamp-rot, -2deg))', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(var(--stamp-rot, -2deg))', opacity: '1' },
        },
      },
      animation: {
        stamp: 'stamp 220ms ease-out',
      },
    },
  },
  plugins: [],
};
