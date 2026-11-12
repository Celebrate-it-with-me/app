<script setup>
import { useI18n } from 'vue-i18n'
import { UiBadge } from '@/ui'
import { useReveal } from '@/composables/useReveal'

const { t, tm } = useI18n()
const { root } = useReveal()
</script>

<template>
  <section id="incluye" ref="root" class="relative scroll-mt-20 overflow-hidden py-16 sm:py-24">
    <!-- The XV, the one numeral every quince owns, as a quiet watermark. -->
    <span
      class="pointer-events-none absolute -right-6 -top-10 select-none font-heading text-[16rem] leading-none text-gold-500/10 sm:-right-2 sm:text-[22rem]"
      aria-hidden="true"
    >XV</span>
    <div class="relative mx-auto max-w-6xl px-4 sm:px-6">
      <h2 class="max-w-2xl font-heading text-3xl text-ink-900 sm:text-4xl text-balance">
        {{ t('features.title') }}
      </h2>
      <dl class="mt-10 grid border-t border-line sm:grid-cols-2 sm:gap-x-12">
        <div
          v-for="(item, i) in tm('features.items')"
          :key="i"
          data-reveal
          :style="{ '--i': i }"
          class="border-b border-line py-7"
        >
          <dt class="flex flex-wrap items-center gap-3">
            <span class="font-heading text-2xl text-ink-900">{{ item.title }}</span>
            <UiBadge v-if="item.full" tone="gold" size="sm">{{ t('features.fullBadge') }}</UiBadge>
          </dt>
          <dd class="mt-2 max-w-prose text-base text-ink-500">{{ item.text }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
