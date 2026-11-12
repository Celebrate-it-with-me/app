<script setup>
/**
 * Organizer app shell: header with event switcher and user menu, sidebar on large
 * screens, bottom navigation on phones. Light only. Screens inside are migrated one by one.
 */
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { CalendarPlus } from 'lucide-vue-next'
import QuinviteLogo from '@/components/brand/QuinviteLogo.vue'
import EventSwitcher from '@/components/internal/shell/EventSwitcher.vue'
import UserMenu from '@/components/internal/shell/UserMenu.vue'
import AppSidebar from '@/components/internal/shell/AppSidebar.vue'
import AppBottomNav from '@/components/internal/shell/AppBottomNav.vue'
import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'
import { UiButton, UiEmptyState } from '@/ui'
import { useUserStore } from '@/stores/useUserStore'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useHydrationStore } from '@/stores/useHydrationStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'

const { t } = useI18n()
const userStore = useUserStore()
const eventsStore = useEventsStore()
const hydrationStore = useHydrationStore()
const collaboratorsStore = useCollaboratorsStore()
const route = useRoute()
const router = useRouter()
const loading = ref(false)

const shouldShowRouteView = computed(() => {
  if (route.name === 'invitations-processor') return true
  return eventsStore.events.length === 0 || eventsStore.activeEvent
})

onMounted(async () => {
  // The app is light-only; make sure no legacy dark class survives.
  document.documentElement.classList.remove('dark')
  loading.value = true
  if (!hydrationStore.isHydrated) {
    await nextTick(async () => {
      await hydrationStore.hydrateAll()
    })
  }
  await collaboratorsStore.loadInvitations()

  if (userStore.isAuthenticated) {
    if (userStore.justLogin === true) userStore.justLogin = false
    if (route.path === '/dashboard' || route.path === '/dashboard/') await determinatePostLoginRoute()
  }
  loading.value = false
})

const determinatePostLoginRoute = async () => {
  if (userStore.activeEvent) return
  if (eventsStore.hasEvents) {
    await eventsStore.setActiveEvent(eventsStore.events[0])
    return router.push('/dashboard')
  }
  return router.push('/dashboard/events/create')
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-cream-100 text-ink-900">
    <header class="sticky top-0 z-40 border-b border-line/70 bg-cream-100/90 backdrop-blur">
      <div class="flex h-14 items-center gap-3 px-3 sm:px-4 lg:h-16 lg:px-6">
        <router-link to="/dashboard" class="shrink-0 text-ink-900" aria-label="Quinvite">
          <span class="block lg:hidden"><QuinviteLogo mark class="h-8" /></span>
          <span class="hidden lg:block"><QuinviteLogo class="h-8" /></span>
        </router-link>
        <!-- Right side: the event you are working on, next to who you are. -->
        <div class="flex min-w-0 flex-1 items-center justify-end gap-3">
          <EventSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>

    <div class="flex-1 lg:flex">
      <aside
        class="sticky top-16 hidden h-[calc(100vh-4rem-1px)] w-60 shrink-0 border-r border-line/70 bg-cream-50 lg:block"
      >
        <AppSidebar />
      </aside>

      <div class="flex min-w-0 flex-1 flex-col overflow-x-clip">
        <CPageLoaderV2 v-if="loading" />
        <main v-else class="mx-auto w-full max-w-6xl flex-1 overflow-x-clip px-4 pb-24 pt-5 sm:px-6 lg:pb-10 lg:pt-8">
          <UiEmptyState v-if="!shouldShowRouteView" :title="t('app.noEventTitle')" :description="t('app.noEventText')">
            <template #icon><CalendarPlus class="h-6 w-6" /></template>
            <UiButton to="/dashboard/events">{{ t('app.chooseEvent') }}</UiButton>
          </UiEmptyState>
          <router-view v-else />
        </main>
        <footer class="mt-auto hidden px-6 pb-6 pt-4 text-xs text-ink-500 lg:block">
          © {{ new Date().getFullYear() }} {{ t('common.company') }} · {{ t('common.brand') }}
        </footer>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
