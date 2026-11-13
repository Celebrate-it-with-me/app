import { defineStore } from 'pinia'
import { CWM_API } from '@/services/axios'
import { smartResetAllStores } from '@/utils/reset'
import { clearSession, readSession, writeSession } from '../utils/impersonation'

/**
 * The support session of THIS tab. Not persisted by Pinia: the token is kept in sessionStorage (tab only) and read
 * again when the page reloads. `ended` stays true after the session closes so the "session ended" screen can show.
 */
export const useImpersonationStore = defineStore('impersonation', {
  state: () => {
    const saved = readSession()
    return {
      token: saved?.token ?? '',
      expiresAt: saved?.expiresAt ?? null,
      sessionId: saved?.sessionId ?? null,
      staffLabel: saved?.staffLabel ?? 'Soporte',
      ended: false
    }
  },
  persist: false,
  getters: {
    active: state => Boolean(state.token) && !state.ended
  },
  actions: {
    save() {
      writeSession({
        token: this.token,
        expiresAt: this.expiresAt,
        sessionId: this.sessionId,
        staffLabel: this.staffLabel
      })
    },

    /** The admin handed us a token (from the URL fragment). */
    begin({ token, expires }) {
      this.token = token
      this.expiresAt = expires
      this.ended = false
      this.save()
    },

    /** What the API says about the session (`impersonating` in user / hydrate / auth-ready); null means it is over. */
    sync(banner) {
      if (!this.token) return
      if (!banner) return this.finish()
      this.sessionId = banner.sessionId ?? this.sessionId
      this.expiresAt = banner.expiresAt ?? this.expiresAt
      this.staffLabel = banner.staffLabel ?? this.staffLabel
      this.save()
    },

    /** Forget the token and everything of this person that the tab holds. Leaves `ended` set. */
    finish() {
      // Storage first: resetting the stores below re-creates this one from it.
      clearSession()
      try {
        sessionStorage.clear()
      } catch {
        /* nothing to clear */
      }
      smartResetAllStores()
      this.token = ''
      this.expiresAt = null
      this.sessionId = null
      this.ended = true
    },

    /** "Salir": tell the API (which emails the user), then close. Always ends locally, even when the call fails. */
    async exit() {
      try {
        await CWM_API.post('impersonation/end')
      } catch {
        /* an expired session answers 401: it is over either way */
      }
      this.finish()
    }
  }
})
