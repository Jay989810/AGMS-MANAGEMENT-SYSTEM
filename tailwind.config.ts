import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#001F3F",
          dark: "#001529",
          light: "#003366",
        },
        gold: {
          DEFAULT: "#FFB703",
          light: "#FFD54F",
          dark: "#FFA000",
        },
      },
    },
  },
  plugins: [],
};
export default config;


