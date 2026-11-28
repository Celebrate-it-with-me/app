<script setup>
import { useI18n } from 'vue-i18n'
import { Heart, Music, TrendingUp, Users } from 'lucide-vue-next'

defineProps({
  totalSongs: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  topSong: { type: Object, default: null },
  guestSuggested: { type: Number, default: 0 }
})

const { t } = useI18n()

// Phones: two columns of small cards without the colored icon. From md up the same four cards in one row, as before.
const TONES = {
  rose: 'bg-rose-100 text-rose-700',
  gold: 'bg-gold-100 text-gold-700',
  success: 'bg-success-50 text-success-700',
  neutral: 'bg-cream-200 text-ink-700'
}
</script>

<template>
  <div class="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3" data-testid="music-stats">
    <div class="flex min-w-0 items-center gap-4 rounded-xl border border-line bg-white px-3 py-2.5 shadow-soft md:p-4">
      <div :class="['hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg md:flex', TONES.rose]"><Music class="h-5 w-5" aria-hidden="true" /></div>
      <div class="min-w-0">
        <p class="truncate text-[13px] text-ink-500 md:text-sm">{{ t('app.music.stats.songs') }}</p>
        <p class="truncate font-heading text-xl leading-tight text-ink-900 tabular-nums md:text-2xl">{{ totalSongs }}</p>
      </div>
    </div>
    <div class="flex min-w-0 items-center gap-4 rounded-xl border border-line bg-white px-3 py-2.5 shadow-soft md:p-4">
      <div :class="['hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg md:flex', TONES.gold]"><Heart class="h-5 w-5" aria-hidden="true" /></div>
      <div class="min-w-0">
        <p class="truncate text-[13px] text-ink-500 md:text-sm">{{ t('app.music.stats.votes') }}</p>
        <p class="truncate font-heading text-xl leading-tight text-ink-900 tabular-nums md:text-2xl">{{ totalVotes }}</p>
      </div>
    </div>
    <div class="flex min-w-0 items-center gap-4 rounded-xl border border-line bg-white px-3 py-2.5 shadow-soft md:p-4">
      <div :class="['hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg md:flex', TONES.success]"><TrendingUp class="h-5 w-5" aria-hidden="true" /></div>
      <div class="min-w-0">
        <p class="truncate text-[13px] text-ink-500 md:text-sm">{{ t('app.music.stats.top') }}</p>
        <p class="truncate font-heading text-xl leading-tight text-ink-900 md:text-lg">{{ topSong?.title || t('app.music.stats.noTop') }}</p>
        <p v-if="topSong?.artist" class="mt-0.5 hidden truncate text-xs text-ink-500 md:block">{{ topSong.artist }}</p>
      </div>
    </div>
    <div class="flex min-w-0 items-center gap-4 rounded-xl border border-line bg-white px-3 py-2.5 shadow-soft md:p-4">
      <div :class="['hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg md:flex', TONES.neutral]"><Users class="h-5 w-5" aria-hidden="true" /></div>
      <div class="min-w-0">
        <p class="truncate text-[13px] text-ink-500 md:text-sm">{{ t('app.music.stats.guests') }}</p>
        <p class="truncate font-heading text-xl leading-tight text-ink-900 tabular-nums md:text-2xl">{{ guestSuggested }}</p>
      </div>
    </div>
  </div>
</template>
