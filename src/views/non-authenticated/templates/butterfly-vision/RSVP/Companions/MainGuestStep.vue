<script setup>
import { Form } from 'vee-validate'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import TextField from '@/components/UI/form/TextField.vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
import ConfirmationField from '@/components/UI/form/ConfirmationField.vue'
import GuestMenuSelection from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/GuestMenuSelection.vue'

const mainGuestStep = ref(1)
const confirmationError = ref(false)
const emit = defineEmits(['goToNext'])
const mainGuestState = reactive({
  name: '',
  email: '',
  phone: '',
  rsvpStatus: '',
  mealPreference: ''
})

const templateStore = useTemplateStore()
const mainGuestValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      name: zod.string().min(1, 'First Name is required'),
      email: zod.string().email({ message: 'Invalid email address' }).optional(),
      phone: zod
        .string()
        .regex(/^[0-9]*$/, { message: 'Phone Number must be numeric' })
        .optional(),
      rsvpStatus: zod.enum(['attending', 'not-attending'], {
        required_error: 'Please select a confirmation option'
      })
    })
  )
})

const guestMenu = computed(() => {
  if (templateStore.guest.menuSelected.length) {
    return templateStore.guest.menuSelected
  }

  return templateStore.event.mainMenu
})

onMounted(() => {
  mainGuestState.name = templateStore.guest?.name ?? ''
  mainGuestState.email = templateStore.guest?.email ?? ''
  mainGuestState.phone = templateStore.guest?.phone ?? ''
  mainGuestState.mealPreference = templateStore.guest?.mealPreference ?? 0
  mainGuestState.rsvpStatus = templateStore.guest?.rsvpStatus ?? 'pending'
})

const onSubmit = () => {
  templateStore.initRsvpGuestData(mainGuestState)

  if (templateStore.event.hasMenu && mainGuestState.rsvpStatus === 'attending') {
    mainGuestStep.value = 2
  } else {
    emit('goToNext')
  }
}

const onInvalidSubmit = error => {
  console.log(error)

  if (error.errors?.confirmed) {
    confirmationError.value = true
  }
}

const handleGoBack = () => {
  mainGuestStep.value = 1
}

const handleUpdateGuestMenu = payload => {
  templateStore.updateGuestMenu(payload)
  emit('goToNext')
}

watch(
  () => mainGuestState.rsvpStatus,
  () => {
    confirmationError.value = false
  }
)
</script>

<template>
  <div class="main__guest-container w-full flex flex-col items-center">
    <div class="form-container w-full shadow-md sm:rounded-lg p-4 md:p-10">
      <div
        class="form-title flex justify-center items-center text-dark-blue font-extralight text-2xl"
      >
        <h3>Main Guest</h3>
      </div>
      <Form
        v-if="mainGuestStep === 1"
        :validation-schema="mainGuestValidationSchema"
        class="flex flex-col gap-5 mt-8"
        @submit="onSubmit"
        @invalid-submit="onInvalidSubmit"
      >
        <div class="first-row flex flex-row gap-x-5">
          <div class="relative z-0 w-full mb-5 group">
            <TextField
              id="name"
              v-model="mainGuestState.name"
              name="name"
              required
              disabled
              :show-error="true"
              label="Name"
              placeholder=" "
              class-input="block py-2.5 px-0 w-full text-md text-dark-blue bg-transparent border-0 border-b
               border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-600
               dark:focus:border-[#dba3ff] focus:outline-none focus:ring-0 focus:border-[#dba3ff] peer"
              class-label="peer-focus:font-medium absolute text-xl mb-2 text-[#754e9e] font-semibold
                           duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
                           peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
                           peer-focus:text-rose-400 peer-focus:dark:text-rose-400 peer-placeholder-shown:scale-100
                           peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            />
          </div>
        </div>

        <div class="second-row flex flex-row gap-x-5">
          <div class="relative z-0 w-full mb-5 group">
            <EmailField
              id="email"
              v-model="mainGuestState.email"
              name="email"
              required
              :show-error="true"
              label="Email"
              placeholder="Email"
              class-input="block py-2.5 px-0 w-full text-md text-dark-blue bg-transparent border-0 border-b
               border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-600
               dark:focus:border-rose-400 focus:outline-none focus:ring-0 focus:border-[#dba3ff] peer"
              class-label="peer-focus:font-medium absolute text-xl text-[#754e9e] font-semibold
               duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
               peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
               peer-focus:text-rose-400 peer-focus:dark:text-rose-400 peer-placeholder-shown:scale-100
               peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            />
          </div>
        </div>

        <div class="second-row flex flex-row gap-x-5">
          <div class="relative z-0 w-full mb-5 group">
            <TextField
              id="phoneNumber"
              v-model="mainGuestState.phone"
              name="phoneNumber"
              required
              :show-error="true"
              label="Phone Number"
              placeholder=" "
              class-input="block py-2.5 px-0 w-full text-md text-dark-blue bg-transparent border-0 border-b
               border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-600
               dark:focus:border-rose-400 focus:outline-none focus:ring-0 focus:border-[#dba3ff] peer"
              class-label="peer-focus:font-medium absolute text-xl text-[#754e9e] font-semibold
               duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
               peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
               peer-focus:text-rose-400 peer-focus:dark:text-rose-400 peer-placeholder-shown:scale-100
               peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            />
          </div>
        </div>

        <div class="third-row flex flex-row items-center gap-x-5">
          <div class="relative z-0 mb-2 group">
            <ConfirmationField
              v-model="mainGuestState.rsvpStatus"
              name="rsvpStatus"
              label=""
              :show-error="true"
              :options="[
                { value: 'attending', label: 'Yes, I will be there' },
                { value: 'not-attending', label: 'Sorry, I can’t come' }
              ]"
            />
          </div>
        </div>
        <div class="action-button w-full flex flew-row justify-end">
          <button
            class="px-6 py-2 border-2 font-bold"
            style="
              font-family: inherit;
              color: #dba3ff;
              background-color: transparent;
              border-color: #dba3ff;
              border-radius: 8px;
            "
          >
            Next
          </button>
        </div>
      </Form>
      <div v-if="mainGuestStep === 2">
        <GuestMenuSelection
          :guest="templateStore.guest"
          :menu="guestMenu"
          @update:go-back="handleGoBack"
          @update:guest-menu="handleUpdateGuestMenu"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
