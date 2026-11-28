<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Music, Search } from 'lucide-vue-next'
import { UiInput, UiSelect, UiTabs, UiEmptyState } from '@/ui'
import SuggestedMusicSongItem from '@/modules/suggested-music/components/SuggestedMusicSongItem.vue'
import { FILTER_OPTIONS, SORT_OPTIONS } from '@/modules/suggested-music/utils/music'

const props = defineProps({
  hasSongs: { type: Boolean, default: false },
  songs: { type: Array, default: () => [] },
  localSearch: { type: String, default: '' },
  sortBy: { type: String, default: 'recent' },
  filterBy: { type: String, default: 'all' }
})

const emit = defineEmits(['update:localSearch', 'update:sortBy', 'update:filterBy', 'play', 'details', 'remove'])
const { t } = useI18n()

const sortOptions = computed(() => SORT_OPTIONS.map(value => ({ value, label: t(`app.music.sort.${value}`) })))
const filterTabs = computed(() => FILTER_OPTIONS.map(value => ({ value, label: t(`app.music.filter.${value}`), shortLabel: t(`app.music.filterShort.${value}`) })))
</script>

<template>
  <section aria-labelledby="music-list-title">
    <div class="flex items-baseline gap-2">
      <h2 id="music-list-title" class="font-heading text-xl text-ink-900">{{ t('app.music.list.title') }}</h2>
      <span class="text-sm text-ink-500">({{ props.songs.length }})</span>
    </div>

    <!-- The filters keep the assistant button's column free on phones (fab-safe); the 4 short tabs still fit in what is left. -->
    <div class="fab-safe">
    <div class="mt-3 grid gap-3 sm:grid-cols-[1fr_14rem]">
      <UiInput
        :model-value="props.localSearch"
        type="search"
        :aria-label="t('app.music.list.searchLabel')"
        :placeholder="t('app.music.list.searchPlaceholder')"
        @update:model-value="val => emit('update:localSearch', val)"
      >
        <template #leading><Search class="h-4 w-4" aria-hidden="true" /></template>
      </UiInput>
      <UiSelect
        :model-value="props.sortBy"
        :options="sortOptions"
        :aria-label="t('app.music.list.sortLabel')"
        @update:model-value="val => emit('update:sortBy', val)"
      />
    </div>

    <UiTabs class="mt-3" compact :model-value="props.filterBy" :tabs="filterTabs" @update:model-value="val => emit('update:filterBy', val)" />
    </div>

    <UiEmptyState
      v-if="props.songs.length === 0"
      class="mt-4"
      :title="t('app.music.list.emptyTitle')"
      :description="props.hasSongs ? t('app.music.list.emptyFiltered') : t('app.music.list.emptyText')"
    >
      <template #icon><Music class="h-6 w-6" aria-hidden="true" /></template>
    </UiEmptyState>

    <ul v-else class="mt-3 overflow-hidden rounded-xl border border-line bg-white shadow-card" data-testid="song-list">
      <SuggestedMusicSongItem
        v-for="(song, index) in props.songs"
        :key="song.id"
        :song="song"
        :position="index + 1"
        @play="emit('play', $event)"
        @details="emit('details', $event)"
        @remove="emit('remove', $event)"
      />
    </ul>
  </section>
</template>
