<script setup>
import { useI18n } from 'vue-i18n'
import { UiPageHeader } from '@/ui'

defineProps({
  title: { type: String, required: true },
  updated: { type: String, default: '' }
})
const { t, locale } = useI18n()
</script>

<template>
  <article class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
    <UiPageHeader :title="title" :subtitle="updated ? t('legal.updated', { date: updated }) : ''" />
    <p v-if="locale !== 'en'" class="mb-6 rounded-lg bg-cream-200 px-4 py-3 text-sm text-ink-700">
      {{ t('legal.englishOnly') }}
    </p>
    <div
      class="legal text-base leading-relaxed text-ink-700 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-ink-900 [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-ink-900 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_a]:text-rose-600 [&_a]:underline [&_strong]:text-ink-900"
    >
      <slot />
    </div>
  </article>
</template>
