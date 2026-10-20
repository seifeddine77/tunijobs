import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tunijobs: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1d4ed8', // Bleu profond
          600: '#1e40af',
          700: '#1e3a8a',
          red: '#e11d48', // Rouge accent drapeau tunisien
        },
      },
    },
  },
  plugins: [],
};
export default config;
