<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { User, Settings, Shield, LogOut } from 'lucide-vue-next'
import { useUserStore } from '@/stores/useUserStore'
import { UiDropdown, UiAvatar } from '@/ui'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const items = computed(() => [
  { label: t('app.user.profile'), icon: User, onSelect: () => router.push('/settings/profile') },
  { label: t('app.user.preferences'), icon: Settings, onSelect: () => router.push('/settings/preferences') },
  { label: t('app.user.security'), icon: Shield, onSelect: () => router.push('/settings/security') },
  {
    label: t('app.user.logout'),
    icon: LogOut,
    separator: true,
    onSelect: async () => {
      await userStore.logOut()
      await router.push({ name: 'sign-in' })
    }
  }
])
</script>

<template>
  <UiDropdown :items="items">
    <template #trigger>
      <button
        type="button"
        class="flex items-center gap-2 rounded-full p-0.5 hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-rose-400"
        :aria-label="t('app.user.menu')"
      >
        <UiAvatar :name="userStore.name || ''" :src="userStore.avatar || ''" size="sm" />
        <span class="hidden max-w-32 truncate text-sm font-medium text-ink-900 md:block">{{ userStore.name }}</span>
      </button>
    </template>
  </UiDropdown>
</template>
