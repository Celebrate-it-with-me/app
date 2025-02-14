<script setup>
import { ref, watch } from 'vue'
import { useSongsStore } from '@/stores/useSongsStore'
import SongsService from '@/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import SongSearchInput from '@/views/non-authenticated/templates/butterfly-vision/SuggestedMusic/SongSearchInput.vue'
import SongList from '@/views/non-authenticated/templates/butterfly-vision/SuggestedMusic/SongList.vue'
import CWMSimplePagination from '@/components/UI/pagination/CWMSimplePagination.vue'

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
    validator: (value) => ['normal', 'creator'].includes(value)
  },
  event: {
    type: Object,
    required: true
  }
})

const songsStore = useSongsStore()
const loading = ref(false)
const notification = useNotificationStore()
const totalItems = ref(0)
const pageSelected = ref(1)

const getSuggestedSongs = async () => {
  try {
    loading.value = true

    const response = await SongsService.getSuggestedSongs(props?.event?.id, pageSelected.value)

    if (response.status === 200) {
      songsStore.selectedSongs = response?.data?.data ?? []
      totalItems.value = response.data?.meta?.total ?? 0
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

const handleUpdatedList = () => {
  getSuggestedSongs()
}

watch(pageSelected, () => getSuggestedSongs())

watch(
  () => props.event,
  (newValue) => {
    if (Object.entries(newValue).length) {
      getSuggestedSongs()
    }
  },
  {
    deep: true,
    immediate: true
  })

</script>

<template>
  <div
    class="event-handle w-[70%] rounded-lg flex flex-col items-center"
  >
    <h2 class="text-6xl font-gvibes font-bold gap-10 gradient-text">
      {{ title }}
    </h2>
    <h4 class="music-subtitle relative text-2xl font-normal text-gray-600/70 text-center moments-title">
      {{ subTitle }}
    </h4>

    <SongSearchInput
      :event="event"
      :main-color="mainColor"
      :secondary-color="secondaryColor"
      :mode="mode"
      @update:list="handleUpdatedList"
    />

    <SongList
      :event="event"
      :mode="mode"
      :main-color="mainColor"
      :use-preview="usePreview"
      :use-vote-system="useVoteSystem"
    />

    <CWMSimplePagination
      v-model="pageSelected"
      v-if="songsStore.selectedSongs.length"
      :total-items="totalItems"
    />
  </div>
</template>

<style scoped>
.music-subtitle::before {
  position: absolute;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  bottom: -20px;
  width: 70%;
  height: 1px;
  content: "";
  background: #fdeab2;
}

.music-subtitle::after {
  position: absolute;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  bottom: -10px;
  width: 100%;
  height: 1px;
  content: "";
  background: #fdeab2;
}
</style>
