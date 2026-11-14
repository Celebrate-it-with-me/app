import { defineStore } from 'pinia'
import axios from 'axios'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'
import {
  POLL_MS,
  isGuestRequestUrl,
  parseStatus,
  readDismissed,
  retryDelaySeconds,
  writeDismissed
} from '../utils/maintenance'

// A bare instance on purpose: no interceptors, so a failure here never redirects, logs out or raises a toast.
const statusApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + 'api/v1/public',
  headers: { Accept: 'application/json' },
  timeout: 10_000
})

let pollTimer = null
let retryTimer = null
let visibilityBound = false

/**
 * What the API says about maintenance. `maintenance` comes from the status endpoint (soft banner); `blocked` is set
 * when a real request got a 503 `maintenance` (full-screen notice) and clears on its own when the API comes back.
 */
export const useSystemStatusStore = defineStore('systemStatus', {
  state: () => ({
    maintenance: false,
    message: null,
    estimatedEnd: null,
    blocked: false,
    /** The blocked request came from a guest page: show a simple notice instead of a full screen. */
    blockedAsGuest: false,
    dismissed: readDismissed(),
    checking: false,
    attempt: 0
  }),
  persist: false,
  getters: {
    /** Support sessions see the notice but are never blocked by it. */
    supportSession: () => useImpersonationStore().active,
    showBanner: state => state.maintenance && !state.dismissed,
    showOverlay: state => state.blocked && !state.blockedAsGuest,
    showGuestNotice: state => state.blocked && state.blockedAsGuest
  },
  actions: {
    apply(status) {
      this.maintenance = status.maintenance
      this.message = status.message
      this.estimatedEnd = status.estimatedEnd
      if (!status.maintenance) this.recover()
    },

    /** One query. Network errors or odd payloads count as "no maintenance"; it never throws. */
    async fetchStatus() {
      this.checking = true
      try {
        const { data } = await statusApi.get('system-status')
        this.apply(parseStatus(data))
      } catch {
        this.apply(parseStatus(null))
      } finally {
        this.checking = false
      }
    },

    /** The API is back: leave the blocked state and forget the retry schedule. */
    recover() {
      this.blocked = false
      this.blockedAsGuest = false
      this.attempt = 0
      clearTimeout(retryTimer)
      retryTimer = null
    },

    /** Called by the axios interceptor on a 503 `maintenance`. Support sessions are never blocked. */
    handleMaintenanceResponse(error, currentPath = '') {
      const data = error?.response?.data ?? {}
      this.maintenance = true
      if (typeof data.message === 'string' && data.message.trim()) this.message = data.message.trim()
      if (this.supportSession) return
      this.blockedAsGuest = isGuestRequestUrl(error) || /^\/(i|template)\//.test(currentPath)
      this.blocked = true
      this.scheduleRetry(data.retryAfter ?? error?.response?.headers?.['retry-after'])
    },

    scheduleRetry(retryAfter) {
      clearTimeout(retryTimer)
      const seconds = retryDelaySeconds(retryAfter, this.attempt)
      this.attempt += 1
      retryTimer = setTimeout(() => this.retryNow(retryAfter), seconds * 1000)
    },

    /** "Reintentar ahora" and the automatic retries. */
    async retryNow(retryAfter) {
      clearTimeout(retryTimer)
      retryTimer = null
      await this.fetchStatus()
      if (this.blocked) this.scheduleRetry(retryAfter)
    },

    dismiss() {
      this.dismissed = true
      writeDismissed(true)
    },

    onVisibility() {
      if (typeof document === 'undefined') return
      if (document.hidden) this.pausePolling()
      else {
        this.fetchStatus()
        this.startPolling()
      }
    },

    startPolling() {
      if (pollTimer) return
      pollTimer = setInterval(() => {
        // While blocked, the retry schedule (with backoff) asks instead.
        if (!this.blocked) this.fetchStatus()
      }, POLL_MS)
    },

    pausePolling() {
      clearInterval(pollTimer)
      pollTimer = null
    },

    /** On app start: ask now, then every minute while the tab is visible. */
    start() {
      this.fetchStatus()
      if (typeof document !== 'undefined' && !document.hidden) this.startPolling()
      if (!visibilityBound && typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this.onVisibility)
        visibilityBound = true
      }
    },

    stop() {
      this.pausePolling()
      clearTimeout(retryTimer)
      retryTimer = null
      if (visibilityBound && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', this.onVisibility)
        visibilityBound = false
      }
    }
  }
})
