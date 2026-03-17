/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // ── Cyber Monochrome Palette ────────────────────────────────────
      colors: {
        void: {
          950: "#060812",  // Primary background
          900: "#080d1a",
          800: "#0c1428",
          700: "#111d3d",
        },
        neon: {
          400: "#22d3ee",  // Primary cyan accent
          500: "#06b6d4",
          600: "#0891b2",
        },
        signal: {
          300: "#fcd34d",
          400: "#fbbf24",  // Trending amber
        },
        matrix: {
          300: "#6ee7b7",
          400: "#34d399",  // Rising green
        },
      },

      // ── Typography ──────────────────────────────────────────────────
      fontFamily: {
        mono: ["JetBrains Mono", "Courier New", "monospace"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },

      // ── Animations ──────────────────────────────────────────────────
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease both",
      },

      // ── Shadows ─────────────────────────────────────────────────────
      boxShadow: {
        glass:    "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
        "neon-sm": "0 0 12px rgba(34,211,238,0.2)",
        "neon-md": "0 0 24px rgba(34,211,238,0.3)",
      },
    },
  },
  plugins: [],
};
