/**
 * Brand contact points. One place for the public channels shown on the site.
 * The mailbox must exist before launch (see TASKS.md).
 */
export const SUPPORT_EMAIL = 'hola@quinvite.com'

/** mailto: link with an optional prefilled subject and body (the user reviews and sends). */
export function mailtoLink({ subject = '', body = '' } = {}) {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString().replace(/\+/g, '%20')
  return `mailto:${SUPPORT_EMAIL}${query ? `?${query}` : ''}`
}

/**
 * Sample invitation shown from the landing hero. It must exist in every environment that
 * serves the landing (the demo seeders only run locally): override with VITE_DEMO_INVITATION_PATH.
 */
export const DEMO_INVITATION_PATH = import.meta.env.VITE_DEMO_INVITATION_PATH || '/i/xv-de-valentina/VAL001'
