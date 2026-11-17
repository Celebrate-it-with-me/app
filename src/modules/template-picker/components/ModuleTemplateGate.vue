<script setup>
/**
 * Fixed notice for a module's own screen: shows it when the event's CURRENT template has no block for `module`
 * (`missingModules` of the current template in the selector's list). Nothing while loading, on a failed read, or when
 * the template carries the module (native templates always do).
 *
 *   <ModuleTemplateGate module="comments" />
 */
import { computed, ref, watch } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import TemplatePickerService from '../services/TemplatePickerService'
import { missingModulesOf } from '../utils/templatePicker'
import ModuleTemplateNotice from './ModuleTemplateNotice.vue'

const props = defineProps({ module: { type: String, required: true } })

const eventsStore = useEventsStore()
const eventId = computed(() => eventsStore.activeEvent?.id ?? null)
const missing = ref(false)

watch(
  eventId,
  async id => {
    missing.value = false
    if (id == null) return
    try {
      const current = (await TemplatePickerService.templates(id)).find(item => item.current)
      if (String(eventId.value) === String(id)) missing.value = missingModulesOf(current).includes(props.module)
    } catch {
      missing.value = false
    }
  },
  { immediate: true }
)
</script>

<template>
  <ModuleTemplateNotice v-if="missing" class="mt-4" mode="current" :event-id="eventId" :module="module" />
</template>
