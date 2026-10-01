/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          base: "#FAF9F5",         // Warm Ivory Base
          surface: "#F4F1EA",      // Subtle card background
          charcoal: "#1A1A1A",     // Primary text / headers
          muted: "#6B655F",        // Secondary body text
          border: "#E5DFD5",       // Delicate divider border
          gold: "#C5A059",         // Champagne Gold accent
          "gold-hover": "#B38E46",
          burgundy: "#671E2E",     // Muted deep burgundy accent
          "burgundy-hover": "#521623",
          light: "#FFFFFF",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px rgba(26, 26, 26, 0.05)",
        drawer: "-4px 0 24px rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideLeft: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};
