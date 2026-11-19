<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiRadioGroup, UiButton, UiCheckbox, UiEmptyState } from '@/ui'
import { CATEGORIES, blockedGroups, categoryAllowed, categoryCounts, membersOf, MODE_DEFAULT, needsBigBatchConfirm, optedOutIn, templateFor, withoutPhone } from '../../utils/sendWizard'
import SendPickList from './SendPickList.vue'

const props = defineProps({
  families: { type: Array, required: true },
  category: { type: String, required: true },
  selectedIds: { type: Array, default: () => [] },
  rsvpOpen: { type: Boolean, default: true },
  confirmedBig: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: true },
  mode: { type: String, default: MODE_DEFAULT }
})
const emit = defineEmits(['update:category', 'update:selectedIds', 'update:confirmedBig', 'edit-guest', 'add-guest'])
const { t } = useI18n()

const template = computed(() => templateFor(props.category, { rsvpOpen: props.rsvpOpen }))
const counts = computed(() => categoryCounts(props.families, { template: 'invitation', mode: props.mode }))
const members = computed(() => membersOf(props.families, props.category, { template: template.value, selectedIds: props.selectedIds, mode: props.mode }))
const blocked = computed(() => blockedGroups(props.families, 'invitation', props.mode))
const blockedTotal = computed(() => blocked.value.reduce((sum, g) => sum + g.families.length, 0))
const phoneless = computed(() => withoutPhone(members.value))
const optedOut = computed(() => optedOutIn(members.value))
const big = computed(() => needsBigBatchConfirm(members.value.length, props.mode))

const options = computed(() =>
  CATEGORIES.map(key => {
    const n = counts.value[key]
    const open = categoryAllowed(key, { rsvpOpen: props.rsvpOpen })
    return {
      value: key,
      label: key === 'selected' ? t('app.whatsapp.wizard.who.selected') : `${t(`app.whatsapp.wizard.who.${key}`)} · ${t('app.whatsapp.wizard.who.families', { n }, n)}`,
      description: !open ? t('app.whatsapp.wizard.who.pendingClosed') : t(`app.whatsapp.wizard.who.${key}Help`),
      disabled: !open
    }
  })
)
</script>

<template>
  <div>
    <UiEmptyState v-if="!families.length" :title="t('app.whatsapp.wizard.who.title')" :description="t('app.whatsapp.wizard.who.empty')">
      <UiButton v-if="canEdit" @click="emit('add-guest')">{{ t('app.roster.add') }}</UiButton>
    </UiEmptyState>
    <template v-else>
      <h3 class="font-heading text-xl text-ink-900" data-step-title tabindex="-1">{{ t('app.whatsapp.wizard.who.title') }}</h3>
      <UiRadioGroup class="mt-3" :model-value="category" :options="options" cards @update:model-value="emit('update:category', $event)" />

      <div v-if="category === 'selected'" class="mt-4">
        <SendPickList :families="families" :template="template" :selected-ids="selectedIds" @update:selected-ids="emit('update:selectedIds', $event)" @edit-guest="emit('edit-guest', $event)" />
      </div>

      <p class="mt-4 rounded-lg bg-cream-100 px-3 py-2 text-sm text-ink-700" aria-live="polite" data-testid="who-summary">
        {{ t('app.whatsapp.wizard.who.families', { n: members.length }, members.length) }} ·
        {{ t('app.whatsapp.wizard.who.sends', { template: t(`app.whatsapp.wizard.templates.${template}`) }) }}
      </p>
      <p v-if="phoneless.length" class="mt-2 text-sm text-ink-500" data-testid="who-nophone">
        {{ t('app.whatsapp.wizard.who.noPhone', { n: phoneless.length }, phoneless.length) }}
      </p>

      <p v-if="optedOut.length" class="mt-2 text-sm text-ink-500" data-testid="who-optedout">
        {{ t('app.whatsapp.wizard.who.optedOutNote', { n: optedOut.length }, optedOut.length) }}
      </p>

      <details v-if="blockedTotal" class="mt-4 rounded-xl border border-line px-3 py-2" data-testid="who-blocked">
        <summary class="cursor-pointer text-sm font-medium text-ink-900">{{ t('app.whatsapp.wizard.who.blocked', { n: blockedTotal }) }}</summary>
        <div v-for="group in blocked" :key="group.reason" class="mt-3">
          <p class="text-sm font-medium text-ink-700">{{ group.reason === 'opted_out' ? t('app.whatsapp.wizard.who.optedOut') : t('app.whatsapp.wizard.who.invalidPhone') }}</p>
          <ul class="mt-1 space-y-1">
            <li v-for="family in group.families" :key="family.id" class="flex items-center justify-between gap-2 text-sm text-ink-700">
              <span class="min-w-0 truncate">{{ family.name }}<span v-if="family.phone" class="text-ink-500"> · {{ family.phone }}</span></span>
              <UiButton v-if="group.reason === 'invalid_phone' && canEdit" size="sm" variant="link" class="h-auto shrink-0" @click="emit('edit-guest', family)">{{ t('app.whatsapp.wizard.who.fixPhone') }}</UiButton>
            </li>
          </ul>
        </div>
      </details>

      <div v-if="phoneless.length && canEdit" class="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        <UiButton v-for="family in phoneless.slice(0, 5)" :key="family.id" size="sm" variant="link" class="h-auto" @click="emit('edit-guest', family)">
          {{ t('app.whatsapp.wizard.who.addPhone') }} · {{ family.name }}
        </UiButton>
      </div>

      <div v-if="big" class="mt-4 rounded-xl border border-gold-500/40 bg-gold-50 p-3" data-testid="who-big">
        <UiCheckbox :model-value="confirmedBig" @update:model-value="emit('update:confirmedBig', $event)">
          {{ t('app.whatsapp.wizard.who.bigBatch', { n: members.length }) }}
        </UiCheckbox>
      </div>
    </template>
  </div>
</template>
