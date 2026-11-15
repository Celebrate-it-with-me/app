<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, CircleCheck } from 'lucide-vue-next'
import { UiBadge, UiButton } from '@/ui'
import { stepKey } from '@/modules/assistant/utils/assistant'

const props = defineProps({
  /**
   * Either `{ id, to, count? }` from `pickNextStep` (texts under `app.dashboard.next.<id>`) or the assistant's
   * `{ key, title, reason, route, state, total? }` (texts come from the server). `{ key: 'set_date', local: true }`
   * asks for the event's date; `allSet` works in both shapes.
   */
  step: { type: Object, required: true },
  /** Resolved route target (the step may point at "edit event", which needs the id). */
  target: { type: [String, Object], default: null }
})

const { t } = useI18n()
const key = computed(() => stepKey(props.step))
const isDone = computed(() => key.value === 'allSet')
const fromServer = computed(() => props.step.key != null && !isDone.value && !props.step.local)
const isLocal = computed(() => !!props.step.local)
const overdue = computed(() => fromServer.value && props.step.state === 'overdue')
const hasMore = computed(() => fromServer.value && (props.step.total ?? 1) > 1)

const base = computed(() => (isLocal.value ? 'app.assistant.noDate' : `app.dashboard.next.${isDone.value ? 'allSet' : props.step.id}`))
const title = computed(() => {
  if (fromServer.value) return props.step.title
  if (props.step.count != null) return t(`${base.value}.title`, { n: props.step.count }, props.step.count)
  return t(`${base.value}.title`)
})
const text = computed(() => (fromServer.value ? props.step.reason : t(`${base.value}.text`)))
const cta = computed(() => (fromServer.value ? t('app.assistant.go') : t(`${base.value}.cta`)))
</script>

<template>
  <section
    class="rounded-xl border border-gold-300 bg-gold-50 p-5 sm:p-6"
    :class="isDone && 'border-line bg-white'"
    aria-labelledby="next-step-title"
    :data-step="key"
  >
    <p class="flex flex-wrap items-center gap-2 text-sm font-semibold text-gold-700" :class="isDone && 'text-success-700'">
      <span>
        <CircleCheck v-if="isDone" class="mr-1 inline h-4 w-4 align-[-2px]" aria-hidden="true" />
        {{ t('app.dashboard.next.label') }}
      </span>
      <UiBadge v-if="overdue" tone="warning" size="sm">{{ t('app.assistant.state.overdue') }}</UiBadge>
    </p>
    <h2 id="next-step-title" class="mt-1 font-heading text-2xl text-ink-900 text-balance">{{ title }}</h2>
    <p v-if="text" class="mt-1 max-w-xl text-base text-ink-600">
      <span v-if="fromServer" class="font-semibold text-ink-700">{{ t('app.assistant.whyNow') }}: </span>{{ text }}
    </p>
    <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <UiButton v-if="!isDone && target" :to="target" class="w-full sm:w-auto">
        {{ cta }}
        <ArrowRight class="h-4 w-4" aria-hidden="true" />
      </UiButton>
      <UiButton v-if="hasMore" to="/dashboard/plan" variant="ghost" class="w-full sm:w-auto" data-testid="see-plan">
        {{ t('app.assistant.viewPlan') }}
      </UiButton>
    </div>
  </section>
</template>
