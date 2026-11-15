import { createApp, h, ref } from 'vue'
import i18n from '@/locales/i18n'
import { renderAst } from '../renderer'
import { el, q, text, v, when } from './dsl'

export { el, q, text, v, when }
export const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })

export const SECTIONS = [
  { type: 'cover', title: 'Te invito a celebrar', text: 'Quiero compartir este día.', data: { eventName: 'Los XV de Valentina', description: 'Una noche de vals.', image: '/demo/valentina-portrait.webp' } },
  { type: 'itinerary', title: 'Programa', text: null, data: { items: [] } },
  { type: 'rsvp', title: 'Confirma', text: null, data: {} }
]

export function makeCtx(over = {}) {
  const sections = over.sections ?? SECTIONS
  return {
    invitation: { event: { name: 'Los XV de Valentina', typeSlug: 'quinceanera', startsAt: '2026-12-28T19:00:00', timezone: 'America/New_York' }, guest: { name: 'Rosa Fernández' }, theme: { name: 'classic' }, sections, ...(over.invitation ?? {}) },
    sections,
    section: sections[0],
    position: 1,
    count: sections.length,
    locale: 'es',
    tt,
    scrollToRsvp: () => {},
    changeLanguage: () => {},
    ...over.ctx
  }
}

/** Render an AST into a real DOM node and return it with the warnings the renderer produced. */
export function renderToDom(ast, ctxOver = {}) {
  const warnings = []
  const host = document.createElement('div')
  const ctx = makeCtx(ctxOver)
  createApp({ render: () => h('div', { id: 'out' }, renderAst(ast, { ctx, base: 'https://assets.test/p/1.0.0/', warnings })) })
    .provide('__unused', ref(null))
    .mount(host)
  return { html: host.innerHTML, root: host, warnings }
}

export function renderVNode(ast, ctxOver = {}) {
  const warnings = []
  const vnode = renderAst(ast, { ctx: makeCtx(ctxOver), base: 'https://assets.test/p/1.0.0/', warnings })
  return { vnode, warnings }
}
