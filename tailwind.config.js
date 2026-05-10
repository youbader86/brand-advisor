/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Noto Kufi Arabic"', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#09090f',
          card: '#13131d',
          border: '#1e1e2e',
          teal: '#2dd4bf',
          gold: '#fbbf24',
          purple: '#818cf8',
          pink: '#f472b6',
        },
      },
    },
  },
  plugins: [],
}
