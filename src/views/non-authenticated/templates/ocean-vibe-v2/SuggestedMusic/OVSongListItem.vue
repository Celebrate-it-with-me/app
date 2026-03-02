<script setup>
import { computed } from 'vue'
import { Play, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-vue-next'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { useSuggestedMusicPublicStore } from '@/stores/publicEvents/useSuggestedMusicPublicStore'

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
const suggestedMusicPublicStore = useSuggestedMusicPublicStore()

const userVote = computed(() => suggestedMusicPublicStore.userVotes[props.song.id] || null)

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
    class="group relative mt-2 overflow-hidden rounded-xl border border-[#7FB9C9]/30 bg-white/75 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgb(7,26,42,0.15)] hover:border-[#2F6F8F]/40 hover:-translate-y-0.5"
  >
    <!-- Content -->
    <div class="relative flex items-center gap-3 px-4 py-2">
      <!-- Thumbnail -->
      <img
        :src="song.thumbnailUrl || 'https://via.placeholder.com/64'"
        alt="Album Art"
        class="h-12 w-12 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-black/5"
      />

      <!-- Title / Artist -->
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-[#123B5A]">
          {{ song.title }}
        </p>

        <p class="truncate text-xs text-[#2F6F8F]">
          {{ artistLine }}
        </p>

        <!-- Suggested by (optional, compact) -->
        <p v-if="song.suggestedBy?.name" class="mt-1 text-[11px] text-slate-500">
          Suggested by <span class="font-medium text-[#2F6F8F]">{{ song.suggestedBy.name }}</span>
        </p>

        <!-- Votes row -->
        <div v-if="useVoteSystem" class="mt-1 flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border border-[#7FB9C9]/30 transition active:scale-[0.95]"
            :class="[
              userVote === 'up'
                ? 'bg-[#123B5A] text-white'
                : 'bg-white/50 text-[#123B5A] hover:bg-[#7FB9C9]/10'
            ]"
            title="Upvote"
            :disabled="!templateStore.guest?.accessCode"
            @click="onVote('up')"
          >
            <ThumbsUp class="h-3.5 w-3.5" :class="{ 'fill-current': userVote === 'up' }" />
            <span class="tabular-nums font-medium">{{ song.votes?.up ?? 0 }}</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border border-[#7FB9C9]/30 transition active:scale-[0.95]"
            :class="[
              userVote === 'down'
                ? 'bg-[#2F6F8F] text-white'
                : 'bg-white/50 text-[#2F6F8F] hover:bg-[#7FB9C9]/10'
            ]"
            title="Downvote"
            :disabled="!templateStore.guest?.accessCode"
            @click="onVote('down')"
          >
            <ThumbsDown class="h-3.5 w-3.5" :class="{ 'fill-current': userVote === 'down' }" />
            <span class="tabular-nums font-medium">{{ song.votes?.down ?? 0 }}</span>
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- Play -->
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] text-white shadow-sm transition hover:scale-110 active:scale-95"
          title="Play"
          @click="onPlay"
        >
          <Play class="h-5 w-5 fill-current" />
        </button>

        <!-- Remove (only if same guest) -->
        <button
          v-if="canRemove"
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#2F6F8F]/30 text-[#123B5A] transition hover:bg-red-50 hover:text-[#8B1E2D] hover:border-[#8B1E2D]/30 active:scale-95"
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
