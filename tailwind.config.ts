import type { Config } from "tailwindcss";
// Los colores de marca se configuran desde Panel → Configuración (variables CSS en el layout)
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "rgb(var(--brand, 30 58 138) / <alpha-value>)",
          light: "rgb(var(--brand-light, 59 91 219) / <alpha-value>)",
          gold: "rgb(var(--brand-gold, 201 162 39) / <alpha-value>)",
        },
      },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "none" } },
        glow: { "0%,100%": { opacity: ".55" }, "50%": { opacity: "1" } },
      },
      animation: { rise: "rise .7s ease-out both", glow: "glow 4s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;
