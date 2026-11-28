import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import MenusService from '@/modules/menus/services/MenusService'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { normalizeMenus, statusParam } from '@/modules/menus/utils/menus'

export const useMenusStore = defineStore('menusStore', {
  state: () => ({
    menus: [],
    menu: null,
    currentMenu: null,
    guestsMenu: [],
    guestsMeta: null,
    guestsFilter: 'all',
    summary: null,
    pageSelected: 1,
    perPage: 10,
    searchValue: ''
  }),
  actions: {
    async exportGuestsMenu() {
      const userStore = useUserStore()
      return await MenusService.exportGuestsMenu({
        eventId: userStore.activeEvent
      })
    },
    /** Totals of ALL the guests (not just the page): the summary card and the filter chips. A failure keeps the page working without it. */
    async loadSummary() {
      const userStore = useUserStore()
      try {
        const response = await MenusService.loadSummary({ eventId: userStore.activeEvent })
        this.summary = response.status === 200 ? (response.data ?? null) : null
      } catch {
        this.summary = null
      }
      return !!this.summary
    },

    /** Changing the filter always goes back to the first page. */
    async setGuestsFilter(filter) {
      this.guestsFilter = filter
      this.pageSelected = 1
      return await this.loadGuestsMenu()
    },

    async loadGuestsMenu() {
      const userStore = useUserStore()
      try {
        const response = await MenusService.loadGuestMenu({
          eventId: userStore.activeEvent,
          page: this.pageSelected,
          perPage: this.perPage,
          status: statusParam(this.guestsFilter)
        })

        if (response.status === 200) {
          this.guestsMenu = response.data?.data ?? []
          this.guestsMeta = response.data?.meta ?? null
          this.pageSelected = response.data?.meta?.current_page || 1
          return true
        }
      } catch (e) {
        // The old API answered 404 when nobody had been invited yet: treat it as an empty page.
        if (e?.response?.status !== 404) throw e
        this.guestsMenu = []
        this.guestsMeta = null
      }
      return false
    },

    async loadMenus() {
      const userStore = useUserStore()
      try {
        const response = await MenusService.loadMenus({
          eventId: userStore.activeEvent
        })

        if (response.status === 200) {
          this.menus = normalizeMenus(response.data)
          return true
        }
      } catch (e) {
        // The old API answered 404 when the event had no menus yet: treat it as an empty list.
        if (e?.response?.status !== 404) throw e
        this.menus = []
      }

      return false
    },

    async setCurrentMenu(menuId) {
      this.currentMenu = this.menus.find(menu => +menu.id === +menuId) ?? null
    },

    async loadRouteMenu(id) {
      const userStore = useUserStore()

      const response = await MenusService.loadRouteMenu({
        eventId: userStore.activeEvent,
        menuId: id
      })

      if (response.status === 200) {
        this.menu = response.data ?? null
        return true
      }

      return false
    },

    async createMenu(formValues) {
      const userStore = useUserStore()

      return await MenusService.createMenu(formValues, userStore.activeEvent)
    },

    async updateMenu(formValues) {
      const userStore = useUserStore()

      return await MenusService.updateMenu(formValues, userStore.activeEvent)
    },

    async addMenuItem({ menuItem, menuId }) {
      const userStore = useUserStore()

      return await MenusService.addMenuItem({
        menuItem,
        menuId,
        eventId: userStore.activeEvent
      })
    },

    async deleteMenu(menuId) {
      const userStore = useUserStore()

      return await MenusService.deleteMenu(menuId, userStore.activeEvent)
    },

    async removeMenuItem(menuItem) {
      const userStore = useUserStore()

      return await MenusService.removeMenuItem({
        menuItem,
        eventId: userStore.activeEvent
      })
    },

    setMenus(menus) {
      this.menus = normalizeMenus(menus)
    },

    setMenuGuests(menuGuests) {
      this.guestsMenu = menuGuests?.data || null
    }
  },
  getters: {
    getMenus: state => {
      return state.menus
    },
    getMenuById: state => id => {
      return state.menus.find(menu => menu.id === id)
    },
    hasMenu: state => {
      return state.menus?.length > 0
    },
    needMenu() {
      const eventStore = useEventsStore()

      // The menu module counts when the event's plan includes it (`event.modules`, from the API catalog).
      const isMenuActive = eventStore.activeEvent?.modules?.some(m => m.key === 'menus' && m.state === 'active') ?? false

      return isMenuActive && !this.hasMenu
    },

    mainMenu() {
      return this.menus?.find(menu => menu.is_default)
    },

    menusForSelect() {
      return this.menus?.map(menu => {
        return {
          label: menu.title,
          value: menu.id
        }
      })
    }
  }
})
