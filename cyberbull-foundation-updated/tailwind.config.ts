import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-xl': '0 24px 80px rgba(15, 23, 42, 0.14)',
        'soft-lg': '0 14px 40px rgba(15, 23, 42, 0.10)',
      },
      backgroundImage: {
        'auth-glow':
          'radial-gradient(circle at top left, rgba(22,116,234,0.16), transparent 32%), radial-gradient(circle at bottom right, rgba(47,169,67,0.16), transparent 28%)',
      },
      colors: {
        cyberblue: '#1674ea',
        cybergreen: '#2fa943',
      },
    },
  },
  plugins: [],
} satisfies Config
