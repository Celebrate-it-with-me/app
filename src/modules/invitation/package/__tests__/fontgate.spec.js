import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { usePackageTheme, declaredFontQueries, waitForPackageFonts, CSS_WAIT_MS } from '../usePackageTheme'

class CSSFontFaceRule {
  constructor(family, weight = '400', style = 'normal') {
    const props = { 'font-family': `"${family}"`, 'font-weight': weight, 'font-style': style }
    this.style = { getPropertyValue: name => props[name] ?? '' }
  }
}
const sheet = (...rules) => ({ cssRules: [...rules, { style: { getPropertyValue: () => '' } }] })

const PKG = { slug: 'classic', version: '1', cssUrl: `${location.origin}/p/theme.css`, preload: [] }

function setup() {
  let link
  const append = document.head.appendChild.bind(document.head)
  vi.spyOn(document.head, 'appendChild').mockImplementation(node => {
    if (node.rel === 'stylesheet') {
      link = node
      Object.defineProperty(node, 'sheet', { value: sheet(new CSSFontFaceRule('Pinyon Script')), configurable: true })
    }
    return append(node)
  })
  let api
  mount(defineComponent({ setup() { api = usePackageTheme(() => PKG); return () => h('div') } }))
  return { api, cssLoaded: () => link.onload(), cssFailed: () => link.onerror() }
}

describe('declaredFontQueries', () => {
  it('lists the @font-face rules of the sheet as font queries', () => {
    expect(declaredFontQueries(sheet(new CSSFontFaceRule('Pinyon Script'), new CSSFontFaceRule('Figtree', '600', 'italic')))).toEqual([
      'normal 400 1em "Pinyon Script"',
      'italic 600 1em "Figtree"'
    ])
  })
  it('is empty when the rules cannot be read', () => {
    expect(declaredFontQueries({ get cssRules() { throw new DOMException('x', 'SecurityError') } })).toEqual([])
    expect(declaredFontQueries(null)).toEqual([])
  })
})

describe('waitForPackageFonts', () => {
  it('loads every declared face, then waits for fonts.ready', async () => {
    const order = []
    const fonts = { load: vi.fn(async () => order.push('load')), ready: Promise.resolve().then(() => order.push('ready')) }
    await waitForPackageFonts(sheet(new CSSFontFaceRule('A'), new CSSFontFaceRule('B')), fonts)
    expect(fonts.load).toHaveBeenCalledTimes(2)
    expect(order.at(-1)).toBe('ready')
  })
  it('a failing font does not reject', async () => {
    const fonts = { load: vi.fn(() => Promise.reject(new Error('404'))), ready: Promise.resolve() }
    await expect(waitForPackageFonts(sheet(new CSSFontFaceRule('A')), fonts)).resolves.toBeUndefined()
  })
  it('does nothing without the FontFaceSet API', async () => {
    await expect(waitForPackageFonts(sheet(new CSSFontFaceRule('A')), undefined)).resolves.toBeUndefined()
  })
})

describe('usePackageTheme font gate', () => {
  let fontsDesc
  beforeEach(() => {
    vi.useFakeTimers()
    fontsDesc = Object.getOwnPropertyDescriptor(document, 'fonts')
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.head.innerHTML = ''
    if (fontsDesc) Object.defineProperty(document, 'fonts', fontsDesc)
    else delete document.fonts
  })
  const stubFonts = fonts => Object.defineProperty(document, 'fonts', { value: fonts, configurable: true })

  it('fast font: ready right after CSS and font', async () => {
    stubFonts({ load: () => Promise.resolve([]), ready: Promise.resolve() })
    const { api, cssLoaded } = setup()
    expect(api.state.value).toBe('loading')
    cssLoaded()
    await vi.advanceTimersByTimeAsync(0)
    expect(api.state.value).toBe('ready')
  })

  it('slow font: stays loading until the font arrives, then ready', async () => {
    let done
    stubFonts({ load: () => new Promise(r => (done = r)), ready: Promise.resolve() })
    const { api, cssLoaded } = setup()
    cssLoaded()
    await vi.advanceTimersByTimeAsync(800)
    expect(api.state.value).toBe('loading')
    done([])
    await vi.advanceTimersByTimeAsync(0)
    expect(api.state.value).toBe('ready')
  })

  it('failed font: still ready (the page is never held back by a font error)', async () => {
    stubFonts({ load: () => Promise.reject(new Error('404')), ready: Promise.resolve() })
    const { api, cssLoaded } = setup()
    cssLoaded()
    await vi.advanceTimersByTimeAsync(0)
    expect(api.state.value).toBe('ready')
  })

  it('font that never arrives: the 1500 ms cap shows the page', async () => {
    stubFonts({ load: () => new Promise(() => {}), ready: new Promise(() => {}) })
    const { api, cssLoaded } = setup()
    cssLoaded()
    await vi.advanceTimersByTimeAsync(CSS_WAIT_MS - 1)
    expect(api.state.value).toBe('loading')
    await vi.advanceTimersByTimeAsync(2)
    expect(api.state.value).toBe('ready')
  })

  it('CSS failure still falls back, ignoring fonts', async () => {
    stubFonts({ load: () => new Promise(() => {}), ready: new Promise(() => {}) })
    const { api, cssFailed } = setup()
    cssFailed()
    expect(api.state.value).toBe('failed')
    await vi.advanceTimersByTimeAsync(CSS_WAIT_MS + 10)
    expect(api.state.value).toBe('failed')
  })
})
