/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Rubik"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        holoshift: {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-150%) rotate(8deg)' },
          '100%': { transform: 'translateX(150%) rotate(8deg)' },
        },
      },
      animation: {
        holoshift: 'holoshift 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
