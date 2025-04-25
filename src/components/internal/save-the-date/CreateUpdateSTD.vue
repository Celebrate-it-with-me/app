<template>
  <div class="space-y-6">
    <div class="std-section bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-200 dark:border-gray-700 p-6">
      <Form :validation-schema="stdValidationSchema" @submit="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <CInput
              v-model="stdStore.title"
              label="Title"
              name="stdTitle"
              show-error
              placeholder="Save the Date Title"
              id="stdTitle"
            />

            <CTextDetails
              :disabled="stdStore.title.length <= 0"
              v-model="stdStore.titleStyles"
            />
          </div>

          <div>
            <CInput
              v-model="stdStore.message"
              label="Message"
              name="stdMessage"
              show-error
              placeholder="Save the Date subtitle"
              id="stdMessage"
            />

            <CTextDetails
              :disabled="stdStore.message.length <= 0"
              v-model="stdStore.messageStyles"
            />
          </div>

          <CToggle label="Use Countdown" v-model="stdStore.useCountdown" name="useCountdown" />
          <CToggle label="Use Add To Calendar" v-model="stdStore.useAddToCalendar" name="useAddToCalendar" />
        </div>

        <div class="mt-8 flex justify-end">
          <CButton type="submit" variant="primary">Save STD</CButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Form } from 'vee-validate'
import * as zod from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'
import CDetailsPanel from '@/components/UI/form2/styles-details/CDetailsPanel.vue'
import CTextDetails from '@/components/UI/form2/styles-details/CTextDetails.vue'

const stdStyles = reactive({
  title: { fontSize: '', color: '#000000', textAlign: 'center' },
  message: { fontSize: '', color: '#000000', textAlign: 'center' }
})

const stdStore = useSaveTheDateStore()
const showTitleDetails = ref(false)
const showMessageDetails = ref(false)

const stdValidationSchema = toTypedSchema(zod.object({
  title: zod.string().min(1, 'Title is required'),
  message: zod.string().optional(),
  useCountdown: zod.boolean().optional(),
  useAddToCalendar: zod.boolean().optional(),
}))

const onSubmit = () => {
  console.log('Submitting:', stdState, stdStyles)
  // Aquí podrías emitir el stdStyles junto al stdState para ser guardado en backend
}
</script>

<style scoped>
.input-style {
  @apply border border-gray-300 rounded px-3 py-1 text-sm w-full;
}
</style>
