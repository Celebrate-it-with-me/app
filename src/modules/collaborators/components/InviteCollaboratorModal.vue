<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiField, UiInput, UiRadioGroup, UiButton } from '@/ui'
import { INVITABLE_ROLES, emailError } from '../utils/collaborators'

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  /** Error text from the API for the email field, when it refused the invitation. */
  serverError: { type: String, default: '' }
})
const emit = defineEmits(['update:open', 'submit'])

const { t } = useI18n()
const email = ref('')
const role = ref('editor')
const touched = ref(false)

watch(
  () => props.open,
  open => {
    if (open) {
      email.value = ''
      role.value = 'editor'
      touched.value = false
    }
  }
)

const error = computed(() => {
  if (props.serverError) return props.serverError
  if (!touched.value) return ''
  const code = emailError(email.value)
  return code ? t(`app.collaborators.invite.email${code === 'required' ? 'Required' : 'Invalid'}`) : ''
})
const options = computed(() =>
  INVITABLE_ROLES.map(value => ({
    value,
    label: t(`app.collaborators.roles.${value}`),
    description: t(`app.collaborators.roleHelp.${value}`)
  }))
)

function submit() {
  touched.value = true
  if (emailError(email.value)) return
  emit('submit', { email: email.value.trim(), role: role.value })
}
</script>

<template>
  <UiModal :open="open" :title="t('app.collaborators.invite.title')" :description="t('app.collaborators.invite.text')" size="sm" @update:open="emit('update:open', $event)">
    <form id="invite-collaborator" class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <UiField :label="t('app.collaborators.invite.email')" :error="error" required>
        <UiInput v-model="email" type="email" inputmode="email" autocomplete="off" :placeholder="t('app.collaborators.invite.emailPlaceholder')" @blur="touched = true" />
      </UiField>
      <fieldset class="flex flex-col gap-2">
        <legend class="mb-1.5 text-sm font-semibold text-ink-700">{{ t('app.collaborators.invite.role') }}</legend>
        <UiRadioGroup v-model="role" :options="options" cards />
      </fieldset>
    </form>
    <template #footer>
      <UiButton variant="ghost" :disabled="saving" @click="emit('update:open', false)">{{ t('app.collaborators.cancel') }}</UiButton>
      <UiButton type="submit" form="invite-collaborator" :loading="saving">{{ t('app.collaborators.invite.send') }}</UiButton>
    </template>
  </UiModal>
</template>
