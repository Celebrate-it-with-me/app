<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { Form } from 'vee-validate'
import "vue-color-kit/dist/vue-color-kit.css";
import debounce from 'lodash.debounce'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import { useEventsStore } from '@/stores/useEventsStore'

const emit = defineEmits(['updatedStd'])

const stdState = reactive({
  title: '',
  message: '',
  useCountdown: false,
  useAddToCalendar: false,
})
const stdStore = useSaveTheDateStore()
const stdErrors = ref()
const eventStore = useEventsStore()

const isUpdate = computed(() => {
  return !!stdStore.hasPreviousStd;
})

const stdValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      title: zod.string().min(1, { message: 'Message is required' }),
      message: zod.string().optional(),
      useCountdown: zod.boolean({ required_error: '"useCountdown" must be a boolean' }).optional(),
      useAddToCalendar: zod.boolean({ required_error: '"useAddToCalendar" must be a boolean' }).optional(),
    })
  )
})

onMounted(() => {
  stdState.stdTitle = eventStore?.currentEvent?.eventName ?? ''

  if (stdStore.hasPreviousStd) {
    stdState.title = stdStore.title ?? eventStore.currentEvent.name
    stdState.message = stdStore.message
    stdState.useCountdown = stdStore.useCountdown
    stdState.useAddToCalendar = stdStore.useAddToCalendar

    if (stdStore.image) {
      stdState.image = stdStore.image;
    }

  }
})

const onSubmit = async () => {
  try {
    stdState.sending = true
    let response

    if (isUpdate.value) {
      response = await stdStore.updateSTD(stdState)
    } else {
      response = await stdStore.createSTD(stdState)
    }

    if (response.status >= 200 && response.status < 300) {
      console.log(response)

    } else {
      console.log('Oops something when wrong, please try again later', response)
      stdErrors.value = 'Oops something when wrong, please try again later'
    }
  } catch(e) {
    console.log(e)
  } finally {
    stdState.sending = false
  }
}

const onInvalidSubmit = () => {
  stdErrors.value = 'Oops something when wrong, please try again later'
}

const debounceEmit = debounce((value) => {
  emit('updatedStd', value)
  console.log('emitting')
}, 300)

watch(() => stdState, (value) => {
  if (value) {
    debounceEmit(value)
  }
},
  {
    immediate: true,
    deep: true
})

</script>

<template>
  <div class="dark:bg-gray-800 text-white p-6 rounded-2xl shadow-card w-full">
    <Form
      :validation-schema="stdValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div v-if="stdErrors" class="mb-4">
        <p class="text-red-500 font-semibold">
          {{ stdErrors }}
        </p>
      </div>

      <!-- Grid: 2 columns in md+ -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CInput
          v-model="stdState.title"
          label="Title"
          name="stdTitle"
          show-error
          placeholder="Save the Date Title"
          id="stdTitle"
        />

        <CInput
          v-model="stdState.message"
          label="Message"
          name="stdMessage"
          show-error
          placeholder="Save the Date subtitle"
          id="stdMessage"
        />

        <CToggle
          label="Use Countdown"
          name="useCountdown"
          v-model="stdState.useCountdown"
        />

        <CToggle
          label="Use Add To Calendar"
          name="useAddToCalendar"
          v-model="stdState.useAddToCalendar"
        />
      </div>

      <div class="mt-8 flex justify-end gap-4">
        <CButton
          v-if="!isUpdate"
          variant="primary"
          type="submit"
        >
          Save STD
        </CButton>

        <CButton
          v-else
          variant="secondary"
          type="submit"
        >
          Update STD
        </CButton>
      </div>
    </Form>
  </div>
</template>


<style scoped></style>
