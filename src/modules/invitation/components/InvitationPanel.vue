<script setup>
/** Stationery panel: paper surface, soft offset shadow and a thin gold frame set inside it. `flat` drops the shadow and the inner frame. */
defineProps({
  /** card | flat */
  variant: { type: String, default: 'card' }
})
</script>

<template>
  <div
    :class="['inv-panel relative rounded-[1.75rem] bg-inv-surface p-7 text-left ring-1 ring-inv-ink/10 sm:p-9', variant === 'flat' ? '' : 'shadow-card']"
    :data-variant="variant"
  >
    <span v-if="variant !== 'flat'" aria-hidden="true" class="pointer-events-none absolute inset-2 rounded-[1.3rem] border border-inv-accent/35" />
    <div class="relative"><slot /></div>
  </div>
</template>
