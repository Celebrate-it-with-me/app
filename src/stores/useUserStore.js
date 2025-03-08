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
    userId: '',
    token: null,
    lastLogin: null,
    currentEventId: null,
  }),
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user-store',
        storage: localStorage,
      },
    ],
  },
  actions: {
    async login({ email, password, device }){
      return await UserService.login({email, password, device})
    },

    async register({ firstName, lastName, email, password }){
      return await UserService.register({ firstName, lastName, email, password})
    },

    initUserData({ name, email, userId, token, lastLogin }) {
      this.name = name
      this.email = email
      this.userId = userId
      this.token = token
      this.lastLogin = lastLogin
    },

    async logOut() {
      const response = await UserService.logOut()

      if (response.status === 200) {
        console.log('is here. really')
        getActivePinia()._s.forEach((store) => store.$reset())
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
