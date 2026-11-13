<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { UiPageHeader } from '@/ui'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'

const { t } = useI18n()
const impersonation = useImpersonationStore()
// Password and two-step verification are off limits in a support session (the server refuses them too).
const tabs = computed(() =>
  [
    { key: 'profile', to: '/settings/profile' },
    { key: 'preferences', to: '/settings/preferences' },
    { key: 'security', to: '/settings/security' }
  ].filter(tab => !(impersonation.active && tab.key === 'security'))
)
</script>

<template>
  <div class="mx-auto w-full max-w-2xl">
    <UiPageHeader :title="t('account.title')" :subtitle="t('account.subtitle')" />

    <nav :aria-label="t('account.nav')" class="-mt-2 mb-6 flex gap-1 overflow-x-auto border-b border-line">
      <router-link
        v-for="tab in tabs"
        :key="tab.key"
        :to="tab.to"
        class="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-base font-medium text-ink-500 outline-none transition-colors hover:text-ink-900 focus-visible:text-rose-600"
        active-class="!border-rose-600 !text-ink-900"
      >
        {{ t(`account.tabs.${tab.key}`) }}
      </router-link>
    </nav>

    <router-view />
  </div>
</template>
