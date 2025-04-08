<script setup>
import { computed, onMounted, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import TextField from '@/components/UI/form/TextField.vue'
import { Form } from 'vee-validate'
import "vue-color-kit/dist/vue-color-kit.css";
import ColorPickerField from '@/components/UI/form/ColorPickerField.vue'
import NumberField from '@/components/UI/form/NumberField.vue'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'
import { useUserStore } from '@/stores/useUserStore'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'


const currentUserStore = useUserStore()
const sweetMemoriesStore = useSweetMemoriesStore()
const sweetMemoriesErrors = ref(null)
const isUpdate = ref(null)
const loading = ref(false)
const notificationStore = useNotificationStore()

const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      title: zod.string().min(1, { message: 'Title is required' }),
      subTitle: zod.string().optional(),
      backgroundColor: zod.string().optional(),
      maxPictures: zod.number({ message: 'Maximum pictures is required' }),
    })
  )
})

onMounted(() => {
  initSweetMemoriesConfig()
})

const initSweetMemoriesConfig = async () => {
  try {
    const response = await sweetMemoriesStore.loadSweetMemoriesConfig(currentUserStore.currentEventId)
    if (response.status === 200) {
      const { id, title, subTitle, backgroundColor, maxPictures } = response.data.data ?? {}
      sweetMemoriesStore.config.id = id
      sweetMemoriesStore.config.title = title
      sweetMemoriesStore.config.subTitle = subTitle
      sweetMemoriesStore.config.backgroundColor = backgroundColor
      sweetMemoriesStore.config.maxPictures = maxPictures
      isUpdate.value = true
    }
  } catch (error) {
    sweetMemoriesErrors.value = error.response?.data?.message ?? 'Something went wrong'
  }
}

const onSubmit = async () => {
  try {
    loading.value = true

    const response = await sweetMemoriesStore.createSweetMemoriesConfig(currentUserStore.currentEventId)

    console.log('checking response', response)
    if (response.status >= 200 && response.status < 300) {
      const {
        id,
        title,
        subTitle,
        backgroundColor,
        maxPictures
      } = response.data.data ?? {}

      sweetMemoriesStore.config.title = title
      sweetMemoriesStore.config.subTitle = subTitle
      sweetMemoriesStore.config.backgroundColor = backgroundColor
      sweetMemoriesStore.config.maxPictures = maxPictures
      sweetMemoriesStore.config.id = id

      notificationStore.addNotification({
        type: 'success',
        message: 'Sweet Memories config successfully saved!'
      })

      mode.value = 'update'
    } else {
      notificationStore.addNotification({
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

const onInvalidSubmit = (errors) => {
  console.log(errors)
}

</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-[30%]">
    <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
      <h3 class="text-lg font-semibold">Sweet Memories Config</h3>
    </div>

    <Form
      :validation-schema="validationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <!-- Error Section -->
      <div v-if="sweetMemoriesErrors" class="w-full mb-4">
        <p class="text-red-500 font-semibold">
          {{ sweetMemoriesErrors }}
        </p>
      </div>

      <div class="flex flex-col gap-6">
        <!-- STD Title -->
        <div>
          <TextField
            v-model="sweetMemoriesStore.config.title"
            label="Title"
            name="title"
            show-error
            placeholder="Sweet Memories Title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <!-- STD Title -->
        <div>
          <TextField
            v-model="sweetMemoriesStore.config.subTitle"
            label="Sub Title"
            name="subTitle"
            show-error
            placeholder="Sweet Memories sub title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <ColorPickerField
            label="Background Color"
            classLabel="text-lg font-medium"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            name="backgroundColor"
            v-model="sweetMemoriesStore.config.backgroundColor"
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

        <div class="col-span-2">
          <NumberField
            label="Max Pictures"
            name="maxPictures"
            v-model="sweetMemoriesStore.config.maxPictures"
            :showError="true"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

      </div>

      <!-- Form Buttons -->
      <div class="mt-6 flex justify-end items-center gap-4">
        <button
          :disabled="loading"
          v-if="!isUpdate"
          type="submit"
          class="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        >
          <span v-if="loading">
            <CWMLoading />
            Saving...
          </span>
          <span v-else>
            Save Sweet Memories
          </span>
        </button>
        <button
          :disabled="loading"
          v-else
          type="submit"
          class="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        >
          <span v-if="loading">
            <CWMLoading />
            Updating...
          </span>
          <span v-else>
            Update Sweet Memories
          </span>
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
