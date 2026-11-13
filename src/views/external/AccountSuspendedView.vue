<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Mail, UserX } from 'lucide-vue-next'
import { UiButton, UiCard } from '@/ui'
import { SUSPENDED_SUPPORT_EMAIL } from '@/config/brand'
import { suspendedState } from '@/utils/accountSuspended'

const { t } = useI18n()
const email = computed(() => suspendedState.supportEmail || SUSPENDED_SUPPORT_EMAIL)
const href = computed(() => {
  const params = new URLSearchParams({ subject: t('accountSuspended.mailSubject') })
  return `mailto:${email.value}?${params.toString().replace(/\+/g, '%20')}`
})
</script>

<template>
  <section class="flex w-full justify-center">
    <UiCard class="w-full max-w-md" padding="lg">
      <div class="flex flex-col items-center text-center">
        <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <UserX class="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 class="font-heading text-3xl text-ink-900 text-balance">{{ t('accountSuspended.title') }}</h1>
        <p class="mt-3 text-base text-ink-700 text-balance">{{ t('accountSuspended.message') }}</p>
        <p class="mt-2 text-base text-ink-500 text-balance">{{ t('accountSuspended.contact') }}</p>

        <div class="mt-6 w-full rounded-lg border border-line bg-cream-100 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-ink-500">{{ t('accountSuspended.emailLabel') }}</p>
          <a :href="href" class="mt-1 block break-all text-lg font-semibold text-rose-600 underline-offset-4 hover:underline">{{ email }}</a>
        </div>

        <UiButton :href="href" block class="mt-5">
          <Mail class="h-4 w-4" aria-hidden="true" />
          {{ t('accountSuspended.write') }}
        </UiButton>
        <UiButton to="/" variant="ghost" block class="mt-2">{{ t('accountSuspended.home') }}</UiButton>
      </div>
    </UiCard>
  </section>
</template>
