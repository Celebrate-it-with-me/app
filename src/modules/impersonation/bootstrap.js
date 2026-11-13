/**
 * Imported FIRST in main.js. In a support tab, everything the app persists (the user store, the language…) goes to
 * this tab's sessionStorage instead of localStorage, so opening a session as another person never overwrites the
 * persisted state of the staff member's own app session in another tab. Elsewhere it does nothing.
 *
 * Why swap `window.localStorage`: stores and plugins read it when their module loads, and many use the persisted-state
 * default; one switch here is safer than touching each of them.
 */
import { isSupportTab } from './utils/impersonation'

if (typeof window !== 'undefined' && isSupportTab(window.location, window.sessionStorage)) {
  try {
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => window.sessionStorage })
  } catch {
    /* if the browser refuses, the stores keep using localStorage; the token itself is still tab-only */
  }
}
