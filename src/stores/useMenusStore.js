import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import MenusService from '@/services/MenusService'

export const useMenusStore = defineStore('menusStore', {
  state: () => ({
    menu: null,
    currentMenu: null,
  }),
  actions: {
    async loadMenu() {
      const userStore = useUserStore()
      const response = await MenusService.loadMenu({
        eventId: userStore.activeEvent
      })

      if (response.status === 200) {
        console.log('checking menu response', response.data[0])
        this.menu = response.data[0] ?? []
        return true
      }

      return false
    },

    async createMenu(formValues) {
      const userStore = useUserStore()

      return MenusService.createMenu(formValues, userStore.activeEvent)
    },

    async addMenuItem(item) {
      const userStore = useUserStore()

      return MenusService.addMenuItem(item, userStore.activeEvent)
    }
  }
})
