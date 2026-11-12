<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, CircleCheck } from 'lucide-vue-next'
import { UiButton } from '@/ui'

const props = defineProps({
  /** `{ id, to, count? }` from `pickNextStep`. */
  step: { type: Object, required: true },
  /** Resolved route target (the step may point at "edit event", which needs the id). */
  target: { type: [String, Object], default: null }
})

const { t } = useI18n()
const base = computed(() => `app.dashboard.next.${props.step.id}`)
const isDone = computed(() => props.step.id === 'allSet')
const title = computed(() =>
  props.step.count != null ? t(`${base.value}.title`, { n: props.step.count }, props.step.count) : t(`${base.value}.title`)
)
</script>

<template>
  <section
    class="rounded-xl border border-gold-300 bg-gold-50 p-5 sm:p-6"
    :class="isDone && 'border-line bg-white'"
    aria-labelledby="next-step-title"
  >
    <p class="text-sm font-semibold text-gold-700" :class="isDone && 'text-success-700'">
      <CircleCheck v-if="isDone" class="mr-1 inline h-4 w-4 align-[-2px]" aria-hidden="true" />
      {{ t('app.dashboard.next.label') }}
    </p>
    <h2 id="next-step-title" class="mt-1 font-heading text-2xl text-ink-900 text-balance">{{ title }}</h2>
    <p class="mt-1 max-w-xl text-base text-ink-600">{{ t(`${base}.text`) }}</p>
    <UiButton v-if="!isDone && target" :to="target" class="mt-4 w-full sm:w-auto">
      {{ t(`${base}.cta`) }}
      <ArrowRight class="h-4 w-4" aria-hidden="true" />
    </UiButton>
  </section>
</template>
