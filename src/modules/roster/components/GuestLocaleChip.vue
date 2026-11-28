<script setup>
import { useI18n } from 'vue-i18n'

/** "EN" / "ES" next to the name when the guest has her own invitation language; nothing when she follows the event. */
defineProps({ family: { type: Object, required: true } })
const { t } = useI18n()
</script>

<template>
  <span
    v-if="family.locale"
    class="inline-flex shrink-0 items-center rounded-full bg-cream-200 px-2 py-0.5 text-xs font-semibold text-ink-700"
    :title="t(`app.roster.locale.chip.${family.locale}`)"
    data-testid="locale-chip"
  >
    <span aria-hidden="true">{{ family.locale.toUpperCase() }}</span>
    <span class="sr-only">{{ t(`app.roster.locale.chip.${family.locale}`) }}</span>
  </span>
</template>
