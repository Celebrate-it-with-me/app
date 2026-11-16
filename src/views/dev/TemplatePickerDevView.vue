<script setup>
/**
 * DEV only (/dev/template-picker): hosts the template selector card and the cover photo field against the in-memory mock
 * (set VITE_INVITATION_PICKER_MOCK) so they can be built and photographed before the editor ("Tu invitación") exists.
 */
import { onMounted, ref } from 'vue'
import { UiPageHeader } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import TemplatePickerEntry from '@/modules/template-picker/components/TemplatePickerEntry.vue'
import CoverPhotoField from '@/modules/template-picker/components/CoverPhotoField.vue'

const eventsStore = useEventsStore()
const eventId = ref(eventsStore.activeEvent?.id ?? 1)
const field = ref(null)
const ready = ref(false)

onMounted(async () => {
  const mock = await import('@/modules/template-picker/services/templatePickerMock')
  field.value = mock.coverField()
  ready.value = true
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-xl flex-col gap-5 p-4">
    <UiPageHeader title="Template picker (dev)" />
    <TemplatePickerEntry :event-id="eventId" :template-locked="$route.query.published === '1'" />
    <div v-if="ready" class="rounded-2xl border border-line bg-white p-4">
      <CoverPhotoField :event-id="eventId" :field="field" @changed="value => (field = { ...field, value })" />
    </div>
  </div>
</template>
