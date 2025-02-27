<script setup>
import ToggleField from '@/components/UI/form/ToggleField.vue'
import { Form } from 'vee-validate'
import TextField from '@/components/UI/form/TextField.vue'
import ColorPickerField from '@/components/UI/form/ColorPickerField.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import NumberField from '@/components/UI/form/NumberField.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import SongsService from '@/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useEventsStore } from '@/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'

const emit = defineEmits(['update:updatedState'])

const musicErrors = ref()
const notification = useNotificationStore()
const eventStore = useEventsStore()
const wasSaved = ref(false)
const loading = ref(false)
const userStore = useUserStore()

const musicLocalState = reactive({
  id: null,
  useSuggestedMusic: false,
  title: 'Music Suggestions',
  subTitle: 'Please send us you preferred music',
  usePreview: false,
  mainColor: '#1f2937',
  secondaryColor: '#111827',
  useVoteSystem: true,
  searchLimit: 10
})

const musicValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      useSuggestedMusic: zod.boolean().default(false),
      title: zod.string().optional(),
      subTitle: zod.string().optional(),
      usePreview: zod.boolean().default(false),
      mainColor: zod.string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code')
        .optional(),
      secondaryColor: zod.string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code')
        .optional(),
      useVoteSystem: zod.boolean().default(false),
      searchLimit: zod
        .number()
        .nonnegative('Search limit must be a positive number')
        .optional(),
    })
  )
})

onMounted(() => {
  getSelectedMusicConfig()
})

const getSelectedMusicConfig = async () => {
  try {
    const response = await SongsService.getSuggestedConfig(userStore.currentEventId)

    if (response.status === 200 && response?.data?.data) {
      const { data } = response

      musicLocalState.id = data?.data?.id
      musicLocalState.useSuggestedMusic = !!data?.data?.useSuggestedMusic ?? false
      musicLocalState.title = data?.data?.title ?? ''
      musicLocalState.subTitle = data?.data?.subTitle ?? ''
      musicLocalState.mainColor = data?.data?.mainColor ?? '#1f2937'
      musicLocalState.secondaryColor = data?.data?.secondaryColor ?? '#111827'
      musicLocalState.searchLimit = data?.data?.searchLimit ?? 10
      musicLocalState.usePreview = !!data?.data?.usePreview ?? false
      musicLocalState.useVoteSystem = !!data?.data?.useVoteSystem ?? false

      wasSaved.value = true
    } else {
      wasSaved.value = false
    }

  } catch(e) {
    console.log(e)
  }
}

const saveSuggestedMusicConfig = async () => {
  try {
    loading.value = true

    const response = await SongsService.saveSuggestedConfig({
      ...musicLocalState,
      eventId: eventStore.currentEvent.id
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

    const response = await SongsService.updateSuggestedConfig({
      ...musicLocalState,
    })

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

const onInvalidSubmit = (error) => {
  console.error(error)
}

watch(
  musicLocalState,
  (newValue) => {
  emit('update:updatedState', newValue)
}, { deep: true })

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
        <ToggleField
          name="useSuggestedMusic"
          label=""
          v-model="musicLocalState.useSuggestedMusic"
        />
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
            v-model="musicLocalState.title"
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
            v-model="musicLocalState.subTitle"
            label="Sub Title:"
            name="subTitle"
            show-error
            placeholder="Music suggested sub title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <ColorPickerField
            label="Main Color"
            classLabel="text-lg font-medium"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            name="color"
            v-model="musicLocalState.mainColor"
            :colorpicker-options="{
                type: 'component',
                showPalette: true,
                showSelectionPalette: true,
                preferredFormat: 'hex',
                showInitial: true,
              }"
            :showError="true"
          />
        </div>

        <div>
          <ColorPickerField
            label="Secondary Color"
            classLabel="text-lg font-medium"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            name="color"
            v-model="musicLocalState.secondaryColor"
            :colorpicker-options="{
                type: 'component',
                showPalette: true,
                showSelectionPalette: true,
                preferredFormat: 'hex',
                showInitial: true,
              }"
            :showError="true"
          />
        </div>

        <div>
          <NumberField
            v-model="musicLocalState.searchLimit"
            label="Search Limit:"
            name="searchLimit"
            show-error
            placeholder="Max result quantity"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <ToggleField
            name="usePreview"
            label="Use Music Preview"
            v-model="musicLocalState.usePreview"
          />
        </div>

        <div>
          <ToggleField
            name="useVoteSystem"
            label="Use Vote System"
            v-model="musicLocalState.useVoteSystem"
          />
        </div>

      </div>

      <!-- Form Buttons -->
      <div class="mt-6 flex justify-end items-center gap-4">
        <button
          type="submit"
          class="w-full  text-white text-sm font-medium py-2 px-6 rounded-md"
          :class="loading
            ? 'bg-gray-500 hover:bg-gray-600'
            : 'bg-yellow-500 hover:bg-yellow-600'"
          :disabled="loading"
        >
          <CWMLoading
            v-if="loading"
          />
          <span v-if="loading">Saving Config...</span>
          <span v-else>
            <span v-if="!wasSaved">
              Save Suggested Music Component
            </span>
            <span v-else>
              Update Suggested Music Component
            </span>
          </span>
        </button>
      </div>
    </Form>

  </div>
</template>

<style scoped>

</style>
