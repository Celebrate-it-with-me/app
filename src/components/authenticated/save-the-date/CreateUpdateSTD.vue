<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import TextField from '@/components/UI/form/TextField.vue'
import { Form } from 'vee-validate'
import ToggleField from '@/components/UI/form/ToggleField.vue'
import UploadImageField from '@/components/UI/form/UploadImageField.vue'
import "vue-color-kit/dist/vue-color-kit.css";
import ColorPickerField from '@/components/UI/form/ColorPickerField.vue'
import debounce from 'lodash.debounce'
import { useSTDStore } from '@/stores/useSTDStore'

const emit = defineEmits(['updatedStd'])

const stdState = reactive({
  stdTitle: '',
  stdSubTitle: '',
  backgroundColor: '',
  image: null,
  useCountdown: false,
  useAddToCalendar: false,
  isEnabled: false
})
const stdStore = useSTDStore()
const stdErrors = ref()

const isUpdate = computed(() => {
  return !!stdStore.hasPreviousStd;
})

const stdValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      stdTitle: zod.string().min(1, { message: 'Message is required' }),
      stdSubTitle: zod.string().optional(),
      backgroundColor: zod.string().optional(),
      image: zod
        .instanceof(File)
        .optional()
        .refine(
          (file) => !file || ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
          { message: 'Image must be a valid image file (jpg, png, gif)' }
        ),
      useCountdown: zod.boolean({ required_error: '"useCountdown" must be a boolean' }).optional(),
      useAddToCalendar: zod.boolean({ required_error: '"useAddToCalendar" must be a boolean' }).optional(),
      isEnabled: zod.boolean({ required_error: '"useAddToCalendar" must be a boolean' }).optional(),
    })
  )
})

onMounted(() => {
  if (stdStore.hasPreviousStd) {
    stdState.stdTitle = stdStore.stdTitle
    stdState.stdSubTitle = stdStore.stdSubTitle
    stdState.backgroundColor = stdStore.backgroundColor
    stdState.useCountdown = stdStore.useCountdown
    stdState.useAddToCalendar = stdStore.useAddToCalendar
    stdState.isEnabled = stdStore.isEnabled

    if (stdStore.image) {
      stdState.image = stdStore.image;
    }

  }
})

const onSubmit = async () => {
  try {
    stdState.sending = true
    let response

    if (isUpdate.value) {
      response = await stdStore.updateSTD(stdState)
    } else {
      response = await stdStore.createSTD(stdState)
    }

    if (response.status >= 200 && response.status < 300) {
      console.log(response)

    } else {
      console.log('Oops something when wrong, please try again later', response)
      stdErrors.value = 'Oops something when wrong, please try again later'
    }
  } catch(e) {
    console.log(e)
  } finally {
    stdState.sending = false
  }
}

const onInvalidSubmit = () => {
  stdErrors.value = 'Oops something when wrong, please try again later'
}

const debounceEmit = debounce((value) => {
  emit('updatedStd', value)
  console.log('emitting')
}, 300)

watch(() => stdState, (value) => {
  if (value) {
    debounceEmit(value)
  }
},
  {
    immediate: true,
    deep: true
})

</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-[30%]">
    <!-- Header Section -->
    <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
      <h3 class="text-lg font-semibold">Save the Date</h3>
    </div>

    <!-- Event Details Form -->
    <Form
      :validation-schema="stdValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <!-- Error Section -->
      <div v-if="stdErrors" class="w-full mb-4">
        <p class="text-red-500 font-semibold">
          {{ stdErrors }}
        </p>
      </div>

      <div class="flex flex-col gap-6">
        <!-- STD Title -->
        <div>
          <TextField
            v-model="stdState.stdTitle"
            label="Title"
            name="stdTitle"
            show-error
            placeholder="Save the Date Title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <!-- STD Title -->
        <div>
          <TextField
            v-model="stdState.stdSubTitle"
            label="Sub Title"
            name="stdSubTitle"
            show-error
            placeholder="Save the Date sub title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <ColorPickerField
            label="Background Color"
            classLabel="text-lg font-medium"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            name="color"
            v-model="stdState.backgroundColor"
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

        <!-- STD Image -->
        <div>
          <div v-if="typeof stdState.image === 'string'" class="mb-4">
            <img
              :src="stdState.image"
              alt="Uploaded Image Preview"
              class="w-full h-40 object-cover rounded-md"
            />
            <button
              type="button"
              @click="stdState.image = null"
              class="mt-2 text-sm text-blue-500 hover:underline"
            >
              Clear Image
            </button>

          </div>

          <UploadImageField
            v-if="!stdState.image || typeof stdState.image !== 'string'"
            v-model="stdState.image"
            name="image"
            label="Background Image"
          />
        </div>

        <!-- Use CountDown -->
        <div class="col-span-2">
          <ToggleField
            label="Use Countdown"
            name="useCountdown"
            v-model="stdState.useCountdown"
          />
        </div>

        <!-- Use Add to Calendar -->
        <div class="col-span-2">
          <ToggleField
            label="Use Add To Calendar"
            name="useAddToCalendar"
            v-model="stdState.useAddToCalendar"
          />
        </div>

        <div class="col-span-2">
          <ToggleField
            label="Is Enabled"
            name="isEnabled"
            v-model="stdState.isEnabled"
          />
        </div>

      </div>

      <!-- Form Buttons -->
      <div class="mt-6 flex justify-end items-center gap-4">
        <button
          v-if="!isUpdate"
          type="submit"
          class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        >
          Save STD
        </button>
        <button
          v-else
          type="submit"
          class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        >
          Update STD
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
