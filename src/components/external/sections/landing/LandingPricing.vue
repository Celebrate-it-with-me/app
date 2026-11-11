<script setup>
import { useI18n } from 'vue-i18n'
import { Check } from 'lucide-vue-next'
import { UiButton, UiBadge } from '@/ui'

const { t, tm } = useI18n()
</script>

<template>
  <section id="precios" class="scroll-mt-20 bg-white py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="font-heading text-3xl text-ink-900 sm:text-4xl">{{ t('pricing.title') }}</h2>
        <p class="mt-3 text-lg text-ink-500">{{ t('pricing.subtitle') }}</p>
      </div>
      <div class="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        <div class="flex flex-col rounded-2xl border border-line bg-cream-50 p-7">
          <h3 class="font-body text-lg font-semibold text-ink-900">{{ t('pricing.free.name') }}</h3>
          <p class="mt-3 flex items-baseline gap-2">
            <span class="font-heading text-5xl text-ink-900">{{ t('pricing.free.price') }}</span>
            <span class="text-sm text-ink-500">{{ t('pricing.free.note') }}</span>
          </p>
          <ul class="mt-6 flex flex-1 flex-col gap-3">
            <li v-for="(item, i) in tm('pricing.free.items')" :key="i" class="flex items-start gap-2.5 text-base text-ink-700">
              <Check class="mt-1 h-4 w-4 shrink-0 text-success-500" aria-hidden="true" /> {{ item }}
            </li>
          </ul>
          <UiButton variant="secondary" block class="mt-8" to="/sign-up">{{ t('pricing.free.cta') }}</UiButton>
        </div>

        <div class="relative flex flex-col rounded-2xl border-2 border-rose-600 bg-white p-7 shadow-card">
          <UiBadge tone="rose" class="absolute -top-3 left-7">{{ t('pricing.full.badge') }}</UiBadge>
          <h3 class="font-body text-lg font-semibold text-ink-900">{{ t('pricing.full.name') }}</h3>
          <p class="mt-3 flex items-baseline gap-2">
            <span class="font-heading text-5xl text-ink-900">{{ t('pricing.full.price') }}</span>
            <span class="text-sm text-ink-500">{{ t('pricing.full.note') }}</span>
          </p>
          <ul class="mt-6 flex flex-1 flex-col gap-3">
            <li v-for="(item, i) in tm('pricing.full.items')" :key="i" class="flex items-start gap-2.5 text-base text-ink-700">
              <Check class="mt-1 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" /> {{ item }}
            </li>
          </ul>
          <UiButton block class="mt-8" to="/sign-up">{{ t('pricing.full.cta') }}</UiButton>
        </div>
      </div>
      <p class="mt-6 text-center text-sm text-ink-400">{{ t('pricing.fine') }}</p>
    </div>
  </section>
</template>
