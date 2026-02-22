<script setup>
import { Form } from 'vee-validate'
import TextField from '@/components/UI/form/TextField.vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import ConfirmationField from '@/components/UI/form/ConfirmationField.vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import GuestMenuSelection from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/GuestMenuSelection.vue'

const emit = defineEmits(['confirmed'])
const props = defineProps({
  currentCompanion: {
    type: [Object, null],
    required: false,
    default: null
  }
})

const templateStore = useTemplateStore()
const companionStep = ref(1)

const localCompanion = reactive({
  id: '',
  name: '',
  email: '',
  phone: '',
  rsvpStatus: 'pending'
})

const companionMenu = computed(() => {
  if (props.currentCompanion?.menuSelected?.length) {
    return props.currentCompanion.menuSelected
  }
  return templateStore.event.mainMenu
})

onMounted(() => {
  if (props.currentCompanion) {
    localCompanion.id = props.currentCompanion?.id ?? ''
    localCompanion.name = props.currentCompanion?.name ?? ''
    localCompanion.email = props.currentCompanion?.email ?? ''
    localCompanion.phone = props.currentCompanion?.phone ?? ''
    localCompanion.rsvpStatus = props.currentCompanion?.rsvpStatus ?? 'pending'
  }
})

const companionValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      name: zod.string().min(1, 'El nombre es obligatorio'),
      email: zod.string().email({ message: 'Correo electrónico inválido' }).optional(),
      phone: zod
        .string()
        .regex(/^[0-9\s]*$/, { message: 'El número de teléfono debe ser numérico' })
        .optional(),
      rsvpStatus: zod.enum(['attending', 'not-attending'], {
        required_error: 'Por favor, seleccione una opción de confirmación'
      })
    })
  )
})

const handleGoBack = () => {
  companionStep.value = 1
}

const handleUpdateCompanionMenu = payload => {
  templateStore.updateCompanionMenu(payload)
  emit('confirmed', localCompanion)
}

const onSubmit = () => {
  if (templateStore.event.hasMenu && localCompanion.rsvpStatus === 'attending') {
    companionStep.value = 2
  } else {
    emit('confirmed', localCompanion)
  }
}

const onInvalidSubmit = () => {}
</script>

<template>
  <div class="w-full">
    <Form
      v-if="companionStep === 1"
      :validation-schema="companionValidationSchema"
      class="hn-form-scope flex flex-col gap-5"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="space-y-5">
        <div class="w-full">
          <TextField
            id="name"
            v-model="localCompanion.name"
            name="name"
            required
            :show-error="true"
            label="Nombre"
            placeholder="Nombre del acompañante"
            class-input="hn-input"
            class-label="hn-label"
          />
        </div>

        <div class="w-full">
          <EmailField
            id="email"
            v-model="localCompanion.email"
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
            id="phone"
            v-model="localCompanion.phone"
            name="phone"
            required
            :show-error="true"
            label="Número de Teléfono"
            placeholder="Número de teléfono"
            class-input="hn-input"
            class-label="hn-label"
          />
        </div>

        <div class="w-full pt-4">
          <label class="hn-label hn-assistiras-label block mb-4">¿Asistirá este acompañante?</label>

          <ConfirmationField
            v-model="localCompanion.rsvpStatus"
            name="rsvpStatus"
            label=""
            :show-error="true"
            class="hn-confirmation-field w-full"
            :options="[
              { value: 'attending', label: 'Sí' },
              { value: 'not-attending', label: 'No' }
            ]"
          />
        </div>
      </div>

      <div class="action-button w-full flex flex-col sm:flex-row justify-end mt-6">
        <button type="submit" class="hn-btn-primary" @click.stop>Confirmar Acompañante</button>
      </div>
    </Form>

    <div v-if="companionStep === 2">
      <GuestMenuSelection
        :guest="props.currentCompanion"
        :menu="companionMenu"
        @update:go-back="handleGoBack"
        @update:guest-menu="handleUpdateCompanionMenu"
      />
    </div>
  </div>
</template>

<style scoped>
/* =========================================================
   Labels
   ========================================================= */
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

/* =========================================================
   Inputs
   - Keep your hn-input, but also enforce styling on the actual
     input.input-control inside TextField/EmailField.
   ========================================================= */
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

.hn-input:focus {
  outline: none;
  border-bottom-color: #d4af37;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
}

.hn-input::placeholder {
  color: rgba(148, 163, 184, 0.6);
}

/* Bulletproof for the real element rendered by TextField/EmailField */
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

/* =========================================================
   Button
   ========================================================= */
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

/* =========================================================
   Confirmation Field (only for this view)
   - Full width
   - Two equal cards
   - Gold radio
   ========================================================= */
:deep(.hn-confirmation-field fieldset) {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: stretch;
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

/* Gold radio */
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

/* Mobile fallback: stack if needed */
@media (max-width: 380px) {
  :deep(.hn-confirmation-field fieldset) {
    grid-template-columns: 1fr;
  }
}
</style>
