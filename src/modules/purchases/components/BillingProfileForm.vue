<script setup>
import { ref, computed, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as zod from 'zod'
import { toTypedSchema } from '@/utils/zodTypedSchema'
import { UiCard, UiField, UiInput, UiSelect, UiButton, UiSkeleton, useToast } from '@/ui'
import PurchasesService from '../services/PurchasesService'
import { countryOptions, TAX_ID_PATTERN, toFormValues, toPayload } from '../utils/billing'

const { t, locale } = useI18n()
const { success, error } = useToast()

const loading = ref(true)
const failed = ref(false)
const saving = ref(false)
const accountEmail = ref('')
const countries = computed(() => countryOptions(locale.value))

const optionalText = max => zod.string().max(max, t('billing.tooLong')).optional()

const { handleSubmit, defineField, errors, meta, resetForm, setFieldError } = useForm({
  validationSchema: toTypedSchema(
    zod.object({
      name: zod.string({ message: t('billing.nameRequired') }).trim().min(1, t('billing.nameRequired')).max(255, t('billing.tooLong')),
      billingEmail: zod.string({ message: t('billing.emailInvalid') }).trim().pipe(zod.email(t('billing.emailInvalid'))),
      address: optionalText(255),
      city: optionalText(120),
      state: optionalText(120),
      postalCode: zod
        .string()
        .trim()
        .max(20, t('billing.tooLong'))
        .refine(v => v === '' || /^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(v), { message: t('billing.postalInvalid') })
        .optional(),
      country: zod.string().length(2, t('billing.countryRequired')),
      taxId: zod
        .string()
        .trim()
        .refine(v => v === '' || (v.length >= 3 && v.length <= 30 && TAX_ID_PATTERN.test(v)), { message: t('billing.taxIdInvalid') })
        .optional()
    })
  ),
  initialValues: toFormValues(null)
})
const [name] = defineField('name')
const [billingEmail] = defineField('billingEmail')
const [address] = defineField('address')
const [city] = defineField('city')
const [state] = defineField('state')
const [postalCode] = defineField('postalCode')
const [country] = defineField('country')
const [taxId] = defineField('taxId')

async function load() {
  loading.value = true
  failed.value = false
  try {
    const profile = await PurchasesService.billingProfile()
    accountEmail.value = profile.accountEmail
    // First time: suggest the account email as the billing email.
    resetForm({ values: toFormValues(profile.exists ? profile : null, profile.accountEmail) })
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

const onSubmit = handleSubmit(async values => {
  saving.value = true
  try {
    const saved = await PurchasesService.saveBillingProfile(toPayload(values))
    resetForm({ values: toFormValues(saved, accountEmail.value) })
    success(t('billing.saved'))
  } catch (e) {
    const fieldErrors = e.response?.data?.errors ?? {}
    const map = { name: 'nameRequired', billingEmail: 'emailInvalid', country: 'countryRequired', taxId: 'taxIdInvalid', postalCode: 'postalInvalid' }
    const first = Object.keys(map).find(key => fieldErrors[key])
    if (first) setFieldError(first, t(`billing.${map[first]}`))
    else error(t('billing.saveError'))
  } finally {
    saving.value = false
  }
})

onMounted(load)
</script>

<template>
  <UiCard :title="t('billing.title')" :subtitle="t('billing.text')" heading-level="h2">
    <div v-if="loading" class="flex flex-col gap-4" aria-busy="true">
      <UiSkeleton :lines="3" />
    </div>

    <div v-else-if="failed" class="flex flex-col items-start gap-3" role="alert">
      <p class="text-base text-danger-700">{{ t('billing.loadError') }}</p>
      <UiButton variant="secondary" @click="load">{{ t('purchases.retry') }}</UiButton>
    </div>

    <form v-else class="flex flex-col gap-5" novalidate @submit="onSubmit">
      <UiField :label="t('billing.name')" :hint="t('billing.nameHint')" :error="errors.name" id="billing_name" required>
        <UiInput v-model="name" autocomplete="organization" />
      </UiField>

      <UiField :label="t('billing.email')" :hint="t('billing.emailHint')" :error="errors.billingEmail" id="billing_email" required>
        <UiInput v-model="billingEmail" type="email" inputmode="email" autocomplete="email" />
      </UiField>

      <UiField :label="t('billing.address')" :error="errors.address" id="billing_address">
        <UiInput v-model="address" autocomplete="address-line1" />
      </UiField>

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <UiField :label="t('billing.city')" :error="errors.city" id="billing_city">
          <UiInput v-model="city" autocomplete="address-level2" />
        </UiField>
        <UiField :label="t('billing.state')" :error="errors.state" id="billing_state">
          <UiInput v-model="state" autocomplete="address-level1" />
        </UiField>
        <UiField :label="t('billing.postalCode')" :error="errors.postalCode" id="billing_postal">
          <UiInput v-model="postalCode" autocomplete="postal-code" />
        </UiField>
        <UiField :label="t('billing.country')" :error="errors.country" id="billing_country" required>
          <UiSelect v-model="country" :options="countries" />
        </UiField>
      </div>

      <UiField :label="t('billing.taxId')" :hint="t('billing.taxIdHint')" :error="errors.taxId" id="billing_tax_id">
        <UiInput v-model="taxId" autocomplete="off" />
      </UiField>

      <p class="rounded-lg bg-cream-100 p-3 text-sm text-ink-700">{{ t('billing.notice') }}</p>

      <UiButton type="submit" :loading="saving" :disabled="!meta.dirty" class="w-full sm:w-auto sm:self-end">
        {{ t('billing.save') }}
      </UiButton>
    </form>
  </UiCard>
</template>
