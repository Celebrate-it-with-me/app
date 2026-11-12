<script setup>
import { LOCALES } from '@/locales/i18n'

defineProps({
  current: { type: String, required: true },
  label: { type: String, required: true }
})
defineEmits(['change'])
</script>

<template>
  <div role="group" :aria-label="label" class="flex rounded-full bg-inv-surface/80 p-0.5 text-sm ring-1 ring-inv-ink/10 backdrop-blur">
    <button
      v-for="lang in LOCALES"
      :key="lang"
      type="button"
      :aria-pressed="lang === current"
      :class="[
        'min-h-9 min-w-11 rounded-full px-3 font-semibold uppercase transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-inv-primary',
        lang === current ? 'bg-inv-primary text-inv-on-primary' : 'text-inv-ink-soft hover:text-inv-ink'
      ]"
      @click="$emit('change', lang)"
    >
      {{ lang }}
    </button>
  </div>
</template>
