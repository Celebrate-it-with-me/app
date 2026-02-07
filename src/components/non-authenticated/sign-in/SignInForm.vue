<script setup>
import { Form } from 'vee-validate'
import { computed, reactive, ref, watch } from 'vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import PasswordField from '@/components/UI/form/PasswordField.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useUserStore } from '@/stores/useUserStore'
import { detect } from 'detect-browser'
import { useRouter } from 'vue-router'

const backendError = ref(false)
const backendErrorMessage = ref('')
const userStore = useUserStore()
const router = useRouter()
const localState = reactive({
  email: '',
  password: '',
  sending: false
})

const registerValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
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
    const browser = detect()
    const device = browser ? `${browser.name} ${browser.version}` : 'unknown'

    const response = await userStore.login({ ...localState, device })

    if (response.status >= 200 && response.status < 300) {
      const result = response.data ?? {}
      userStore.initUserData({
        name: result?.user?.name ?? '',
        email: result?.user?.email ?? '',
        userId: result?.user?.id ?? '',
        lastLogin: result?.user?.last_login_session ?? null
      })

      return await router.push('dashboard')
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
  <div class="w-full max-w-md mx-auto">
    <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 md:p-10 relative overflow-hidden">
      <!-- Card inner glow effect -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl"></div>

      <div class="relative z-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <h3 class="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Login to Reconnect!
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            Welcome back to your celebration journey
          </p>
        </div>

        <Form
          :validation-schema="registerValidationSchema"
          @submit="onSubmit"
          @invalid-submit="onInvalidSubmit"
        >
          <!-- Error Message -->
          <div v-if="backendError" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <p class="text-red-600 dark:text-red-400 text-sm font-medium">
              {{ backendErrorMessage }}
            </p>
          </div>

          <!-- Email -->
          <div class="mb-6">
            <EmailField
              id="email"
              v-model="localState.email"
              name="email"
              label="Email"
              :class-label="'block text-gray-700 dark:text-gray-300 font-semibold mb-3 text-sm'"
              show-error
              required
              :class-input="`w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50 rounded-xl px-5 py-4 text-lg
                        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 shadow-inner placeholder-gray-500 dark:placeholder-gray-400`"
              placeholder="Enter your email address"
            />
          </div>

          <!-- Password -->
          <div class="mb-8">
            <PasswordField
              id="password"
              v-model="localState.password"
              name="password"
              label="Password"
              :class-label="'block text-gray-700 dark:text-gray-300 font-semibold mb-3 text-sm'"
              show-error
              required
              :class-input="`w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50 rounded-xl px-5 py-4 text-lg
                        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 shadow-inner placeholder-gray-500 dark:placeholder-gray-400`"
              placeholder="Enter your password"
            />
          </div>

          <!-- Submit Button -->
          <div class="mb-6">
            <button
              type="submit"
              :disabled="localState.sending"
              class="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span v-if="!localState.sending">Login</span>
              <span v-else class="flex items-center justify-center">
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Logging in...
              </span>
            </button>
          </div>

          <!-- Sign Up Link -->
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Don't have an account?
              <router-link
                :to="'sign-up'"
                class="font-semibold text-primary hover:text-primary-dark transition-colors duration-200 ml-1"
              >
                Click here to sign up!
              </router-link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
