/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#283548',
          800: '#1E283C',
          850: '#192134',
          950: '#0D1527',
          1000: '#0c1324'
        }
      }
    },
  },
  plugins: [],
}
