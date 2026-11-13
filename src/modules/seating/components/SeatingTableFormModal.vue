<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiField, UiInput, UiSelect, UiButton } from '@/ui'
import {
  NO_LOCATION,
  TABLE_LOCATIONS,
  TABLE_TYPES,
  emptyTableForm,
  tableToForm,
  validateTableForm
} from '@/modules/seating/utils/seating'

const props = defineProps({
  open: { type: Boolean, default: false },
  table: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])
const { t } = useI18n()

const form = reactive(emptyTableForm())
const errors = ref({})
const submitted = ref(false)
const editing = computed(() => !!props.table)

watch(
  () => props.open,
  open => {
    if (!open) return
    Object.assign(form, props.table ? tableToForm(props.table) : emptyTableForm())
    errors.value = {}
    submitted.value = false
  }
)

watch(form, () => {
  if (submitted.value) errors.value = validateTableForm(form)
})

const typeOptions = computed(() => TABLE_TYPES.map(value => ({ value, label: t(`app.seating.type.${value}`) })))
const locationOptions = computed(() => [
  { value: NO_LOCATION, label: t('app.seating.form.locationNone') },
  ...TABLE_LOCATIONS.map(value => ({ value, label: t(`app.seating.location.${value}`) }))
])

const err = field => (errors.value[field] ? t(`app.seating.form.errors.${field}`) : '')

function submit() {
  submitted.value = true
  errors.value = validateTableForm(form)
  if (Object.keys(errors.value).length) return
  emit('save', { ...form })
}
</script>

<template>
  <UiModal
    :open="open"
    :title="t(editing ? 'app.seating.form.editTitle' : 'app.seating.form.createTitle')"
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <form id="seating-table-form" class="space-y-4" novalidate @submit.prevent="submit">
      <UiField :label="t('app.seating.form.name')" :hint="t('app.seating.form.nameHint')" :error="err('name')" required>
        <UiInput
          v-model="form.name"
          :invalid="!!errors.name"
          :placeholder="t('app.seating.form.namePlaceholder')"
          maxlength="80"
          autocomplete="off"
        />
      </UiField>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UiField :label="t('app.seating.form.capacity')" :error="err('capacity')" required>
          <UiInput
            v-model="form.capacity"
            type="number"
            inputmode="numeric"
            min="1"
            :invalid="!!errors.capacity"
            :placeholder="t('app.seating.form.capacityPlaceholder')"
          />
        </UiField>
        <UiField :label="t('app.seating.form.type')" required>
          <UiSelect v-model="form.type" :options="typeOptions" />
        </UiField>
      </div>

      <div>
        <label for="seating-priority" class="flex items-baseline justify-between text-sm font-medium text-ink-900">
          {{ t('app.seating.form.priority') }}
          <span class="text-ink-700 tabular-nums">{{ form.priority }}</span>
        </label>
        <input
          id="seating-priority"
          v-model.number="form.priority"
          type="range"
          min="1"
          max="10"
          step="1"
          class="mt-2 h-11 w-full cursor-pointer accent-rose-600"
        />
        <div class="flex justify-between text-xs text-ink-500">
          <span>{{ t('app.seating.form.priorityLow') }}</span>
          <span>{{ t('app.seating.form.priorityHigh') }}</span>
        </div>
        <p class="mt-1 text-sm text-ink-500">{{ t('app.seating.form.priorityHint') }}</p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UiField :label="t('app.seating.form.reservedFor')" :hint="t('app.seating.form.reservedHint')">
          <UiInput
            v-model="form.reserved_for"
            :placeholder="t('app.seating.form.reservedPlaceholder')"
            maxlength="120"
            autocomplete="off"
          />
        </UiField>
        <UiField :label="t('app.seating.form.location')" :hint="t('app.seating.form.locationHint')">
          <UiSelect v-model="form.location" :options="locationOptions" />
        </UiField>
      </div>
    </form>

    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UiButton variant="ghost" :disabled="saving" @click="emit('update:open', false)">
          {{ t('app.seating.cancel') }}
        </UiButton>
        <UiButton type="submit" form="seating-table-form" :loading="saving">
          {{ t(editing ? 'app.seating.form.save' : 'app.seating.form.create') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
