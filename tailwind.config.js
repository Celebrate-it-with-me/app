/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  variants: {
    extend: {
      backgroundColor: ['dark'],
      borderColor: ['dark']
    }
  },
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx,vue}",
    "node_modules/flowbite/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

