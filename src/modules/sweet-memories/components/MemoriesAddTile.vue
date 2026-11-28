<script setup>
import { Plus } from 'lucide-vue-next'

defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' },
  cta: { type: String, default: '' },
  large: { type: Boolean, default: false }
})
defineEmits(['add'])
</script>

<template>
  <button
    type="button"
    class="flex w-full flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-line-strong bg-white/50 px-4 text-center text-sm font-semibold text-ink-500 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-rose-600"
    :class="large ? 'min-h-[260px] py-10' : 'min-h-[150px] md:min-h-[200px]'"
    @click="$emit('add')"
  >
    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
      <Plus class="h-5 w-5" aria-hidden="true" />
    </span>
    <span :class="large ? 'text-base text-ink-900' : ''">{{ title }}</span>
    <span v-if="text" class="max-w-md text-xs font-normal" :class="large ? 'text-sm' : ''">{{ text }}</span>
    <span v-if="cta" class="mt-2 inline-flex h-11 items-center rounded-full bg-rose-600 px-5 text-sm font-semibold text-white">{{ cta }}</span>
  </button>
</template>
