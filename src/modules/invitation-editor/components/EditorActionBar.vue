<script setup>
/**
 * The "Vista previa" / "Publicar" bar of the editor. Phones: fixed above the bottom navigation. 1024-1279 px: sticky at the
 * bottom of the form column, leaving the assistant button's column free on the right. 1280 px and up (`inline`): it is
 * placed under the phone preview, so it never goes over the form.
 */
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'
import EditorPreviewEntry from './EditorPreviewEntry.vue'

defineProps({
  eventId: { type: [Number, String], default: null },
  overrides: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  /** Beside the form (wide screens): a plain block, no fixed or sticky positioning. */
  inline: { type: Boolean, default: false }
})
const { t } = useI18n()
</script>

<template>
  <div
    :class="inline ? 'w-full' : 'pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-20 px-4 lg:sticky lg:inset-x-auto lg:bottom-4 lg:z-10 lg:px-0 max-xl:lg:mr-14'"
    data-testid="action-bar"
  >
    <div class="grid gap-2 rounded-xl border border-line bg-cream-50 p-2 shadow-pop" :class="inline ? 'grid-cols-1' : 'pointer-events-auto ml-auto grid-cols-2 sm:max-w-md'">
      <EditorPreviewEntry :event-id="eventId" :overrides="overrides" :disabled="disabled" />
      <UiButton block :to="{ name: 'edit-event', params: { id: eventId } }" :aria-busy="busy || undefined">{{ t('invitationEditor.actions.publish') }}</UiButton>
    </div>
  </div>
</template>
