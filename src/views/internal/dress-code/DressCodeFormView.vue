<script setup>
import { FileText, Image, Palette } from 'lucide-vue-next'
import CSimpleColor from '@/components/UI/form2/CSimpleColor.vue'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CImageUpload from '@/components/UI/form2/CImageUpload.vue'

import { reactive, ref, computed, onMounted } from 'vue'
import { Form } from 'vee-validate'
import * as zod from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useDressCodeStore } from '@/stores/useDressCodeStore'

const dressCodeOptions = [
  { label: 'Formal', value: 'formal' },
  { label: 'Semi-formal', value: 'semi-formal' },
  { label: 'Casual', value: 'casual' },
  { label: 'Thematic', value: 'thematic' },
  { label: 'Black Tie', value: 'black-tie' }
]

const dressCodeStore = useDressCodeStore()
const isEditMode = computed(() => dressCodeStore.hasDressCode)
const sending = ref(false)
const emit = defineEmits(['formSubmitted', 'formCancelled'])

const form = reactive({
  dressCodeType: '',
  description: '',
  reservedColors: [],
  dressCodeImages: []
})

const validationSchema = toTypedSchema(
  zod.object({
    dressCodeType: zod.string().min(1, 'Dress code type is required'),
    description: zod.string().max(500, 'Description cannot exceed 500 characters'),
    reservedColors: zod
      .array(zod.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid color format'))
      .min(1, 'At least one reserved color is required'),
    dressCodeImages: zod
      .array(zod.any())
      .optional()
      .refine(
        files => !files || files.every(file =>
          (file instanceof File && file.type.startsWith('image/')) ||
          (file && typeof file === 'object' && file.imagePath)
        ),
        'Only image files or image objects are allowed'
      )
  })
)

onMounted(() => {
  if (isEditMode.value) {
    const existing = dressCodeStore.dressCode
    form.dressCodeType = existing.dressCodeType || ''
    form.description = existing.description || ''
    form.reservedColors = [...(existing.reservedColors || [])]
    form.dressCodeImages = [...(existing.dressCodeImages || [])]
  }
})

const handleSubmit = async (values) => {
  try {
    sending.value = true
    const action = isEditMode.value ? dressCodeStore.updateDressCode : dressCodeStore.addDressCode
    const response = await action({ ...values })

    if (response.status >= 200 && response.status < 300) {
      await dressCodeStore.loadDressCode()
      emit('formSubmitted')
    }
  } catch (error) {
    console.error('Error submitting dress code:', error)
  } finally {
    sending.value = false
  }
}

const onInvalidSubmit = (ctx) => {
  console.error('Form submission errors:', ctx.errors)
}
</script>

<template>
  <CCard class="mb-6">
    <Form
      :validation-schema="validationSchema"
      @submit="handleSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Dress Code Type -->
        <div class="col-span-1">
          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            <div class="flex items-center gap-2">
              <span>Dress Code Type</span>
            </div>
          </label>
          <CSelect
            v-model="form.dressCodeType"
            :options="dressCodeOptions"
            placeholder="Select dress code type"
            class="w-full"
            name="dressCodeType"
            id="dressCodeType"
          />
        </div>

        <!-- Reserved Colors -->
        <div class="col-span-1">
          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            <div class="flex items-center gap-2">
              <Palette class="w-5 h-5" />
              <span>Reserved Colors</span>
            </div>
          </label>
          <CSimpleColor
            v-model="form.reservedColors"
            name="reservedColors"
            id="reservedColors"
          />
        </div>

        <!-- Description -->
        <div class="col-span-1 md:col-span-2">
          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            <div class="flex items-center gap-2">
              <FileText class="w-5 h-5" />
              <span>Description</span>
            </div>
          </label>
          <CTextarea
            v-model="form.description"
            :rows="4"
            placeholder="Provide details about the dress code requirements..."
            class="w-full"
            name="description"
            id="description"
          />
        </div>

        <!-- Image Upload -->
        <div class="col-span-1 md:col-span-2">
          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            <div class="flex items-center gap-2">
              <Image class="w-5 h-5" />
              <span>Reference Images</span>
            </div>
          </label>
          <CImageUpload
            v-model="form.dressCodeImages"
            name="dressCodeImages"
            id="dressCodeImages"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 mt-8">
        <CButton variant="outline" type="button" @click="emit('formCancelled')">
          Cancel
        </CButton>
        <CButton variant="primary" type="submit" :disabled="sending">
          {{ sending ? 'Saving...' : (isEditMode ? 'Update Dress Code' : 'Save Dress Code') }}
        </CButton>
      </div>
    </Form>
  </CCard>
</template>
