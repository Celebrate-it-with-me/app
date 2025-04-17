<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { Form } from 'vee-validate'
import CInput from '@/components/UI/form2/CInput.vue'
import { computed, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useUserStore } from '@/stores/useUserStore'

const backendError = ref(false)
const backendErrorMessage = ref("")
const sending = ref(false)
const userStore = useUserStore()
const resetLinkSent = ref(false)

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
  try {
    sending.value = true

    const response = await userStore.sendResetPasswordLink(form)

    if (response.status === 200) {
      backendError.value = false
      backendErrorMessage.value = ""
      form.email = ''
      resetLinkSent.value = true
    } else {
      backendError.value = true
      backendErrorMessage.value = response.response?.data?.message ?? "Oops, something went wrong!"
    }
  } catch (e) {
    console.log(e)
  } finally {
    sending.value = false
  }
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
      <p v-if="!resetLinkSent" class="text-sm text-text-light">
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
      v-if="!resetLinkSent"
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

      <div class="mt-6 flex items-center justify-center">
        <router-link to="/sign-in">
        <span class="text-primary font-medium hover:underline">
          Back to Sign In
        </span>
        </router-link>
      </div>
    </Form>

    <div
      v-else
      class="text-gray-500 text-sm font-semibold mb-10"
    >
      <p>
        Thank you for your request, please check your email to reset your password.
      </p>
    </div>

  </CCard>
</template>

<style scoped>

</style>
