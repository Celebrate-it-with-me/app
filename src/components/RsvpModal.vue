<script setup>
import { FwbButton, FwbModal } from "flowbite-vue";
import {ref} from "vue";
import {CWM_API} from "@/services/axios";

const emit = defineEmits(['closeModal', 'confirmed']);
const sending = ref(false)

const props = defineProps({
  open: {
    type: Boolean,
    required: false,
    default: false
  },
  mainGuest: {
    type: Object,
    required: false,
  }
})
const closeModal = () => {
  emit('closeModal');
}

const sendConfirmation = async () => {
  sending.value = true;

  try {
    const response = await CWM_API.post(`rsvp/confirm`, {
      mainGuest: props.mainGuest,
    });

    if (response.status >= 200 && response.status < 300) {
      emit('confirmed');
    }
  } catch (err) {
    console.log(err);
  }
}


</script>

<template>
  <fwb-modal
      class="dark"
      persistent
      v-if="open"
      @close="closeModal"
  >
    <template #body>
      <div>
        <p>
          {{ $t('rsvpModal.text') }}
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="closeModal" color="alternative">
          {{ $t('rsvpModal.cancelButton') }}
        </fwb-button>
        <fwb-button @click="sendConfirmation" color="red">
          {{ $t('rsvpModal.acceptButton') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<style scoped>
.lora-font {
  font-family: "Lora sans",sans-serif;
  font-size: 1.3em;
  font-weight: lighter;
  text-align: center;
}

.beauty-font {
  font-family: "Beauty sans",sans-serif;
  font-size: 1.3em;
  font-weight: lighter;
  text-align: center;
}
</style>
