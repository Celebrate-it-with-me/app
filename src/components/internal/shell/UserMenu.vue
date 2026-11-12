<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { UiAvatar } from '@/ui'

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()
</script>

<template>
  <router-link
    to="/settings/profile"
    class="flex items-center gap-2 rounded-full p-0.5 hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-rose-400"
    :aria-label="t('account.title')"
    :aria-current="route.path.startsWith('/settings') ? 'page' : undefined"
  >
    <UiAvatar :name="userStore.name || ''" :src="userStore.avatar || ''" size="sm" />
    <span class="hidden max-w-32 truncate pr-2 text-sm font-medium text-ink-900 md:block">{{ userStore.name }}</span>
  </router-link>
</template>
