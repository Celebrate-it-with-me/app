<script setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as zod from 'zod'
import { toTypedSchema } from '@/utils/zodTypedSchema'
import { useUserStore } from '@/stores/useUserStore'
import { UiField, UiInput, UiButton } from '@/ui'
import AuthCard from '@/components/external/auth/AuthCard.vue'

const { t } = useI18n()
const userStore = useUserStore()
const sending = ref(false)
const sent = ref(false)
const backendError = ref('')

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(
    zod.object({
      email: zod.string({ message: t('validation.emailRequired') }).email({ message: t('validation.emailInvalid') })
    })
  ),
  initialValues: { email: '' }
})
const [email] = defineField('email')

const onSubmit = handleSubmit(async values => {
  sending.value = true
  backendError.value = ''
  try {
    const response = await userStore.sendResetPasswordLink(values)
    if (response.status === 200) sent.value = true
    else backendError.value = response.response?.data?.message ?? t('common.genericError')
  } catch (e) {
    backendError.value = e.response?.data?.message ?? t('common.genericError')
  } finally {
    sending.value = false
  }
})
</script>

<template>
  <AuthCard
    :title="t('auth.forgotTitle')"
    :subtitle="sent ? t('auth.forgotSent') : t('auth.forgotText')"
    :error="backendError"
  >
    <form v-if="!sent" class="flex flex-col gap-4" novalidate @submit="onSubmit">
      <UiField :label="t('common.email')" :error="errors.email" id="forgot_password_email">
        <UiInput v-model="email" type="email" autocomplete="email" :placeholder="t('auth.emailPlaceholder')" />
      </UiField>
      <UiButton type="submit" block :loading="sending">{{ t('auth.forgotSend') }}</UiButton>
    </form>
    <template #footer>
      <router-link to="/sign-in" class="font-semibold text-rose-600 hover:underline">
        {{ t('common.signIn') }}
      </router-link>
    </template>
  </AuthCard>
</template>
