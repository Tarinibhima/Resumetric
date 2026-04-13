/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'DM Serif Display'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#1A1A1A",
          muted: "#6B6B6B",
        },
        paper: {
          DEFAULT: "#FAFAF8",
          warm: "#F5F4F0",
          border: "#E8E6E1",
        },
        accent: {
          DEFAULT: "#1A56DB",
          hover: "#1446B8",
          muted: "#EBF0FF",
        },
        success: "#059669",
        danger: "#DC2626",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
