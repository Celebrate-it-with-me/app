<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiRadioGroup, UiButton, useToast } from '@/ui'
import PurchasesService from '../services/PurchasesService'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** { kind: 'invoice' | 'credit-note', id, number } */
  document: { type: Object, default: null },
  accountEmail: { type: String, default: '' },
  billingEmail: { type: String, default: '' }
})
const emit = defineEmits(['update:open'])

const { t } = useI18n()
const { success, error } = useToast()
const target = ref('account')
const sending = ref(false)

const options = computed(() => [
  ...(props.billingEmail ? [{ value: 'billing', label: t('resend.billing'), description: props.billingEmail }] : []),
  { value: 'account', label: t('resend.account'), description: props.accountEmail }
])

watch(
  () => props.open,
  isOpen => {
    if (isOpen) target.value = props.billingEmail ? 'billing' : 'account'
  }
)

async function send() {
  sending.value = true
  try {
    const sentTo = await PurchasesService.resend(props.document.kind, props.document.id, target.value)
    success(t('resend.sent', { email: sentTo }))
    emit('update:open', false)
  } catch (e) {
    error(e.response?.status === 429 ? t('resend.tooMany') : t('resend.error'))
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <UiModal :open="open" size="sm" :title="t('resend.title')" :description="t('resend.text', { number: document?.number ?? '' })" @update:open="v => emit('update:open', v)">
    <div class="flex flex-col gap-4">
      <UiRadioGroup v-model="target" :options="options" />
      <p v-if="!billingEmail" class="text-sm text-ink-500">{{ t('resend.noBilling') }}</p>
    </div>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('resend.cancel') }}</UiButton>
      <UiButton :loading="sending" @click="send">{{ t('resend.send') }}</UiButton>
    </template>
  </UiModal>
</template>
