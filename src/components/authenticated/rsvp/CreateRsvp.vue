<script setup>
import TextField from '@/components/UI/form/TextField.vue'
import { reactive } from 'vue'
import { Form } from 'vee-validate'
import TextAreaField from '@/components/UI/form/TextAreaField.vue'

const rsvpState = reactive({
  title: 'Are you Attending',
  description: `My Quinceañera is on September 27, 2025, and I’d be delighted to celebrate with you!
              Come ready to dance, smile, and enjoy the party. Please confirm by September 20, 2025.`
})
</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-[30%]">
    <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
      <h3 class="text-lg font-semibold">RSVP Creator</h3>
    </div>

    <div class="w-full flex flex-col">
      <Form>
        <div>
          <TextField
            v-model="rsvpState.title"
            label="Title"
            name="title"
            show-error
            placeholder="RSVP Title"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div></div>
      </Form>
    </div>
  </div>
</template>

<style scoped></style>
