import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import MenusService from '@/services/MenusService'

export const useMenusStore = defineStore('menusStore', {
  state: () => ({
    menu: null,
  }),
  actions: {
    async loadMenu() {
      const userStore = useUserStore()
      const response = await MenusService.loadMenu({
        eventId: userStore.activeEvent
      })

      if (response.status === 200) {
        this.menu = response.data ?? []
        return true
      }

      return false
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

  }
})
