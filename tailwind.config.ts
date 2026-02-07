import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        patriots: {
          navy: "#002244",
          red: "#C60C30",
          silver: "#B0B7BC",
          white: "#FFFFFF",
          gold: "#D4AF37"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px rgba(0, 34, 68, 0.15)"
      }
    }
  },
  plugins: []
};

export default config;
