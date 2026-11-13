<script setup>
import { computed, ref } from 'vue'
import { Music } from 'lucide-vue-next'
import { hasRealThumbnail } from '@/modules/suggested-music/utils/music'

const props = defineProps({
  src: { type: String, default: '' },
  /** Tailwind size classes, e.g. "h-14 w-14". */
  size: { type: String, default: 'h-14 w-14' }
})

const failed = ref(false)
const showImage = computed(() => hasRealThumbnail(props.src) && !failed.value)
</script>

<template>
  <img
    v-if="showImage"
    :src="src"
    alt=""
    loading="lazy"
    :class="['shrink-0 rounded-lg bg-cream-200 object-cover', size]"
    @error="failed = true"
  />
  <span v-else :class="['flex shrink-0 items-center justify-center rounded-lg bg-cream-200 text-ink-500', size]">
    <Music class="h-1/2 w-1/2" aria-hidden="true" />
  </span>
</template>
