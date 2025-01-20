import { defineStore } from 'pinia'
import UserService from '../services/UserService'

export const useUserStore = defineStore('user', {
  state: () => ({
    isAuthenticated: false,
    name: '',
    email: '',
    userId: '',
  }),
  persist: true,
  actions: {
    async login({ email, password }){
      return await UserService.register({email, password})
    },

    async register({ firstName, lastName, email, password }){
      return await UserService.register({ firstName, lastName, email, password})
    }
  }
})
