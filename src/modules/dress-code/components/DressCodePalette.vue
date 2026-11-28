<script setup>
/**
 * The quick picks of one colour group: a grid of swatches (tap adds or removes at once) and the custom colour picker.
 * A colour already in the other group is disabled with a diagonal strike and says why in its title.
 */
import { useI18n } from 'vue-i18n'
import { Check, Plus } from 'lucide-vue-next'
import { PALETTE, normalizeHex, isLightColor } from '../utils/dressCodeForm'

const props = defineProps({
  selected: { type: Array, default: () => [] },
  /** Normalised colours of the other group. */
  blocked: { type: Array, default: () => [] },
  /** Why a blocked colour cannot be picked (already translated). */
  blockedReason: { type: String, default: '' },
  full: { type: Boolean, default: false }
})
const emit = defineEmits(['toggle', 'custom'])
const { t } = useI18n()

const isSelected = hex => props.selected.includes(normalizeHex(hex))
const isBlocked = hex => props.blocked.includes(normalizeHex(hex))
const isDisabled = hex => isBlocked(hex) || (!isSelected(hex) && props.full)
const titleOf = item => (isBlocked(item.hex) ? props.blockedReason : t(`app.dressCode.palette.${item.key}`))
</script>

<template>
  <div data-testid="dress-palette">
    <ul class="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(64px,1fr))]" :aria-label="t('app.dressCode.paletteLabel')">
      <li v-for="item in PALETTE" :key="item.hex" class="flex">
        <button
          type="button"
          :aria-pressed="isSelected(item.hex)"
          :disabled="isDisabled(item.hex)"
          :title="titleOf(item)"
          :data-swatch="item.key"
          class="flex min-h-[44px] w-full flex-col items-center gap-1 rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed"
          :class="isDisabled(item.hex) ? 'opacity-35' : ''"
          @click="emit('toggle', normalizeHex(item.hex))"
        >
          <span
            class="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-black/10 transition-shadow duration-150 motion-reduce:transition-none"
            :class="isSelected(item.hex) ? 'shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--color-rose-700)]' : ''"
            :style="{ backgroundColor: item.hex }"
          >
            <Check v-if="isSelected(item.hex)" class="h-4 w-4" :class="isLightColor(item.hex) ? 'text-ink-900' : 'text-white'" aria-hidden="true" />
            <span v-if="isBlocked(item.hex)" class="absolute left-1/2 top-1/2 h-0.5 w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-ink-700" aria-hidden="true" />
          </span>
          <span class="text-[11px] leading-tight text-ink-700">{{ t(`app.dressCode.palette.${item.key}`) }}</span>
        </button>
      </li>
    </ul>

    <label
      class="relative mt-3 inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-line-strong bg-white px-3.5 text-[13px] font-semibold text-ink-700 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-rose-600"
      :class="full ? 'pointer-events-none opacity-35' : ''"
    >
      <Plus class="h-4 w-4" aria-hidden="true" />
      {{ t('app.dressCode.customColor') }}
      <input type="color" class="absolute inset-0 h-full w-full cursor-pointer opacity-0" :disabled="full" @change="emit('custom', $event.target.value)" />
    </label>
  </div>
</template>
