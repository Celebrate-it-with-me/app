import { computed } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { buildNavSections, buildMobileNav } from './navModules'

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

  // The phone's bottom bar: Home, "Tu invitación", Guests, "Organización" (sheet) and "Más" (sheet).
  const mobileTabs = computed(() =>
    buildMobileNav(
      byGroup.value.map(group => ({ section: group.group, items: group.items })),
      eventsStore.activeEvent?.id ?? null
    )
  )

  return { items, byGroup, mobileTabs }
}
