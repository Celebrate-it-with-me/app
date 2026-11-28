<script setup>
/**
 * "Así lo verán tus invitados": the card guests get, drawn from the form's live state (unsaved). The Inicio card is not
 * reused because it is tied to its loading/empty wrapper and shows only the reserved colours.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { normalizeColors, paletteName } from '../utils/dressCodeForm'

const props = defineProps({
  type: { type: String, default: '' },
  description: { type: String, default: '' },
  reserved: { type: Array, default: () => [] },
  suggested: { type: Array, default: () => [] }
})
const { t } = useI18n()

const styleName = computed(() => (props.type ? t(`app.dressCode.types.${props.type}.name`) : ''))
const text = computed(() => props.description.trim() || (props.type ? t(`app.dressCode.types.${props.type}.hint`) : ''))
const groups = computed(() => [
  { id: 'avoid', title: t('app.dressCode.preview.avoid'), colors: normalizeColors(props.reserved) },
  { id: 'suggested', title: t('app.dressCode.preview.suggested'), colors: normalizeColors(props.suggested) }
].filter(g => g.colors.length))
const nameOf = hex => paletteName(hex, t) ?? hex
</script>

<template>
  <div data-testid="dress-preview">
    <p class="mb-2.5 text-center text-xs font-semibold uppercase tracking-[.06em] text-ink-500">{{ t('app.dressCode.preview.label') }}</p>
    <div class="rounded-xl border border-line bg-white p-5 shadow-card">
      <h3 class="font-heading text-xl text-ink-900">{{ t('app.dressCode.preview.title') }}</h3>
      <p class="mt-2.5 text-base font-semibold text-ink-900" data-testid="preview-style">{{ styleName || t('app.dressCode.preview.noStyle') }}</p>
      <p v-if="text" class="mt-1 break-words text-sm text-ink-700" data-testid="preview-text">{{ text }}</p>
      <div v-for="group in groups" :key="group.id" class="mt-4" :data-testid="`preview-${group.id}`">
        <h4 class="text-xs font-semibold uppercase tracking-[.06em] text-ink-500">{{ group.title }}</h4>
        <ul class="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          <li v-for="hex in group.colors" :key="hex" class="flex items-center gap-2 text-[13px] text-ink-700">
            <span class="h-[22px] w-[22px] shrink-0 rounded-full border border-black/10" :style="{ backgroundColor: hex }" aria-hidden="true" />
            <span data-testid="preview-color-name">{{ nameOf(hex) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
