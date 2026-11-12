<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Pencil, Trash2, Plus, CalendarClock } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiButton, UiSkeleton, UiEmptyState, UiModal, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useTimelineStore } from '../stores/timelineStore'
import MomentForm from '../components/MomentForm.vue'
import { buildPayload, iconFor, parseEventDate, timeOf } from '../utils/program'

const { t } = useI18n()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()
const store = useTimelineStore()

const event = computed(() => eventsStore.activeEvent)
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))
const eventStart = computed(() => parseEventDate(event.value?.startDate))

const loading = ref(true)
const saving = ref(false)
const formOpen = ref(false)
const editing = ref(null)
const removing = ref(null)

async function load() {
  if (!event.value?.id) return
  loading.value = true
  try {
    await store.fetchTimelines(event.value.id)
  } catch {
    showError(t('app.timeline.loadError'))
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => event.value?.id, load)

function openForm(moment = null) {
  editing.value = moment
  formOpen.value = true
}

async function save(form) {
  saving.value = true
  try {
    const payload = buildPayload(form, eventStart.value)
    if (editing.value) await store.updateTimeline(event.value.id, editing.value.id, payload)
    else await store.addTimeline(event.value.id, payload)
    formOpen.value = false
    success(t('app.timeline.saved'))
  } catch {
    showError(t('app.timeline.saveError'))
  } finally {
    saving.value = false
  }
}

async function startTypical() {
  saving.value = true
  try {
    await store.startTypical(event.value.id)
    success(t('app.timeline.typicalDone'))
  } catch {
    showError(t('app.timeline.saveError'))
  } finally {
    saving.value = false
  }
}

async function confirmRemove() {
  saving.value = true
  try {
    await store.deleteTimeline(event.value.id, removing.value.id)
    removing.value = null
  } catch {
    showError(t('app.timeline.saveError'))
  } finally {
    saving.value = false
  }
}

const hours = moment => (moment.endTime ? `${timeOf(moment.startTime)} – ${timeOf(moment.endTime)}` : timeOf(moment.startTime))
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UiPageHeader :title="t('app.timeline.title')" :subtitle="t('app.timeline.subtitle')" />

    <div v-if="loading" class="mt-6 space-y-3">
      <UiSkeleton class="h-20" />
      <UiSkeleton class="h-20" />
      <UiSkeleton class="h-20" />
    </div>

    <UiCard v-else-if="!store.timelines.length" class="mt-6">
      <UiEmptyState :title="t('app.timeline.emptyTitle')" :description="t('app.timeline.emptyText')">
        <template v-if="canEdit">
          <UiButton :loading="saving" @click="startTypical">{{ t('app.timeline.typical') }}</UiButton>
          <UiButton variant="secondary" @click="openForm()">{{ t('app.timeline.add') }}</UiButton>
        </template>
      </UiEmptyState>
    </UiCard>

    <template v-else>
      <ol class="mt-6 space-y-3">
        <li v-for="moment in store.timelines" :key="moment.id">
          <UiCard padding="sm">
            <div class="flex items-start gap-3">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <component :is="iconFor(moment.type)" class="h-5 w-5" aria-hidden="true" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-ink-500">{{ hours(moment) }}</p>
                <h2 class="font-heading text-lg text-ink-900">{{ moment.title }}</h2>
                <p v-if="moment.description" class="mt-1 text-sm text-ink-700">{{ moment.description }}</p>
              </div>
              <div v-if="canEdit" class="flex shrink-0 gap-1">
                <UiButton variant="ghost" size="sm" icon :aria-label="t('app.timeline.edit')" @click="openForm(moment)">
                  <Pencil class="h-4 w-4" aria-hidden="true" />
                </UiButton>
                <UiButton variant="ghost" size="sm" icon :aria-label="t('app.timeline.remove')" @click="removing = moment">
                  <Trash2 class="h-4 w-4" aria-hidden="true" />
                </UiButton>
              </div>
            </div>
          </UiCard>
        </li>
      </ol>
      <div v-if="canEdit" class="mt-5">
        <UiButton variant="secondary" @click="openForm()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.timeline.add') }}
        </UiButton>
      </div>
      <p class="mt-4 flex items-center gap-2 text-sm text-ink-500">
        <CalendarClock class="h-4 w-4" aria-hidden="true" />
        {{ t('app.timeline.shared') }}
      </p>
    </template>

    <MomentForm v-model:open="formOpen" :moment="editing" :saving="saving" @save="save" />

    <UiModal :open="!!removing" :title="t('app.timeline.removeTitle')" size="sm" @update:open="removing = null">
      <p class="text-ink-700">{{ t('app.timeline.removeBody', { name: removing?.title ?? '' }) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="removing = null">{{ t('app.timeline.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="confirmRemove">{{ t('app.timeline.remove') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
