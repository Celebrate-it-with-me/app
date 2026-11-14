/**
 * In-memory stand-in for the announcements endpoints, active when `VITE_ANNOUNCEMENTS_MOCK` is set. It follows the
 * contract (docs/plans/announcements-contract.md). Values of the variable:
 *   1        three announcements (warning not dismissible, news with an external button, info with line breaks)
 *   one      only the info one
 *   none     empty list
 *   error    GET fails (network error)
 *   dismissfail  dismiss answers 500
 *   evil     adds announcements with javascript:/http: links and HTML in the text (must render as plain text)
 * `localStorage['cwm.announcementsMock']` overrides the variable at runtime (handy for screenshots).
 */
const dismissed = new Set()

function mode() {
  try {
    return localStorage.getItem('cwm.announcementsMock') || String(import.meta.env.VITE_ANNOUNCEMENTS_MOCK)
  } catch {
    return String(import.meta.env.VITE_ANNOUNCEMENTS_MOCK)
  }
}

function fail(status, data) {
  const error = new Error(`mock ${status}`)
  error.response = { status, data }
  return error
}

const t = (lang, es, en) => (lang === 'en' ? en : es)

function catalog(lang) {
  const all = [
    {
      id: 1, level: 'warning', dismissible: false,
      title: t(lang, 'Mantenimiento esta noche', 'Maintenance tonight'),
      body: t(lang, 'Entre las 2:00 y las 3:00 a. m. la plataforma puede ir más lenta. Tus datos están a salvo.', 'Between 2:00 and 3:00 a.m. the platform may be slower. Your data is safe.'),
      ctaLabel: t(lang, 'Ver tus eventos', 'See your events'), ctaUrl: '/dashboard/events'
    },
    {
      id: 2, level: 'news', dismissible: true,
      title: t(lang, 'Nuevo: envía invitaciones por WhatsApp a toda tu lista de invitados con un solo toque', 'New: send invitations by WhatsApp to your whole guest list with one tap'),
      body: t(lang, 'Elige una plantilla, revisa a quién le llegará y envía.\nSi un invitado no tiene teléfono válido te avisamos antes de enviar.', 'Pick a template, review who will get it and send.\nIf a guest has no valid phone number we tell you before sending.'),
      ctaLabel: t(lang, 'Conoce más', 'Learn more'), ctaUrl: 'https://quinvite.com/novedades'
    },
    {
      id: 3, level: 'info', dismissible: true,
      title: t(lang, 'Consejo', 'Tip'),
      body: t(lang, 'Confirma tu lista de invitados 30 días antes del evento.\n\nAsí podrás ajustar el presupuesto con tiempo.', 'Confirm your guest list 30 days before the event.\n\nThat way you can adjust the budget in time.'),
      ctaLabel: null, ctaUrl: null
    }
  ]
  const evil = [
    { id: 90, level: 'news', dismissible: true, title: '<b>Oferta</b> <script>alert(1)</script>', body: '<img src=x onerror=alert(1)> texto', ctaLabel: 'Ir', ctaUrl: 'javascript:alert(1)' },
    { id: 91, level: 'info', dismissible: true, title: 'Enlace http', body: 'No debe mostrar botón.', ctaLabel: 'Ir', ctaUrl: 'http://evil.example' }
  ]
  const m = mode()
  if (m === 'none') return []
  if (m === 'one') return all.slice(2)
  if (m === 'evil') return evil
  return all
}

export const mockAnnouncements = {
  async list(lang) {
    await new Promise(r => setTimeout(r, 120))
    if (mode() === 'error') throw new Error('Network Error')
    return catalog(lang).filter(a => !dismissed.has(a.id))
  },
  async dismiss(id) {
    await new Promise(r => setTimeout(r, 150))
    if (mode() === 'dismissfail') throw fail(500, { message: 'Server error.' })
    const found = catalog('es').find(a => a.id === id)
    if (!found) throw fail(404, { message: 'Not found.', code: 'announcement_not_found' })
    if (!found.dismissible) throw fail(422, { message: 'Not dismissible.', errors: { announcement: ['not_dismissible'] } })
    dismissed.add(id)
  }
}
