/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0e0f11',
        surface: '#16181c',
        surface2: '#1e2026',
        accent: '#c8f064',
        accent2: '#6ef0c8',
        accent3: '#f0a064',
        danger: '#f06464',
        info: '#64a8f0',
        muted: '#7a7f8a',
        dim: '#3a3f4a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
      },
    },
  },
  plugins: [],
}

