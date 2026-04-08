import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg1: 'var(--bg1)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        green: 'var(--green)',
        red: 'var(--red)',
        amber: 'var(--amber)',
        blue: 'var(--blue)',
        purple: 'var(--purple)',
        gold: 'var(--gold)',
      },
      fontFamily: {
        serif: ['Syne', 'sans-serif'],
        sans: ['Mulish', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
