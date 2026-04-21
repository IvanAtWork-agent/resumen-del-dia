import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FAFAF8',
          dark: '#141412',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1E1D1B',
        },
        border: {
          DEFAULT: '#E5E2DC',
          dark: '#2E2D2A',
        },
        'text-base': {
          DEFAULT: '#1A1916',
          dark: '#F0EDE8',
        },
        'text-muted': {
          DEFAULT: '#6B6860',
          dark: '#9B9890',
        },
        accent: {
          DEFAULT: '#C41E3A',
          dark: '#E8304A',
        },
        'accent-dark': {
          DEFAULT: '#9B1729',
          dark: '#C41E3A',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
