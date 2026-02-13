<script setup>
import { ref, watch } from 'vue'
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import SongsService from '@/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import CWMSimplePagination from '@/components/UI/pagination/CWMSimplePagination.vue'
import OVSongSearchInput from '@/views/non-authenticated/templates/ocean-vibe/SuggestedMusic/OVSongSearchInput.vue'
import OVSongList from '@/views/non-authenticated/templates/ocean-vibe/SuggestedMusic/OVSongList.vue'
import { useSuggestedMusicPublicStore } from '@/stores/publicEvents/useSuggestedMusicPublicStore'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const props = defineProps({
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
    validator: value => ['normal', 'creator'].includes(value)
  },
  event: {
    type: Object,
    required: true
  }
})

const songsStore = useSuggestedMusicStore()
const suggestedMusicPublicStore = useSuggestedMusicPublicStore()
const templateStore = useTemplateStore()
const loading = ref(false)
const notification = useNotificationStore()
const totalItems = ref(0)
const pageSelected = ref(1)

const getSuggestedSongs = async () => {
  try {
    loading.value = true

    const options = {
      perPage: 5,
      pageSelected: pageSelected.value,
      orderBy: 'recent',
      search: ''
    }

    const response = await SongsService.getSuggestedSongsPublic(props?.event?.id, options)

    if (response.status === 200) {
      songsStore.selectedSongs = response?.data?.data ?? []
      totalItems.value = response.data?.meta?.total ?? 0

      // Fetch user votes for the new list if accessCode exists
      const accessCode = templateStore.guest?.accessCode
      if (accessCode && props.useVoteSystem) {
        songsStore.selectedSongs.forEach(song => {
          suggestedMusicPublicStore.getUserVote(props.event.id, song.id, accessCode)
        })
      }
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

const handleUpdatedList = async () => {
  await getSuggestedSongs()
}

watch(pageSelected, () => getSuggestedSongs())

watch(
  () => props.event,
  newValue => {
    if (Object.entries(newValue).length) {
      getSuggestedSongs()
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>

<template>
  <div class="event-handle w-full max-w-6xl px-4 flex flex-col items-center relative">
    <h2
      class="text-4xl md:text-7xl font-gvibes font-bold leading-[1.2] pt-8 md:pt-16 text-transparent bg-clip-text bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] text-center"
    >
      {{ title }}
    </h2>
    <h4
      class="music-subtitle relative mt-1 text-lg md:text-2xl font-bold text-[#123B5A] text-center"
    >
      {{ subTitle }}
    </h4>

    <div
      v-if="useVoteSystem && templateStore.guest?.accessCode"
      class="mt-2 mb-4 flex items-center gap-2 rounded-full bg-[#123B5A]/10 px-4 py-1.5 text-sm font-medium text-[#123B5A]"
    >
      <span>Votos disponibles:</span>
      <span class="text-lg font-bold">{{ suggestedMusicPublicStore.availableVotes }}</span>
    </div>

    <div
      v-if="useVoteSystem && !templateStore.guest?.accessCode"
      class="mt-2 mb-4 px-4 py-1.5 text-sm text-[#123B5A]/60 italic"
    >
      Inicia sesión con tu código de acceso para poder votar.
    </div>

    <OVSongSearchInput
      :event="event"
      :main-color="mainColor"
      :secondary-color="secondaryColor"
      :mode="mode"
      class="relative z-20"
      @update:list="handleUpdatedList"
    />

    <OVSongList
      :event="event"
      :mode="mode"
      :main-color="mainColor"
      :use-preview="usePreview"
      :use-vote-system="useVoteSystem"
      class="relative z-10 w-full"
      @update:list="handleUpdatedList"
    />

    <CWMSimplePagination
      v-if="songsStore.selectedSongs.length"
      v-model="pageSelected"
      :total-items="totalItems"
      class="mt-6 mb-8"
    />
  </div>
</template>

<style scoped></style>
