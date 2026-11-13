import { useImpersonationStore } from '../stores/useImpersonationStore'

/**
 * Ends the support session of this tab and leaves: asks the API to end it (unless it already expired), forgets the
 * token and shows the "session ended" screen; the tab closes itself when the browser lets a script do it.
 */
export async function endSupportSession(router, { expired = false } = {}) {
  const imp = useImpersonationStore()
  if (expired) imp.finish()
  else await imp.exit()
  await router.replace({ name: 'impersonation-ended', query: expired ? { reason: 'expired' } : {} })
  if (!expired) {
    try {
      window.close()
    } catch {
      /* the screen the router just opened stays */
    }
  }
}
