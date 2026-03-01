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
        neon: {
          mint:    "#00e5a0",
          sky:     "#38bdf8",
          violet:  "#a78bfa",
          rose:    "#f43f5e",
          amber:   "#fbbf24",
        },
        glass: {
          50:  "rgba(255,255,255,0.05)",
          100: "rgba(255,255,255,0.08)",
          200: "rgba(255,255,255,0.12)",
          border: "rgba(255,255,255,0.10)",
        },
        deep: {
          950: "#020817",
          900: "#060b14",
          800: "#0a1520",
          700: "#0d1f30",
        },
      },
      boxShadow: {
        soft:          "0 14px 42px rgba(15,23,42,0.12)",
        premium:       "0 24px 64px rgba(15,23,42,0.18)",
        "glow-mint":   "0 0 24px rgba(0,229,160,0.35), 0 0 48px rgba(0,229,160,0.15)",
        "glow-sky":    "0 0 24px rgba(56,189,248,0.35), 0 0 48px rgba(56,189,248,0.15)",
        "glow-violet": "0 0 24px rgba(167,139,250,0.35), 0 0 48px rgba(167,139,250,0.15)",
        "glow-rose":   "0 0 24px rgba(244,63,94,0.40), 0 0 48px rgba(244,63,94,0.18)",
        "glow-amber":  "0 0 20px rgba(251,191,36,0.35)",
        "glass-card":  "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
        "glass-lg":    "0 16px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "brand-gradient":      "linear-gradient(135deg, #0f766e 0%, #0ea5e9 45%, #10b981 100%)",
        "neon-gradient":       "linear-gradient(135deg, #00e5a0 0%, #38bdf8 50%, #a78bfa 100%)",
        "neon-gradient-h":     "linear-gradient(90deg, #00e5a0 0%, #38bdf8 100%)",
        "dark-mesh":           "radial-gradient(ellipse 80% 60% at 10% -10%, rgba(0,229,160,0.18) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 95% 5%, rgba(56,189,248,0.16) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 50% 110%, rgba(167,139,250,0.14) 0%, transparent 55%), radial-gradient(ellipse 80% 80% at 50% 50%, rgba(6,11,20,0.0) 0%, #020817 80%)",
        "card-glass":          "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        "metric-mint":         "linear-gradient(135deg, rgba(0,229,160,0.12) 0%, rgba(0,229,160,0.03) 100%)",
        "metric-sky":          "linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(56,189,248,0.03) 100%)",
        "metric-violet":       "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(167,139,250,0.03) 100%)",
        "metric-rose":         "linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(244,63,94,0.03) 100%)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 16px rgba(0,229,160,0.5)" },
          "50%":       { opacity: "0.7", boxShadow: "0 0 40px rgba(0,229,160,0.8), 0 0 80px rgba(0,229,160,0.3)" },
        },
        "pulse-glow-rose": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 16px rgba(244,63,94,0.5)" },
          "50%":       { opacity: "0.8", boxShadow: "0 0 40px rgba(244,63,94,0.8)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "waveform": {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%":      { transform: "scaleY(1)" },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "border-flow": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "number-pop": {
          "0%":   { transform: "scale(0.85)", opacity: "0" },
          "60%":  { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)",    opacity: "1" },
        },
        "mic-ring": {
          "0%":   { transform: "scale(1)",    opacity: "0.6" },
          "100%": { transform: "scale(2.2)",  opacity: "0" },
        },
      },
      animation: {
        "pulse-glow":      "pulse-glow 2.4s ease-in-out infinite",
        "pulse-glow-rose": "pulse-glow-rose 1.8s ease-in-out infinite",
        "float":           "float 4s ease-in-out infinite",
        "slide-up":        "slide-up 0.5s ease-out both",
        "fade-in":         "fade-in 0.4s ease-out both",
        "waveform-1":      "waveform 0.9s ease-in-out infinite",
        "waveform-2":      "waveform 0.9s ease-in-out 0.15s infinite",
        "waveform-3":      "waveform 0.9s ease-in-out 0.3s infinite",
        "waveform-4":      "waveform 0.9s ease-in-out 0.45s infinite",
        "waveform-5":      "waveform 0.9s ease-in-out 0.6s infinite",
        "spin-slow":       "spin-slow 8s linear infinite",
        "border-flow":     "border-flow 3s ease infinite",
        "number-pop":      "number-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        "mic-ring":        "mic-ring 1.5s ease-out infinite",
      },
      backdropBlur: {
        "2xl": "40px",
        "3xl": "60px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
