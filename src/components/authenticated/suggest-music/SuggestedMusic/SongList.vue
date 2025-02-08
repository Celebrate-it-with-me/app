<script setup>
import { useSongsStore } from '@/stores/useSongsStore'
import SongListItem from '@/components/authenticated/suggest-music/SuggestedMusic/SongListItem.vue'

defineProps({
  mainColor: {
    type: String,
    required: true
  },
  usePreview: {
    type: Boolean,
    required: true
  },
  useVoteSystem: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    required: true,
    validator: (value) => ['creator', 'normal'].includes(value)
  }
})

const songsStore = useSongsStore()


</script>

<template>
  <div v-if="songsStore.selectedSongs.length > 0" class="mt-2 w-[90%]">
    <ul>
      <SongListItem
        v-for="song in songsStore.selectedSongs"
        :key="song.id"
        :main-color="mainColor"
        :use-preview="usePreview"
        :useVoteSystem="useVoteSystem"
        :song="song"
        :mode="mode"
      />
    </ul>
  </div>
</template>

<style scoped>

</style>
