import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import MenusService from '@/services/MenusService'
import { useEventsStore } from '@/stores/useEventsStore'

export const useMenusStore = defineStore('menusStore', {
  state: () => ({
    menus: [],
    currentMenu: null,
  }),
  actions: {
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
      this.currentMenu = this.menus.find((menu) =>  + menu.id === + menuId)
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
        eventId: userStore.activeEvent,
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
        eventId: userStore.activeEvent,
      })
    }

  },
  getters: {
    getMenus: (state) => {
      return state.menus
    },
    getMenuById: (state) => (id) => {
      return state.menus.find((menu) => menu.id === id)
    },
    hasMenu: (state) => {
      return state.menus.length > 0
    },
    needMenu() {
      // TODO: I need to test this.
      const eventStore = useEventsStore();

      // Extract the menu feature status
      const menuFeature = eventStore.activeEvent?.eventFeatures.find(
        (feature) => feature.name === 'menu'
      );

      // Simplified and reusable logic for menu requirement
      const isMenuFeatureActive = menuFeature?.isActive ?? false;

      // Return combined result
      return isMenuFeatureActive && !this.hasMenu;
    }


  }
})
