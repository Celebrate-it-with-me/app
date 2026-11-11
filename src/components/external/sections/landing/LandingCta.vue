<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'
import PapelPicado from '@/components/external/art/PapelPicado.vue'

const { t } = useI18n()
</script>

<template>
  <section class="px-4 pb-16 sm:px-6 sm:pb-24">
    <div
      class="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-ink-900 bg-pattern-dots text-center text-white"
    >
      <PapelPicado :colors="['#f0c6d0', '#e6cf93', '#fbf7f2', '#d27a91']" />
      <div class="px-6 pb-14 pt-6 sm:px-12">
        <h2 class="font-heading text-3xl text-white sm:text-4xl text-balance">
          {{ t('cta.title') }}
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-lg text-cream-300 text-balance">{{ t('cta.text') }}</p>
        <UiButton size="lg" to="/sign-up" class="mt-8">{{ t('cta.button') }}</UiButton>
      </div>
    </div>
  </section>
</template>
