import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#38bdf8",
          400: "#38bdf8",
          500: "#2563eb",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e3a5f",
          900: "#0f172a",
          950: "#0f172a",
        },
        navy: {
          DEFAULT: "#0F172A",
          50: "#f8fafc",
        },
        royal: {
          DEFAULT: "#2563EB",
        },
        sky: {
          DEFAULT: "#38BDF8",
        },
        ink: {
          DEFAULT: "#1F2937",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
