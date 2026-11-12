<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiField, UiInput, UiSelect, UiSwitch, UiTextarea, UiButton } from '@/ui'
import { STATUSES, emptyPadrino, formFromPadrino, padrinoErrors } from '../utils/padrinos'

const props = defineProps({
  open: { type: Boolean, default: false },
  padrino: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])
const { t } = useI18n()

const form = ref(emptyPadrino())
const errors = ref({})

watch(
  () => props.open,
  open => {
    if (!open) return
    form.value = props.padrino ? formFromPadrino(props.padrino) : emptyPadrino()
    errors.value = {}
  }
)

const statuses = computed(() => STATUSES.map(value => ({ value, label: t(`app.padrinos.status.${value}`) })))
const err = key => (errors.value[key] ? t(errors.value[key]) : '')

function submit() {
  errors.value = padrinoErrors(form.value)
  if (!Object.keys(errors.value).length) emit('save', { ...form.value })
}
</script>

<template>
  <UiModal :open="open" :title="t(padrino ? 'app.padrinos.form.editTitle' : 'app.padrinos.form.addTitle')" size="md" @update:open="emit('update:open', $event)">
    <form id="padrino-form" class="space-y-4" novalidate @submit.prevent="submit">
      <UiField :label="t('app.padrinos.form.name')" :error="err('name')" required>
        <UiInput v-model="form.name" :invalid="!!errors.name" maxlength="120" autocomplete="off" />
      </UiField>
      <div class="grid gap-3 sm:grid-cols-2">
        <UiField :label="t('app.padrinos.form.relationship')" :hint="t('app.padrinos.optional')">
          <UiInput v-model="form.relationship" maxlength="80" autocomplete="off" />
        </UiField>
        <UiField :label="t('app.padrinos.form.phone')" :error="err('phone')" :hint="t('app.padrinos.form.phoneHint')">
          <UiInput v-model="form.phone" type="tel" inputmode="tel" :invalid="!!errors.phone" autocomplete="off" />
        </UiField>
      </div>
      <UiField :label="t('app.padrinos.form.status')" :hint="t('app.padrinos.form.statusHint')">
        <UiSelect v-model="form.status" :options="statuses" />
      </UiField>
      <UiSwitch v-model="form.publicThanks" :label="t('app.padrinos.form.public')" :description="t('app.padrinos.form.publicHint')" />
      <UiField v-if="form.publicThanks" :label="t('app.padrinos.form.thanks')" :hint="t('app.padrinos.form.thanksHint')">
        <UiTextarea v-model="form.thanksText" :rows="3" :maxlength="300" />
      </UiField>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.padrinos.cancel') }}</UiButton>
      <UiButton type="submit" form="padrino-form" :loading="saving">{{ t('app.padrinos.save') }}</UiButton>
    </template>
  </UiModal>
</template>
