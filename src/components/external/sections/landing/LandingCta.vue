<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'

const { t } = useI18n()
</script>

<template>
  <section class="px-4 pb-16 sm:px-6 sm:pb-24">
    <div class="mx-auto max-w-4xl rounded-3xl bg-ink-900 px-6 py-14 text-center text-white sm:px-12">
      <h2 class="font-heading text-3xl text-white sm:text-4xl text-balance">{{ t('cta.title') }}</h2>
      <p class="mx-auto mt-3 max-w-xl text-lg text-cream-300 text-balance">{{ t('cta.text') }}</p>
      <UiButton size="lg" to="/sign-up" class="mt-8">{{ t('cta.button') }}</UiButton>
    </div>
  </section>
</template>
