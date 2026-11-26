<script setup>
/**
 * The palettes of a template as round swatches (44 px targets). Only drawn with more than one palette: a template with a
 * single palette (or none) has nothing to choose. The active one is pressed and named out loud for screen readers.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check } from 'lucide-vue-next'
import { pickText } from '../utils/templatePicker'

const props = defineProps({
  /** Normalized presets (`templatePresets`): `[{ key, label, palette: { background, text, accent } }]`. */
  presets: { type: Array, default: () => [] },
  /** The active palette key. */
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'hover'])
const { t, locale } = useI18n()

const nameOf = preset => pickText(preset.label, locale.value) || preset.key
const activeName = computed(() => nameOf(props.presets.find(preset => preset.key === props.modelValue) ?? props.presets[0] ?? { key: '' }))
</script>

<template>
  <div v-if="presets.length > 1" class="flex flex-col gap-2" data-testid="palette-swatches">
    <p class="text-sm font-semibold text-ink-700" role="status" aria-live="polite">
      {{ t('templatePicker.palettes.label') }}: <span class="font-normal text-ink-600">{{ activeName }}</span>
    </p>
    <div class="flex flex-wrap gap-1.5" role="group" :aria-label="t('templatePicker.palettes.label')">
      <button
        v-for="preset in presets"
        :key="preset.key"
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose-600"
        :aria-pressed="modelValue === preset.key"
        :aria-label="nameOf(preset)"
        :title="nameOf(preset)"
        @click="emit('update:modelValue', preset.key)"
        @pointerenter="emit('hover', preset)"
        @focus="emit('hover', preset)"
      >
        <span
          class="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-1 ring-line-strong transition-shadow duration-150"
          :class="modelValue === preset.key ? 'ring-2 ring-offset-2 ring-rose-600' : ''"
          :style="{ background: preset.palette.background || '#fff' }"
        >
          <span class="absolute inset-x-0 bottom-0 h-1/2" :style="{ background: preset.palette.accent || preset.palette.text || '#ccc' }"></span>
          <Check v-if="modelValue === preset.key" class="relative h-4 w-4 text-white mix-blend-difference" aria-hidden="true" />
        </span>
      </button>
    </div>
  </div>
</template>
