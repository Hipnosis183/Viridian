/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          100: '#E6EDF3',
          200: '#7D8590',
          300: '#2B3138',
          400: '#242930',
          500: '#1D222C',
          600: '#161B22',
          700: '#12161D',
          800: '#0D1117',
          900: '#070B10',
          1000: '#010409'
        }
      }
    },
  },
  plugins: [],
}
