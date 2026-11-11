import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, nextTick, ref } from 'vue'
import { createPinia, defineStore, setActivePinia, storeToRefs } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Same shapes the app uses: an options store with `persist: { key, storage }`
// (useUserStore) and a setup store with persist as the third argument (todoStore).
const useOptionsStore = defineStore('options', {
  state: () => ({ name: 'guest', count: 0 }),
  getters: { double: state => state.count * 2 },
  actions: {
    increment() {
      this.count++
    }
  },
  persist: { key: 'options-store', storage: localStorage }
})

const useSetupStore = defineStore(
  'setup',
  () => {
    const items = ref([])
    const add = item => items.value.push(item)
    return { items, add }
  },
  { persist: { key: 'setup-store', storage: localStorage } }
)

// Same bootstrap as main.js: pinia plugins only run once pinia is installed on an app.
const makePinia = () => {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return pinia
}

describe('pinia 4 + pinia-plugin-persistedstate', () => {
  beforeEach(() => {
    localStorage.clear()
    makePinia()
  })

  it('runs options-store state, getters and actions', () => {
    const store = useOptionsStore()
    store.increment()

    expect(store.count).toBe(1)
    expect(store.double).toBe(2)
  })

  it('exposes reactive refs with storeToRefs', () => {
    const store = useOptionsStore()
    const { count } = storeToRefs(store)
    store.increment()

    expect(count.value).toBe(1)
  })

  it('$reset restores the initial state of an options store', () => {
    const store = useOptionsStore()
    store.increment()
    store.$reset()

    expect(store.count).toBe(0)
  })

  it('persists an options store and rehydrates it in a new pinia', async () => {
    useOptionsStore().increment()
    useOptionsStore().name = 'Valentina'
    await nextTick() // the plugin writes from $subscribe, which flushes on the next tick
    expect(JSON.parse(localStorage.getItem('options-store'))).toMatchObject({ name: 'Valentina', count: 1 })

    makePinia() // simulates a page reload
    const reloaded = useOptionsStore()

    expect(reloaded.name).toBe('Valentina')
    expect(reloaded.count).toBe(1)
  })

  it('persists a setup store and rehydrates it', async () => {
    useSetupStore().add('rosa')
    await nextTick()
    expect(JSON.parse(localStorage.getItem('setup-store')).items).toEqual(['rosa'])

    makePinia()

    expect(useSetupStore().items).toEqual(['rosa'])
  })
})
