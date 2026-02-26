/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trading: {
          sydney: '#00f2ff',
          tokyo: '#8b5cf6',
          london: '#f59e0b',
          newyork: '#10b981',
          background: '#0a0a0b',
          surface: '#121214',
        }
      }
    },
  },
  plugins: [],
}

