<template>
  <section
    class="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 px-4"
  >
    <CCard class="max-w-md w-full p-8 shadow-xl">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-display font-bold text-primary">Join Celebrateitwithme</h1>
        <p class="text-sm text-text-light">Create your account and start planning unforgettable events.</p>
      </div>

      <Form
        v-if="!registrationComplete"
        :validation-schema="validationSchema"
        @submit="onSubmit"
        @invalid-submit="onInvalidSubmit"
        class="space-y-4"
      >
        <CSelect
          label="Select Plan"
          v-model="form.plan"
          :options="plans"
          placeholder="Choose your plan"
          name="planSelected"
          id="sign_up_plan"
          show-error
        />

        <CInput
          label="Full Name"
          placeholder="Enter your full name"
          v-model="form.name"
          name="name"
          id="sign_up_name"
          show-error
        />
        <CInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          v-model="form.email"
          name="email"
          id="sign_up_email"
          show-error
        />
        <CInput
          label="Password"
          type="password"
          placeholder="Choose a password"
          v-model="form.password"
          name="password"
          id="sign_up_password"
          show-error
        />

        <CButton full type="submit">Sign Up</CButton>
      </Form>
      <div v-else>
        <p
          class="text-sm text-text-light"
        >
          Thank you for your registration, please confirm your email to activate your account.
          <router-link
            :to="'sign-in'"
            class="text-primary font-medium hover:underline"
          >
            Login
          </router-link>
        </p>
      </div>

      <p
        class="mt-6 text-center text-sm text-text-light"
        v-if="!registrationComplete"
      >
        Already have an account?
        <router-link
          :to="'sign-in'"
          class="text-primary font-medium hover:underline"
        >
          Sign in
        </router-link>
      </p>
    </CCard>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Form } from 'vee-validate'
import CCard from '@/components/UI/cards/CCard.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useUserStore } from '@/stores/useUserStore'

const plans = [
  { label: 'Basic', value: 'basic' },
  { label: 'Premium', value: 'premium' },
  { label: 'Luxury', value: 'luxury' }
]

const registrationComplete = ref(false)
const userStore = useUserStore()
const backendError = ref(false)
const backendErrorMessage = ref("")
const sending = ref(false)
const form = reactive({
  name: '',
  email: '',
  password: '',
  plan: ''
})

const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      name: zod.string().min(1, {message: 'Name is required'}),
      email: zod.string().email({message: 'Email is required'}),
      password: zod.string({message: 'Password is required'}).min(8, {message: 'Password must have at least 8 characters long'})
    })
  )
})

const onSubmit = async () => {
  try {
    sending.value = true

    const response = await userStore.register(form)

    if (response.status >= 200 && response.status < 300) {
      registrationComplete.value = true
    } else {
      backendError.value = true
      backendErrorMessage.value = response.response?.data?.message ?? "Oops, something went wrong!"
    }

  } catch(e) {
    console.log('Ops Something happens!', e)
    backendErrorMessage.value = e.response?.data?.message ?? "Oops, something went wrong!"
  } finally {
    sending.value = false
  }
}

const onInvalidSubmit = (errors) => {
  console.log(errors)
}
</script>
