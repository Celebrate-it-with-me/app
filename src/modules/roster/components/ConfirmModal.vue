<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton } from '@/ui'

const props = defineProps({
  open: { type: Boolean, default: false },
  family: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])
const { t } = useI18n()

// One answer per person: attending | not-attending. Pending people start unanswered.
const answers = ref({})
const missing = ref(false)

const people = () => (props.family ? [{ id: props.family.id, name: props.family.name, main: true }, ...props.family.companions.map(c => ({ ...c }))] : [])

watch(
  () => props.open,
  open => {
    if (!open) return
    answers.value = Object.fromEntries(people().map(p => [p.id, p.main ? props.family.status : props.family.companions.find(c => c.id === p.id).status]))
    missing.value = false
  }
)

const options = ['attending', 'not-attending']

function setAll(status) {
  answers.value = Object.fromEntries(Object.keys(answers.value).map(id => [id, status]))
}

function submit() {
  if (Object.values(answers.value).some(status => !options.includes(status))) {
    missing.value = true
    return
  }
  emit('save', {
    status: answers.value[props.family.id],
    companions: props.family.companions.map(c => ({ id: c.id, status: answers.value[c.id] }))
  })
}
</script>

<template>
  <UiModal :open="open" :title="t('app.roster.confirmTitle')" :description="t('app.roster.confirmText')" size="sm" @update:open="emit('update:open', $event)">
    <div v-if="family" class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <UiButton variant="secondary" size="sm" @click="setAll('attending')">{{ t('app.roster.allAttending') }}</UiButton>
        <UiButton variant="secondary" size="sm" @click="setAll('not-attending')">{{ t('app.roster.allDeclined') }}</UiButton>
      </div>
      <fieldset v-for="person in people()" :key="person.id" class="rounded-xl border border-line p-3">
        <legend class="px-1 text-sm font-medium text-ink-900">{{ person.name }}</legend>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <label
            v-for="status in options"
            :key="status"
            class="flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-rose-600"
            :class="answers[person.id] === status ? 'border-rose-600 bg-rose-50 font-medium text-ink-900' : 'border-line-strong text-ink-700 hover:border-rose-300'"
          >
            <input v-model="answers[person.id]" type="radio" :name="`answer-${person.id}`" :value="status" class="sr-only" />
            {{ t(`app.roster.answer.${status}`) }}
          </label>
        </div>
      </fieldset>
      <p v-if="missing" class="text-sm text-danger-700" role="alert">{{ t('app.roster.errors.answers') }}</p>
    </div>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.roster.cancel') }}</UiButton>
      <UiButton :loading="saving" @click="submit">{{ t('app.roster.confirmSave') }}</UiButton>
    </template>
  </UiModal>
</template>
