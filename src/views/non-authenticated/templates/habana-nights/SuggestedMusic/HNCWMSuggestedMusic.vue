<script setup>
import { ref, watch } from 'vue'
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import SongsService from '@/modules/suggested-music/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import CWMSimplePagination from '@/components/UI/pagination/CWMSimplePagination.vue'
import CFSongList from '@/views/non-authenticated/templates/habana-nights/SuggestedMusic/CFSongList.vue'
import CFSongSearchInput from '@/views/non-authenticated/templates/habana-nights/SuggestedMusic/CFSongSearchInput.vue'

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
  <div class="event-handle w-[90%] md:w-[70%] rounded-lg flex flex-col items-center">
    <h2
      class="text-6xl font-gvibes font-bold gap-10 text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-blue-800 text-center"
    >
      {{ title }}
    </h2>
    <h4
      class="music-subtitle relative text-2xl font-normal text-dark-blue text-center moments-title"
    >
      {{ subTitle }}
    </h4>

    <CFSongSearchInput
      :event="event"
      :main-color="mainColor"
      :secondary-color="secondaryColor"
      :mode="mode"
      @update:list="handleUpdatedList"
    />

    <CFSongList
      :event="event"
      :mode="mode"
      :main-color="mainColor"
      :use-preview="usePreview"
      :use-vote-system="useVoteSystem"
      @update:list="handleUpdatedList"
    />

    <CWMSimplePagination
      v-if="songsStore.selectedSongs.length"
      v-model="pageSelected"
      :total-items="totalItems"
    />
  </div>
</template>

<style scoped></style>
