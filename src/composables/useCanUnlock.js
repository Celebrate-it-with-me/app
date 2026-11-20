import { computed } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

/**
 * Only the event's owner can pay to unlock it (the API demands `delete_event`, which editors and viewers lack).
 * An unknown role (event not loaded yet, or no role in the payload) counts as allowed: the API still has the last word.
 */
export function useCanUnlock() {
  const eventsStore = useEventsStore()
  const role = computed(() => eventsStore.activeEvent?.userRole ?? null)
  const canUnlock = computed(() => role.value === null || role.value === 'owner')
  return { canUnlock }
}
