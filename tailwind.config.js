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
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EC4899',
          light: '#F472B6',
          dark: '#DB2777',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          light: '#C4B5FD',
          dark: '#7C3AED',
        },
        accent: '#E879F9',
        background: '#FFF1F5',
        text: {
          DEFAULT: '#111827',
          light: '#6B7280',
        }
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Open Sans"', 'sans-serif'],
        quicksand: ['"Quicksand"'],
      },
      borderRadius: {
        'xl': '1.25rem',
        '2xl': '2rem',
      },
      boxShadow: {
        card: '0 4px 40px rgba(0,0,0,0.1)',
        glow: '0 0 15px rgba(236, 72, 153, 0.6)',
      },
      spacing: {
        'section': '120px',
        'half': '60px',
      },
    },
  },
  safelist: [
    {
      pattern: /^bg-\[(.+)\]$/, // Safelists arbitrary background colors: e.g. bg-[#ac1818]
    },
  ],

  plugins: [
    require('flowbite/plugin')
  ],
}

