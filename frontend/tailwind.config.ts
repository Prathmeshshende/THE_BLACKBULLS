import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf3",
          100: "#d1fae5",
          500: "#16a34a",
          600: "#15803d",
          700: "#166534",
        },
        luxury: {
          500: "#0f766e",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
        },
      },
      boxShadow: {
        soft: "0 14px 42px rgba(15, 23, 42, 0.12)",
        premium: "0 24px 64px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0f766e 0%, #0ea5e9 45%, #10b981 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
