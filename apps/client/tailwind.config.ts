import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design system tokens
        canvas:  { DEFAULT: '#F8F6F3', dark: '#0D0C0B' },
        card:    { DEFAULT: '#FFFFFF',  dark: '#161514' },
        rim:     { DEFAULT: '#E8E4DE', dark: '#252320' },
        ink:     { DEFAULT: '#0F0E0D', secondary: '#5A5754', tertiary: '#9A9790', invert: '#F2EFE9' },
        // Legacy tokens (admin pages)
        background:   { DEFAULT: '#FAFAF8', dark: '#141412' },
        surface:      { DEFAULT: '#FFFFFF',  dark: '#1E1D1B' },
        border:       { DEFAULT: '#E5E2DC', dark: '#2E2D2A' },
        'text-base':  { DEFAULT: '#1A1916', dark: '#F0EDE8' },
        'text-muted': { DEFAULT: '#6B6860', dark: '#9B9890' },
        accent:       { DEFAULT: '#C41E3A', dark: '#E8304A' },
        'accent-dark':{ DEFAULT: '#9B1729', dark: '#C41E3A' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.35s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
