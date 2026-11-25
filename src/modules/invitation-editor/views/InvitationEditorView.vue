<script setup>
/**
 * "Tu invitación": the screen where the organizer edits what the template exposes (contract §3.1, §5).
 * The form comes from the API (`editable.json` of the version the event draws); here every field is only mapped to
 * a control and saved by id, automatically. The selector (`TemplatePickerEntry`), the preview sheet and the cover photo
 * (`CoverPhotoField`) come from the `template-picker` module.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { CloudOff, TriangleAlert, WandSparkles } from 'lucide-vue-next'
import { UiBadge, UiButton, UiEmptyState, UiPageHeader, UiSkeleton, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useInvitationEditor } from '../composables/useInvitationEditor'
import { previewOverrides } from '../utils/editorFields'
import SaveIndicator from '../components/SaveIndicator.vue'
import TemplatePickerEntry from '@/modules/template-picker/components/TemplatePickerEntry.vue'
import EditorPreviewEntry from '../components/EditorPreviewEntry.vue'
import EditorGroup from '../components/EditorGroup.vue'
import FieldRenderer from '../components/FieldRenderer.vue'
import SectionsList from '../components/SectionsList.vue'
import UnlockBanner from '@/modules/payments/components/UnlockBanner.vue'

const { t, te } = useI18n()
const { toast } = useToast()
const eventsStore = useEventsStore()
const router = useRouter()

const event = computed(() => eventsStore.activeEvent)
const eventId = computed(() => event.value?.id ?? null)
// Only owner and editor write (`edit_event`); a viewer sees the form without being able to touch it.
const readOnly = computed(() => event.value?.userRole === 'viewer')

function notify(note) {
  if (note.kind === 'plan') toast({ title: t('invitationEditor.toasts.planRequired'), tone: 'warning' })
  else if (note.kind === 'locked') toast({ title: t('invitationEditor.toasts.templateLocked'), tone: 'warning' })
  else if (note.kind === 'sectionError') {
    const key = te(`invitationEditor.sections.errors.${note.code}`) ? note.code : 'generic'
    toast({ title: t(`invitationEditor.sections.errors.${key}`), tone: 'danger' })
  } else if (note.kind === 'generalError') {
    const key = te(`invitationEditor.errors.${note.code}`) ? note.code : 'generic'
    toast({ title: t(`invitationEditor.errors.${key}`), tone: 'danger' })
  }
}

const editor = useInvitationEditor(() => eventId.value, { notify })
const { data, loading, loadError, fields, groups, sections, fieldErrors, saveStatus, sectionState } = editor

const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
const setOnline = () => (online.value = navigator.onLine)
onMounted(() => {
  window.addEventListener('online', setOnline)
  window.addEventListener('offline', setOnline)
  if (eventId.value) editor.load()
})
onBeforeUnmount(() => {
  window.removeEventListener('online', setOnline)
  window.removeEventListener('offline', setOnline)
})
watch(eventId, id => id && editor.load())

// ORG-005: one banner for every padlock on the screen; the rows only show the padlock and the name.
const hasLocks = computed(() => fields.value.some(field => field.locked) || sections.value.some(section => section.moduleState === 'locked'))
const goUnlock = () => router.push({ name: 'unlock', params: { module: 'full' } })

const showOffline = computed(() => !online.value || saveStatus.value === 'offline')

const statusView = computed(() => {
  const s = data.value?.state
  if (!s) return null
  if (s.status !== 'published') return { tone: 'neutral', key: 'draft' }
  return s.stage === 'save_the_date' ? { tone: 'gold', key: 'saveTheDate' } : { tone: 'success', key: 'published' }
})

/** Groups in the API's order that have fields, plus a trailing bucket for fields of an unknown group. */
const visibleGroups = computed(() => {
  const known = new Set(groups.value.map(g => g.id))
  const list = groups.value.map(g => ({ group: g, fields: fields.value.filter(f => f.group === g.id) }))
  const orphans = fields.value.filter(f => !known.has(f.group))
  if (orphans.length) list.push({ group: { id: '_other', label: { es: t('invitationEditor.group.other'), en: t('invitationEditor.group.other') } }, fields: orphans })
  return list.filter(entry => entry.fields.length)
})
const problemsIn = entry => entry.fields.filter(f => fieldErrors.value[f.id]).length

const overrides = computed(() => previewOverrides(fields.value, fieldErrors.value))
const hasPendingWork = computed(() => saveStatus.value === 'saving')
const hasErrorCode = id => fieldErrors.value[id] ?? null

function onImageChanged(id, value) {
  const f = fields.value.find(x => x.id === id)
  if (!f) return
  f.value = value
  f.isDefault = value == null
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl pb-8">
    <UiPageHeader :title="t('invitationEditor.title')" :eyebrow="event?.name ?? ''" :subtitle="t('invitationEditor.subtitle')" />

    <div v-if="showOffline" class="mb-4 flex items-start gap-2 rounded-lg bg-warning-50 p-3 text-sm text-warning-700" role="status" data-testid="offline-banner">
      <CloudOff class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {{ t('invitationEditor.offline') }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-4" aria-busy="true" data-testid="editor-loading">
      <UiSkeleton height="7rem" />
      <UiSkeleton height="4rem" />
      <UiSkeleton height="4rem" />
      <span class="sr-only" role="status">{{ t('invitationEditor.loading') }}</span>
    </div>

    <!-- The whole form fails together: never a half-drawn form -->
    <div v-else-if="loadError || !data" class="rounded-xl border border-line bg-white" data-testid="editor-error">
      <UiEmptyState :title="t('invitationEditor.loadError.title')" :description="t('invitationEditor.loadError.text')">
        <template #icon><TriangleAlert class="h-6 w-6" aria-hidden="true" /></template>
        <UiButton @click="editor.load()">{{ t('invitationEditor.loadError.retry') }}</UiButton>
      </UiEmptyState>
    </div>

    <div v-else class="flex flex-col gap-6" data-testid="editor">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <UiBadge v-if="statusView" :tone="statusView.tone" dot>{{ t(`invitationEditor.status.${statusView.key}`) }}</UiBadge>
        <SaveIndicator :status="saveStatus" @retry="editor.retry()" />
      </div>

      <UnlockBanner v-if="hasLocks && !readOnly" :event-id="eventId" @unlock="goUnlock" />

      <p v-if="readOnly" class="rounded-lg bg-cream-100 p-3 text-sm text-ink-600" role="note">{{ t('invitationEditor.readOnly') }}</p>

      <!-- After applying or undoing a template the API answers the new editor state: the form is redrawn from it. -->
      <TemplatePickerEntry
        :template-locked="Boolean(data.state?.templateLocked)"
        :unavailable="Boolean(data.template?.fallbackToClassic)"
        :event-id="eventId"
        :disabled="readOnly"
        @changed="editor.applyState"
      />

      <UiEmptyState
        v-if="!fields.length"
        class="rounded-xl border border-line bg-white"
        compact
        :title="t('invitationEditor.empty.title')"
        :description="t('invitationEditor.empty.text')"
        data-testid="editor-empty"
      >
        <template #icon><WandSparkles class="h-6 w-6" aria-hidden="true" /></template>
      </UiEmptyState>

      <div v-else class="flex flex-col gap-3">
        <EditorGroup v-for="(entry, i) in visibleGroups" :key="entry.group.id" :group="entry.group" :open="i === 0 || problemsIn(entry) > 0" :problems="problemsIn(entry)">
          <FieldRenderer
            v-for="field in entry.fields"
            :key="field.id"
            :field="field"
            :error="hasErrorCode(field.id)"
            :read-only="readOnly"
            :event-id="eventId"
            @update="value => editor.setValue(field.id, value)"
            @reset="editor.resetField(field.id)"
            @image-changed="value => onImageChanged(field.id, value)"
          />
        </EditorGroup>
      </div>

      <section v-if="sections.length" aria-labelledby="ie-sections-title" class="flex flex-col gap-3">
        <div>
          <h2 id="ie-sections-title" class="font-heading text-xl text-ink-900">{{ t('invitationEditor.sections.title') }}</h2>
          <p class="text-sm text-ink-500">{{ t('invitationEditor.sections.hint') }}</p>
        </div>
        <SectionsList :sections="sections" :read-only="readOnly" :busy="sectionState === 'saving'" @toggle="editor.toggleSection" @move="editor.shiftSection" />
      </section>

      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <EditorPreviewEntry :event-id="eventId" :overrides="overrides" :disabled="readOnly" />
        <UiButton block :to="{ name: 'edit-event', params: { id: eventId } }" :aria-busy="hasPendingWork || undefined">{{ t('invitationEditor.actions.publish') }}</UiButton>
      </div>
    </div>
  </div>
</template>
