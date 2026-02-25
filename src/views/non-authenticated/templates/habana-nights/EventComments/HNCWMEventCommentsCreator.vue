<script setup>
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import ColorPickerField from '@/components/UI/form/ColorPickerField.vue'
import { Form } from 'vee-validate'
import { computed, onMounted, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import TextField from '@/components/UI/form/TextField.vue'
import { useEventCommentsStore } from '@/modules/comments/stores/useEventCommentsStore'
import NumberField from '@/components/UI/form/NumberField.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'

const commentsErrors = ref()
const mode = ref('create')
const eventCommentsValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      title: zod.string(),
      subTitle: zod.string(),
      backgroundColor: zod.string(),
      commentsTitle: zod.string(),
      buttonColor: zod.string(),
      buttonText: zod.string(),
      maxComments: zod.number()
    })
  )
})

const loading = ref(false)
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const eventCommentsStore = useEventCommentsStore()

onMounted(() => {
  initEventsCommentsConfig()
})

const initEventsCommentsConfig = async () => {
  try {
    loading.value = true

    const response = await eventCommentsStore.loadCommentsConfig(userStore.activeEvent)
    if (response.status === 200) {
      const {
        title,
        subTitle,
        backgroundColor,
        commentsTitle,
        maxComments,
        id,
        buttonColor,
        buttonText
      } = response.data.data ?? {}

      console.log('checking response', response.data.data)

      eventCommentsStore.config.id = id
      eventCommentsStore.config.title = title
      eventCommentsStore.config.subTitle = subTitle
      eventCommentsStore.config.commentsTitle = commentsTitle
      eventCommentsStore.config.backgroundColor = backgroundColor
      eventCommentsStore.config.buttonColor = buttonColor
      eventCommentsStore.config.buttonText = buttonText
      eventCommentsStore.config.maxComments = maxComments

      notificationStore.addNotification({
        type: 'success',
        message: 'Comments config successfully saved!'
      })

      mode.value = 'update'
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })

      mode.value = 'create'
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const handleRequest = async () => {
  if (mode.value === 'create') {
    return await eventCommentsStore.createCommentsConfig(userStore.activeEvent)
  }

  return await eventCommentsStore.updateCommentsConfig(userStore.activeEvent)
}

const onSubmit = async () => {
  try {
    console.log('submit clicked')
    const response = await handleRequest()

    if (response.status >= 200 && response.status < 300) {
      const {
        title,
        subTitle,
        backgroundColor,
        commentsTitle,
        maxComments,
        id,
        buttonColor,
        buttonText
      } = response.data.data ?? {}

      eventCommentsStore.config.id = id
      eventCommentsStore.config.title = title
      eventCommentsStore.config.subTitle = subTitle
      eventCommentsStore.config.commentsTitle = commentsTitle
      eventCommentsStore.config.backgroundColor = backgroundColor
      eventCommentsStore.config.buttonColor = buttonColor
      eventCommentsStore.config.buttonText = buttonText
      eventCommentsStore.config.maxComments = maxComments

      notificationStore.addNotification({
        type: 'success',
        message: 'Comments config successfully saved!'
      })

      mode.value = 'update'
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

const onInvalidSubmit = errors => {
  console.log('onInvalidSubmit', errors)
}
</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-[30%]">
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
            v-model="eventCommentsStore.config.title"
            name="title"
            label="Title"
            show-error
            placeholder="Section Title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>
        <!-- STD Title -->
        <div>
          <TextField
            v-model="eventCommentsStore.config.subTitle"
            name="subTitle"
            label="Sub Title"
            show-error
            placeholder="Comments Section Subtitle Title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <!-- STD Title -->
        <div>
          <ColorPickerField
            v-model="eventCommentsStore.config.backgroundColor"
            label="Background Color"
            class-label="text-lg font-medium"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            name="backgroundColor"
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
          <TextField
            v-model="eventCommentsStore.config.commentsTitle"
            name="commentsTitle"
            label="Title"
            show-error
            placeholder="Section Title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <ColorPickerField
            v-model="eventCommentsStore.config.buttonColor"
            label="Button Color"
            class-label="text-lg font-medium"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            name="buttonColor"
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
          <TextField
            v-model="eventCommentsStore.config.buttonText"
            name="buttonText"
            label="Button Text"
            show-error
            placeholder="Button Text"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <NumberField
            v-model="eventCommentsStore.config.maxComments"
            name="maxComments"
            label="Max Comments"
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
            <span v-if="mode === 'create'"> Create </span>
            <span v-else> Update </span>
          </span>
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
