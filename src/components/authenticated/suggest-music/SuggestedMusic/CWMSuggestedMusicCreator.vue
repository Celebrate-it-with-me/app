<script setup>
import ToggleField from '@/components/UI/form/ToggleField.vue'
import { Form } from 'vee-validate'
import TextField from '@/components/UI/form/TextField.vue'
import ColorPickerField from '@/components/UI/form/ColorPickerField.vue'
import { computed, onMounted, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import NumberField from '@/components/UI/form/NumberField.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import SongsService from '@/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import { useUserStore } from '@/stores/useUserStore'

const musicErrors = ref()
const notification = useNotificationStore()
const wasSaved = ref(false)
const loading = ref(false)
const userStore = useUserStore()
const suggestedMusicStore = useSuggestedMusicStore()

const musicValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      title: zod.string().optional(),
      subTitle: zod.string().optional(),
      usePreview: zod.boolean().default(false),
      mainColor: zod
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code')
        .optional(),
      secondaryColor: zod
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code')
        .optional(),
      useVoteSystem: zod.boolean().default(false),
      searchLimit: zod.number().nonnegative('Search limit must be a positive number').optional()
    })
  )
})
const currentEventId = computed(() => {
  return userStore.currentEventId ?? null
})

onMounted(() => {
  getSelectedMusicConfig()
})

const getSelectedMusicConfig = async () => {
  try {
    const response = await SongsService.getSuggestedConfig(currentEventId.value)

    if (response.status === 200 && response?.data?.data) {
      const { data } = response
      suggestedMusicStore.config.id = data?.data?.id
      suggestedMusicStore.config.useSuggestedMusic = !!data?.data?.useSuggestedMusic ?? false
      suggestedMusicStore.config.title = data?.data?.title ?? ''
      suggestedMusicStore.config.subTitle = data?.data?.subTitle ?? ''
      suggestedMusicStore.config.mainColor = data?.data?.mainColor ?? '#1f2937'
      suggestedMusicStore.config.secondaryColor = data?.data?.secondaryColor ?? '#111827'
      suggestedMusicStore.config.searchLimit = data?.data?.searchLimit ?? 10
      suggestedMusicStore.config.usePreview = !!data?.data?.usePreview ?? false
      suggestedMusicStore.config.useVoteSystem = !!data?.data?.useVoteSystem ?? false

      wasSaved.value = true
    } else {
      wasSaved.value = false
    }
  } catch (e) {
    console.log(e)
  }
}

const saveSuggestedMusicConfig = async () => {
  try {
    loading.value = true

    const response = await suggestedMusicStore.saveSuggestedConfig({
      eventId: currentEventId.value
    })

    if (response.status >= 200 && response.status < 300) {
      notification.addNotification({
        type: 'success',
        message: 'Configuration Saved successfully!'
      })

      wasSaved.value = true
    } else {
      console.log(response)
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

const updateSuggestedMusicConfig = async () => {
  try {
    loading.value = true

    const response = await suggestedMusicStore.updateSuggestedConfig()

    if (response.status >= 200 && response.status < 300) {
      notification.addNotification({
        type: 'success',
        message: 'Configuration Updated successfully!'
      })

      wasSaved.value = true
    } else {
      console.log(response)
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

const onSubmit = async () => {
  if (!wasSaved.value) {
    return saveSuggestedMusicConfig()
  }

  return updateSuggestedMusicConfig()
}

const onInvalidSubmit = error => {
  console.error(error)
}
</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-[40%]">
    <Form
      :validation-schema="musicValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
        <h3 class="text-lg font-semibold flex flex-row justify-between items-center space-x-4">
          <span>Suggested Music</span>
        </h3>
      </div>

      <!-- Error Section -->
      <div v-if="musicErrors" class="w-full mb-4">
        <p class="text-red-500 font-semibold">
          {{ musicErrors }}
        </p>
      </div>

      <div class="flex flex-col gap-6">
        <!-- STD Title -->
        <div>
          <TextField
            v-model="suggestedMusicStore.config.title"
            label="Title:"
            name="title"
            show-error
            placeholder="Enter the title for suggested Music"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <!-- STD Title -->
        <div>
          <TextField
            v-model="suggestedMusicStore.config.subTitle"
            label="Sub Title:"
            name="subTitle"
            show-error
            placeholder="Music suggested sub title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <ColorPickerField
            v-model="suggestedMusicStore.config.mainColor"
            label="Main Color"
            class-label="text-lg font-medium"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            name="color"
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
          <ColorPickerField
            v-model="suggestedMusicStore.config.secondaryColor"
            label="Secondary Color"
            class-label="text-lg font-medium"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            name="color"
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
          <NumberField
            v-model="suggestedMusicStore.config.searchLimit"
            label="Search Limit:"
            name="searchLimit"
            show-error
            placeholder="Max result quantity"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <ToggleField
            v-model="suggestedMusicStore.config.usePreview"
            name="usePreview"
            label="Use Music Preview"
          />
        </div>

        <div>
          <ToggleField
            v-model="suggestedMusicStore.config.useVoteSystem"
            name="useVoteSystem"
            label="Use Vote System"
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
            <span v-if="!wasSaved"> Save Suggested Music Component </span>
            <span v-else> Update Suggested Music Component </span>
          </span>
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
