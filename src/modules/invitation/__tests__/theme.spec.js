import { describe, it, expect } from 'vitest'
import { contrast, isHex, onColor, readablePrimary, themeVars } from '../composables/useInvitationTheme'

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
    expect(vars['--inv-primary']).toBe('#5e795a') // sage, darkened 1% to reach AA
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
    const sage = readablePrimary('#5f7a5b', paper)
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
