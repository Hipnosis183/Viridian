/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#192134',
          1000: '#0c1324'
        }
      }
    },
  },
  plugins: [],
}
