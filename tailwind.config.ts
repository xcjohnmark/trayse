import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#000000",
        surface: {
          DEFAULT: "#090A0E",
          elevated: "#12141C",
        },
        "border-hairline": "#1F232F",
        border: {
          DEFAULT: "#1F232F",
          hairline: "#1F232F",
        },
        mint: {
          50: "#F2FDF8",
          100: "#E3FAF0",
          200: "#CEF7E4",
          300: "#B4F1D3",
          400: "#7CE4AF",
          500: "#00D688",
          600: "#00BF78",
          DEFAULT: "#00D688",
          glow: "#00FFA3",
        },
        crimson: {
          DEFAULT: "#F6465D",
          glow: "#FF5C72",
        },
        trayse: {
          dark: "#0F1014",
          pill: "#121316",
          accent: "#00D688",
          glow: "#00FFA3",
        },
      },
      fontFamily: {
        display: ["var(--font-newblack)", "NewBlack", "sans-serif"],
        sans: [
          "var(--font-urbanist)",
          "Urbanist",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        eyebrow: ["var(--font-raleway)", "Raleway", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
