// Tailwind 4: loaded from src/style.css with @config. Only the theme lives here;
// content paths (@source), dark mode (@custom-variant) and plugins (@plugin) are in the CSS.
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EC4899',
          light: '#F472B6',
          dark: '#DB2777'
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          light: '#C4B5FD',
          dark: '#7C3AED'
        },
        accent: '#E879F9',
        background: '#FFF1F5',
        text: {
          DEFAULT: '#111827',
          light: '#6B7280'
        }
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Open Sans"', 'sans-serif']
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '2rem'
      },
      boxShadow: {
        card: '0 4px 40px rgba(0,0,0,0.1)',
        glow: '0 0 15px rgba(236, 72, 153, 0.6)'
      },
      spacing: {
        section: '120px',
        half: '60px'
      }
    }
  },
}
