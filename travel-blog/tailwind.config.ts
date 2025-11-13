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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Mobile-first breakpoints (already default in Tailwind but explicitly defined)
      screens: {
        'sm': '640px',   // Mobile
        'md': '768px',   // Tablet
        'lg': '1024px',  // Desktop
        'xl': '1280px',  // Large desktop
        '2xl': '1536px', // Extra large
      },
    },
  },
  plugins: [],
};
export default config;
