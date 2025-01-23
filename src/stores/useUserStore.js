import { defineStore, getActivePinia } from 'pinia'
import UserService from '../services/UserService'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    email: '',
    userId: '',
    token: null
  }),
  persist: {
    enabled: true, // Enable persistence explicitly
    strategies: [
      {
        key: 'user-store', // Custom key to use in localStorage
        storage: localStorage, // Use localStorage explicitly (or sessionStorage if needed)
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

    initUserData({ name, email, userId, token }) {
      this.name = name
      this.email = email
      this.userId = userId
      this.token = token
    },

    async logOut() {
      const response = await UserService.logOut()

      if (response.status === 200) {
        console.log('is here. really')
        getActivePinia()._s.forEach((store) => store.$reset())
      }
    }
  },
  getters: {
    isAuthenticated(state) {
      return state.token != null
    }
  }
})
