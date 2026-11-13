<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { UiPageHeader, UiCard, UiField, UiInput, UiRadioGroup, UiButton, useToast } from '@/ui'
import { useEventsStore } from '../stores/useEventsStore'
import { slugify, inputToApi, SLUG_PATTERN, fieldErrors } from '../utils/eventForm'
import EventAddressField from '../components/EventAddressField.vue'
import { cleanType, readPendingType, clearPendingType } from '@/modules/onboarding/utils/pendingType'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()

const form = ref({ eventType: '', eventName: '', startDate: '', customUrlSlug: '' })
const slugTouched = ref(false)
const errors = ref({})
const saving = ref(false)

onMounted(async () => {
  if (!eventsStore.eventTypes.length) await eventsStore.loadEventsPlansAndType()
  // ?type=quinceanera|wedding wins; else the one chosen on the landing before signing up.
  const wantedSlug = cleanType(route.query.type) ?? readPendingType()
  const wanted = eventsStore.eventTypes.find(type => type.slug === wantedSlug)
  if (wanted) form.value.eventType = wanted.id
})

const typeOptions = computed(() =>
  eventsStore.eventTypes.map(type => ({ value: type.id, label: t(`events.types.${type.slug}`, type.name) }))
)
const selectedSlug = computed(() => eventsStore.eventTypes.find(type => type.id === form.value.eventType)?.slug ?? 'none')
const namePlaceholder = computed(() => t(`events.create.namePlaceholder.${selectedSlug.value}`))

// A message goes away as soon as its field is touched.
for (const field of ['eventType', 'eventName', 'startDate', 'customUrlSlug']) {
  watch(
    () => form.value[field],
    () => {
      if (errors.value[field]) errors.value = { ...errors.value, [field]: undefined }
    }
  )
}

// The address follows the name until the organizer edits it by hand.
watch(
  () => form.value.eventName,
  name => {
    if (!slugTouched.value) form.value.customUrlSlug = slugify(name)
  }
)
function onSlugInput(value) {
  slugTouched.value = true
  form.value.customUrlSlug = value
}

function validate() {
  const next = {}
  if (!form.value.eventType) next.eventType = t('events.create.typeRequired')
  if (!form.value.eventName.trim()) next.eventName = t('events.create.nameRequired')
  if (!form.value.startDate) next.startDate = t('events.create.dateRequired')
  if (form.value.customUrlSlug && !SLUG_PATTERN.test(form.value.customUrlSlug)) next.customUrlSlug = t('events.address.invalid')
  errors.value = next
  return Object.keys(next).length === 0
}

async function submit() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      eventName: form.value.eventName.trim(),
      eventType: form.value.eventType,
      startDate: inputToApi(form.value.startDate)
    }
    // The address shown follows the name as a suggestion. Only one typed by hand is sent: otherwise the
    // server builds a free one from the name (adding -2, -3... if it is taken) instead of rejecting it.
    if (slugTouched.value && form.value.customUrlSlug) payload.customUrlSlug = form.value.customUrlSlug
    await eventsStore.createEvent(payload)
    clearPendingType()
    success(t('events.create.created'))
    await router.push('/dashboard/start')
  } catch (e) {
    const server = fieldErrors(e)
    if (server.customUrlSlug) errors.value = { customUrlSlug: t('events.address.taken') }
    else if (server.eventName || server.startDate || server.eventType) {
      errors.value = {
        ...(server.eventType && { eventType: t('events.create.typeRequired') }),
        ...(server.eventName && { eventName: t('events.create.nameRequired') }),
        ...(server.startDate && { startDate: t('events.create.dateRequired') })
      }
    } else showError(t('common.genericError'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl">
    <UiPageHeader :title="t('events.create.title')" :subtitle="t('events.create.subtitle')" back="/dashboard/events" :back-label="t('events.edit.back')" />

    <UiCard>
      <form class="flex flex-col gap-6" novalidate @submit.prevent="submit">
        <UiField :label="t('events.create.type')" :error="errors.eventType" id="event_type" required>
          <UiRadioGroup v-model="form.eventType" :options="typeOptions" orientation="horizontal" cards />
        </UiField>

        <UiField :label="t('events.create.name')" :error="errors.eventName" id="event_name" required>
          <UiInput v-model="form.eventName" :placeholder="namePlaceholder" autocomplete="off" />
        </UiField>

        <UiField :label="t('events.create.date')" :error="errors.startDate" id="event_start" required>
          <UiInput v-model="form.startDate" type="datetime-local" />
        </UiField>

        <EventAddressField :model-value="form.customUrlSlug" :error="errors.customUrlSlug" @update:model-value="onSlugInput" />

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <UiButton variant="ghost" to="/dashboard/events">{{ t('events.create.cancel') }}</UiButton>
          <UiButton type="submit" :loading="saving">{{ t('events.create.submit') }}</UiButton>
        </div>
      </form>
    </UiCard>
  </div>
</template>
