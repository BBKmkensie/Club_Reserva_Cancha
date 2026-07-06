/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: 'rgb(var(--color-page) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        elevated: 'rgb(var(--color-elevated) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-secondary': 'rgb(var(--color-ink-secondary) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted) / <alpha-value>)',
        line: 'rgb(var(--color-border) / <alpha-value>)',
        'line-strong': 'rgb(var(--color-border-strong) / <alpha-value>)',
        primary: {
          50: '#f4f5fc',
          100: '#e8eaf8',
          200: '#d1d6f1',
          300: '#b4bce8',
          400: '#969fdf',
          500: '#7E8CE0',
          600: '#6b78d4',
          700: '#5864c8',
          800: '#4550b8',
          900: '#3a4399',
        },
        palette: {
          periwinkle: '#7E8CE0',
          sky: '#90C2E7',
          lime: '#B8D94F',
          yellow: '#F9D423',
          orange: '#FF8C00',
          'orange-red': '#FF4E00',
          magenta: '#D81B60',
          brand: '#D32F2F',
        },
      },
    },
  },
  plugins: [],
};
