<script setup>
import { computed } from 'vue'
import { Play, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-vue-next'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const emit = defineEmits(['play', 'vote', 'request-delete'])

const props = defineProps({
  usePreview: { type: Boolean, required: true },
  song: { type: Object, required: true },
  useVoteSystem: { type: Boolean, required: true },
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
  return suggestedBy.entity === 'guest' && suggestedBy.id === templateStore.guest.id
})

const artistLine = computed(() => {
  const artist = props.song?.artist?.trim()
  const album = props.song?.album?.trim()
  if (!artist) return ''
  return album ? `${artist} — ${album}` : artist
})

const onPlay = () => emit('play', props.song)
const onVote = direction => emit('vote', { song: props.song, direction })
const requestDeleteSong = () => emit('request-delete', props.song)
</script>

<template>
  <li class="hn-song group relative mt-4 w-full overflow-hidden rounded-2xl">
    <!-- Base glass -->
    <div class="absolute inset-0 hn-layer hn-song-bg"></div>

    <!-- Glow -->
    <div class="absolute inset-0 hn-layer hn-song-glow"></div>

    <!-- Border -->
    <div class="absolute inset-0 hn-layer hn-song-border"></div>

    <!-- Content -->
    <div class="relative flex items-center gap-4 px-4 py-4">
      <!-- Thumbnail -->
      <img
        :src="song.thumbnailUrl || 'https://via.placeholder.com/64'"
        alt=""
        class="hn-thumb h-14 w-14 shrink-0 rounded-xl object-cover"
      />

      <!-- Info -->
      <div class="min-w-0 flex-1">
        <p class="hn-title truncate">
          {{ song.title }}
        </p>

        <p class="hn-sub truncate">
          {{ artistLine }}
        </p>

        <p v-if="song.suggestedBy?.name" class="hn-byline mt-1 truncate">
          Suggested by
          <span class="hn-byline-strong">{{ song.suggestedBy.name }}</span>
        </p>

        <!-- Votes -->
        <div v-if="useVoteSystem" class="mt-3 flex gap-2">
          <button class="hn-chip" @click="onVote('up')">
            <ThumbsUp class="h-4 w-4" />
            <span class="hn-chip-num">{{ song.votes?.up ?? 0 }}</span>
          </button>

          <button class="hn-chip hn-chip--muted" @click="onVote('down')">
            <ThumbsDown class="h-4 w-4" />
            <span class="hn-chip-num">{{ song.votes?.down ?? 0 }}</span>
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button class="hn-icon-btn" @click="onPlay">
          <Play class="h-5 w-5" />
        </button>

        <button v-if="canRemove" class="hn-icon-btn hn-icon-btn--danger" @click="requestDeleteSong">
          <Trash2 class="h-5 w-5" />
        </button>
      </div>
    </div>
  </li>
</template>

<style scoped>
.hn-song {
  font-family: 'Montserrat', sans-serif;
}

/* Make all overlay layers inherit the same radius */
.hn-layer {
  border-radius: inherit;
}

/* Glass base */
.hn-song-bg {
  background: rgba(17, 24, 39, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Glow */
.hn-song-glow {
  background:
    radial-gradient(60% 80% at 20% 50%, rgba(212, 175, 55, 0.08) 0%, transparent 60%),
    radial-gradient(55% 70% at 80% 45%, rgba(232, 93, 74, 0.12) 0%, transparent 62%);
  pointer-events: none;
}

/* Border */
.hn-song-border {
  border: 1px solid rgba(212, 175, 55, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 20px 40px rgba(0, 0, 0, 0.35);
}

/* Hover */
.hn-song:hover .hn-song-border {
  border-color: rgba(212, 175, 55, 0.3);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 26px 55px rgba(0, 0, 0, 0.45);
}

/* Thumbnail */
.hn-thumb {
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.4);
}

/* Typography */
.hn-title {
  font-weight: 600;
  font-size: 1rem;
  color: #f8f1e7;
}

.hn-sub {
  font-size: 0.85rem;
  color: rgba(148, 163, 184, 0.95);
}

.hn-byline {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.75);
}

.hn-byline-strong {
  color: rgba(212, 175, 55, 0.95);
  font-weight: 600;
}

/* Chips */
.hn-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(212, 175, 55, 0.22);
  background: rgba(212, 175, 55, 0.08);
  color: rgba(212, 175, 55, 0.95);
  font-size: 0.8rem;
}

.hn-chip--muted {
  border-color: rgba(148, 163, 184, 0.22);
  background: rgba(148, 163, 184, 0.08);
  color: rgba(148, 163, 184, 0.95);
}

.hn-chip-num {
  font-weight: 700;
}

/* Icon buttons */
.hn-icon-btn {
  height: 42px;
  width: 42px;
  border-radius: 14px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(11, 18, 32, 0.35);
  color: #f8f1e7;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 160ms ease;
}

.hn-icon-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(212, 175, 55, 0.35);
}

.hn-icon-btn--danger {
  border-color: rgba(232, 93, 74, 0.28);
}
</style>
