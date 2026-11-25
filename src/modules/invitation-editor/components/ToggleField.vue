<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock } from 'lucide-vue-next'
import { UiSwitch } from '@/ui'
import { pick } from '../utils/editorFields'

const props = defineProps({
  field: { type: Object, required: true },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update', 'unlock'])
const { t, locale } = useI18n()
const label = computed(() => pick(props.field.label, locale.value))
</script>

<template>
  <UiSwitch :model-value="Boolean(field.value)" :label="label" :disabled="disabled" @update:model-value="value => emit('update', value)">
    <!-- Locked: the name and the padlock are one tap target (>= 44 px) to the payment, like the other locked fields. -->
    <button
      v-if="field.locked"
      type="button"
      class="-my-2 flex min-h-11 items-center gap-1.5 rounded-md text-left text-base text-ink-900 focus-visible:outline-2 focus-visible:outline-rose-600"
      :aria-label="t('invitationEditor.field.lockedAria', { name: label })"
      data-testid="field-locked"
      @click.prevent="emit('unlock')"
    >
      {{ label }}
      <Lock class="h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
    </button>
    <template v-else>{{ label }}</template>
  </UiSwitch>
</template>
