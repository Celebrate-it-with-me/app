<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Clock, EyeOff, Lock, MoreHorizontal, RotateCcw, Ban } from 'lucide-vue-next'
import { UiBadge, UiButton, UiDropdown } from '@/ui'
import { SNOOZE_OPTIONS, resolveTaskRoute } from '../utils/assistant'
import { formatEventDate } from '@/utils/eventDateTime'

const props = defineProps({
  task: { type: Object, required: true },
  /** `{ key: title }` of every task in the plan, to name the prerequisites. */
  titles: { type: Object, default: () => ({}) },
  eventId: { type: [Number, String], default: null },
  /** Owners and editors; a viewer only reads. */
  canEdit: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  /** Row of the "hidden" list: the only action is restoring. */
  hiddenRow: { type: Boolean, default: false }
})
const emit = defineEmits(['done', 'snooze', 'hide', 'not-applicable', 'reset'])

const { t, locale } = useI18n()

const TONES = { overdue: 'warning', next: 'rose', available: 'rose', upcoming: 'neutral', done: 'success', hidden: 'neutral', not_applicable: 'neutral' }

const isDone = computed(() => props.task.state === 'done')
const locked = computed(() => props.task.moduleLocked)
const blocked = computed(() => !isDone.value && !props.hiddenRow && props.task.blockedBy.length > 0)
// "Ahora" is only for the 1-3 steps the server recommends (`next`): not for plain `available` tasks, and never for
// a task waiting on a prerequisite or behind a locked module (those show their hint / unlock button instead).
const badge = computed(() => {
  const state = props.task.state
  if (state === 'available') return null
  if (state === 'next' && (blocked.value || locked.value)) return null
  return state
})
const target = computed(() => (locked.value ? `/dashboard/unlock/${props.task.moduleKey}` : resolveTaskRoute(props.task.route, props.eventId)))
const showReason = computed(() => !isDone.value && !props.hiddenRow && !locked.value && !!props.task.reason)
const blockers = computed(() => props.task.blockedBy.map(k => props.titles[k]).filter(Boolean))
const snoozedUntil = computed(() => {
  const date = formatEventDate(props.task.snoozedUntil, 'dayMonth', locale.value)
  return date ? t('app.assistant.task.snoozedUntil', { date }) : ''
})
// A task the detector sees as done cannot be undone by hand: `reset` would change nothing.
const canUndo = computed(() => isDone.value && props.task.doneBy !== 'data')

const menu = computed(() => [
  ...SNOOZE_OPTIONS.map(o => ({
    label: t(o.labelKey),
    icon: Clock,
    onSelect: () => emit('snooze', o.days)
  })),
  { label: t('app.assistant.action.hide'), icon: EyeOff, separator: true, onSelect: () => emit('hide') },
  { label: t('app.assistant.action.notApplicable'), icon: Ban, onSelect: () => emit('not-applicable') }
])
</script>

<template>
  <li class="rounded-lg border border-line bg-white py-4 pl-4 lg:pr-4 fab-safe" :class="[isDone && 'bg-cream-50', blocked && 'bg-cream-50/60']" :data-testid="`task-${task.key}`" :data-state="task.state">
    <div class="flex flex-wrap items-start gap-x-3 gap-y-1">
      <h4 class="min-w-0 flex-1 text-base font-semibold text-ink-900" :class="(isDone || blocked) && 'text-ink-600'">
        <Check v-if="isDone" class="mr-1 inline h-4 w-4 text-success-700 align-[-2px]" aria-hidden="true" />
        {{ task.title }}
      </h4>
      <UiBadge v-if="badge" :tone="TONES[badge] ?? 'neutral'" size="sm">{{ t(`app.assistant.state.${badge}`) }}</UiBadge>
    </div>

    <p v-if="showReason" class="mt-1 text-sm text-ink-600" data-testid="task-reason">
      <span class="font-semibold text-ink-700">{{ t('app.assistant.whyNow') }}:</span> {{ task.reason }}
    </p>
    <p v-if="isDone && task.doneBy === 'data'" class="mt-1 text-sm text-ink-600">{{ t('app.assistant.task.doneByData') }}</p>
    <p v-if="snoozedUntil && !isDone && !hiddenRow" class="mt-1 text-sm text-ink-600">{{ snoozedUntil }}</p>
    <p v-if="blockers.length && !isDone && !hiddenRow" class="mt-1 text-sm text-ink-600">
      {{ t('app.assistant.task.blockedBy', { titles: blockers.join(', ') }) }}
    </p>
    <p v-if="locked" class="mt-1 flex items-center gap-1.5 text-sm text-gold-700">
      <Lock class="h-4 w-4 shrink-0" aria-hidden="true" />{{ t('app.assistant.task.locked') }}
    </p>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <template v-if="hiddenRow">
        <UiButton v-if="canEdit" variant="secondary" :loading="busy" @click="emit('reset')">
          <RotateCcw class="h-4 w-4" aria-hidden="true" />{{ t('app.assistant.action.restore') }}
        </UiButton>
      </template>
      <template v-else>
        <UiButton v-if="target && !isDone" :to="target" :variant="locked || blocked ? 'outline' : 'primary'">
          {{ locked ? t('app.assistant.task.unlock') : t('app.assistant.go') }}
        </UiButton>
        <template v-if="canEdit && !locked">
          <UiButton v-if="!isDone" variant="secondary" :loading="busy" @click="emit('done')">
            {{ t('app.assistant.action.markDone') }}
          </UiButton>
          <UiButton v-else-if="canUndo" variant="ghost" :loading="busy" @click="emit('reset')">
            <RotateCcw class="h-4 w-4" aria-hidden="true" />{{ t('app.assistant.action.undo') }}
          </UiButton>
          <UiDropdown v-if="!isDone" :items="menu">
            <template #trigger>
              <UiButton variant="ghost" icon :disabled="busy" :aria-label="t('app.assistant.task.moreActions', { title: task.title })">
                <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
              </UiButton>
            </template>
          </UiDropdown>
        </template>
      </template>
    </div>
  </li>
</template>
