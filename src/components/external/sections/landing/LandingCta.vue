<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'
import { useReveal } from '@/composables/useReveal'
import portrait480 from '@/assets/images/brand/quince-garden-portrait-800.webp'

/**
 * Closing call to action: the gesture of inviting. Deep wine surface, ivory type,
 * and an open cream envelope with the sample invitation rising out of it.
 * The envelope is decorative (aria-hidden); the copy is real HTML.
 */
const { t } = useI18n()
const { root } = useReveal({ threshold: 0.3 })
</script>

<template>
  <section ref="root" class="px-4 pb-16 sm:px-6 sm:pb-24">
    <div
      class="mx-auto grid max-w-6xl items-center gap-4 overflow-hidden rounded-3xl bg-wine-900 px-6 py-12 text-cream-100 sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:px-16 lg:py-20"
    >
      <div class="text-center lg:text-left">
        <h2
          class="font-heading text-[2.2rem] leading-[1.08] text-cream-50 sm:text-5xl text-balance"
        >
          {{ t('cta.title') }}
        </h2>
        <p class="mx-auto mt-5 max-w-lg text-lg text-cream-300 lg:mx-0 text-balance">
          {{ t('cta.text') }}
        </p>
        <div class="mt-8 flex flex-col items-center gap-3 lg:items-start">
          <UiButton variant="ivory" size="lg" to="/sign-up" class="w-full sm:w-auto">{{
            t('cta.button')
          }}</UiButton>
          <p class="text-sm text-cream-300/80">{{ t('cta.note') }}</p>
        </div>
      </div>

      <!-- The envelope: a cream paper envelope, flap open, the invitation card rising out. -->
      <div
        class="mx-auto w-full max-w-[19rem] sm:max-w-[22rem] lg:max-w-[24rem]"
        aria-hidden="true"
      >
        <!-- Padding in % resolves against this box's own width: room for the flap and the card above the envelope. -->
        <div class="envelope-stage w-full pt-[54%]">
          <div class="envelope relative aspect-[4/3] w-full" data-reveal :style="{ '--i': 0 }">
            <!-- back of the envelope -->
            <div class="env-back absolute inset-0 rounded-[6px] bg-[#f3e9dc]" />
            <!-- open flap, folded back -->
            <div class="env-flap absolute inset-x-0 top-0 h-[72%] origin-top bg-[#ebdfcf]" />
            <!-- the card -->
            <div
              class="card absolute inset-x-[16%] bottom-[30%] top-[-60%] overflow-hidden rounded-[6px] bg-cream-50 text-ink-900"
              data-reveal
              :style="{ '--i': 1 }"
            >
              <div class="relative h-[56%] w-full overflow-hidden">
                <img
                  :src="portrait480"
                  width="533"
                  height="800"
                  loading="lazy"
                  decoding="async"
                  alt=""
                  class="absolute inset-0 h-full w-full object-cover object-[50%_14%]"
                />
                <div
                  class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cream-50 to-transparent"
                />
              </div>
              <div class="px-4 pb-4 text-center">
                <p class="text-[0.55rem] font-semibold uppercase tracking-[0.32em] text-rose-600">
                  {{ t('mock.eyebrow') }}
                </p>
                <p class="font-heading text-[1.75rem] leading-none text-ink-900">
                  {{ t('mock.name') }}
                </p>
                <span class="mx-auto mt-2 block h-px w-10 bg-gold-500" />
              </div>
            </div>
            <!-- front pocket: two side folds and the bottom fold -->
            <div class="env-pocket absolute inset-0 rounded-[6px]" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Paper: a faint linen texture via two crossed hairline gradients. */
.env-back,
.env-flap,
.env-pocket {
  background-image:
    repeating-linear-gradient(0deg, rgba(43, 36, 32, 0.025) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(90deg, rgba(43, 36, 32, 0.02) 0 1px, transparent 1px 3px);
}
.env-back {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.12),
    0 28px 48px -22px rgba(0, 0, 0, 0.55);
}
.env-flap {
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform: scaleY(-1);
  transform-origin: top;
  background-color: #ebdfcf;
  filter: drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.08));
}
.env-pocket {
  background-color: #f6ede1;
  clip-path: polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
/* crease lines on the pocket */
.env-pocket::before,
.env-pocket::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.env-pocket::before {
  background: linear-gradient(
    to bottom right,
    transparent 49.6%,
    rgba(43, 36, 32, 0.09) 50%,
    transparent 50.4%
  );
  clip-path: polygon(0 0, 50% 52%, 0 52%);
}
.env-pocket::after {
  background: linear-gradient(
    to bottom left,
    transparent 49.6%,
    rgba(43, 36, 32, 0.09) 50%,
    transparent 50.4%
  );
  clip-path: polygon(100% 0, 50% 52%, 100% 52%);
}
.card {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.08),
    0 18px 30px -18px rgba(0, 0, 0, 0.5);
}
</style>
