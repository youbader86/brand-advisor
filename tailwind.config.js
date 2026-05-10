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
          bg:       '#070712',
          card:     '#13131d',
          surface:  '#0c0c1a',
          elevated: '#111127',
          border:   '#1a1a2e',
          line:     '#232345',
          teal:     '#2dd4bf',
          gold:     '#f59e0b',
          muted:    '#475569',
          subtle:   '#94a3b8',
          text:     '#e2e8f0',
          // legacy compat
          purple:   '#818cf8',
          pink:     '#f472b6',
        },
      },
    },
  },
  plugins: [],
}
