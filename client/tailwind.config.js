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
          subtle: '#F4F4F6',
          surface: '#FFFFFF',
          border: '#E4E4E7',
          borderSubtle: '#F4F4F5',
          textPrimary: '#09090B',
          textSecondary: '#52525B',
          textMuted: '#A1A1AA',
          emerald: '#059669',
          emeraldBg: '#ECFDF5',
          emeraldBorder: '#A7F3D0',
          rose: '#E11D48',
          roseBg: '#FFF1F2',
          roseBorder: '#FECDD3',
          amber: '#D97706',
          amberBg: '#FEF3C7',
          amberBorder: '#FDE68A',
          blue: '#2563EB',
          blueBg: '#EFF6FF',
          blueBorder: '#BFDBFE',
          slate: '#334155',
          slateBg: '#F1F5F9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        'clean-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'clean-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'clean-md': '0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -2px rgba(0, 0, 0, 0.03)',
        'clean-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.06), 0 4px 10px -4px rgba(0, 0, 0, 0.03)'
      }
    },
  },
  plugins: [],
}


