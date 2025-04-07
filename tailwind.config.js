/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'peachy-white': '#FFF6F6',
        'bubblegum-pink': '#FFD6E8',
        'icy-blue': '#AEE9F5',
        'soft-charcoal': '#444444',
        'cute-pink': '#FF90B3',
        'soft-cream': '#FFEACD',
        'pastel-pink': '#FFC0CB',
      },
      boxShadow: {
        'kawaii': '0 4px 6px -1px rgba(255, 144, 179, 0.1), 0 2px 4px -1px rgba(255, 144, 179, 0.06)',
      },
    },
  },
  plugins: [],
};