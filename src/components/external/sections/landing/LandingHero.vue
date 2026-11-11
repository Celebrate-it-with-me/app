<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'
import InvitationMock from './InvitationMock.vue'

const { t } = useI18n()
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-24">
      <div class="order-first flex justify-center pt-4 lg:order-last lg:justify-end lg:pt-0">
        <InvitationMock />
      </div>
      <div class="text-center lg:text-left">
        <h1 class="font-heading text-[2.6rem] leading-[1.02] tracking-[-0.02em] text-ink-900 sm:text-5xl lg:text-6xl text-balance">
          {{ t('hero.title') }}
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-lg text-ink-500 lg:mx-0 text-balance">{{ t('hero.subtitle') }}</p>
        <div class="mt-8 flex flex-col items-center gap-3 lg:items-start">
          <UiButton size="lg" to="/sign-up" class="w-full sm:w-auto">{{ t('hero.cta') }}</UiButton>
          <UiButton variant="link" :to="{ path: '/', hash: '#como-funciona' }">{{ t('hero.secondary') }}</UiButton>
        </div>
        <p class="mt-4 text-sm text-ink-500">{{ t('hero.trust') }}</p>
      </div>
    </div>
  </section>
</template>
