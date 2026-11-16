<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import { pick } from '../utils/editorFields'

const props = defineProps({
  group: { type: Object, required: true },
  open: { type: Boolean, default: false },
  /** How many fields have a problem to fix: the person should see it without opening the group. */
  problems: { type: Number, default: 0 }
})
const { t, locale } = useI18n()
const title = computed(() => pick(props.group.label, locale.value))
</script>

<template>
  <!-- Native <details>: keyboard, focus and screen readers for free. -->
  <details class="group rounded-xl border border-line bg-white" :open="open" :data-group="group.id">
    <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-lg font-semibold text-ink-900 focus-visible:outline-2 focus-visible:outline-rose-600 [&::-webkit-details-marker]:hidden">
      <span class="font-heading text-xl">{{ title }}</span>
      <span class="flex items-center gap-2">
        <span v-if="problems" class="rounded-full bg-danger-50 px-2 py-0.5 text-xs font-semibold text-danger-700">{{ t('invitationEditor.group.problems') }}</span>
        <ChevronDown class="h-5 w-5 shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </span>
    </summary>
    <div class="flex flex-col gap-6 border-t border-line px-4 py-5">
      <slot />
    </div>
  </details>
</template>
