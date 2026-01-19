/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: '#FCFBF9',
        walnut: '#2C1B12',
        oatmeal: '#F5F2ED',
        hotpink: '#FF69B4',
        taupe: '#A38B71',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderWidth: {
        DEFAULT: '1px',
      },
      borderColor: {
        DEFAULT: '#A38B71',
      },
    },
  },
  plugins: [],
}
