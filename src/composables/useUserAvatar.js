import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { resolveAvatarUrl } from '@/utils/avatar'

/** What `UiAvatar` needs to draw the signed-in person: name, image address (or '' for initials) and its `alt`. */
export function useUserAvatar() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const name = computed(() => userStore.name || '')
  const src = computed(() => resolveAvatarUrl(userStore.avatar))
  const alt = computed(() => t('account.profile.photoAlt', { name: name.value }))
  return { name, src, alt }
}
