import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import MenusService from '@/services/MenusService'
import { useEventsStore } from '@/stores/useEventsStore'

export const useMenusStore = defineStore('menusStore', {
  state: () => ({
    menus: [],
    currentMenu: null,
    guestsMenu: [],
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
    async loadGuestsMenu() {
      const userStore = useUserStore()
      const response = await MenusService.loadGuestMenu({
        eventId: userStore.activeEvent
      })

      if (response.status === 200) {
        this.guestsMenu = response.data.data ?? []
        this.pageSelected = response.data.meta?.current_page || 1
        return true
      }
      return false
    },

    async loadMenus() {
      const userStore = useUserStore()
      const response = await MenusService.loadMenus({
        eventId: userStore.activeEvent
      })

      if (response.status === 200) {
        this.menus = response.data ?? []
        return true
      }

      return false
    },

    async setCurrentMenu(menuId) {
      console.log('checking menu id', menuId)
      this.currentMenu = this.menus.find(menu => +menu.id === +menuId)
    },

    async loadRouteMenu(id) {
      const userStore = useUserStore()

      const response = await MenusService.loadRouteMenu({
        eventId: userStore.activeEvent,
        menuId: id
      })

      if (response.status === 200) {
        this.menu = response.data ?? []
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
      this.menus = menus
    },

    setMenuGuests(menuGuests) {
      this.guestsMenu = menuGuests.data
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
      return state.menus.length > 0
    },
    needMenu() {
      const eventStore = useEventsStore()

      const menuFeature = eventStore.activeEvent?.eventFeatures.find(
        feature => feature.name === 'menu'
      )

      const isMenuFeatureActive = menuFeature?.isActive ?? false

      return isMenuFeatureActive && !this.hasMenu
    },

    mainMenu() {
      return this.menus.find(menu => menu.is_default)
    },

    menusForSelect() {
      return this.menus.map(menu => {
        return {
          label: menu.title,
          value: menu.id
        }
      })
    }
  }
})
