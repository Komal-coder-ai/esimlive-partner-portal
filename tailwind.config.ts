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
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
          surface: "var(--primary-surface)",
          tint: "var(--primary-tint)",
          accent: "var(--primary-accent)",
        },
        dark: {
          bg: "var(--dark-bg)",
          surface: "var(--dark-surface)",
          border: "var(--dark-border)",
          muted: "var(--dark-text-muted)",
          dim: "var(--dark-text-dim)",
        },
        page: {
          bg: "var(--bg-page)",
          card: "var(--bg-card)",
          muted: "var(--bg-muted)",
        },
        border: {
          light: "var(--border-light)",
          input: "var(--border-input)",
          dashed: "var(--border-dashed)",
        },
        text: {
          main: "var(--text-main)",
          muted: "var(--text-muted)",
          dim: "var(--text-dim)",
          sub: "var(--text-dark-sub)",
        },
        accent: {
          event: "var(--accent-event)",
          eventLight: "var(--accent-event-light)",
          tour: "var(--accent-tour)",
          tourLight: "var(--accent-tour-light)",
          indigo: "var(--accent-indigo)",
          blue: "var(--accent-blue)",
          sky: "var(--accent-sky)",
          shop: "var(--accent-shop)",
          stay: "var(--accent-stay)",
          wellness: "var(--accent-wellness)",
          transport: "var(--accent-transport)",
          attraction: "var(--accent-attraction)",
        },
        star: {
          gold: "var(--star-gold)",
          bg: "var(--star-bg)",
          border: "var(--star-border)",
          text: "var(--star-text)",
        },
        alert: {
          red: "var(--alert-red)",
          border: "var(--alert-border)",
          bg: "var(--alert-bg)",
        },
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 3px rgba(23, 201, 154, 0.18)",
        "glow-lg": "0 0 0 4px rgba(23, 201, 154, 0.12)",
        btn: "0 10px 24px -10px rgba(23, 201, 154, 0.8)",
        card: "0 20px 50px -24px rgba(16, 34, 46, 0.25)",
        phone: "0 40px 70px -30px rgba(11, 22, 32, 0.55), inset 0 0 0 2px #26323c",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};

export default config;

