import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/*.tsx", "./components/**/*.tsx", "./lib/**/*.ts"],
  theme: {
    extend: {
      colors: {
        night: { 900: "#0d0a1a", 800: "#151026", 700: "#1e1736" },
        accent: { DEFAULT: "#ff4f8b", 2: "#ff74a4" },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
} satisfies Config
