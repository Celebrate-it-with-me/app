<script setup>
import { useSongsStore } from '@/stores/useSongsStore'
import { computed } from 'vue'
import SongsService from '@/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useTemplateStore } from '@/stores/useTemplateStore'

const emit = defineEmits(['refreshSongsList'])
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
    validator: (value) => ['creator', 'normal'].includes(value)
  }
})

const songsStore = useSongsStore()
const notification = useNotificationStore()
const templateStore = useTemplateStore()

const mainColorComputed = computed(() => {
  if (!props.mainColor) {
    return {backgroundColor: 'transparent' }
  }

  return {backgroundColor: props.mainColor}
});

const removeSong = async (song) => {
  try {
    const response = await SongsService.deleteSong(templateStore.event?.id, song.id)

    if (response.status === 200) {
      songsStore.removeSong(song.id)
      notification.addNotification({
        message: "Song removed successfully!"
      })
      // Todo we need to move the songLists to the store
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
    class="relative rounded-xl flex justify-between items-center mt-2 space-x-6 transition hover:bg-gray-700"
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


    <iframe
      v-if="song.platformId"
      :src="`https://open.spotify.com/embed/track/${song.platformId}`"
      width="100%"
      height="80"
      class="rounded-md"
      allowtransparency="true"
      allow="encrypted-media"
    ></iframe>


    <div
      class="remove-button"
      v-if="song.suggestedBy === templateStore.guest.id"
    >
      <button
        @click="removeSong(song)"
        class="rounded-full bg-transparent text-red-500 hover:text-red-700"
        title="Remove song"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>


  </li>
</template>

<style scoped>
.remove-button {
  display: none;
  position: absolute;
  top: -15px;
  right: -20px;
}

li:hover .remove-button {
  display: block;
}

</style>
