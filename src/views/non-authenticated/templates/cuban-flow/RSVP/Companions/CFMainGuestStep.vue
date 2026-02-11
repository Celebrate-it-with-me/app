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
      name: zod.string().min(1, 'El nombre es obligatorio'),
      email: zod.string().email({ message: 'Correo electrónico inválido' }).optional(),
      phone: zod
        .string()
        .regex(/^[0-9]*$/, { message: 'El número de teléfono debe ser numérico' })
        .optional(),
      rsvpStatus: zod.enum(['attending', 'not-attending'], {
        required_error: 'Por favor, seleccione una opción de confirmación'
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
  <div class="main__guest-container w-full">
    <div class="form-container w-full">
      <Form
        v-if="mainGuestStep === 1"
        :validation-schema="mainGuestValidationSchema"
        class="flex flex-col gap-6"
        @submit="onSubmit"
        @invalid-submit="onInvalidSubmit"
      >
        <div class="space-y-6">
          <div class="w-full">
            <TextField
              id="name"
              v-model="mainGuestState.name"
              name="name"
              required
              disabled
              :show-error="true"
              label="Nombre"
              placeholder="Tu nombre completo"
              class-input="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all bg-gray-50 text-gray-700"
              class-label="block text-sm font-semibold text-gray-700 mb-2"
            />
          </div>

          <div class="w-full">
            <EmailField
              id="email"
              v-model="mainGuestState.email"
              name="email"
              required
              :show-error="true"
              label="Correo Electrónico"
              placeholder="nombre@ejemplo.com"
              class-input="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all text-gray-700"
              class-label="block text-sm font-semibold text-gray-700 mb-2"
            />
          </div>

          <div class="w-full">
            <TextField
              id="phoneNumber"
              v-model="mainGuestState.phone"
              name="phoneNumber"
              required
              :show-error="true"
              label="Número de Teléfono"
              placeholder="123 456 7890"
              class-input="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all text-gray-700"
              class-label="block text-sm font-semibold text-gray-700 mb-2"
            />
          </div>

          <div class="w-full pt-4">
            <label class="block text-sm font-semibold text-gray-700 mb-4 text-center"
              >¿Asistirás?</label
            >
            <ConfirmationField
              v-model="mainGuestState.rsvpStatus"
              name="rsvpStatus"
              label=""
              :show-error="true"
              class="w-full"
              :options="[
                { value: 'attending', label: 'Sí, ahí estaré' },
                { value: 'not-attending', label: 'Lo siento, no puedo asistir' }
              ]"
            />
          </div>
        </div>

        <div class="action-button w-full flex flex-col sm:flex-row justify-end mt-8">
          <button
            type="submit"
            class="w-full sm:w-auto px-10 py-3 bg-gradient-to-l from-blue-800 to-red-800 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5"
            @click.stop
          >
            Siguiente Paso
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
