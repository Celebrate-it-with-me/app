import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'
import { endSupportSession } from '@/modules/impersonation/utils/endSession'

/** One place for "Cerrar sesión", used by the sidebar and the mobile "Más" sheet. */
export function useSignOut() {
  const router = useRouter()
  const userStore = useUserStore()
  const impersonation = useImpersonationStore()

  return async function signOut() {
    // In a support session "sign out" means leaving it (the server does not allow a real logout there).
    if (impersonation.active) return endSupportSession(router)
    await userStore.logOut()
    await router.push({ name: 'sign-in' })
  }
}
