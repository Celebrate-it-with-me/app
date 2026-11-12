<script setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { detect } from 'detect-browser'
import * as zod from 'zod'
import { toTypedSchema } from '@/utils/zodTypedSchema'
import { useUserStore } from '@/stores/useUserStore'
import { UiField, UiInput, UiCheckbox, UiButton } from '@/ui'
import AuthCard from '@/components/external/auth/AuthCard.vue'
import GoogleButton from '@/components/external/auth/GoogleButton.vue'
import { useCaptcha } from '@/components/external/auth/useCaptcha'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const captcha = useCaptcha()

const sending = ref(false)
const backendError = ref(route.query.message ? t('auth.socialFailed') : '')

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(
    zod.object({
      email: zod.string({ message: t('validation.emailRequired') }).email({ message: t('validation.emailInvalid') }),
      password: zod.string({ message: t('validation.passwordRequired') }).min(8, { message: t('validation.passwordMin') }),
      remember: zod.boolean().optional().default(false)
    })
  ),
  initialValues: { email: '', password: '', remember: false }
})
const [email] = defineField('email')
const [password] = defineField('password')
const [remember] = defineField('remember')

const onSubmit = handleSubmit(async values => {
  if (!captcha.isReady()) {
    backendError.value = t('common.captchaRequired')
    return
  }
  sending.value = true
  backendError.value = ''
  try {
    const browser = detect()
    const response = await userStore.login({
      ...values,
      device: browser ? `${browser.name} ${browser.version}` : 'unknown',
      hcaptcha_token: captcha.token.value
    })
    if (response.status >= 200 && response.status < 300) {
      const user = response.data?.user ?? {}
      userStore.initUserData({
        name: user.name ?? '',
        email: user.email ?? '',
        userId: user.id ?? '',
        lastLogin: user.last_login_session ?? null,
        activeEvent: user.activeEvent ?? null,
        justLogin: true,
        avatar: user.avatar_url ?? '',
        phone: user.phone ?? ''
      })
      const preferences = await userStore.getPreferences()
      if (preferences?.status === 200) userStore.setPreferences(preferences.data?.data ?? {})
      return router.push(route.query.redirect || '/dashboard')
    }
    backendError.value = response.response?.data?.message ?? t('common.genericError')
    captcha.reset()
  } catch (e) {
    backendError.value = e.response?.data?.message ?? t('common.genericError')
    captcha.reset()
  } finally {
    sending.value = false
  }
})
</script>

<template>
  <section class="flex justify-center px-4 py-10 sm:py-16">
    <AuthCard :title="t('auth.signInTitle')" :subtitle="t('auth.signInSubtitle')" :error="backendError">
      <form class="flex flex-col gap-4" novalidate @submit="onSubmit">
        <UiField :label="t('common.email')" :error="errors.email" id="sign_in_email">
          <UiInput v-model="email" type="email" autocomplete="email" :placeholder="t('auth.emailPlaceholder')" />
        </UiField>
        <UiField :label="t('common.password')" :error="errors.password" id="sign_in_password">
          <UiInput v-model="password" type="password" autocomplete="current-password" :placeholder="t('auth.passwordPlaceholder')" />
        </UiField>

        <div id="hcaptcha-container" class="w-full overflow-hidden rounded-md empty:hidden" />

        <div class="flex items-center justify-between gap-3 text-sm">
          <UiCheckbox v-model="remember" :label="t('auth.remember')" />
          <router-link to="/forgot-password" class="font-medium text-rose-600 hover:underline">
            {{ t('auth.forgot') }}
          </router-link>
        </div>

        <UiButton type="submit" block :loading="sending" class="mt-2">{{ t('common.signIn') }}</UiButton>
      </form>

      <GoogleButton :disabled="sending" />

      <template #footer>
        {{ t('auth.noAccount') }}
        <router-link to="/sign-up" class="font-semibold text-rose-600 hover:underline">
          {{ t('common.signUp') }}
        </router-link>
      </template>
    </AuthCard>
  </section>
</template>
