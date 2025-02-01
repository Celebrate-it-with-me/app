import { defineStore } from 'pinia'

export const useNotification = defineStore('notification', {
  state: () => ({
    notifications: []
  }),

  actions: {
    addNotification({
                      type = 'success',
                      message = 'Action complete successfully',
                      duration = 3000
    }) {
      const id = Date.now()
      const notification = { id, type, message }

      this.notifications.push(notification)

      setTimeout(() => {
        this.removeNotification(id)
      }, duration)

    },

    removeNotification(id) {
      this.notifications = this.notifications.filter((noty) => noty.id !== id)
    }
  }
})
