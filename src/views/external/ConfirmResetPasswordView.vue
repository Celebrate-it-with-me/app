<script setup>
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import * as zod from 'zod'
import { toTypedSchema } from '@/utils/zodTypedSchema'
import { useUserStore } from '@/stores/useUserStore'
import { UiField, UiInput, UiButton, UiSkeleton } from '@/ui'
import AuthCard from '@/components/external/auth/AuthCard.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const sending = ref(false)
const valid = ref(false)
const accountEmail = ref('')
const backendError = ref('')

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(
    zod
      .object({
        email: zod
          .string({ message: t('validation.emailRequired') })
          .email({ message: t('validation.emailInvalid') })
          .refine(value => value === accountEmail.value, { message: t('validation.emailMismatch') }),
        password: zod.string({ message: t('validation.passwordRequired') }).min(8, { message: t('validation.passwordMin') }),
        confirmPassword: zod.string({ message: t('validation.passwordRequired') }).min(8, { message: t('validation.passwordMin') })
      })
      .refine(data => data.password === data.confirmPassword, {
        message: t('validation.passwordsMismatch'),
        path: ['confirmPassword']
      })
  ),
  initialValues: { email: '', password: '', confirmPassword: '' }
})
const [email] = defineField('email')
const [password] = defineField('password')
const [confirmPassword] = defineField('confirmPassword')

onMounted(async () => {
  try {
    const confirmUrl = route.query.confirm ? decodeURIComponent(route.query.confirm) : ''
    if (!confirmUrl) return
    const response = await userStore.checkResetLink(confirmUrl)
    if (response.status === 200) {
      accountEmail.value = response.data?.data?.email ?? ''
      valid.value = Boolean(accountEmail.value)
    } else {
      backendError.value = response.response?.data?.message ?? ''
    }
  } catch {
    valid.value = false
  } finally {
    loading.value = false
  }
})

const onSubmit = handleSubmit(async values => {
  sending.value = true
  backendError.value = ''
  try {
    const response = await userStore.changePassword({
      email: values.email,
      password: values.password,
      passwordConfirmation: values.confirmPassword
    })
    if (response.status === 200) return router.push('/password-updated')
    backendError.value = response.response?.data?.message ?? t('common.genericError')
  } catch (e) {
    backendError.value = e.response?.data?.message ?? t('common.genericError')
  } finally {
    sending.value = false
  }
})
</script>

<template>
  <AuthCard
    :title="t('auth.resetTitle')"
    :subtitle="loading ? '' : valid ? t('auth.resetText') : t('auth.resetInvalid')"
    :error="backendError"
  >
    <UiSkeleton v-if="loading" :lines="3" />
    <form v-else-if="valid" class="flex flex-col gap-4" novalidate @submit="onSubmit">
      <UiField :label="t('common.email')" :error="errors.email" id="reset_email">
        <UiInput v-model="email" type="email" autocomplete="email" :placeholder="t('auth.emailPlaceholder')" />
      </UiField>
      <UiField :label="t('auth.newPassword')" :error="errors.password" id="reset_password">
        <UiInput v-model="password" type="password" autocomplete="new-password" :placeholder="t('auth.passwordPlaceholder')" />
      </UiField>
      <UiField :label="t('auth.confirmPassword')" :error="errors.confirmPassword" id="reset_confirm">
        <UiInput v-model="confirmPassword" type="password" autocomplete="new-password" />
      </UiField>
      <UiButton type="submit" block :loading="sending">{{ t('auth.resetSubmit') }}</UiButton>
    </form>
    <UiButton v-else block variant="secondary" to="/forgot-password">{{ t('auth.forgotTitle') }}</UiButton>
    <template #footer>
      <router-link to="/sign-in" class="font-semibold text-rose-600 hover:underline">
        {{ t('common.signIn') }}
      </router-link>
    </template>
  </AuthCard>
</template>
