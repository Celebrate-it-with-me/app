<script setup>
import { useI18n } from 'vue-i18n'
import { Plus, Search } from 'lucide-vue-next'
import { UiCard, UiInput, UiButton } from '@/ui'
import SongCover from '@/modules/suggested-music/components/SongCover.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  searchResults: { type: Array, default: () => [] },
  searching: { type: Boolean, default: false }
})

const emit = defineEmits(['update:searchQuery', 'search', 'add'])
const { t } = useI18n()

const onInput = value => {
  emit('update:searchQuery', value)
  emit('search')
}
</script>

<template>
  <UiCard :title="t('app.music.search.title')" :subtitle="t('app.music.search.subtitle')" heading-level="h2">
    <UiInput
      :model-value="props.searchQuery"
      type="search"
      :aria-label="t('app.music.search.title')"
      :placeholder="t('app.music.search.placeholder')"
      autocomplete="off"
      @update:model-value="onInput"
    >
      <template #leading><Search class="h-4 w-4" aria-hidden="true" /></template>
    </UiInput>

    <ul v-if="props.searchResults.length" class="mt-3 max-h-96 divide-y divide-line overflow-y-auto rounded-lg border border-line">
      <li
        v-for="(song, index) in props.searchResults"
        :key="song.platformId || index"
        class="flex items-center gap-3 p-3"
      >
        <SongCover :src="song.thumbnailUrl" size="h-12 w-12" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-base font-medium text-ink-900">{{ song.title }}</p>
          <p class="truncate text-sm text-ink-500">{{ song.artist }} · {{ song.album }}</p>
        </div>
        <UiButton size="sm" :aria-label="t('app.music.search.addNamed', { title: song.title })" @click="emit('add', song)">
          <Plus class="h-4 w-4" aria-hidden="true" />
          <span class="hidden sm:inline">{{ t('app.music.search.add') }}</span>
        </UiButton>
      </li>
    </ul>

    <p v-else class="mt-3 text-sm text-ink-500" aria-live="polite">
      <template v-if="props.searching">{{ t('app.music.search.searching') }}</template>
      <template v-else-if="props.searchQuery.trim()">{{ t('app.music.search.keepTyping') }}</template>
      <template v-else>{{ t('app.music.search.hint') }}</template>
    </p>
  </UiCard>
</template>
