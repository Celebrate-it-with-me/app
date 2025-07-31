<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { Form } from 'vee-validate'
import CInput from '@/components/UI/form2/CInput.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useUserStore } from '@/stores/useUserStore'
import { useRoute, useRouter } from 'vue-router'

const backendError = ref(false)
const backendErrorMessage = ref('')
const loading = ref(false)
const sending = ref(false)
const userStore = useUserStore()
const isValidResetLink = ref(false)
const route = useRoute()
const router = useRouter()
const userEmail = ref('')

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const validationSchema = computed(() => {
  return toTypedSchema(
    zod
      .object({
        email: zod
          .string({ message: 'Email is required' })
          .email({ message: 'Must be a valid email' })
          .refine(value => value === userEmail.value, {
            message: 'Email does not match the user email',
            path: ['email']
          }),
        password: zod
          .string({ message: 'Password is required' })
          .min(8, { message: 'Password must have at least 8 characters long' }),
        confirmPassword: zod
          .string({ message: 'Confirm Password is required' })
          .min(8, { message: 'Confirm Password must have at least 8 characters long' })
      })
      .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords must match',
        path: ['confirmPassword']
      })
  )
})

onMounted(async () => {
  await checkResetLink()
})

const checkResetLink = async () => {
  try {
    loading.value = true

    const confirmUrl = decodeURIComponent(route.query.confirm)

    if (!confirmUrl) {
      loading.value = false
      isValidResetLink.value = false
      return
    }

    const response = await userStore.checkResetLink(confirmUrl)

    if (response.status === 200) {
      const { data } = response?.data ?? {}
      isValidResetLink.value = data?.email
      userEmail.value = data?.email
    } else {
      isValidResetLink.value = false
      backendError.value = true
      backendErrorMessage.value = response.response?.data?.message ?? 'Oops, something went wrong!'
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  try {
    sending.value = true

    const response = await userStore.changePassword({
      email: form.email,
      password: form.password,
      passwordConfirmation: form.confirmPassword
    })

    if (response.status === 200) {
      backendError.value = false
      backendErrorMessage.value = ''
      form.email = ''
      form.password = ''
      form.confirmPassword = ''

      await router.push('/password-updated')
    } else {
      backendError.value = true
      backendErrorMessage.value = response.response?.data?.message ?? 'Oops, something went wrong!'
    }
  } catch (e) {
    console.log(e)
  } finally {
    sending.value = false
  }
}

const onInvalidSubmit = errors => {
  console.log(errors)
}
</script>

<template>
  <CCard class="max-w-md w-full p-8 shadow-xl">
    <div v-if="!isValidResetLink">
      <div class="text-center mb-10">
        <div class="image-container mb-4">
          <img
            src="@/assets/images/commons/logo_primary.png"
            alt="Celebrate it with me logo"
            class="w-64 h-auto mx-auto"
          />
        </div>

        <h1 class="text-3xl font-display font-bold text-gray-700 mb-4">Reset Password</h1>
        <p class="text-sm text-text-light">
          Looks like this link is invalid or expired. Please check your email for the correct link.
        </p>

        <div v-if="backendError" class="text-red-500 text-sm font-semibold mb-10">
          <p>
            {{ backendErrorMessage }}
          </p>
        </div>
      </div>
    </div>
    <div v-if="isValidResetLink" class="reset-valid">
      <div class="text-center mb-10">
        <div class="image-container mb-4">
          <img
            src="@/assets/images/commons/logo_primary.png"
            alt="Celebrate it with me logo"
            class="w-64 h-auto mx-auto"
          />
        </div>

        <h1 class="text-3xl font-display font-bold text-gray-700 mb-4">Reset Password</h1>
        <p class="text-sm text-text-light">Enter your new password below.</p>

        <div v-if="backendError" class="text-red-500 text-sm font-semibold mb-10">
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
          id="reset_password_email"
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          name="email"
          show-error
        />

        <CInput
          id="reset_password_password"
          v-model="form.password"
          name="password"
          label="New Password"
          type="password"
          placeholder="Enter your new password"
          show-error
        />

        <CInput
          id="reset_password_confirm_password"
          v-model="form.confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your new password"
          show-error
        />

        <CButton variant="gradient" full type="submit" class="mt-4"> Change Password </CButton>

        <div class="mt-6 flex items-center justify-center">
          <router-link to="/sign-in">
            <span class="text-primary font-medium hover:underline"> Back to Sign In </span>
          </router-link>
        </div>
      </Form>
    </div>
  </CCard>
</template>

<style scoped></style>
