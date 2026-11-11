// Tailwind 4: loaded from src/style.css with @config.
// Only legacy values used by screens not migrated yet live here. New tokens (colors, fonts,
// radius, shadows) are in src/style.css under @theme. Remove entries as screens are migrated.
module.exports = {
  theme: {
    extend: {
      colors: {
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
        // Legacy screens used font-display for body text; keep it a sans until they are migrated.
        display: ['Poppins', 'Figtree', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 15px rgba(236, 72, 153, 0.6)'
      },
      spacing: {
        section: '120px',
        half: '60px'
      }
    }
  }
}
