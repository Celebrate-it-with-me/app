<script setup>
import { Form } from 'vee-validate'
import TextField from '@/components/UI/form/TextField.vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import ConfirmationField from '@/components/UI/form/ConfirmationField.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
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
      class="flex flex-col gap-6"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="space-y-6">
        <div class="w-full">
          <TextField
            id="name"
            v-model="localCompanion.name"
            name="name"
            required
            show-error
            label="Nombre"
            placeholder="Nombre del acompañante"
            class-input="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all text-gray-700"
            class-label="block text-sm font-semibold text-gray-700 mb-2"
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
            class-input="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all text-gray-700"
            class-label="block text-sm font-semibold text-gray-700 mb-2"
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
            class-input="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all text-gray-700"
            class-label="block text-sm font-semibold text-gray-700 mb-2"
          />
        </div>

        <div class="w-full pt-4 text-center">
          <label class="block text-sm font-semibold text-gray-700 mb-4"
            >¿Asistirá este acompañante?</label
          >
          <ConfirmationField
            v-model="localCompanion.rsvpStatus"
            name="rsvpStatus"
            label=""
            :show-error="true"
            :options="[
              { value: 'attending', label: 'Sí' },
              { value: 'not-attending', label: 'No' }
            ]"
          />
        </div>
      </div>

      <div class="action-button w-full flex justify-end mt-8">
        <button
          type="submit"
          class="w-full sm:w-auto px-10 py-3 bg-gradient-to-l from-blue-800 to-red-800 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
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
