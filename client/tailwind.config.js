/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          border: '#E4E4E7',
          borderSubtle: '#F4F4F5',
          textPrimary: '#09090B',
          textSecondary: '#71717A',
          textMuted: '#A1A1AA',
          emerald: '#16A34A',
          emeraldBg: '#F0FDF4',
          crimson: '#DC2626',
          crimsonBg: '#FEF2F2',
          slate: '#475569',
          slateBg: '#F1F5F9'
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

