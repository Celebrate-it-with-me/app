<script setup>
import { reactive, defineEmits, defineProps, computed, ref } from 'vue'
import { Trash2, Save, X } from 'lucide-vue-next'

import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CImageUpload from '@/components/UI/form2/CImageUpload.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { Form } from 'vee-validate'

const formErrors = ref(null)
const emit = defineEmits(['save', 'delete', 'cancel'])
const props = defineProps({
  initialMemory: {
    type: Object,
    default: () => ({
      id: null,
      imageUrl: '',
      title: '',
      description: '',
      year: '',
      visible: true
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      title: zod
        .string()
        .min(1, 'Title field is required')
        .max(100, 'Title cannot exceed 100 characters'),
      year: zod.string().optional(),
      description: zod.string().max(500, 'Description cannot exceed 500 characters').optional(),
      visible: zod.boolean().optional().default(false)
    })
  )
})

const memory = reactive({
  ...props.initialMemory,
  image: []
})

const handleImageUpload = files => {
  if (files.length > 0) {
    const file = files[0]
    memory.imageUrl = URL.createObjectURL(file)
  }
}

const handleDelete = () => {
  emit('delete', memory)
}

const saveMemory = () => {
  emit('save', { ...memory })
}

const cancelEdit = () => {
  emit('cancel')
}

const onSubmit = fields => {
  console.log(fields, memory)
}

const invalidSubmit = errors => {
  console.error('Form submission failed:', errors)
}
</script>

<template>
  <Form :validation-schema="validationSchema" @submit="onSubmit" @invalid-submit="invalidSubmit">
    <CCard class="relative">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <CImageUpload
              v-model="memory.image"
              :max-images="1"
              name="image"
              label="Memory Photo"
              description="Upload a photo for this memory"
              class="mb-4"
              @update:model-value="handleImageUpload"
            />
          </div>

          <!-- Memory Details -->
          <div class="space-y-4">
            <CInput
              id="memory-title"
              v-model="memory.title"
              name="title"
              label="Title"
              placeholder="e.g., First Day of School"
              show-error
            />
            <CInput
              id="memory-year"
              v-model="memory.year"
              label="Year or Age (Optional)"
              placeholder="e.g., 2010 or Age 6"
              name="year"
              show-error
            />
            <CTextarea
              id="memory-description"
              v-model="memory.description"
              name="description"
              label="Description (Optional)"
              placeholder="Share the story behind this memory..."
              :rows="4"
              show-error
            />
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <CToggle id="memory-visible" v-model="memory.visible" name="visible" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {{ memory.visible ? 'Visible' : 'Hidden' }}
              </span>
              </div>
              <div class="flex space-x-2">
                <CButton
                  v-if="isEditing"
                  variant="danger"
                  size="sm"
                  class="flex items-center"
                  @click="handleDelete"
                >
                  <Trash2 class="w-4 h-4 mr-1" />
                  Delete
                </CButton>
                <CButton
                  variant="secondary"
                  size="sm"
                  class="flex items-center"
                  @click="cancelEdit"
                >
                  <X class="w-4 h-4 mr-1" />
                  Cancel
                </CButton>
                <CButton variant="primary" size="sm" class="flex items-center" type="submit">
                  <Save class="w-4 h-4 mr-1" />
                  Save
                </CButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CCard>
  </Form>
</template>
