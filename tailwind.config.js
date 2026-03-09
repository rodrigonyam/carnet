/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sepia: {
          50:  '#fdf8f0',
          100: '#f9edda',
          200: '#f2d9b0',
          300: '#e8bf7d',
          400: '#dba04a',
          500: '#c8872c',
          600: '#a86e20',
          700: '#865519',
          800: '#6a4117',
          900: '#553516',
        },
        parchment: '#fdf6e3',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
