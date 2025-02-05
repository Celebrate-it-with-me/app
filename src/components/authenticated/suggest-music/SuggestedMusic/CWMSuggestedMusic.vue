<script setup>
import { onMounted, ref } from 'vue'
import { useSongsStore } from '@/stores/useSongsStore'
import SongsService from '@/services/SongsService'
import { useEventsStore } from '@/stores/useEventsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import SongSearchInput from '@/components/authenticated/suggest-music/SuggestedMusic/SongSearchInput.vue'
import SongList from '@/components/authenticated/suggest-music/SuggestedMusic/SongList.vue'

defineProps({
  title: {
    type: String,
    default: ''
  },
  subTitle: {
    type: String,
    default: ''
  },
  mainColor: {
    type: String,
    required: true
  },
  secondaryColor: {
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
    default: 'normal',
    validator: (value) => ['normal', 'creator'].includes(value)
  }
})

const songsStore = useSongsStore()
const eventStore = useEventsStore()
const loading = ref(false)
const notification = useNotificationStore()


onMounted(() => {
  getSuggestedSongs()
})


const getSuggestedSongs = async () => {
  try {
    loading.value = true

    const response = await SongsService.getSuggestedSongs(eventStore?.currentEvent?.id)

    if (response.status === 200) {
      songsStore.selectedSongs = response?.data?.data ?? []
    } else {
      notification.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }

  } catch(e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div
    class="event-handle w-[70%] rounded-lg border-4 border-gray-900 dark:border-gray-800 flex flex-col items-center"
  >
    <h1 class="text-2xl font-semibold mt-5">{{ title }}</h1>
    <h4 class="text-md font-extralight">{{ subTitle }}</h4>

    <SongSearchInput
      :main-color="mainColor"
      :secondary-color="secondaryColor"
      :mode="mode"
    />

    <SongList
      :main-color="mainColor"
      :use-preview="usePreview"
      :use-vote-system="useVoteSystem"
    />
  </div>
</template>

<style scoped></style>
