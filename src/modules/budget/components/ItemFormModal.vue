<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiField, UiInput, UiSelect, UiTextarea, UiButton } from '@/ui'
import { emptyItem, formFromItem, itemErrors } from '../utils/budget'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save', 'categories'])
const { t } = useI18n()

const form = ref(emptyItem())
const errors = ref({})

watch(
  () => props.open,
  open => {
    if (!open) return
    form.value = props.item ? formFromItem(props.item) : emptyItem()
    errors.value = {}
  }
)

const options = computed(() => [
  { value: '', label: t('app.budget.form.noCategory') },
  ...props.categories.map(category => ({ value: category.id, label: category.name }))
])
const err = key => (errors.value[key] ? t(errors.value[key]) : '')

function submit() {
  errors.value = itemErrors(form.value)
  if (!Object.keys(errors.value).length) emit('save', { ...form.value })
}
</script>

<template>
  <UiModal :open="open" :title="t(item ? 'app.budget.form.editTitle' : 'app.budget.form.addTitle')" size="md" @update:open="emit('update:open', $event)">
    <form id="budget-item-form" class="space-y-4" novalidate @submit.prevent="submit">
      <UiField :label="t('app.budget.form.title')" :error="err('title')" required>
        <UiInput v-model="form.title" :invalid="!!errors.title" maxlength="160" autocomplete="off" />
      </UiField>
      <UiField :label="t('app.budget.form.category')">
        <UiSelect v-model="form.categoryId" :options="options" />
        <button type="button" class="mt-1.5 text-sm font-medium text-rose-700 underline-offset-4 hover:underline" @click="emit('categories')">
          {{ t('app.budget.form.manageCategories') }}
        </button>
      </UiField>
      <div class="grid gap-3 sm:grid-cols-2">
        <UiField :label="t('app.budget.form.estimated')" :error="err('estimatedCost')" :hint="t('app.budget.form.estimatedHint')" required>
          <UiInput v-model="form.estimatedCost" type="number" inputmode="decimal" min="0" step="0.01" :invalid="!!errors.estimatedCost" />
        </UiField>
        <UiField :label="t('app.budget.form.agreed')" :error="err('agreedCost')" :hint="t('app.budget.form.agreedHint')">
          <UiInput v-model="form.agreedCost" type="number" inputmode="decimal" min="0" step="0.01" :invalid="!!errors.agreedCost" />
        </UiField>
      </div>
      <UiField :label="t('app.budget.form.dueDate')" :hint="t('app.budget.form.dueDateHint')">
        <UiInput v-model="form.dueDate" type="date" />
      </UiField>
      <div class="grid gap-3 sm:grid-cols-2">
        <UiField :label="t('app.budget.form.vendor')">
          <UiInput v-model="form.vendorName" maxlength="120" autocomplete="off" />
        </UiField>
        <UiField :label="t('app.budget.form.vendorPhone')">
          <UiInput v-model="form.vendorPhone" type="tel" inputmode="tel" maxlength="30" autocomplete="off" />
        </UiField>
      </div>
      <UiField :label="t('app.budget.form.notes')" :hint="t('app.budget.optional')">
        <UiTextarea v-model="form.description" :rows="2" :maxlength="1000" />
      </UiField>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.budget.cancel') }}</UiButton>
      <UiButton type="submit" form="budget-item-form" :loading="saving">{{ t('app.budget.save') }}</UiButton>
    </template>
  </UiModal>
</template>
