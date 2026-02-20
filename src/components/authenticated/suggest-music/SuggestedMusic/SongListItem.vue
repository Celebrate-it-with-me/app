<script setup>
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import { computed } from 'vue'
import SongsService from '@/modules/suggested-music/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const props = defineProps({
  mainColor: {
    type: String,
    required: true
  },
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

const songsStore = useSuggestedMusicStore()
const eventStore = useEventsStore()
const notification = useNotificationStore()

const mainColorComputed = computed(() => {
  if (!props.mainColor) {
    return { backgroundColor: 'transparent' }
  }

  return { backgroundColor: props.mainColor }
})

const removeSong = async song => {
  try {
    const response = await SongsService.deleteSong(eventStore.currentEvent.id, song.id)

    if (response.status === 200) {
      songsStore.removeSong(song.id)
      notification.addNotification({
        message: 'Song removed successfully!'
      })
    } else {
      notification.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }
  } catch (e) {
    console.log(e)
  }
}
</script>

<template>
  <li
    class="rounded-xl flex justify-between items-center mt-2 space-x-6 transition hover:bg-gray-700"
    :style="mainColorComputed"
  >
    <template v-if="!usePreview">
      <img
        :src="song.thumbnailUrl || 'https://via.placeholder.com/64'"
        alt="Album Art"
        class="w-16 h-16 rounded-md object-cover"
      />

      <div class="flex-1">
        <h3 class="text-md font-medium text-white">{{ song.title }}</h3>
        <p class="text-sm text-gray-400">
          {{ song.artist }} <span v-if="song.album">- {{ song.album }}</span>
        </p>
      </div>
    </template>

    <iframe
      v-if="usePreview && song.platformId"
      :src="`https://open.spotify.com/embed/track/${song.platformId}`"
      width="100%"
      height="80"
      class="rounded-md"
      allowtransparency="true"
      allow="encrypted-media"
    ></iframe>
  </li>
</template>

<style scoped></style>
