<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MailWarning } from 'lucide-vue-next'
import { UiButton } from '@/ui'
import { useUserStore } from '@/stores/useUserStore'
import { useEmailVerificationStore } from '../stores/useEmailVerificationStore'

const { t } = useI18n()
const userStore = useUserStore()
const store = useEmailVerificationStore()

// Shown for as long as the API says the email is not verified; hides itself once it is.
const visible = computed(() => userStore.emailVerified === false)
const message = computed(
  () =>
    ({
      sent: t('emailVerify.notice.sent', { email: userStore.email }),
      limited: t('emailVerify.limited'),
      error: t('emailVerify.error'),
      verified: t('emailVerify.alreadyVerified')
    })[store.result] ?? ''
)
</script>

<template>
  <section
    v-if="visible"
    class="mb-4 flex flex-col gap-3 rounded-xl border border-warning-500/30 bg-warning-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    data-testid="email-verify-notice"
    aria-labelledby="email-verify-notice-title"
  >
    <div class="flex min-w-0 items-start gap-3">
      <MailWarning class="mt-0.5 h-5 w-5 shrink-0 text-warning-700" aria-hidden="true" />
      <div class="min-w-0">
        <h2 id="email-verify-notice-title" class="text-base font-semibold text-ink-900">{{ t('emailVerify.notice.title') }}</h2>
        <p class="text-sm text-ink-700">{{ t('emailVerify.notice.text', { email: userStore.email }) }}</p>
        <p v-if="message" class="mt-1 text-sm font-medium" :class="store.result === 'sent' || store.result === 'verified' ? 'text-success-700' : 'text-danger-700'" role="status">
          {{ message }}
        </p>
      </div>
    </div>
    <UiButton class="sm:shrink-0" variant="secondary" :loading="store.resending" @click="store.resend()">
      {{ t('emailVerify.resend') }}
    </UiButton>
  </section>
</template>
