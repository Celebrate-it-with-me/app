<script setup>
/**
 * Phone version of the grid: one row of small thumbnails to swipe sideways (the page scrolls once, vertically). It always
 * lists every template (the filters belong to the wide layout); the selected one is pressed and scrolled into view.
 */
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiScrollFade } from '@/ui'
import InvitationMiniature from './InvitationMiniature.vue'

const props = defineProps({
  templates: { type: Array, default: () => [] },
  selectedId: { type: [Number, String], default: null },
  eventId: { type: [Number, String], default: null },
  eventName: { type: String, default: '' },
  dateLabel: { type: String, default: '' }
})
const emit = defineEmits(['select'])
const { t } = useI18n()
const root = ref(null)

watch(
  () => props.selectedId,
  async () => {
    await nextTick()
    // Centre it inside the strip only: scrollIntoView would also scroll the page behind it.
    const button = root.value?.querySelector('[aria-pressed="true"]')
    const scroller = root.value?.parentElement
    if (!button || !scroller?.scrollTo) return
    scroller.scrollTo({ left: button.offsetLeft - (scroller.clientWidth - button.offsetWidth) / 2, behavior: 'smooth' })
  }
)
</script>

<template>
  <UiScrollFade>
    <ul ref="root" class="flex w-max min-w-full gap-2.5 px-1 py-1" :aria-label="t('templatePicker.strip.label')" data-testid="template-strip">
      <li v-for="template in templates" :key="template.id">
        <button
          type="button"
          class="flex w-[4.75rem] flex-col items-center gap-1 rounded-xl p-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose-600"
          :class="String(template.id) === String(selectedId) ? 'bg-rose-50 ring-2 ring-rose-600' : 'ring-1 ring-line'"
          :aria-pressed="String(template.id) === String(selectedId)"
          :aria-label="t('templatePicker.card.select', { name: template.name })"
          @click="emit('select', template)"
        >
          <span class="block w-full overflow-hidden rounded-lg">
            <InvitationMiniature
              :event-id="eventId"
              :template-id="template.id"
              :fallback-image="template.previewImage || ''"
              :name="eventName || template.name"
              :date-label="dateLabel"
              :timeout="20000"
              pooled
            />
          </span>
          <span class="line-clamp-1 w-full text-center text-xs font-medium text-ink-800">{{ template.name }}</span>
        </button>
      </li>
    </ul>
  </UiScrollFade>
</template>
