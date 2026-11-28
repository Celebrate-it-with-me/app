<script setup>
/**
 * One colour group ("reservados" / "sugeridos"): its chips with the colour's name, "Ninguno todavía", and the button that
 * opens the palette. The palette is a bottom sheet on phones (< 768 px) and an inline panel below the chips on wider
 * screens (a disclosure: simpler and more accessible than a floating popover; it closes on Escape or a tap outside).
 */
import { computed, ref, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, Plus } from 'lucide-vue-next'
import { UiBottomSheet, UiButton } from '@/ui'
import { useMinWidth } from '@/composables/useMinWidth'
import { MAX_COLORS, normalizeHex, normalizeColors, paletteName } from '../utils/dressCodeForm'
import DressCodePalette from './DressCodePalette.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  /** The colours of the other group: they cannot be picked here too. */
  otherColors: { type: Array, default: () => [] },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  sheetTitle: { type: String, required: true },
  blockedReason: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const wide = useMinWidth(768)
const open = ref(false)
const root = ref(null)

const colors = computed(() => normalizeColors(props.modelValue))
const blocked = computed(() => normalizeColors(props.otherColors))
const full = computed(() => colors.value.length >= MAX_COLORS)
const nameOf = hex => paletteName(hex, t) ?? t('app.dressCode.custom')
const removeLabel = hex => t('app.dressCode.removeColor', { color: paletteName(hex, t) ?? `${t('app.dressCode.custom')} ${hex}` })

function toggle(value) {
  const hex = normalizeHex(value)
  if (!hex || blocked.value.includes(hex)) return
  if (colors.value.includes(hex)) emit('update:modelValue', colors.value.filter(c => c !== hex))
  else if (!full.value) emit('update:modelValue', [...colors.value, hex])
}

const close = () => (open.value = false)
const onPointerDown = e => {
  if (wide.value && root.value && !root.value.contains(e.target)) close()
}
const onKey = e => {
  if (e.key === 'Escape' && wide.value) close()
}
watch(open, value => {
  const method = value ? 'addEventListener' : 'removeEventListener'
  document[method]('pointerdown', onPointerDown)
  document[method]('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <fieldset ref="root" :disabled="disabled" class="min-w-0" data-testid="dress-colors-group">
    <legend class="text-sm font-semibold text-ink-900">
      {{ label }}<span class="font-normal text-ink-500" data-testid="dress-group-count">{{ t('app.dressCode.groupCount', { n: colors.length, max: MAX_COLORS }) }}</span>
    </legend>
    <p v-if="hint" class="mt-1 text-[13px] text-ink-500">{{ hint }}</p>

    <ul class="mt-2.5 flex flex-wrap items-center gap-2">
      <li
        v-for="hex in colors"
        :key="hex"
        :title="paletteName(hex, t) ? undefined : hex"
        class="inline-flex h-9 items-center gap-2 rounded-full border border-cream-300 bg-white pl-1.5 pr-1.5 text-sm text-ink-900"
        :data-hex="hex"
      >
        <span class="h-6 w-6 shrink-0 rounded-full border border-black/10" :style="{ backgroundColor: hex }" aria-hidden="true" />
        <span data-testid="dress-chip-name">{{ nameOf(hex) }}</span>
        <button
          type="button"
          class="touch-target relative flex h-[26px] w-[26px] items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-100 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-rose-600 disabled:opacity-60"
          :aria-label="removeLabel(hex)"
          @click="toggle(hex)"
        >
          <X class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </li>
      <li v-if="!colors.length" class="text-[13px] italic text-ink-500" data-testid="dress-none">{{ t('app.dressCode.none') }}</li>
      <li v-if="!disabled">
        <button
          type="button"
          class="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3.5 text-[13px] font-semibold text-ink-700 transition-colors hover:border-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9"
          :disabled="full"
          :aria-expanded="open"
          data-testid="dress-add"
          @click="open = !open"
        >
          <Plus v-if="!full" class="h-4 w-4" aria-hidden="true" />
          {{ full ? t('app.dressCode.maxColors', { max: MAX_COLORS }) : t('app.dressCode.addColor') }}
        </button>
      </li>
    </ul>

    <div v-if="wide && open && !disabled" class="mt-3 rounded-[14px] border border-cream-200 bg-cream-50 p-3.5" data-testid="dress-panel">
      <DressCodePalette :selected="colors" :blocked="blocked" :blocked-reason="blockedReason" :full="full" @toggle="toggle" @custom="toggle" />
    </div>

    <UiBottomSheet v-if="!wide" v-model:open="open" :title="sheetTitle">
      <div class="rounded-[14px] border border-cream-200 bg-cream-50 p-3.5">
        <DressCodePalette :selected="colors" :blocked="blocked" :blocked-reason="blockedReason" :full="full" @toggle="toggle" @custom="toggle" />
      </div>
      <UiButton block class="mt-4" data-testid="dress-done" @click="close">{{ t('app.dressCode.done') }}</UiButton>
    </UiBottomSheet>
  </fieldset>
</template>
