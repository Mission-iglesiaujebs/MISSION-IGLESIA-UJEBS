import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#1e3a8a", light: "#3b5bdb", gold: "#c9a227" },
      },
    },
  },
  plugins: [],
};
export default config;
