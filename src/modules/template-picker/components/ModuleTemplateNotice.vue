<script setup>
/**
 * The notice for a module's switch that the API refused with 409 `template_missing_module`: the template of the event
 * has no block for that module. The panel that owns the switch turns it back off (`templateMissingFrom(error)` gives the data)
 * and shows this under it; "Cambiar plantilla" opens the template selector.
 *
 *   <ModuleTemplateNotice v-if="blocked" :event-id="event.id" :module="blocked.module" :template-name="blocked.templateName" />
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LayoutTemplate, Puzzle } from 'lucide-vue-next'
import { UiButton } from '@/ui'
import { activeModuleKeys, moduleNames } from '../utils/templatePicker'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import TemplatePickerSheet from './TemplatePickerSheet.vue'

const props = defineProps({
  eventId: { type: [Number, String], required: true },
  /** Slug of the module the switch belongs to (`comments`, `seating`). */
  module: { type: String, required: true },
  /** `template.name` of the 409. */
  templateName: { type: String, default: '' }
})
const emit = defineEmits(['changed'])

const { t, te } = useI18n()
const eventsStore = useEventsStore()
const open = ref(false)
const name = computed(() => moduleNames([props.module], { t, te })[0])
const activeModules = computed(() => activeModuleKeys(eventsStore.activeEvent?.modules))
</script>

<template>
  <div class="flex flex-col gap-3 rounded-xl bg-warning-50 p-4 sm:flex-row sm:items-center sm:justify-between" role="alert" data-testid="module-template-notice">
    <div class="flex min-w-0 items-start gap-3">
      <Puzzle class="mt-0.5 h-5 w-5 shrink-0 text-warning-700" aria-hidden="true" />
      <p class="text-sm text-warning-700">
        <template v-if="templateName">{{ t('templatePicker.missing.blocked', { module: name, template: templateName }) }}</template>
        <template v-else>{{ t('templatePicker.missing.blockedGeneric', { module: name }) }}</template>
      </p>
    </div>
    <UiButton size="sm" variant="secondary" class="shrink-0" @click="open = true">
      <LayoutTemplate class="h-4 w-4" aria-hidden="true" />
      {{ t('templatePicker.missing.change') }}
    </UiButton>
    <TemplatePickerSheet v-model:open="open" :event-id="eventId" :active-modules="activeModules" @changed="(...args) => emit('changed', ...args)" />
  </div>
</template>
