<script setup>
import { useI18n } from 'vue-i18n'
import { UiBadge } from '@/ui'

const { t, tm } = useI18n()
</script>

<template>
  <section id="incluye" class="scroll-mt-20 py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <h2 class="max-w-2xl font-heading text-3xl text-ink-900 sm:text-4xl text-balance">
        {{ t('features.title') }}
      </h2>
      <dl class="mt-10 grid border-t border-line sm:grid-cols-2 sm:gap-x-12">
        <div
          v-for="(item, i) in tm('features.items')"
          :key="i"
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
