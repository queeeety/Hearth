/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', "'SF Pro Display'", "'Inter'", 'sans-serif'],
      },
      colors: {
        green: {
          primary: '#34C759',
          light: '#E8F7ED',
          dark: '#248A3D',
        },
        ios: {
          bg: '#F2F2F7',
          surface: '#FFFFFF',
          amber: '#FF9500',
          red: '#FF3B30',
          blue: '#007AFF',
          separator: 'rgba(60,60,67,0.12)',
        }
      },
      borderRadius: {
        'ios': '12px',
        'ios-sm': '10px',
      },
      boxShadow: {
        'ios': '0 1px 0 0 rgba(60,60,67,0.12)',
      },
      animation: {
        'shake': 'shake 0.4s ease-in-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
      },
    }
  },
  plugins: [],
}
