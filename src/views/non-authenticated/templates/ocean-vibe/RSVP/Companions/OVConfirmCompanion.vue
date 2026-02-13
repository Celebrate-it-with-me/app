<script setup>
import { Form } from 'vee-validate'
import TextField from '@/components/UI/form/TextField.vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { CheckCircle2, XCircle } from 'lucide-vue-next'
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
  if (props.currentCompanion.menuSelected.length) {
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
    localCompanion.rsvpStatus = props.currentCompanion?.rsvpStatus ?? 'yes'
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
        message: 'Por favor, seleccione una opción de confirmación'
      })
    })
  )
})

const handleGoBack = () => {
  companionStep.value = 1
}

const handleUpdateCompanionMenu = payload => {
  console.log(payload)
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

const onInvalidSubmit = errors => {
  console.log(errors)
}
</script>

<template>
  <div class="w-full">
    <Form
      v-if="companionStep === 1"
      :validation-schema="companionValidationSchema"
      class="flex flex-col gap-6"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="space-y-8">
        <div class="w-full">
          <TextField
            id="name"
            v-model="localCompanion.name"
            name="name"
            required
            show-error
            label="Nombre"
            placeholder="Nombre del acompañante"
            class-input="w-full px-5 py-3.5 rounded-2xl border border-sky-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all bg-white text-slate-700 placeholder:text-slate-400"
            class-label="block text-sm font-bold text-slate-700 mb-2.5 ml-1"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="w-full">
            <EmailField
              id="email"
              v-model="localCompanion.email"
              name="email"
              required
              :show-error="true"
              label="Correo Electrónico"
              placeholder="nombre@ejemplo.com"
              class-input="w-full px-5 py-3.5 rounded-2xl border border-sky-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all bg-white text-slate-700 placeholder:text-slate-400"
              class-label="block text-sm font-bold text-slate-700 mb-2.5 ml-1"
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
              class-input="w-full px-5 py-3.5 rounded-2xl border border-sky-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all bg-white text-slate-700 placeholder:text-slate-400"
              class-label="block text-sm font-bold text-slate-700 mb-2.5 ml-1"
            />
          </div>
        </div>

        <div class="w-full pt-4">
          <label class="block text-base font-bold text-slate-800 mb-6 text-center"
            >¿Asistirá este acompañante?</label
          >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Custom Attending Card -->
            <div
              class="relative cursor-pointer group"
              @click="localCompanion.rsvpStatus = 'attending'"
            >
              <div
                :class="[
                  'flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 h-full',
                  localCompanion.rsvpStatus === 'attending'
                    ? 'border-[#2F6F8F] bg-gradient-to-br from-[#E6F4F8] to-white shadow-[0_10px_25px_rgba(18,59,90,0.12)] scale-[1.02]'
                    : 'border-slate-100 bg-white hover:border-sky-200 hover:bg-slate-50/50'
                ]"
              >
                <div
                  :class="[
                    'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
                    localCompanion.rsvpStatus === 'attending'
                      ? 'bg-[#2F6F8F] text-white'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-500'
                  ]"
                >
                  <CheckCircle2 class="w-6 h-6" />
                </div>
                <h3
                  :class="[
                    'font-bold text-base mb-1',
                    localCompanion.rsvpStatus === 'attending'
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9]'
                      : 'text-slate-700'
                  ]"
                >
                  Sí, asistirá
                </h3>
              </div>
              <input
                type="radio"
                name="rsvpStatus"
                value="attending"
                class="sr-only"
                :checked="localCompanion.rsvpStatus === 'attending'"
              />
            </div>

            <!-- Custom Not Attending Card -->
            <div
              class="relative cursor-pointer group"
              @click="localCompanion.rsvpStatus = 'not-attending'"
            >
              <div
                :class="[
                  'flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 h-full',
                  localCompanion.rsvpStatus === 'not-attending'
                    ? 'border-[#9FB7C3] bg-white shadow-[0_8px_20px_rgba(20,60,80,0.08)] scale-[1.02]'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                ]"
              >
                <div
                  :class="[
                    'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
                    localCompanion.rsvpStatus === 'not-attending'
                      ? 'bg-[#5E7480] text-white'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500'
                  ]"
                >
                  <XCircle class="w-6 h-6" />
                </div>
                <h3
                  :class="[
                    'font-bold text-base mb-1',
                    localCompanion.rsvpStatus === 'not-attending'
                      ? 'text-[#2A3F4A]'
                      : 'text-slate-700'
                  ]"
                >
                  No podré asistir
                </h3>
              </div>
              <input
                type="radio"
                name="rsvpStatus"
                value="not-attending"
                class="sr-only"
                :checked="localCompanion.rsvpStatus === 'not-attending'"
              />
            </div>
          </div>

          <!-- Hidden ConfirmationField for VeeValidate binding -->
          <div class="hidden">
            <ConfirmationField
              v-model="localCompanion.rsvpStatus"
              name="rsvpStatus"
              label=""
              :show-error="true"
            />
          </div>
        </div>
      </div>

      <div class="action-button w-full flex justify-center mt-12">
        <button
          type="submit"
          class="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] text-white rounded-2xl font-bold shadow-xl shadow-sky-900/20 hover:shadow-sky-900/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 uppercase tracking-wider text-sm"
          @click.stop
        >
          Confirmar Acompañante
        </button>
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

<style scoped></style>
