<script setup>
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSelect } from '@/ui'
import { effectiveLocale } from '../utils/roster'

const props = defineProps({
  family: { type: Object, required: true },
  /** The event's own language, used by guests with none of their own. */
  eventLocale: { type: String, default: 'es' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['change'])
const { t } = useI18n()
const id = useId()

/** The select has no null option value, so "the event's" is the string 'event'. */
const model = computed(() => props.family.locale || 'event')
const options = computed(() => [
  { value: 'event', label: t('app.roster.locale.event', { lang: t(`app.roster.locale.${props.eventLocale}`) }) },
  { value: 'es', label: t('app.roster.locale.es') },
  { value: 'en', label: t('app.roster.locale.en') }
])

function onChange(value) {
  const next = value === 'event' ? null : value
  if (next !== (props.family.locale ?? null)) emit('change', next)
}
</script>

<template>
  <div class="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
    <label :for="id" class="text-xs font-medium text-ink-500">{{ t('app.roster.locale.label') }}</label>
    <div class="sm:w-56" :data-effective="effectiveLocale(family, eventLocale)">
      <UiSelect :id="id" :model-value="model" :options="options" size="sm" :disabled="disabled" @update:model-value="onChange" />
    </div>
  </div>
</template>
