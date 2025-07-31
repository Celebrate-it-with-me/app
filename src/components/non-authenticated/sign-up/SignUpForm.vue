<script setup>
import { Form } from 'vee-validate'
import TextField from '@/components/UI/form/TextField.vue'
import { computed, reactive, ref, watch } from 'vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import PasswordField from '@/components/UI/form/PasswordField.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useUserStore } from '@/stores/useUserStore'

const registrationComplete = ref(false)
const backendError = ref(false)
const backendErrorMessage = ref('')
const userStore = useUserStore()
const localState = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  sending: false
})

const registerValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      firstName: zod.string().min(1, { message: 'First Name is required' }),
      lastName: zod.string().min(1, { message: 'Last Name is required' }),
      email: zod.string().email({ message: 'Email is required' }),
      password: zod
        .string({ message: 'Password is required' })
        .min(8, { message: 'Password must have at least 8 characters long' })
    })
  )
})

const onSubmit = async () => {
  try {
    localState.sending = true

    const response = await userStore.register(localState)

    if (response.status >= 200 && response.status < 300) {
      registrationComplete.value = true
    } else {
      backendError.value = true
      backendErrorMessage.value = response.response?.data?.message ?? 'Oops, something went wrong!'
    }
  } catch (e) {
    console.log('Ops Something happens!', e)
    backendErrorMessage.value = e.response?.data?.message ?? 'Oops, something went wrong!'
  } finally {
    localState.sending = false
  }
}

const onInvalidSubmit = errors => {
  console.log(errors)
}
</script>

<template>
  <div class="sign-up-form w-1/2 bg-gray-800 rounded p-10">
    <h3 class="font-semibold text-xl mb-10 text-white">Let's Start!</h3>
    <Form
      v-if="!registrationComplete"
      :validation-schema="registerValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div v-if="backendError" class="text-red-500 text-sm font-semibold mb-10">
        <p>
          {{ backendErrorMessage }}
        </p>
      </div>

      <div class="mb-4">
        <TextField
          v-model="localState.firstName"
          :placeholder="'Enter your first name'"
          name="firstName"
          show-error
          :label="'First Name'"
          :class-label="'block text-gray-300 font-medium mb-2'"
          :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
        ></TextField>
      </div>

      <div class="mb-4">
        <TextField
          v-model="localState.lastName"
          :placeholder="'Enter your last name'"
          name="lastName"
          show-error
          :label="'Last Name'"
          :class-label="'block text-gray-300 font-medium mb-2'"
          :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
        ></TextField>
      </div>

      <!-- Email -->
      <div class="mb-4">
        <EmailField
          id="email"
          v-model="localState.email"
          name="email"
          label="Email"
          :class-label="'block text-gray-300 font-medium mb-2'"
          show-error
          required
          :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4 py-2
                    focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
          placeholder="Enter your email"
        />
      </div>

      <!-- Password -->
      <div class="mb-6">
        <PasswordField
          id="password"
          v-model="localState.password"
          name="password"
          label="Password"
          :class-label="'block text-gray-300 font-medium mb-2'"
          show-error
          required
          :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4 py-2
                    focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
          placeholder="Enter your password"
        />
      </div>

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:border-none focus:ring-2 focus:ring-blue-400"
        >
          Register
        </button>
      </div>
      <div class="flex flex-row justify-end">
        <p class="text-white text-sm font-thin mt-2">
          Already have an account?
          <router-link :to="'sign-in'" tag="a" class="text-yellow-300">
            Click here to login!
          </router-link>
        </p>
      </div>
    </Form>
    <div v-else>
      <p class="text-sm font-normal text-white">
        Thank you for your registration, now you can continue to
        <router-link :to="'sign-in'" class="text-yellow-300"> Login </router-link>
      </p>
    </div>
  </div>
</template>
