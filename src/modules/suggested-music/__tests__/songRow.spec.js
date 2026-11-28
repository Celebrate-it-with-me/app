import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import i18n from '@/locales/i18n'
import SuggestedMusicSongItem from '../components/SuggestedMusicSongItem.vue'
import SuggestedMusicList from '../components/SuggestedMusicList.vue'
import SuggestedMusicStats from '../components/SuggestedMusicStats.vue'

// The dropdown renders its menu in a portal: the stub keeps the trigger and exposes the items it was given.
const UiDropdown = defineComponent({
  props: { items: { type: Array, default: () => [] } },
  setup(props, { slots }) {
    return () => h('div', { 'data-testid': 'dropdown', 'data-items': JSON.stringify(props.items.map(i => i.label)) }, slots.trigger?.())
  }
})

const song = (over = {}) => ({
  id: 7,
  title: 'Carnicero',
  artist: 'Ronkalunga',
  album: 'Carnicero',
  thumbnailUrl: '',
  platformId: '4uLU6hMCjMI75M1A2tKUQC',
  votes: { up: 3, down: 1 },
  suggestedBy: { name: 'Rosa', isOrganizer: false },
  ...over
})
const mountItem = (props = {}) =>
  mount(SuggestedMusicSongItem, { props: { song: song(), position: 4, ...props }, global: { plugins: [i18n], stubs: { UiDropdown } } })

beforeAll(() => {
  i18n.global.locale.value = 'es'
})
afterEach(() => vi.restoreAllMocks())

describe('SuggestedMusicSongItem (playlist row)', () => {
  it('shows the position, title, artist and who suggested it', () => {
    const w = mountItem()
    expect(w.get('[data-testid=song-position]').text()).toBe('4')
    expect(w.get('[data-testid=song-title]').text()).toBe('Carnicero')
    expect(w.text()).toContain('Ronkalunga · Carnicero')
    expect(w.text()).toContain('Sugerida por Rosa')
    expect(w.get('[data-testid=song-origin]').text()).toBe('Invitado')
  })

  it('marks the organizer as "Tú"', () => {
    const w = mountItem({ song: song({ suggestedBy: { name: 'Marisol', isOrganizer: true } }) })
    expect(w.get('[data-testid=song-origin]').text()).toBe('Tú')
  })

  it('tints the votes chip by the net score and labels it with the up and down votes', () => {
    const up = mountItem().get('[data-testid=song-votes]')
    expect(up.text()).toBe('+2')
    expect(up.classes()).toContain('text-success-700')
    expect(up.attributes('aria-label')).toBe('Ver votos de Carnicero: 3 a favor, 1 en contra')
    expect(mountItem({ song: song({ votes: { up: 1, down: 1 } }) }).get('[data-testid=song-votes]').classes()).toContain('text-ink-700')
    expect(mountItem({ song: song({ votes: { up: 0, down: 2 } }) }).get('[data-testid=song-votes]').classes()).toContain('text-danger-700')
  })

  it('flags the top voted song with a chip and a star, the star with an accessible name', () => {
    const w = mountItem()
    expect(w.find('[data-testid=song-top-chip]').text()).toBe('Más votada')
    expect(w.get('[data-testid=song-top-star]').attributes('aria-label')).toBe('Más votada')
    const flat = mountItem({ song: song({ votes: { up: 0, down: 0 } }) })
    expect(flat.find('[data-testid=song-top-chip]').exists()).toBe(false)
    expect(flat.find('[data-testid=song-top-star]').exists()).toBe(false)
  })

  it('plays from the play button and from the cover, and opens the votes from the chip', async () => {
    const w = mountItem()
    await w.get('[data-testid=song-play]').trigger('click')
    await w.get('[data-testid=song-cover-play]').trigger('click')
    expect(w.emitted('play')).toHaveLength(2)
    await w.get('[data-testid=song-votes]').trigger('click')
    expect(w.emitted('details')[0][0].id).toBe(7)
  })

  it('offers play, Spotify, votes and remove in the menu, and leaves Spotify out without a track id', () => {
    const labels = w => JSON.parse(w.get('[data-testid=dropdown]').attributes('data-items'))
    expect(labels(mountItem())).toEqual(['Reproducir', 'Abrir en Spotify', 'Ver votos', 'Eliminar canción'])
    expect(labels(mountItem({ song: song({ platformId: '' }) }))).toEqual(['Reproducir', 'Ver votos', 'Eliminar canción'])
  })

  it('keeps the right column free for the assistant button and names the menu button', () => {
    const w = mountItem()
    expect(w.get('[data-testid=song-row] > div').classes()).toContain('fab-safe')
    expect(w.get('[data-testid=song-menu]').attributes('aria-label')).toBe('Más acciones de Carnicero')
  })
})

describe('SuggestedMusicList', () => {
  const mountList = songs =>
    mount(SuggestedMusicList, { props: { hasSongs: true, songs }, global: { plugins: [i18n], stubs: { UiDropdown } } })

  it('draws the songs as one playlist, numbered in the shown order', () => {
    const w = mountList([song({ id: 1 }), song({ id: 2, title: 'Otra' })])
    expect(w.findAll('[data-testid=song-row]')).toHaveLength(2)
    expect(w.findAll('[data-testid=song-position]').map(p => p.text())).toEqual(['1', '2'])
  })

  it('has four compact tabs with short labels for phones and "Tuyas" for the organizer', () => {
    const w = mountList([song()])
    const tabs = w.findAll('[role=tab]')
    expect(tabs).toHaveLength(4)
    expect(tabs.map(t => t.text())).toEqual(['TodasTodas', 'TuyasTuyas', 'InvitadosDe invitados', 'TopMás votadas'])
  })
})

describe('SuggestedMusicStats', () => {
  it('is two columns on phones and four from md, without the colored icons on phones', () => {
    const w = mount(SuggestedMusicStats, { props: { totalSongs: 2, totalVotes: 5, topSong: song(), guestSuggested: 1 }, global: { plugins: [i18n] } })
    const grid = w.get('[data-testid=music-stats]')
    expect(grid.classes()).toEqual(expect.arrayContaining(['grid-cols-2', 'md:grid-cols-4']))
    expect(grid.findAll('.hidden.md\\:flex')).toHaveLength(4)
    expect(w.text()).toContain('Carnicero')
  })
})

describe('SuggestedMusicSongItem menu actions', () => {
  const menu = (props = {}) => {
    const w = mount(SuggestedMusicSongItem, { props: { song: song(), position: 1, ...props }, global: { plugins: [i18n] } })
    return { w, items: w.findComponent({ name: 'UiDropdown' }).props('items') }
  }

  it('plays, shows the details and asks to remove, each with the song', () => {
    const { w, items } = menu()
    items.find(i => i.label === 'Reproducir').onSelect()
    items.find(i => i.danger).onSelect()
    items.find(i => i.label.includes('detalle') || i.label.includes('Detalle') || i.label.includes('Ver')).onSelect()
    expect(w.emitted('play')[0][0].id).toBe(7)
    expect(w.emitted('remove')[0]).toEqual([7])
    expect(w.emitted('details')[0][0].id).toBe(7)
  })

  it('opens the song in Spotify in a new tab, and has no such entry without a track id', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { items } = menu()
    items.find(i => i.label.includes('Spotify')).onSelect()
    expect(open).toHaveBeenCalledWith('https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', '_blank', 'noopener')
    expect(menu({ song: song({ platformId: null }) }).items.some(i => i.label.includes('Spotify'))).toBe(false)
  })
})

describe('SuggestedMusicList filters', () => {
  it('reports the filter tab chosen', async () => {
    const w = mount(SuggestedMusicList, { props: { songs: [song()], hasSongs: true, localSearch: '', sortBy: 'newest', filterBy: 'all' }, global: { plugins: [i18n], stubs: { UiDropdown } } })
    const tabs = w.findAll('[role=tab]')
    await tabs[1].trigger('mousedown', { button: 0 })
    expect(w.emitted('update:filterBy')).toHaveLength(1)
    expect(['admin', 'guests', 'top']).toContain(w.emitted('update:filterBy')[0][0])
  })
})
