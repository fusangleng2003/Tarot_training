/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mystic: {
          void: "#0d0a1a",
          deep: "#1a1435",
          veil: "#2d2553",
          glow: "#7c5cbf",
          star: "#c9b8f0",
          moon: "#f0e8ff",
          gold: "#d4a843",
          rose: "#e8729a",
        },
      },
      fontFamily: {
        heading: ["Cinzel", "serif"],
        body: ["Noto Serif SC", "serif"],
        ui: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
