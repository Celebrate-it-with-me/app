import { defineStore, getActivePinia } from 'pinia'
import UserService from '../services/UserService'
import { format } from "date-fns";
import { useEventsStore } from './useEventsStore'

// Function to format the logout time
function formatLogoutTime(logoutTime) {
  return format(new Date(logoutTime), "MMMM dd, yyyy 'at' h:mm a");
}

// Example Usage
const logoutTimeString = "2025-01-25 06:19:30";
const formattedTime = formatLogoutTime(logoutTimeString);

console.log(`Logout time: ${formattedTime}`);
// Output: "Logout time: January 25, 2025 at 6:19 AM"

export const useUserStore = defineStore('userStore', {
  state: () => ({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    userId: '',
    token: null,
    lastLogin: null,
    activeEvent: null,
    justLogin: false,
    preferences: {
      language: '',
      timezone: '',
      visualTheme: '',
      dateFormat: '',
      notifyByEmail: null,
      notifyBySms: null,
      smartTips: null
    }
  }),
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user-store',
        storage: localStorage
      }
    ]
  },
  actions: {
    async getPreferences() {
      return await UserService.getUserPreferences()
    },

    async updatePreferences({
                              language,
                              timezone,
                              dateFormat,
                              visualTheme,
                              notifyByEmail,
                              notifyBySms,
                              smartTips }) {
      return await UserService.updatePreferences({
        language,
        timezone,
        dateFormat,
        visualTheme,
        notifyByEmail,
        notifyBySms,
        smartTips
      })
    },

    setPreferences(newPreferences) {
      this.preferences = {
        language: newPreferences.language,
        timezone: newPreferences.timezone,
        dateFormat: newPreferences.dateFormat,
        visualTheme: newPreferences.visualTheme,
        notifyByEmail: !!newPreferences.notifyByEmail,
        notifyBySms: !!newPreferences.notifyBySms,
        smartTips: !!newPreferences.smartTips
      }
    },

    async login({ email, password, remember, device }) {
      return await UserService.login({ email, password, remember, device })
    },

    async register({ name, email, password }) {
      return await UserService.register({ name, email, password })
    },

    async confirmEmail(confirmUrl) {
      return await UserService.confirmEmail(confirmUrl)
    },

    async sendResetPasswordLink(form) {
      return await UserService.sendResetPasswordLink(form)
    },

    async checkResetLink(confirmUrl) {
      return await UserService.checkResetLink(confirmUrl)
    },

    async changePassword({ email, password, passwordConfirmation }) {
      return await UserService.changePassword({ email, password, passwordConfirmation })
    },

    async changeUserPassword({ currentPassword, newPassword, newPasswordConfirmation }) {
      return await UserService.changeUserPassword({ currentPassword, newPassword, newPasswordConfirmation })
    },

    initUserData({ name, email, userId, token, lastLogin, activeEvent, justLogin, avatar, phone }) {
      this.name = name
      this.email = email
      this.userId = userId
      this.token = token
      this.lastLogin = lastLogin
      this.activeEvent = activeEvent
      this.justLogin = justLogin
      this.avatar = avatar
      this.phone = phone
    },

    async initUserEvents() {
      return await UserService.getUserEvents()
    },

    async logOut() {
      getActivePinia()._s.forEach((store) => store.$reset())
    },

    async updateProfile({ name, phone, avatar }) {
      return await UserService.updateProfile({ name, phone, avatar })
    },

    async refreshUser() {
      const response = await UserService.refreshUser()

      console.log('checking data response', response.data)

      if (response.status === 200) {
        const {
          name,
          email,
          userId,
          lastLogin,
          activeEvent,
          justLogin,
          avatar_url: avatar,
          phone
        } = response.data?.data?.user ?? {}

        this.name = name
        this.email = email
        this.userId = userId
        this.lastLogin = lastLogin
        this.activeEvent = activeEvent
        this.justLogin = justLogin
        this.avatar = avatar
        this.phone = phone
      }
    },

    async initUserState() {
      const eventsStore = useEventsStore()
      //const guestStore = useGuestsStore()

      await eventsStore.initEvents(this.currentEventId)
      /*await guestStore.initGuests({
        eventId: this.currentEventId
      })*/
    }
  },
  getters: {
    isAuthenticated(state) {
      return state.token != null
    },
    lastLoginDate() {
      if (!this.lastLogin) {
        return ''
      }

      return format(new Date(this.lastLogin.login_time), "MMMM dd, yyyy 'at' h:mm a")
    }
  }
})
