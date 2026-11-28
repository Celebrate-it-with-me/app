import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import CategoryBars from '../components/CategoryBars.vue'

const cat = (id, name, itemCount, owed, paid, remaining) => ({ id, name, itemCount, totals: { owed, paid, remaining } })
const SUMMARY = {
  currency: 'USD',
  categories: [
    cat(1, 'Salón', 1, 4500, 4500, 0),
    cat(2, 'Banquete', 1, 6800, 6800, 0),
    cat(3, 'Decoración', 1, 1800, 0, 1800),
    cat(4, 'Música y DJ', 1, 1200, 2400, 0),
    cat(5, 'Foto y video', 1, 1600, 400, 1200),
    cat(6, 'Vestido', 1, 1650, 2350, 0),
    cat(7, 'Vacía', 0, 0, 0, 0)
  ],
  uncategorized: { itemCount: 0, totals: { owed: 0, paid: 0, remaining: 0 } }
}
const mountIt = () => mount(CategoryBars, { props: { summary: SUMMARY }, global: { plugins: [i18n] } })

describe('CategoryBars', () => {
  beforeEach(() => setLocale('es'))

  it('lists the categories with something in them, the most expensive first', () => {
    const w = mountIt()
    expect(w.findAll('[data-row]').map(r => r.attributes('data-row'))).toEqual(['2', '1', '3', '6', '5', '4'])
    expect(w.text()).toContain('Barra = pagado sobre el costo de la categoría')
  })

  it('one bar each: green when complete, wine when partial, red when paid past the cost, empty at $0', () => {
    const w = mountIt()
    const fill = id => w.get(`[data-row="${id}"] [data-testid=cat-fill]`)
    expect(fill(1).classes()).toContain('bg-success-500')
    expect(fill(5).classes()).toContain('bg-rose-600')
    expect(fill(5).attributes('style')).toContain('width: 25%')
    expect(fill(4).classes()).toContain('bg-danger-500')
    expect(fill(4).attributes('style')).toContain('width: 100%')
    expect(fill(3).attributes('style')).toContain('width: 0%')
    expect(w.find('.bg-gold-300').exists()).toBe(false)
  })

  it('says what is left, complete, or how much went over', () => {
    const w = mountIt()
    const note = id => w.get(`[data-row="${id}"] [data-testid=cat-note]`).text()
    expect(note(1)).toBe('completo')
    expect(note(3)).toBe('faltan $1,800')
    expect(note(5)).toBe('faltan $1,200')
    expect(note(6)).toBe('+$700 de más')
    expect(w.get('[data-row="3"]').text()).toContain('$0 / $1,800')
  })

  it('tells the page which category was tapped', async () => {
    const w = mountIt()
    await w.get('[data-row="6"]').trigger('click')
    expect(w.emitted('select')[0]).toEqual([6])
  })
})
