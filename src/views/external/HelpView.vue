<script setup>
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import { UiPageHeader } from '@/ui'

const { t, tm } = useI18n()
const SUPPORT_EMAIL = 'hola@quinvite.com'
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
    <UiPageHeader :title="t('help.title')" :subtitle="t('help.intro')" />
    <div class="divide-y divide-line rounded-xl border border-line bg-white">
      <details v-for="(item, i) in tm('help.items')" :key="i" class="group px-5 py-4" :open="i === 0">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
          {{ item.q }}
          <ChevronDown class="h-5 w-5 shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p class="ui-details-body mt-3 text-base text-ink-500">{{ item.a }}</p>
      </details>
    </div>
    <i18n-t keypath="help.contact" tag="p" class="mt-8 text-center text-base text-ink-500">
      <template #email>
        <a :href="`mailto:${SUPPORT_EMAIL}`" class="font-semibold text-rose-600 hover:underline">{{ SUPPORT_EMAIL }}</a>
      </template>
    </i18n-t>
  </section>
</template>
