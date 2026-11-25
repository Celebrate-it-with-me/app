import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { INVITATION_KEY } from '../../composables/useInvitation'
import PackageSection from '../PackageSection'
import { coverAttrs, optionAttrs } from '../facts'
import { usePackageTheme } from '../usePackageTheme'
import { el, text, tt } from './helpers'

describe('optionAttrs', () => {
  it('publishes closed-list values and toggles as on/off', () => {
    expect(optionAttrs({ layout: 'split', 'arch.shape': 'round_1', flourish: true, ornaments: false })).toEqual({
      'data-inv-opt-layout': 'split',
      'data-inv-opt-arch.shape': 'round_1',
      'data-inv-opt-flourish': 'on',
      'data-inv-opt-ornaments': 'off'
    })
  })

  it('numbers become text', () => {
    expect(optionAttrs({ columns: 3 })).toEqual({ 'data-inv-opt-columns': '3' })
  })

  it('drops ids and values that could inject or break an attribute', () => {
    const attrs = optionAttrs({
      'Bad': 'x',
      '1st': 'x',
      'a b': 'x',
      'x"onload="y': 'x',
      ['a'.repeat(33)]: 'x',
      ok: 'a b',
      ok2: '"><script>',
      ok3: 'a'.repeat(33),
      ok4: '',
      ok5: { nested: 1 },
      ok6: null,
      fine: 'yes'
    })
    expect(attrs).toEqual({ 'data-inv-opt-fine': 'yes' })
  })

  it('accepts the longest valid id and caps how many options are published', () => {
    expect(Object.keys(optionAttrs({ ['a' + 'b'.repeat(31)]: 'v' }))).toHaveLength(1)
    const many = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`o${i}`, 'v']))
    expect(Object.keys(optionAttrs(many))).toHaveLength(32)
  })

  it('anything that is not a plain object publishes nothing', () => {
    for (const value of [undefined, null, 'x', 4, ['a']]) expect(optionAttrs(value)).toEqual({})
  })
})

describe('coverAttrs thresholds', () => {
  const name = n => coverAttrs({ data: { eventName: 'x'.repeat(n) } }, {})['data-inv-name-len']
  const guest = n => coverAttrs({ data: {} }, { guest: { name: 'x'.repeat(n) } })['data-inv-guest-len']

  it('event name: <=28 short, 29-48 mid, >48 long', () => {
    expect([0, 28].map(name)).toEqual(['short', 'short'])
    expect([29, 48].map(name)).toEqual(['mid', 'mid'])
    expect([49, 120].map(name)).toEqual(['long', 'long'])
  })

  it('guest name: >26 is long', () => {
    expect([0, 26].map(guest)).toEqual(['short', 'short'])
    expect([27, 80].map(guest)).toEqual(['long', 'long'])
  })

  it('photo: same-origin path or http(s) only', () => {
    const photo = image => coverAttrs({ data: { image } }, {})['data-inv-has-photo']
    expect(photo('/demo/a.webp')).toBe('true')
    expect(photo('https://cdn.test/a.webp')).toBe('true')
    for (const bad of [undefined, null, '', '//evil.test/a.png', 'javascript:alert(1)', 'data:image/png;base64,AA', 42]) expect(photo(bad)).toBe('false')
  })

  it('missing data is short / short / no photo', () => {
    expect(coverAttrs(undefined, undefined)).toEqual({ 'data-inv-name-len': 'short', 'data-inv-guest-len': 'short', 'data-inv-has-photo': 'false' })
  })
})

describe('PackageSection cover wrapper', () => {
  afterEach(() => vi.unstubAllGlobals())
  const ast = el('div', { class: 'pkg-t' }, el('p', {}, text('hi')))

  function mountSection(type, data, guestName = 'Rosa') {
    const section = { type, title: 'T', data }
    const invitation = ref({ event: { name: 'X', startsAt: '2026-12-28T19:00:00', typeSlug: 'wedding' }, guest: { name: guestName }, sections: [section] })
    return mount(PackageSection, {
      props: { ast, section, position: 1, count: 1, base: 'https://a.test/p/' },
      global: { provide: { [INVITATION_KEY]: { invitation, locale: ref('es'), tt } } }
    })
  }

  it('the cover carries the facts', () => {
    const w = mountSection('cover', { eventName: 'x'.repeat(30), image: '/a.webp' }, 'g'.repeat(27))
    expect(w.attributes()).toMatchObject({ 'data-inv-name-len': 'mid', 'data-inv-guest-len': 'long', 'data-inv-has-photo': 'true' })
  })

  it('without photo', () => {
    expect(mountSection('cover', { eventName: 'Hola' }).attributes('data-inv-has-photo')).toBe('false')
  })

  it('other sections do not get them', () => {
    const attrs = mountSection('itinerary', { items: [] }).attributes()
    expect(Object.keys(attrs).filter(key => /len|photo/.test(key))).toEqual([])
  })

  it('the package AST cannot declare them (the engine wrapper owns the attribute)', () => {
    const hostile = el('div', { 'data-inv-name-len': 'long', 'data-inv-has-photo': 'true' }, text('x'))
    const w = mount(PackageSection, {
      props: { ast: hostile, section: { type: 'cover', title: 'T', data: { eventName: 'Hi' } }, position: 1, count: 1, base: 'https://a.test/p/' },
      global: { provide: { [INVITATION_KEY]: { invitation: ref({ guest: { name: 'A' }, sections: [] }), locale: ref('es'), tt } } }
    })
    expect(w.attributes()).toMatchObject({ 'data-inv-name-len': 'short', 'data-inv-has-photo': 'false' })
  })
})

describe('usePackageTheme.optionAttrs', () => {
  function setup(pkg) {
    const source = ref(pkg)
    let api
    createApp({ setup() { api = usePackageTheme(() => source.value); return () => h('div') } }).mount(document.createElement('div'))
    return { api, source }
  }
  const base = options => ({ slug: 'demo', version: '1', engineMin: 1, cssUrl: `${location.origin}/p/theme.css`, options })

  it('no package: no attributes', () => {
    const { api } = setup(undefined)
    expect(api.optionAttrs.value).toEqual({})
  })

  it('while the package is usable the options are published and follow the preview', async () => {
    const { api, source } = setup(base({ layout: 'split', flourish: true }))
    expect(api.state.value).toBe('loading')
    expect(api.optionAttrs.value).toEqual({ 'data-inv-opt-layout': 'split', 'data-inv-opt-flourish': 'on' })
    api.state.value = 'ready'
    source.value = { ...source.value, options: { layout: 'stacked', flourish: false } }
    await nextTick()
    expect(api.optionAttrs.value).toEqual({ 'data-inv-opt-layout': 'stacked', 'data-inv-opt-flourish': 'off' })
  })

  it('a package that failed (native Clásica) publishes nothing', () => {
    const { api } = setup(base({ layout: 'split' }))
    api.reject([])
    expect(api.optionAttrs.value).toEqual({})
  })
})
