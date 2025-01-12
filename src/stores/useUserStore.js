import { defineStore } from 'pinia'

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
      const response =
    }
  }
})
