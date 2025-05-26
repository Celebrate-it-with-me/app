<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import { Form } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const emit = defineEmits(['closeModal'])
const collaboratorStore = useCollaboratorsStore()
const notificationStore = useNotificationStore()
const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
})

const collaboratorRoles = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
]

const showCollaboratorModal = ref(false)
const newCollaborator = reactive({
  email: '',
  role: 'editor'
})

const collaboratorValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      email: zod.string({message: 'Email is required'}).email({message: 'Must be a valid email'}),
      role: zod.enum(['viewer', 'editor'], {message: 'Role is required'}),
    })
  )
})

const onSubmit = async (fields) => {
  try {
    console.log(fields)
    const result = await collaboratorStore.inviteCollaborator(newCollaborator)

    if (!result) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to invite collaborator'
      })
      return;
    }

    handleClose()
    notificationStore.addNotification({
      type: 'success',
      message: 'Collaborator invited successfully'
    })

  } catch (error) {
    console.log(error)
  }
}

const onInvalidSubmit = (errors) => {
  console.log('errors', errors)
}

const handleClose = () => {
  cleanForm()
  emit('closeModal')
}

const cleanForm = () => {
  newCollaborator.email = ''
  newCollaborator.role = 'editor'
}

onMounted(() => {
  showCollaboratorModal.value = props.open
})


watch(() => props.open, (newValue) => {
  showCollaboratorModal.value = newValue
})

watch(showCollaboratorModal, (newValue) => {
  if (!newValue) {
    handleClose()
  }
})

</script>

<template>
  <CModal
    v-model="showCollaboratorModal"
    showCloseIcon
    :showFooter="false"
  >
    <template #title>Add Collaborator</template>

    <Form
      :validation-schema="collaboratorValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="space-y-4">
        <div class="mb-4">
          <CInput
            id="collaboratorEmail"
            name="email"
            label="Email"
            v-model="newCollaborator.email"
            show-error
            type="email"
            placeholder="Enter collaborator email"
          />
        </div>

        <div class="mb-4">
          <CSelect
            id="collaboratorRole"
            :options="collaboratorRoles"
            v-model="newCollaborator.role"
            name="role"
            show-error
            label="Role"
            placeholder="Select role"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Viewers can only view the event. Editors can make changes to the event.
          </p>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <CButton variant="ghost" @click="handleClose">Cancel</CButton>
        <CButton type="submit" variant="gradient">Add Collaborator</CButton>
      </div>
    </Form>
  </CModal>
</template>

<style scoped>

</style>
