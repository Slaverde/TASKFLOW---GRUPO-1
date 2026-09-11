/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0a0a0a',
          card: '#141414',
          elevated: '#1c1c1c',
        },
        primary: '#e5e5e5',
        secondary: '#737373',
        accent: '#6366f1',
        border: 'rgba(255, 255, 255, 0.06)',
        'border-hover': 'rgba(255, 255, 255, 0.1)',
        priority: {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#3b82f6',
        },
        'color-1': 'hsl(var(--color-1))',
        'color-2': 'hsl(var(--color-2))',
        'color-3': 'hsl(var(--color-3))',
        'color-4': 'hsl(var(--color-4))',
        'color-5': 'hsl(var(--color-5))',
      },
      boxShadow: {
        card: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
        modal: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        rainbow: 'rainbow var(--speed, 2s) infinite linear',
      },
      keyframes: {
        rainbow: {
          '0%': { backgroundPosition: '0%' },
          '100%': { backgroundPosition: '200%' },
        },
      },
    },
  },
  plugins: [],
}
