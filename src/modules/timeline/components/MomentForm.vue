<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiField, UiInput, UiSelect, UiTextarea, UiButton } from '@/ui'
import { MOMENT_TYPES, emptyMoment, formFromMoment, momentErrors } from '../utils/program'

const props = defineProps({
  open: { type: Boolean, default: false },
  moment: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])
const { t } = useI18n()

const form = ref(emptyMoment())
const errors = ref({})

watch(
  () => props.open,
  open => {
    if (!open) return
    form.value = props.moment ? formFromMoment(props.moment) : emptyMoment()
    errors.value = {}
  }
)

const options = MOMENT_TYPES.map(type => ({ value: type.value, label: t(`app.timeline.types.${type.value}`) }))

function submit() {
  errors.value = momentErrors(form.value)
  if (Object.keys(errors.value).length === 0) emit('save', { ...form.value })
}
</script>

<template>
  <UiModal
    :open="open"
    :title="t(moment ? 'app.timeline.editTitle' : 'app.timeline.addTitle')"
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <form id="moment-form" class="space-y-4" novalidate @submit.prevent="submit">
      <UiField :label="t('app.timeline.fields.type')">
        <UiSelect v-model="form.type" :options="options" />
      </UiField>
      <UiField :label="t('app.timeline.fields.title')" :error="errors.title ? t(errors.title) : ''" required>
        <UiInput v-model="form.title" :invalid="!!errors.title" maxlength="120" />
      </UiField>
      <div class="grid grid-cols-2 gap-3">
        <UiField :label="t('app.timeline.fields.startTime')" :error="errors.startTime ? t(errors.startTime) : ''" required>
          <UiInput v-model="form.startTime" type="time" :invalid="!!errors.startTime" />
        </UiField>
        <UiField :label="t('app.timeline.fields.endTime')" :hint="t('app.timeline.optional')">
          <UiInput v-model="form.endTime" type="time" />
        </UiField>
      </div>
      <UiField :label="t('app.timeline.fields.description')" :hint="t('app.timeline.optional')">
        <UiTextarea v-model="form.description" :rows="3" :maxlength="500" />
      </UiField>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.timeline.cancel') }}</UiButton>
      <UiButton type="submit" form="moment-form" :loading="saving">{{ t('app.timeline.save') }}</UiButton>
    </template>
  </UiModal>
</template>
