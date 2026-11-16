<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSwitch } from '@/ui'
import { pick } from '../utils/editorFields'

const props = defineProps({
  field: { type: Object, required: true },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update'])
const { locale } = useI18n()
const label = computed(() => pick(props.field.label, locale.value))
</script>

<template>
  <UiSwitch :model-value="Boolean(field.value)" :label="label" :disabled="disabled" @update:model-value="value => emit('update', value)" />
</template>
