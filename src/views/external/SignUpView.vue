<script setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import { detect } from 'detect-browser'
import * as zod from 'zod'
import { toTypedSchema } from '@/utils/zodTypedSchema'
import { useUserStore } from '@/stores/useUserStore'
import { UiField, UiInput, UiButton } from '@/ui'
import AuthCard from '@/components/external/auth/AuthCard.vue'
import GoogleButton from '@/components/external/auth/GoogleButton.vue'
import { useCaptcha } from '@/components/external/auth/useCaptcha'

const { t } = useI18n()
const userStore = useUserStore()
const captcha = useCaptcha()

const sending = ref(false)
const done = ref(false)
const backendError = ref('')

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(
    zod.object({
      name: zod.string({ message: t('validation.nameRequired') }).trim().min(1, { message: t('validation.nameRequired') }),
      email: zod.string({ message: t('validation.emailRequired') }).email({ message: t('validation.emailInvalid') }),
      password: zod.string({ message: t('validation.passwordRequired') }).min(8, { message: t('validation.passwordMin') })
    })
  ),
  initialValues: { name: '', email: '', password: '' }
})
const [name] = defineField('name')
const [email] = defineField('email')
const [password] = defineField('password')

const onSubmit = handleSubmit(async values => {
  if (!captcha.isReady()) {
    backendError.value = t('common.captchaRequired')
    return
  }
  sending.value = true
  backendError.value = ''
  try {
    const browser = detect()
    const response = await userStore.register({
      ...values,
      device: browser ? `${browser.name} ${browser.version}` : 'unknown',
      hcaptcha_token: captcha.token.value
    })
    if (response.status >= 200 && response.status < 300) {
      done.value = true
      return
    }
    backendError.value = response.response?.data?.message ?? t('common.genericError')
  } catch (e) {
    backendError.value = e.response?.data?.message ?? t('common.genericError')
  } finally {
    sending.value = false
  }
})
</script>

<template>
  <section class="flex justify-center px-4 py-10 sm:py-16">
    <AuthCard v-if="done" :title="t('auth.registered')" :subtitle="t('auth.registeredText')">
      <UiButton block to="/sign-in">{{ t('common.signIn') }}</UiButton>
    </AuthCard>

    <AuthCard v-else :title="t('auth.signUpTitle')" :subtitle="t('auth.signUpSubtitle')" :error="backendError">
      <form class="flex flex-col gap-4" novalidate @submit="onSubmit">
        <UiField :label="t('common.name')" :error="errors.name" id="sign_up_name">
          <UiInput v-model="name" autocomplete="name" :placeholder="t('auth.namePlaceholder')" />
        </UiField>
        <UiField :label="t('common.email')" :error="errors.email" id="sign_up_email">
          <UiInput v-model="email" type="email" autocomplete="email" :placeholder="t('auth.emailPlaceholder')" />
        </UiField>
        <UiField :label="t('common.password')" :error="errors.password" id="sign_up_password">
          <UiInput v-model="password" type="password" autocomplete="new-password" :placeholder="t('auth.passwordPlaceholder')" />
        </UiField>

        <div id="hcaptcha-container" class="w-full overflow-hidden rounded-md empty:hidden" />

        <UiButton type="submit" block :loading="sending" class="mt-2">{{ t('common.signUp') }}</UiButton>

        <i18n-t keypath="auth.acceptTerms" tag="p" class="text-center text-xs text-ink-400">
          <template #terms>
            <router-link to="/terms" class="underline hover:text-ink-700">{{ t('nav.terms') }}</router-link>
          </template>
          <template #privacy>
            <router-link to="/privacy" class="underline hover:text-ink-700">{{ t('nav.privacy') }}</router-link>
          </template>
        </i18n-t>
      </form>

      <GoogleButton :disabled="sending" />

      <template #footer>
        {{ t('auth.hasAccount') }}
        <router-link to="/sign-in" class="font-semibold text-rose-600 hover:underline">
          {{ t('common.signIn') }}
        </router-link>
      </template>
    </AuthCard>
  </section>
</template>
