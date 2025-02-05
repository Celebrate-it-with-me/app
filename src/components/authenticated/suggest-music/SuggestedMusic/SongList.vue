<script setup>
import { HandThumbDownIcon, HandThumbUpIcon } from '@heroicons/vue/16/solid'
import { useSongsStore } from '@/stores/useSongsStore'
import { computed } from 'vue'
import SongsService from '@/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useEventsStore } from '@/stores/useEventsStore'

const props = defineProps({
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
  }
})

const eventStore = useEventsStore()
const songsStore = useSongsStore()
const notification = useNotificationStore()

const mainColorComputed = computed(() => {
  if (!props.mainColor) {
    return {backgroundColor: 'transparent' }
  }

  return {backgroundColor: props.mainColor}
});

const removeSong = async (song) => {
  try {
    const response = await SongsService.deleteSong(eventStore.currentEvent.id, song.id)

    if (response.status === 200) {
      songsStore.removeSong(song.id)
      notification.addNotification({
        message: "Song removed successfully!"
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
  <div v-if="songsStore.selectedSongs.length > 0" class="mt-2 w-[90%]">
    <ul>
      <li
        v-for="(song, index) in songsStore.selectedSongs"
        :key="index"
        class="p-4 rounded-md flex justify-between items-center mt-2 space-x-6 transition hover:bg-gray-700"
        :style="mainColorComputed"
      >
        <template
          v-if="!usePreview"
        >
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

        <div class="w-[450px]"
             v-if="usePreview"
        >
          <iframe
            v-if="song.platformId"
            :src="`https://open.spotify.com/embed/track/${song.platformId}`"
            width="100%"
            height="80"
            class="rounded-md"
            allowtransparency="true"
            allow="encrypted-media"
          ></iframe>
          <p v-else class="text-sm text-gray-500">No Spotify Preview Available</p>
        </div>

        <!-- Voting Buttons -->
        <div
          v-if="useVoteSystem"
          class="flex items-center space-x-4">
          <button @click="voteSong(song, 'up')" class="rounded-full">
            <HandThumbUpIcon class="h-5 w-5 text-white hover:text-green-500" />
          </button>
          <button @click="voteSong(song, 'down')" class="rounded-full">
            <HandThumbDownIcon class="h-5 w-5 text-white hover:text-red-500" />
          </button>
        </div>

        <button
          @click="removeSong(song)"
          class="rounded-full bg-transparent text-red-500 hover:text-red-700"
          title="Remove song"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

      </li>
    </ul>
  </div>
</template>

<style scoped>

</style>
