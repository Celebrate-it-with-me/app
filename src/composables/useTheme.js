import { ref } from 'vue'

/**
 * Composable for managing Light/Dark theme in Admin.
 * Scoped to Admin routes via InternalLayout.
 */
export function useTheme() {
  const THEME_KEY = 'cwm_admin_theme'
  const theme = ref(localStorage.getItem(THEME_KEY) || 'light')

  /**
   * Applies the 'dark' class to the <html> element.
   * Scoping Note: This class is only added/removed when navigating within Admin routes
   * where InternalLayout is used.
   */
  const applyTheme = newTheme => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem(THEME_KEY, theme.value)
    applyTheme(theme.value)
  }

  const initTheme = () => {
    applyTheme(theme.value)
  }

  /**
   * Removes the 'dark' class from the <html> element.
   * Scoping Note: Used when leaving Admin routes to ensure dark mode
   * doesn't affect public pages.
   */
  const removeTheme = () => {
    document.documentElement.classList.remove('dark')
  }

  return {
    theme,
    toggleTheme,
    initTheme,
    removeTheme
  }
}
