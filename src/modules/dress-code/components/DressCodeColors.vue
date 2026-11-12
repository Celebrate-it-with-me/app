<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, Plus } from 'lucide-vue-next'
import { PALETTE, MAX_COLORS } from '../utils/dressCodeForm'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const full = computed(() => props.modelValue.length >= MAX_COLORS)
const has = hex => props.modelValue.includes(hex)
const nameOf = hex => {
  const found = PALETTE.find(p => p.hex === hex)
  return found ? t(`app.dressCode.palette.${found.key}`) : hex
}

function toggle(hex) {
  if (has(hex)) emit('update:modelValue', props.modelValue.filter(c => c !== hex))
  else if (!full.value) emit('update:modelValue', [...props.modelValue, hex])
}

function addCustom(event) {
  const hex = event.target.value.toLowerCase()
  if (!has(hex) && !full.value) emit('update:modelValue', [...props.modelValue, hex])
}
</script>

<template>
  <fieldset :disabled="disabled">
    <legend class="text-sm font-medium text-ink-900">{{ label }}</legend>
    <p v-if="hint" class="mt-1 text-sm text-ink-500">{{ hint }}</p>

    <ul v-if="modelValue.length" class="mt-3 flex flex-wrap gap-2">
      <li v-for="hex in modelValue" :key="hex">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full border border-line-strong bg-white py-1 pl-1 pr-3 text-sm text-ink-700 transition-colors hover:border-rose-300 disabled:opacity-60"
          :aria-label="t('app.dressCode.removeColor', { color: nameOf(hex) })"
          @click="toggle(hex)"
        >
          <span class="h-6 w-6 rounded-full ring-1 ring-ink-900/15" :style="{ backgroundColor: hex }" />
          {{ nameOf(hex) }}
          <X class="h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button
        v-for="item in PALETTE"
        :key="item.hex"
        type="button"
        :aria-pressed="has(item.hex)"
        :aria-label="t(`app.dressCode.palette.${item.key}`)"
        :title="t(`app.dressCode.palette.${item.key}`)"
        :disabled="!has(item.hex) && full"
        class="h-9 w-9 rounded-full ring-1 ring-ink-900/15 ring-offset-2 ring-offset-white transition-[opacity,scale] active:scale-95 disabled:opacity-30"
        :class="has(item.hex) ? 'ring-2 ring-rose-600' : ''"
        :style="{ backgroundColor: item.hex }"
        @click="toggle(item.hex)"
      />
      <label
        class="relative flex h-9 cursor-pointer items-center gap-1 rounded-full border border-dashed border-line-strong px-3 text-sm text-ink-700 focus-within:ring-2 focus-within:ring-rose-600"
        :class="full ? 'pointer-events-none opacity-30' : ''"
      >
        <Plus class="h-4 w-4" aria-hidden="true" />
        {{ t('app.dressCode.otherColor') }}
        <input type="color" class="absolute inset-0 h-full w-full cursor-pointer opacity-0" @change="addCustom" />
      </label>
    </div>
    <p class="mt-2 text-xs text-ink-500">{{ t('app.dressCode.colorsCount', { n: modelValue.length, max: MAX_COLORS }) }}</p>
  </fieldset>
</template>
