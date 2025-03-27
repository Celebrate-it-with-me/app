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
import TextField from '@/components/UI/form/TextField.vue'
import { useEventCommentsStore } from '@/stores/useEventCommentsStore'
import NumberField from '@/components/UI/form/NumberField.vue'

const commentsErrors = ref()
const eventCommentsValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      title: zod.string(),
      subtitle: zod.string(),
      backgroundColor: zod.string(),
      commentsTitle: zod.string(),
      maxList: zod.number(),
    })
  )
})

const loading = ref(false)
const eventCommentsStore = useEventCommentsStore()

const onSubmit = async () => {
 console.log('submit forms')
}

const onInvalidSubmit = (errors) => {
  console.log('onInvalidSubmit', errors)
}
</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-[40%]">
    <Form
      :validation-schema="eventCommentsValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
        <h3 class="text-lg font-semibold flex flex-row justify-between items-center space-x-4">
          <span>Event Comments</span>
        </h3>
      </div>

      <!-- Error Section -->
      <div v-if="commentsErrors" class="w-full mb-4">
        <p class="text-red-500 font-semibold">
          {{ commentsErrors }}
        </p>
      </div>

      <div class="flex flex-col gap-6">
        <div>
          <TextField
            name="title"
            label="Title"
            v-model="eventCommentsStore.config.title"
            show-error
            placeholder="Section Title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>
        <!-- STD Title -->
        <div>
          <TextField
            name="subtitle"
            label="SubTitle"
            v-model="eventCommentsStore.config.subtitle"
            show-error
            placeholder="Comments Section Subtitle Title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <!-- STD Title -->
        <div>
          <ColorPickerField
            label="Background Color"
            classLabel="text-lg font-medium"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            name="color"
            v-model="eventCommentsStore.config.backgroundColor"
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
          <TextField
            name="title"
            label="Title"
            v-model="eventCommentsStore.config.commentsTitle"
            show-error
            placeholder="Section Title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <NumberField
            name="maxComments"
            label="Max Comments"
            v-model="eventCommentsStore.config.maxComments"
            show-error
            placeholder="Comments Section Max Comments"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
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
            <span v-if="eventCommentsStore.mode === 'create'"> Create </span>
            <span v-else> Update </span>
          </span>
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
