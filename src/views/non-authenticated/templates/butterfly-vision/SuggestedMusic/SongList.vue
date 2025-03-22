<script setup>
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import SongListItem from '@/views/non-authenticated/templates/butterfly-vision/SuggestedMusic/SongListItem.vue'

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
  },
  event: {
    type: Object,
    required: true
  }
})

const songsStore = useSuggestedMusicStore()

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
        @refresh-songs-list=""
      />
    </ul>
  </div>
</template>

<style scoped>

</style>
