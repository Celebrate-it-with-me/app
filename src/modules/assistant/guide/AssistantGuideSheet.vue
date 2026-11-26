<script setup>
/**
 * The sheet of the floating guide: ONE action, why now, how to do it, "not now", what comes next and the progress.
 * From the bottom on phones, a centered dialog on larger screens (Reka Dialog: focus trap, Esc, aria-labelledby).
 * It only draws; the parent owns the data and the actions.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, Check, LifeBuoy, Sparkles, X } from 'lucide-vue-next'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { UiButton } from '@/ui'
import { percentOf } from './guideUtils'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** From guideView(): { kind: 'task' | 'setDate' | 'allSet' | 'help', task?, after? } */
  view: { type: Object, required: true },
  progress: { type: Object, default: () => ({ done: 0, total: 0, ratio: 0 }) },
  /** { unit: 'days' | 'months', n } or null */
  countdown: { type: Object, default: null },
  /** quince | wedding */
  tone: { type: String, default: 'quince' },
  /** Router location of "Hacerlo ahora", or null when the task has no safe destination. */
  target: { type: [String, Object], default: null },
  canEdit: { type: Boolean, default: true },
  busy: { type: Boolean, default: false },
  celebrating: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'go', 'done', 'snooze', 'help', 'hide', 'close-focus'])

const { t } = useI18n()
const kind = computed(() => props.view.kind)
const percent = computed(() => percentOf(props.progress))
const isOverdue = computed(() => props.view.task?.state === 'overdue')

const heading = computed(() => {
  if (props.celebrating) return t(`assistantGuide.celebrate.${props.tone}`)
  if (kind.value === 'task') return props.view.task.title
  if (kind.value === 'setDate') return t('app.assistant.noDate.title')
  if (kind.value === 'allSet') return t(`assistantGuide.allSet.${props.tone}.title`)
  return t('assistantGuide.helpOnly.title')
})
const reason = computed(() => {
  if (props.celebrating) return ''
  if (kind.value === 'task') return props.view.task.reason
  if (kind.value === 'setDate') return t('app.assistant.noDate.text')
  if (kind.value === 'allSet') return t(`assistantGuide.allSet.${props.tone}.text`)
  return t('assistantGuide.helpOnly.text')
})
const goLabel = computed(() => (kind.value === 'setDate' ? t('app.assistant.noDate.cta') : t('assistantGuide.go')))
const countdownText = computed(() =>
  props.countdown ? t(`assistantGuide.countdown.${props.countdown.unit}`, { n: props.countdown.n }, props.countdown.n) : ''
)
const showProgress = computed(() => (kind.value === 'task' || kind.value === 'allSet') && props.progress.total > 0)
</script>

<template>
  <DialogRoot :open="open" @update:open="value => emit('update:open', value)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-xs" />
      <DialogContent
        class="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-pop focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
        data-testid="guide-sheet"
        @close-auto-focus.prevent="emit('close-focus')"
      >
        <div class="flex items-center justify-between gap-3 px-5 pt-4 sm:px-6 sm:pt-5">
          <p class="flex items-center gap-1.5 text-sm font-semibold text-gold-700">
            <Sparkles class="h-4 w-4" aria-hidden="true" />
            {{ t('assistantGuide.eyebrow') }}
          </p>
          <DialogClose
            class="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-cream-200"
            :aria-label="t('assistantGuide.close')"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </DialogClose>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-2 sm:px-6">
          <Transition
            mode="out-in"
            enter-active-class="transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none"
            leave-active-class="transition-[opacity,translate] duration-150 ease-out motion-reduce:transition-none"
            enter-from-class="translate-y-2 opacity-0"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <div v-if="celebrating" key="celebrate" class="flex flex-col items-center gap-4 py-8 text-center" role="status">
              <span class="guide-spark flex h-16 w-16 items-center justify-center rounded-full bg-gold-100 text-gold-700 ring-4 ring-gold-300">
                <Check class="h-8 w-8" aria-hidden="true" />
              </span>
              <DialogTitle class="font-heading text-2xl text-ink-900 text-balance">{{ heading }}</DialogTitle>
              <DialogDescription class="sr-only">{{ t('assistantGuide.celebrateHint') }}</DialogDescription>
            </div>

            <div v-else :key="`${kind}:${view.task?.key ?? ''}`" class="pt-1">
              <DialogTitle class="font-heading text-3xl leading-tight text-ink-900 text-balance" data-testid="guide-title">
                {{ heading }}
              </DialogTitle>
              <p v-if="isOverdue" class="mt-2 inline-block rounded-full bg-gold-100 px-3 py-1 text-sm font-semibold text-gold-700">
                {{ t('assistantGuide.overdue') }}
              </p>
              <DialogDescription class="mt-2 text-base text-ink-700" data-testid="guide-reason">{{ reason }}</DialogDescription>

              <div v-if="(kind === 'task' || kind === 'setDate') && canEdit" class="mt-5 flex flex-col gap-2">
                <UiButton v-if="target" :to="target" size="lg" block data-testid="guide-go" @click="emit('go')">
                  {{ goLabel }}
                  <ArrowRight class="h-5 w-5" aria-hidden="true" />
                </UiButton>
                <div v-if="kind === 'task'" class="grid grid-cols-2 gap-2">
                  <UiButton variant="secondary" :disabled="busy" data-testid="guide-done" @click="emit('done')">
                    <Check class="h-4 w-4" aria-hidden="true" />
                    {{ t('assistantGuide.done') }}
                  </UiButton>
                  <UiButton variant="ghost" :disabled="busy" data-testid="guide-snooze" @click="emit('snooze')">
                    {{ t('assistantGuide.later') }}
                  </UiButton>
                </div>
              </div>
              <UiButton v-else-if="kind === 'task' && target" :to="target" size="lg" block class="mt-5" @click="emit('go')">
                {{ goLabel }}
                <ArrowRight class="h-5 w-5" aria-hidden="true" />
              </UiButton>

              <div v-if="kind === 'task' && view.after.length" class="mt-5" data-testid="guide-after">
                <p class="text-sm font-semibold text-ink-700">{{ t('assistantGuide.after') }}</p>
                <ul class="mt-2 space-y-1.5">
                  <li v-for="step in view.after" :key="step.key" class="flex items-start gap-2 text-sm text-ink-700">
                    <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                    {{ step.title }}
                  </li>
                </ul>
              </div>

              <div v-if="showProgress" class="mt-5 rounded-xl bg-cream-100 p-4" data-testid="guide-progress">
                <p class="flex flex-wrap items-baseline justify-between gap-x-3 text-sm font-semibold text-ink-900">
                  <span>{{ t(`assistantGuide.progress.${tone}`, { percent }) }}</span>
                  <span v-if="countdownText" class="font-normal text-ink-500">{{ countdownText }}</span>
                </p>
                <div
                  class="mt-2 h-2 overflow-hidden rounded-full bg-cream-300"
                  role="progressbar"
                  :aria-label="t('app.assistant.plan.progressLabel')"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-valuenow="percent"
                >
                  <div
                    class="h-full w-full origin-left rounded-full bg-gold-500 transition-transform duration-500 ease-out motion-reduce:transition-none"
                    :style="{ transform: `scaleX(${percent / 100})` }"
                  />
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line px-5 py-2 sm:px-6">
          <router-link
            v-if="kind !== 'help'"
            to="/dashboard/plan"
            class="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-rose-700 underline-offset-4 hover:underline"
            data-testid="guide-see-all"
            @click="emit('go')"
          >
            {{ t('assistantGuide.seeAll') }}
            <ArrowRight class="h-4 w-4" aria-hidden="true" />
          </router-link>
          <button
            type="button"
            class="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-700 underline-offset-4 hover:text-ink-900 hover:underline"
            data-testid="guide-help"
            @click="emit('help')"
          >
            <LifeBuoy class="h-4 w-4" aria-hidden="true" />
            {{ t('assistantGuide.help') }}
          </button>
          <button
            v-if="kind !== 'help'"
            type="button"
            class="inline-flex min-h-11 items-center text-sm text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
            data-testid="guide-hide"
            @click="emit('hide')"
          >
            {{ t('assistantGuide.hideToday') }}
          </button>
        </div>
        <div class="pb-[env(safe-area-inset-bottom,0px)]" />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.guide-spark {
  animation: guide-pop 700ms cubic-bezier(0.23, 1, 0.32, 1) both;
}
@keyframes guide-pop {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }
  60% {
    opacity: 1;
    transform: scale(1.08);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .guide-spark {
    animation: none;
  }
}
</style>
