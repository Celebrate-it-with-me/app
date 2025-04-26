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

          <div>
            <CInput
              v-model="stdStore.addToCalendar"
              label="Calendar Button"
              name="stdAddToCalendar"
              show-error
              placeholder="Add To Calendar"
              id="stdAddToCalendar"
            />

            <CAddToCalendarDetails
              v-model="stdStore.addToCalendarStyles"
            />
          </div>

          <div>
            <div class="countdown__section">
              <label class="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Use Countdown
              </label>
              <CToggle
                v-model="stdStore.useCountdown"
                name="useCountdown"
              />
            </div>

            <CCountDownDetails
              :disabled="!stdStore.useCountdown"
              :position="'start'"
              v-model="stdStore.countdownStyles"
            />
          </div>
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
import CTextDetails from '@/components/UI/form2/styles-details/CTextDetails.vue'
import CCountDownDetails from '@/components/UI/form2/styles-details/CCountDownDetails.vue'
import CAddToCalendarDetails from '@/components/UI/form2/styles-details/CAddToCalendarDetails.vue'

const stdStyles = reactive({
  title: { fontSize: '', color: '#000000', textAlign: 'center' },
  message: { fontSize: '', color: '#000000', textAlign: 'center' }
})

const stdStore = useSaveTheDateStore()

const stdValidationSchema = toTypedSchema(zod.object({
  title: zod.string().min(1, 'Title is required'),
  message: zod.string().optional(),
  useCountdown: zod.boolean().optional(),
  addToCalendar: zod.string().optional(),
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
