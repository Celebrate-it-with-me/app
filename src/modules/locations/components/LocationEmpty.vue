<script setup>
import { MapPin, Plus } from 'lucide-vue-next'

defineProps({
  title: { type: String, required: true },
  text: { type: String, required: true },
  action: { type: String, required: true },
  canEdit: { type: Boolean, default: false }
})
defineEmits(['add'])
</script>

<template>
  <div class="flex flex-wrap items-center gap-3.5 rounded-[14px] border-[1.5px] border-dashed border-cream-300 bg-white/50 px-[18px] py-3.5 md:flex-nowrap" data-testid="location-empty">
    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
      <MapPin class="h-5 w-5" aria-hidden="true" />
    </span>
    <div class="min-w-0 flex-1 basis-40">
      <p class="text-base font-semibold text-ink-900">{{ title }}</p>
      <p class="text-sm text-ink-500">{{ text }}</p>
    </div>
    <button
      v-if="canEdit"
      type="button"
      class="relative inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-white px-3.5 text-[13px] font-semibold text-ink-900 transition-colors touch-target hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 max-md:w-full"
      data-testid="location-empty-add"
      @click="$emit('add')"
    >
      <Plus class="h-4 w-4" aria-hidden="true" />
      {{ action }}
    </button>
  </div>
</template>
