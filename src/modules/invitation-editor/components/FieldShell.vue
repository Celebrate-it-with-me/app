<script setup>
/**
 * Common frame of every field: label, help, the control (slot), the error and the two escape hatches:
 * "back to the template's value" and, when the plan locks it, the way to unlock.
 * Ids: `<id>-label`, `<id>-help`, `<id>-error` so controls can reference them.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock, RotateCcw } from 'lucide-vue-next'
import { UiButton } from '@/ui'
import { pick } from '../utils/editorFields'

const props = defineProps({
  field: { type: Object, required: true },
  baseId: { type: String, required: true },
  /** Already translated message, or ''. */
  error: { type: String, default: '' },
  /** Id of the single control the label points to; omit for composite controls (they use aria-labelledby). */
  labelFor: { type: String, default: '' },
  hideLabel: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['reset', 'unlock'])
const { t, locale } = useI18n()

const label = computed(() => pick(props.field.label, locale.value))
const help = computed(() => (props.field.type === 'image' ? '' : pick(props.field.help, locale.value)))
// A photo has its own remove button (CoverPhotoField): "back to the template's value" is not offered for it.
const canReset = computed(() => !props.field.isDefault && !props.field.locked && !props.readOnly && props.field.type !== 'image')
const describedBy = computed(() => [help.value && `${props.baseId}-help`, props.error && `${props.baseId}-error`].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="flex flex-col gap-2" role="group" :aria-labelledby="`${baseId}-label`" :data-field="field.id">
    <div class="flex items-start gap-3" :class="hideLabel ? 'justify-end' : 'justify-between'">
      <component :is="labelFor ? 'label' : 'span'" v-if="!hideLabel" :id="`${baseId}-label`" :for="labelFor || undefined" class="text-sm font-semibold text-ink-700">
        {{ label }}
        <Lock v-if="field.locked" class="ml-1 inline h-3.5 w-3.5 text-gold-700" aria-hidden="true" />
        <span v-if="field.locked" class="sr-only"> ({{ t('invitationEditor.field.lockedSr') }})</span>
      </component>
      <span v-else :id="`${baseId}-label`" class="sr-only">{{ label }}</span>
      <button
        v-if="canReset"
        type="button"
        class="-my-1 flex min-h-8 shrink-0 items-center gap-1 rounded-md px-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-600"
        :aria-label="t('invitationEditor.field.resetFor', { name: label })"
        data-testid="reset"
        @click="emit('reset')"
      >
        <RotateCcw class="h-3.5 w-3.5" aria-hidden="true" />
        {{ t('invitationEditor.field.reset') }}
      </button>
    </div>

    <p v-if="help" :id="`${baseId}-help`" class="text-sm text-ink-500">{{ help }}</p>

    <slot :described-by="describedBy" />

    <p v-if="error" :id="`${baseId}-error`" class="text-sm text-danger-700" role="alert" data-testid="field-error">{{ error }}</p>

    <div v-if="field.locked" class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600" data-testid="field-locked">
      <span>{{ t('invitationEditor.field.lockedText') }}</span>
      <UiButton variant="link" size="sm" @click="emit('unlock')">{{ t('invitationEditor.field.unlock') }}</UiButton>
    </div>
  </div>
</template>
