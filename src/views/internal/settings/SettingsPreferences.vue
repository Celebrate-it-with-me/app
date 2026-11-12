<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import timezones from '@/data/timezones.json'
import { LOCALES, setLocale } from '@/locales/i18n'
import { useUserStore } from '@/stores/useUserStore'
import { UiCard, UiField, UiSelect, UiSwitch, UiButton, useToast } from '@/ui'

const { t, locale } = useI18n()
const { success, error } = useToast()
const userStore = useUserStore()
const saving = ref(false)

const form = ref({ language: 'es', timezone: '', notifyByEmail: true })
const saved = ref('')

const languageOptions = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' }
]

// The data file repeats a zone once per UTC offset (daylight saving); the zone name is what we store.
const timezoneOptions = computed(() =>
  [...new Set(timezones.map(tz => tz.label))]
    .sort((a, b) => a.localeCompare(b))
    .map(zone => ({ value: zone, label: zone.replace(/^America\//, '').replaceAll('_', ' ') }))
)

function defaultTimezone() {
  const guess = Intl.DateTimeFormat().resolvedOptions().timeZone
  return timezoneOptions.value.some(o => o.value === guess) ? guess : 'America/New_York'
}

const snapshot = () => JSON.stringify(form.value)
const dirty = computed(() => snapshot() !== saved.value)

onMounted(() => {
  const p = userStore.preferences ?? {}
  form.value = {
    language: LOCALES.includes(p.language) ? p.language : locale.value,
    timezone: timezoneOptions.value.some(o => o.value === p.timezone) ? p.timezone : defaultTimezone(),
    notifyByEmail: p.notifyByEmail ?? true
  }
  saved.value = snapshot()
})

async function save() {
  saving.value = true
  try {
    // Settings we no longer show (theme, SMS, tips) keep their stored value.
    const response = await userStore.updatePreferences({ ...userStore.preferences, ...form.value })
    if (response?.status === 200) {
      userStore.setPreferences(response.data?.data ?? form.value)
      setLocale(form.value.language)
      saved.value = snapshot()
      success(t('account.saved'))
    } else {
      error(t('account.saveError'))
    }
  } catch {
    error(t('account.saveError'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UiCard :title="t('account.preferences.title')" :subtitle="t('account.preferences.text')" heading-level="h2">
    <form class="flex flex-col gap-5" @submit.prevent="save">
      <UiField :label="t('account.preferences.language')" :hint="t('account.preferences.languageHint')" id="account_language">
        <UiSelect v-model="form.language" :options="languageOptions" />
      </UiField>

      <UiField :label="t('account.preferences.timezone')" id="account_timezone">
        <UiSelect v-model="form.timezone" :options="timezoneOptions" />
      </UiField>

      <UiSwitch
        v-model="form.notifyByEmail"
        :label="t('account.preferences.emailNotifications')"
        :description="t('account.preferences.emailNotificationsText')"
      />

      <UiButton type="submit" :loading="saving" :disabled="!dirty" class="w-full sm:w-auto sm:self-end">
        {{ t('account.save') }}
      </UiButton>
    </form>
  </UiCard>
</template>
