<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock } from 'lucide-vue-next'
import { UiField, UiInput } from '@/ui'

const props = defineProps({
  modelValue: { type: String, default: '' },
  /** Fixed once the event has been published: the guests' links depend on it. */
  locked: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const origin = typeof window !== 'undefined' ? window.location.origin : ''
const linkStart = computed(() => `${origin}/i/${props.modelValue || '…'}/`)
</script>

<template>
  <UiField :label="t('events.address.label')" :error="error" id="event_address">
    <div class="relative">
      <UiInput
        :model-value="modelValue"
        :disabled="locked || disabled"
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
        :class="locked && 'pr-11'"
        @update:model-value="value => emit('update:modelValue', value)"
      />
      <Lock v-if="locked" class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
    </div>
    <p class="mt-2 text-sm text-ink-600">
      {{ locked ? t('events.address.hintLocked') : t('events.address.hintOpen') }}
    </p>
    <p class="mt-1 text-xs text-ink-500">
      {{ t('events.address.linkPreview') }}: <span class="break-all font-medium text-ink-700">{{ linkStart }}</span>
    </p>
  </UiField>
</template>
