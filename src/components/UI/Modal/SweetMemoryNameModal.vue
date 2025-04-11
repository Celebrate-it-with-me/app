<script setup>
import CWMModal from '@/components/UI/Modal/CWMModal.vue'
import { computed, ref, watch } from 'vue'
import { Form } from 'vee-validate'
import TextField from '@/components/UI/form/TextField.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'
import { useUserStore } from '@/stores/useUserStore'

const emit = defineEmits(['closeModal', 'nameUpdated'])
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  imageFile: {
    type: Object,
    required: true
  }
})

const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      name: zod.string(),
    })
  )
})

const loading = ref(false)
const showModal = ref(props.open)
const name = ref(props.imageFile.name)
const sweetMemoriesStore = useSweetMemoriesStore()
const currentUserStore = useUserStore()

const handleClose = () => {
  emit('closeModal')
}

const updateName = async () => {
  try {
    loading.value = true

    const response = await sweetMemoriesStore.updateImageName(props.imageFile.id, name.value)

    if (response.status === 200) {
      await sweetMemoriesStore.loadSweetMemoriesImages(currentUserStore.currentEventId)
      handleClose()
    } else {
      console.error(response)
    }

  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

const onInvalidSubmit = (error) => {
  console.log(error)
}

watch(
  () => props.open,
  (newValue) => {
    showModal.value = newValue
  }
)
</script>

<template>
  <CWMModal :show-modal="showModal" @close="handleClose">
    <template #header> Edit Image Name </template>

    <template #body>
      <div
        class="flex flex-col gap-y-4"
      >
        <Form
          :validation-schema="validationSchema"
          @submit="updateName"
          @invalid-submit="onInvalidSubmit"
        >
          <TextField
            v-model="name"
            label="Image Name"
            name="imageName"
            show-error
            placeholder="Enter image name"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-blue-400`"
            class-label="peer-focus:font-medium absolute text-xl mb-2 text-[#754e9e] font-semibold
                            duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
                            peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
                            peer-focus:text-rose-400 peer-focus:dark:text-rose-400 peer-placeholder-shown:scale-100
                            peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          />
        </Form>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <div class="action-container flex gap-x-2">
          <button
            type="button"
            class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-6 rounded-md"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="text-white text-sm font-medium py-2 px-6 rounded-md bg-red-500 hover:bg-red-600 cursor-pointer"
            @click="updateName"
          >
            Update
          </button>
        </div>
      </div>
    </template>
  </CWMModal>
</template>

<style scoped></style>
