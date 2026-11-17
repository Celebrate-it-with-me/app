import { defineStore } from 'pinia'
import EmailVerificationService from '../services/EmailVerificationService'
import { useUserStore } from '@/stores/useUserStore'

export const useEmailVerificationStore = defineStore('emailVerification', {
  state: () => ({
    /** The "Verifica tu correo para continuar" dialog (opened by a 403 email_not_verified). */
    dialogOpen: false,
    resending: false,
    /** idle | sent | verified | limited | error: the last outcome of "Reenviar correo". */
    result: 'idle'
  }),
  persist: false,
  actions: {
    /** A publish or a purchase was refused: the user is, in fact, not verified. */
    openDialog() {
      useUserStore().setEmailVerified(false)
      this.result = 'idle'
      this.dialogOpen = true
    },
    closeDialog() {
      this.dialogOpen = false
    },
    /** Resends the email; returns the outcome (also kept in `result`). Never throws. */
    async resend() {
      if (this.resending) return this.result
      this.resending = true
      try {
        const { verified } = await EmailVerificationService.resend()
        if (verified) useUserStore().setEmailVerified(true)
        this.result = verified ? 'verified' : 'sent'
      } catch (e) {
        this.result = e?.response?.status === 429 ? 'limited' : 'error'
      } finally {
        this.resending = false
      }
      return this.result
    }
  }
})
