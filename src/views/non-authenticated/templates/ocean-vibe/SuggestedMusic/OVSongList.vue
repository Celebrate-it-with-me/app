<script setup>
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import { ref } from 'vue'
import SongsService from '@/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useTemplateStore } from '@/stores/useTemplateStore'
import { Music } from 'lucide-vue-next'
import OVSongListItem from '@/views/non-authenticated/templates/ocean-vibe/SuggestedMusic/OVSongListItem.vue'
import OVSongPreviewModal from '@/views/non-authenticated/templates/ocean-vibe/SuggestedMusic/OVSongPreviewModal.vue'
import OVConfirmDeleteSongModal from '@/views/non-authenticated/templates/ocean-vibe/SuggestedMusic/OVConfirmDeleteSongModal.vue'

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
  <div v-if="songsStore.selectedSongs.length > 0" class="h-full mt-6 w-full max-w-4xl">
    <ul class="space-y-3">
      <OVSongListItem
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

    <OVSongPreviewModal :open="isPlayerOpen" :song="selectedSong" @close="closeSongModal" />
    <OVConfirmDeleteSongModal
      :open="showDeleteModal"
      :song="songToDelete"
      @confirm="confirmDeleteSong"
      @cancel="cancelDeleteSong"
    />
  </div>

  <!-- Empty State -->
  <div
    v-else
    class="mt-12 w-full max-w-2xl rounded-2xl border border-dashed border-[#7FB9C9]/40 bg-white/50 backdrop-blur-sm p-12 text-center"
  >
    <div
      class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#7FB9C9]/10 text-[#2F6F8F]"
    >
      <Music class="h-8 w-8" />
    </div>
    <h3 class="text-xl font-bold text-[#123B5A]">Aún no hay canciones sugeridas</h3>
    <p class="mt-2 text-[#2F6F8F]">
      Sé el primero en proponer una canción especial para la quinceañera.
    </p>
  </div>
</template>

<style scoped></style>
