<script setup>
import { ref, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as zod from 'zod'
import { toTypedSchema } from '@/utils/zodTypedSchema'
import { normalizePhone } from '@/utils/phone'
import { useUserStore } from '@/stores/useUserStore'
import { SUPPORT_EMAIL } from '@/config/brand'
import { useUserAvatar } from '@/composables/useUserAvatar'
import { UiCard, UiField, UiInput, UiButton, UiAvatar, useToast } from '@/ui'

const { t } = useI18n()
const { success, error } = useToast()
const userStore = useUserStore()
const saving = ref(false)

const { handleSubmit, defineField, errors, meta, resetForm, setFieldError } = useForm({
  validationSchema: toTypedSchema(
    zod.object({
      name: zod.string({ message: t('validation.nameRequired') }).trim().min(1, t('validation.nameRequired')),
      phone: zod
        .string()
        .optional()
        .refine(value => normalizePhone(value) !== null, { message: t('account.profile.phoneInvalid') })
    })
  ),
  initialValues: { name: '', phone: '' }
})
const [name] = defineField('name')
const [phone] = defineField('phone')

const avatar = useUserAvatar()

onMounted(() => resetForm({ values: { name: userStore.name ?? '', phone: userStore.phone ?? '' } }))

const onSubmit = handleSubmit(async values => {
  saving.value = true
  try {
    const response = await userStore.updateProfile({ name: values.name.trim(), phone: normalizePhone(values.phone) })
    if (response.status === 200) {
      await userStore.refreshUser()
      resetForm({ values: { name: userStore.name ?? '', phone: userStore.phone ?? '' } })
      success(t('account.saved'))
    } else {
      error(t('account.saveError'))
    }
  } catch (e) {
    const fieldErrors = e.response?.data?.errors ?? {}
    if (fieldErrors.phone) setFieldError('phone', t('account.profile.phoneInvalid'))
    else if (fieldErrors.name) setFieldError('name', t('validation.nameRequired'))
    else error(t('account.saveError'))
  } finally {
    saving.value = false
  }
})
</script>

<template>
  <UiCard :title="t('account.profile.title')" :subtitle="t('account.profile.text')" heading-level="h2">
    <form class="flex flex-col gap-5" novalidate @submit="onSubmit">
      <div class="flex items-center gap-4">
        <UiAvatar :name="avatar.name.value" :src="avatar.src.value" :alt="avatar.alt.value" size="xl" />
        <div class="min-w-0">
          <p class="truncate font-heading text-xl text-ink-900">{{ userStore.name }}</p>
          <p class="truncate text-sm text-ink-500">{{ userStore.email }}</p>
        </div>
      </div>

      <UiField :label="t('account.profile.name')" :error="errors.name" id="account_name" required>
        <UiInput v-model="name" autocomplete="name" />
      </UiField>

      <UiField :label="t('account.profile.email')" :hint="t('account.profile.emailHint', { email: SUPPORT_EMAIL })" id="account_email">
        <UiInput :model-value="userStore.email" type="email" disabled />
      </UiField>

      <UiField :label="t('account.profile.phone')" :hint="t('account.profile.phoneHint')" :error="errors.phone" id="account_phone">
        <UiInput v-model="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+1 305 555 0123" />
      </UiField>

      <UiButton type="submit" :loading="saving" :disabled="!meta.dirty" class="w-full sm:w-auto sm:self-end">
        {{ t('account.save') }}
      </UiButton>
    </form>
  </UiCard>
</template>
