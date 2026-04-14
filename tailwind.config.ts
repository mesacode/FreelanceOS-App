import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      colors: {
        bg: "#0a0e1a",
        "bg-elevated": "#131824",
        panel: "#131824",
        muted: "#1a1f2e",
        surface: "#1a1f2e",
        "surface-hover": "#232938",
        "surface-active": "#2a3042",
        border: "rgba(148, 163, 184, 0.1)",
        "border-strong": "rgba(148, 163, 184, 0.2)",
        text: "#ffffff",
        subtext: "#94a3b8",
        "text-tertiary": "#64748b",
        accent: "#7c3aed",
        "accent-from": "#6366f1",
        "accent-to": "#8b5cf6",
        "accent-strong": "#8b5cf6",
        "surface-glass": "rgba(26, 31, 46, 0.7)",
        "surface-float": "#1a1f2e",
        sidebar: "#0f1219",
        "sidebar-border": "rgba(148, 163, 184, 0.08)"
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(3, 8, 20, 0.45)",
        glow: "0 0 0 1px rgba(86, 167, 255, 0.24), 0 24px 45px rgba(13, 95, 176, 0.24)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.2)"
      },
      spacing: {
        18: "4.5rem"
      },
      animation: {
        fadeIn: "fadeIn 240ms ease-out",
        float: "float 8s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
