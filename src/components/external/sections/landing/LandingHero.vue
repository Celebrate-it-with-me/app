<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'
import InvitationMock from './InvitationMock.vue'

const { t } = useI18n()
</script>

<template>
  <section class="relative overflow-hidden">
    <div
      class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:py-24"
    >
      <!-- Phones read the promise first; the showcase follows. -->
      <div class="text-center lg:text-left">
        <h1 class="font-heading text-[2.5rem] leading-[1.04] tracking-[-0.02em] text-ink-900 sm:text-5xl lg:text-[3.6rem] text-balance">
          {{ t('hero.title') }}
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-lg text-ink-500 lg:mx-0 text-balance">{{ t('hero.subtitle') }}</p>
        <div class="mt-8 flex flex-col items-center gap-3 lg:items-start">
          <UiButton size="lg" to="/sign-up" class="w-full sm:w-auto">{{ t('hero.cta') }}</UiButton>
          <UiButton variant="link" :to="{ path: '/', hash: '#como-funciona' }">{{ t('hero.secondary') }}</UiButton>
        </div>
        <p class="mt-4 text-sm text-ink-500">{{ t('hero.trust') }}</p>
      </div>

      <div class="px-2 pb-6 pt-4 sm:px-6 lg:px-0 lg:pb-8">
        <InvitationMock />
      </div>
    </div>
  </section>
</template>
