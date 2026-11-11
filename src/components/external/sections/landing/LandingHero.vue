<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'
import InvitationMock from './InvitationMock.vue'

const { t } = useI18n()
</script>

<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-rose-100 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-gold-100 blur-3xl"
      aria-hidden="true"
    />
    <div class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
      <div class="text-center lg:text-left">
        <p class="text-sm font-semibold uppercase tracking-wide text-rose-600">{{ t('hero.eyebrow') }}</p>
        <h1 class="mt-3 font-heading text-4xl leading-[1.05] text-ink-900 sm:text-5xl lg:text-6xl text-balance">
          {{ t('hero.title') }}
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-lg text-ink-500 lg:mx-0 text-balance">{{ t('hero.subtitle') }}</p>
        <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <UiButton size="lg" to="/sign-up" class="w-full sm:w-auto">{{ t('hero.cta') }}</UiButton>
          <UiButton size="lg" variant="secondary" :to="{ path: '/', hash: '#como-funciona' }" class="w-full sm:w-auto">
            {{ t('hero.secondary') }}
          </UiButton>
        </div>
        <p class="mt-4 text-sm text-ink-400">{{ t('hero.trust') }}</p>
      </div>
      <div class="flex justify-center lg:justify-end">
        <InvitationMock />
      </div>
    </div>
  </section>
</template>
