/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./{App,components}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeInOut: {
          '0%, 100%': { opacity: '0' },
          '20%, 80%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in-out': 'fadeInOut 2.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}