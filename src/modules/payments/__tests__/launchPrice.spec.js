import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import es from '@/locales/es'
import en from '@/locales/en'
import { cleanCode, storePendingCode, readPendingCode, clearPendingCode, PENDING_CODE_KEY, LAUNCH_CODE } from '../utils/pendingCode'

const memory = () => {
  const data = {}
  return {
    data,
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v) },
    removeItem: k => { delete data[k] }
  }
}
const broken = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') }, removeItem() { throw new Error('blocked') } }

describe('pending discount code', () => {
  it('cleans and upper-cases a code, ignoring anything odd', () => {
    expect(cleanCode(' lanzamiento79 ')).toBe(LAUNCH_CODE)
    expect(cleanCode(['LANZAMIENTO79', 'x'])).toBe(LAUNCH_CODE)
    expect(cleanCode('a b')).toBeNull()
    expect(cleanCode('<script>')).toBeNull()
    expect(cleanCode('ab')).toBeNull()
    expect(cleanCode(undefined)).toBeNull()
    expect(cleanCode(42)).toBeNull()
  })

  it('stores, reads and clears', () => {
    const s = memory()
    expect(storePendingCode('lanzamiento79', s)).toBe(true)
    expect(s.data[PENDING_CODE_KEY]).toBe(LAUNCH_CODE)
    expect(readPendingCode(s)).toBe(LAUNCH_CODE)
    clearPendingCode(s)
    expect(readPendingCode(s)).toBeNull()
  })

  it('does not store junk and survives blocked storage', () => {
    const s = memory()
    expect(storePendingCode('bad code!', s)).toBe(false)
    expect(s.data).toEqual({})
    expect(storePendingCode(LAUNCH_CODE, broken)).toBe(false)
    expect(readPendingCode(broken)).toBeNull()
    expect(() => clearPendingCode(broken)).not.toThrow()
  })
})

describe('landing price copy', () => {
  const texts = locale => [
    locale.hero.trust,
    locale.pricing.full.offer,
    locale.pricing.full.offerNote,
    locale.faq.items.find(i => /\$99/.test(i.a)).a
  ]
  for (const [name, locale] of [['es', es], ['en', en]]) {
    it(`${name}: shows $99 and never a bare $79`, () => {
      expect(locale.pricing.full.listPrice).toBe('$99')
      for (const text of texts(locale)) {
        for (const m of text.matchAll(/\$79/g)) {
          expect(text, 'offer must name the code').toContain(LAUNCH_CODE)
          expect(m.index).toBeGreaterThanOrEqual(0)
        }
      }
      expect(locale.hero.trust).toContain('$99')
      expect(locale.pricing.full.offer).toContain(LAUNCH_CODE)
    })
    it(`${name}: no other string mentions $79 without the code`, () => {
      const walk = (o, path = '') => Object.entries(o).flatMap(([k, v]) =>
        typeof v === 'string' ? [[`${path}.${k}`, v]] : v && typeof v === 'object' ? walk(v, `${path}.${k}`) : [])
      const bad = walk(locale).filter(([, v]) => v.includes('$79') && !v.includes(LAUNCH_CODE) && !v.includes('$79.50'))
      // The only allowed bare value is the big price of the card, which sits beside the offer line.
      expect(bad.map(([k]) => k)).toEqual(['.pricing.full.price'])
    })
  }

  it('every landing sign-up button carries the code', () => {
    const base = 'src/components/external/sections/landing/'
    for (const f of ['LandingHero', 'MobileCtaBar', 'LandingCta', 'LandingPricing']) {
      const src = readFileSync(`${base}${f}.vue`, 'utf8')
      expect(src).not.toMatch(/to="\/sign-up"/)
      expect(src).toContain(`/sign-up?code=${LAUNCH_CODE}`)
    }
  })
})
