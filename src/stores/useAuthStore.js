import { defineStore } from 'pinia'
import { CWM_API } from '@/services/axios'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isReady: false
  }),
  // Remembered for the life of the tab: after a reload the session cookies are long set, so the `/auth/ready` round trip
  // (which only protects the moment right after login) is not repeated before the hydration. Logging out resets it.
  persist: {
    key: 'auth-ready',
    storage: sessionStorage
  },
  actions: {
    async ensureReady() {
      if (this.isReady) return

      const maxAttempts = 6
      const delays = [100, 200, 300, 400, 500, 600]

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          // A 401 here only means the cookies are not in place yet: retry, never log the person out (see axios onError).
          await CWM_API.get('/auth/ready', { skipUnauthorizedHandler: true })
          this.isReady = true
          return
        } catch (err) {
          const status = err?.response?.status
          if (status && status !== 401) {
            throw err
          }
          await sleep(delays[Math.min(attempt, delays.length - 1)])
        }
      }

      throw new Error('Auth session not ready after login (Sanctum cookies missing).')
    },

    reset() {
      this.isReady = false
    }
  }
})
