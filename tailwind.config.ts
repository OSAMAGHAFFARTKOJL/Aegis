import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Primary — electric indigo/violet (security / firewall)
        brand: {
          50: "#eef0ff",
          100: "#e0e3ff",
          200: "#c7ccff",
          300: "#a5a8ff",
          400: "#867dfc",
          500: "#6d5efc",
          600: "#5b42f1",
          700: "#4d33d6",
          800: "#402cac",
          900: "#372a88",
          950: "#221750",
        },
        // Danger / attack — red
        coral: {
          50: "#fff1f1",
          100: "#ffe0e0",
          200: "#ffc5c5",
          300: "#ff9d9d",
          400: "#fb6565",
          500: "#f23b3b",
          600: "#df2020",
          700: "#bb1717",
          800: "#9a1717",
          900: "#7f1a1a",
        },
        // Safe / allow — emerald (used via semantic classes)
        ink: {
          50: "#f6f7f9",
          100: "#eaecf1",
          200: "#d4d8e2",
          300: "#aeb4c6",
          400: "#838ba6",
          500: "#646c8a",
          600: "#4f566f",
          700: "#40455a",
          800: "#2f3346",
          900: "#141726",
          950: "#0a0c16",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10,12,22,0.04), 0 8px 24px -8px rgba(10,12,22,0.12)",
        glow: "0 0 0 1px rgba(109,94,252,0.15), 0 20px 50px -20px rgba(109,94,252,0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.3)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.22,1,0.36,1) infinite",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
