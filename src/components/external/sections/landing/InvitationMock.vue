<script setup>
import { useI18n } from 'vue-i18n'
import { MapPin, CalendarDays } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <!--
    A phone with a sample invitation. Pure CSS so the landing never depends on real data.
    One authored motion on load: the invitation settles, a WhatsApp reply arrives, the counter ticks.
    Plays once; reduced motion keeps only the fades.
  -->
  <div class="relative mx-auto w-[280px] sm:w-[300px]" aria-hidden="true">
    <div class="mock-phone rounded-[2.4rem] border-[10px] border-ink-900 bg-ink-900 shadow-pop">
      <div class="overflow-hidden rounded-[1.8rem] bg-white">
        <div class="relative bg-gradient-to-b from-rose-100 via-cream-100 to-white px-6 pb-6 pt-10 text-center">
          <span class="absolute left-1/2 top-3 h-1.5 w-16 -translate-x-1/2 rounded-full bg-ink-900/80" />
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">{{ t('mock.eyebrow') }}</p>
          <p class="mt-3 font-heading text-5xl leading-none text-ink-900">{{ t('mock.name') }}</p>
          <div class="mock-rule mx-auto mt-4 h-px w-16 bg-gold-500" />
          <p class="mt-4 flex items-center justify-center gap-1.5 text-sm text-ink-700">
            <CalendarDays class="h-4 w-4 shrink-0 text-rose-600" />
            <span class="whitespace-nowrap">{{ t('mock.date') }}</span>
          </p>
          <p class="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-ink-700">
            <MapPin class="h-4 w-4 shrink-0 text-rose-600" /> {{ t('mock.place') }}
          </p>
        </div>
        <div class="px-6 pb-7 pt-4 text-center">
          <p class="font-heading text-xl text-ink-900">{{ t('mock.question') }}</p>
          <div class="mt-4 flex flex-col gap-2">
            <span class="rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white">{{ t('mock.yes') }}</span>
            <span class="rounded-lg border border-line-strong py-2.5 text-sm font-semibold text-ink-700">{{ t('mock.no') }}</span>
          </div>
          <p class="mt-5 text-xs italic text-ink-500">{{ t('mock.footer') }}</p>
        </div>
      </div>
    </div>

    <!-- WhatsApp reply arriving -->
    <div
      class="mock-bubble absolute -bottom-6 -left-1 w-52 rounded-2xl rounded-bl-md bg-[#e7fbe3] px-3.5 py-2.5 text-left shadow-pop sm:-left-8 lg:-left-60 lg:bottom-auto lg:top-[42%] lg:w-56"
    >
      <p class="text-xs font-semibold text-success-700">{{ t('mock.bubbleName') }}</p>
      <p class="text-sm text-ink-900">{{ t('mock.bubbleText') }}</p>
    </div>

    <!-- Confirmed counter -->
    <div
      class="mock-counter absolute -right-1 -top-5 flex items-baseline gap-1.5 rounded-xl bg-white px-3.5 py-2.5 shadow-pop lg:-bottom-5 lg:-right-6 lg:top-auto"
    >
      <span class="font-heading text-2xl leading-none text-ink-900 tabular-nums">86</span>
      <span class="text-xs text-ink-500">{{ t('mock.counterLabel') }}</span>
    </div>
  </div>
</template>

<style scoped>
.mock-phone {
  animation: mock-settle 600ms cubic-bezier(0.23, 1, 0.32, 1) both;
}
.mock-rule {
  transform-origin: center;
  animation: mock-rule 500ms cubic-bezier(0.23, 1, 0.32, 1) 350ms both;
}
.mock-bubble {
  animation: mock-pop 450ms cubic-bezier(0.23, 1, 0.32, 1) 1100ms both;
  transform-origin: bottom left;
}
.mock-counter {
  animation: mock-pop 450ms cubic-bezier(0.23, 1, 0.32, 1) 1700ms both;
  transform-origin: bottom right;
}

@keyframes mock-settle {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes mock-rule {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
@keyframes mock-pop {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mock-phone,
  .mock-rule,
  .mock-bubble,
  .mock-counter {
    animation-duration: 250ms;
    animation-delay: 0ms;
    transform: none;
  }
}
</style>
