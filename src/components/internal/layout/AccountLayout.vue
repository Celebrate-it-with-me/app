<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { UiPageHeader, UiPage } from '@/ui'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'

const { t } = useI18n()
const impersonation = useImpersonationStore()
// Password and two-step verification are off limits in a support session (the server refuses them too).
const tabs = computed(() =>
  [
    { key: 'profile', to: '/settings/profile' },
    { key: 'preferences', to: '/settings/preferences' },
    { key: 'purchases', to: '/settings/purchases' },
    { key: 'security', to: '/settings/security' }
  ].filter(tab => !(impersonation.active && tab.key === 'security'))
)
// "Preferencias" does not fit its quarter of the row on the narrowest phones: it turns into "Ajustes" there (its name stays whole).
const hasShort = key => key === 'preferences'
</script>

<template>
  <UiPage>
    <UiPageHeader :title="t('account.title')" :subtitle="t('account.subtitle')" />

    <!-- Below 1024 px four tabs share the row (no scrolling); from 1024 px they become a side list next to the content. -->
    <div class="lg:grid lg:grid-cols-[200px_minmax(0,640px)] lg:items-start lg:gap-8" data-testid="account-grid">
      <div class="-mt-2 mb-6 lg:sticky lg:top-[88px] lg:mt-0 lg:mb-0" data-testid="account-nav">
        <nav
          :aria-label="t('account.nav')"
          class="grid w-full grid-cols-4 border-b border-line lg:flex lg:flex-col lg:gap-0.5 lg:border-b-0"
        >
          <router-link
            v-for="tab in tabs"
            :key="tab.key"
            :to="tab.to"
            :aria-label="hasShort(tab.key) ? t(`account.tabs.${tab.key}`) : undefined"
            class="relative -mb-px flex min-h-11 items-center justify-center border-b-2 border-transparent px-0.5 py-3 text-center text-[13px] font-medium text-ink-500 outline-none transition-colors hover:text-ink-900 focus-visible:text-rose-600 focus-visible:underline sm:text-base lg:mb-0 lg:justify-start lg:rounded-[10px] lg:border-b-0 lg:px-3 lg:py-[9px] lg:text-sm lg:hover:bg-cream-100 lg:focus-visible:bg-cream-100"
            active-class="!border-rose-600 !text-ink-900 lg:!bg-rose-50 lg:!text-rose-700 lg:font-semibold"
          >
            <template v-if="hasShort(tab.key)">
              <span class="min-[400px]:hidden" aria-hidden="true">{{ t(`account.tabsShort.${tab.key}`) }}</span>
              <span class="hidden min-[400px]:inline" aria-hidden="true">{{ t(`account.tabs.${tab.key}`) }}</span>
            </template>
            <template v-else>{{ t(`account.tabs.${tab.key}`) }}</template>
          </router-link>
        </nav>
      </div>

      <div class="min-w-0">
        <router-view />
      </div>
    </div>
  </UiPage>
</template>
