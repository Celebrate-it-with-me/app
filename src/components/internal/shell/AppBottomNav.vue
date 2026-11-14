<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { LogOut, Lock, UsersRound } from 'lucide-vue-next'
import { useAppNav } from './useAppNav'
import { useSignOut } from './useSignOut'
import { UiModal } from '@/ui'
import { cx } from '@/ui/utils'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { isActivePath } from './navModules'

/**
 * Phone navigation (below `lg`, where the sidebar takes over): Home, "Tu invitación", Guests, "Organización" and
 * "Más". The last two open a bottom sheet with the rest of the modules, from the same source as the sidebar.
 * It stays clear of the home indicator (safe area); the page leaves room for it (`pb-*` in the layout).
 */
const { t } = useI18n()
const route = useRoute()
const eventsStore = useEventsStore()
const { mobileTabs } = useAppNav()
const signOut = useSignOut()

const sheetKey = ref(null)
const sheetTab = computed(() => mobileTabs.value.find(tab => tab.key === sheetKey.value) ?? null)
const sheetOpen = computed({
  get: () => sheetKey.value !== null,
  set: value => {
    if (!value) sheetKey.value = null
  }
})
// Any navigation closes the sheet (a link inside it, the back button, a deep link).
watch(() => route.fullPath, () => (sheetKey.value = null))

const canManageCollaborators = computed(
  () => eventsStore.activeEvent?.userRole === 'owner' || eventsStore.hasPermission('manage_collaborators')
)

const linkActive = tab =>
  tab.routeNames ? tab.routeNames.includes(route.name) : isActivePath(route.path, tab.to)
const sheetActive = tab => tab.items.some(item => isActivePath(route.path, item.to))
const isTabActive = tab => (tab.kind === 'link' ? linkActive(tab) : sheetKey.value === tab.key || sheetActive(tab))

const tabClass = active =>
  cx(
    'relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 text-center text-[0.6875rem] font-medium leading-tight',
    'motion-safe:transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose-500',
    active ? 'text-rose-800' : 'text-ink-600 hover:text-ink-900'
  )
const pillClass = active =>
  cx(
    'flex h-7 w-12 items-center justify-center rounded-full motion-safe:transition-colors',
    active ? 'bg-rose-100' : 'bg-transparent'
  )
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream-50/95 backdrop-blur lg:hidden"
    :aria-label="t('app.nav.label')"
    data-testid="bottom-nav"
  >
    <ul class="flex items-stretch px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1">
      <li v-for="tab in mobileTabs" :key="tab.key" class="flex min-w-0 flex-1">
        <router-link
          v-if="tab.kind === 'link'"
          :to="tab.to"
          :class="tabClass(isTabActive(tab))"
          :aria-current="isTabActive(tab) ? 'page' : undefined"
          :data-testid="`tab-${tab.key}`"
        >
          <span :class="pillClass(isTabActive(tab))"><component :is="tab.icon" class="h-5 w-5" aria-hidden="true" /></span>
          <span class="max-w-full break-words">{{ t(tab.labelKey) }}</span>
        </router-link>
        <button
          v-else
          type="button"
          :class="tabClass(isTabActive(tab))"
          :aria-haspopup="'dialog'"
          :aria-expanded="sheetKey === tab.key"
          :data-testid="`tab-${tab.key}`"
          @click="sheetKey = tab.key"
        >
          <span :class="pillClass(isTabActive(tab))"><component :is="tab.icon" class="h-5 w-5" aria-hidden="true" /></span>
          <span class="max-w-full break-words">{{ t(tab.labelKey) }}</span>
        </button>
      </li>
    </ul>
  </nav>

  <UiModal v-model:open="sheetOpen" :title="sheetTab ? t(sheetTab.labelKey) : ''" size="sm">
    <template v-if="sheetTab">
      <ul class="grid grid-cols-3 gap-2" data-testid="sheet-items">
        <li v-for="item in sheetTab.items" :key="item.key">
          <router-link
            :to="item.to"
            :class="
              cx(
                'flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 text-center text-xs font-medium text-ink-800 hover:bg-cream-200',
                isActivePath(route.path, item.to) ? 'border-rose-300 bg-rose-50' : 'border-line bg-cream-50'
              )
            "
            :aria-current="isActivePath(route.path, item.to) ? 'page' : undefined"
            :data-testid="`sheet-${item.key}`"
          >
            <span class="relative">
              <component :is="item.icon" class="h-5 w-5" :class="item.state === 'locked' ? 'text-ink-500' : 'text-rose-700'" aria-hidden="true" />
              <Lock
                v-if="item.state === 'locked'"
                class="absolute -right-2 -top-1.5 h-3 w-3 text-ink-600"
                :aria-label="t('app.nav.premium')"
                role="img"
              />
            </span>
            {{ t(item.labelKey) }}
          </router-link>
        </li>
      </ul>

      <div v-if="sheetTab.key === 'more'" class="mt-4 flex flex-col border-t border-line pt-2">
        <router-link
          v-if="canManageCollaborators"
          to="/dashboard/collaborators"
          class="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-800 hover:bg-cream-200"
          data-testid="sheet-collaborators"
        >
          <UsersRound class="h-4.5 w-4.5" aria-hidden="true" />
          {{ t('app.nav.collaborators') }}
        </router-link>
        <button
          type="button"
          class="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-800 hover:bg-cream-200"
          @click="sheetKey = null; signOut()"
        >
          <LogOut class="h-4.5 w-4.5" aria-hidden="true" />
          {{ t('app.user.logout') }}
        </button>
      </div>
    </template>
  </UiModal>
</template>
