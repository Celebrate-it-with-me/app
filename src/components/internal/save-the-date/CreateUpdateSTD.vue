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
            <div class="flex justify-end">
              <CButton variant="link" size="xs" @click="showTitleDetails = !showTitleDetails">
                {{ showTitleDetails ? '- Details' : '+ Details' }}
              </CButton>
            </div>


            <div v-if="showTitleDetails" class="mt-4 space-y-3">
              <label class="block text-sm">Font Size</label>
              <input v-model="stdStore.titleStyles.fontSize" type="text" placeholder="e.g. 32px" class="input-style" />

              <label class="block text-sm">Font Color</label>
              <input v-model="stdStore.titleStyles.color" type="color" class="w-12 h-8" />

              <label class="block text-sm">Font Weight</label>
              <select v-model="stdStore.titleStyles.fontWeight" class="input-style">
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Lighter</option>
                <option value="bolder">Bolder</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </select>

              <label class="block text-sm">Font Family</label>
              <select v-model="stdStore.titleStyles.fontFamily" class="input-style">
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                <option value="'Trebuchet MS', Helvetica, sans-serif">Trebuchet MS</option>
                <option value="Verdana, Geneva, sans-serif">Verdana</option>
                <option value="'Courier New', Courier, monospace">Courier New</option>
                <option value="'Times New Roman', Times, serif">Times New Roman</option>
              </select>

              <label class="block text-sm">Alignment</label>
              <select v-model="stdStore.titleStyles.textAlign" class="input-style">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
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
            <div class="flex justify-end">
              <CButton variant="link" size="xs" @click="showMessageDetails = !showMessageDetails">
                {{ showMessageDetails ? '- Details' : '+ Details' }}
              </CButton>
            </div>

            <div v-if="showMessageDetails" class="mt-4 space-y-3">
              <label class="block text-sm">Font Size</label>
              <input v-model="stdStore.messageStyles.fontSize" type="text" placeholder="e.g. 32px" class="input-style" />

              <label class="block text-sm">Font Color</label>
              <input v-model="stdStore.messageStyles.color" type="color" class="w-12 h-8" />

              <label class="block text-sm">Font Weight</label>
              <select v-model="stdStore.messageStyles.fontWeight" class="input-style">
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Lighter</option>
                <option value="bolder">Bolder</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </select>

              <label class="block text-sm">Font Family</label>
              <select v-model="stdStore.messageStyles.fontFamily" class="input-style">
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                <option value="'Trebuchet MS', Helvetica, sans-serif">Trebuchet MS</option>
                <option value="Verdana, Geneva, sans-serif">Verdana</option>
                <option value="'Courier New', Courier, monospace">Courier New</option>
                <option value="'Times New Roman', Times, serif">Times New Roman</option>
              </select>

              <label class="block text-sm">Alignment</label>
              <select v-model="stdStore.messageStyles.textAlign" class="input-style">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
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
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'

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
