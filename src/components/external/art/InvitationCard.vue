<script setup>
/**
 * A miniature invitation in one of the product's design worlds. CSS and SVG only.
 * `theme`: clasica | jardin | noche
 */
defineProps({
  theme: { type: String, default: 'clasica' },
  name: { type: String, default: 'Valentina' },
  date: { type: String, default: '14 · 06' },
  place: { type: String, default: 'Salón Cristal · Miami' },
  question: { type: String, default: '¿Nos acompañas?' },
  yes: { type: String, default: 'Confirmo' }
})

const THEMES = {
  clasica: {
    card: 'bg-cream-50 text-ink-900',
    eyebrow: 'text-rose-600',
    rule: 'bg-gold-500',
    meta: 'text-ink-500',
    frame: 'border-gold-300',
    button: 'bg-rose-600 text-white'
  },
  jardin: {
    card: 'bg-garden-50 text-garden-800',
    eyebrow: 'text-garden-bronze',
    rule: 'bg-garden-400',
    meta: 'text-garden-600',
    frame: 'border-garden-300',
    button: 'bg-garden-500 text-white'
  },
  noche: {
    card: 'bg-night-950 text-gold-100',
    eyebrow: 'text-gold-300',
    rule: 'bg-gold-300',
    meta: 'text-night-100',
    frame: 'border-night-700',
    button: 'bg-gold-300 text-night-950'
  }
}
</script>

<template>
  <div
    class="relative aspect-[4/5] w-full overflow-hidden rounded-xl border p-5 shadow-card"
    :class="[THEMES[theme].card, THEMES[theme].frame]"
    aria-hidden="true"
  >
    <!-- Corner ornaments per world -->
    <svg v-if="theme === 'jardin'" class="absolute -left-4 -top-4 h-28 w-28 opacity-80" viewBox="0 0 100 100" fill="none">
      <path d="M10 90 C 20 50, 50 20, 90 10" class="stroke-garden-400" stroke-width="1.5" />
      <ellipse cx="34" cy="52" rx="9" ry="4" transform="rotate(-45 34 52)" class="fill-garden-200" />
      <ellipse cx="52" cy="34" rx="9" ry="4" transform="rotate(-45 52 34)" class="fill-garden-200" />
      <circle cx="26" cy="70" r="6" class="fill-rose-300" />
      <circle cx="70" cy="26" r="6" class="fill-rose-300" />
      <circle cx="26" cy="70" r="2.5" class="fill-rose-100" />
      <circle cx="70" cy="26" r="2.5" class="fill-rose-100" />
    </svg>
    <svg v-else-if="theme === 'noche'" class="absolute inset-0 h-full w-full fill-gold-300" viewBox="0 0 100 133">
      <circle cx="12" cy="18" r="0.9" /><circle cx="30" cy="8" r="0.6" /><circle cx="52" cy="14" r="0.8" />
      <circle cx="80" cy="10" r="0.6" /><circle cx="90" cy="30" r="0.9" /><circle cx="8" cy="60" r="0.6" />
      <circle cx="92" cy="70" r="0.7" /><circle cx="20" cy="110" r="0.8" /><circle cx="70" cy="120" r="0.6" />
      <circle cx="46" cy="126" r="0.9" />
    </svg>
    <svg v-else class="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]" viewBox="0 0 100 133" fill="none" preserveAspectRatio="none">
      <rect x="1" y="1" width="98" height="131" class="stroke-gold-300" stroke-width="0.8" />
    </svg>

    <div class="relative flex h-full flex-col items-center justify-center text-center">
      <p class="text-[0.6rem] font-semibold uppercase tracking-[0.3em]" :class="THEMES[theme].eyebrow">Mis XV</p>
      <p class="mt-2 font-heading text-3xl leading-none sm:text-4xl">{{ name }}</p>
      <span class="mt-3 h-px w-10" :class="THEMES[theme].rule" />
      <p class="mt-3 font-heading text-lg tabular-nums" :class="THEMES[theme].meta">{{ date }}</p>
      <p class="mt-1 text-xs" :class="THEMES[theme].meta">{{ place }}</p>
      <p class="mt-5 font-heading text-base">{{ question }}</p>
      <span class="mt-2 rounded-md px-5 py-1.5 text-xs font-semibold" :class="THEMES[theme].button">{{ yes }}</span>
    </div>
  </div>
</template>
