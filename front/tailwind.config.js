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
      },
      fontSize: {
        'sm': '0.87rem',
        'xxs': '0.625rem', // Extra extra small
      },
      lineHeight: {
        'extra-loose': '2.5',
        '12': '3rem',      // Custom line height
      },
    },
  },
  plugins: [],
}

