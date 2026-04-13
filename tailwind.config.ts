import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#09090b",
        panel: "#111114",
        muted: "#18181b",
        border: "#27272a",
        text: "#fafafa",
        subtext: "#a1a1aa",
        accent: "#7c3aed"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.25)"
      }
    }
  },
  plugins: []
} satisfies Config;