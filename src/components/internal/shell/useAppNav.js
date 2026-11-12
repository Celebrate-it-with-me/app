import { computed } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { buildNavSections } from './navModules'

/**
 * Navigation of the organizer app. One source for the sidebar, the bottom bar and the "Más" sheet.
 * What it shows comes from the modules the API sends for the active event (see `navModules.js`).
 * Labels are i18n keys under `app.nav`.
 */
export function useAppNav() {
  const eventsStore = useEventsStore()

  /** `[{ section, items }]`; `section` titles are `app.groups.<section>` (the first one has none). */
  const byGroup = computed(() =>
    buildNavSections(eventsStore.activeEvent?.modules).map(group => ({ group: group.section, items: group.items }))
  )
  const items = computed(() => byGroup.value.flatMap(group => group.items))

  // The phone's bottom bar: the usable main modules; everything else, including locked ones, goes under "Más".
  const primary = computed(() => items.value.filter(item => item.primary).slice(0, 4))
  const secondary = computed(() => items.value.filter(item => !primary.value.includes(item)))

  return { items, primary, secondary, byGroup }
}
