<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiField, UiInput, UiButton } from '@/ui'

const props = defineProps({
  open: { type: Boolean, default: false },
  cap: { type: Number, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])
const { t } = useI18n()

const value = ref('')
const error = ref('')

watch(
  () => props.open,
  open => {
    if (!open) return
    value.value = props.cap === null ? '' : String(props.cap)
    error.value = ''
  }
)

function submit() {
  const number = value.value === '' ? null : Number(value.value)
  if (number !== null && (Number.isNaN(number) || number < 0)) {
    error.value = t('app.budget.errors.amount')
    return
  }
  emit('save', number)
}
</script>

<template>
  <UiModal :open="open" :title="t('app.budget.cap.title')" :description="t('app.budget.cap.text')" size="sm" @update:open="emit('update:open', $event)">
    <form id="budget-cap-form" novalidate @submit.prevent="submit">
      <UiField :label="t('app.budget.cap.label')" :hint="t('app.budget.cap.hint')" :error="error">
        <UiInput v-model="value" type="number" inputmode="decimal" min="0" step="1" :invalid="!!error" />
      </UiField>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.budget.cancel') }}</UiButton>
      <UiButton type="submit" form="budget-cap-form" :loading="saving">{{ t('app.budget.save') }}</UiButton>
    </template>
  </UiModal>
</template>
