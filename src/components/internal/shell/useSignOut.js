import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'

/** One place for "Cerrar sesión", used by the sidebar and the mobile "Más" sheet. */
export function useSignOut() {
  const router = useRouter()
  const userStore = useUserStore()

  return async function signOut() {
    await userStore.logOut()
    await router.push({ name: 'sign-in' })
  }
}
