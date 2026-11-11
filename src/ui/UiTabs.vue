<script setup>
import { TabsRoot, TabsList, TabsTrigger, TabsContent, TabsIndicator } from 'reka-ui'

defineProps({
  modelValue: { type: String, default: undefined },
  /** [{ value, label, count? }] — content goes in a slot named after the value. */
  tabs: { type: Array, default: () => [] },
  /** Stretch tabs to fill the width (good for 2–3 tabs on phones). */
  fill: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <TabsRoot
    :model-value="modelValue"
    :default-value="tabs[0]?.value"
    @update:model-value="value => emit('update:modelValue', value)"
  >
    <TabsList
      class="relative flex min-w-0 gap-1 overflow-x-auto border-b border-line"
      :class="fill && '[&>button]:flex-1'"
    >
      <TabsIndicator
        class="absolute bottom-0 left-0 h-0.5 w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position) rounded-full bg-rose-600 transition-[width,translate] duration-200"
      />
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="flex items-center justify-center gap-2 whitespace-nowrap px-3 py-3 text-base font-medium text-ink-500 outline-none transition-colors hover:text-ink-900 data-[state=active]:text-ink-900 focus-visible:text-rose-600"
      >
        {{ tab.label }}
        <span
          v-if="tab.count != null"
          class="rounded-full bg-cream-200 px-2 py-0.5 text-xs font-semibold text-ink-700"
        >
          {{ tab.count }}
        </span>
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="pt-4 outline-none">
      <slot :name="tab.value" />
    </TabsContent>
  </TabsRoot>
</template>
