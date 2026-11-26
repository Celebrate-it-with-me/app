import { describe, it, expect } from 'vitest'
import i18n, { setLocale } from '@/locales/i18n'
import { planPercent, phaseSummary, routePhases, routeMilestones, routeAvailability, summarizeRsvp, rsvpShares, planProgress, countdownInfo, statsFigures, activitySentence, activityTime } from '../dashboardLogic'

describe('summarizeRsvp', () => {
  it('maps the stats payload', () => {
    const r = summarizeRsvp({
      data: {
        attending: { total: 29, guests: 20 },
        pending: { total: 7, guests: 5 },
        not_attending: { total: 3 },
        totals: { people: 39, guests: 25 },
        response_rate: 80
      }
    })
    expect(r).toMatchObject({ attending: 29, pending: 7, declined: 3, people: 39, pendingGuests: 5, responseRate: 80 })
  })
  it('is all zeros when stats are missing', () => {
    expect(summarizeRsvp({})).toMatchObject({ attending: 0, pending: 0, declined: 0, people: 0 })
  })
})

describe('rsvpShares', () => {
  it('always adds up to 100', () => {
    const s = rsvpShares({ attending: 1, pending: 1, declined: 1 })
    expect(s.attending + s.pending + s.declined).toBe(100)
  })
  it('is zero with no one invited', () => {
    expect(rsvpShares({ attending: 0, pending: 0, declined: 0 })).toEqual({ attending: 0, pending: 0, declined: 0 })
  })
})

describe('planProgress', () => {
  it('reads the assistant number as it is', () => {
    expect(planProgress({ mode: 'normal', progress: { done: 7, total: 18 } })).toEqual({ done: 7, total: 18, ratio: 7 / 18 })
  })
  it('is null without assistant data, for unsupported or dateless events and for an empty plan', () => {
    expect(planProgress(null)).toBeNull()
    expect(planProgress({ mode: 'unsupported', progress: { done: 1, total: 2 } })).toBeNull()
    expect(planProgress({ mode: 'no_date', progress: { done: 1, total: 2 } })).toBeNull()
    expect(planProgress({ mode: 'normal', progress: { done: 0, total: 0 } })).toBeNull()
    expect(planProgress({ mode: 'normal' })).toBeNull()
  })
  it('keeps done inside 0..total', () => {
    expect(planProgress({ progress: { done: 9, total: 4 } }).done).toBe(4)
    expect(planProgress({ progress: { done: -1, total: 4 } }).done).toBe(0)
    expect(planProgress({ progress: { done: 'x', total: 4 } }).done).toBe(0)
  })
})

describe('countdownInfo', () => {
  it('has no date, past, today and future', () => {
    expect(countdownInfo(null).kind).toBe('none')
    expect(countdownInfo(-3).kind).toBe('past')
    expect(countdownInfo(0).kind).toBe('today')
    expect(countdownInfo(142)).toEqual({ kind: 'future', n: 142 })
  })
})

describe('statsFigures', () => {
  it('lists the four figures with people (companions included) as the total', () => {
    const f = statsFigures({ attending: 5, pending: 3, declined: 1, people: 9 })
    expect(f.empty).toBe(false)
    expect(f.items.map(i => [i.key, i.value])).toEqual([['attending', 5], ['pending', 3], ['declined', 1], ['total', 9]])
  })
  it('is empty with nobody on the list', () => {
    expect(statsFigures({ attending: 0, pending: 0, declined: 0, people: 0 }).empty).toBe(true)
  })
})

describe('activitySentence', () => {
  const T = {
    es: {
      template: [{ type: 'invitation_template_changed', params: { actor: 'Marisol Fernández', template: 'Clásica · Quinceañera' } }, 'Marisol Fernández cambió la plantilla a Clásica · Quinceañera'],
      song: [{ type: 'music_suggested', params: { name: 'Rosa Fernández', song: 'Carnicero' } }, 'Rosa Fernández sugirió la canción «Carnicero»'],
      opened: [{ type: 'invitation_opened', params: { name: 'Rosa Fernández' } }, 'Rosa Fernández abrió su invitación'],
      status: [{ type: 'guest_rsvp_changed', params: { name: 'Rosa', status: 'not-attending' } }, 'Rosa cambió su respuesta a «no asistirá»'],
      imported: [{ type: 'guests_imported', params: { actor: 'Soporte', count: 12 } }, 'Soporte importó 12 invitados'],
      one: [{ type: 'guest_confirmed', params: { name: 'Rosa', companions: 1 } }, 'Rosa confirmó su asistencia con 1 acompañante'],
      many: [{ type: 'guest_confirmed', params: { name: 'Rosa', companions: 3 } }, 'Rosa confirmó su asistencia con 3 acompañantes'],
      alone: [{ type: 'guest_confirmed', params: { name: 'Rosa', companions: 0 } }, 'Rosa confirmó su asistencia'],
      cover: [{ type: 'invitation_cover_removed', params: { actor: 'Sistema' } }, 'Sistema quitó la foto de portada de la invitación']
    },
    en: {
      template: [{ type: 'invitation_template_changed', params: { actor: 'Marisol', template: 'Classic' } }, 'Marisol changed the template to Classic'],
      song: [{ type: 'music_suggested', params: { name: 'Rosa', song: 'Carnicero' } }, 'Rosa suggested the song "Carnicero"'],
      opened: [{ type: 'invitation_opened', params: { name: 'Rosa' } }, 'Rosa opened their invitation'],
      status: [{ type: 'guest_rsvp_changed', params: { name: 'Rosa', status: 'pending' } }, 'Rosa changed their answer to "pending"'],
      imported: [{ type: 'guests_imported', params: { actor: 'Support', count: 12 } }, 'Support imported 12 guests'],
      one: [{ type: 'guest_confirmed', params: { name: 'Rosa', companions: 1 } }, 'Rosa confirmed their attendance with 1 companion'],
      many: [{ type: 'guest_confirmed', params: { name: 'Rosa', companions: 3 } }, 'Rosa confirmed their attendance with 3 companions'],
      alone: [{ type: 'guest_confirmed', params: { name: 'Rosa' } }, 'Rosa confirmed their attendance'],
      cover: [{ type: 'invitation_cover_removed', params: { actor: 'System' } }, 'System removed the invitation cover photo']
    }
  }
  for (const lang of ['es', 'en']) {
    it.each(Object.entries(T[lang]))(`words %s in ${lang} from type and params`, (_, [item, expected]) => {
      setLocale(lang)
      expect(activitySentence({ ...item, message: 'API text' }, i18n.global.t)).toBe(expected)
    })
  }

  it('covers every type the feed emits', () => {
    const types = ['event_created', 'event_updated', 'event_published', 'event_unpublished', 'event_archived', 'event_restored', 'guest_created', 'guest_updated', 'guest_deleted', 'guests_imported', 'guest_confirmed', 'guest_declined', 'guest_rsvp_changed', 'invitation_opened', 'menu_created', 'menu_updated', 'menu_deleted', 'menu_item_created', 'menu_item_updated', 'menu_item_deleted', 'invitation_template_changed', 'invitation_template_undone', 'invitation_cover_uploaded', 'invitation_cover_removed', 'comment_added', 'music_suggested']
    const params = { actor: 'A', name: 'N', template: 'T', song: 'S', count: 2, companions: null, status: 'pending' }
    for (const lang of ['es', 'en']) {
      setLocale(lang)
      for (const type of types) {
        const text = activitySentence({ type, params, message: 'API text' }, i18n.global.t)
        expect(text, `${lang} ${type}`).not.toBe('API text')
        expect(text, `${lang} ${type}`).not.toContain('app.dashboard')
      }
    }
  })

  it('falls back to the API message for unknown types, missing params or a missing piece', () => {
    setLocale('es')
    const t = i18n.global.t
    expect(activitySentence({ type: 'brand_new', params: { actor: 'A' }, message: 'Algo pasó' }, t)).toBe('Algo pasó')
    expect(activitySentence({ type: 'music_suggested', message: 'Texto viejo' }, t)).toBe('Texto viejo')
    expect(activitySentence({ type: 'music_suggested', params: { name: 'Rosa', song: null }, message: 'Sin canción' }, t)).toBe('Sin canción')
    expect(activitySentence(undefined, t)).toBe('')
  })
})

describe('activityTime', () => {
  const now = new Date('2026-11-25T12:00:00Z')
  const at = iso => ({ occurredAt: iso, createdAt: 'texto del API' })
  it('words the distance in the app locale', () => {
    expect(activityTime(at('2026-11-24T12:00:00Z'), 'es', now)).toBe('hace 1 día')
    expect(activityTime(at('2026-11-22T12:00:00Z'), 'es', now)).toBe('hace 3 días')
    expect(activityTime(at('2026-11-18T12:00:00Z'), 'es', now)).toBe('hace 1 semana')
    expect(activityTime(at('2026-11-25T09:00:00Z'), 'en', now)).toBe('3 hours ago')
    expect(activityTime(at('2026-11-25T11:45:00Z'), 'en', now)).toBe('15 minutes ago')
    expect(activityTime(at('2026-09-25T12:00:00Z'), 'es', now)).toBe('hace 2 meses')
    expect(activityTime(at('2024-11-25T12:00:00Z'), 'en', now)).toBe('2 years ago')
    expect(activityTime(at('2026-11-25T11:59:50Z'), 'en', now)).toBe('now')
  })
  it('falls back to createdAt without a usable occurredAt (old API)', () => {
    expect(activityTime({ createdAt: 'hace 1 día' }, 'es', now)).toBe('hace 1 día')
    expect(activityTime(at('not a date'), 'es', now)).toBe('texto del API')
    expect(activityTime(undefined, 'es', now)).toBe('')
  })
})

const task = (title, state = 'available') => ({ title, state })
const plan = (foundation, invitations) => ({ phases: [{ key: 'foundation', tasks: foundation }, { key: 'planning', tasks: [task('Reservas')] }, { key: 'invitations', tasks: invitations }] })

describe('planPercent', () => {
  it('rounds the share of steps done', () => {
    expect(planPercent({ done: 13, total: 33 })).toBe(39)
    expect(planPercent({ done: 1, total: 3 })).toBe(33)
  })
  it('is 0 for an empty or missing plan and clamps to 0-100', () => {
    expect(planPercent(null)).toBe(0)
    expect(planPercent({ done: 3, total: 0 })).toBe(0)
    expect(planPercent({ done: 12, total: 9 })).toBe(100)
    expect(planPercent({ done: -2, total: 9 })).toBe(0)
  })
})

describe('phaseSummary', () => {
  it('counts steps and lists the pending titles in server order', () => {
    const s = phaseSummary(plan([task('Misa', 'next'), task('Corte', 'upcoming'), task('Fecha', 'done')], []), 'foundation')
    expect(s).toEqual({ key: 'foundation', total: 3, done: 1, pending: ['Misa', 'Corte'] })
  })
  it('leaves hidden and not-applicable steps out', () => {
    const s = phaseSummary(plan([task('A', 'hidden'), task('B', 'not_applicable'), task('C', 'done')], []), 'foundation')
    expect(s).toMatchObject({ total: 1, done: 1, pending: [] })
  })
  it('is empty for a missing phase or plan', () => {
    expect(phaseSummary(null, 'foundation')).toEqual({ key: 'foundation', total: 0, done: 0, pending: [] })
    expect(phaseSummary({ phases: [] }, 'invitations').total).toBe(0)
  })
})

describe('routePhases', () => {
  it('marks the first phase with steps left as current and the next one as upcoming', () => {
    const phases = routePhases(plan([task('A', 'next')], [task('B', 'upcoming')]))
    expect(phases.map(p => p.state)).toEqual(['current', 'upcoming'])
  })
  it('moves "current" to the invitations once the foundations are done', () => {
    expect(routePhases(plan([task('A', 'done')], [task('B', 'next')])).map(p => p.state)).toEqual(['done', 'current'])
  })
  it('marks both done and flags a phase without steps as empty', () => {
    expect(routePhases(plan([task('A', 'done')], [task('B', 'done')])).map(p => p.state)).toEqual(['done', 'done'])
    expect(routePhases(plan([], [task('B', 'next')])).map(p => p.state)).toEqual(['empty', 'current'])
  })
})

describe('routeMilestones', () => {
  it('has the four milestones in order, with Hoy always reached', () => {
    const m = routeMilestones(plan([task('A', 'next')], [task('B', 'upcoming')]), 37)
    expect(m.map(x => x.key)).toEqual(['today', 'foundation', 'invitations', 'event'])
    expect(m.map(x => x.reached)).toEqual([true, true, false, false])
  })
  it('reaches the event day on the day itself and after it, never without a date', () => {
    const last = days => routeMilestones(plan([], []), days).at(-1).reached
    expect(last(0)).toBe(true)
    expect(last(-3)).toBe(true)
    expect(last(5)).toBe(false)
    expect(last(null)).toBe(false)
    expect(last(undefined)).toBe(false)
  })
})

describe('routeAvailability', () => {
  it.each([
    [{ mode: 'normal' }, 'ready'],
    [{ mode: 'compressed' }, 'ready'],
    [{ mode: 'no_date' }, 'no_date'],
    [{ mode: 'unsupported' }, 'none'],
    [{ mode: 'event_past' }, 'none'],
    [null, 'none']
  ])('%j -> %s', (p, expected) => expect(routeAvailability(p)).toBe(expected))
})
