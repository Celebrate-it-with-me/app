<script setup>
/** Maps one field of `editable.json` (as the API describes it) to its control. Unknown types are not drawn. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import FieldShell from './FieldShell.vue'
import TextField from './TextField.vue'
import ColorField from './ColorField.vue'
import ChoiceField from './ChoiceField.vue'
import ToggleField from './ToggleField.vue'
import CoverPhotoField from '@/modules/template-picker/components/CoverPhotoField.vue'

const props = defineProps({
  field: { type: Object, required: true },
  /** `{ code, lang? }` from the check or the API, or null. */
  error: { type: Object, default: null },
  readOnly: { type: Boolean, default: false },
  eventId: { type: [Number, String], default: null }
})
const emit = defineEmits(['update', 'reset', 'image-changed'])
const { t, te, locale } = useI18n()

const baseId = computed(() => `ie-${props.field.id}`)
const router = useRouter()
const disabled = computed(() => props.readOnly || Boolean(props.field.locked))
const message = computed(() => {
  if (!props.error) return ''
  const { code, lang } = props.error
  const key = te(`invitationEditor.errors.${code}`) ? code : 'generic'
  const max = props.field.max?.[lang ?? locale.value] ?? props.field.max
  const text = t(`invitationEditor.errors.${key}`, { max: typeof max === 'number' ? max : 1000 })
  return lang ? `${t(`invitationEditor.field.lang.${lang}`)}: ${text}` : text
})
// No payment logic here: the existing unlock screen already explains and charges (`PurchasePanel`).
const unlock = () => router.push({ name: 'unlock', params: { module: 'full' } })
const known = computed(() => ['text', 'color', 'choice', 'toggle', 'image'].includes(props.field.type))
</script>

<template>
  <FieldShell
    v-if="known"
    v-slot="{ describedBy }"
    :field="field"
    :base-id="baseId"
    :error="message"
    :label-for="field.type === 'color' ? `${baseId}-hex` : ''"
    :hide-label="field.type === 'toggle' || field.type === 'image'"
    :read-only="readOnly"
    @reset="emit('reset')"
    @unlock="unlock"
  >
    <TextField v-if="field.type === 'text'" :field="field" :base-id="baseId" :described-by="describedBy" :invalid="Boolean(error)" :invalid-lang="error?.lang ?? null" :disabled="disabled" @update="v => emit('update', v)" />
    <ColorField v-else-if="field.type === 'color'" :field="field" :base-id="baseId" :described-by="describedBy" :invalid="Boolean(error)" :disabled="disabled" @update="v => emit('update', v)" />
    <ChoiceField v-else-if="field.type === 'choice'" :field="field" :base-id="baseId" :described-by="describedBy" :disabled="disabled" @update="v => emit('update', v)" />
    <ToggleField v-else-if="field.type === 'toggle'" :field="field" :disabled="disabled" @update="v => emit('update', v)" @unlock="unlock" />
    <CoverPhotoField v-else-if="field.type === 'image' && eventId != null" :field="field" :event-id="eventId" :disabled="disabled" @changed="v => emit('image-changed', v)" />
  </FieldShell>
</template>
