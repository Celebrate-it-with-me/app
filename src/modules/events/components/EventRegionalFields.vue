<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiField, UiInput, UiSelect } from '@/ui'
import { EVENT_LOCALES, EVENT_CURRENCIES, timezoneOptions } from '../utils/eventForm'

const props = defineProps({
  locale: { type: String, default: 'es' },
  currency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'America/New_York' },
  disabled: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:locale', 'update:currency', 'update:timezone'])

const { t, locale: uiLocale } = useI18n()

const localeOptions = computed(() => EVENT_LOCALES.map(value => ({ value, label: t(`events.regional.locales.${value}`) })))
const currencyOptions = computed(() => {
  let names = null
  try {
    names = new Intl.DisplayNames([uiLocale.value], { type: 'currency' })
  } catch {
    names = null
  }
  return EVENT_CURRENCIES.map(value => ({ value, label: `${value} · ${names?.of(value) ?? value}` }))
})

const search = ref('')
const zoneOptions = computed(() => timezoneOptions(props.timezone, search.value))
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-5 sm:grid-cols-2">
      <UiField :label="t('events.regional.locale')" :hint="t('events.regional.localeHint')" :error="errors.locale" id="event_locale">
        <UiSelect :model-value="locale" :options="localeOptions" :disabled="disabled" @update:model-value="value => emit('update:locale', value)" />
      </UiField>
      <UiField :label="t('events.regional.currency')" :hint="t('events.regional.currencyHint')" :error="errors.currency" id="event_currency">
        <UiSelect :model-value="currency" :options="currencyOptions" :disabled="disabled" @update:model-value="value => emit('update:currency', value)" />
      </UiField>
    </div>

    <UiField :label="t('events.regional.timezone')" :hint="t('events.regional.timezoneHint')" :error="errors.timezone" id="event_timezone">
      <div class="flex flex-col gap-2">
        <UiInput
          v-model="search"
          type="search"
          :disabled="disabled"
          id="event_timezone_search"
          :placeholder="t('events.regional.timezoneSearch')"
          :aria-label="t('events.regional.timezoneSearch')"
          autocomplete="off"
        />
        <UiSelect
          :model-value="timezone"
          :options="zoneOptions"
          :disabled="disabled"
          :placeholder="t('events.regional.timezoneEmpty')"
          @update:model-value="value => emit('update:timezone', value)"
        />
        <p v-if="search && zoneOptions.length <= 1 && zoneOptions[0]?.value === timezone" class="text-sm text-ink-500">{{ t('events.regional.timezoneNoMatch') }}</p>
      </div>
    </UiField>
  </div>
</template>
