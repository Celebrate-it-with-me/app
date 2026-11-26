import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import {
  availableTags,
  canBrowse,
  filterTemplates,
  normalizeText,
  readFavorites,
  templatePresets,
  templateTags,
  writeFavorites
} from '../utils/templatePicker'
import { useFavoriteTemplates } from '../composables/useFavoriteTemplates'
import { useTemplateBrowser } from '../composables/useTemplateBrowser'

const LIST = [
  { id: 1, name: 'Clásica', tier: 'free', tags: ['elegante'] },
  { id: 2, name: 'Botánica', tier: 'premium', tags: ['floral', 'elegante'] },
  { id: 3, name: 'Miami Nights', tier: 'premium' },
  { id: 4, name: 'Jardín', tier: 'free', tags: ['floral'] }
]

beforeEach(() => localStorage.clear())

describe('template tags and palettes', () => {
  it('tolerates a missing tags field', () => {
    expect(templateTags({})).toEqual([])
    expect(templateTags({ tags: ['a', '', 3] })).toEqual(['a', '3'])
    expect(availableTags(LIST)).toEqual(['elegante', 'floral'])
    expect(availableTags(null)).toEqual([])
  })

  it('reads key/palette and falls back to value/colors', () => {
    const presets = templatePresets({
      presets: [
        { key: 'a', value: 'a', label: { es: 'A', en: 'A' }, palette: { background: '#fff', text: '#000', accent: '#f00' } },
        { value: 'b', label: { es: 'B' }, colors: ['#111', '#222', '#333'] },
        { name: 'sin clave' },
        { key: 'c' }
      ]
    })
    expect(presets.map(p => p.key)).toEqual(['a', 'b', 'c'])
    expect(presets[0].palette).toEqual({ background: '#fff', text: '#000', accent: '#f00' })
    expect(presets[1].palette).toEqual({ background: '#111', text: '#333', accent: '#222' })
    expect(presets[2].palette).toEqual({ background: null, text: null, accent: null })
    expect(presets[2].label).toBe('c')
    expect(templatePresets({})).toEqual([])
  })
})

describe('filterTemplates', () => {
  it('filters by access, tag and accent-free name', () => {
    expect(filterTemplates(LIST, { access: 'free' }).map(t => t.id)).toEqual([1, 4])
    expect(filterTemplates(LIST, { access: 'premium' }).map(t => t.id)).toEqual([2, 3])
    expect(filterTemplates(LIST, { tag: 'floral' }).map(t => t.id)).toEqual([2, 4])
    expect(filterTemplates(LIST, { query: 'botanica' }).map(t => t.id)).toEqual([2])
    expect(filterTemplates(LIST, { query: ' JARD ', access: 'free', tag: 'floral' }).map(t => t.id)).toEqual([4])
    expect(filterTemplates(LIST, { access: 'premium', tag: 'floral', query: 'clas' })).toEqual([])
    expect(filterTemplates(null)).toEqual([])
  })

  it('keeps only favorites when asked', () => {
    expect(filterTemplates(LIST, { favoritesOnly: true, favorites: new Set(['3']) }).map(t => t.id)).toEqual([3])
    expect(normalizeText(null)).toBe('')
  })

  it('only browses with more than two templates', () => {
    expect(canBrowse(LIST.slice(0, 2))).toBe(false)
    expect(canBrowse(LIST.slice(0, 3))).toBe(true)
    expect(canBrowse(null)).toBe(false)
  })
})

describe('favorites storage', () => {
  it('survives a broken or blocked storage', () => {
    localStorage.setItem('qv.templateFavs.7', '{nope')
    expect(readFavorites(7)).toEqual([])
    localStorage.setItem('qv.templateFavs.7', '{"a":1}')
    expect(readFavorites(7)).toEqual([])
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full')
    })
    expect(() => writeFavorites(['1'], 7)).not.toThrow()
    spy.mockRestore()
  })

  it('toggles and remembers per user', () => {
    const fav = useFavoriteTemplates(() => 9)
    expect(fav.isFavorite(1)).toBe(false)
    expect(fav.toggle(1)).toBe(true)
    expect(fav.isFavorite('1')).toBe(true)
    expect(fav.count.value).toBe(1)
    expect(useFavoriteTemplates(() => 9).isFavorite(1)).toBe(true)
    expect(useFavoriteTemplates(() => 10).isFavorite(1)).toBe(false)
    expect(fav.toggle(1)).toBe(false)
    expect(readFavorites(9)).toEqual([])
    expect(useFavoriteTemplates(() => '').count.value).toBe(0)
  })
})

describe('useTemplateBrowser', () => {
  it('shows everything and no controls with two templates', () => {
    const list = ref(LIST.slice(0, 2))
    const browser = useTemplateBrowser(list)
    browser.query.value = 'zzz'
    expect(browser.enabled.value).toBe(false)
    expect(browser.results.value).toHaveLength(2)
  })

  it('combines filters, reports them and clears them', () => {
    const favorites = ref(new Set(['2']))
    const browser = useTemplateBrowser(() => LIST, favorites)
    expect(browser.active.value).toBe(false)
    expect(browser.tags.value).toEqual(['elegante', 'floral'])
    browser.access.value = 'premium'
    browser.tag.value = 'elegante'
    expect(browser.results.value.map(t => t.id)).toEqual([2])
    expect(browser.active.value).toBe(true)
    browser.favoritesOnly.value = true
    favorites.value = new Set()
    expect(browser.results.value).toEqual([])
    browser.clear()
    expect(browser.active.value).toBe(false)
    expect(browser.results.value).toHaveLength(4)
  })

  it('drops a tag that disappeared from the list', async () => {
    const list = ref(LIST)
    const browser = useTemplateBrowser(list)
    browser.tag.value = 'floral'
    list.value = LIST.filter(t => t.id !== 2 && t.id !== 4)
    await nextTick()
    expect(browser.tag.value).toBe('')
  })
})
