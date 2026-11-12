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
    card: 'bg-[#fdfbf8] text-ink-900',
    eyebrow: 'text-rose-600',
    rule: 'bg-gold-500',
    meta: 'text-ink-500',
    frame: 'border-gold-300',
    button: 'bg-rose-600 text-white'
  },
  jardin: {
    card: 'bg-[#f3f7ee] text-[#2f3d2a]',
    eyebrow: 'text-[#8a6a3a]',
    rule: 'bg-[#8fae7b]',
    meta: 'text-[#5f6d58]',
    frame: 'border-[#cfdcc3]',
    button: 'bg-[#6f8f5c] text-white'
  },
  noche: {
    card: 'bg-[#1d1a2b] text-[#f6ecd4]',
    eyebrow: 'text-[#e6cf93]',
    rule: 'bg-[#e6cf93]',
    meta: 'text-[#c9bfa6]',
    frame: 'border-[#4a4360]',
    button: 'bg-[#e6cf93] text-[#1d1a2b]'
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
      <path d="M10 90 C 20 50, 50 20, 90 10" stroke="#8fae7b" stroke-width="1.5" />
      <ellipse cx="34" cy="52" rx="9" ry="4" transform="rotate(-45 34 52)" fill="#b7c9a7" />
      <ellipse cx="52" cy="34" rx="9" ry="4" transform="rotate(-45 52 34)" fill="#b7c9a7" />
      <circle cx="26" cy="70" r="6" fill="#e3a1b1" />
      <circle cx="70" cy="26" r="6" fill="#e3a1b1" />
      <circle cx="26" cy="70" r="2.5" fill="#f8e3e8" />
      <circle cx="70" cy="26" r="2.5" fill="#f8e3e8" />
    </svg>
    <svg v-else-if="theme === 'noche'" class="absolute inset-0 h-full w-full" viewBox="0 0 100 133" fill="#e6cf93">
      <circle cx="12" cy="18" r="0.9" /><circle cx="30" cy="8" r="0.6" /><circle cx="52" cy="14" r="0.8" />
      <circle cx="80" cy="10" r="0.6" /><circle cx="90" cy="30" r="0.9" /><circle cx="8" cy="60" r="0.6" />
      <circle cx="92" cy="70" r="0.7" /><circle cx="20" cy="110" r="0.8" /><circle cx="70" cy="120" r="0.6" />
      <circle cx="46" cy="126" r="0.9" />
    </svg>
    <svg v-else class="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]" viewBox="0 0 100 133" fill="none" preserveAspectRatio="none">
      <rect x="1" y="1" width="98" height="131" stroke="#e6cf93" stroke-width="0.8" />
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
