<script setup>
import { useI18n } from 'vue-i18n'
import { MapPin, CalendarDays } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <!-- A phone with a sample invitation. Pure CSS so the landing never depends on real data. -->
  <div class="relative mx-auto w-[280px] sm:w-[300px]" aria-hidden="true">
    <div class="rounded-[2.4rem] border-[10px] border-ink-900 bg-ink-900 shadow-pop">
      <div class="overflow-hidden rounded-[1.8rem] bg-white">
        <div class="relative bg-gradient-to-b from-rose-100 via-cream-100 to-white px-6 pb-6 pt-10 text-center">
          <span class="absolute left-1/2 top-3 h-1.5 w-16 -translate-x-1/2 rounded-full bg-ink-900/80" />
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">{{ t('mock.eyebrow') }}</p>
          <p class="mt-3 font-heading text-5xl leading-none text-ink-900">{{ t('mock.name') }}</p>
          <div class="mx-auto mt-4 h-px w-16 bg-gold-500" />
          <p class="mt-4 flex items-center justify-center gap-1.5 text-sm text-ink-700">
            <CalendarDays class="h-4 w-4 text-rose-600" /> {{ t('mock.date') }}
          </p>
          <p class="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-ink-700">
            <MapPin class="h-4 w-4 text-rose-600" /> {{ t('mock.place') }}
          </p>
        </div>
        <div class="px-6 pb-7 pt-4 text-center">
          <p class="font-heading text-xl text-ink-900">{{ t('mock.question') }}</p>
          <div class="mt-4 flex flex-col gap-2">
            <span class="rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white">{{ t('mock.yes') }}</span>
            <span class="rounded-lg border border-line-strong py-2.5 text-sm font-semibold text-ink-700">{{ t('mock.no') }}</span>
          </div>
          <p class="mt-5 text-xs italic text-ink-400">{{ t('mock.footer') }}</p>
        </div>
      </div>
    </div>
    <div class="absolute -right-8 bottom-24 hidden rounded-xl bg-white px-3 py-2 text-xs font-medium text-ink-900 shadow-pop sm:block">
      <span class="mr-1.5 inline-block h-2 w-2 rounded-full bg-success-500" />86 confirmados
    </div>
  </div>
</template>
