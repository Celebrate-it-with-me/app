<script setup>
import {FwbButton, FwbInput, FwbModal} from "flowbite-vue";
import {onMounted, ref, watch} from "vue";
import {CWM_API} from "@/services/axios";
import 'add-to-calendar-button';

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
});

const phoneNumber = ref('');
const stepSelected = ref(1);
const confirmationError = ref(false);

watch(
  () => props.mainGuest,
  (newValue) => {
    phoneNumber.value = newValue.phone_number;
  }
)

watch(stepSelected, (newValue, oldValue) => {
  if (newValue === 2 && oldValue === 1) {
    updateConfirmPhoneNumber();
  }
})

const updateConfirmPhoneNumber = async () => {
  const response = await CWM_API.post('rsvp/updateConfirmPhone', {
    phoneNumber: phoneNumber.value,
    mainGuestId: props.mainGuest.id
  })

  if (response.status < 200 || response.status > 300) {
    confirmationError.value = true;
  }
}

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

const nextStep = () => {
  stepSelected.value = stepSelected.value + 1;
}

const submitPhoneConfirmation = () => {

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
      <div class="update-phone" v-if="stepSelected === 1">
        <p>
          Please confirm or update your phone number.
        </p>

        <form @submit.prevent="submitPhoneConfirmation">

          <fwb-input
            class="focus:border-red-300 focus:outline-none focus:ring-4 focus:ring-red-300"
            v-model="phoneNumber"
            label="Phone Number"
          />

        </form>
      </div>
      <div class="setup-calendar" v-if="stepSelected === 2">
        <p>Please add this event to your calendar</p>

        <add-to-calendar-button
            name="Vanessa's Quince Celebration"
            options="'Apple','Google', 'iCal', 'Microsoft365', 'MicrosoftTeams', 'Outlook.com', 'Yahoo'"
            location="Miami, FL"
            startDate="2024-08-02"
            endDate="2024-08-02"
            startTime="18:00"
            endTime="23:59"
            timeZone="America/New_York"
            listStyle="dropdown-static"
            label="'Add to calendar'"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="closeModal" color="alternative">
          {{ $t('rsvpModal.cancelButton') }}
        </fwb-button>
        <fwb-button @click="nextStep" color="red">
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
