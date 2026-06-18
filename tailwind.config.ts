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
        /* ─── Lovable-inspired warm design system ─── */
        cream: {
          DEFAULT: "#f7f4ed",
          50: "#fcfbf8",
        },
        charcoal: {
          DEFAULT: "#1c1c1c",
        },
        offwhite: {
          DEFAULT: "#fcfbf8",
        },
        line: {
          DEFAULT: "#eceae4",
        },
        muted: {
          DEFAULT: "#5f5f5d",
        },
        /* Brand scale remapped onto the warm charcoal/cream system so existing
           pages stay coherent within the new aesthetic. */
        brand: {
          50: "#f7f4ed",
          100: "#eceae4",
          200: "#e0ddd4",
          300: "#c9c5b9",
          400: "#8a8a86",
          500: "#5f5f5d",
          600: "#1c1c1c",
          700: "#1c1c1c",
          800: "#161616",
          900: "#0f0f0f",
          950: "#0a0a0a",
        },
        navy: {
          DEFAULT: "#1c1c1c",
          50: "#f7f4ed",
        },
        royal: {
          DEFAULT: "#1c1c1c",
        },
        sky: {
          DEFAULT: "#5f5f5d",
        },
        ink: {
          DEFAULT: "#1c1c1c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        inset:
          "rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px",
        focusWarm: "rgba(0,0,0,0.1) 0px 4px 12px",
      },
    },
  },
  plugins: [],
};

export default config;
