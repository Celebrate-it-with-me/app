<script setup>
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { cx } from './utils'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  /** Makes the row a link. */
  to: { type: [String, Object], default: null },
  /** Makes the row a button (emits `click`). */
  clickable: { type: Boolean, default: false },
  chevron: { type: Boolean, default: false }
})
defineEmits(['click'])

const tag = computed(() => (props.to ? 'router-link' : props.clickable ? 'button' : 'div'))
const interactive = computed(() => Boolean(props.to || props.clickable))
</script>

<template>
  <component
    :is="tag"
    :to="to || undefined"
    :type="tag === 'button' ? 'button' : undefined"
    :class="
      cx(
        'flex w-full items-center gap-3 px-4 py-3 text-left',
        interactive && 'transition-colors hover:bg-cream-100 active:bg-cream-200'
      )
    "
    @click="clickable && $emit('click', $event)"
  >
    <div v-if="$slots.leading" class="shrink-0"><slot name="leading" /></div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-base font-medium text-ink-900">{{ title }}</p>
      <p v-if="subtitle" class="truncate text-sm text-ink-500">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.trailing" class="flex shrink-0 items-center gap-2"><slot name="trailing" /></div>
    <ChevronRight v-if="chevron" class="h-5 w-5 shrink-0 text-ink-300" aria-hidden="true" />
  </component>
</template>
