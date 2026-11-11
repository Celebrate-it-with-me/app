<script setup>
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'

const { t, tm } = useI18n()
</script>

<template>
  <section id="faq" class="scroll-mt-20 py-16 sm:py-24">
    <div class="mx-auto max-w-3xl px-4 sm:px-6">
      <h2 class="text-center font-heading text-3xl text-ink-900 sm:text-4xl">{{ t('faq.title') }}</h2>
      <div class="mt-10 divide-y divide-line rounded-xl border border-line bg-white">
        <details v-for="(item, i) in tm('faq.items')" :key="i" class="group px-5 py-4" :open="i === 0">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
            {{ item.q }}
            <ChevronDown class="h-5 w-5 shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p class="ui-details-body mt-3 text-base text-ink-500">{{ item.a }}</p>
        </details>
      </div>
    </div>
  </section>
</template>
