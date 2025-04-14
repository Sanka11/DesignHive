/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "art-nuvo": ['"Art Nuvo"', "sans-serif"],
      },
      colors: {
        "honey-yellow": {
          400: "#ffcc33",
          500: "#ffbf00",
          600: "#e6ac00",
        },
        "bee-black": {
          500: "#333333",
        },
        "bee-white": {
          500: "#FFF8D9",
        },
        honeycomb: {
          500: "#c5af19",
        },
      },
      animation: {
        stripes: "stripes 2s linear infinite",
      },
      keyframes: {
        stripes: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "1rem 0" },
        },
      },
    },
  },
  plugins: [],
};