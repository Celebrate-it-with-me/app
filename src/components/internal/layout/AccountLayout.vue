<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import { useUserStore } from '@/stores/useUserStore'
import { UiPageHeader, UiButton } from '@/ui'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

async function logOut() {
  await userStore.logOut()
  await router.push({ name: 'sign-in' })
}
const tabs = [
  { key: 'profile', to: '/settings/profile' },
  { key: 'preferences', to: '/settings/preferences' },
  { key: 'security', to: '/settings/security' }
]
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

    <div class="mt-8 border-t border-line pt-6">
      <UiButton variant="secondary" class="w-full sm:w-auto" @click="logOut">
        <LogOut class="h-4 w-4" aria-hidden="true" />
        {{ t('app.user.logout') }}
      </UiButton>
    </div>
  </div>
</template>
