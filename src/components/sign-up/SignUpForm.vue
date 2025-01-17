<script setup>
import { Form } from 'vee-validate'
import TextField from '@/components/UI/form/TextField.vue'
import { computed, reactive } from 'vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import PasswordField from '@/components/UI/form/PasswordField.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

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
      firstName: zod.string().min(1, {message: 'First Name is required'}),
      lastName: zod.string().min(1, {message: 'Last Name is required'}),
      email: zod.string().email({message: 'Email is required'}),
      password: zod.string({message: 'Password is required'}).min(8, {message: 'Password must have at least 8 characters long'})
    })
  )
})

const onSubmit = async () => {
  try {
    localState.sending = true

    // Request to register the new user in cwm

  } catch(e) {
    console.log('Ops Something happens!', e)
  } finally {
    localState.sending = false
  }
}

const onInvalidSubmit = (errors) => {
  console.log(errors)
}

</script>

<template>
  <div class="sign-up-form w-1/2 bg-gray-800 rounded p-10">
    <h3 class="font-semibold text-xl mb-10 text-white">Let's Start!</h3>
    <Form
      :validation-schema="registerValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="mb-4">
        <TextField
          :placeholder="'Enter your first name'"
          :name="'firstName'"
          v-model="localState.firstName"
          :label="'First Name'"
          :class-label="'block text-gray-300 font-medium mb-2'"
          :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
        ></TextField>
      </div>

      <div class="mb-4">
        <TextField
          :placeholder="'Enter your last name'"
          :name="'lastName'"
          v-model="localState.lastName"
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
          name="email"
          label="Email"
          :class-label="'block text-gray-300 font-medium mb-2'"
          v-model="localState.email"
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
          name="password"
          label="Password"
          :class-label="'block text-gray-300 font-medium mb-2'"
          v-model="localState.password"
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
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg
                    focus:outline-none focus:border-none focus:ring-2 focus:ring-blue-400"
        >
          Register
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped>

</style>
