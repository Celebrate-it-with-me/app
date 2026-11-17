/**
 * `<q-…>` blocks: the package decides where a feature goes, the system decides what it does.
 * Names and props are the server catalogue (BlockCatalog::BLOCKS): every block lists the props a
 * package may pass (closed list, with a validator); anything else is dropped. Full-section blocks
 * render the existing component with the matching section of the invitation, so plan limits,
 * module switches and order still decide whether it appears. Blocks are leaves in v1.
 */
import { h } from 'vue'
import { FrameScope } from '../composables/frame'
import i18n from '@/locales/i18n'
import { SECTION_COMPONENTS } from '../composables/sectionComponents'
import InvitationLangSwitch from '../components/InvitationLangSwitch.vue'
import InvitationButton from '../components/InvitationButton.vue'
import { formatInstant } from './variables'

const oneOf = (...values) => v => (values.includes(String(v)) ? String(v) : undefined)
const focus = v => (/^\d{1,3}% \d{1,3}%$/.test(String(v)) ? String(v) : undefined)
const bool = v => (v === true || v === 'true' ? true : v === false || v === 'false' ? false : undefined)
const int = (min, max) => v => (/^\d{1,3}$/.test(String(v)) && +v >= min && +v <= max ? +v : undefined)

const IMAGE = /^(\/(?!\/)|https?:\/\/)/

const FRAME = oneOf('full', 'no-title', 'bare')
const wrap = (name, child, extra = {}) => h('div', { class: `inv-q inv-q--${name}`, 'data-q': name, ...extra }, child === undefined ? undefined : [child])

const DATE = {
  weekday: { long: { weekday: 'long' }, short: { weekday: 'short' } },
  month: { long: { month: 'long' }, short: { month: 'short' } },
  day: { day: 'numeric' },
  year: { year: 'numeric' },
  time: { timeStyle: 'short' },
  full: { dateStyle: 'full' }
}

const scrollTo = id => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/** Full-section blocks: block name → section type and the props forwarded to the component. */
const SECTION_BLOCKS = {
  rsvp: { type: 'rsvp', props: { frame: FRAME, variant: oneOf('card', 'paper', 'inline') } },
  gallery: { type: 'gallery', props: { frame: FRAME, layout: oneOf('grid', 'carousel'), columns: int(2, 4), max: int(1, 40), captions: bool } },
  music: { type: 'music', props: { variant: oneOf('bar', 'button') } },
  countdown: { type: 'countdown', props: { frame: FRAME, format: oneOf('full', 'compact') } },
  locations: { type: 'locations', props: { frame: FRAME, variant: oneOf('list', 'cards'), maps: bool } },
  itinerary: { type: 'itinerary', props: { frame: FRAME, variant: oneOf('timeline', 'list') } },
  'dress-code': { type: 'dress_code', props: { frame: FRAME, variant: oneOf('plain', 'swatches') } },
  padrinos: { type: 'padrinos', props: { frame: FRAME, variant: oneOf('list', 'grid') } },
  tables: { type: 'tables', props: { frame: FRAME, variant: oneOf('inline', 'card') } },
  'suggested-music': { type: 'suggested_music', props: { frame: FRAME, variant: oneOf('list', 'cards') } },
  comments: { type: 'comments', props: { frame: FRAME, variant: oneOf('list', 'cards'), max: int(1, 20) } },
  closing: { type: 'closing', props: { frame: FRAME, variant: oneOf('band', 'plain') } },
  'save-the-date': { type: 'save_the_date', props: { frame: FRAME, calendar: bool } }
}

/**
 * @type {Record<string, { props: Record<string,(v:unknown)=>unknown>, render: (props:object, env:object, children:Function) => any }>}
 */
export const BLOCKS = {
  'cover-photo': {
    props: { aspect: oneOf('4:5', '3:4', '16:10', '1:1'), fit: oneOf('cover', 'contain'), focus, priority: bool },
    render(props, { ctx }) {
      const cover = ctx.invitation.sections?.find(s => s.type === 'cover') ?? ctx.section
      const src = IMAGE.test(cover.data?.image ?? '') ? cover.data.image : null
      const emblem = { quinceanera: 'XV', wedding: '&' }[ctx.invitation.event.typeSlug]
      const style = {}
      if (props.aspect) style.aspectRatio = props.aspect.replace(':', ' / ')
      const imgStyle = { objectPosition: props.focus, objectFit: props.fit }
      const inner = src
        ? h('img', { class: 'inv-cover__image', src, alt: '', decoding: 'async', fetchpriority: props.priority === false ? 'auto' : 'high', style: imgStyle })
        : [
            h('span', { class: 'inv-q-photo__tint', 'aria-hidden': 'true' }),
            h('span', { class: 'inv-q-photo__emblem', 'aria-hidden': 'true' }, emblem ?? '')
          ]
      return h('div', { class: 'inv-q inv-q--cover-photo', 'data-q': 'cover-photo', 'data-empty': src ? undefined : 'true', 'data-sized': props.aspect ? 'true' : undefined, style }, inner)
    }
  },
  names: {
    props: { tag: oneOf('h1', 'h2', 'p', 'div'), script: bool },
    render(props, { ctx }) {
      const name = String(ctx.invitation.event.name ?? '')
      return h(props.tag ?? 'h1', { class: ['inv-q inv-q--names', props.script ? 'inv-q--script' : ''], 'data-q': 'names' }, name)
    }
  },
  date: {
    props: { format: oneOf('columns', 'ring', 'inline'), weekday: oneOf('short', 'long', 'none'), month: oneOf('short', 'long'), time: bool },
    render(props, { ctx }) {
      const at = ctx.invitation.event.startsAt
      const tz = ctx.invitation.event.timezone
      const f = o => formatInstant(at, ctx.locale, o, tz)
      const weekday = props.weekday === 'none' ? '' : f(DATE.weekday[props.weekday ?? 'long'])
      const month = f(DATE.month[props.month ?? 'long'])
      const day = f(DATE.day)
      const year = f(DATE.year)
      const time = props.time === false ? '' : f(DATE.time)
      const format = props.format ?? 'columns'
      const attrs = { class: 'inv-q inv-q--date', 'data-q': 'date', 'data-format': format }
      if (format === 'inline') {
        return h('time', { ...attrs, datetime: String(at ?? '').slice(0, 19) }, [weekday, weekday ? ', ' : '', day, ' ', month, ' ', year, time ? ` · ${time}` : ''].join(''))
      }
      const sub = [year, time].filter(Boolean).join(' · ')
      return h('time', { ...attrs, datetime: String(at ?? '').slice(0, 19) }, [
        h('span', { class: 'inv-date__row' }, [
          weekday ? h('span', { class: 'inv-date__weekday' }, weekday) : null,
          h('span', { class: 'inv-date__day' }, day),
          h('span', { class: 'inv-date__month' }, month)
        ]),
        h('span', { class: 'inv-date__sub' }, sub)
      ])
    }
  },
  cta: {
    props: { action: oneOf('confirm', 'calendar', 'locations'), variant: oneOf('fill', 'outline') },
    render(props, { ctx }) {
      const action = props.action ?? 'confirm'
      const target = { confirm: ['rsvp', 'rsvp'], calendar: ['save_the_date', 'save-the-date'], locations: ['locations', 'locations'] }[action]
      // The target switched off or not in the plan: no button to nowhere.
      if (!ctx.sections.some(s => s.type === target[0])) return null
      const label = { confirm: ctx.tt('confirmCta'), calendar: ctx.tt('saveTheDate.addToCalendar'), locations: ctx.tt('directions') }[action]
      const go = action === 'confirm' && ctx.scrollToRsvp ? ctx.scrollToRsvp : scrollTo(target[0])
      return wrap('cta', h(InvitationButton, { variant: props.variant === 'outline' ? 'outline' : 'primary', onClick: go }, () => label))
    }
  },
  'language-switch': {
    props: { variant: oneOf('buttons', 'dropdown') },
    render(props, { ctx }) {
      return h('nav', { class: 'inv-q inv-q--language-switch', 'data-q': 'language-switch', 'aria-label': ctx.tt('language') }, [
        h(InvitationLangSwitch, { current: ctx.locale, label: ctx.tt('language'), variant: props.variant, onChange: lang => ctx.changeLanguage?.(lang) })
      ])
    }
  },
  seats: {
    props: {},
    render(_props, { ctx }) {
      const data = ctx.invitation.sections?.find(s => s.type === 'rsvp')?.data
      if (!data) return null
      const n = 1 + (data.companions?.length ?? 0)
      return h('p', { class: 'inv-q inv-q--seats', 'data-q': 'seats' }, i18n.global.t('invitation.seats', { n }, { locale: ctx.locale, plural: n }))
    }
  },
  address: {
    props: { line: oneOf('name', 'full') },
    render(props, { ctx }) {
      const place = ctx.invitation.sections?.find(s => s.type === 'locations')?.data?.items?.[0]
      if (!place) return null
      const full = [place.address, [place.city, place.state, place.zipCode].filter(Boolean).join(', ')].filter(Boolean)
      return h('p', { class: 'inv-q inv-q--address', 'data-q': 'address' }, [
        h('span', { class: 'inv-address__name' }, place.name),
        ...(props.line === 'full' ? full.map(line => h('span', { class: 'inv-address__line' }, line)) : [])
      ])
    }
  },
  guest: {
    props: { greeting: bool },
    render(props, { ctx }) {
      const name = ctx.invitation.guest?.name
      if (!name) return null
      return h('div', { class: 'inv-q inv-q--guest', 'data-q': 'guest' }, [
        props.greeting === false ? null : h('p', { class: 'inv-guest__label' }, ctx.tt('invitedFor')),
        h('p', { class: 'inv-guest__name' }, name)
      ])
    }
  },
  /** Layout only: draws the visible sections where `layout.html` puts it. */
  sections: {
    props: {},
    layoutOnly: true,
    render(_props, { ctx }) {
      return typeof ctx.renderSections === 'function' ? ctx.renderSections() : null
    }
  }
}

for (const [name, spec] of Object.entries(SECTION_BLOCKS)) {
  BLOCKS[name] = {
    props: spec.props,
    sectionType: spec.type,
    render(props, { ctx }) {
      const section = ctx.sections.find(s => s.type === spec.type)
      if (!section) return null // switched off, not in the plan, or never existed: nothing is drawn
      // The package draws its own frame unless it asks for the engine's (`frame="full"`).
      const { frame, ...rest } = props
      return wrap(name, h(FrameScope, { frame: frame ?? 'bare' }, () => h(SECTION_COMPONENTS[spec.type], { section, ...rest })))
    }
  }
}
