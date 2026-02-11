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
import { useRoute, useRouter } from 'vue-router'
import { onBeforeUnmount } from 'vue'

const sending = ref(false)
const userStore = useUserStore()
const backendError = ref(false)
const backendErrorMessage = ref('')
const router = useRouter()
const route = useRoute()
const captchaToken = ref(null)
const captchaSiteKey = import.meta.env.VITE_APP_HCAPTCHA_SITE_KEY
const isLocalEnvironment = ref(import.meta.env.VITE_APP_ENVIRONMENT === 'local')
const isCaptchaRequired = computed(() => !isLocalEnvironment.value || captchaToken.value)
const apiUrl = import.meta.env.VITE_API_URL

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      email: zod.string().email({ message: 'Email is required' }),
      password: zod
        .string({ message: 'Password is required' })
        .min(8, { message: 'Password must have at least 8 characters long' }),
      remember: zod.boolean().optional().default(false)
    })
  )
})

onMounted(() => {
  window.onCaptchaSuccess = token => {
    captchaToken.value = token
  }

  if (window.hcaptcha && document.getElementById('hcaptcha-container')) {
    window.hcaptcha.render('hcaptcha-container', {
      sitekey: captchaSiteKey,
      callback: window.onCaptchaSuccess
    })
  }
})

const onSubmit = async () => {
  try {
    if (!captchaToken.value && !isLocalEnvironment.value) {
      backendError.value = true
      backendErrorMessage.value = 'Please complete the captcha.'
      return
    }

    sending.value = true
    const browser = detect()
    const device = browser ? `${browser.name} ${browser.version}` : 'unknown'

    const response = await userStore.login({
      ...form,
      device,
      hcaptcha_token: captchaToken.value
    })

    if (response.status >= 200 && response.status < 300) {
      const result = response.data ?? {}

      userStore.initUserData({
        name: result?.user?.name ?? '',
        email: result?.user?.email ?? '',
        userId: result?.user?.id ?? '',
        lastLogin: result?.user?.last_login_session ?? null,
        activeEvent: result?.user?.activeEvent ?? null,
        justLogin: true,
        avatar: result?.user?.avatar_url ?? '',
        phone: result?.user?.phone ?? ''
      })

      const preferences = await userStore.getPreferences()

      if (preferences && preferences.status === 200) {
        userStore.setPreferences(preferences?.data?.data ?? {})
      }

      const redirectPath = route.query.redirect
      if (redirectPath) {
        return await router.push(redirectPath)
      }

      return await router.push('dashboard')
    } else {
      backendError.value = true
      backendErrorMessage.value = response.response?.data?.message ?? 'Oops, something went wrong!'
    }
  } catch (e) {
    console.log('Ops Something happens!', e)
    backendError.value = true
    backendErrorMessage.value = e.response?.data?.message ?? 'Oops, something went wrong!'
  } finally {
    sending.value = false
  }
}

const onInvalidSubmit = error => {
  console.log(error)
}

const handleGoogleLogin = () => {
  const redirectPath = route.query.redirect
  let url = `${apiUrl}oauth/google/redirect`
  if (redirectPath) {
    url += `?redirect=${encodeURIComponent(redirectPath)}`
  }
  window.location.href = url
}

// Facebook login handler
const handleFacebookLogin = async () => {
  console.log('Work in progress')
}

// Load social login SDKs
onMounted(() => {

})
</script>

<template>
  <section
    class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 px-4 overflow-hidden"
  >
    <!-- Enhanced Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-60 animate-pulse"
      ></div>
      <div
        class="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-l from-secondary/20 to-accent/20 rounded-full blur-3xl opacity-50 animate-pulse"
        style="animation-delay: 2s"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-300/10 to-purple-300/10 rounded-full blur-2xl opacity-40"
      ></div>

      <!-- Floating Elements -->
      <div
        class="absolute top-20 right-20 w-4 h-4 bg-primary/30 rounded-full animate-bounce"
        style="animation-delay: 1s"
      ></div>
      <div
        class="absolute bottom-32 left-16 w-6 h-6 bg-secondary/40 rounded-full animate-bounce"
        style="animation-delay: 3s"
      ></div>
      <div
        class="absolute top-1/3 left-1/4 w-3 h-3 bg-accent/50 rounded-full animate-bounce"
        style="animation-delay: 2s"
      ></div>
    </div>

    <CCard
      class="relative z-10 max-w-md w-full p-8 shadow-xl bg-gradient-to-br from-pink-50/60 via-rose-50/50 to-pink-100/40 dark:from-pink-900/30 dark:via-pink-800/20 dark:to-pink-700/15 backdrop-blur-sm border border-pink-200/30 dark:border-pink-700/30"
    >
      <div class="text-center mb-8">
        <h1 class="text-3xl font-display font-bold text-primary">Welcome Back</h1>
        <p class="text-sm text-text-light mt-2">Sign in to continue planning your event</p>
      </div>

      <!-- Error Alert -->
      <div
        v-if="backendError"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start"
      >
        <div class="flex-shrink-0 mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <p class="text-sm">{{ backendErrorMessage }}</p>
      </div>

      <Form
        :validation-schema="validationSchema"
        class="space-y-4"
        @submit="onSubmit"
        @invalid-submit="onInvalidSubmit"
      >
        <CInput
          id="sign_in_email"
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          name="email"
          show-error
        />

        <CInput
          id="sign_in_password"
          v-model="form.password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          name="password"
          show-error
        />

        <div
          id="hcaptcha-container"
          class="my-4 w-full rounded-md overflow-hidden"
          :data-sitekey="captchaSiteKey"
          data-callback="onCaptchaSuccess"
          data-size="normal"
        ></div>

        <div class="flex justify-between text-sm text-text-light">
          <CCheckbox v-model="form.remember" label="Remember me" name="remember" show-error />

          <router-link to="/forgot-password">
            <span class="text-primary hover:underline">Forgot password?</span>
          </router-link>
        </div>

        <CButton
          :disabled="sending || (!captchaToken && !isLocalEnvironment)"
          variant="primary"
          full
          type="submit"
          class="mt-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        >
          <span v-if="!sending">Sign In</span>
          <span v-else class="flex items-center justify-center">
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Signing in...
          </span>
        </CButton>
      </Form>

      <!-- Social Login Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300/50 dark:border-gray-600/50"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-transparent text-gray-500 dark:text-gray-400">Or continue with</span>
        </div>
      </div>

      <!-- Social Login Buttons -->
      <div class="grid grid-cols-1 gap-4 mb-6">
        <!-- Google Login Button -->
        <button
          class="flex items-center justify-center px-4 py-3 border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-700/90 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
          :disabled="sending"
          @click="handleGoogleLogin"
        >
          <svg
            class="h-5 w-5 mr-2"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path
                fill="#4285F4"
                d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
              />
              <path
                fill="#34A853"
                d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
              />
              <path
                fill="#FBBC05"
                d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
              />
              <path
                fill="#EA4335"
                d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
              />
            </g>
          </svg>
          Google
        </button>

        <!-- Facebook Login Button -->
      </div>

      <p class="text-center text-sm text-text-light">
        Don't have an account?
        <router-link to="/sign-up">
          <span class="text-primary font-medium hover:underline">Create one</span>
        </router-link>
      </p>
    </CCard>
  </section>
</template>

<style scoped>
#hcaptcha-container iframe {
  width: 100% !important;
  min-height: 65px;
  border-radius: 0.5rem;
}
</style>
