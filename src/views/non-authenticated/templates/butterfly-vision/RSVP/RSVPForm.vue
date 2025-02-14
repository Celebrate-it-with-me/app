<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Form } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import TextField from '@/components/UI/form/TextField.vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import SelectField from '@/components/UI/form/SelectField.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
import CWMCompanionsModal from '@/views/non-authenticated/templates/butterfly-vision/RSVP/CWMCompanionsModal.vue'

const templateStore = useTemplateStore()
const { guest } = templateStore
const guests = [
  { value: 0, text: '00'},
  { value: 1, text: '01' },
  { value: 2, text: '02'},
  { value: 3, text: '03'},
  { value: 4, text: '04'},
  { value: 5, text: '05'},
  { value: 6, text: '06'},
]
const mealsAvailable = [
  { value: 'chicken_soup', text: 'Chicken Soup'},
  { value: 'motton_kabab', text: 'Motton Kabab'},
  { value: 'chicken_BBQ', text: 'Chicken BBQ'},
  { value: 'mix_salad', text: 'Mix Salad'},
  { value: 'beef_ribs', text: 'Beef Ribs'},
]

const showCompanionsModal = ref(false)

const rsvpState = reactive({
  name: '',
  email: '',
  attendingConfirm: 'yes',
  guestsSelected: '',
  mealPreference: ''
})

const rsvpValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      name: zod.string().min(1, {message: 'Name is required'}),
      email: zod.string().email({message: 'Email is required'}),
      attendingConfirm: zod.string().refine(value => ['yes', 'no'].includes(value)),
      guestsSelected: zod.string(),
      mealPreferences: zod.string()
    })
  )
})

const hasCompanions = computed(() => {
  return guest.companionType !== 'no_companion'
})

onMounted(() => {
  initGuestData()
})

const initGuestData = () => {
  rsvpState.name = `${guest.firstName} ${guest.lastName}`
  rsvpState.email = guest.email
  rsvpState.guestsSelected = guest.companionQty
}

const openCompanionsModal = () => {
  showCompanionsModal.value = true
}

</script>

<template>
  <Form
    :validation-schema="rsvpValidationSchema"
    class="max-w-md mx-auto flex flex-col gap-5"
  >
    <div class="relative z-0 w-full mb-5 group">
      <TextField
        v-model="rsvpState.name"
        name="name"
        id="name"
        required
        label=" "
        placeholder=" "
        class-input="block py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b
               border-gray-100 appearance-none dark:text-gray-900 dark:border-gray-600
               dark:focus:border-rose-400 focus:outline-none focus:ring-0 focus:border-rose-400 peer"
      />
      <label
        class="peer-focus:font-medium absolute text-lg ml-2 text-gray-500 dark:text-gray-400
               duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
               peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
               peer-focus:text-rose-400 peer-focus:dark:text-rose-400 peer-placeholder-shown:scale-100
               peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
      >
        Name
      </label
      >
    </div>
    <div class="relative z-0 w-full mb-5 group">
      <EmailField
        v-model="rsvpState.email"
        name="email"
        id="email"
        required
        label=" "
        placeholder=" "
        class-input="block py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b
               border-gray-100 appearance-none dark:text-gray-900 dark:border-gray-600
               dark:focus:border-rose-400 focus:outline-none focus:ring-0 focus:border-rose-400 peer"
      />
      <label
        class="peer-focus:font-medium absolute text-lg ml-2 text-gray-500 dark:text-gray-400
               duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0
               rtl:peer-focus:translate-x-1/4 peer-focus:text-rose-400 peer-focus:dark:text-rose-400
               peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75
               peer-focus:-translate-y-6"
      >Email</label
      >
    </div>

    <div class="relative z-0 w-full mb-2 group">
      <fieldset class="flex flex-row justify-between gap-4">
        <legend class="sr-only">Confirm</legend>

        <div class="flex items-center mb-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="rsvpState.attendingConfirm"
              type="radio"
              name="attendingConfirm"
              value="yes"
              class="hidden peer"
            />
            <span
              class="w-5 h-5 border-2 border-rose-500 rounded-full flex items-center justify-center peer-checked:border-rose-600 peer-checked:bg-rose-500"
            >
              <span
                class="w-2.5 h-2.5 bg-rose-600 rounded-full hidden peer-checked:block"
              >
              </span>
            </span>
            <span class="text-gray-700">Yes, I will be there</span>
          </label>
        </div>

        <div class="flex items-center mb-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="rsvpState.attendingConfirm"
              type="radio"
              name="attendingConfirm"
              value="no"
              class="hidden peer"
            />
            <span
              class="w-5 h-5 border-2 border-rose-500 rounded-full flex items-center justify-center peer-checked:border-rose-600 peer-checked:bg-rose-500"
            >
              <span
                class="w-2.5 h-2.5 bg-rose-600 rounded-full hidden peer-checked:block"
              >
              </span>
            </span>
            <span class="text-gray-700">Sorry, I can’t come</span>
          </label>
        </div>
      </fieldset>
    </div>

    <div
      class="relative z-0 w-full mb-5 group"
      v-if="hasCompanions"
    >
      <SelectField
        name="guestsSelected"
        v-model="rsvpState.guestsSelected"
        :items="guests"
        label="Companions"
        class-label="text-gray-900"
        class-input="block py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b
                     border-gray-100 appearance-none dark:text-gray-900 dark:border-gray-600
                     dark:focus:border-rose-400 focus:outline-none focus:ring-0
                     focus:border-rose-400 peer"
        options-class="text-gray-900"
      />
      <div class="w-full flex justify-end mt-2">
        <span
          class="text-gray-500 underline cursor-pointer text-xs"
          @click="openCompanionsModal"
        >Details</span>
      </div>
    </div>

    <div class="relative z-0 w-full mb-5 group">
      <SelectField
        name="mealPreference"
        v-model="rsvpState.mealPreference"
        :items="mealsAvailable"
        label="Meal Preference"
        class-label="text-gray-900"
        class-input="block py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b
                     border-gray-100 appearance-none dark:text-gray-900 dark:border-gray-600
                     dark:focus:border-rose-400 focus:outline-none focus:ring-0
                     focus:border-rose-400 peer"
        options-class="text-gray-900"
      />
    </div>

    <button
      type="submit"
      class="px-10 py-4 border-2 rounded-lg  font-bold transition-colors duration-500"
    >RSVP
    </button>

    <CWMCompanionsModal
      :show="showCompanionsModal"
      @close="showCompanionsModal = false"
    />

  </Form>
</template>
