import { useDressCodeStore } from '@/modules/dress-code/stores/useDressCodeStore'
import { computed, onMounted, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

export function useDressCodeForm(emit) {
  // Character count for description
  const descriptionLength = computed(() => form.description?.length || 0)
  const descriptionMaxLength = 500

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
          files =>
            !files ||
            files.every(
              file =>
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

  const handleSubmit = async values => {
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

  const onInvalidSubmit = ctx => {
    console.error('Form submission errors:', ctx.errors)
  }

  return {
    form,
    sending,
    validationSchema,
    descriptionLength,
    descriptionMaxLength,
    dressCodeOptions,
    isEditMode,
    handleSubmit,
    onInvalidSubmit
  }
}
