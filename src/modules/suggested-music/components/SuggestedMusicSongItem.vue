<script setup>
import { useI18n } from 'vue-i18n'
import { ArrowDown, ArrowUp, Eye, Flame, Play, Trash2 } from 'lucide-vue-next'
import { UiBadge, UiButton } from '@/ui'
import SongCover from '@/modules/suggested-music/components/SongCover.vue'
import { formatNetScore, getDownVotes, getNetScore, getUpVotes, isTopVoted, netTone } from '@/modules/suggested-music/utils/music'

const props = defineProps({
  song: { type: Object, required: true }
})

const emit = defineEmits(['play', 'details', 'remove'])
const { t } = useI18n()
</script>

<template>
  <li class="rounded-xl border border-line bg-white p-3 shadow-soft sm:p-4">
    <div class="flex items-start gap-3">
      <SongCover :src="props.song.thumbnailUrl" size="h-14 w-14 sm:h-16 sm:w-16" />

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 class="min-w-0 truncate text-base font-medium text-ink-900">{{ props.song.title }}</h3>
          <UiBadge v-if="isTopVoted(props.song)" tone="gold" size="sm">
            <Flame class="h-3 w-3" aria-hidden="true" />
            {{ t('app.music.list.topVoted') }}
          </UiBadge>
        </div>
        <p class="truncate text-sm text-ink-500">{{ props.song.artist }} · {{ props.song.album }}</p>
        <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-700">
          <span class="min-w-0 truncate">{{ t('app.music.list.suggestedBy', { name: props.song.suggestedBy?.name || t('app.music.list.unknown') }) }}</span>
          <UiBadge :tone="props.song.suggestedBy?.isOrganizer ? 'rose' : 'neutral'" size="sm">
            {{ props.song.suggestedBy?.isOrganizer ? t('app.music.list.organizer') : t('app.music.list.guest') }}
          </UiBadge>
        </p>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
      <div class="flex flex-wrap items-center gap-2 text-sm text-ink-900">
        <span class="inline-flex items-center gap-1" :aria-label="t('app.music.list.upVotes', { n: getUpVotes(props.song) })">
          <ArrowUp class="h-4 w-4 text-success" aria-hidden="true" />
          {{ getUpVotes(props.song) }}
        </span>
        <span class="inline-flex items-center gap-1" :aria-label="t('app.music.list.downVotes', { n: getDownVotes(props.song) })">
          <ArrowDown class="h-4 w-4 text-danger" aria-hidden="true" />
          {{ getDownVotes(props.song) }}
        </span>
        <UiBadge :tone="netTone(getNetScore(props.song))" size="sm">
          {{ t('app.music.list.net', { n: formatNetScore(getNetScore(props.song)) }) }}
        </UiBadge>
      </div>

      <div class="flex items-center gap-1">
        <UiButton variant="ghost" size="sm" icon :aria-label="t('app.music.list.play')" @click="emit('play', props.song)">
          <Play class="h-5 w-5" aria-hidden="true" />
        </UiButton>
        <UiButton variant="ghost" size="sm" icon :aria-label="t('app.music.list.details')" @click="emit('details', props.song)">
          <Eye class="h-5 w-5" aria-hidden="true" />
        </UiButton>
        <UiButton variant="ghost" size="sm" icon class="text-danger" :aria-label="t('app.music.list.remove')" @click="emit('remove', props.song.id)">
          <Trash2 class="h-5 w-5" aria-hidden="true" />
        </UiButton>
      </div>
    </div>
  </li>
</template>
