<script setup>
import {FwbButton, FwbInput, FwbModal} from "flowbite-vue";
import {computed, onMounted, ref, watch} from "vue";
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

watch(() => props.open, (newValue) => {
  if (newValue) {
    if (isAllNo.value) {
      stepSelected.value = 4;
    } else {
      stepSelected.value = 1;
    }
  }
})

const noMainGuestButMember = computed(() => {
  if (props.mainGuest.confirmed === 'yes') {
    return false;
  }

  let memberYes = false;
  props.mainGuest.party_members.forEach((member) => {
    if (member.confirmed === 'yes') {
      memberYes = true;
    }
  });

  return memberYes;
});

const showCancelButton = computed(() => {
  if (isAllNo) {
    return true;
  }

  return stepSelected.value === 1;
});

const showBackButton = computed(() => {
  if (isAllNo) {
    return false;
  }

  return stepSelected.value !== 1;
});

const isAllNo = computed(() => {
  if (props.mainGuest.confirmed !== 'no') {
    return false;
  }

  if (props.mainGuest.party_members.length === 0) {
    return true;
  }

  let allNo = true;

  props.mainGuest.party_members.forEach((member) => {
    if (member.confirmed === 'yes') {
      allNo = false;
    }
  });

  return allNo;
})

const closeModal = () => {
  emit('closeModal');
}

const nextStep = () => {
  if (stepSelected.value < 4) {
    stepSelected.value = stepSelected.value + 1;
  }
}

const backStep = () => {
  if (stepSelected.value > 1) {
    stepSelected.value = stepSelected.value - 1;
  }
}

const sendConfirmation = async () => {
  sending.value = true;

  try {
    const response = await CWM_API.post(`rsvp/confirm`, {
      mainGuest: props.mainGuest,
      phoneConfirmed: phoneNumber.value,
      noMainGuestButMember: noMainGuestButMember.value,
      isAllNo: isAllNo.value
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
      <div class="color-reservation" v-if="stepSelected === 1">
        <p>
          {{ $t('dressCodeSentence') }}
        </p>
        <br />
        <p>
          {{ $t('colorReservation') }}
        </p>
      </div>

      <div class="update-phone" v-if="stepSelected === 2">
        <p v-if="noMainGuestButMember">
          {{ $t('phoneConfirmationLabelMember') }}
        </p>
        <p v-else>
          {{ $t('phoneConfirmationLabel') }}
        </p>

        <form>
          <fwb-input
            class="focus:border-red-300 focus:outline-none focus:ring-4 focus:ring-red-300"
            v-model="phoneNumber"
          />

        </form>
      </div>
      <div class="setup-calendar" v-if="stepSelected === 3">
        <p>{{ $t('addToCalendarLabel') }}</p>

        <add-to-calendar-button
            name="Vanessa's Quince Celebration"
            options="'Apple','Google', 'iCal', 'Microsoft365', 'MicrosoftTeams', 'Outlook.com', 'Yahoo'"
            location="Miami, FL"
            startDate="2024-08-02"
            endDate="2024-08-03"
            startTime="18:40"
            endTime="01:00"
            timeZone="America/New_York"
            listStyle="dropdown-static"
            label="'Add to calendar'"
        />
      </div>
      <div v-if="stepSelected === 4">
        <p>
          {{ $t('rsvpModal.text') }}
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <fwb-button
          @click="closeModal"
          color="alternative"
          v-if="showCancelButton"
        >
          {{ $t('rsvpModal.cancelButton') }}
        </fwb-button>
        <fwb-button
          @click="backStep"
          color="alternative"
          v-if="showBackButton"
        >
          {{ $t('rsvpModal.backButton') }}
        </fwb-button>

        <fwb-button
          @click="nextStep"
          color="red"
          v-if="stepSelected !== 4"
        >
          {{ $t('rsvpModal.nextButton') }}
        </fwb-button>
        <fwb-button
          @click="sendConfirmation"
          color="red"
          v-else
        >
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
