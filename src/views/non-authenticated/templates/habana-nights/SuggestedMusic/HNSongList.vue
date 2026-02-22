<script setup>
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import { ref } from 'vue'
import SongsService from '@/modules/suggested-music/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import HNSongListItem from '@/views/non-authenticated/templates/habana-nights/SuggestedMusic/HNSongListItem.vue'
import HNSongPreviewModal from '@/views/non-authenticated/templates/habana-nights/SuggestedMusic/HNSongPreviewModal.vue'
import HNConfirmDeleteSongModal from '@/views/non-authenticated/templates/habana-nights/SuggestedMusic/HNConfirmDeleteSongModal.vue'

const emit = defineEmits(['update:List'])
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
  },
  mode: {
    type: String,
    required: true,
    validator: value => ['creator', 'normal'].includes(value)
  },
  event: {
    type: Object,
    required: true
  }
})

const songsStore = useSuggestedMusicStore()
const notification = useNotificationStore()
const templateStore = useTemplateStore()

const isPlayerOpen = ref(false)
const selectedSong = ref(null)

const songToDelete = ref(null)
const showDeleteModal = ref(false)

const openSongModal = song => {
  selectedSong.value = song
  isPlayerOpen.value = true
}

const closeSongModal = () => {
  isPlayerOpen.value = false
  selectedSong.value = null
}

const requestDeleteSong = song => {
  songToDelete.value = song
  showDeleteModal.value = true
}

const confirmDeleteSong = async () => {
  try {
    const response = await SongsService.deleteSongPublic(
      props.event?.id ?? 0,
      songToDelete.value.id,
      templateStore.guest?.accessCode || 0
    )

    if (response.status >= 200 && response.status < 300) {
      emit('update:List')
      notification.addNotification({
        message: 'Song removed successfully'
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

  showDeleteModal.value = false
  songToDelete.value = null
}

const cancelDeleteSong = () => {
  showDeleteModal.value = false
  songToDelete.value = null
}
</script>

<template>
  <div v-if="songsStore.selectedSongs.length > 0" class="h-full mt-2 w-full">
    <ul>
      <HNSongListItem
        v-for="song in songsStore.selectedSongs"
        :key="song.id"
        :main-color="mainColor"
        :use-preview="usePreview"
        :use-vote-system="useVoteSystem"
        :song="song"
        :mode="mode"
        @play="openSongModal"
        @request-delete="requestDeleteSong"
      />
    </ul>

    <HNSongPreviewModal :open="isPlayerOpen" :song="selectedSong" @close="closeSongModal" />
    <HNConfirmDeleteSongModal
      :open="showDeleteModal"
      :song="songToDelete"
      @confirm="confirmDeleteSong"
      @cancel="cancelDeleteSong"
    />
  </div>
</template>

<style scoped></style>
