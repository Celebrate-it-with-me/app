<script setup lang="ts">
import { ref, watch } from 'vue';
import {FwbButton, FwbInput} from "flowbite-vue";
import { CWM_API } from '@/services/axios.js'
import RsvpModal from "@/components/RsvpModal.vue";

const rsvpCode = ref("")
const rsvpError = ref('')
const rsvpErrorMessage = ref('Please enter a valid code')
const showRsvp = ref(false)
const mainGuest = ref({})

const processCode = async () => {
  if (!rsvpCode.value || rsvpCode.value.length !== 4) {
    rsvpError.value = 'error'
    return;
  }

  try {
    const response = await CWM_API.get(`rsvp/${rsvpCode.value}`);

    if (response.status >= 200 && response.status < 300) {
      showRsvp.value = true
      mainGuest.value = response.data?.data ?? {}
      console.log(response);
    } else {
      console.log(response.response.data.data);
      rsvpError.value = 'error';
      rsvpErrorMessage.value = response.response?.data?.data ?? 'Invalid code, please try again'
    }

  } catch (err) {
    console.log(err);
  }

}

watch(rsvpCode, (newValue) => {
  if (newValue) {
    rsvpError.value = false
  }
})

const resetInputRsvpError = () => {
  rsvpError.value = false
}

const handleCloseModal = () => {
  showRsvp.value = false;
}
</script>

<template>
  <div class="container">
    <div class="flex flex-auto gap-2">
      <fwb-input
          v-model="rsvpCode"
          placeholder="Enter your code"
          :validation-status="rsvpError"
          @focus="resetInputRsvpError"
      >
      </fwb-input>
      <fwb-button
        gradient="purple-pink"
        @click="processCode"
      >
        Enviar
      </fwb-button>
    </div>
    <div>
      <p v-if="rsvpError === 'error'" class="text-red-500">
        {{ rsvpErrorMessage }}
      </p>
    </div>
    <RsvpModal
      :open="showRsvp"
      :main-guest="mainGuest"
      @closeModal="handleCloseModal"
    ></RsvpModal>
  </div>
</template>

<style scoped>

</style>
