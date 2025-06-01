<script setup>
import { onMounted, ref } from 'vue'
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import SongSearchInput from '@/components/authenticated/suggest-music/SuggestedMusic/SongSearchInput.vue'
import SongList from '@/components/authenticated/suggest-music/SuggestedMusic/SongList.vue'
import { useUserStore } from '@/stores/useUserStore'

defineProps({
  mode: {
    type: String,
    default: 'normal',
    validator: value => ['normal', 'creator'].includes(value)
  }
})

const suggestedMusicStore = useSuggestedMusicStore()
const userStore = useUserStore()
const loading = ref(false)
const notification = useNotificationStore()

onMounted(() => {
  getSuggestedSongs()
})

const getSuggestedSongs = async () => {
  try {
    loading.value = true

    const response = await suggestedMusicStore.getSuggestedSongs(userStore.currentEventId)

    if (response.status === 200) {
      suggestedMusicStore.selectedSongs = response?.data?.data ?? []
      notification.addNotification({
        type: 'success',
        message: 'Suggested music loaded successfully!'
      })
    } else {
      notification.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }
  } catch (e) {
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
    <h1 class="text-2xl font-semibold mt-5">{{ suggestedMusicStore.config.title }}</h1>
    <h4 class="text-md font-extralight">{{ suggestedMusicStore.config.subTitle }}</h4>

    <SongSearchInput
      :main-color="suggestedMusicStore.config.mainColor"
      :secondary-color="suggestedMusicStore.config.secondaryColor"
      :mode="mode"
    />

    <SongList
      :mode="mode"
      :main-color="suggestedMusicStore.config.mainColor"
      :use-preview="suggestedMusicStore.config.usePreview"
      :use-vote-system="suggestedMusicStore.config.useVoteSystem"
    />
  </div>
</template>

<style scoped></style>
