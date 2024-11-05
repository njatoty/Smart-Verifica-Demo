/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-optimum': '#619FCB',
        'darkblue-optimum': '#203543',
        'dark': '#102F4E'
      }
    },
  },
  plugins: [],
}

