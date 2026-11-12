<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { SearchX } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiField, UiInput, UiTextarea, UiButton, UiModal, UiSkeleton, UiEmptyState, useToast } from '@/ui'
import { useEventsStore } from '../stores/useEventsStore'
import { formFromEvent, buildPatch, SLUG_PATTERN, fieldErrors } from '../utils/eventForm'
import { guestOverflow, planLimitFrom } from '@/utils/planLimit'
import GuestLimitNotice from '@/components/internal/limits/GuestLimitNotice.vue'
import EventAddressField from '../components/EventAddressField.vue'
import EventStatusBadge from '../components/EventStatusBadge.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()

const eventId = computed(() => route.params.id)
const event = computed(() => eventsStore.events.find(e => String(e.id) === String(eventId.value)) ?? null)

const loading = ref(true)
const notFound = ref(false)
const form = ref(formFromEvent(null))
const original = ref(formFromEvent(null))
const errors = ref({})
const saving = ref(false)

// Only owners and editors change things; a viewer reads.
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))
const isOwner = computed(() => event.value?.userRole === 'owner')
const slugLocked = computed(() => !!event.value?.slugLocked)
const typeLabel = computed(() => {
  const slug = eventsStore.eventTypes.find(type => type.id === event.value?.eventType)?.slug
  return slug ? t(`events.types.${slug}`) : ''
})

function resetForm() {
  original.value = formFromEvent(event.value)
  form.value = { ...original.value }
  errors.value = {}
}

async function load() {
  loading.value = true
  notFound.value = false
  try {
    if (!event.value) await eventsStore.fetchEvent(eventId.value)
    if (!eventsStore.eventTypes.length) await eventsStore.loadEventsPlansAndType()
    if (event.value) {
      resetForm()
      // The guest count it was loaded with can be old: refresh it quietly for the limit.
      eventsStore.fetchEvent(eventId.value).catch(() => {})
    } else notFound.value = true
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(eventId, load)

// A message goes away as soon as its field is touched.
for (const field of ['eventName', 'startDate', 'endDate', 'customUrlSlug']) {
  watch(
    () => form.value[field],
    () => {
      if (errors.value[field]) errors.value = { ...errors.value, [field]: undefined }
    }
  )
}

const patch = computed(() => buildPatch(original.value, form.value, { slugLocked: slugLocked.value }))
const dirty = computed(() => Object.keys(patch.value).length > 0)

function validate() {
  const next = {}
  if (!form.value.eventName.trim()) next.eventName = t('events.create.nameRequired')
  if (!form.value.startDate) next.startDate = t('events.create.dateRequired')
  if (form.value.endDate && form.value.startDate && form.value.endDate < form.value.startDate) next.endDate = t('events.edit.endBeforeStart')
  if (!slugLocked.value && !SLUG_PATTERN.test(form.value.customUrlSlug)) next.customUrlSlug = t('events.address.invalid')
  errors.value = next
  return Object.keys(next).length === 0
}

function showServerError(e, fallbackKey = 'common.genericError') {
  if (e.response?.status === 403) return showError(t('events.edit.forbidden'))
  showError(t(fallbackKey))
}

async function save() {
  if (!validate() || !dirty.value) return
  saving.value = true
  try {
    await eventsStore.saveEventDetails(event.value.id, patch.value)
    resetForm()
    success(t('events.edit.saved'))
  } catch (e) {
    const server = fieldErrors(e)
    if (server.customUrlSlug) errors.value = { customUrlSlug: t('events.address.taken') }
    else if (server.endDate) errors.value = { endDate: t('events.edit.endBeforeStart') }
    else if (server.eventName) errors.value = { eventName: t('events.create.nameRequired') }
    else if (server.startDate) errors.value = { startDate: t('events.create.dateRequired') }
    else showServerError(e)
  } finally {
    saving.value = false
  }
}

// ── Publication ──────────────────────────────────────────────
const pending = ref(null) // the action waiting for confirmation
// Over the plan's guest limit: from the event's own numbers, or from the API's answer to a publish attempt.
const limitInfo = ref(null)
const overflow = computed(() => limitInfo.value ?? guestOverflow(event.value))
const acting = ref(false)

const actions = computed(() => {
  switch (event.value?.status) {
    case 'draft':
      return [{ key: 'publish', variant: 'primary' }, { key: 'archive', variant: 'secondary' }]
    case 'published':
      return [{ key: 'unpublish', variant: 'secondary' }, { key: 'archive', variant: 'secondary' }]
    case 'archived':
      return [{ key: 'restore', variant: 'primary' }]
    default:
      return []
  }
})

// Restoring is harmless, so it needs no confirmation; the others ask first.
function askAction(key) {
  if (key === 'restore') runAction('restore')
  else pending.value = key
}

async function runAction(action) {
  acting.value = true
  try {
    await eventsStore.runEventAction(event.value.id, action)
    resetForm()
    limitInfo.value = null
    success(t(`events.publication.done.${action}`))
    pending.value = null
  } catch (e) {
    pending.value = null
    const limit = planLimitFrom(e)
    if (limit) {
      limitInfo.value = limit
      return
    }
    const server = fieldErrors(e)
    if (server.eventName || server.startDate || server.eventType) showError(t('events.publication.missing'))
    else showServerError(e)
  } finally {
    acting.value = false
  }
}

// ── Delete ───────────────────────────────────────────────────
const deleting = ref(false)
const deleteOpen = ref(false)
const typedName = ref('')
const canDelete = computed(() => typedName.value.trim() === (event.value?.eventName ?? '').trim() && typedName.value.trim() !== '')

function askDelete() {
  typedName.value = ''
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!canDelete.value) return
  deleting.value = true
  try {
    await eventsStore.deleteEvent(event.value.id)
    deleteOpen.value = false
    success(t('events.danger.deleted'))
    await router.push('/dashboard/events')
  } catch (e) {
    showServerError(e)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl">
    <div v-if="loading" class="flex flex-col gap-4" aria-busy="true">
      <UiSkeleton height="3rem" width="60%" />
      <UiSkeleton height="22rem" />
    </div>

    <UiEmptyState v-else-if="notFound" :title="t('events.edit.notFoundTitle')" :description="t('events.edit.notFoundText')">
      <template #icon><SearchX class="h-6 w-6" /></template>
      <UiButton to="/dashboard/events">{{ t('events.edit.back') }}</UiButton>
    </UiEmptyState>

    <template v-else-if="event">
      <UiPageHeader :title="t('events.edit.title')" :subtitle="event.eventName" back="/dashboard/events" :back-label="t('events.edit.back')" />

      <UiCard>
        <form class="flex flex-col gap-5" novalidate @submit.prevent="save">
          <p v-if="typeLabel" class="text-sm text-ink-500">{{ t('events.edit.type') }}: <span class="font-medium text-ink-700">{{ typeLabel }}</span></p>

          <UiField :label="t('events.edit.name')" :error="errors.eventName" id="event_name" required>
            <UiInput v-model="form.eventName" :disabled="!canEdit" autocomplete="off" />
          </UiField>

          <UiField :label="t('events.edit.description')" :hint="t('events.edit.descriptionHint')" id="event_description">
            <UiTextarea v-model="form.eventDescription" :rows="3" :maxlength="5000" :disabled="!canEdit" />
          </UiField>

          <div class="grid gap-5 sm:grid-cols-2">
            <UiField :label="t('events.edit.start')" :error="errors.startDate" id="event_start" required>
              <UiInput v-model="form.startDate" type="datetime-local" :disabled="!canEdit" />
            </UiField>
            <UiField :label="t('events.edit.end')" :hint="t('events.edit.endHint')" :error="errors.endDate" id="event_end">
              <UiInput v-model="form.endDate" type="datetime-local" :disabled="!canEdit" />
            </UiField>
          </div>

          <EventAddressField v-model="form.customUrlSlug" :locked="slugLocked" :disabled="!canEdit" :error="errors.customUrlSlug" />

          <UiButton v-if="canEdit" type="submit" :loading="saving" :disabled="!dirty" class="w-full sm:w-auto sm:self-end">
            {{ t('events.edit.save') }}
          </UiButton>
        </form>
      </UiCard>

      <UiCard v-if="canEdit" class="mt-6" :title="t('events.publication.title')" heading-level="h2">
        <template #actions><EventStatusBadge :status="event.status" /></template>
        <p class="text-base text-ink-600">{{ t(`events.publication.${event.status}Text`) }}</p>
        <p v-if="dirty" class="mt-2 text-sm text-ink-500">{{ t('events.publication.saveFirst') }}</p>
        <GuestLimitNotice v-if="overflow && event.status === 'draft'" class="mt-4" :info="overflow" variant="publish" with-list-link />
        <div class="mt-4 flex flex-col gap-2 sm:flex-row">
          <UiButton
            v-for="action in actions"
            :key="action.key"
            :variant="action.variant"
            :disabled="dirty || (action.key === 'publish' && !!overflow)"
            @click="askAction(action.key)"
          >
            {{ t(`events.publication.${action.key}`) }}
          </UiButton>
        </div>
      </UiCard>

      <UiCard v-if="isOwner" class="mt-6" :title="t('events.danger.title')" heading-level="h2">
        <p class="text-base text-ink-600">{{ t('events.danger.text') }}</p>
        <UiButton variant="danger" class="mt-4" @click="askDelete">{{ t('events.danger.cta') }}</UiButton>
      </UiCard>
    </template>

    <UiModal
      :open="pending !== null"
      :title="pending ? t(`events.publication.confirm.${pending}Title`, t(`events.publication.${pending}`)) : ''"
      :description="pending ? t(`events.publication.confirm.${pending}Text`, '') : ''"
      size="sm"
      @update:open="value => { if (!value) pending = null }"
    >
      <template #footer>
        <UiButton variant="ghost" :disabled="acting" @click="pending = null">{{ t('events.publication.confirm.cancel') }}</UiButton>
        <UiButton :loading="acting" @click="runAction(pending)">{{ pending ? t(`events.publication.${pending}`) : '' }}</UiButton>
      </template>
    </UiModal>

    <UiModal v-model:open="deleteOpen" :title="t('events.danger.confirmTitle')" :description="t('events.danger.confirmText', { name: event?.eventName ?? '' })" size="sm">
      <UiField :label="t('events.danger.confirmLabel')" id="event_delete_name">
        <UiInput v-model="typedName" autocomplete="off" />
      </UiField>
      <template #footer>
        <UiButton variant="ghost" :disabled="deleting" @click="deleteOpen = false">{{ t('events.publication.confirm.cancel') }}</UiButton>
        <UiButton variant="danger" :disabled="!canDelete" :loading="deleting" @click="confirmDelete">{{ t('events.danger.confirm') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
