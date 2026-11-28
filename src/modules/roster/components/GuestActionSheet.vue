<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronRight } from 'lucide-vue-next'
import { UiBottomSheet } from '@/ui'
import { guestMenuEntries, localeFromValue, localeOptions, localeValue } from '../utils/roster'
import { MENU_ICONS } from '../utils/guestMenu'

/**
 * Phones: the actions of a guest in a bottom sheet. "Idioma de la invitación" swaps the sheet's content for the three
 * choices; picking one saves at once, and the sheet closes a moment later so the new choice is seen.
 */
const CLOSE_DELAY_MS = 180

const props = defineProps({
  open: { type: Boolean, default: false },
  family: { type: Object, default: null },
  canEdit: { type: Boolean, default: false },
  eventLocale: { type: String, default: 'es' }
})
const emit = defineEmits(['update:open', 'act', 'locale'])
const { t } = useI18n()

const view = ref('actions')
watch(() => props.open, open => open && (view.value = 'actions'))

const entries = computed(() => (props.family ? guestMenuEntries(props.family, { canEdit: props.canEdit, t }) : []))
const options = computed(() => localeOptions(t, props.eventLocale))
const current = computed(() => (props.family ? localeValue(props.family) : 'event'))
const currentLabel = computed(() => (current.value === 'event' ? t('app.roster.locale.eventShort') : t(`app.roster.locale.${current.value}`)))

let timer
onBeforeUnmount(() => clearTimeout(timer))
function later(fn) {
  clearTimeout(timer)
  timer = setTimeout(fn, CLOSE_DELAY_MS)
}

function pick(entry) {
  if (entry.disabled) return
  if (entry.key === 'locale') {
    view.value = 'locale'
    return
  }
  // The next dialog (edit, confirm, delete) opens once this one has left, so focus is not fought over.
  const family = props.family
  emit('update:open', false)
  later(() => emit('act', entry.key, family))
}

function choose(value) {
  const family = props.family
  if (value !== current.value) emit('locale', family, localeFromValue(value))
  later(() => emit('update:open', false))
}
</script>

<template>
  <UiBottomSheet
    :open="open"
    :title="view === 'locale' ? t('app.roster.locale.label') : (family?.name ?? '')"
    :subtitle="view === 'locale' ? (family?.name ?? '') : ''"
    @update:open="emit('update:open', $event)"
  >
    <ul v-if="view === 'actions'" class="space-y-0.5" data-testid="sheet-actions">
      <li v-for="entry in entries" :key="entry.key">
        <div v-if="entry.separator" class="my-1 h-px bg-line" />
        <button
          type="button"
          class="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left text-[15px] transition-colors active:bg-black/[.04] disabled:text-ink-300 focus-visible:outline-2 focus-visible:outline-rose-600"
          :class="entry.danger ? 'text-danger-700' : 'text-ink-900'"
          :disabled="entry.disabled"
          :data-action="entry.key"
          @click="pick(entry)"
        >
          <component :is="MENU_ICONS[entry.key]" class="h-5 w-5 shrink-0" :class="entry.danger ? 'text-danger-700' : 'text-ink-500'" aria-hidden="true" />
          <span class="flex-1">{{ entry.label }}</span>
          <template v-if="entry.key === 'locale'">
            <span class="text-sm text-ink-500" data-testid="sheet-locale-value">{{ currentLabel }}</span>
            <ChevronRight class="h-4 w-4 text-ink-400" aria-hidden="true" />
          </template>
        </button>
      </li>
    </ul>
    <div v-else data-testid="sheet-locale">
      <div role="radiogroup" :aria-label="t('app.roster.locale.label')">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          role="radio"
          :aria-checked="current === option.value"
          class="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left text-[15px] text-ink-900 transition-colors active:bg-black/[.04] focus-visible:outline-2 focus-visible:outline-rose-600"
          :data-value="option.value"
          @click="choose(option.value)"
        >
          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px]"
            :class="current === option.value ? 'border-rose-600' : 'border-black/25'"
            aria-hidden="true"
          >
            <span v-if="current === option.value" class="h-2.5 w-2.5 rounded-full bg-rose-600" />
          </span>
          {{ option.label }}
        </button>
      </div>
      <p class="pt-2.5 text-xs text-ink-500">{{ t('app.roster.locale.help', { name: family?.name ?? '' }) }}</p>
    </div>
  </UiBottomSheet>
</template>
