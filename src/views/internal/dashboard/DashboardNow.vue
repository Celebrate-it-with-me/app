<script setup>
/**
 * "Lo que toca ahora": the (up to) three steps the assistant recommends today (`assistant/next` -> `steps`), each with
 * why it matters, a link to do it and a round "done" box (`POST assistant/tasks/{key}/done`). On the Inicio it replaces
 * the floating "Tu siguiente paso". A step marked here stays in its place, crossed out, until the next visit, and can be
 * undone (`reset`) unless the assistant itself detected it from the event's data. Without steps: "Todo al día".
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, Check, Lock, PartyPopper } from 'lucide-vue-next'
import { UiEmptyState, UiSkeleton, useToast } from '@/ui'
import { useAssistantStore } from '@/modules/assistant/stores/useAssistantStore'
import { resolveTaskRoute } from '@/modules/assistant/utils/assistant'
import DashboardBlock from './DashboardBlock.vue'
import { nowSteps } from './dashboardLogic'

const props = defineProps({
  /** The normalized `assistant/next` (null until it loads). */
  next: { type: Object, default: null },
  /** loading | error | ready */
  status: { type: String, default: 'loading' },
  eventId: { type: [Number, String], default: null }
})
defineEmits(['retry'])

const { t } = useI18n()
const { error: showError } = useToast()
const store = useAssistantStore()

/** Steps marked here (key -> the server's task), kept on screen crossed out. */
const completed = ref({})
/**
 * Keys in the order they are drawn, three at most: a step done here keeps its row (crossed out) until the next visit, so
 * the list does not grow nor jump when the assistant offers the following one; new steps only fill free rows.
 */
const order = ref([])
const MAX_ROWS = 3

const live = computed(() => nowSteps(props.next, MAX_ROWS))
watch(
  live,
  steps => {
    const kept = order.value.filter(key => completed.value[key] || steps.some(step => step.key === key))
    const fresh = steps.map(step => step.key).filter(key => !kept.includes(key))
    order.value = [...kept, ...fresh].slice(0, Math.max(MAX_ROWS, kept.length))
  },
  { immediate: true }
)

const rows = computed(() =>
  order.value
    .map(key => {
      if (completed.value[key]) return { ...completed.value[key], done: true }
      const step = live.value.find(item => item.key === key)
      return step ? { ...step, done: false } : null
    })
    .filter(Boolean)
)
const left = computed(() => rows.value.filter(row => !row.done).length)
const visible = computed(() => props.status !== 'ready' || ['normal', 'compressed'].includes(props.next?.mode))

const target = step => (step.moduleLocked && step.moduleKey ? `/dashboard/unlock/${step.moduleKey}` : resolveTaskRoute(step.route, props.eventId))
const canUndo = row => row.done && row.doneBy !== 'data'

const messageOf = e => {
  const status = e?.response?.status
  if (e?.response?.data?.code === 'impersonation_blocked') return t('app.assistant.errors.impersonation')
  if (status === 429) return t('app.assistant.errors.tooMany')
  if (status === 403) return t('app.assistant.errors.forbidden')
  return t('app.assistant.errors.generic')
}

const announce = ref('')
async function toggle(row) {
  if (store.isBusy(row.key) || (row.done && !canUndo(row))) return
  try {
    if (row.done) {
      await store.actOnTask(row.key, 'reset')
      const rest = { ...completed.value }
      delete rest[row.key]
      completed.value = rest
      announce.value = t('app.dashboard.now.undone', { title: row.title })
    } else {
      const task = await store.actOnTask(row.key, 'done')
      completed.value = { ...completed.value, [row.key]: { ...row, ...task, title: row.title } }
      announce.value = t('app.dashboard.now.doneAnnounce', { title: row.title })
    }
  } catch (e) {
    showError(messageOf(e))
  }
}
</script>

<template>
  <section
    v-if="visible"
    class="@container min-w-0 rounded-xl border-2 border-rose-600 bg-white p-5 shadow-card sm:p-6"
    aria-labelledby="now-title"
    data-testid="dashboard-now"
  >
    <p class="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">{{ t('app.dashboard.now.title') }}</p>
    <h2 id="now-title" class="mt-1 font-heading text-xl text-ink-900 sm:text-2xl">
      <template v-if="status === 'ready' && left > 0">{{ t('app.dashboard.now.heading', { n: left }, left) }}</template>
      <template v-else-if="status === 'ready'">{{ t('app.dashboard.now.allSetTitle') }}</template>
      <template v-else>{{ t('app.dashboard.now.loadingHeading') }}</template>
    </h2>

    <div class="mt-3">
      <DashboardBlock :status="status" :error-text="t('app.dashboard.now.error')" @retry="$emit('retry')">
        <template #skeleton>
          <ul class="divide-y divide-cream-300" data-testid="now-skeleton">
            <li v-for="n in 3" :key="n" class="flex items-start gap-3 py-3">
              <UiSkeleton circle width="1.5rem" height="1.5rem" class="m-2.5 shrink-0" />
              <div class="flex-1"><UiSkeleton :lines="2" /></div>
            </li>
          </ul>
        </template>

        <UiEmptyState v-if="!rows.length" compact :title="t('app.dashboard.now.allSetTitle')" :description="t('app.dashboard.now.allSetText')" data-testid="now-empty">
          <template #icon><PartyPopper class="h-6 w-6" aria-hidden="true" /></template>
          <router-link
            to="/dashboard/plan"
            class="inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600"
          >{{ t('app.dashboard.now.planLink') }}</router-link>
        </UiEmptyState>

        <ul v-else class="divide-y divide-cream-300 border-t border-cream-300" data-testid="now-list">
          <li
            v-for="row in rows"
            :key="row.key"
            class="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-x-2 py-2 @md:grid-cols-[2.75rem_minmax(0,1fr)_auto]"
            :data-testid="`now-${row.key}`"
            :data-done="row.done"
          >
            <button
              type="button"
              class="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed"
              :aria-pressed="row.done"
              :aria-label="t(row.done ? 'app.dashboard.now.markPending' : 'app.dashboard.now.markDone', { title: row.title })"
              :aria-busy="store.isBusy(row.key) || undefined"
              :disabled="store.isBusy(row.key) || (row.done && !canUndo(row))"
              data-testid="now-check"
              @click="toggle(row)"
            >
              <span
                class="flex h-6 w-6 items-center justify-center rounded-full border-2 transition-[background-color,border-color,scale] duration-150 ease-out motion-reduce:transition-none"
                :class="row.done ? 'border-success-500 bg-success-500' : 'border-ink-400 bg-white group-hover:border-success-500 group-active:scale-90'"
              >
                <Check v-if="row.done" class="h-3.5 w-3.5 text-white" stroke-width="3.5" aria-hidden="true" />
              </span>
            </button>
            <div class="min-w-0 pt-2.5">
              <p class="text-base font-semibold" :class="row.done ? 'text-ink-500 line-through' : 'text-ink-900'">{{ row.title }}</p>
              <p v-if="row.moduleLocked && !row.done" class="mt-0.5 flex items-center gap-1.5 text-sm text-gold-700">
                <Lock class="h-4 w-4 shrink-0" aria-hidden="true" />{{ t('app.dashboard.now.locked') }}
              </p>
              <p v-else-if="row.reason && !row.done" class="mt-0.5 text-sm leading-snug text-ink-500">{{ row.reason }}</p>
            </div>
            <router-link
              v-if="!row.done && target(row)"
              :to="target(row)"
              class="col-start-2 inline-flex min-h-11 items-center gap-1 justify-self-start rounded-md text-sm font-semibold text-rose-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600 @md:col-start-3 @md:px-1"
              data-testid="now-go"
            >
              {{ t(row.moduleLocked ? 'app.dashboard.now.unlock' : 'app.dashboard.now.go') }}
              <ArrowRight class="h-4 w-4 shrink-0" aria-hidden="true" />
              <span class="sr-only">: {{ row.title }}</span>
            </router-link>
          </li>
        </ul>
      </DashboardBlock>
    </div>
    <p class="sr-only" role="status" aria-live="polite">{{ announce }}</p>
  </section>
</template>
