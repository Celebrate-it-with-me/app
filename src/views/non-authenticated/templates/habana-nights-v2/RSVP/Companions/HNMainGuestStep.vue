<script setup>
import { Form } from 'vee-validate'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import TextField from '@/components/UI/form/TextField.vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
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
  if (error.errors?.confirmed) confirmationError.value = true
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
        class="hn-form-scope flex flex-col gap-5"
        @submit="onSubmit"
        @invalid-submit="onInvalidSubmit"
      >
        <div class="space-y-5">
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
              class-input="hn-input"
              class-label="hn-label"
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
              class-input="hn-input"
              class-label="hn-label"
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
              class-input="hn-input"
              class-label="hn-label"
            />
          </div>

          <div class="w-full pt-4">
            <label class="hn-label hn-assistiras-label block mb-4">¿Asistirás?</label>

            <ConfirmationField
              v-model="mainGuestState.rsvpStatus"
              name="rsvpStatus"
              label=""
              :show-error="true"
              class="hn-confirmation-field w-full"
              :options="[
                { value: 'attending', label: 'Sí, ahí estaré' },
                { value: 'not-attending', label: 'Lo siento, no puedo asistir' }
              ]"
            />
          </div>
        </div>

        <div class="action-button w-full flex flex-col sm:flex-row justify-end mt-6">
          <button type="submit" class="hn-btn-primary" @click.stop>Siguiente Paso</button>
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

<style scoped>
/* =================================================================
   INPUTS (scoped + bulletproof)
   We style the real underlying input used by TextField/EmailField:
   input.input-control inside this form only.
   ================================================================= */

.hn-label {
  display: block;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.hn-assistiras-label {
  text-align: center;
  margin-bottom: 1rem;
}

/* Your custom class still exists (for compatibility) */
.hn-input {
  width: 100%;
  padding: 0.875rem 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  color: #f8f1e7;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

/* Bulletproof override for the actual input element rendered inside TextField/EmailField */
:deep(.hn-form-scope input.input-control) {
  width: 100%;
  padding: 0.875rem 0 !important;
  background: transparent !important;
  border: none !important;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3) !important;
  color: #f8f1e7 !important;
  font-family: 'Montserrat', sans-serif !important;
  font-size: 0.95rem !important;
  transition: all 0.3s ease;
}

:deep(.hn-form-scope input.input-control::placeholder) {
  color: rgba(148, 163, 184, 0.6) !important;
}

:deep(.hn-form-scope input.input-control:focus) {
  outline: none !important;
  border-bottom-color: #d4af37 !important;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15) !important;
}

:deep(.hn-form-scope input.input-control:disabled) {
  opacity: 0.7;
  cursor: not-allowed;
}

/* =================================================================
   BUTTON
   ================================================================= */
.hn-btn-primary {
  width: 100%;
  padding: 0.875rem 2.5rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
  color: #0b1220;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.hn-btn-primary:hover {
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35);
  transform: translateY(-1px);
}

@media (min-width: 640px) {
  .hn-btn-primary {
    width: auto;
  }
}

/* =================================================================
   CONFIRMATION FIELD (override only here)
   ================================================================= */

:deep(.hn-confirmation-field fieldset) {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
  align-items: stretch;
}

@media (min-width: 640px) {
  :deep(.hn-confirmation-field fieldset) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

:deep(.hn-confirmation-field fieldset > div) {
  width: 100%;
}

:deep(.hn-confirmation-field fieldset > div > label) {
  width: 100%;
  min-height: 74px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.22) !important;
  background: rgba(17, 24, 39, 0.45) !important;
  color: #f8f1e7 !important;
  padding: 1rem 1.25rem;
  transition: all 0.25s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
}

:deep(.hn-confirmation-field fieldset > div > label:hover) {
  border-color: rgba(212, 175, 55, 0.38) !important;
  background: rgba(17, 24, 39, 0.6) !important;
}

:deep(.hn-confirmation-field fieldset > div > label:has(input:checked)) {
  border-color: rgba(212, 175, 55, 0.85) !important;
  background: rgba(212, 175, 55, 0.08) !important;
  box-shadow:
    0 0 0 1px rgba(212, 175, 55, 0.35),
    0 18px 50px rgba(212, 175, 55, 0.08);
}

/* Radio circle + dot -> GOLD */
:deep(.hn-confirmation-field fieldset > div > label > div.w-6.h-6) {
  border-color: rgba(212, 175, 55, 0.55) !important;
  background: rgba(11, 18, 32, 0.35) !important;
}

:deep(.hn-confirmation-field fieldset > div > label:has(input:checked) > div.w-6.h-6) {
  border-color: rgba(212, 175, 55, 0.95) !important;
}

:deep(.hn-confirmation-field fieldset > div > label > div.w-6.h-6 > div.w-3.h-3) {
  background: #d4af37 !important;
}

:deep(.hn-confirmation-field fieldset > div > label span) {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.15;
  text-align: center;
}

:deep(.hn-confirmation-field input[type='radio']) {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
</style>
