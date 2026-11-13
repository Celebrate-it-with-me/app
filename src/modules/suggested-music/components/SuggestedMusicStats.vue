<script setup>
import { useI18n } from 'vue-i18n'
import { Heart, Music, TrendingUp, Users } from 'lucide-vue-next'
import { UiStat } from '@/ui'

defineProps({
  totalSongs: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  topSong: { type: Object, default: null },
  guestSuggested: { type: Number, default: 0 }
})

const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <UiStat :label="t('app.music.stats.songs')" :value="totalSongs" tone="rose">
      <template #icon><Music class="h-5 w-5" aria-hidden="true" /></template>
    </UiStat>
    <UiStat :label="t('app.music.stats.votes')" :value="totalVotes" tone="gold">
      <template #icon><Heart class="h-5 w-5" aria-hidden="true" /></template>
    </UiStat>
    <UiStat
      :label="t('app.music.stats.top')"
      :value="topSong?.title || t('app.music.stats.noTop')"
      :hint="topSong?.artist || ''"
      tone="success"
      class="[&_.font-heading]:truncate [&_.font-heading]:text-lg"
    >
      <template #icon><TrendingUp class="h-5 w-5" aria-hidden="true" /></template>
    </UiStat>
    <UiStat :label="t('app.music.stats.guests')" :value="guestSuggested">
      <template #icon><Users class="h-5 w-5" aria-hidden="true" /></template>
    </UiStat>
  </div>
</template>
