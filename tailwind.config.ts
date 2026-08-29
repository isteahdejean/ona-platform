import type { Config } from "tailwindcss";

// Palette provisoire — a remplacer par les couleurs officielles de l'ONA
// (voir src/app/globals.css pour les variables CSS a mettre a jour).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ona: {
          primary: "var(--ona-primary)",
          "primary-dark": "var(--ona-primary-dark)",
          accent: "var(--ona-accent)",
          bg: "var(--ona-bg)",
          surface: "var(--ona-surface)",
          text: "var(--ona-text)",
          "text-muted": "var(--ona-text-muted)",
          border: "var(--ona-border)",
          teal: "var(--ona-teal)",
          "teal-bg": "var(--ona-teal-bg)",
          gold: "var(--ona-gold)",
          "gold-bg": "var(--ona-gold-bg)",
          "blue-bg": "var(--ona-blue-bg)",
          "red-bg": "var(--ona-red-bg)",
          violet: "var(--ona-violet)",
          "violet-bg": "var(--ona-violet-bg)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
export default config;
