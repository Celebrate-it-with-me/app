<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Eye, ExternalLink, Heart, MoreHorizontal, Play, Star, Trash2 } from 'lucide-vue-next'
import { UiDropdown } from '@/ui'
import SongCover from '@/modules/suggested-music/components/SongCover.vue'
import { formatNetScore, getDownVotes, getNetScore, getUpVotes, isTopVoted } from '@/modules/suggested-music/utils/music'

const props = defineProps({
  song: { type: Object, required: true },
  /** 1-based place in the list as it is shown now (the order the organizer chose). */
  position: { type: Number, default: 0 }
})

const emit = defineEmits(['play', 'details', 'remove'])
const { t } = useI18n()

const net = computed(() => getNetScore(props.song))
const voteTone = computed(() => (net.value > 0 ? 'bg-success-50 text-success-700' : net.value < 0 ? 'bg-danger-50 text-danger-700' : 'bg-cream-100 text-ink-700'))
const isOrganizer = computed(() => Boolean(props.song.suggestedBy?.isOrganizer))
const author = computed(() => props.song.suggestedBy?.name || t('app.music.list.unknown'))
// The Spotify track id is what the player already embeds: the same id opens the song in Spotify.
const spotifyUrl = computed(() => (props.song.platformId ? `https://open.spotify.com/track/${encodeURIComponent(props.song.platformId)}` : ''))

const items = computed(() => {
  const list = [{ label: t('app.music.list.play'), icon: Play, onSelect: () => emit('play', props.song) }]
  if (spotifyUrl.value) list.push({ label: t('app.music.list.openSpotify'), icon: ExternalLink, onSelect: () => window.open(spotifyUrl.value, '_blank', 'noopener') })
  list.push(
    { label: t('app.music.list.details'), icon: Eye, onSelect: () => emit('details', props.song) },
    { label: t('app.music.list.remove'), icon: Trash2, danger: true, separator: true, onSelect: () => emit('remove', props.song.id) }
  )
  return list
})
</script>

<template>
  <li class="border-t border-black/[.06] transition-colors duration-150 first:border-t-0 hover:bg-cream-50" data-testid="song-row">
    <!-- Phones: cover, text, votes, menu. From md: position, cover, text, votes, play, menu. The right column stays free for the assistant button (fab-safe). -->
    <div
      class="fab-safe grid grid-cols-[44px_minmax(0,1fr)_auto_36px] items-center gap-2.5 py-2.5 pl-3 max-[359px]:grid-cols-[minmax(0,1fr)_auto_36px] md:grid-cols-[28px_52px_minmax(0,1fr)_auto_40px_40px] md:gap-3 md:pl-3.5 lg:pr-3.5"
    >
      <span class="hidden text-center text-[13px] tabular-nums text-ink-500 md:block" data-testid="song-position">{{ position }}</span>

      <div class="relative max-[359px]:hidden">
        <SongCover :src="props.song.thumbnailUrl" size="h-11 w-11 md:h-[52px] md:w-[52px]" />
        <!-- Phones: the cover plays the song. -->
        <button
          type="button"
          class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/25 text-white focus-visible:outline-2 focus-visible:outline-rose-600 md:hidden"
          :aria-label="t('app.music.list.play')"
          data-testid="song-cover-play"
          @click="emit('play', props.song)"
        >
          <Play class="h-4 w-4" fill="currentColor" aria-hidden="true" />
        </button>
      </div>

      <div class="min-w-0">
        <p class="flex min-w-0 items-center gap-1.5">
          <span class="truncate text-[15px] font-semibold leading-tight text-ink-900" data-testid="song-title">{{ props.song.title }}</span>
          <span
            v-if="isTopVoted(props.song)"
            class="hidden shrink-0 rounded-full bg-gold-100 px-[7px] py-px text-[11px] font-semibold text-gold-700 md:inline"
            data-testid="song-top-chip"
          >{{ t('app.music.list.topVoted') }}</span>
          <Star
            v-if="isTopVoted(props.song)"
            class="h-3.5 w-3.5 shrink-0 text-gold-500 md:hidden"
            fill="currentColor"
            role="img"
            :aria-label="t('app.music.list.topVoted')"
            data-testid="song-top-star"
          />
        </p>
        <p class="truncate text-[13px] leading-tight text-ink-500">{{ props.song.artist }} · {{ props.song.album }}</p>
        <p class="flex min-w-0 items-center gap-1.5 text-xs leading-tight text-ink-500">
          <span class="truncate">
            <span class="hidden md:inline">{{ t('app.music.list.suggestedBy', { name: author }) }}</span>
            <span class="md:hidden">{{ t('app.music.list.by', { name: author }) }}</span>
          </span>
          <span
            :class="['shrink-0 rounded-full px-[7px] py-px text-[11px] font-semibold', isOrganizer ? 'bg-rose-50 text-rose-700' : 'bg-cream-100 text-ink-700']"
            data-testid="song-origin"
          >{{ isOrganizer ? t('app.music.list.you') : t('app.music.list.guest') }}</span>
        </p>
      </div>

      <button
        type="button"
        :class="['inline-flex h-[30px] items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-rose-600', voteTone]"
        :aria-label="t('app.music.list.votesOf', { title: props.song.title, up: getUpVotes(props.song), down: getDownVotes(props.song) })"
        data-testid="song-votes"
        @click="emit('details', props.song)"
      >
        <Heart class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
        {{ formatNetScore(net) }}
      </button>

      <button
        type="button"
        class="hidden h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white transition-colors hover:bg-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 md:flex"
        :aria-label="t('app.music.list.play')"
        data-testid="song-play"
        @click="emit('play', props.song)"
      >
        <Play class="h-4 w-4" fill="currentColor" aria-hidden="true" />
      </button>

      <UiDropdown :items="items">
        <template #trigger>
          <button
            type="button"
            class="touch-target relative flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-rose-600 md:h-10 md:w-10"
            :aria-label="t('app.music.list.menu', { title: props.song.title })"
            data-testid="song-menu"
          >
            <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
          </button>
        </template>
      </UiDropdown>
    </div>
  </li>
</template>
