/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        amber: { 550: '#d99007' },
        blue: { 550: '#256fe6', 750: '#1e40af' },
        emerald: { 850: '#065f46' },
        purple: { 550: '#8b5cf6' },
        slate: { 750: '#334155', 850: '#172033' },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
