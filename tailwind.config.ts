import type { Config } from "tailwindcss";

/**
 * Design tokens lifted directly from the Hinza Website Design PDF.
 *  - page: light blue-gray page background (except the footer)
 *  - ink:  deep navy used for headlines, dark cards and the navbar logo tile
 *  - brand.blue: royal blue used for accent words, feature cards and footer
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#EFF4FE",
        // ONE blue used everywhere (headlines, accents, buttons, cards, footer).
        ink: "#1A0FD4",
        "ink-soft": "#3F4351",
        "ink-muted": "#6B6F7B",
        navy: "#1A0FD4",
        bodyText: "#5A6273",
        brand: {
          blue: "#1A0FD4",
          "blue-dark": "#1208A8",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
      },
      fontWeight: {
        black: "800",
      },
      boxShadow: {
        card: "0 8px 30px -10px rgba(11,31,77,0.12)",
        "card-soft": "0 4px 12px -4px rgba(11,31,77,0.08)",
        cta: "0 12px 32px -10px rgba(26,15,212,0.45)",
      },
      borderRadius: {
        card: "20px",
      },
      maxWidth: {
        content: "1200px",
        pain: "900px",
        hero: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
