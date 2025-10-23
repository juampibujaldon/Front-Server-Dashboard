import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#05060b',
        },
        brand: {
          500: '#38bdf8',
          600: '#0ea5e9',
          700: '#0284c7',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(14, 165, 233, 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;
