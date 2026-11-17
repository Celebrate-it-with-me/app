<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiModal } from '@/ui'
import { useUserStore } from '@/stores/useUserStore'
import { useEmailVerificationStore } from '../stores/useEmailVerificationStore'

const { t } = useI18n()
const userStore = useUserStore()
const store = useEmailVerificationStore()

const message = computed(
  () =>
    ({
      sent: t('emailVerify.dialog.sent', { email: userStore.email }),
      limited: t('emailVerify.limited'),
      error: t('emailVerify.error'),
      verified: t('emailVerify.dialog.alreadyVerified')
    })[store.result] ?? ''
)
const positive = computed(() => ['sent', 'verified'].includes(store.result))
</script>

<template>
  <UiModal
    :open="store.dialogOpen"
    size="sm"
    :title="t('emailVerify.dialog.title')"
    :description="t('emailVerify.dialog.text', { email: userStore.email })"
    @update:open="value => !value && store.closeDialog()"
  >
    <p v-if="message" class="text-sm font-medium" :class="positive ? 'text-success-700' : 'text-danger-700'" role="status">{{ message }}</p>
    <template #footer>
      <UiButton variant="ghost" @click="store.closeDialog()">{{ t('emailVerify.dialog.close') }}</UiButton>
      <UiButton v-if="store.result !== 'verified'" :loading="store.resending" @click="store.resend()">{{ t('emailVerify.resend') }}</UiButton>
    </template>
  </UiModal>
</template>
