/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          700: '#1b2c5b',
          800: '#142147',
          900: '#0b1530',
        },
        cream: '#fff4dc',
        saffron: '#ff9933',
        'teal-dash': '#17a5a0',
      },
    },
  },
  plugins: [],
};