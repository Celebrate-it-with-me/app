<script setup>
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import ColorPickerField from '@/components/UI/form/ColorPickerField.vue'
import { Form } from 'vee-validate'
import ToggleField from '@/components/UI/form/ToggleField.vue'
import { computed, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import SelectField from '@/components/UI/form/SelectField.vue'
import {
  AUTOPLAY_ICON_SIZES as iconSizes,
  AUTOPLAY_ICON_POSITIONS as iconPositions
} from '@/constants/constants'
import { useBackgroundMusicStore } from '@/stores/useBackgroundMusicStore'
import UploadAudioField from '@/components/UI/form/UploadAudioField.vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const bgMusicErrors = ref()
const bgMusicValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      iconSize: zod.enum(['20px', '25px', '30px', '35px', '40px']),
      iconPosition: zod.enum(['top-left', 'top-right', 'bottom-right', 'bottom-left']),
      iconColor: zod.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format'),
      autoplay: zod.boolean(),
      songFile: zod.any().refine(file => typeof file === 'string' || file instanceof File, {
        message: 'File is not valid',
        path: ['songFile']
      })
    })
  )
})

const eventStore = useEventsStore()
const backgroundMusicStore = useBackgroundMusicStore()
const loading = ref(false)
const notificationStore = useNotificationStore()

const handleRequest = async () => {
  if (backgroundMusicStore.mode === 'create') {
    return await backgroundMusicStore.addBackgroundMusic(eventStore.currentEvent.id)
  }

  return await backgroundMusicStore.editBackgroundMusic()
}

const onSubmit = async () => {
  try {
    loading.value = true
    const response = await handleRequest()

    if (response.status >= 200 && response.status < 300) {
      notificationStore.addNotification({
        type: 'success',
        message: 'Background music was successfully processed.!'
      })
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Oops! Something went wrong!'
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const onInvalidSubmit = errors => {
  console.log(backgroundMusicStore.autoplay)
  console.log('onInvalidSubmit', errors)
}
</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-[40%]">
    <Form
      :validation-schema="bgMusicValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
        <h3 class="text-lg font-semibold flex flex-row justify-between items-center space-x-4">
          <span>Background Music</span>
        </h3>
      </div>

      <!-- Error Section -->
      <div v-if="bgMusicErrors" class="w-full mb-4">
        <p class="text-red-500 font-semibold">
          {{ bgMusicErrors }}
        </p>
      </div>

      <div class="flex flex-col gap-6">
        <div>
          <UploadAudioField
            v-model="backgroundMusicStore.songFile"
            name="songFile"
            label="Background Music"
          />
        </div>
        <!-- STD Title -->
        <div>
          <SelectField
            v-model="backgroundMusicStore.iconSize"
            name="iconSize"
            label="Icon Size"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            :items="iconSizes"
          />
        </div>

        <!-- STD Title -->
        <div>
          <SelectField
            v-model="backgroundMusicStore.iconPosition"
            name="iconPosition"
            label="Icon position"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            :items="iconPositions"
          />
        </div>

        <div>
          <ColorPickerField
            v-model="backgroundMusicStore.iconColor"
            label="Icon Color"
            class-label="text-lg font-medium"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            name="iconColor"
            :colorpicker-options="{
              type: 'component',
              showPalette: true,
              showSelectionPalette: true,
              preferredFormat: 'hex',
              showInitial: true
            }"
            :show-error="true"
          />
        </div>

        <div>
          <ToggleField
            v-model="backgroundMusicStore.autoplay"
            name="autoplay"
            label="Background Music Autoplay"
          />
        </div>
      </div>

      <!-- Form Buttons -->
      <div class="mt-6 flex justify-end items-center gap-4">
        <button
          type="submit"
          class="w-full text-white text-sm font-medium py-2 px-6 rounded-md"
          :class="loading ? 'bg-gray-500 hover:bg-gray-600' : 'bg-yellow-500 hover:bg-yellow-600'"
          :disabled="loading"
        >
          <CWMLoading v-if="loading" />
          <span v-if="loading">Saving Config...</span>
          <span v-else>
            <span v-if="backgroundMusicStore.mode === 'create'"> Create </span>
            <span v-else> Update </span>
          </span>
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
