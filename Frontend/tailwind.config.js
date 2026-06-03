/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a5f',
        secondary: '#2563eb',
        accent: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      }
    },
  },
  plugins: [],
}