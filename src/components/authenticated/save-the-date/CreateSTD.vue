<script setup>
import { computed, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import TextField from '@/components/UI/form/TextField.vue'
import { Form } from 'vee-validate'
import ToggleField from '@/components/UI/form/ToggleField.vue'
import UploadImageField from '@/components/UI/form/UploadImageField.vue'
import { ColorPicker } from "vue-color-kit";
import "vue-color-kit/dist/vue-color-kit.css";

const stdState = reactive({
  stdTitle: '',
  stdSubTitle: '',
  backgroundColor: '',
  image: null,
  useCountdown: false,
  useAddToCalendar: false,
  isEnabled: false
})

const color = ref('#59c7f9')

const stdErrors = ref()

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
      useCountdown: zod.boolean({ required_error: '"useCountdown" must be a boolean' }),
      useAddToCalendar: zod.boolean({ required_error: '"useAddToCalendar" must be a boolean' }),
      isEnabled: zod.boolean({ required_error: '"isEnabled" must be a boolean' }),
    })
  )
})

const onSubmit = async () => {}

const onInvalidSubmit = (errors) => {
  console.log(errors)
}

const changeColor = (color) => {
  const { r, g, b, a } = color.rgba
  stdState.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`
}

const openSucker = (isOpen) => {
  if (isOpen) {
    // ... canvas be created
    // this.suckerCanvas = canvas
    // this.suckerArea = [x1, y1, x2, y2]
  } else {
    // this.suckerCanvas && this.suckerCanvas.remove
  }
}

const inputFocus = (event) => {
  // this will get triggered on input field (hex and rgba) get focus
  // prop value will be FocusEvent object associated with the input
}

const inputBlur = (event) => {
  // this  will get triggeredon input field (hex and rgba) get out of focus (blur event)
  // prop value will be FocusEvent object associated with the input
}


</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-[30%]">
    <!-- Header Section -->
    <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
      <h3 class="text-lg font-semibold">Create Save the Date</h3>
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
          <label for="colorPicker">Background Color</label>
          <input
            type="text"
            v-colorpicker="{type: 'component'}"
            class="w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
        </div>

        <!-- STD Image -->
        <div>
          <UploadImageField
            v-model="stdState.image"
            name="image"
            label="Background Image"
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

        <!-- Use CountDown -->
        <div class="col-span-2">
          <ToggleField
            label="Use Countdown"
            name="useCountdown"
            v-model="stdState.useCountdown"
          />
        </div>

        <!-- Is Enabled -->
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
          type="submit"
          class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        >
          Create STD
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
