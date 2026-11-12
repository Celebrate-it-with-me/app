<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check } from 'lucide-vue-next'
import { UiButton, UiBadge } from '@/ui'
import { mailtoLink } from '@/config/brand'

/**
 * Two plans side by side. On md+ the cards share one grid with subgrid rows, so
 * names, prices, list starts and buttons line up without fixed heights.
 * Rows: name · tagline · price · list intro · list · button
 */
const { t, tm } = useI18n()

const quoteLink = computed(() =>
  mailtoLink({ subject: t('pricing.custom.mailSubject'), body: t('pricing.custom.mailBody') })
)

const CARD = 'md:grid md:grid-rows-subgrid md:row-span-6 flex flex-col gap-0 rounded-2xl border p-7'
</script>

<template>
  <section id="precios" class="scroll-mt-20 bg-white py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="font-heading text-3xl text-ink-900 sm:text-4xl text-balance">{{ t('pricing.title') }}</h2>
        <p class="mt-3 text-lg text-ink-500 text-balance">{{ t('pricing.subtitle') }}</p>
      </div>

      <div class="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2 md:grid-rows-[auto_auto_auto_auto_1fr_auto]">
        <!-- Free -->
        <article :class="[CARD, 'border-line bg-cream-50']" aria-labelledby="plan-free">
          <h3 id="plan-free" class="font-heading text-2xl text-ink-900">{{ t('pricing.free.name') }}</h3>
          <p class="mt-1 text-base text-ink-500">{{ t('pricing.free.tagline') }}</p>
          <p class="mt-5 flex flex-wrap items-baseline gap-x-2">
            <span class="font-heading text-5xl leading-none text-ink-900 tabular-nums">{{ t('pricing.free.price') }}</span>
            <span class="text-sm text-ink-500">{{ t('pricing.free.note') }}</span>
          </p>
          <p class="mt-6 border-t border-line pt-6 text-sm font-semibold text-ink-900">{{ t('pricing.free.intro') }}</p>
          <ul class="mt-3 flex flex-col gap-3">
            <li v-for="(item, i) in tm('pricing.free.items')" :key="i" class="flex items-start gap-2.5 text-base text-ink-700">
              <Check class="mt-1 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{{ item }}</span>
            </li>
          </ul>
          <div class="mt-8 md:self-start">
            <UiButton variant="secondary" block to="/sign-up">{{ t('pricing.free.cta') }}</UiButton>
          </div>
        </article>

        <!-- Full event -->
        <article :class="[CARD, 'border-wine-800 bg-rose-50']" aria-labelledby="plan-full">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 id="plan-full" class="font-heading text-2xl text-ink-900">{{ t('pricing.full.name') }}</h3>
            <UiBadge tone="rose" size="sm">{{ t('pricing.full.badge') }}</UiBadge>
          </div>
          <p class="mt-1 text-base text-ink-500">{{ t('pricing.full.tagline') }}</p>
          <p class="mt-5 flex flex-wrap items-baseline gap-x-2">
            <span class="font-heading text-5xl leading-none text-ink-900 tabular-nums">{{ t('pricing.full.price') }}</span>
            <span class="text-sm font-semibold text-ink-700">{{ t('pricing.full.currency') }}</span>
            <span class="w-full text-sm text-ink-500 sm:w-auto">{{ t('pricing.full.note') }}</span>
          </p>
          <p class="mt-6 border-t border-wine-800/20 pt-6 text-sm font-semibold text-ink-900">{{ t('pricing.full.intro') }}</p>
          <ul class="mt-3 flex flex-col gap-3">
            <li v-for="(item, i) in tm('pricing.full.items')" :key="i" class="flex items-start gap-2.5 text-base text-ink-700">
              <Check class="mt-1 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{{ item }}</span>
            </li>
          </ul>
          <div class="mt-8 md:self-start">
            <UiButton variant="wine" block to="/sign-up">{{ t('pricing.full.cta') }}</UiButton>
            <p class="mt-2 text-center text-sm text-ink-500">{{ t('pricing.full.helper') }}</p>
          </div>
        </article>
      </div>

      <p class="mt-6 text-center text-sm text-ink-500">{{ t('pricing.fine') }}</p>

      <!-- Optional add-on: a one-of-a-kind design, by quote. Not a third plan. -->
      <aside
        class="mx-auto mt-10 flex max-w-4xl flex-col gap-6 rounded-2xl border border-line bg-cream-50 p-7 md:flex-row md:items-center md:justify-between md:gap-10"
        :aria-label="t('pricing.custom.label')"
      >
        <div class="max-w-xl">
          <p class="text-sm font-semibold uppercase tracking-wide text-gold-700">{{ t('pricing.custom.label') }}</p>
          <h3 class="mt-2 font-heading text-2xl text-ink-900 text-balance">{{ t('pricing.custom.title') }}</h3>
          <p class="mt-2 text-base text-ink-500">{{ t('pricing.custom.text') }}</p>
        </div>
        <div class="flex shrink-0 flex-col gap-2 md:items-end">
          <UiButton variant="outline" :href="quoteLink" class="w-full md:w-auto">{{ t('pricing.custom.cta') }}</UiButton>
          <p class="text-center text-xs text-ink-500 md:text-right">{{ t('pricing.custom.note') }}</p>
        </div>
      </aside>
    </div>
  </section>
</template>
