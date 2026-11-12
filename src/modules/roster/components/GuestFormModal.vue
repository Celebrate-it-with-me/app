<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, X } from 'lucide-vue-next'
import { UiModal, UiField, UiInput, UiTextarea, UiButton } from '@/ui'
import { emptyPerson, personErrors } from '../utils/roster'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** The family being edited, or null to add one. */
  family: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])
const { t } = useI18n()

const person = ref(emptyPerson())
// Companions: { id?, name }. Those with an id exist already; removed ones are remembered to delete.
const companions = ref([])
const removed = ref([])
const errors = ref({})
const companionError = ref(false)

watch(
  () => props.open,
  open => {
    if (!open) return
    person.value = props.family
      ? { name: props.family.name, email: props.family.email ?? '', phone: props.family.phone ?? '', notes: props.family.notes ?? '' }
      : emptyPerson()
    companions.value = (props.family?.companions ?? []).map(c => ({ id: c.id, name: c.name }))
    removed.value = []
    errors.value = {}
    companionError.value = false
  }
)

const err = key => (errors.value[key] ? t(errors.value[key]) : '')
const editing = computed(() => !!props.family)

function addCompanion() {
  companions.value.push({ name: '' })
}
function dropCompanion(index) {
  const [gone] = companions.value.splice(index, 1)
  if (gone.id) removed.value.push(gone.id)
}

function submit() {
  errors.value = personErrors(person.value)
  companionError.value = companions.value.some(c => !c.name.trim())
  if (Object.keys(errors.value).length || companionError.value) return
  emit('save', { person: { ...person.value }, companions: companions.value.map(c => ({ ...c, name: c.name.trim() })), removed: [...removed.value] })
}
</script>

<template>
  <UiModal :open="open" :title="t(editing ? 'app.roster.editTitle' : 'app.roster.addTitle')" size="md" @update:open="emit('update:open', $event)">
    <form id="guest-form" class="space-y-4" novalidate @submit.prevent="submit">
      <UiField :label="t('app.roster.fields.name')" :error="err('name')" required>
        <UiInput v-model="person.name" :invalid="!!errors.name" maxlength="120" autocomplete="off" />
      </UiField>
      <div class="grid gap-3 sm:grid-cols-2">
        <UiField :label="t('app.roster.fields.phone')" :error="err('phone')" :hint="t('app.roster.phoneHint')">
          <UiInput v-model="person.phone" type="tel" inputmode="tel" :invalid="!!errors.phone" autocomplete="off" />
        </UiField>
        <UiField :label="t('app.roster.fields.email')" :error="err('email')">
          <UiInput v-model="person.email" type="email" :invalid="!!errors.email" autocomplete="off" />
        </UiField>
      </div>
      <UiField :label="t('app.roster.fields.notes')" :hint="t('app.roster.optional')">
        <UiTextarea v-model="person.notes" :rows="2" :maxlength="500" />
      </UiField>

      <fieldset class="space-y-2">
        <legend class="text-sm font-medium text-ink-900">{{ t('app.roster.companions') }}</legend>
        <p class="text-sm text-ink-500">{{ t('app.roster.companionsHint') }}</p>
        <div v-for="(companion, index) in companions" :key="companion.id ?? `n${index}`" class="flex items-center gap-2">
          <UiInput v-model="companion.name" :aria-label="t('app.roster.companionName')" :invalid="companionError && !companion.name.trim()" maxlength="120" class="flex-1" />
          <UiButton variant="ghost" size="sm" icon :aria-label="t('app.roster.removeCompanion')" @click="dropCompanion(index)">
            <X class="h-4 w-4" aria-hidden="true" />
          </UiButton>
        </div>
        <p v-if="companionError" class="text-sm text-danger-700" role="alert">{{ t('app.roster.errors.companion') }}</p>
        <UiButton variant="secondary" size="sm" @click="addCompanion">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.roster.addCompanion') }}
        </UiButton>
      </fieldset>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.roster.cancel') }}</UiButton>
      <UiButton type="submit" form="guest-form" :loading="saving">{{ t('app.roster.save') }}</UiButton>
    </template>
  </UiModal>
</template>
