<template>
  <section class="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
    <CCard class="max-w-md w-full p-8 shadow-xl">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-display font-bold text-primary"> Welcome Back</h1>
        <p class="text-sm text-text-light">Sign in to continue planning your event</p>

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
          id="sign_in_email"
          name="email"
          show-error
        />

        <CInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          v-model="form.password"
          id="sign_in_password"
          name="password"
          show-error
        />

        <div
          id="hcaptcha-container"
          class="my-4"
          data-sitekey="7a6ea402-cb2a-4adc-8c42-29ac5c3a2df6"
          data-callback="onCaptchaSuccess"
          data-size="normal"
        ></div>

        <div class="flex justify-between text-sm text-text-light my-6">
          <CCheckbox
            v-model="form.remember"
            label="Remember me"
            name="remember"
            show-error
          />

          <router-link to="/forgot-password">
            <span class="text-primary hover:underline">Forgot password?</span>
          </router-link>
        </div>

        <CButton
          :disabled="!captchaToken"
          variant="primary"
          full
          type="submit"
        >
          Sign In
        </CButton>
      </Form>

      <p class="mt-6 text-center text-sm text-text-light">
        Don't have an account?
        <router-link to="/sign-up">
          <span class="text-primary font-medium hover:underline">Create one</span>
        </router-link>
      </p>
    </CCard>
  </section>
</template>

<script setup>
import { Form } from 'vee-validate'
import { computed, onMounted, reactive, ref } from 'vue'
import CCard from '@/components/UI/cards/CCard.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { detect } from 'detect-browser'
import { useUserStore } from '@/stores/useUserStore'
import CCheckbox from '@/components/UI/form2/CCheckbox.vue'
import { useRouter } from 'vue-router'

const sending = ref(false)
const userStore = useUserStore()
const backendError = ref(false)
const backendErrorMessage = ref("")
const router = useRouter()
const captchaToken = ref(null)

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      email: zod.string().email({message: 'Email is required'}),
      password: zod.string({message: 'Password is required'}).min(8, {message: 'Password must have at least 8 characters long'}),
      remember: zod.boolean().optional().default(false)
    })
  )
})

onMounted(() => {
  window.onCaptchaSuccess = (token) => {
    captchaToken.value = token
    console.log('Token CAPTCHA:', token)
  }

  if (window.hcaptcha && document.getElementById('hcaptcha-container')) {
    window.hcaptcha.render('hcaptcha-container', {
      sitekey: import.meta.env.VITE_APP_HCAPTCHA_SITE_KEY,
      callback: window.onCaptchaSuccess
    })
  }
})


const onSubmit = async () => {
  try {
    if (!captchaToken.value && import.meta.env.VITE_APP_ENVIRONMENT !== 'local') {
      backendError.value = true
      backendErrorMessage.value = "Please complete the captcha."
      return
    }

    sending.value = true
    const browser = detect()
    const device = browser ? `${browser.name} ${browser.version}` : 'unknown'

    const response = await userStore.login(
      {
        ...form,
        device,
        hcaptcha_token: captchaToken.value
      })

    if (response.status >= 200 && response.status < 300) {
      const result = response.data ?? {}

      userStore.initUserData(
        {
          name: result?.user?.name ?? '',
          email: result?.user?.email ?? '',
          userId: result?.user?.id ?? '',
          token: result?.token ?? '',
          lastLogin: result?.user?.last_login_session ?? null,
          activeEvent: result?.user?.activeEvent ?? null,
          justLogin: true,
          avatar: result?.user?.avatar_url ?? '',
          phone: result?.user?.phone ?? '',
        })

      const preferences = await userStore.getPreferences()

      if (preferences && preferences.status === 200) {
        userStore.setPreferences(preferences?.data?.data ?? {})
      }

      return await router.push("dashboard")
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

const onInvalidSubmit = (error) => {
  console.log(error)
}
</script>
