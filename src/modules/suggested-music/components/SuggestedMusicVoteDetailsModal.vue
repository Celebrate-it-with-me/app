<script setup>
import { useI18n } from 'vue-i18n'
import { ArrowDown, ArrowUp, Users } from 'lucide-vue-next'
import { UiModal, UiButton, UiBadge, UiAvatar, UiEmptyState } from '@/ui'
import SongCover from '@/modules/suggested-music/components/SongCover.vue'
import { getDownVotes, getNetScore, getUpVotes } from '@/modules/suggested-music/utils/music'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  selectedSong: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
</script>

<template>
  <UiModal
    :open="props.modelValue"
    :title="t('app.music.details.title')"
    size="lg"
    @update:open="val => emit('update:modelValue', val)"
  >
    <div v-if="props.selectedSong" class="space-y-5">
      <div class="flex items-center gap-3">
        <SongCover :src="props.selectedSong.thumbnailUrl" size="h-16 w-16" />
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-lg font-medium text-ink-900">{{ props.selectedSong.title }}</h3>
          <p class="truncate text-sm text-ink-700">{{ props.selectedSong.artist }}</p>
          <p class="truncate text-sm text-ink-500">{{ props.selectedSong.album }}</p>
        </div>
      </div>

      <dl class="grid grid-cols-3 gap-2 text-center sm:gap-3">
        <div class="min-w-0 rounded-lg bg-success-50 p-2 sm:p-3">
          <dt class="truncate text-xs text-success-700">{{ t('app.music.details.up') }}</dt>
          <dd class="font-heading text-2xl text-success-700 tabular-nums">{{ getUpVotes(props.selectedSong) }}</dd>
        </div>
        <div class="min-w-0 rounded-lg bg-danger-50 p-2 sm:p-3">
          <dt class="truncate text-xs text-danger-700">{{ t('app.music.details.down') }}</dt>
          <dd class="font-heading text-2xl text-danger-700 tabular-nums">{{ getDownVotes(props.selectedSong) }}</dd>
        </div>
        <div class="min-w-0 rounded-lg bg-cream-200 p-2 sm:p-3">
          <dt class="truncate text-xs text-ink-700">{{ t('app.music.details.net') }}</dt>
          <dd class="font-heading text-2xl text-ink-900 tabular-nums">{{ getNetScore(props.selectedSong) }}</dd>
        </div>
      </dl>

      <section aria-labelledby="music-breakdown-title">
        <h4 id="music-breakdown-title" class="text-sm font-medium text-ink-900">{{ t('app.music.details.breakdown') }}</h4>

        <ul
          v-if="props.selectedSong.voteDetails?.length"
          class="mt-2 max-h-80 divide-y divide-line overflow-y-auto rounded-lg border border-line"
        >
          <li v-for="(vote, idx) in props.selectedSong.voteDetails" :key="idx" class="flex items-center gap-3 p-3">
            <UiAvatar :name="vote.guestName || t('app.music.details.guest')" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-ink-900">{{ vote.guestName }}</p>
              <p class="truncate text-xs text-ink-500">{{ vote.date }}</p>
            </div>
            <UiBadge :tone="vote.type === 'UP' ? 'success' : 'danger'" size="sm">
              <component :is="vote.type === 'UP' ? ArrowUp : ArrowDown" class="h-3 w-3" aria-hidden="true" />
              {{ vote.type === 'UP' ? t('app.music.details.voteUp') : t('app.music.details.voteDown') }}
            </UiBadge>
          </li>
        </ul>

        <UiEmptyState v-else compact class="mt-2" :title="t('app.music.details.noVotes')">
          <template #icon><Users class="h-6 w-6" aria-hidden="true" /></template>
        </UiEmptyState>
      </section>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <UiButton variant="secondary" @click="emit('update:modelValue', false)">{{ t('app.music.close') }}</UiButton>
      </div>
    </template>
  </UiModal>
</template>
