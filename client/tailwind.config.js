/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#000000',
        dark: {
          bg: '#000000',
          surface: '#080808',
          card: '#0a0a0a',
          cardHover: '#121212',
          border: '#1c1c1c',
          borderHover: '#2a2a2a',
          input: '#0d0d0d',
          muted: '#71717a',
          subtle: '#27272a',
        },
        fintech: {
          bg: '#000000',
          surface: '#080808',
          card: '#0a0a0a',
          cardHover: '#121212',
          border: '#1c1c1c',
          borderHover: '#2a2a2a',
          accent: '#ffffff',
          emerald: '#22c55e',
          crimson: '#ef4444',
          amber: '#f59e0b',
          textMuted: '#71717a',
          textPrimary: '#ffffff',
          textSecondary: '#a1a1aa'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}

