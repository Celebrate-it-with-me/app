<script setup>
import { useI18n } from 'vue-i18n'
import { Check } from 'lucide-vue-next'
import { pick } from '../utils/editorFields'

defineProps({
  field: { type: Object, required: true },
  baseId: { type: String, required: true },
  describedBy: { type: String, default: undefined },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update'])
const { locale } = useI18n()
</script>

<template>
  <!-- Native radios: arrow keys, one tab stop and the group name come for free. -->
  <div class="grid grid-cols-2 gap-2" role="radiogroup" :aria-labelledby="`${baseId}-label`" :aria-describedby="describedBy">
    <label
      v-for="choice in field.choices"
      :key="choice.value"
      class="relative flex min-h-14 cursor-pointer flex-col justify-center gap-1.5 rounded-lg border border-line-strong bg-white px-3 py-2.5 text-base text-ink-900 has-checked:border-rose-600 has-checked:bg-rose-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-rose-600 has-disabled:cursor-not-allowed has-disabled:opacity-60"
    >
      <input
        type="radio"
        class="sr-only"
        :name="`${baseId}-choice`"
        :value="choice.value"
        :checked="field.value === choice.value"
        :disabled="disabled"
        :data-testid="`choice-${choice.value}`"
        @change="emit('update', choice.value)"
      />
      <span v-if="choice.swatches?.length" class="flex gap-1" aria-hidden="true">
        <span v-for="color in choice.swatches" :key="color" class="h-4 w-4 rounded-full border border-line-strong" :style="{ backgroundColor: color }" />
      </span>
      <span class="font-medium">{{ pick(choice.label, locale) }}</span>
      <Check v-if="field.value === choice.value" class="absolute right-2 top-2 h-4 w-4 text-rose-600" aria-hidden="true" />
    </label>
  </div>
</template>
