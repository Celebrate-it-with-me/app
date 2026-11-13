<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiField, UiInput, UiSelect, UiTextarea, UiButton } from '@/ui'
import { DIET_TYPES, ITEM_TYPES, NO_DIET, itemNameError, toItemPayload } from '@/modules/menus/utils/menus'

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  /** Field errors coming from the API (422), keyed by payload field. */
  errors: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:open', 'submitted'])
const { t } = useI18n()

const form = reactive({ name: '', itemType: 'starter', dietType: NO_DIET, notes: '' })
const touched = ref(false)

watch(
  () => props.open,
  open => {
    if (open) {
      Object.assign(form, { name: '', itemType: 'starter', dietType: NO_DIET, notes: '' })
      touched.value = false
    }
  }
)

const typeOptions = computed(() => ITEM_TYPES.map(value => ({ value, label: t(`app.menus.types.${value}`) })))
const dietOptions = computed(() => [
  { value: NO_DIET, label: t('app.menus.diets.none') },
  ...DIET_TYPES.map(value => ({ value, label: t(`app.menus.diets.${value}`) }))
])
const nameError = computed(() => (touched.value && itemNameError(form.name) ? t(itemNameError(form.name)) : props.errors.name ?? ''))

const onSubmit = () => {
  touched.value = true
  if (itemNameError(form.name)) return
  emit('submitted', toItemPayload(form))
}
</script>

<template>
  <UiModal :open="open" :title="t('app.menus.addItem')" @update:open="emit('update:open', $event)">
    <form id="menu-item-form" class="space-y-4" novalidate @submit.prevent="onSubmit">
      <UiField :label="t('app.menus.itemName')" :error="nameError" required>
        <template #default="{ id, invalid }">
          <UiInput :id="id" v-model="form.name" :invalid="invalid" :placeholder="t('app.menus.itemNamePlaceholder')" autocomplete="off" />
        </template>
      </UiField>

      <UiField :label="t('app.menus.itemType')" :error="errors.itemType">
        <template #default="{ id }">
          <UiSelect :id="id" v-model="form.itemType" :options="typeOptions" />
        </template>
      </UiField>

      <UiField :label="t('app.menus.dietType')" :error="errors.dietType">
        <template #default="{ id }">
          <UiSelect :id="id" v-model="form.dietType" :options="dietOptions" />
        </template>
      </UiField>

      <UiField :label="t('app.menus.itemNotes')" :error="errors.notes">
        <template #default="{ id }">
          <UiTextarea :id="id" v-model="form.notes" :rows="3" :placeholder="t('app.menus.itemNotesPlaceholder')" />
        </template>
      </UiField>
    </form>
    <template #footer>
      <UiButton variant="secondary" @click="emit('update:open', false)">{{ t('app.menus.cancel') }}</UiButton>
      <UiButton type="submit" form="menu-item-form" :loading="loading">{{ t('app.menus.addItemConfirm') }}</UiButton>
    </template>
  </UiModal>
</template>
