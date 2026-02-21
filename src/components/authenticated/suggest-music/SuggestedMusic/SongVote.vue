<script setup>
import { HandThumbDownIcon, HandThumbUpIcon } from '@heroicons/vue/16/solid'
import { useNotificationStore } from '@/stores/useNotificationStore'
import SongsService from '@/modules/suggested-music/services/SongsService'

const notification = useNotificationStore()

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  mode: {
    type: String,
    required: true
  }
})

const voteSong = async direction => {
  try {
    const response = await SongsService.voteSong({
      songId: props.song.id,
      direction: direction
    })

    if (response.status === 200) {
      notification.addNotification({
        message: `Your vote was successfully registered!`
      })
    } else {
      notification.addNotification({
        type: 'error',
        message: 'Something went wrong. Unable to register your vote!'
      })
    }
  } catch (e) {
    console.log('Error voting for song:', e)
    notification.addNotification({
      type: 'error',
      message: 'An error occurred while voting for the song.'
    })
  }
}

const noVoteSystemMessage = () => {
  notification.addNotification({
    type: 'warning',
    message: 'This vote feature is not available in creator mode!'
  })
}
</script>

<template>
  <div v-if="mode === 'creator'">
    <div class="flex items-center space-x-4">
      <button class="rounded-full" @click="noVoteSystemMessage">
        <HandThumbUpIcon class="h-5 w-5 text-white hover:text-green-500" />
      </button>
      <button class="rounded-full" @click="noVoteSystemMessage">
        <HandThumbDownIcon class="h-5 w-5 text-white hover:text-red-500" />
      </button>
    </div>
  </div>
  <div v-else>
    <div class="flex items-center space-x-4">
      <button class="rounded-full" @click="voteSong('up')">
        <HandThumbUpIcon class="h-5 w-5 text-white hover:text-green-500" />
      </button>
      <button class="rounded-full" @click="voteSong('down')">
        <HandThumbDownIcon class="h-5 w-5 text-white hover:text-red-500" />
      </button>
    </div>
  </div>
</template>
