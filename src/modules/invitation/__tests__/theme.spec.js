import { describe, it, expect } from 'vitest'
import { contrast, isHex, onColor, readableInk, readablePrimary, themeVars } from '../composables/useInvitationTheme'

describe('isHex', () => {
  it('accepts plain hex colors only', () => {
    expect(isHex('#b04a62')).toBe(true)
    expect(isHex('#FFF')).toBe(true)
    expect(isHex('red')).toBe(false)
    expect(isHex('#12')).toBe(false)
    expect(isHex('#fff; background:url(x)')).toBe(false)
    expect(isHex(null)).toBe(false)
  })
})

describe('onColor', () => {
  it('picks the text color with the better contrast', () => {
    expect(onColor('#b04a62')).toBe('#ffffff') // rose
    expect(onColor('#2f4a6d')).toBe('#ffffff') // navy
    expect(onColor('#f5e6a8')).toBe('#2b2420') // pale yellow
    expect(onColor('#fff')).toBe('#2b2420')
  })
})

describe('themeVars', () => {
  it('maps theme colors and fonts to CSS variables', () => {
    const vars = themeVars({
      colors: { primary: '#5f7a5b', accent: '#c9a24e' },
      fonts: { heading: 'Fraunces', body: 'Figtree' }
    })
    expect(vars['--inv-primary']).toBe('#597356') // sage, darkened 6% to reach AA on paper and on the alternate band
    expect(vars['--inv-on-primary']).toBe('#ffffff')
    expect(vars['--inv-font-heading']).toBe("'Fraunces', Georgia, serif")
    expect(vars['--inv-surface']).toBe('#fbf7f2') // default kept
  })

  it('ignores values that are not plain colors or font names', () => {
    const vars = themeVars({
      colors: { primary: 'url(javascript:alert(1))', unknown: '#000000' },
      fonts: { heading: "x'; } body { display:none", body: 'Figtree' }
    })
    expect(vars['--inv-primary']).toBe('#b04a62')
    expect(vars).not.toHaveProperty('--inv-unknown')
    expect(vars).not.toHaveProperty('--inv-font-heading')
    expect(vars['--inv-font-body']).toBe("'Figtree', system-ui, sans-serif")
  })

  it('falls back to defaults without a theme', () => {
    expect(themeVars(null)['--inv-primary']).toBe('#b04a62')
  })
})

describe('readablePrimary', () => {
  const paper = '#fbf7f2'

  it('leaves colors that already reach AA untouched', () => {
    expect(readablePrimary('#b04a62', paper)).toBe('#b04a62')
    expect(readablePrimary('#2f4a6d', paper)).toBe('#2f4a6d')
  })

  it('darkens the sage preset just enough to pass on the paper and under its button text', () => {
    const sage = readablePrimary('#5f7a5b', paper, '#f4ede4')
    expect(contrast(sage, '#f4ede4')).toBeGreaterThanOrEqual(4.5)
    expect(sage).not.toBe('#5f7a5b')
    expect(contrast(sage, paper)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(sage, onColor(sage))).toBeGreaterThanOrEqual(4.5)
    expect(themeVars({ colors: { primary: '#5f7a5b' } })['--inv-primary']).toBe(sage)
  })

  it('ignores values that are not 6-digit hex and gives up on colors it cannot fix', () => {
    expect(readablePrimary('#abc', paper)).toBe('#abc')
    expect(readablePrimary('red', paper)).toBe('red')
    expect(readablePrimary('#b04a62', 'nope')).toBe('#b04a62')
    expect(readablePrimary('#ffee00', '#ffffff')).toBe('#ffee00')
  })
})

describe('contrast of the free palettes', () => {
  const base = { surface: '#fbf7f2', surfaceAlt: '#f4ede4', ink: '#2b2420', inkSoft: '#5b524c' }
  const palettes = { rose: '#b04a62', sage: '#5f7a5b', navy: '#2f4a6d' }

  for (const [name, primary] of Object.entries(palettes)) {
    it(`${name}: small text stays at 4.5:1 or more on both surfaces`, () => {
      const vars = themeVars({ colors: { ...base, primary } })
      for (const surface of [base.surface, base.surfaceAlt]) {
        expect(contrast(vars['--inv-primary-ink'], surface)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(vars['--inv-ink'], surface)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(vars['--inv-ink-soft'], surface)).toBeGreaterThanOrEqual(4.5)
        // placeholder is ink-soft at 85% over the surface
        const blended = '#' + [1, 3, 5].map(i => Math.round(parseInt(vars['--inv-ink-soft'].slice(i, i + 2), 16) * 0.85 + parseInt(surface.slice(i, i + 2), 16) * 0.15).toString(16).padStart(2, '0')).join('')
        expect(contrast(blended, surface)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(vars['--inv-primary'], surface)).toBeGreaterThanOrEqual(4.5)
      }
    })
  }

  it('darkens a pale custom primary until its text color is readable', () => {
    const ink = readableInk('#e8a0b0', ['#fbf7f2', '#f4ede4'])
    expect(contrast(ink, '#f4ede4')).toBeGreaterThanOrEqual(5)
    expect(readableInk('red', ['#fff'])).toBeNull()
    expect(readableInk('#e8a0b0', ['nope'])).not.toBeNull()
  })

  it('falls back to the plain ink when nothing lighter is readable', () => {
    expect(readableInk('#2b2420', ['#2b2420'])).toBe('#2b2420')
  })
})

describe('themeVars edge cases', () => {
  it('leaves the text-safe ink out when the primary is not a 6-digit hex (the CSS fallback applies)', () => {
    expect(themeVars({ colors: { primary: '#abc' } })).not.toHaveProperty('--inv-primary-ink')
  })

  it('emits the script font when valid and measures short hex colors', () => {
    expect(themeVars({ fonts: { script: 'Pinyon Script' } })['--inv-font-script']).toBe("'Pinyon Script', cursive")
    expect(contrast('#fff', '#000')).toBeCloseTo(21, 0)
    expect(onColor('nope')).toBe('#ffffff')
    expect(contrast('#777', '#fff')).toBeGreaterThan(4)
  })
})
