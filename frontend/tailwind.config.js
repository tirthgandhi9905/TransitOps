/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand — pulled from the TransitOps logo purple
        brand: {
          50:  '#F6EEF8',
          100: '#ECDCF2',
          200: '#D5B4E5',
          300: '#BB85D5',
          400: '#A058C4',
          500: '#8832B2',
          600: '#7C2D84',   // ← primary (matches logo ring)
          700: '#6A2470',
          800: '#561C5C',
          900: '#421548',
        },
        // Neutral surface palette (light theme)
        surface: {
          page:   '#F4F6FA',   // page background
          card:   '#FFFFFF',   // card / panel background
          border: '#E4E8EF',   // dividers, card borders
          muted:  '#F1F3F8',   // zebra rows, input bg
        },
      },
      boxShadow: {
        card:  '0 1px 4px 0 rgba(17,24,39,0.06), 0 1px 2px 0 rgba(17,24,39,0.04)',
        modal: '0 20px 60px -12px rgba(17,24,39,0.18)',
        toast: '0 4px 16px 0 rgba(17,24,39,0.12)',
      },
      fontFamily: {
        sans: [
          'Inter', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont',
          'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}