<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Pencil, Trash2, Plus, CalendarClock, MoreHorizontal } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiButton, UiSkeleton, UiEmptyState, UiModal, UiBottomSheet, useToast, UiPage } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useTimelineStore } from '../stores/timelineStore'
import MomentForm from '../components/MomentForm.vue'
import { buildPayload, iconFor, timeOf } from '../utils/program'
import { connectionBetween, durationOf, formatDuration, rangeLabel } from '../utils/timeMath'
import { eventDate } from '@/utils/eventDateTime'

const { t, locale } = useI18n()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()
const store = useTimelineStore()

const event = computed(() => eventsStore.activeEvent)
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))
const eventStart = computed(() => eventDate(event.value))

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

const ACTION_BTN =
  'inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-500 transition-colors hover:bg-black/5 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose-600'
const SHEET_DELAY_MS = 180

// One entry per moment with what is needed to draw it. Only what is drawn is 12 h; the form keeps 24 h.
const rows = computed(() =>
  store.timelines.map((moment, i, all) => {
    const label = rangeLabel(moment, locale.value)
    const minutes = durationOf(moment)
    const link = connectionBetween(moment, all[i + 1])
    return {
      moment,
      start: label.start,
      end: label.end,
      range: label.range,
      duration: minutes === null ? '' : formatDuration(minutes),
      link: link && { kind: link.kind, text: t(`app.timeline.${link.kind === 'gap' ? 'free' : 'overlap'}`, { duration: formatDuration(link.minutes) }) },
      first: i === 0,
      last: i === all.length - 1
    }
  })
)

// Phones: the "..." button opens a sheet; the dialog it leads to opens once the sheet has left (focus is not fought over).
const sheetMoment = ref(null)
const sheetOpen = ref(false)
let timer
onBeforeUnmount(() => clearTimeout(timer))
function openSheet(moment) {
  sheetMoment.value = moment
  sheetOpen.value = true
}
function fromSheet(action) {
  const moment = sheetMoment.value
  sheetOpen.value = false
  clearTimeout(timer)
  timer = setTimeout(() => (action === 'edit' ? openForm(moment) : (removing.value = moment)), SHEET_DELAY_MS)
}
</script>

<template>
  <UiPage class="pb-24 lg:pb-0">
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
      <ol class="mt-6 max-w-[860px] rounded-xl border border-line bg-white py-2 shadow-card" data-testid="timeline-list">
        <li v-for="row in rows" :key="row.moment.id" data-testid="timeline-moment">
          <div
            class="group grid grid-cols-[36px_minmax(0,1fr)_auto] gap-x-3 pr-3 pl-3.5 md:grid-cols-[92px_44px_minmax(0,1fr)_auto] md:gap-x-3.5 md:px-4"
          >
            <div class="hidden pt-3 text-right md:block">
              <p class="text-[15px] font-semibold whitespace-nowrap text-ink-900">
                <time :datetime="timeOf(row.moment.startTime)">{{ row.start }}</time>
              </p>
              <p v-if="row.end" class="mt-0.5 text-xs whitespace-nowrap text-ink-500">
                <time :datetime="timeOf(row.moment.endTime)">{{ t('app.timeline.until', { time: row.end }) }}</time>
              </p>
              <p v-if="row.duration" class="text-xs whitespace-nowrap text-ink-400">{{ row.duration }}</p>
            </div>

            <div class="relative flex justify-center pt-2 md:pt-1.5" aria-hidden="true">
              <span
                v-if="!(row.first && row.last)"
                class="absolute left-1/2 w-0.5 -translate-x-1/2 bg-cream-300"
                :class="[
                  row.first ? 'top-[26px] md:top-7' : 'top-0',
                  row.last ? 'h-[26px] md:h-7' : row.link ? 'bottom-3.5' : 'bottom-0'
                ]"
              ></span>
              <span class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 shadow-[0_0_0_4px_#fff] md:h-11 md:w-11">
                <component :is="iconFor(row.moment.type)" class="h-[18px] w-[18px] md:h-5 md:w-5" />
              </span>
            </div>

            <div class="min-w-0 pt-2 pb-[18px] md:pt-2.5 md:pb-[22px]">
              <p class="mb-0.5 text-xs text-ink-500 md:hidden" data-testid="timeline-hours">
                <span class="font-semibold text-ink-900"><time :datetime="timeOf(row.moment.startTime)">{{ row.range }}</time></span>
                <span v-if="row.duration" class="whitespace-nowrap"> &middot; {{ row.duration }}</span>
              </p>
              <h3 class="font-heading text-base leading-tight break-words text-ink-900 md:text-lg">{{ row.moment.title }}</h3>
              <p v-if="row.moment.description" class="mt-1 text-sm break-words text-ink-700">{{ row.moment.description }}</p>
            </div>

            <div v-if="canEdit" class="pt-1.5 md:pt-2">
              <button
                type="button"
                class="-mr-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors active:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose-600 md:hidden"
                :aria-label="t('app.timeline.actionsFor', { name: row.moment.title })"
                data-testid="timeline-more"
                @click="openSheet(row.moment)"
              >
                <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
              </button>
              <div
                class="hidden gap-1 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 md:flex [@media(hover:none)]:opacity-100"
                data-testid="timeline-actions"
              >
                <button type="button" :class="ACTION_BTN" :aria-label="t('app.timeline.editMoment', { name: row.moment.title })" @click="openForm(row.moment)">
                  <Pencil class="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" :class="ACTION_BTN" :aria-label="t('app.timeline.removeMoment', { name: row.moment.title })" @click="removing = row.moment">
                  <Trash2 class="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="row.link"
            class="-mt-3.5 grid grid-cols-[36px_minmax(0,1fr)_auto] gap-x-3 pr-3 pl-3.5 md:grid-cols-[92px_44px_minmax(0,1fr)_auto] md:gap-x-3.5 md:px-4"
            data-testid="timeline-link"
            :data-kind="row.link.kind"
          >
            <span class="hidden md:block" aria-hidden="true"></span>
            <span class="flex justify-center" aria-hidden="true">
              <span class="timeline-dots w-0.5"></span>
            </span>
            <p class="pt-3.5 pb-1.5 text-xs" :class="row.link.kind === 'overlap' ? 'text-danger-700' : 'text-ink-500'">{{ row.link.text }}</p>
          </div>
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

    <UiBottomSheet v-model:open="sheetOpen" :title="sheetMoment?.title ?? ''">
      <ul class="space-y-0.5" data-testid="timeline-sheet">
        <li>
          <button type="button" class="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left text-[15px] text-ink-900 transition-colors active:bg-black/[.04] focus-visible:outline-2 focus-visible:outline-rose-600" @click="fromSheet('edit')">
            <Pencil class="h-4 w-4 text-ink-500" aria-hidden="true" />
            {{ t('app.timeline.edit') }}
          </button>
        </li>
        <li>
          <button type="button" class="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left text-[15px] text-danger-700 transition-colors active:bg-black/[.04] focus-visible:outline-2 focus-visible:outline-rose-600" @click="fromSheet('remove')">
            <Trash2 class="h-4 w-4" aria-hidden="true" />
            {{ t('app.timeline.delete') }}
          </button>
        </li>
      </ul>
    </UiBottomSheet>

    <MomentForm v-model:open="formOpen" :moment="editing" :saving="saving" @save="save" />

    <UiModal :open="!!removing" :title="t('app.timeline.removeTitle')" size="sm" @update:open="removing = null">
      <p class="text-ink-700">{{ t('app.timeline.removeBody', { name: removing?.title ?? '' }) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="removing = null">{{ t('app.timeline.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="confirmRemove">{{ t('app.timeline.remove') }}</UiButton>
      </template>
    </UiModal>
  </UiPage>
</template>

<style scoped>
.timeline-dots {
  background-image: repeating-linear-gradient(to bottom, var(--color-cream-300) 0 4px, transparent 4px 8px);
}
</style>
