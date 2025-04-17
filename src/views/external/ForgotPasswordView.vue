<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { Form } from 'vee-validate'
import CInput from '@/components/UI/form2/CInput.vue'
import { computed, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

const backendError = ref(false)
const backendErrorMessage = ref("")

const form = reactive({
  email: ''
})

const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      email: zod.string({message: 'Email is required'}).email({message: 'Must be a valid email'}),
    })
  )
})

const onSubmit = async () => {

}

const onInvalidSubmit = (errors) => {
  console.log(errors)
}

</script>

<template>
  <CCard class="max-w-md w-full p-8 shadow-xl">
    <div class="text-center mb-10">
      <div class="image-container mb-4">
        <img
          src="@/assets/images/commons/logo_primary.png"
          alt="Celebrate it with me logo"
          class="w-64 h-auto mx-auto"
        />

      </div>

      <h1 class="text-3xl font-display font-bold text-gray-700 mb-4"> Forgot Password</h1>
      <p class="text-sm text-text-light">
        Enter your account email address and we will send a password reset link
      </p>

      <div
        v-if="backendError"
        class="text-red-500 text-sm font-semibold mb-10"
      >
        <p>
          {{ backendErrorMessage }}
        </p>
      </div>

    </div>

    <Form
      :validation-schema="validationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <CInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        v-model="form.email"
        id="forgot_password_email"
        name="email"
        show-error
      />

      <CButton variant="gradient" full type="submit" class="mt-4">
        Send Reset Link
      </CButton>
    </Form>

    <div class="mt-10 flex items-center justify-center">
      <router-link to="/sign-in">
        <span class="text-primary font-medium hover:underline">
          Back to Sign In
        </span>
      </router-link>
    </div>
  </CCard>
</template>

<style scoped>

</style>
