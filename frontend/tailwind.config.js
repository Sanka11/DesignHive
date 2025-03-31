/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {fontFamily: {
      'art-nuvo': ['"Art Nuvo"', 'sans-serif'],},},
  },
  plugins: [],
}
