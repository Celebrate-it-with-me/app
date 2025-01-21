import { defineStore, getActivePinia } from 'pinia'
import UserService from '../services/UserService'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    email: '',
    userId: '',
    token: null
  }),
  persist: true,
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
