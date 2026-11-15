/**
 * `<q-…>` blocks: the package decides where a feature goes, the system decides what it does.
 * Every block lists the props a package may pass (closed list, with a validator); anything else
 * is dropped. Full-section blocks render the existing component with the matching section of the
 * invitation, so plan limits, module switches and order still decide whether it appears.
 */
import { h } from 'vue'
import { SECTION_COMPONENTS } from '../composables/sectionComponents'
import InvitationLangSwitch from '../components/InvitationLangSwitch.vue'
import InvitationButton from '../components/InvitationButton.vue'
import { formatInstant } from './variables'

const oneOf = (...values) => v => (values.includes(v) ? v : undefined)
const focus = v => (/^\d{1,3}% \d{1,3}%$/.test(String(v)) ? String(v) : undefined)
const factor = v => (/^0?\.\d{1,2}$/.test(String(v)) && +v <= 0.3 ? String(v) : undefined)
const bool = v => (v === true || v === 'true' ? true : undefined)

const IMAGE = /^(\/(?!\/)|https?:\/\/)/

/** Section type each full-section block shows. */
const SECTION_BLOCKS = {
  'q-rsvp': 'rsvp',
  'q-gallery': 'gallery',
  'q-music': 'music',
  'q-countdown': 'countdown',
  'q-locations': 'locations',
  'q-itinerary': 'itinerary',
  'q-dress-code': 'dress_code',
  'q-padrinos': 'padrinos',
  'q-closing': 'closing',
  'q-save-the-date': 'save_the_date'
}

const wrap = (name, child) => h('div', { class: `inv-q inv-q--${name}`, 'data-q': name }, [child])

const DATE_FORMATS = {
  long: { dateStyle: 'long' },
  short: { dateStyle: 'short' },
  weekday: { weekday: 'long' },
  day: { day: 'numeric' },
  month: { month: 'long' },
  year: { year: 'numeric' },
  time: { timeStyle: 'short' }
}

/**
 * @type {Record<string, { props: Record<string,(v:unknown)=>unknown>, render: (props:object, env:object, children:Function) => any }>}
 */
export const BLOCKS = {
  'q-cover-photo': {
    props: { focus, shape: oneOf('arch', 'bleed', 'rounded', 'rect'), parallax: factor, fallback: oneOf('emblem', 'none') },
    render(props, { ctx }) {
      const src = IMAGE.test(ctx.section.data?.image ?? '') ? ctx.section.data.image : null
      const type = ctx.invitation.event.typeSlug
      const emblem = { quinceanera: 'XV', wedding: '&' }[type]
      const style = props.focus ? { objectPosition: props.focus } : undefined
      const inner = src
        ? h('img', { src, alt: '', decoding: 'async', fetchpriority: 'high', style, 'data-parallax': props.parallax })
        : props.fallback === 'none'
          ? null
          : h('span', { class: 'inv-q-photo__emblem', 'aria-hidden': 'true' }, emblem ?? '')
      return h('div', { class: 'inv-q inv-q--cover-photo', 'data-q': 'cover-photo', 'data-shape': props.shape ?? 'rect', 'data-empty': src ? undefined : 'true' }, inner)
    }
  },
  'q-names': {
    props: { tag: oneOf('h1', 'h2', 'p'), split: bool },
    render(props, { ctx }) {
      const name = String(ctx.section.data?.eventName ?? ctx.invitation.event.name ?? '')
      const m = props.split ? name.match(/^(.+?)\s+(&|y|and)\s+(.+)$/) : null
      const kids = m
        ? [h('span', { class: 'inv-q-names__line' }, `${m[1]} ${m[2] === 'y' || m[2] === 'and' ? '&' : m[2]}`), h('span', { class: 'inv-q-names__line' }, m[3])]
        : name
      return h(props.tag ?? 'h1', { class: 'inv-q inv-q--names', 'data-q': 'names' }, kids)
    }
  },
  'q-date': {
    props: { format: oneOf(...Object.keys(DATE_FORMATS)) },
    render(props, { ctx }) {
      const at = ctx.invitation.event.startsAt
      const text = formatInstant(at, ctx.locale, DATE_FORMATS[props.format ?? 'long'], ctx.invitation.event.timezone)
      return h('time', { class: 'inv-q inv-q--date', 'data-q': 'date', datetime: String(at ?? '').slice(0, 19) }, text)
    }
  },
  'q-cta': {
    props: { variant: oneOf('primary', 'outline') },
    render(props, { ctx }, children) {
      if (!ctx.sections.some(s => s.type === 'rsvp')) return null // RSVP off or not in the plan: no button to nowhere
      return wrap('cta', h(InvitationButton, { variant: props.variant, onClick: ctx.scrollToRsvp }, () => (children() ?? ctx.tt('confirmCta'))))
    }
  },
  'q-language-switch': {
    props: {},
    render(_props, { ctx }) {
      return h('nav', { class: 'inv-q inv-q--language-switch', 'data-q': 'language-switch', 'aria-label': ctx.tt('language') }, [
        h(InvitationLangSwitch, { current: ctx.locale, label: ctx.tt('language'), onChange: lang => ctx.changeLanguage?.(lang) })
      ])
    }
  }
}

for (const [name, type] of Object.entries(SECTION_BLOCKS)) {
  BLOCKS[name] = {
    props: {},
    sectionType: type,
    component: SECTION_COMPONENTS[type],
    render(_props, { ctx }) {
      const section = ctx.sections.find(s => s.type === type)
      if (!section) return null // switched off, not in the plan, or never existed: nothing is drawn
      return wrap(name.slice(2), h(SECTION_COMPONENTS[type], { section }))
    }
  }
}
