/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'certo': {
          'teal': '#2A7A8C',
          'teal-dark': '#1B4F5A',
          'teal-darker': '#0D3340',
          'white': '#FFFFFF',
          'gray-light': '#F4F6F7',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}