<script setup>
import { Form } from 'vee-validate'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { CheckCircle2, XCircle } from 'lucide-vue-next'
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
        <div class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                class-input="w-full px-5 py-3.5 rounded-2xl border border-sky-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all bg-sky-50/30 text-slate-700 placeholder:text-slate-400"
                class-label="block text-sm font-bold text-slate-700 mb-2.5 ml-1"
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
                class-input="w-full px-5 py-3.5 rounded-2xl border border-sky-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all bg-white text-slate-700 placeholder:text-slate-400"
                class-label="block text-sm font-bold text-slate-700 mb-2.5 ml-1"
              />
            </div>
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
              class-input="w-full px-5 py-3.5 rounded-2xl border border-sky-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all bg-white text-slate-700 placeholder:text-slate-400"
              class-label="block text-sm font-bold text-slate-700 mb-2.5 ml-1"
            />
          </div>

          <div class="w-full pt-4">
            <label class="block text-base font-bold text-slate-800 mb-6 text-center"
              >¿Confirmas tu asistencia?</label
            >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Custom Attending Card -->
              <div
                class="relative cursor-pointer group"
                @click="mainGuestState.rsvpStatus = 'attending'"
              >
                <div
                  :class="[
                    'flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 h-full',
                    mainGuestState.rsvpStatus === 'attending'
                      ? 'border-[#2F6F8F] bg-gradient-to-br from-[#E6F4F8] to-white shadow-[0_10px_25px_rgba(18,59,90,0.12)] scale-[1.02]'
                      : 'border-slate-100 bg-white hover:border-sky-200 hover:bg-slate-50/50'
                  ]"
                >
                  <div
                    :class="[
                      'w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors',
                      mainGuestState.rsvpStatus === 'attending'
                        ? 'bg-[#2F6F8F] text-white'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-500'
                    ]"
                  >
                    <CheckCircle2 class="w-8 h-8" />
                  </div>
                  <h3
                    :class="[
                      'font-bold text-lg mb-1',
                      mainGuestState.rsvpStatus === 'attending'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9]'
                        : 'text-slate-700'
                    ]"
                  >
                    Sí, asistiré
                  </h3>
                  <p
                    :class="[
                      'text-sm text-center',
                      mainGuestState.rsvpStatus === 'attending'
                        ? 'text-[#40697F]'
                        : 'text-slate-500'
                    ]"
                  >
                    ¡No puedo esperar para celebrar juntos!
                  </p>
                </div>
                <input
                  type="radio"
                  name="rsvpStatus"
                  value="attending"
                  class="sr-only"
                  :checked="mainGuestState.rsvpStatus === 'attending'"
                />
              </div>

              <!-- Custom Not Attending Card -->
              <div
                class="relative cursor-pointer group"
                @click="mainGuestState.rsvpStatus = 'not-attending'"
              >
                <div
                  :class="[
                    'flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 h-full',
                    mainGuestState.rsvpStatus === 'not-attending'
                      ? 'border-[#9FB7C3] bg-white shadow-[0_8px_20px_rgba(20,60,80,0.08)] scale-[1.02]'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                  ]"
                >
                  <div
                    :class="[
                      'w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors',
                      mainGuestState.rsvpStatus === 'not-attending'
                        ? 'bg-[#5E7480] text-white'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500'
                    ]"
                  >
                    <XCircle class="w-8 h-8" />
                  </div>
                  <h3
                    :class="[
                      'font-bold text-lg mb-1',
                      mainGuestState.rsvpStatus === 'not-attending'
                        ? 'text-[#2A3F4A]'
                        : 'text-slate-700'
                    ]"
                  >
                    No podré asistir
                  </h3>
                  <p
                    :class="[
                      'text-sm text-center',
                      mainGuestState.rsvpStatus === 'not-attending'
                        ? 'text-[#6B8796]'
                        : 'text-slate-500'
                    ]"
                  >
                    Me encantaría, pero esta vez no podrá ser.
                  </p>
                </div>
                <input
                  type="radio"
                  name="rsvpStatus"
                  value="not-attending"
                  class="sr-only"
                  :checked="mainGuestState.rsvpStatus === 'not-attending'"
                />
              </div>
            </div>

            <!-- Hidden ConfirmationField for VeeValidate binding -->
            <div class="hidden">
              <ConfirmationField
                v-model="mainGuestState.rsvpStatus"
                name="rsvpStatus"
                label=""
                :show-error="true"
              />
            </div>
          </div>
        </div>

        <div class="action-button w-full flex flex-col sm:flex-row justify-center mt-12">
          <button
            type="submit"
            class="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] text-white rounded-2xl font-bold shadow-xl shadow-sky-900/20 hover:shadow-sky-900/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 uppercase tracking-wider text-sm"
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
