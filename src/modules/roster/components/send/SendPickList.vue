<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from 'lucide-vue-next'
import { UiCheckbox, UiBadge, UiButton } from '@/ui'
import { BLOCK_LABELS, MODE_DEFAULT, blockReason, membersOf } from '../../utils/sendWizard'

const PAGE = 50
const props = defineProps({
  families: { type: Array, required: true },
  template: { type: String, default: 'invitation' },
  selectedIds: { type: Array, default: () => [] },
  mode: { type: String, default: MODE_DEFAULT }
})
const emit = defineEmits(['update:selectedIds', 'edit-guest'])
const { t } = useI18n()

const search = ref('')
const filter = ref('all')
const shown = ref(PAGE)
const FILTERS = ['all', 'unsent', 'pending', 'problem']

const visible = computed(() => {
  const term = search.value.trim().toLowerCase()
  const inFilter = filter.value === 'problem'
    ? new Set(props.families.filter(f => blockReason(f, props.template, props.mode) !== null || f.state === 'failed').map(f => f.id))
    : filter.value === 'all'
      ? null
      : new Set(membersOf(props.families, filter.value, { template: props.template, mode: props.mode }).map(f => f.id))
  return props.families.filter(f => (!inFilter || inFilter.has(f.id)) && (!term || f.name.toLowerCase().includes(term) || f.phone.toLowerCase().includes(term)))
})
watch([search, filter], () => (shown.value = PAGE))

const page = computed(() => visible.value.slice(0, shown.value))
const reasonOf = family => blockReason(family, props.template, props.mode)
const chosen = computed(() => new Set(props.selectedIds))
const blockedCount = computed(() => props.families.filter(f => reasonOf(f)).length)

function toggle(family, on) {
  const next = new Set(props.selectedIds)
  if (on) next.add(family.id)
  else next.delete(family.id)
  emit('update:selectedIds', [...next])
}
function chooseVisible() {
  const next = new Set(props.selectedIds)
  for (const f of visible.value) if (!reasonOf(f)) next.add(f.id)
  emit('update:selectedIds', [...next])
}
</script>

<template>
  <div data-testid="pick-list">
    <div class="relative">
      <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
      <input
        v-model="search"
        type="search"
        autocomplete="off"
        :aria-label="t('app.whatsapp.wizard.pick.search')"
        :placeholder="t('app.whatsapp.wizard.pick.search')"
        class="h-11 w-full rounded-xl border border-line-strong bg-white pl-10 pr-3 text-base text-ink-900 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-rose-600"
      />
    </div>
    <div class="mt-3 flex flex-wrap gap-2" role="group">
      <button
        v-for="key in FILTERS"
        :key="key"
        type="button"
        :aria-pressed="filter === key"
        class="inline-flex h-10 items-center rounded-full border px-3.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
        :class="filter === key ? 'border-ink-900 bg-ink-900 text-white' : 'border-line-strong bg-white text-ink-700 hover:bg-cream-100'"
        @click="filter = key"
      >
        {{ t(`app.whatsapp.wizard.pick.filter${key[0].toUpperCase()}${key.slice(1)}`) }}
      </button>
    </div>

    <div class="sticky top-0 z-10 -mx-1 mt-3 flex flex-wrap items-center justify-between gap-2 bg-white/95 px-1 py-2" aria-live="polite">
      <p class="text-sm font-medium text-ink-900" data-testid="pick-counter">
        {{ t('app.whatsapp.wizard.pick.counter', { n: selectedIds.length }, selectedIds.length) }}
        <template v-if="blockedCount"> · {{ t('app.whatsapp.wizard.pick.counterBlocked', { n: blockedCount }, blockedCount) }}</template>
      </p>
      <div class="flex gap-2">
        <UiButton size="sm" variant="secondary" @click="chooseVisible">{{ t('app.whatsapp.wizard.pick.selectVisible') }}</UiButton>
        <UiButton v-if="selectedIds.length" size="sm" variant="ghost" @click="emit('update:selectedIds', [])">{{ t('app.whatsapp.wizard.pick.clear') }}</UiButton>
      </div>
    </div>

    <p v-if="!page.length" class="py-6 text-center text-sm text-ink-500">{{ t('app.whatsapp.wizard.pick.none') }}</p>
    <ul v-else class="divide-y divide-line rounded-xl border border-line">
      <li v-for="family in page" :key="family.id" class="flex min-h-14 items-center gap-3 px-3 py-2">
        <UiCheckbox
          class="min-w-0 flex-1"
          :model-value="chosen.has(family.id)"
          :disabled="!!reasonOf(family)"
          @update:model-value="toggle(family, $event)"
        >
          <span class="block truncate font-medium">{{ family.name }}</span>
          <span class="block truncate text-sm text-ink-500">{{ family.phone || t('app.whatsapp.wizard.who.noPhoneTitle') }} · {{ t('app.roster.people', { n: family.people }, family.people) }}</span>
        </UiCheckbox>
        <template v-if="reasonOf(family)">
          <UiBadge tone="warning" size="sm">{{ t(`app.whatsapp.wizard.who.${BLOCK_LABELS[reasonOf(family)]}`) }}</UiBadge>
          <UiButton v-if="reasonOf(family) === 'invalid_phone'" size="sm" variant="link" class="h-auto" @click="emit('edit-guest', family)">{{ t('app.whatsapp.wizard.who.fixPhone') }}</UiButton>
        </template>
        <UiBadge v-else-if="family.optedOut" tone="neutral" size="sm" data-testid="pick-optedout">{{ t('app.whatsapp.wizard.who.optedOut') }}</UiBadge>
        <UiBadge v-else-if="family.state !== 'none' && family.state !== 'no_phone'" tone="info" size="sm">{{ t(`app.whatsapp.state.${family.state}`) }}</UiBadge>
      </li>
    </ul>
    <UiButton v-if="visible.length > shown" class="mt-3" variant="secondary" block @click="shown += PAGE">{{ t('app.whatsapp.wizard.pick.more') }}</UiButton>
  </div>
</template>
