<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MapPin, CalendarDays, Check } from 'lucide-vue-next'
import portrait640 from '@/assets/images/brand/quince-garden-portrait-640.webp'
import portrait1400 from '@/assets/images/brand/quince-garden-portrait.webp'
import family480 from '@/assets/images/brand/quince-family-golden-hour-480.webp'
import family800 from '@/assets/images/brand/quince-family-golden-hour-800.webp'
import tiara480 from '@/assets/images/brand/tiara-blush-roses-480.webp'
import tiara800 from '@/assets/images/brand/tiara-blush-roses-800.webp'

/**
 * The hero showcase: a sample invitation on a phone, two printed photos behind it,
 * one WhatsApp reply arriving and the confirmed counter ticking from 83 to 86.
 * Plays once when the showcase enters the viewport. Reduced motion: final state at once.
 * The RSVP buttons answer locally; nothing is sent anywhere.
 */
const { t } = useI18n()

const TOTAL = 120
const START = 83
const END = 86

const root = ref(null)
const playing = ref(false)
const settled = ref(false)
const count = ref(START)
const answer = ref(null)

let observer
let timers = []

function finish() {
  settled.value = true
  playing.value = true
  count.value = END
}

function play() {
  playing.value = true
  // bubble lands at 1.1s + 0.45s; the counter ticks 84 → 85 → 86 right after
  timers = [
    setTimeout(() => (count.value = START + 1), 1600),
    setTimeout(() => (count.value = START + 2), 1750),
    setTimeout(() => (count.value = END), 1900),
    setTimeout(() => (settled.value = true), 2500)
  ]
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !('IntersectionObserver' in window)) return finish()
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      play()
    },
    { threshold: 0.35 }
  )
  observer.observe(root.value)
})

onUnmounted(() => {
  observer?.disconnect()
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div
    ref="root"
    class="showcase relative mx-auto w-full max-w-[21rem] sm:max-w-[30rem] lg:max-w-[34rem]"
    :class="{ 'is-playing': playing, 'is-settled': settled }"
  >
    <!-- A single ribbon stroke behind everything -->
    <svg
      class="ribbon pointer-events-none absolute -left-6 -top-6 h-[112%] w-[112%]"
      viewBox="0 0 540 560"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M30 420 C 60 300, 150 260, 250 330 S 470 470, 520 300 S 420 60, 300 80"
        stroke="#c9a24e"
        stroke-opacity="0.45"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>

    <!-- Family photo, printed, slightly turned, behind the phone -->
    <figure class="photo photo-family absolute left-0 top-6 w-[42%] sm:top-2 sm:w-[46%]">
      <img
        :srcset="`${family480} 480w, ${family800} 640w`"
        sizes="(min-width: 1024px) 250px, (min-width: 640px) 220px, 140px"
        :src="family480"
        width="480"
        height="600"
        loading="lazy"
        decoding="async"
        alt=""
        class="block h-auto w-full"
      />
    </figure>

    <!-- Tiara detail, behind and lower -->
    <figure class="photo photo-tiara absolute bottom-0 right-0 hidden w-[44%] sm:block">
      <img
        :srcset="`${tiara480} 480w, ${tiara800} 640w`"
        sizes="(min-width: 1024px) 240px, 210px"
        :src="tiara480"
        width="480"
        height="600"
        loading="lazy"
        decoding="async"
        alt=""
        class="block h-auto w-full"
      />
    </figure>

    <!-- The phone with the sample invitation -->
    <figure
      class="phone relative z-10 mx-auto w-[16.5rem] rounded-[2.4rem] border-[9px] border-ink-900 bg-ink-900 shadow-pop sm:w-[18rem]"
    >
      <div class="overflow-hidden rounded-[1.85rem] bg-white">
        <div class="relative aspect-[3/4] w-full">
          <img
            :srcset="`${portrait640} 640w, ${portrait1400} 933w`"
            sizes="(min-width: 640px) 288px, 264px"
            :src="portrait640"
            width="640"
            height="960"
            fetchpriority="high"
            decoding="async"
            :alt="t('mock.portraitAlt')"
            class="absolute inset-0 h-full w-full object-cover object-[50%_18%]"
          />
          <span class="absolute left-1/2 top-2.5 h-1.5 w-14 -translate-x-1/2 rounded-full bg-ink-900/70" aria-hidden="true" />
          <!-- Localized gradient so the name reads over the dress -->
          <div class="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-900/75 via-ink-900/30 to-transparent" aria-hidden="true" />
          <div class="absolute inset-x-0 bottom-0 px-5 pb-4 text-center text-white">
            <p class="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-gold-300">{{ t('mock.eyebrow') }}</p>
            <p class="mt-1 font-heading text-[2.6rem] leading-none">{{ t('mock.name') }}</p>
          </div>
        </div>

        <div class="px-5 pb-5 pt-4 text-center">
          <p class="flex items-center justify-center gap-1.5 text-[0.8rem] text-ink-700">
            <CalendarDays class="h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden="true" />
            <span class="whitespace-nowrap">{{ t('mock.date') }}</span>
          </p>
          <p class="mt-1 flex items-center justify-center gap-1.5 text-[0.8rem] text-ink-700">
            <MapPin class="h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden="true" /> {{ t('mock.place') }}
          </p>

          <div v-if="answer" class="mt-4 rounded-lg bg-rose-50 px-3 py-3" role="status" aria-live="polite">
            <p class="flex items-center justify-center gap-1.5 font-heading text-lg text-ink-900">
              <Check v-if="answer === 'yes'" class="h-4 w-4 text-success-500" aria-hidden="true" />
              {{ answer === 'yes' ? t('mock.thanks') : t('mock.sorry') }}
            </p>
            <p class="mt-0.5 text-xs text-ink-500">{{ t('mock.demoNote') }}</p>
          </div>
          <template v-else>
            <p class="mt-3 font-heading text-lg text-ink-900">{{ t('mock.question') }}</p>
            <div class="mt-2.5 flex flex-col gap-2">
              <button
                type="button"
                class="min-h-10 rounded-lg bg-rose-600 px-3 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-rose-700 active:scale-[0.97]"
                @click="answer = 'yes'"
              >
                {{ t('mock.yes') }}
              </button>
              <button
                type="button"
                class="min-h-10 rounded-lg border border-line-strong bg-white px-3 text-sm font-semibold text-ink-700 transition-[background-color,transform] duration-150 hover:bg-cream-100 active:scale-[0.97]"
                @click="answer = 'no'"
              >
                {{ t('mock.no') }}
              </button>
            </div>
          </template>
          <p class="mt-3 text-[0.7rem] italic text-ink-500">{{ t('mock.footer') }}</p>
        </div>
      </div>
      <figcaption class="sr-only">{{ t('mock.demoLabel') }}</figcaption>
    </figure>

    <!-- WhatsApp reply arriving (decorative; the counter below is the live region) -->
    <div
      class="bubble absolute left-1 top-[34%] z-20 w-48 rounded-2xl rounded-bl-md bg-[#e7fbe3] px-3 py-2 text-left shadow-pop sm:left-4 sm:top-[36%] sm:w-52 lg:left-2"
      aria-hidden="true"
    >
      <p class="text-[0.7rem] font-semibold text-success-700">{{ t('mock.bubbleName') }}</p>
      <p class="text-[0.8rem] text-ink-900">{{ t('mock.bubbleText') }}</p>
    </div>

    <!-- Confirmed counter -->
    <div
      class="counter absolute -bottom-3 right-2 z-20 flex items-baseline gap-1.5 rounded-xl bg-white px-3.5 py-2 shadow-pop sm:bottom-6 sm:right-0 lg:-right-2"
      aria-live="polite"
    >
      <span class="font-heading text-2xl leading-none text-ink-900 tabular-nums">{{ count }}</span>
      <span class="text-xs text-ink-500">{{ t('mock.counterLabel', { total: TOTAL }) }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Printed-photo look */
.photo {
  padding: 6px 6px 14px;
  background: #fff;
  border-radius: 4px;
  box-shadow:
    0 2px 4px rgba(43, 36, 32, 0.06),
    0 16px 32px -14px rgba(43, 36, 32, 0.28);
}
.photo-family {
  transform: rotate(-5deg);
}
.photo-tiara {
  transform: rotate(4deg);
}

/* Entrance: everything rests visible; the sequence only plays once we are playing. */
.showcase.is-playing .phone {
  animation: rise 700ms cubic-bezier(0.23, 1, 0.32, 1) both;
}
.showcase.is-playing .photo-family {
  animation: rise-family 800ms cubic-bezier(0.23, 1, 0.32, 1) 120ms both;
}
.showcase.is-playing .photo-tiara {
  animation: rise-tiara 800ms cubic-bezier(0.23, 1, 0.32, 1) 220ms both;
}
.showcase.is-playing .ribbon {
  animation: fade 900ms ease-out 300ms both;
}
.showcase.is-playing .bubble {
  animation: pop 450ms cubic-bezier(0.23, 1, 0.32, 1) 1100ms both;
  transform-origin: bottom left;
}
.showcase.is-playing .counter {
  animation: pop 450ms cubic-bezier(0.23, 1, 0.32, 1) 600ms both;
  transform-origin: bottom right;
}
/* Before the sequence starts the arriving reply stays hidden; everything else is visible. */
.showcase:not(.is-playing) .bubble {
  opacity: 0;
}
/* Final state, no animation (reduced motion or already played). */
.showcase.is-settled .phone,
.showcase.is-settled .photo-family,
.showcase.is-settled .photo-tiara,
.showcase.is-settled .ribbon,
.showcase.is-settled .bubble,
.showcase.is-settled .counter {
  animation: none;
  opacity: 1;
}
.showcase.is-settled .photo-family {
  transform: rotate(-5deg);
}
.showcase.is-settled .photo-tiara {
  transform: rotate(4deg);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes rise-family {
  from {
    opacity: 0;
    transform: translateY(18px) rotate(-5deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(-5deg);
  }
}
@keyframes rise-tiara {
  from {
    opacity: 0;
    transform: translateY(18px) rotate(4deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(4deg);
  }
}
@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
