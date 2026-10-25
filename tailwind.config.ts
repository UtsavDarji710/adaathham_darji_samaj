import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c", // Deep Terracotta / Saffron
          800: "#9a3412",
          900: "#7c2d12",
        },
        forest: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534", // Forest Green Accent
          900: "#14532d",
        },
        ivory: {
          50: "#fdfcf9",
          100: "#faf7f2", // Warm Ivory Background
          200: "#f3ece0",
          300: "#e7decb",
          400: "#d5c5ad",
          500: "#bca689",
        },
        charcoal: {
          900: "#161b22", // Dark Charcoal Text
          800: "#242c38",
          700: "#384454",
          600: "#536378",
          500: "#718298",
          400: "#9aa7b8",
        },
      },
      fontFamily: {
        gujarati: ["var(--font-gujarati)", "Shruti", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(22, 27, 34, 0.05)",
        card: "0 2px 12px -1px rgba(22, 27, 34, 0.06), 0 1px 3px 0 rgba(22, 27, 34, 0.04)",
        hover: "0 10px 25px -3px rgba(194, 65, 12, 0.12), 0 4px 6px -2px rgba(22, 27, 34, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
