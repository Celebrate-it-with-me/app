<script setup>
import { LOCALES } from '@/locales/i18n'

defineProps({
  current: { type: String, required: true },
  label: { type: String, required: true },
  /** buttons (default) | dropdown */
  variant: { type: String, default: 'buttons' }
})
defineEmits(['change'])
</script>

<template>
  <select
    v-if="variant === 'dropdown'"
    :aria-label="label"
    :value="current"
    class="inv-lang inv-lang--dropdown min-h-11 rounded-full bg-inv-surface/80 px-3 text-sm font-semibold uppercase text-inv-ink ring-1 ring-inv-ink/10 focus-visible:outline-2 focus-visible:outline-inv-primary"
    @change="$emit('change', $event.target.value)"
  >
    <option v-for="lang in LOCALES" :key="lang" :value="lang">{{ lang }}</option>
  </select>
  <div v-else role="group" :aria-label="label" class="inv-lang flex rounded-full bg-inv-surface/80 p-0.5 text-sm ring-1 ring-inv-ink/10 backdrop-blur">
    <button
      v-for="lang in LOCALES"
      :key="lang"
      type="button"
      :aria-pressed="lang === current"
      :class="[
        'min-h-11 min-w-11 rounded-full px-3 font-semibold uppercase transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-inv-primary',
        lang === current ? 'bg-inv-primary text-inv-on-primary' : 'text-inv-ink-soft hover:text-inv-ink'
      ]"
      @click="$emit('change', lang)"
    >
      {{ lang }}
    </button>
  </div>
</template>
