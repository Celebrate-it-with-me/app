<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { CalendarDays, ChevronDown, ListChecks, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { UiBadge, UiButton, UiCard, UiEmptyState, UiModal, UiPageHeader, UiSkeleton, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'
import { useAssistantStore } from '../stores/useAssistantStore'
import { apiFieldErrors, planIsEmpty, titleIndex } from '../utils/assistant'
import PlanTaskRow from '../components/PlanTaskRow.vue'
import CustomTaskModal from '../components/CustomTaskModal.vue'

const { t, locale } = useI18n()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()
const impersonation = useImpersonationStore()
const store = useAssistantStore()
const { plan, planStatus } = storeToRefs(store)

const event = computed(() => eventsStore.activeEvent)
// Only owners and editors write; a viewer reads. A support (impersonation) session never writes either.
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole) && !impersonation.active)
const readOnly = computed(() => !canEdit.value)
const editTarget = computed(() => (event.value ? { name: 'edit-event', params: { id: event.value.id } } : null))

const mode = computed(() => plan.value?.mode ?? 'normal')
const titles = computed(() => titleIndex(plan.value))
const percent = computed(() => Math.round((plan.value?.progress?.ratio ?? 0) * 100))

function load(quiet = false) {
  if (event.value?.id) store.fetchPlan({ eventId: event.value.id, lang: locale.value, quiet })
}
watch(() => event.value?.id, () => load(), { immediate: true })
watch(locale, () => load(true))
const onVisible = () => document.visibilityState === 'visible' && load(true)
onMounted(() => document.addEventListener('visibilitychange', onVisible))
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisible))

// Groups: overdue on top, then each phase without its overdue and done tasks, done at the end (folded).
const overdue = computed(() => plan.value?.overdue ?? [])
const groups = computed(() =>
  (plan.value?.phases ?? [])
    .map(p => ({
      key: p.key,
      label: p.label || t(`app.assistant.phases.${p.key}`),
      tasks: p.tasks.filter(task => task.state !== 'overdue' && task.state !== 'done')
    }))
    .filter(g => g.tasks.length)
)
// A long phase folds what is not a recommended step: always keep `next` tasks, fill up to FOLD_VISIBLE, fold the rest.
const FOLD_LIMIT = 5
const FOLD_VISIBLE = 4
const expanded = ref({})
const visibleTasks = group => {
  if (group.tasks.length <= FOLD_LIMIT || expanded.value[group.key]) return group.tasks
  let room = Math.max(FOLD_VISIBLE - group.tasks.filter(task => task.state === 'next').length, 0)
  return group.tasks.filter(task => task.state === 'next' || room-- > 0)
}
const foldedCount = group => group.tasks.length - visibleTasks(group).length
const canFold = group => group.tasks.length > FOLD_LIMIT
const doneTasks = computed(() => (plan.value?.phases ?? []).flatMap(p => p.tasks).filter(task => task.state === 'done'))
const hiddenTasks = computed(() => plan.value?.hidden ?? [])
const custom = computed(() => plan.value?.custom ?? [])
const showDone = ref(false)
const showHidden = ref(false)

const messageOf = e => {
  const status = e?.response?.status
  const code = e?.response?.data?.code
  if (code === 'impersonation_blocked') return t('app.assistant.errors.impersonation')
  if (status === 429) return t('app.assistant.errors.tooMany')
  if (status === 403) return t('app.assistant.errors.forbidden')
  if (status === 409 && code === 'custom_task_limit') return t('app.assistant.errors.limit')
  return t('app.assistant.errors.generic')
}

/** Run a write; on failure say why. A 404 means the task is gone: refresh instead of leaving a ghost. */
async function run(request, okKey) {
  try {
    await request()
    if (okKey) success(t(okKey))
    return true
  } catch (e) {
    if (e?.response?.status === 404) {
      showError(t('app.assistant.errors.notFound'))
      load(true)
    } else showError(messageOf(e))
    return false
  }
}

const act = (task, action, body, okKey) => run(() => store.actOnTask(task.key, action, body), okKey)
const done = task => act(task, 'done', {}, 'app.assistant.toast.done')
const snooze = (task, days) => act(task, 'snooze', { days }, 'app.assistant.toast.snoozed')
const hide = task => act(task, 'hide', {}, 'app.assistant.toast.hidden')
const notApplicable = task => act(task, 'not-applicable', {}, 'app.assistant.toast.notApplicable')
const reset = task => act(task, 'reset', {}, 'app.assistant.toast.restored')

// Custom tasks
const modalOpen = ref(false)
const editing = ref(null)
const serverErrors = ref({})
const deleting = ref(null)
const saving = computed(() => store.isBusy(editing.value ? `custom:${editing.value.id}` : 'custom:new'))

function openNew() {
  editing.value = null
  serverErrors.value = {}
  modalOpen.value = true
}
function openEdit(item) {
  editing.value = item
  serverErrors.value = {}
  modalOpen.value = true
}
async function saveCustom(form) {
  const body = { title: form.title, notes: form.notes || null, due_date: form.dueDate || null }
  try {
    if (editing.value) await store.updateCustom(editing.value.id, body)
    else await store.createCustom(body)
    modalOpen.value = false
    success(t('app.assistant.toast.customSaved'))
  } catch (e) {
    if (e?.response?.status === 422) serverErrors.value = apiFieldErrors(e.response.data)
    else if (e?.response?.status === 404) {
      modalOpen.value = false
      showError(t('app.assistant.errors.notFound'))
      load(true)
    } else showError(messageOf(e))
  }
}
const toggleCustom = item => run(() => store.updateCustom(item.id, { done: !item.doneAt }))
async function confirmRemove() {
  const item = deleting.value
  if (await run(() => store.removeCustom(item.id), 'app.assistant.toast.customRemoved')) deleting.value = null
}
const deleteOpen = computed({
  get: () => deleting.value !== null,
  set: value => {
    if (!value) deleting.value = null
  }
})

const dueText = item => {
  if (!item.dueDate) return ''
  const [y, m, d] = item.dueDate.split('-').map(Number)
  return t('app.assistant.custom.due', { date: new Date(y, m - 1, d).toLocaleDateString(locale.value, { day: 'numeric', month: 'long' }) })
}

const hasContent = computed(() => !planIsEmpty(plan.value))
const noteKey = computed(() => ({ compressed: 'compressed', event_past: 'eventPast' })[mode.value] ?? null)
</script>

<template>
  <div v-if="event">
    <UiPageHeader :title="t('app.assistant.plan.title')" :subtitle="t('app.assistant.plan.subtitle')" :eyebrow="event.eventName" />

    <!-- Loading -->
    <div v-if="planStatus === 'loading' && !plan" class="space-y-3" role="status" aria-live="polite" data-testid="plan-loading">
      <UiSkeleton height="3rem" />
      <UiSkeleton height="6rem" />
      <UiSkeleton height="6rem" />
    </div>

    <!-- Error -->
    <UiCard v-else-if="planStatus === 'error' && !plan" data-testid="plan-error">
      <UiEmptyState :title="t('app.assistant.plan.loadError')" compact />
      <div class="mt-2 flex justify-center"><UiButton variant="secondary" @click="load()">{{ t('app.assistant.plan.retry') }}</UiButton></div>
    </UiCard>

    <!-- Event type the assistant does not cover -->
    <UiCard v-else-if="plan && mode === 'unsupported'" data-testid="plan-unsupported">
      <UiEmptyState :title="t('app.assistant.plan.unsupported.title')" :description="t('app.assistant.plan.unsupported.text')" />
    </UiCard>

    <!-- No date -->
    <UiCard v-else-if="plan && mode === 'no_date'" data-testid="plan-no-date">
      <UiEmptyState :title="t('app.assistant.plan.noDate.title')" :description="t('app.assistant.plan.noDate.text')" />
      <div v-if="canEdit && editTarget" class="mt-2 flex justify-center">
        <UiButton :to="editTarget"><CalendarDays class="h-5 w-5" aria-hidden="true" />{{ t('app.assistant.plan.noDate.cta') }}</UiButton>
      </div>
    </UiCard>

    <div v-else-if="plan" class="space-y-6">
      <p v-if="readOnly" class="rounded-lg border border-line bg-cream-100 px-4 py-3 text-sm text-ink-700" role="note" data-testid="read-only">
        {{ t('app.assistant.plan.readOnly') }}
      </p>
      <p v-if="noteKey" class="rounded-lg border border-gold-300 bg-gold-50 px-4 py-3 text-sm text-ink-700" role="note">
        {{ t(`app.assistant.plan.${noteKey}`) }}
      </p>

      <!-- Progress -->
      <section v-if="plan.progress.total" aria-labelledby="plan-progress">
        <div class="flex items-baseline justify-between gap-3">
          <h2 id="plan-progress" class="text-sm font-semibold text-ink-700">{{ t('app.assistant.plan.progressLabel') }}</h2>
          <p class="text-sm text-ink-600">{{ t('app.assistant.plan.progress', { done: plan.progress.done, total: plan.progress.total }) }}</p>
        </div>
        <div
          class="mt-2 h-2 overflow-hidden rounded-full bg-cream-200"
          role="progressbar"
          :aria-valuenow="percent"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="t('app.assistant.plan.progressLabel')"
        >
          <div class="h-full rounded-full bg-rose-600" :style="{ width: `${percent}%` }" />
        </div>
      </section>

      <UiCard v-if="!hasContent" data-testid="plan-empty">
        <UiEmptyState :title="t('app.assistant.plan.empty.title')" :description="t('app.assistant.plan.empty.text')" />
      </UiCard>

      <!-- Overdue -->
      <section v-if="overdue.length" aria-labelledby="plan-overdue" data-testid="group-overdue">
        <h3 id="plan-overdue" class="font-heading text-xl text-ink-900">{{ t('app.assistant.sections.overdue') }}</h3>
        <p class="mt-0.5 text-sm text-ink-600">{{ t('app.assistant.sections.overdueHint') }}</p>
        <ul class="mt-3 space-y-3">
          <PlanTaskRow
            v-for="task in overdue" :key="task.key" :task="task" :titles="titles" :event-id="event.id" :can-edit="canEdit" :busy="store.isBusy(task.key)"
            @done="done(task)" @snooze="snooze(task, $event)" @hide="hide(task)" @not-applicable="notApplicable(task)" @reset="reset(task)"
          />
        </ul>
      </section>

      <!-- Phases -->
      <section v-for="group in groups" :key="group.key" :aria-labelledby="`plan-${group.key}`" :data-testid="`group-${group.key}`">
        <h3 :id="`plan-${group.key}`" class="font-heading text-xl text-ink-900">{{ group.label }}</h3>
        <ul class="mt-3 space-y-3">
          <PlanTaskRow
            v-for="task in visibleTasks(group)" :key="task.key" :task="task" :titles="titles" :event-id="event.id" :can-edit="canEdit" :busy="store.isBusy(task.key)"
            @done="done(task)" @snooze="snooze(task, $event)" @hide="hide(task)" @not-applicable="notApplicable(task)" @reset="reset(task)"
          />
        </ul>
        <UiButton
          v-if="canFold(group) && (foldedCount(group) || expanded[group.key])"
          variant="link"
          class="mt-2"
          :aria-expanded="!!expanded[group.key]"
          :data-testid="`fold-${group.key}`"
          @click="expanded[group.key] = !expanded[group.key]"
        >
          {{ expanded[group.key] ? t('app.assistant.action.showLess') : t('app.assistant.action.showMore', { n: foldedCount(group) }) }}
        </UiButton>
      </section>

      <!-- Custom tasks -->
      <section aria-labelledby="plan-mine" data-testid="group-custom">
        <div class="flex items-center justify-between gap-3">
          <h3 id="plan-mine" class="font-heading text-xl text-ink-900">{{ t('app.assistant.sections.mine') }}</h3>
          <UiButton v-if="canEdit" variant="secondary" data-testid="add-custom" @click="openNew">
            <Plus class="h-5 w-5" aria-hidden="true" />{{ t('app.assistant.custom.add') }}
          </UiButton>
        </div>
        <p v-if="!custom.length" class="mt-2 text-sm text-ink-600">{{ t('app.assistant.custom.empty') }}</p>
        <ul v-else class="mt-3 space-y-3">
          <li v-for="item in custom" :key="item.id" class="flex items-start gap-3 rounded-lg border border-line bg-white p-4" :data-testid="`custom-${item.id}`">
            <input
              type="checkbox"
              class="mt-1 h-5 w-5 shrink-0 accent-rose-600"
              :checked="!!item.doneAt"
              :disabled="!canEdit || store.isBusy(`custom:${item.id}`)"
              :aria-label="t(item.doneAt ? 'app.assistant.custom.markUndone' : 'app.assistant.custom.markDone', { title: item.title })"
              @change="toggleCustom(item)"
            />
            <div class="min-w-0 flex-1">
              <p class="break-words text-base font-semibold text-ink-900" :class="item.doneAt && 'text-ink-500 line-through'">{{ item.title }}</p>
              <p v-if="item.notes" class="mt-0.5 whitespace-pre-line break-words text-sm text-ink-600">{{ item.notes }}</p>
              <p v-if="item.dueDate" class="mt-0.5 text-sm text-ink-600">{{ dueText(item) }}</p>
            </div>
            <div v-if="canEdit" class="flex shrink-0">
              <UiButton variant="ghost" icon :aria-label="`${t('app.assistant.custom.edit')}: ${item.title}`" @click="openEdit(item)"><Pencil class="h-5 w-5" aria-hidden="true" /></UiButton>
              <UiButton variant="ghost" icon :aria-label="`${t('app.assistant.custom.remove')}: ${item.title}`" @click="deleting = item"><Trash2 class="h-5 w-5" aria-hidden="true" /></UiButton>
            </div>
          </li>
        </ul>
      </section>

      <!-- Done (folded) -->
      <section v-if="doneTasks.length" data-testid="group-done">
        <button
          type="button"
          class="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-1 text-left font-heading text-xl text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          :aria-expanded="showDone"
          aria-controls="plan-done-list"
          @click="showDone = !showDone"
        >
          <span class="flex items-center gap-2">{{ t('app.assistant.sections.done') }} <UiBadge size="sm" tone="success">{{ doneTasks.length }}</UiBadge></span>
          <ChevronDown class="h-5 w-5 shrink-0 transition-transform" :class="showDone && 'rotate-180'" aria-hidden="true" />
        </button>
        <ul v-show="showDone" id="plan-done-list" class="mt-3 space-y-3">
          <PlanTaskRow
            v-for="task in doneTasks" :key="task.key" :task="task" :titles="titles" :event-id="event.id" :can-edit="canEdit" :busy="store.isBusy(task.key)"
            @reset="reset(task)"
          />
        </ul>
      </section>

      <!-- Hidden -->
      <section v-if="hiddenTasks.length" data-testid="group-hidden">
        <UiButton variant="link" :aria-expanded="showHidden" aria-controls="plan-hidden-list" @click="showHidden = !showHidden">
          <ListChecks class="h-4 w-4" aria-hidden="true" />
          {{ showHidden ? t('app.assistant.action.hideHidden') : t('app.assistant.action.showHidden', { n: hiddenTasks.length }) }}
        </UiButton>
        <ul v-show="showHidden" id="plan-hidden-list" class="mt-3 space-y-3">
          <PlanTaskRow
            v-for="task in hiddenTasks" :key="task.key" :task="task" :titles="titles" :event-id="event.id" :can-edit="canEdit" :busy="store.isBusy(task.key)" hidden-row
            @reset="reset(task)"
          />
        </ul>
      </section>
    </div>

    <CustomTaskModal v-model:open="modalOpen" :task="editing" :saving="saving" :server-errors="serverErrors" @save="saveCustom" />

    <UiModal v-model:open="deleteOpen" :title="t('app.assistant.custom.confirmTitle')" :description="deleting ? t('app.assistant.custom.confirmText', { title: deleting.title }) : ''" size="sm">
      <template #footer>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <UiButton variant="ghost" @click="deleting = null">{{ t('app.assistant.custom.cancel') }}</UiButton>
          <UiButton variant="danger" :loading="deleting ? store.isBusy(`custom:${deleting.id}`) : false" data-testid="confirm-delete" @click="confirmRemove">{{ t('app.assistant.custom.remove') }}</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
