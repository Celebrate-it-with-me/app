<template>
  <CHeading :level="2" weight="semibold">User Preferences</CHeading>
  <Form
    :validation-schema="preferencesSchema"
    @submit="savePreferences"
    @invalid-submit="onInvalidSubmit"
  >
    <div class="mx-auto py-10 space-y-10">
      <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CSelect
            id="language"
            label="Language"
            name="language"
            show-error
            :options="[
            { label: 'Español', value: 'es' },
            { label: 'English', value: 'en' }
          ]"
            v-model="preferences.language"
          />

          <CSelect
            id="timezone"
            label="Timezone"
            name="timezone"
            show-error
            :options="timezonesOptions"
            v-model="preferences.timezone"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CSelect
            id="date_format"
            label="Date Format"
            name="dateFormat"
            show-error
            :options="[
            { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
            { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' }
          ]"
            v-model="preferences.dateFormat"
          />

          <CSelect
            id="visual_theme"
            label="Visual Theme"
            name="visualTheme"
            show-error
            :options="[
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
            { label: 'System Default', value: 'system' }
          ]"
            v-model="preferences.visualTheme"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
          <CToggle
            label="Receive email notifications"
            name="notifyByEmail"
            v-model="preferences.notifyByEmail"

          />

          <CToggle
            label="Receive SMS notifications"
            name="notifyBySms"
            v-model="preferences.notifyBySms"
          />

          <CToggle
            label="Get smart tips from AI assistant"
            name="smartTips"
            v-model="preferences.smartTips"
          />
        </div>

        <div class="pt-6 flex justify-end">
          <CButton
            :loading="saving"
            type="submit"
            :class="{
              'opacity-50 cursor-not-allowed': !isModified || saving
            }"
            :disabled="!isModified || saving"
          >
            Save Preferences
          </CButton>
        </div>
      </section>
    </div>
  </Form>
</template>

<script setup>
import CSelect from '@/components/UI/form2/CSelect.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import timezones from '@/data/timezones.json'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { Form } from 'vee-validate'

const userStore = useUserStore()
const notifications = useNotificationStore()
const saving = ref(false)

const preferences = reactive({
  language: '',
  timezone: '',
  visualTheme: '',
  dateFormat: '',
  notifyByEmail: false,
  notifyBySms: false,
  smartTips: false,
})

const originalPreferences = reactive({
  language: '',
  timezone: '',
  visualTheme: '',
  dateFormat: '',
  notifyByEmail: false,
  notifyBySms: false,
  smartTips: false,
})

const preferencesSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      language: zod.string().min(1, 'Language is required.'),
      timezone: zod.string().min(1, 'Timezone is required.'),
      dateFormat: zod.string().min(1, 'Date is required'),
      visualTheme: zod.string().min(1, 'Visual theme is required.'),
      notifyByEmail: zod.boolean().default(false),
      notifyBySms: zod.boolean().default(false),
      smartTips: zod.boolean().default(false),
    })
  )
})

const timezonesOptions = computed(() => {
  return timezones.map((tz) => ({
    label: tz.label,
    value: `${tz.value}-${tz.label}`,
  }))
})

const isModified = computed(() => {
  return (
    preferences.language !== originalPreferences.language ||
    preferences.timezone !== originalPreferences.timezone ||
    preferences.visualTheme !== originalPreferences.visualTheme ||
    preferences.dateFormat !== originalPreferences.dateFormat ||
    preferences.notifyByEmail !== originalPreferences.notifyByEmail ||
    preferences.notifyBySms !== originalPreferences.notifyBySms ||
    preferences.smartTips !== originalPreferences.smartTips
  )
})

onMounted(() => {
  preferences.language = originalPreferences.language = userStore.preferences.language ?? ''
  preferences.timezone = originalPreferences.timezone = userStore.preferences.timezone ?? ''
  preferences.visualTheme = originalPreferences.visualTheme = userStore.preferences.visualTheme ?? ''
  preferences.dateFormat = originalPreferences.dateFormat = userStore.preferences.dateFormat ?? ''
  preferences.notifyByEmail = originalPreferences.notifyByEmail = userStore.preferences.notifyByEmail ?? false
  preferences.notifyBySms = originalPreferences.notifyBySms = userStore.preferences.notifyBySms ?? false
  preferences.smartTips = originalPreferences.smartTips = userStore.preferences.smartTips ?? false
})


const savePreferences = async () => {
  try {
    saving.value = true

    const response = await userStore.updatePreferences(preferences)

    if (response && response.status === 200) {

      userStore.setPreferences(response?.data?.data ?? {})
      notifications.addNotification({
        type: 'success',
        message: 'Preferences saved successfully.',
      })

      originalPreferences.language = preferences.language
      originalPreferences.timezone = preferences.timezone
      originalPreferences.visualTheme = preferences.visualTheme
      originalPreferences.dateFormat = preferences.dateFormat
      originalPreferences.notifyByEmail = preferences.notifyByEmail
      originalPreferences.notifyBySms = preferences.notifyBySms
      originalPreferences.smartTips = preferences.smartTips
    } else {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to save preferences. Please try again.',
      })
    }
  } catch (e) {
    console.error(e)
    notifications.addNotification({
      type: 'error',
      message: 'Error saving preferences. Please try again.',
    })
  } finally {
    saving.value = false
  }
}

const onInvalidSubmit = (errors) => {
  console.error('Form validation errors:', errors)
  notifications.addNotification({
    type: 'error',
    message: 'Please fix the errors in the form.',
  })
}
</script>
