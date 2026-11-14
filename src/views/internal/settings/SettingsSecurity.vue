<script setup>
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as zod from 'zod'
import { toTypedSchema } from '@/utils/zodTypedSchema'
import { useUserStore } from '@/stores/useUserStore'
import { UiCard, UiField, UiInput, UiButton, useToast } from '@/ui'

const { t } = useI18n()
const { success, error } = useToast()
const userStore = useUserStore()
const saving = ref(false)

const { handleSubmit, defineField, errors, resetForm, setFieldError } = useForm({
  validationSchema: computed(() => toTypedSchema(
    zod
      .object({
        currentPassword: zod.string().min(1, t('validation.passwordRequired')),
        newPassword: zod.string().min(8, t('validation.passwordMin')),
        newPasswordConfirmation: zod.string().min(1, t('validation.passwordRequired'))
      })
      .refine(data => data.newPassword === data.newPasswordConfirmation, {
        message: t('validation.passwordsMismatch'),
        path: ['newPasswordConfirmation']
      })
  )),
  initialValues: { currentPassword: '', newPassword: '', newPasswordConfirmation: '' }
})
const [currentPassword] = defineField('currentPassword')
const [newPassword] = defineField('newPassword')
const [newPasswordConfirmation] = defineField('newPasswordConfirmation')

const onSubmit = handleSubmit(async values => {
  saving.value = true
  try {
    const response = await userStore.changeUserPassword(values)
    if (response.status === 200) {
      resetForm()
      success(t('account.security.saved'))
    } else {
      error(t('account.saveError'))
    }
  } catch (e) {
    const fieldErrors = e.response?.data?.errors ?? {}
    if (fieldErrors.currentPassword) setFieldError('currentPassword', t('account.security.wrongCurrent'))
    else error(t('account.saveError'))
  } finally {
    saving.value = false
  }
})
</script>

<template>
  <UiCard :title="t('account.security.title')" :subtitle="t('account.security.text')" heading-level="h2">
    <form class="flex flex-col gap-5" novalidate @submit="onSubmit">
      <UiField :label="t('account.security.current')" :error="errors.currentPassword" id="account_current_password">
        <UiInput v-model="currentPassword" type="password" autocomplete="current-password" />
      </UiField>

      <UiField :label="t('account.security.new')" :hint="t('account.security.hint')" :error="errors.newPassword" id="account_new_password">
        <UiInput v-model="newPassword" type="password" autocomplete="new-password" />
      </UiField>

      <UiField :label="t('account.security.confirm')" :error="errors.newPasswordConfirmation" id="account_confirm_password">
        <UiInput v-model="newPasswordConfirmation" type="password" autocomplete="new-password" />
      </UiField>

      <UiButton type="submit" :loading="saving" class="w-full sm:w-auto sm:self-end">
        {{ t('account.security.save') }}
      </UiButton>
    </form>
  </UiCard>
</template>
