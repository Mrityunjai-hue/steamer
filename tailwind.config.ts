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
        bgDeep: "#171a21",
        bgPage: "#1b2838",
        panel: "#2a475e",
        panel2: "#16202d",
        accent: "#66c0f4",
        accentHover: "#1a9fff",
        textMain: "#c7d5e0",
        textDim: "#8f98a0",
        ctaFrom: "#75b022",
        ctaTo: "#588a1b",
        danger: "#c23c2a",
        warn: "#e4b222",
        ok: "#5ba32b",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 15px rgba(102, 192, 244, 0.35)",
        panelGlow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        ctaGlow: "0 0 12px rgba(117, 176, 34, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;

