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
        // Brand
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // primary indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Surface (dark theme)
        surface: {
          DEFAULT: '#0f172a',  // slate-950 - page bg
          card:    '#1e293b',  // slate-800 - card bg
          border:  '#334155',  // slate-700 - borders
          muted:   '#475569',  // slate-600 - muted text
        },
      },
    },
  },
  plugins: [],
}
