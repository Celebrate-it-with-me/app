<script setup>
import CWMBackgroundMusicCreator from '@/components/authenticated/background-music/BackgroundMusic/CWMBackgroundMusicCreator.vue'
import CWMBackgroundMusicShow from '@/components/authenticated/background-music/BackgroundMusic/CWMBackgroundMusicShow.vue'
import { onMounted, ref } from 'vue'
import { useBackgroundMusicStore } from '@/stores/useBackgroundMusicStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'

const loading = ref()
const userStore = useUserStore()
const backgroundMusicStore = useBackgroundMusicStore()
const notificationStore = useNotificationStore()

onMounted(() => {
  loadBackgroundMusic()
})

const loadBackgroundMusic = async () => {
  try {
    loading.value = true

    const response = await backgroundMusicStore.loadBackgroundMusic(userStore.currentEventId)
    if (response.status !== 200) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Background music failed.',
      })
    } else {
      backgroundMusicStore.id = response.data.data.id
      backgroundMusicStore.iconSize = response.data.data.iconSize
      backgroundMusicStore.iconPosition = response.data.data.iconPosition
      backgroundMusicStore.iconColor = response.data.data.iconColor
      backgroundMusicStore.songFile = response.data.data.songUrl
      backgroundMusicStore.autoplay = response.data?.data?.autoplay ?? false
      backgroundMusicStore.mode = 'edit'

      notificationStore.addNotification({
        type: 'success',
        message: 'Background music loaded successfully.',
      })
    }
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <section class="background-music">
    <div
      class="mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <div
        class="flex flex-row gap-x-4 "
      >
        <CWMBackgroundMusicCreator />

        <CWMBackgroundMusicShow />
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
