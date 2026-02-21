<script setup>
import { computed } from 'vue'
import { Play, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-vue-next'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const emit = defineEmits(['play', 'vote', 'request-delete'])

const props = defineProps({
  usePreview: {
    type: Boolean,
    required: true
  },
  song: {
    type: Object,
    required: true
  },
  useVoteSystem: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    required: true,
    validator: value => ['creator', 'normal'].includes(value)
  }
})

const templateStore = useTemplateStore()

const canRemove = computed(() => {
  const suggestedBy = props.song?.suggestedBy
  if (!suggestedBy) return false

  // Guests can only remove songs they suggested themselves
  return suggestedBy.entity === 'guest' && suggestedBy.id === templateStore.guest.id
})

const artistLine = computed(() => {
  const artist = props.song?.artist?.trim()
  const album = props.song?.album?.trim()
  if (!artist) return ''
  return album ? `${artist} — ${album}` : artist
})

const onPlay = () => {
  emit('play', props.song)
}

const onVote = direction => {
  emit('vote', { song: props.song, direction })
}

const requestDeleteSong = () => {
  emit('request-delete', props.song)
}
</script>

<template>
  <li
    class="group relative mt-2 overflow-hidden rounded-xl border border-blue-100/70 shadow-sm transition hover:shadow-md"
  >
    <!-- Soft gradient background (blue <-> red) -->
    <div class="absolute inset-0 bg-gradient-to-r from-blue-50/90 via-white to-red-50/80"></div>

    <!-- Content -->
    <div class="relative flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3">
      <!-- Thumbnail -->
      <img
        :src="song.thumbnailUrl || 'https://via.placeholder.com/64'"
        alt="Album Art"
        class="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
      />

      <!-- Title / Artist -->
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-slate-900">
          {{ song.title }}
        </p>

        <p class="truncate text-xs text-slate-600">
          {{ artistLine }}
        </p>

        <!-- Suggested by (optional, compact) -->
        <p v-if="song.suggestedBy?.name" class="mt-1 text-[11px] text-slate-500">
          Suggested by <span class="font-medium text-slate-700">{{ song.suggestedBy.name }}</span>
        </p>

        <!-- Votes row -->
        <div v-if="useVoteSystem" class="mt-2 flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100 active:scale-[0.98]"
            title="Upvote"
            @click="onVote('up')"
          >
            <ThumbsUp class="h-4 w-4" />
            <span class="tabular-nums">{{ song.votes?.up ?? 0 }}</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700 ring-1 ring-red-100 transition hover:bg-red-100 active:scale-[0.98]"
            title="Downvote"
            @click="onVote('down')"
          >
            <ThumbsDown class="h-4 w-4" />
            <span class="tabular-nums">{{ song.votes?.down ?? 0 }}</span>
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- Play -->
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/70 text-slate-700 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900 active:scale-[0.98]"
          title="Play"
          @click="onPlay"
        >
          <Play class="h-5 w-5" />
        </button>

        <!-- Remove (only if same guest) -->
        <button
          v-if="canRemove"
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/70 text-red-600 ring-1 ring-red-200 transition hover:bg-white hover:text-red-700 active:scale-[0.98]"
          title="Remove"
          @click="requestDeleteSong"
        >
          <Trash2 class="h-5 w-5" />
        </button>
      </div>
    </div>
  </li>
</template>

<style scoped></style>
