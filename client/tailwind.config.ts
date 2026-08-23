import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          navy: '#131921',
          'navy-light': '#232f3e',
          gold: '#febd69',
          orange: '#f08804',
          'orange-hover': '#e07a00',
          'btn-yellow': '#ffd814',
          'btn-yellow-hover': '#f7ca00',
          'btn-orange': '#ffa41c',
          'btn-orange-hover': '#fa8900',
          prime: '#007185',
          'prime-hover': '#c7511f',
          'deal-red': '#cc0c39',
          'dark-text': '#0f1111',
          'muted-text': '#565959',
          'light-bg': '#eaeded',
          border: '#d5d9d9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'amazon-card': '0 2px 5px 0 rgba(213,217,217,.5)',
        'amazon-hover': '0 4px 10px 0 rgba(213,217,217,.8)',
      },
    },
  },
  plugins: [],
};

export default config;
