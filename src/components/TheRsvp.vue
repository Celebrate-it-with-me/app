<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  FwbButton,
  FwbInput,
  FwbRadio,
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow
} from 'flowbite-vue'
import { CWM_API } from '@/services/axios.js'
import PhoneConfirmationModal from '@/components/PhoneConfirmationModal.vue'

const rsvpCode = ref('')
const rsvpError = ref(false)
const rsvpErrorMessage = ref(false)
const rsvpServerErrorMessage = ref(false)
const showPhoneConfirmationModal = ref(false)
const mainGuest = ref(null)
const confirmed = ref(false)

// Watchers

watch(rsvpCode, newValue => {
  if (newValue) {
    rsvpError.value = false
    rsvpErrorMessage.value = false
    rsvpServerErrorMessage.value = false
  }
})

watch(mainGuest, newValue => {
  if (newValue) {
    let guests = newValue?.party_members

    if (typeof guests === 'string') {
      mainGuest.value.party_members = JSON.parse(guests)
      mainGuest.value.party_members.forEach(member => {
        member.confirmed = 'yes'
      })
    }
  }
})

// Methods
const resetInputRsvpError = () => {
  rsvpError.value = false
}

const handleConfirmed = () => {
  showPhoneConfirmationModal.value = false
  confirmed.value = true
}

const processCode = async () => {
  if (!rsvpCode.value || rsvpCode.value.length !== 4) {
    rsvpError.value = 'error'
    rsvpErrorMessage.value = true
    return
  }

  try {
    const response = await CWM_API.get(`rsvp/${rsvpCode.value}`)

    if (response.status >= 200 && response.status < 300) {
      mainGuest.value = response.data?.data ?? {}
      mainGuest.value.confirmed = 'yes'
    } else {
      rsvpError.value = 'error'
      if (response.response.status === 422) {
        rsvpServerErrorMessage.value = true
      } else {
        rsvpErrorMessage.value = true
      }
    }
  } catch (err) {
    console.log(err)
  }
}

const showPhoneModal = () => {
  showPhoneConfirmationModal.value = true
}

const handleCloseConfirmationModal = () => {
  showPhoneConfirmationModal.value = false
}
</script>

<template>
  <div class="rsvp-container">
    <div v-if="!mainGuest" class="code-container">
      <div class="code-input">
        <div class="flex flex-column items-center gap-2">
          <fwb-input
            v-model="rsvpCode"
            class="focus:border-red-300 focus:outline-none focus:ring-4 focus:ring-red-300"
            :placeholder="$t('accessCodePlaceholder')"
            :validation-status="rsvpError"
            @focus="resetInputRsvpError"
            @keyup.enter="processCode"
          >
          </fwb-input>
          <fwb-button
            class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 text-sm px-5 py-2.5 text-center me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            @click="processCode"
          >
            {{ $t('accessCodeSendButton') }}
          </fwb-button>
        </div>
        <p v-if="rsvpError === 'error'" class="text-red-500 error-message">
          <span v-if="rsvpErrorMessage">
            {{ $t('invalidAccessCode') }}
          </span>
          <span v-if="rsvpServerErrorMessage">
            {{ $t('serverErrorAccessCode') }}
          </span>
        </p>
      </div>
    </div>
    <div v-if="mainGuest" class="show-main-guest">
      <template v-if="!confirmed">
        <div class="details">
          <p class="text-white text-4xl text-center beauty-font main-title">Vanessa Rodriguez</p>

          <p class="text-white beauty-font main-second-title mt-3">
            {{ $t('celebration') }}
          </p>

          <p class="text-white text-4xl text-center lora-font">
            {{ $t('celebrationDate') }}
            <br />
            {{ $t('celebrationHours') }}
          </p>
        </div>

        <div class="guests">
          <div class="sub-details">
            <p class="text-white text-4xl text-center beauty-font main-second-title">
              {{ $t('ceremonyPlace') }}
            </p>

            <p class="text-white text-4xl text-center lora-font">
              {{ $t('ceremonyAddress1') }} <br />
            </p>

            <p class="text-white text-4xl text-center lora-font">
              {{ $t('ceremonyAddress2') }} <br />
            </p>

            <p class="text-white text-4xl text-center lora-font">
              {{ $t('reservedMessage1') }} {{ mainGuest.party_members.length + 1 }}
              {{ $t('reservedMessage2') }}<br />
            </p>
          </div>

          <hr class="mt-5 mb-5" />
          <fwb-table class="dark">
            <fwb-table-head>
              <fwb-table-head-cell>{{ $t('guestTable.name') }}</fwb-table-head-cell>
              <fwb-table-head-cell>{{ $t('guestTable.confirm') }}</fwb-table-head-cell>
            </fwb-table-head>
            <fwb-table-body>
              <fwb-table-row>
                <fwb-table-cell
                  >{{ mainGuest.first_name }} {{ mainGuest.last_name }}</fwb-table-cell
                >
                <fwb-table-cell class="flex">
                  <fwb-radio
                    v-model="mainGuest.confirmed"
                    :name="`${mainGuest.first_name}_radio`"
                    :label="$t('guestTable.confirmOptionYes')"
                    value="yes"
                  />
                  <fwb-radio
                    v-model="mainGuest.confirmed"
                    :name="`${mainGuest.first_name}_radio`"
                    :label="$t('guestTable.confirmOptionNo')"
                    value="no"
                  />
                </fwb-table-cell>
              </fwb-table-row>
              <fwb-table-row v-for="(member, index) in mainGuest.party_members">
                <fwb-table-cell>{{ member.name }}</fwb-table-cell>
                <fwb-table-cell class="flex">
                  <fwb-radio
                    v-model="member.confirmed"
                    :name="`${index}_radio`"
                    :label="$t('guestTable.confirmOptionYes')"
                    value="yes"
                  />
                  <fwb-radio
                    v-model="member.confirmed"
                    :name="`${index}_radio`"
                    :label="$t('guestTable.confirmOptionNo')"
                    value="no"
                  />
                </fwb-table-cell>
              </fwb-table-row>
            </fwb-table-body>
          </fwb-table>

          <div class="flex justify-center mt-5">
            <fwb-button
              class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 text-sm px-5 py-2.5 text-center me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
              @click="showPhoneModal"
            >
              {{ $t('guestTable.button') }}
            </fwb-button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="confirmation">
          <p class="beauty-font main-second-title">{{ $t('thanksMessage') }}</p>
        </div>
      </template>
    </div>
    <PhoneConfirmationModal
      :open="showPhoneConfirmationModal"
      :main-guest="mainGuest"
      @close-modal="handleCloseConfirmationModal"
      @confirmed="handleConfirmed"
    />
  </div>
</template>

<style scoped>
.details {
  width: 90%;
  background-color: rgba(55 65 81 / 40%);
  padding: 25px 20px 5px 20px;
}

.sub-details {
  background-color: rgba(55 65 81 / 40%);
  padding: 25px 20px 5px 20px;
}

.code-input {
  display: flex;
  flex-direction: column;
}
.confirmation {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.guests {
  width: 90%;
}
.code-container {
  background-image: url('../assets/images/background4.JPG');
  background-position: center;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
}

.show-main-guest {
  background-image: url('../assets/images/background3.png');
  background-position: 0 center;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
}

.code-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.show-main-guest {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
}

.error-message {
  color: #fff;
  width: 275px;
}

.main-title {
  font-size: 2.5rem;
}

.main-second-title {
  font-size: 1.5rem;
}

.sub-title {
  font-family: 'Beauty sans', sans-serif;
  font-size: 2em;
}

.lora-font {
  font-family: 'Lora sans', sans-serif;
  font-size: 1.2em;
  font-weight: lighter;
  text-align: center;
}

.beauty-font {
  font-family: 'Beauty sans', sans-serif;
  font-weight: lighter;
  text-align: center;
}

.text-gold {
  font-family: 'Beauty sans', sans-serif;
  letter-spacing: 5px;
  font-weight: bold;
  background-image: linear-gradient(
    to right,
    #462523 0,
    #cb9b51 22%,
    #f6e27a 45%,
    #f6f2c0 50%,
    #f6e27a 55%,
    #cb9b51 78%,
    #462523 100%
  );
  color: transparent;
  -webkit-background-clip: text;
}

.reservation-color {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.51);
}
</style>
