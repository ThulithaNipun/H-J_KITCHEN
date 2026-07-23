/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#14151D',
          sidebar: '#181924',
          panel: '#191A25',
          card: '#1F202C',
          'card-hover': '#262737',
          border: '#282937',
          red: '#FF5A5F',
          'red-dark': '#E04C51',
          text: '#FFFFFF',
          'text-secondary': '#848796',
          success: '#3BC17A',
        },
        inv: {
          outer: '#565B08',
          'band-start': '#9CA23C',
          'band-end': '#7C8420',
          'table-head': '#767B4E',
          'row-alt': '#F2F4E1',
          'total-bg': '#4B5510',
          text: '#2B2E12',
          'text-soft': '#6B6F4A',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
